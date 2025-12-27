import { motion } from 'framer-motion';
import { ThumbsUp, ExternalLink } from 'lucide-react';
// import { Tool } from '@/data/mockData';
import { Button } from '@/components/ui/button';

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  link?: string;
  website?: string;
  icon?: string;
  upvotes?: number;
  useCase?: string;
  pros?: string[];
  cons?: string[];
}

interface ToolCardProps {
  tool: Tool;
  index?: number;
}

export function ToolCard({ tool, index = 0 }: ToolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group rounded-xl border border-border bg-card p-5 transition-all card-glow"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-3xl">
          {tool.icon || '🛠️'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {tool.name}
              </h3>
              <span className="tag text-xs mt-1">{tool.category}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <ThumbsUp className="h-4 w-4" />
              <span>{tool.upvotes || 0}</span>
            </div>
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            {tool.description}
          </p>

          {tool.useCase && (
            <div className="mt-3">
              <span className="text-xs font-medium text-foreground">Use case: </span>
              <span className="text-xs text-muted-foreground">{tool.useCase}</span>
            </div>
          )}

          {/* Pros & Cons */}
          {(tool.pros?.length || tool.cons?.length) ? (
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              {tool.pros && (
                <div>
                  <span className="font-medium text-success">Pros</span>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {tool.pros.slice(0, 2).map((pro, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-success">+</span>
                        <span className="line-clamp-1">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tool.cons && (
                <div>
                  <span className="font-medium text-destructive">Cons</span>
                  <ul className="mt-1 space-y-0.5 text-muted-foreground">
                    {tool.cons.slice(0, 2).map((con, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-destructive">-</span>
                        <span className="line-clamp-1">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ThumbsUp className="h-3 w-3" />
              Upvote
            </Button>
            <a
              href={tool.website || tool.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Visit
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
