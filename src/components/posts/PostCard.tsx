import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Clock, Bookmark, Share2, MoreVertical, Trash2, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, memo } from 'react';
import { supabase } from '@/lib/supabase';
import { toggleLike, toggleBookmark, deletePost } from '@/services/api';
import { TimeAgo } from '@/components/common/TimeAgo';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Easing } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

import { ShareMenu } from '@/components/common/ShareMenu';
import { FollowButton } from '@/components/common/FollowButton';
import { UserHoverCard } from '@/components/common/UserHoverCard';

interface Post {
  id: string;
  user_id?: string; // Add user_id if not present
  title: string;
  excerpt: string;
  content?: string;
  readTime: number;
  created_at: string;
  likes: number;
  comments: number;
  views: number;
  type: string;
  hashtags: string[];
  cover_image_url?: string;
  isLiked: boolean;
  isBookmarked: boolean;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
  };
  community: {
    slug: string;
    name: string;
    icon: string;
  };
}

interface PostCardProps {
  post: Post;
  index?: number;
  variant?: 'default' | 'compact';
}

const postTypeColors: Record<string, string> = {
  journey: 'bg-primary/20 text-primary',
  experience: 'bg-primary/20 text-primary',
  question: 'bg-warning/20 text-warning',
  tool: 'bg-info/20 text-info',
  job: 'bg-success/20 text-success',
  challenge: 'bg-secondary/20 text-secondary',
  highlight: 'bg-purple-500/20 text-purple-500',
};

const postTypeLabels: Record<string, string> = {
  journey: 'Journey',
  experience: 'Experience',
  question: 'Question',
  tool: 'Tool',
  job: 'Job',
  challenge: 'Challenge',
  highlight: 'Highlight',
};

