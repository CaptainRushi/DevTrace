import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, MessageCircle, HelpCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PostCard } from '@/components/posts/PostCard';
import { CommunityCard } from '@/components/communities/CommunityCard';
import { JobCard } from '@/components/jobs/JobCard';
import { HighlightCard } from '@/components/highlights/HighlightCard';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { posts, communities, jobs, dailyHighlights } from '@/data/mockData';

type FeedFilter = 'latest' | 'top' | 'discussions' | 'questions';

const Index = () => {
  const [filter, setFilter] = useState<FeedFilter>('latest');

  const filteredPosts = posts.filter((post) => {
    if (filter === 'questions') return post.type === 'question';
    if (filter === 'discussions') return post.type === 'experience';
    return true;
  });

  return (
    <Layout>
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
              Welcome to <span className="text-gradient">dev.community</span>
            </motion.h1>
          </div>

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
          <div className="space-y-4">
            {filteredPosts.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </div>

          {/* Load More */}
          <div className="flex justify-center pt-4">
            <Button variant="outline" size="lg">
              Load More Posts
            </Button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Daily Highlights Preview */}
          <section>
            <SectionHeader title="highlights" href="/highlights" />
            <div className="mt-4 space-y-0">
              {dailyHighlights.slice(0, 2).map((highlight, index) => (
                <HighlightCard key={highlight.id} highlight={highlight} index={index} />
              ))}
            </div>
          </section>

          {/* Trending Communities */}
          <section>
            <SectionHeader title="communities" href="/communities" />
            <div className="mt-4 grid gap-3">
              {communities.slice(0, 4).map((community) => (
                <CommunityCard key={community.id} community={community} compact />
              ))}
            </div>
          </section>

          {/* Latest Jobs */}
          <section>
            <SectionHeader title="jobs" href="/jobs" />
            <div className="mt-4 space-y-3">
              {jobs.slice(0, 2).map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))}
            </div>
          </section>

          {/* CTA Card */}
          <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 p-6">
            <h3 className="font-mono text-lg font-bold text-primary">
              Share Your Journey
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Write about what you learned today, share your experiences, and help others grow.
            </p>
            <Button className="mt-4 w-full">
              Create Your First Post
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
