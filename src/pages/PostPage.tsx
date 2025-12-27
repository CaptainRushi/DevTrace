import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share2, Clock, Eye, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';

// Helper to transform Supabase user to UI user shape (Duplicated)
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
  const { user } = useAuth();

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
                votes(value),
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
        title: data.title,
        content: data.content,
        excerpt: data.content.slice(0, 150) + '...',
        author: transformUser(data.author, null),
        community: {
          ...data.community,
          icon: '🚀'
        },
        readTime: Math.ceil(data.content.length / 500) || 1, // Crude calc
        created_at: data.created_at,
        hashtags: data.hashtags || [],
        likes: data.votes?.filter((v: any) => v.value === 1).length || 0,
        views: 100, // Placeholder
      };

      setPost(transformedPost);

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
      fetchPost(); // Refresh completely to get new comment and show it
    } catch (e) {
      toast.error("Failed to post comment");
      console.error(e);
    } finally {
      setSubmittingComment(false);
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
        <div className="space-y-3">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-2/3 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Post not found</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back button */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Feed
          </Button>
        </Link>

        {/* Post Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 lg:p-8"
        >
          {/* Author */}
          <div className="flex items-center gap-4">
            <Link to={`/profile/${post.author.username}`}>
              <img
                src={post.author.avatar}
                alt={post.author.displayName}
                className="h-12 w-12 rounded-full ring-2 ring-primary/20"
              />
            </Link>
            <div>
              <Link
                to={`/profile/${post.author.username}`}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                {post.author.displayName}
              </Link>
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
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="mt-6 text-4xl font-bold font-iceland text-foreground tracking-wide">
            {post.title}
          </h1>

          {/* Hashtags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {post.hashtags?.map((tag: string) => (
              <Link key={tag} to={`/?hashtag=${encodeURIComponent(tag)}`} className="tag hover:text-primary">
                {tag}
              </Link>
            ))}
          </div>

          {/* Content */}
          <div className="mt-8">
            <MarkdownRenderer content={post.content} />
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Heart className="h-4 w-4" />
                {post.likes}
              </Button>
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
              <Button variant="ghost" size="icon">
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.article>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="terminal-heading text-lg font-bold">comments ({comments.length})</h3>

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
    </>
  );
};

export default PostPage;
