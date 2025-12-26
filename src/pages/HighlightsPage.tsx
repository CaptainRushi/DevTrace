import { motion } from 'framer-motion';
import { Zap, Plus } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { HighlightCard } from '@/components/highlights/HighlightCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { dailyHighlights } from '@/data/mockData';

const HighlightsPage = () => {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Daily Highlights</h1>
            <p className="text-muted-foreground">Share what you worked on today</p>
          </div>
        </motion.div>

        {/* Post Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-4"
        >
          <Textarea
            placeholder="What did you work on today? 💡"
            className="min-h-[100px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0"
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              <button className="rounded-full bg-muted px-3 py-1.5 text-sm transition-colors hover:bg-primary/20 hover:text-primary">
                🎉
              </button>
              <button className="rounded-full bg-muted px-3 py-1.5 text-sm transition-colors hover:bg-primary/20 hover:text-primary">
                🐛
              </button>
              <button className="rounded-full bg-muted px-3 py-1.5 text-sm transition-colors hover:bg-primary/20 hover:text-primary">
                🚀
              </button>
              <button className="rounded-full bg-muted px-3 py-1.5 text-sm transition-colors hover:bg-primary/20 hover:text-primary">
                💡
              </button>
            </div>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              Post Highlight
            </Button>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          <h2 className="terminal-heading text-xl font-bold mb-6">today</h2>
          <div className="space-y-0">
            {dailyHighlights.map((highlight, index) => (
              <HighlightCard key={highlight.id} highlight={highlight} index={index} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HighlightsPage;
