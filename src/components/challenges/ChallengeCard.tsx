import { Link } from 'react-router-dom';
import { Users, MessageCircle, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { Challenge } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChallengeCardProps {
  challenge: Challenge;
  index?: number;
}

const difficultyStyles = {
  easy: 'difficulty-easy',
  medium: 'difficulty-medium',
  hard: 'difficulty-hard',
};

export function ChallengeCard({ challenge, index = 0 }: ChallengeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group rounded-xl border border-border bg-card p-5 transition-all card-glow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('tag', difficultyStyles[challenge.difficulty])}>
              {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
            </span>
            <div className="flex gap-1.5">
              {challenge.tags.map((tag) => (
                <span key={tag} className="tag text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <Link to={`/challenges/${challenge.id}`}>
            <h3 className="mt-3 font-semibold text-foreground group-hover:text-primary transition-colors">
              {challenge.title}
            </h3>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {challenge.description}
          </p>
        </div>

        <div className="shrink-0 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {challenge.submissions} solutions
          </span>
          <span className="flex items-center gap-1.5">
            by {challenge.author.displayName}
          </span>
        </div>
        <Button variant="outline" size="sm">
          Solve Challenge
        </Button>
      </div>
    </motion.div>
  );
}
