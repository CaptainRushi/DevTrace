import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Send, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const DailyHighlightWidget = () => {
    const { user } = useAuth();
    const [todaysHighlight, setTodaysHighlight] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [content, setContent] = useState('');

    const today = new Date().toISOString().split('T')[0];

    const fetchTodaysHighlight = async () => {
        try {
            const { data, error } = await supabase
                .from('daily_highlights')
                .select('*, author:users!daily_highlights_posted_by_fkey(*)')
                .eq('posted_date', today)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is 'not found'

            if (data) {
                setTodaysHighlight({
                    ...data,
                    authorName: data.author?.username || 'Unknown',
                    authorAvatar: data.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.author?.username}`
                });
            }
        } catch (e) {
            console.error("Fetch highlight error", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodaysHighlight();

        // Subscribe to real-time updates for today's highlights
        const channel = supabase
            .channel('daily_highlights_changes')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'daily_highlights', filter: `posted_date=eq.${today}` },
                (payload) => {
                    fetchTodaysHighlight(); // Refresh on new insert
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handlePost = async () => {
        if (!user) {
            toast.error("Login to post");
            return;
        }
        if (!content.trim()) {
            toast.error("Content empty");
            return;
        }
        if (content.length > 200) {
            toast.error("Max 200 characters");
            return;
        }
        // Basic strict check
        if (content.match(/(http|www|!\[|```)/i)) {
            toast.error("No links, images, or code blocks allowed.");
            return;
        }

        setIsPosting(true);
        try {
            const { error } = await supabase.from('daily_highlights').insert({
                content: content.trim(),
                posted_by: user.id,
                posted_date: today
            });

            if (error) {
                if (error.code === '23505') { // Unique violation
                    toast.error("Today's highlight was just posted by someone else!");
                    fetchTodaysHighlight();
                } else {
                    throw error;
                }
            } else {
                toast.success("Highlight posted!");
                setContent('');
                setShowForm(false);
                fetchTodaysHighlight();
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to post");
        } finally {
            setIsPosting(false);
        }
    };

    if (loading) return null; // Or skeleton

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-xl bg-gradient-to-r from-primary/10 via-background to-background border border-primary/20 p-6"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-5 w-5 text-primary fill-primary" />
                        <h2 className="text-lg font-bold uppercase tracking-wide text-primary">Today's Highlight</h2>
                        <span className="text-xs text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full mono">
                            {format(new Date(), 'MMM dd, yyyy')}
                        </span>
                    </div>

                    {todaysHighlight ? (
                        <div className="mt-3">
                            <p className="text-xl md:text-2xl font-medium leading-relaxed text-foreground">
                                "{todaysHighlight.content}"
                            </p>
                            <div className="mt-4 flex items-center gap-2">
                                <img
                                    src={todaysHighlight.authorAvatar}
                                    alt={todaysHighlight.authorName}
                                    className="h-6 w-6 rounded-full border border-border"
                                />
                                <span className="text-sm text-muted-foreground">
                                    by <span className="font-semibold text-foreground">{todaysHighlight.authorName}</span>
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-2">
                            <p className="text-muted-foreground mb-4">
                                No highlight yet today. Be the one to set the tone!
                            </p>

                            {!showForm ? (
                                <Button
                                    onClick={() => setShowForm(true)}
                                    disabled={!user}
                                    className="gap-2"
                                >
                                    <Zap className="h-4 w-4" />
                                    Post Daily Highlight
                                </Button>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-3 max-w-lg"
                                >
                                    <div className="relative">
                                        <Textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Sharing something cool? (Max 200 chars)"
                                            maxLength={200}
                                            className="resize-none pr-12 min-h-[80px] text-lg"
                                        />
                                        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                                            {content.length}/200
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            onClick={handlePost}
                                            disabled={isPosting || !content.trim()}
                                            className="gap-2"
                                        >
                                            {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                            Post
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setShowForm(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        No images, links, or code. Plain text & emojis only.
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right side status / lock icon if posted */}
                {todaysHighlight && !showForm && (
                    <div className="hidden sm:flex flex-col items-end text-right text-muted-foreground">
                        <Lock className="h-5 w-5 mb-1" />
                        <span className="text-xs">Locked for today</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
