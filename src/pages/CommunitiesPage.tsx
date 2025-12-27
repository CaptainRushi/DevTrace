import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Loader2 } from 'lucide-react';
import { CommunityCard } from '@/components/communities/CommunityCard';
import { CommunitySkeleton } from '@/components/common/Skeletons';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function CommunitiesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: communities = [], isLoading: loading } = useQuery({
        queryKey: ['all-communities', user?.id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('communities')
                .select('*')
                .order('is_featured', { ascending: false });

            if (error) throw error;

            const communitiesWithCounts = await Promise.all(data.map(async (c: any) => {
                const { count } = await supabase
                    .from('community_members')
                    .select('*', { count: 'exact', head: true })
                    .eq('community_id', c.id);

                const { count: postsCount } = await supabase
                    .from('posts')
                    .select('*', { count: 'exact', head: true })
                    .eq('community_id', c.id);

                let isJoined = false;
                if (user) {
                    const { data: memberData } = await supabase
                        .from('community_members')
                        .select('community_id')
                        .eq('community_id', c.id)
                        .eq('user_id', user.id)
                        .maybeSingle();
                    isJoined = !!memberData;
                }

                return {
                    ...c,
                    memberCount: count || 0,
                    postCount: postsCount || 0,
                    tags: c.category ? [c.category] : [],
                    isJoined
                };
            }));

            return communitiesWithCounts;
        },
        staleTime: 1000 * 60 * 5,
    });

    const handleJoinToggle = async (communityId: string) => {
        if (!user) {
            toast.error("Please sign in to join communities");
            return;
        }

        const communityIndex = communities.findIndex((c: any) => c.id === communityId);
        if (communityIndex === -1) return;
        const community = communities[communityIndex];
        const isJoined = community.isJoined;

        setJoiningId(communityId);

        try {
            if (isJoined) {
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

            // Optimistic update using React Query
            queryClient.setQueryData(['all-communities', user?.id], (old: any) => {
                return old.map((c: any) => {
                    if (c.id === communityId) {
                        return {
                            ...c,
                            isJoined: !isJoined,
                            memberCount: isJoined ? c.memberCount - 1 : c.memberCount + 1
                        };
                    }
                    return c;
                });
            });

            // Also invalidate sidebar communities if they exist in cache
            queryClient.invalidateQueries({ queryKey: ['communities-sidebar'] });

        } catch (error) {
            console.error("Error toggling join", error);
            toast.error("Failed to update membership");
        } finally {
            setJoiningId(null);
        }
    };

    const filteredCommunities = useMemo(() => {
        return communities.filter((c: any) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [communities, searchQuery]);

    return (
        <>
            <div className="space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Communities</h1>
                            <p className="text-muted-foreground">Join the conversation in your favorite domains</p>
                        </div>
                    </div>
                </motion.div>

                {/* Search */}
                <div className="max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Find a community..."
                            className="pl-10 bg-muted"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <CommunitySkeleton key={i} />
                        ))
                    ) : filteredCommunities.length > 0 ? (
                        filteredCommunities.map((community, index) => (
                            <CommunityCard
                                key={community.id}
                                community={community}
                                index={index}
                                onJoinClick={handleJoinToggle}
                                joining={joiningId === community.id}
                            />
                        ))
                    ) : (
                        <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center">
                            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-4 text-lg font-semibold text-foreground">No communities found</h3>
                            <p className="mt-2 text-muted-foreground">Try adjusting your search</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
