import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, MessageCircle, HelpCircle, Loader2, Zap, Briefcase, Layers } from 'lucide-react';
import { techStackData } from '@/data/techStack';
import { Link, useSearchParams } from 'react-router-dom';

import { PostCard } from '@/components/posts/PostCard';
import { CommunityCard } from '@/components/communities/CommunityCard';
import { JobCard } from '@/components/jobs/JobCard';
import { HighlightCard } from '@/components/highlights/HighlightCard';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { getPosts, getDailyHighlights } from '@/services/api';
import { DailyHighlightWidget } from '@/components/highlights/DailyHighlightWidget';
import { PostSkeleton, CommunitySkeleton, JobSkeleton, HighlightSkeleton } from '@/components/common/Skeletons';
import { useAuth } from '@/contexts/AuthContext';
import { GuestAccessPrompt } from '@/components/common/GuestAccessPrompt';

type FeedFilter = 'latest' | 'top' | 'discussions' | 'questions';

const Index = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const hashtagFilter = searchParams.get('hashtag');
  const [filter, setFilter] = useState<FeedFilter>('latest');

  // 1. Fetch Posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['posts', filter, hashtagFilter],
    queryFn: async () => {
      const postsData = await getPosts(supabase);
      return postsData;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // 2. Fetch Communities (Featured Top 4)
  const { data: communities = [], isLoading: commsLoading } = useQuery({
    queryKey: ['featured-communities'],
    queryFn: async () => {
      const { data: commData, error } = await supabase
        .from('communities')
        .select('*, members:community_members(count)')
        .eq('is_featured', true)
        .limit(4);

      if (error) throw error;

      return (commData || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        memberCount: c.members?.[0]?.count || 0,
        icon: c.icon || '🌍'
      }));
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // 3. Fetch Highlights (Top 3)
  const { data: highlights = [], isLoading: highlightsLoading } = useQuery({
    queryKey: ['recent-highlights'],
    queryFn: async () => {
      return await getDailyHighlights(supabase);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // 4. Fetch Jobs (Top 3)
  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['recent-jobs'],
    queryFn: async () => {
      const { data: jobData, error } = await supabase
        .from('job_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      return (jobData || []).map(j => ({
        id: j.id,
        title: j.role,
        company: j.company,
        logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(j.company)}&background=random`,
        type: j.type || 'full-time',
        location: j.location,
        salary: 'Competitive',
        tags: j.stack || [],
        postedAt: j.created_at
      }));
    },
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const loading = postsLoading; // Primary loading state for the main feed

  const filteredPosts = useMemo(() => {
    return posts.filter((post: any) => {
      if (hashtagFilter) {
        return post.hashtags?.includes(hashtagFilter);
      }
      if (filter === 'questions') return post.type === 'question';
      if (filter === 'discussions') return post.type === 'journey';
      return true;
    });
  }, [posts, hashtagFilter, filter]);

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Feed Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-foreground"
            >
              Welcome to <span className="text-gradient">DevTrace</span>
            </motion.h1>
          </div>

          <DailyHighlightWidget />

          {hashtagFilter && (
            <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg border border-primary/20 text-primary">
              <span className="font-semibold">Filtering by: {hashtagFilter}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 px-2 hover:bg-transparent"
                onClick={() => setSearchParams({})}
              >
                Clear
              </Button>
            </div>
          )}

          {/* Filter Tabs */}
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FeedFilter)}>
            <TabsList className="bg-muted">
              <TabsTrigger value="latest" className="gap-1.5">
                <Clock className="h-4 w-4" />
                Latest
              </TabsTrigger>
              <TabsTrigger value="top" className="gap-1.5">
                <TrendingUp className="h-4 w-4" />
                Top
              </TabsTrigger>
              <TabsTrigger value="discussions" className="gap-1.5">
                <MessageCircle className="h-4 w-4" />
                Discussions
              </TabsTrigger>
              <TabsTrigger value="questions" className="gap-1.5">
                <HelpCircle className="h-4 w-4" />
                Questions
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Posts Feed */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="space-y-4">
              {filteredPosts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <MessageCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No posts yet</h3>
              <p className="mt-2 text-muted-foreground">
                Be the first to share something with the community!
              </p>
              <Link to="/create">
                <Button className="mt-6">Create Post</Button>
              </Link>
            </div>
          )}

          {/* Load More or Guest Prompt */}
          {!loading && posts.length > 0 && (
            <div className="flex justify-center pt-4">
              {user ? (
                <Button variant="outline" size="lg">
                  Load More Posts
                </Button>
              ) : (
                <GuestAccessPrompt />
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">

          {/* Daily Highlights */}
          <section>
            <SectionHeader title="daily highlights" href="/highlights" icon={<Zap className="h-4 w-4 text-primary" />} />
            {highlightsLoading ? (
              <div className="mt-4 space-y-4 relative pl-4 border-l border-border">
                {[...Array(3)].map((_, i) => <HighlightSkeleton key={i} />)}
              </div>
            ) : highlights.length > 0 ? (
              <div className="mt-4 relative pl-4 border-l border-border space-y-6">
                {highlights.map((highlight, index) => (
                  <HighlightCard key={highlight.id} highlight={highlight} index={index} />
                ))}
              </div>
            ) : (
              <div className="mt-4 p-4 text-center border rounded-lg border-dashed text-xs text-muted-foreground">
                No highlights today.
              </div>
            )}
          </section>

          {/* Trending Communities */}
          <section>
            <SectionHeader title="communities" href="/communities" />
            {commsLoading ? (
              <div className="mt-4 grid gap-3">
                {[...Array(4)].map((_, i) => <CommunitySkeleton key={i} compact />)}
              </div>
            ) : communities.length > 0 ? (
              <div className="mt-4 grid gap-3">
                {communities.map((community: any) => (
                  <CommunityCard key={community.id} community={community} compact />
                ))}
              </div>
            ) : (
              <div className="mt-4 p-6 text-center border rounded-lg border-dashed">
                <p className="text-muted-foreground text-sm">No communities found.</p>
              </div>
            )}
          </section>

          {/* Jobs */}
          <section>
            <SectionHeader title="latest jobs" href="/jobs" icon={<Briefcase className="h-4 w-4 text-primary" />} />
            {jobsLoading ? (
              <div className="mt-4 grid gap-3">
                {[...Array(2)].map((_, i) => <JobSkeleton key={i} />)}
              </div>
            ) : jobs.length > 0 ? (
              <div className="mt-4 grid gap-3">
                {jobs.map((job: any, index: number) => (
                  <div key={job.id} className="scale-90 origin-top-left -mb-6">
                    {/* Trying to compact render by scaling or just standard */}
                    <JobCard key={job.id} job={job} index={index} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 p-4 text-center border rounded-lg border-dashed text-xs text-muted-foreground">
                No jobs currently listed.
              </div>
            )}
          </section>

          {/* Tech Stack Preview */}
          <section>
            <SectionHeader title="built with" href="/tools" icon={<Layers className="h-4 w-4 text-primary" />} />
            <div className="mt-4 flex flex-wrap gap-2">
              {techStackData
                .flatMap(cat => cat.items)
                .filter(item => ['React', 'Supabase', 'Tailwind CSS', 'Vite', 'TypeScript', 'Vercel'].includes(item.name))
                .slice(0, 8)
                .map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <div
                      key={tool.name}
                      className="flex items-center justify-center h-10 w-10 rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                      title={tool.name}
                    >
                      {Icon && <Icon className="h-5 w-5" />}
                    </div>
                  );
                })}
              <Link to="/tools" className="flex items-center justify-center h-10 w-10 rounded-lg border border-dashed border-border bg-muted/50 text-xs text-muted-foreground hover:text-primary transition-colors">
                +More
              </Link>
            </div>
          </section>

          {/* CTA Card */}

        </div>
      </div>
    </>
  );
};
export default Index;
