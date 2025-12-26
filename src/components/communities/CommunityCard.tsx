import { Link } from 'react-router-dom';
import { Users, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Community } from '@/data/mockData';
import { Button } from '@/components/ui/button';

interface CommunityCardProps {
  community: Community;
  index?: number;
  compact?: boolean;
}

export function CommunityCard({ community, index = 0, compact = false }: CommunityCardProps) {
  if (compact) {
    return (
      <Link
        to={`/community/${community.slug}`}
        className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:border-primary/50 hover:bg-card/80 card-glow"
      >
        <span className="text-2xl">{community.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{community.name}</h3>
          <p className="text-xs text-muted-foreground">
            {(community.memberCount / 1000).toFixed(1)}k members
          </p>
        </div>
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-all card-glow"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-3xl">
          {community.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {community.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {community.description}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {(community.memberCount / 1000).toFixed(1)}k
        </span>
        <span className="flex items-center gap-1.5">
          <FileText className="h-4 w-4" />
          {(community.postCount / 1000).toFixed(1)}k posts
        </span>
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {community.tags.slice(0, 4).map((tag) => (
          <span key={tag} className="tag text-xs">
            {tag}
          </span>
        ))}
      </div>

      {/* Join Button */}
      <div className="mt-4 flex items-center justify-between">
        <Button variant="outline" size="sm" className="group/btn">
          Join Community
          <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
        </Button>
        <Link
          to={`/community/${community.slug}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          View Feed
        </Link>
      </div>
    </motion.div>
  );
}
