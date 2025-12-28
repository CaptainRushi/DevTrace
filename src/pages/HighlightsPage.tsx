import { motion } from 'framer-motion';
import { Zap, Plus, Loader2, Smile } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { HighlightCard } from '@/components/highlights/HighlightCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getDailyHighlights, createDailyHighlight } from '@/services/api';

const HighlightsPage = () => {
  const { user } = useAuth();
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const fetchHighlights = async () => {
    setLoading(true);
    try {
      const data = await getDailyHighlights(supabase);
      setHighlights(data);
    } catch (error) {
      console.error("Error fetching highlights", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    if (!user) {
      toast.error("Please sign in to post highlights");
      return;
    }

    setIsPosting(true);
    try {
      await createDailyHighlight(supabase, content.trim());

      setContent('');
      toast.success("Highlight posted!");
      fetchHighlights(); // Refresh
    } catch (error: any) {
      if (error.code === '23505') {
        toast.error("You can only post one highlight per day.");
      } else {
        toast.error("Failed to post highlight");
      }
      console.error(error);
    } finally {
      setIsPosting(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  return (
    <>
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
          className="rounded-xl bg-card p-4"
        >
          <Textarea
            placeholder="What did you work on today? 💡"
            className="min-h-[100px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/20">
                    <Smile className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" align="start">
                  <div className="grid grid-cols-5 gap-1">
                    {["🚀", "🔥", "💡", "🎨", "🐛", "🔧", "🎉", "🏆", "🌟", "📚", "💻", "👀", "✅", "⚡", "🌈"].map((emoji) => (
                      <button
                        key={emoji}
                        className="text-xl p-2 rounded-md hover:bg-muted transition-colors"
                        onClick={() => setContent(prev => prev + emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <Button size="sm" className="gap-1.5" onClick={handlePost} disabled={isPosting || !content.trim()}>
              {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Post Highlight
            </Button>
          </div>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : highlights.length > 0 ? (
            <div className="space-y-12">
              {/* Grouping Today vs Yesterday */}
              {['today', 'yesterday'].map((day) => {
                const dayHighlights = highlights.filter(h => {
                  const date = new Date(h.posted_date).toISOString().split('T')[0];
                  const today = new Date().toISOString().split('T')[0];
                  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                  return day === 'today' ? date === today : date === yesterday;
                });

                if (dayHighlights.length === 0) return null;

                return (
                  <div key={day} className="space-y-6">
                    <h2 className="terminal-heading text-xl font-bold uppercase tracking-widest text-primary/80">
                      {day}
                    </h2>
                    <div className="space-y-0">
                      {dayHighlights.map((highlight, index) => (
                        <HighlightCard key={highlight.id} highlight={highlight} index={index} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed rounded-lg border-border bg-card/50">
              <p className="text-muted-foreground">No highlights yet. Be the first to start the streak!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
export default HighlightsPage;
