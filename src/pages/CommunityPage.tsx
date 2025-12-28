import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, FileText, ArrowRight, Filter, Loader2, Plus } from 'lucide-react';

import { PostCard } from '@/components/posts/PostCard';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { supabase } from "@/lib/supabase";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PostSkeleton, CommunityHeaderSkeleton } from '@/components/common/Skeletons';
import { GuestAccessPrompt } from '@/components/common/GuestAccessPrompt';

// Helper
import { getCommunityPosts } from '@/services/api';

const CommunityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [joining, setJoining] = useState(false);

  const { data: community, isLoading: communityLoading } = useQuery({
    queryKey: ['community', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return {
        ...data,
        icon: data.icon || '🚀'
      };
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 10, // 10 mins
  });

  const { data: memberStats, isLoading: statsLoading } = useQuery({
    queryKey: ['community-stats', community?.id],
    queryFn: async () => {
      if (!community?.id) return { memberCount: 0, isMember: false };

      const [countRes, memberRes] = await Promise.all([
        supabase
          .from('community_members')
          .select('*', { count: 'exact', head: true })
          .eq('community_id', community.id),
        user ? supabase
          .from('community_members')
          .select('*')
          .eq('community_id', community.id)
          .eq('user_id', user.id)
          .single() : Promise.resolve({ data: null })
      ]);

      return {
        memberCount: countRes.count || 0,
        isMember: !!memberRes.data
      };
    },
    enabled: !!community?.id,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['community-posts', community?.id],
    queryFn: async () => {
      if (!community?.id) return [];
      return await getCommunityPosts(supabase, community.id);
    },
    enabled: !!community?.id,
  });

  const handleJoin = async () => {
    if (!user) {
      toast.error("Please sign in to join");
      return;
    }
    if (!community) return;

    setJoining(true);
    try {
      if (memberStats?.isMember) {
        await supabase.from('community_members').delete().match({ user_id: user.id, community_id: community.id });
        toast.success("Left community");
      } else {
        await supabase.from('community_members').insert({ user_id: user.id, community_id: community.id });
        toast.success("Joined community!");
      }
      queryClient.invalidateQueries({ queryKey: ['community-stats', community.id] });
      queryClient.invalidateQueries({ queryKey: ['communities-sidebar'] });
    } catch (e) {
      toast.error("Action failed");
    } finally {
      setJoining(false);
    }
  };

  if (communityLoading) {
    return (
      <div className="space-y-8">
        <CommunityHeaderSkeleton />
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <SectionHeader title="posts" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <PostSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Community not found</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Community Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 lg:p-8"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted text-5xl">
              {community.icon}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground">{community.name}</h1>
              <p className="mt-2 text-lg text-muted-foreground">{community.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {statsLoading ? <div className="h-4 w-12 bg-muted animate-pulse rounded" /> : (memberStats?.memberCount || 0).toLocaleString()} members
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  {postsLoading ? <div className="h-4 w-12 bg-muted animate-pulse rounded" /> : (community.posts_count || 0).toLocaleString()} posts
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="gap-2"
                onClick={handleJoin}
                variant={memberStats?.isMember ? "outline" : "default"}
                disabled={joining || statsLoading}
              >
                {joining ? <Loader2 className="h-4 w-4 animate-spin" /> :
                  memberStats?.isMember ? "Joined" : "Join Community"}
                {!memberStats?.isMember && !joining && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Posts Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <SectionHeader title="posts" />
            <div className="flex gap-2">
              <Link to={`/create?community=${slug}`}>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Post
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {postsLoading ? (
              [...Array(4)].map((_, i) => <PostSkeleton key={i} />)
            ) : posts.length > 0 ? (
              posts.map((post: any, index: number) => (
                <PostCard key={post.id} post={post} index={index} variant="compact" />
              ))
            ) : (
              <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center">
                <p className="text-muted-foreground">No posts in this community yet.</p>
                <Link to={`/create?community=${slug}`}>
                  <Button className="mt-4">Be the first to post</Button>
                </Link>
              </div>
            )}
          </div>

          {!postsLoading && posts.length > 0 && !user && (
            <div className="mt-8">
              <GuestAccessPrompt />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CommunityPage;