export const PostCard = memo(({ post, index = 0, variant = 'default' }: PostCardProps) => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const isOwner = user?.id === post.author.id;
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator';
  const canDelete = isOwner || isAdmin;
  // Like Animation Controls
  const likeVariants = {
    liked: {
      scale: [1, 0.88, 1.22, 1], // Press -> Pop -> Settle
      transition: {
        duration: 0.4,
        times: [0, 0.2, 0.6, 1],
        ease: [0.2, 1.4, 0.4, 1] as Easing // Elastic pop
      }
    },
    unliked: {
      scale: [1, 0.92, 1], // Gentle shrink
      transition: { duration: 0.2, ease: "easeOut" as Easing }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: {
      scale: 0.88,
      transition: { duration: 0.1 }
    }
  };

  const bloomVariants = {
    liked: {
      scale: [0.8, 1.5],
      opacity: [0, 0.6, 0],
      transition: {
        duration: 0.4,
        ease: "easeOut" as Easing,
        times: [0, 0.4, 1]
      }
    },
    unliked: {
      scale: 0,
      opacity: 0
    }
  };

  const countVariants = {
    initial: { opacity: 0, y: 5 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -5 }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please sign in to like posts");
      return;
    }

    if (likeLoading) return;

    const wasLiked = liked;
    const oldLikesCount = likesCount;
    const newLiked = !wasLiked;

    // Optimistic UI Update
    setLiked(newLiked);
    setLikesCount(newLiked ? oldLikesCount + 1 : Math.max(0, oldLikesCount - 1));
    setLikeLoading(true);

    try {
      await toggleLike(supabase, post.id, wasLiked);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update like");
      // Rollback on failure to exact previous state
      setLiked(wasLiked);
      setLikesCount(oldLikesCount);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please sign in to save posts");
      return;
    }

    const wasBookmarked = bookmarked;
    const newBookmarked = !wasBookmarked;

    setBookmarked(newBookmarked);

    try {
      await toggleBookmark(supabase, post.id, wasBookmarked);
      toast.success(newBookmarked ? "Post saved!" : "Removed from bookmarks");
    } catch (error) {
      toast.error("Failed to update bookmark");
      setBookmarked(wasBookmarked);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) return;

    setIsDeleting(true);
    try {
      await deletePost(supabase, post.id);
      setIsDeleted(true);
      toast.success("Post deleted successfully");

      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['user-posts'] });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (isDeleted) {
    return null; // Or a smaller "Post deleted" placeholder if needed
  }

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        onClick={(e) => {
          console.log('[PostCard] Click event triggered', {
            id: post.id,
            target: e.target,
            currentTarget: e.currentTarget
          });

          if (!post.id) {
            console.error('[PostCard] Post ID is missing!', post);
            return;
          }

          // Allow default behavior for interactive elements
          const target = e.target as HTMLElement;
          const interactive = target.closest('button') || target.closest('[role="button"]') || target.closest('a');

          if (interactive) {
            console.log('[PostCard] Click handled by interactive element', interactive);
            return;
          }

          // Handle modifier keys for opening in new tab
          if (e.metaKey || e.ctrlKey || e.shiftKey) {
            console.log('[PostCard] Opening in new tab');
            window.open(`/post/${post.id}`, '_blank');
            return;
          }

          // Default navigation
          console.log('[PostCard] Navigating to', `/post/${post.id}`);
          navigate(`/post/${post.id}`);
        }}
        className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/20 hover:shadow-lg flex flex-col relative cursor-pointer"
      >
        {/* ⋯ Menu */}
        {canDelete && (
          <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm border border-border hover:bg-background">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {/* Edit Post coming soon */}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete Post</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {/* 1. Cover Image (if exists) */}
        {post.cover_image_url && (
          <div className={`block w-full ${variant === 'compact' ? 'h-32' : 'h-48'} overflow-hidden relative`}>
            <img
              src={post.cover_image_url}
              alt={post.title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-60"></div>

            {/* Badge overlaid on image if it exists */}
            <div className="absolute top-3 left-3">
              <span className={`tag backdrop-blur-md ${postTypeColors[post.type] || 'bg-background/80 text-foreground'}`}>
                {postTypeLabels[post.type] || post.type}
              </span>
            </div>
          </div>
        )}

        <div className={`${variant === 'compact' ? 'p-4' : 'p-5'} flex flex-col gap-3 flex-1`}>
          {/* Author & Meta Header (If no cover image, post type can go here or keep consistent) */}
          {!post.cover_image_url && (
            <div className="flex items-center gap-2 mb-1">
              <span className={`tag ${postTypeColors[post.type] || 'bg-muted text-muted-foreground'}`}>
                {postTypeLabels[post.type] || post.type}
              </span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.author.username}`} className="shrink-0" onClick={(e) => e.stopPropagation()}>
              <img
                src={post.author.avatar}
                alt={post.author.displayName}
                loading="lazy"
                decoding="async"
                className={`${variant === 'compact' ? 'h-8 w-8' : 'h-10 w-10'} rounded-full ring-2 ring-transparent group-hover:ring-primary/20 transition-all`}
              />
            </Link>
            <div className="flex flex-col text-sm">
              <div className="flex items-center gap-2">
                <UserHoverCard
                  userId={post.author.id}
                  username={post.author.username}
                  displayName={post.author.displayName}
                  avatar={post.author.avatar}
                >
                  <Link
                    to={`/profile/${post.author.username}`}
                    className="font-semibold text-foreground hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {post.author.displayName}
                  </Link>
                </UserHoverCard>
                <FollowButton
                  targetUserId={post.author.id}
                  targetUsername={post.author.displayName}
                  size="xs"
                  variant="ghost"
                  className="h-6 px-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Link to={`/community/${post.community.slug}`} className="hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                  {post.community.name}
                </Link>
                <span>•</span>
                <TimeAgo date={post.created_at} showIcon={false} />
              </div>
            </div>
          </div>

          {/* 2. Post Title (Optional but usually present) */}
          {post.title && (
            <div className="cursor-pointer">
              <h2 className={`${variant === 'compact' ? 'text-lg' : 'text-xl'} font-bold font-iceland text-foreground line-clamp-2 hover:text-primary transition-colors tracking-wide`}>
                {post.title}
              </h2>
            </div>
          )}

          {/* 3. Post Text (Truncated) */}
          {variant !== 'compact' && (
            <p className="text-muted-foreground font-iceland text-lg line-clamp-3 leading-relaxed cursor-pointer">
              {post.excerpt}
            </p>
          )}

          {/* 4. Hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-auto pt-2">
              {post.hashtags.slice(0, 4).map((tag) => (
                <Link
                  key={tag}
                  to={`/?hashtag=${encodeURIComponent(tag)}`}
                  className="text-xs font-medium text-primary/80 hover:text-primary transition-colors hover:underline"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* 5. Action Bar */}
          <div className={`flex items-center justify-between border-t border-border mt-auto ${variant === 'compact' ? 'pt-3' : 'pt-4'}`}>
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      onClick={handleLike}
                      disabled={likeLoading}
                      whileTap={user ? "tap" : undefined}
                      whileHover={user ? "hover" : undefined}
                      className={cn(
                        "flex items-center gap-1.5 text-sm font-medium transition-colors outline-none relative",
                        liked ? "text-red-500" : "text-muted-foreground hover:text-red-500",
                        likeLoading && "opacity-70 cursor-not-allowed"
                      )}
                    >
                      <div className="relative">
                        {/* Bloom Ring */}
                        <motion.div
                          className="absolute inset-0 bg-red-500 rounded-full"
                          variants={bloomVariants}
                          animate={liked ? "liked" : "unliked"}
                          initial={false}
                          style={{ zIndex: -1 }} // Behind the heart
                        />

                        <motion.div
                          variants={likeVariants}
                          animate={liked ? "liked" : "unliked"}
                          initial={false} // Prevent initial animation on mount
                        >
                          <Heart className={cn("h-5 w-5", liked && "fill-current")} />
                        </motion.div>
                      </div>

                      {/* Animated Count */}
                      <div className="relative min-w-[1ch] h-5 overflow-hidden flex items-center">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={likesCount}
                            variants={countVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute left-0 top-0"
                          >
                            {likesCount}
                          </motion.span>
                        </AnimatePresence>
                        <span className="invisible">{likesCount}</span> {/* Spacer to keep width */}
                      </div>
                    </motion.button>
                  </TooltipTrigger>
                  {!user && <TooltipContent side="top">Sign in to react</TooltipContent>}
                </Tooltip>
              </TooltipProvider>

              {/* Comment Button - Navigate to post */}
              <Link to={`/post/${post.id}#comments`}>
                <button className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  <MessageCircle className="h-5 w-5" />
                  <span>{post.comments}</span>
                </button>
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {/* Bookmark */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleBookmark}
                      className={cn(
                        "p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground",
                        bookmarked && "text-primary"
                      )}
                    >
                      <Bookmark className={cn("h-5 w-5", bookmarked && "fill-current")} />
                    </button>
                  </TooltipTrigger>
                  {!user && <TooltipContent>Sign in to save</TooltipContent>}
                </Tooltip>
              </TooltipProvider>
              <ShareMenu
                title={post.title}
                path={`/post/${post.id}`}
                trigger={
                  <button className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
                    <Share2 className="h-5 w-5" />
                  </button>
                }
              />
            </div>
          </div>
        </div>
      </motion.article>

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
});
