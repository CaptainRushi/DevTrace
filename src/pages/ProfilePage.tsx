import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { ProfileCard } from '@/components/profile/ProfileCard';
import { PostCard } from '@/components/posts/PostCard';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { users, posts, challenges } from '@/data/mockData';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const user = users.find((u) => u.username === username) || users[0];
  const userPosts = posts.filter((p) => p.author.username === user.username);
  const userChallenges = challenges.filter((c) => c.author.username === user.username);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ProfileCard user={user} />
        </motion.div>

        {/* Content Tabs */}
        <Tabs defaultValue="posts">
          <TabsList className="bg-muted">
            <TabsTrigger value="posts">Posts ({userPosts.length})</TabsTrigger>
            <TabsTrigger value="challenges">Challenges ({userChallenges.length})</TabsTrigger>
            <TabsTrigger value="communities">Communities (12)</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6 space-y-4">
            {userPosts.length > 0 ? (
              userPosts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <p className="text-muted-foreground">No posts yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="challenges" className="mt-6 space-y-4">
            {userChallenges.length > 0 ? (
              userChallenges.map((challenge, index) => (
                <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-border p-12 text-center">
                <p className="text-muted-foreground">No challenges created yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="communities" className="mt-6">
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">Communities feature coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProfilePage;
