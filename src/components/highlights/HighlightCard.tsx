import { memo } from 'react';
import { motion } from 'framer-motion';
// import { DailyHighlight } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import { ShareMenu } from '@/components/common/ShareMenu';

interface DailyHighlight {
  id: string;
  content: string;
  createdAt: string; // created_at mapped
  author: {
    displayName: string;
    username: string;
    avatar: string;
  };
  reactions?: { emoji: string; count: number }[];
}

interface HighlightCardProps {
  highlight: DailyHighlight;
  index?: number;
}

export const HighlightCard = memo(({ highlight, index = 0 }: HighlightCardProps) => {
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className="relative"
    >
      {/* Timeline connector */}
      <div className="absolute left-5 top-12 bottom-0 w-px bg-border" />

      <div className="relative flex gap-4">
        {/* Avatar with timeline dot */}
        <div className="relative shrink-0">
          <Link to={`/profile/${highlight.author.username}`}>
            <img
              src={highlight.author.avatar}
              alt={highlight.author.displayName}
              loading="lazy"
              decoding="async"
              className="h-10 w-10 rounded-full ring-2 ring-background"
            />
          </Link>
          <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-primary ring-2 ring-background" />
        </div>

        <div className="flex-1 pb-6">
          <div className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30">
            <div className="flex items-center gap-2 text-sm">
              <Link
                to={`/profile/${highlight.author.username}`}
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                {highlight.author.displayName}
              </Link>
              <span className="text-muted-foreground">·</span>
              <span className="text-muted-foreground">
                {timeAgo(highlight.createdAt)}
              </span>
            </div>

            <p className="mt-2 text-foreground">
              {highlight.content}
            </p>

            {/* Reactions */}
            <div className="mt-3 flex items-center gap-2">
              {(highlight.reactions || []).map((reaction, i) => (
                <button
                  key={i}
                  className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-sm transition-colors hover:bg-muted/80"
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-muted-foreground">{reaction.count}</span>
                </button>
              ))}
              <button className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary">
                +
              </button>
              <div className="ml-auto">
                <ShareMenu
                  title={`Highlight by ${highlight.author.displayName}`}
                  path="/highlights"
                  trigger={
                    <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                      <Share2 className="h-4 w-4" />
                    </button>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
