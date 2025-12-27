import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Clock, Bookmark, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, memo } from 'react';
import { supabase } from '@/lib/supabase';
import { toggleLike, toggleBookmark } from '@/services/api';
import { TimeAgo } from '@/components/common/TimeAgo';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Easing } from 'framer-motion';

interface Post {
  id: string;
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
  const [liked, setLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked);
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

    const previousLiked = liked;
    setLiked(!liked);
    setLikesCount(prev => !liked ? prev + 1 : prev - 1);

    // Trigger animation via state change (handled by animate prop on motion.div/svg)

    try {
      await toggleLike(supabase, post.id, previousLiked);
    } catch (error) {
      toast.error("Please login to like posts");
      setLiked(previousLiked);
      setLikesCount(previousLikesCount => previousLiked ? previousLikesCount + 1 : previousLikesCount - 1);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const previousBookmarked = bookmarked;
    setBookmarked(!bookmarked);

    try {
      await toggleBookmark(supabase, post.id, previousBookmarked);
      toast.success(bookmarked ? "Removed from bookmarks" : "Post saved!");
    } catch (error) {
      toast.error("Please login to save posts");
      setBookmarked(previousBookmarked);
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group rounded-xl border border-border bg-card overflow-hidden transition-all hover:border-primary/20 hover:shadow-lg flex flex-col"
    >
      {/* 1. Cover Image (if exists) */}
      {post.cover_image_url && (
        <Link to={`/post/${post.id}`} className={`block w-full ${variant === 'compact' ? 'h-32' : 'h-48'} overflow-hidden relative`}>
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
        </Link>
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
          <Link to={`/profile/${post.author.username}`} className="shrink-0">
            <img
              src={post.author.avatar}
              alt={post.author.displayName}
              loading="lazy"
              decoding="async"
              className={`${variant === 'compact' ? 'h-8 w-8' : 'h-10 w-10'} rounded-full ring-2 ring-transparent group-hover:ring-primary/20 transition-all`}
            />
          </Link>
          <div className="flex flex-col text-sm">
            <Link
              to={`/profile/${post.author.username}`}
              className="font-semibold text-foreground hover:text-primary transition-colors"
            >
              {post.author.displayName}
            </Link>
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <Link to={`/community/${post.community.slug}`} className="hover:text-foreground">
                {post.community.name}
              </Link>
              <span>•</span>
              <TimeAgo date={post.created_at} showIcon={false} />
            </div>
          </div>
        </div>

        {/* 2. Post Title (Optional but usually present) */}
        {post.title && (
          <Link to={`/post/${post.id}`}>
            <h2 className={`${variant === 'compact' ? 'text-lg' : 'text-xl'} font-bold font-iceland text-foreground line-clamp-2 hover:text-primary transition-colors tracking-wide`}>
              {post.title}
            </h2>
          </Link>
        )}

        {/* 3. Post Text (Truncated) */}
        {/* 3. Post Text (Truncated) */}
        {variant !== 'compact' && (
          <Link to={`/post/${post.id}`} className="block">
            <p className="text-muted-foreground font-iceland text-lg line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
          </Link>
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
            {/* Like Button */}
            <motion.button
              onClick={handleLike}
              whileTap="tap"
              whileHover="hover"
              className={cn(
                "flex items-center gap-1.5 text-sm font-medium transition-colors outline-none relative",
                liked ? "text-red-500" : "text-muted-foreground hover:text-red-500"
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
            <button
              onClick={handleBookmark}
              className={cn(
                "p-2 rounded-full hover:bg-muted transition-colors",
                bookmarked ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Bookmark className={cn("h-5 w-5", bookmarked && "fill-current")} />
            </button>
            {/* Share (Optional but nice) */}
            {/* <button className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
               <Share2 className="h-4 w-4" />
             </button> */}
          </div>
        </div>
      </div>
    </motion.article>
  );
});
