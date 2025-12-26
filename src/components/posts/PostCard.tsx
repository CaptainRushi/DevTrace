import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Clock, Bookmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { Post } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PostCardProps {
  post: Post;
  index?: number;
}

const postTypeColors = {
  experience: 'bg-primary/20 text-primary',
  question: 'bg-warning/20 text-warning',
  tool: 'bg-info/20 text-info',
  job: 'bg-success/20 text-success',
  challenge: 'bg-secondary/20 text-secondary',
};

const postTypeLabels = {
  experience: 'Experience',
  question: 'Question',
  tool: 'Tool',
  job: 'Job',
  challenge: 'Challenge',
};

export function PostCard({ post, index = 0 }: PostCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="post-card group"
    >
      <div className="flex gap-4">
        {/* Author Avatar */}
        <Link to={`/profile/${post.author.username}`} className="shrink-0">
          <img
            src={post.author.avatar}
            alt={post.author.displayName}
            className="h-10 w-10 rounded-full ring-2 ring-transparent transition-all group-hover:ring-primary/50"
          />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link
              to={`/profile/${post.author.username}`}
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              {post.author.displayName}
            </Link>
            <span className="text-muted-foreground">in</span>
            <Link
              to={`/community/${post.community.slug}`}
              className="community-badge"
            >
              <span>{post.community.icon}</span>
              {post.community.name}
            </Link>
            <span className="text-muted-foreground">·</span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {post.readTime} min read
            </span>
          </div>

          {/* Title */}
          <Link to={`/post/${post.id}`}>
            <h2 className="mt-2 text-lg font-semibold text-foreground line-clamp-2 hover:text-primary transition-colors">
              {post.title}
            </h2>
          </Link>

          {/* Excerpt */}
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {post.excerpt}
          </p>

          {/* Tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className={`tag ${postTypeColors[post.type]}`}>
              {postTypeLabels[post.type]}
            </span>
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Heart className="h-4 w-4" />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments}</span>
              </button>
              <span className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{(post.views / 1000).toFixed(1)}k</span>
              </span>
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
