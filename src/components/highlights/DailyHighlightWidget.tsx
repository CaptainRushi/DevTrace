import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Send, Loader2, Lock, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getDailyHighlights, createDailyHighlight } from '@/services/api';
import { ShareMenu } from '@/components/common/ShareMenu';

export const DailyHighlightWidget = () => {
    const { user } = useAuth();
    const [todaysHighlights, setTodaysHighlights] = useState<any[]>([]);
    const [userHasPostedToday, setUserHasPostedToday] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [content, setContent] = useState('');

    const today = new Date().toISOString().split('T')[0];

    const fetchTodaysHighlights = async () => {
        try {
            const data = await getDailyHighlights(supabase);
            const foundToday = data.filter(h => h.posted_date === today);

            setTodaysHighlights(foundToday.map(h => ({
                ...h,
                authorName: h.author.displayName,
                authorAvatar: h.author.avatar,
                authorId: h.author.id
            })));

            // Check if the current user has already posted today
            if (user) {
                const userHighlight = foundToday.find(h => h.author.id === user.id);
                setUserHasPostedToday(!!userHighlight);
            } else {
                setUserHasPostedToday(false);
            }
        } catch (e) {
            console.error("Fetch highlight error", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodaysHighlights();

        // Subscribe to real-time updates for today's highlights
        const channel = supabase
            .channel('daily_highlights_changes')
            .on('postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'daily_highlights', filter: `posted_date=eq.${today}` },
                (payload) => {
                    fetchTodaysHighlights(); // Refresh on new insert
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const handlePost = async () => {
        if (!user) {
            toast.error("Login to post");
            return;
        }
        if (userHasPostedToday) {
            toast.error("You can post only one highlight per day.");
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
            await createDailyHighlight(supabase, content.trim());
            toast.success("Highlight posted!");
            setContent('');
            setShowForm(false);
            fetchTodaysHighlights();
        } catch (error: any) {
            if (error.code === '23505') { // Unique violation - user already posted today
                toast.error("You can post only one highlight per day.");
                setUserHasPostedToday(true);
                fetchTodaysHighlights();
            } else {
                console.error(error);
                toast.error("Failed to post");
            }
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

                    {todaysHighlights.length > 0 ? (
                        <div className="mt-3 space-y-4">
                            {todaysHighlights.map((highlight, idx) => (
                                <div key={highlight.id || idx} className="border-l-2 border-primary/30 pl-4">
                                    <p className="text-xl md:text-2xl font-medium leading-relaxed text-foreground">
                                        "{highlight.content}"
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <img
                                            src={highlight.authorAvatar}
                                            alt={highlight.authorName}
                                            className="h-6 w-6 rounded-full border border-border"
                                        />
                                        <span className="text-sm text-muted-foreground">
                                            by <span className="font-semibold text-foreground">{highlight.authorName}</span>
                                        </span>
                                        <div className="ml-auto">
                                            <ShareMenu
                                                title={`Today's Highlight by ${highlight.authorName}`}
                                                path="/highlights"
                                                trigger={
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                        <Share2 className="h-4 w-4" />
                                                    </Button>
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Show form for users who haven't posted yet */}
                            {user && !userHasPostedToday && (
                                <div className="mt-4 pt-4 border-t border-border/50">
                                    {!showForm ? (
                                        <Button
                                            onClick={() => setShowForm(true)}
                                            variant="outline"
                                            size="sm"
                                            className="gap-2"
                                        >
                                            <Zap className="h-4 w-4" />
                                            Add Your Highlight
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
                                                    placeholder="Share your highlight! (Max 200 chars)"
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
                                        </motion.div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mt-2">
                            <p className="text-muted-foreground mb-4">
                                No highlight yet today. Be the first to set the tone!
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

                {/* Right side status / lock icon if user has posted */}
                {userHasPostedToday && !showForm && (
                    <div className="hidden sm:flex flex-col items-end text-right text-muted-foreground">
                        <Lock className="h-5 w-5 mb-1" />
                        <span className="text-xs">You've posted today</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
