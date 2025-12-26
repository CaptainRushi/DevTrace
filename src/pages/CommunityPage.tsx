import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, FileText, ArrowRight, Filter } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PostCard } from '@/components/posts/PostCard';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Button } from '@/components/ui/button';
import { communities, posts } from '@/data/mockData';

const CommunityPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const community = communities.find((c) => c.slug === slug);

  if (!community) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Community not found</p>
        </div>
      </Layout>
    );
  }

  const communityPosts = posts.filter((p) => p.community.slug === slug);

  return (
    <Layout>
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
                  {community.memberCount.toLocaleString()} members
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  {community.postCount.toLocaleString()} posts
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {community.tags.map((tag) => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="gap-2">
                Join Community
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Posts Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <SectionHeader title="posts" />
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>

          <div className="space-y-4">
            {communityPosts.length > 0 ? (
              communityPosts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <p className="text-muted-foreground">No posts in this community yet.</p>
                <Button className="mt-4">Be the first to post</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CommunityPage;
