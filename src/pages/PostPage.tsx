import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share2, Clock, Eye, Loader2, MoreVertical, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from '@tanstack/react-query';
import { deletePost as apiDeletePost, toggleLike, toggleBookmark } from '@/services/api';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';
import { cn } from '@/lib/utils';
import { ShareMenu } from '@/components/common/ShareMenu';
import { FollowButton } from '@/components/common/FollowButton';
import { UserHoverCard } from '@/components/common/UserHoverCard';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

// Helper to transform Supabase user to UI user shape
const transformUser = (dbUser: any, authUser: any) => ({
  id: dbUser.id || authUser?.id,
  username: dbUser.username || "Anonymous",
  displayName: dbUser.username || "Anonymous",
  avatar: dbUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dbUser.username}`,
});

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isOwner = user?.id === post?.author?.id;
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator';
  const canDelete = isOwner || isAdmin;

  const fetchPost = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
                *,
                author:users!posts_user_id_fkey(*),
                community:communities!posts_community_id_fkey(*),
                user_liked_post:post_likes(user_id),
                user_bookmark:post_bookmarks(user_id),
                comments(
                    id,
                    content,
                    created_at,
                    user_id,
                    user:users(*)
                )
            `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Transform
      const transformedPost = {
        id: data.id,
        created_at: data.created_at,
        title: data.title,
        content: data.content,
        excerpt: data.content.slice(0, 150) + '...',
        author: transformUser(data.author, null),
        community: {
          ...data.community,
          icon: '🚀'
        },
        readTime: Math.ceil(data.content.length / 500) || 1, // Crude calc
        likes: data.likes_count || 0,
        isLiked: user ? data.user_liked_post?.some((l: any) => l.user_id === user.id) : false,
        isBookmarked: user ? data.user_bookmark?.some((b: any) => b.user_id === user.id) : false,
        views: data.views || 0,
      };

      setPost(transformedPost);
      setIsLiked(transformedPost.isLiked);
      setLikesCount(transformedPost.likes);
      setIsBookmarked(transformedPost.isBookmarked);

      if (data.comments) {
        setComments(data.comments.map((c: any) => ({
          id: c.id,
          content: c.content,
          created_at: c.created_at,
          user: transformUser(c.user, null)
        })));
      }

    } catch (error) {
      console.error("Error fetching post", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }

    setSubmittingComment(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          post_id: id,
          user_id: user.id
        });

      if (error) throw error;

      toast.success("Comment posted!");
      setNewComment('');
      fetchPost();
    } catch (e) {
      toast.error("Failed to post comment");
      console.error(e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!user || !post) {
      if (!user) toast.error("Please sign in to save posts");
      return;
    }

    const wasBookmarked = isBookmarked;
    const newBookmarked = !wasBookmarked;

    setIsBookmarked(newBookmarked);

    try {
      await toggleBookmark(supabase, post.id, wasBookmarked);
      toast.success(newBookmarked ? "Post saved!" : "Removed from bookmarks");
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update bookmark");
      setIsBookmarked(wasBookmarked);
    }
  };

  const handleLikeToggle = async () => {
    if (!user || !post || likeLoading) return;

    const wasLiked = isLiked;
    const oldLikesCount = likesCount;
    const newLiked = !wasLiked;

    setIsLiked(newLiked);
    setLikesCount(newLiked ? oldLikesCount + 1 : Math.max(0, oldLikesCount - 1));
    setLikeLoading(true);

    try {
      await toggleLike(supabase, post.id, wasLiked);
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update like");
      setIsLiked(wasLiked);
      setLikesCount(oldLikesCount);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await apiDeletePost(supabase, id);
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
        <div className="h-6 w-24 bg-muted rounded" />
        <div className="space-y-4">
          <div className="h-48 w-full bg-muted rounded-xl" />
          <div className="h-10 w-3/4 bg-muted rounded" />
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-3 w-32 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center space-y-3">
          <h2 className="text-xl font-semibold">This post is no longer available</h2>
          <p className="text-muted-foreground">It might have been deleted or removed.</p>
          <Link to="/">
            <Button variant="outline" className="gap-2 mt-4">
              <ArrowLeft className="h-4 w-4" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Feed
          </Button>
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 lg:p-8 relative group"
        >
          {canDelete && (
            <div className="absolute top-6 right-6 z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-border hover:bg-muted">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Post</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Link to={`/profile/${post.author.username}`}>
              <img
                src={post.author.avatar}
                alt={post.author.displayName}
                className="h-12 w-12 rounded-full ring-2 ring-primary/20"
              />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <UserHoverCard
                  userId={post.author.id}
                  username={post.author.username}
                  displayName={post.author.displayName}
                  avatar={post.author.avatar}
                >
                  <Link
                    to={`/profile/${post.author.username}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {post.author.displayName}
                  </Link>
                </UserHoverCard>
                <FollowButton
                  targetUserId={post.author.id}
                  targetUsername={post.author.displayName}
                  size="sm"
                  variant="ghost"
                  className="h-8"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to={`/community/${post.community.slug}`} className="hover:text-primary">
                  {post.community.icon} {post.community.name}
                </Link>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime} min read
                </span>
                <span>·</span>
                <span>{post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'Just now'}</span>
              </div>
            </div>
          </div>

          <h1 className="mt-6 text-4xl font-bold font-iceland text-foreground tracking-wide">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-2">
            {post.hashtags?.map((tag: string) => (
              <Link key={tag} to={`/?hashtag=${encodeURIComponent(tag)}`} className="tag hover:text-primary">
                {tag}
              </Link>
            ))}
          </div>

          <div className="mt-8">
            <MarkdownRenderer content={post.content} />
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLikeToggle}
                      disabled={likeLoading || !user}
                      className={cn(
                        "gap-1.5 transition-all duration-200",
                        isLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500",
                        !user && "opacity-60 cursor-not-allowed"
                      )}
                    >
                      <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                      {likesCount}
                    </Button>
                  </TooltipTrigger>
                  {!user && <TooltipContent>Sign in to react</TooltipContent>}
                </Tooltip>
              </TooltipProvider>

              <Button variant="ghost" size="sm" className="gap-1.5">
                <MessageCircle className="h-4 w-4" />
                {comments.length}
              </Button>

              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                {(post.views / 1000).toFixed(1)}k views
              </span>
            </div>

            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBookmarkToggle}
                      disabled={!user}
                      className={cn(
                        !user && "opacity-60 cursor-not-allowed",
                        isBookmarked && "text-primary"
                      )}
                    >
                      <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
                    </Button>
                  </TooltipTrigger>
                  {!user && <TooltipContent>Sign in to save</TooltipContent>}
                </Tooltip>
              </TooltipProvider>

              <ShareMenu
                title={post.title}
                path={`/post/${post.id}`}
                trigger={
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                }
              />
            </div>
          </div>
        </motion.article>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="terminal-heading text-lg font-bold">comments ({comments.length})</h3>

          {user ? (
            <div className="mt-4">
              <Textarea
                placeholder="Share your thoughts..."
                className="min-h-[100px]"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="mt-3 flex justify-end">
                <Button onClick={handlePostComment} disabled={submittingComment || !newComment.trim()}>
                  {submittingComment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Post Comment
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-primary/20 bg-primary/5 p-8 text-center">
              <p className="text-muted-foreground mb-4 font-medium">Want to join the discussion?</p>
              <Link to="/auth/sign-in">
                <Button variant="outline" className="gap-2">
                  Sign in to Comment
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-6 border-t border-border pt-6 space-y-6">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <img
                    src={comment.user.avatar}
                    alt={comment.user.username}
                    className="w-8 h-8 rounded-full bg-muted"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{comment.user.displayName}</span>
                      <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </motion.div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and remove all its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default PostPage;
