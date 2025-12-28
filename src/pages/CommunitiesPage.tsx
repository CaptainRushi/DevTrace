import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Loader2, Filter, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { CommunityCard } from '@/components/communities/CommunityCard';
import { CommunitySkeleton } from '@/components/common/Skeletons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { getCommunities, CommunityFilters, getCommunityCategories } from '@/services/api';

export default function CommunitiesPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const [joiningId, setJoiningId] = useState<string | null>(null);

    // Dynamic categories
    const { data: categories = [] } = useQuery({
        queryKey: ['community-categories'],
        queryFn: () => getCommunityCategories(supabase),
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    const allCategories = [{ id: 'all', label: 'All Domains' }, ...categories];

    // Filter State from URL
    const filters: CommunityFilters = {
        category: searchParams.get('category') || 'all',
        sortBy: (searchParams.get('sort') as 'popular' | 'newest') || 'popular',
        joinedOnly: searchParams.get('joined') === 'true',
        search: searchParams.get('q') || '',
    };

    const updateFilter = (key: keyof CommunityFilters, value: any) => {
        const newParams = new URLSearchParams(searchParams);
        if (value === 'all' || value === false || value === '') {
            newParams.delete(key === 'sortBy' ? 'sort' : key === 'search' ? 'q' : key === 'joinedOnly' ? 'joined' : key);
        } else {
            newParams.set(key === 'sortBy' ? 'sort' : key === 'search' ? 'q' : key === 'joinedOnly' ? 'joined' : key, value.toString());
        }
        setSearchParams(newParams);
    };

    const { data: communities = [], isLoading: loading, refetch } = useQuery({
        queryKey: ['communities', filters, user?.id],
        queryFn: () => getCommunities(supabase, filters, user?.id),
        staleTime: 1000 * 60 * 5,
    });

    const [localSearch, setLocalSearch] = useState(filters.search);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== filters.search) {
                updateFilter('search', localSearch);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [localSearch]);

    const handleJoinToggle = async (communityId: string) => {
        if (!user) {
            toast.error("Please sign in to join communities");
            return;
        }

        const community = communities.find((c: any) => c.id === communityId);
        if (!community) return;
        const isJoining = !community.isJoined;

        setJoiningId(communityId);

        try {
            if (!isJoining) {
                const { error } = await supabase
                    .from('community_members')
                    .delete()
                    .eq('community_id', communityId)
                    .eq('user_id', user.id);

                if (error) throw error;
                toast.success(`Left ${community.name}`);
            } else {
                const { error } = await supabase
                    .from('community_members')
                    .insert({
                        community_id: communityId,
                        user_id: user.id
                    });

                if (error) throw error;
                toast.success(`Joined ${community.name}`);
            }

            // Optimistic update
            queryClient.setQueryData(['communities', filters, user?.id], (old: any) => {
                return old?.map((c: any) => {
                    if (c.id === communityId) {
                        return {
                            ...c,
                            isJoined: isJoining,
                            memberCount: isJoining ? (c.memberCount || 0) + 1 : Math.max(0, (c.memberCount || 0) - 1)
                        };
                    }
                    return c;
                });
            });

            queryClient.invalidateQueries({ queryKey: ['communities-sidebar'] });

        } catch (error) {
            console.error("Error toggling join", error);
            toast.error("Failed to update membership");
        } finally {
            setJoiningId(null);
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Communities</h1>
                            <p className="text-muted-foreground">Discover and join focused developer spaces.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search communities..."
                            className="pl-10 bg-muted/50 border-border/50 focus:bg-background transition-colors"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                        />
                    </div>

                    <Select
                        value={filters.sortBy}
                        onValueChange={(v) => updateFilter('sortBy', v)}
                    >
                        <SelectTrigger className="w-[160px] bg-muted/50 border-border/50">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-primary" />
                                <SelectValue placeholder="Sort By" />
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="popular">Most Popular</SelectItem>
                            <SelectItem value="newest">Newest First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </motion.div>

            {/* Simplified Header - Filters removed as requested */}

            {/* Results Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <motion.div
                                key={`skeleton-${i}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <CommunitySkeleton />
                            </motion.div>
                        ))
                    ) : communities.length > 0 ? (
                        communities.map((community, index) => (
                            <motion.div
                                key={community.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <CommunityCard
                                    community={community}
                                    index={index}
                                    onJoinClick={handleJoinToggle}
                                    joining={joiningId === community.id}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full rounded-2xl border border-dashed border-border/50 bg-muted/20 p-20 text-center"
                        >
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                                <Users className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="mt-6 text-xl font-bold">No communities found</h3>
                            <p className="mt-2 text-muted-foreground mx-auto max-w-xs text-balance">
                                Try adjusting your filters or search terms to discover more spaces.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
