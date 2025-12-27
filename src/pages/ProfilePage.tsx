import { useRef, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { ProfileCard } from '@/components/profile/ProfileCard';
import { PostCard } from '@/components/posts/PostCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { Loader2, Bookmark, BarChart, UserPlus, UserCheck, Users, Layers, Trophy, FileText, Heart, MessageSquare, Settings } from "lucide-react";
import { getUserPosts, getBookmarkedPosts, getUserStats, getUserAnalytics, followUser, unfollowUser, checkIsFollowing, getTopPerformerPost } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Helper to transform Supabase user to UI user shape
const transformUser = (dbUser: any, authUser: any) => ({
  id: dbUser.id || authUser?.id,
  username: dbUser.username || "Anonymous",
  displayName: dbUser.username || "Anonymous",
  avatar: dbUser.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dbUser.username}`,
  banner_path: dbUser.banner_path || null,
  // If banner_path exists, use it to get public URL. Fallback to legacy banner_url if needed.
  bannerUrl: dbUser.banner_path
    ? supabase.storage.from('avatars').getPublicUrl(dbUser.banner_path).data.publicUrl
    : (dbUser.banner_url || null),
  bio: dbUser.bio || "No bio yet.",
  skills: dbUser.skills || [],
  joinedDate: dbUser.created_at || new Date().toISOString(),
});

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [userChallenges, setUserChallenges] = useState<any[]>([]);
  const [userBookmarks, setUserBookmarks] = useState<any[]>([]);

  // New State
  const [profileStats, setProfileStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
    saved: 0,
    challenges: 0,
    communities: 0
  });
  const [analytics, setAnalytics] = useState<any>(null);
  const [topPost, setTopPost] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const fetchProfile = async () => {
    if (!username) return;
    setLoading(true);
    try {
      // 1. Fetch user profile
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(username);
      let query = supabase.from('users').select('*');
      if (isUuid) query = query.eq('id', username);
      else query = query.eq('username', username);

      const { data: userData, error: userError } = await query.single();
      if (userError) throw userError;

      const dbUserId = userData.id;

      // 2. Fetch User Posts
      const posts = await getUserPosts(supabase, dbUserId);
      setUserPosts(posts);

      // 3. Update Profile Object
      setProfile(transformUser(userData, null));

      // 4. Fetch Real Counts
      const stats = await getUserStats(supabase, dbUserId);
      if (stats) setProfileStats(stats);

      // 5. Fetch Follow Status (if strictly strictly different user)
      if (currentUser && currentUser.id !== dbUserId) {
        const following = await checkIsFollowing(supabase, dbUserId);
        setIsFollowing(following);
      }

      // 6. Fetch Owner-Only Data
      if (currentUser?.id === dbUserId) {
        // Bookmarks
        const bookmarks = await getBookmarkedPosts(supabase);
        setUserBookmarks(bookmarks);

        // Analytics
        const analyticsData = await getUserAnalytics(supabase, dbUserId);
        setAnalytics(analyticsData);

        // Top Post
        const topPerformer = await getTopPerformerPost(supabase, dbUserId);
        setTopPost(topPerformer);
      } else {
        setUserBookmarks([]);
        setAnalytics(null);
        setTopPost(null);
      }

      // 7. Fetch Challenges (Visible to all)
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('*')
        .eq('created_by', dbUserId);
      if (challengesData) setUserChallenges(challengesData);

    } catch (error) {
      console.error("Error fetching profile", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [username, currentUser?.id]);

  const handleFollowToggle = async () => {
    if (!currentUser || !profile) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(supabase, profile.id);
        setIsFollowing(false);
        setProfileStats(prev => ({ ...prev, followers: prev.followers - 1 }));
        toast.success(`Unfollowed ${profile.username}`);
      } else {
        await followUser(supabase, profile.id);
        setIsFollowing(true);
        setProfileStats(prev => ({ ...prev, followers: prev.followers + 1 }));
        toast.success(`Following ${profile.username}`);
      }
    } catch (error) {
      toast.error("Action failed");
      console.error(error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        {/* Banner Skeleton */}
        <div className="h-48 md:h-64 w-full bg-muted rounded-xl" />

        <div className="px-4 md:px-0">
          <div className="relative -mt-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-border">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <div className="h-32 w-32 rounded-2xl bg-muted border-4 border-background" />
              <div className="space-y-3 pb-2">
                <div className="h-8 w-48 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-muted rounded" />
              <div className="h-10 w-32 bg-muted rounded" />
            </div>
          </div>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <div className="h-10 w-full bg-muted rounded" />
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 w-full bg-muted rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    // Handle new user case same as before...
    if (currentUser?.id === username) {
      return (
        <>
          <div className="max-w-4xl mx-auto space-y-4 p-8 text-center bg-muted/30 rounded-xl">
            <h3 className="text-xl font-bold">Welcome, New User!</h3>
            <p className="text-muted-foreground">Please create your profile details to get started.</p>
            <EditProfileDialog
              currentProfile={{
                username: currentUser.email?.split('@')[0] || 'User',
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`
              }}
              onProfileUpdate={fetchProfile}
            >
              <Button>Create Profile</Button>
            </EditProfileDialog>
          </div>
        </>
      );
    }
    return <><div className="text-center py-20">User not found</div></>;
  }

  const isOwner = currentUser?.id === profile?.id;

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {/* Banner */}
          <div className="relative h-48 md:h-60 w-full overflow-hidden bg-muted">
            {profile.bannerUrl ? (
              <img
                src={profile.bannerUrl}
                alt="Profile Banner"
                className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-105"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-primary/10 to-primary/5" />
            )}
          </div>

          <div className="px-6 pb-6">
            <div className="relative flex flex-col md:flex-row gap-6 items-start -mt-12 md:-mt-16">
              <div className="relative z-10 group cursor-pointer">
                <div className="h-32 w-32 rounded-full border-4 border-background bg-muted overflow-hidden shadow-sm">
                  <img
                    src={profile.avatar}
                    alt={profile.username}
                    className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                </div>
              </div>

              <div className="flex-1 space-y-4 pt-2 md:pt-16">
                {/* Top Row: Username + Edit/Follow Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.displayName || profile.username}</h1>
                    <p className="text-muted-foreground">@{profile.username}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isOwner && currentUser && (
                      <Button
                        size="sm"
                        variant={isFollowing ? "outline" : "default"}
                        onClick={handleFollowToggle}
                        disabled={followLoading}
                      >
                        {followLoading ? <Loader2 className="h-4 w-4 animate-spin" /> :
                          isFollowing ? <><UserCheck className="mr-2 h-4 w-4" /> Following</> : <><UserPlus className="mr-2 h-4 w-4" /> Follow</>}
                      </Button>
                    )}
                    {isOwner && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/settings">
                            <Settings className="h-4 w-4 mr-2" /> Settings
                          </Link>
                        </Button>
                        <EditProfileDialog
                          currentProfile={{ ...profile, avatar_url: profile.avatar }}
                          onProfileUpdate={fetchProfile}
                        >
                          <Button variant="outline" size="sm">Edit Profile</Button>
                        </EditProfileDialog>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio & Meta */}
                <div className="max-w-2xl space-y-2">
                  <p className="text-foreground/80 leading-relaxed md:text-lg">{profile.bio}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
                    {profile.location && (
                      <span className="flex items-center gap-1">📍 {profile.location}</span>
                    )}
                    <span className="flex items-center gap-1">📅 Joined {new Date(profile.joinedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-8 pt-4 border-t border-border/50">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xl">{profileStats.posts}</span>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Posts</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xl">{profileStats.followers}</span>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Followers</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xl">{profileStats.following}</span>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Following</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xl">{profileStats.challenges}</span>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Challenges</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-xl">{profileStats.communities}</span>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Communities</span>
                  </div>
                  {isOwner && (
                    <div className="flex flex-col items-center text-primary/80">
                      <span className="font-bold text-xl">{profileStats.saved}</span>
                      <span className="text-muted-foreground text-xs uppercase tracking-wider font-medium">Saved</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Closing Header Container */}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-lg w-full justify-start overflow-x-auto">
            <TabsTrigger value="posts" className="gap-2"><FileText className="h-4 w-4" /> Posts</TabsTrigger>
            <TabsTrigger value="challenges" className="gap-2"><Trophy className="h-4 w-4" /> Challenges</TabsTrigger>
            <TabsTrigger value="communities" className="gap-2"><Layers className="h-4 w-4" /> Communities</TabsTrigger>
            {isOwner && <TabsTrigger value="saved" className="gap-2"><Bookmark className="h-4 w-4" /> Saved</TabsTrigger>}
            {isOwner && <TabsTrigger value="analytics" className="gap-2"><BarChart className="h-4 w-4" /> Analytics</TabsTrigger>}
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {userPosts.length > 0 ? (
              userPosts.map((post, index) => (
                <PostCard key={post.id} post={post} index={index} variant="compact" />
              ))
            ) : (
              <div className="col-span-full p-12 text-center border border-dashed rounded-xl">
                <p className="text-muted-foreground">No posts yet.</p>
              </div>
            )}
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="mt-6 space-y-4">
            {userChallenges.length > 0 ? (
              userChallenges.map((challenge, index) => (
                <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
              ))
            ) : (
              <div className="p-12 text-center border border-dashed rounded-xl">
                <p className="text-muted-foreground">No challenges uploaded.</p>
              </div>
            )}
          </TabsContent>

          {/* Communities Tab */}
          <TabsContent value="communities" className="mt-6">
            <div className="p-12 text-center border border-dashed rounded-xl">
              {/* Since we only have count in stats but not the list joined in existing API/UI, just showing placeholder count context */}
              <div className="flex flex-col items-center gap-2">
                <Users className="h-8 w-8 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold">Joined {profileStats.communities} Communities</h3>
                <p className="text-muted-foreground">Community list visualization coming soon.</p>
                <Button variant="outline" asChild className="mt-4">
                  <Link to="/communities">Explore Communities</Link>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Saved Tab (Owner Only) */}
          {isOwner && (
            <TabsContent value="saved" className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {userBookmarks.length > 0 ? (
                userBookmarks.map((post, index) => (
                  <PostCard key={post.id} post={post} index={index} variant="compact" />
                ))
              ) : (
                <div className="col-span-full p-12 text-center border border-dashed rounded-xl">
                  <p className="text-muted-foreground">You haven't saved any posts yet.</p>
                </div>
              )}
            </TabsContent>
          )}

          {/* Analytics Tab (Owner Only) */}
          {isOwner && analytics && (
            <TabsContent value="analytics" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-card to-card/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                    <Heart className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{analytics.totalLikes}</div>
                    <p className="text-xs text-muted-foreground mt-1">Across all content</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-card to-card/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{analytics.totalComments}</div>
                    <p className="text-xs text-muted-foreground mt-1">Direct feedback received</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-card to-card/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Saves</CardTitle>
                    <Bookmark className="h-4 w-4 text-yellow-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{analytics.totalBookmarks}</div>
                    <p className="text-xs text-muted-foreground mt-1">Most valuable interactions</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-card to-secondary/10 border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-medium">Engagement Score</CardTitle>
                      <div className="group relative">
                        <div className="cursor-help rounded-full bg-muted h-4 w-4 flex items-center justify-center text-[10px] font-bold">?</div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-popover text-popover-foreground text-[10px] rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-border">
                          Engagement = (Likes × 1) + (Comments × 2) + (Saves × 3).
                          Calculated instantly from your real activity.
                        </div>
                      </div>
                    </div>
                    <BarChart className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-primary">{analytics.avgEngagement}</div>
                    <p className="text-xs text-muted-foreground mt-1 italic">Average weight per post</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Performer */}
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      Top Performer
                    </CardTitle>
                    <CardDescription>Your post with the highest engagement score.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {topPost ? (
                      <div className="space-y-4">
                        <PostCard post={topPost} index={0} variant="compact" />
                        <div className="p-3 bg-muted/40 rounded-lg space-y-2">
                          <div className="flex justify-between text-xs font-medium">
                            <span>Engagement Score</span>
                            <span className="text-primary font-bold">{topPost.engagement_score}</span>
                          </div>
                          <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                            <div className="bg-primary h-full" style={{ width: '100%' }} />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-40 flex items-center justify-center text-muted-foreground italic text-sm">
                        No top posts found yet
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Efficiency Stats */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Content Efficiency</CardTitle>
                    <CardDescription>How your content performs at a glance.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Post Consistency</span>
                        <span className="font-bold">{analytics.totalPosts} total</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold">Likes Received</p>
                        <p className="text-xl font-bold">{analytics.totalLikes}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold">Comm. Received</p>
                        <p className="text-xl font-bold">{analytics.totalComments}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                      <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                        <Settings className="h-4 w-4" />
                        Analytics Strategy
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Your analytics are pre-computed on the server for <strong>sub-50ms</strong> load times.
                        Metric updates happen in real-time as interactions occur, ensuring total accuracy with zero performance overhead.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

        </Tabs>
      </div>
    </>
  );
};

export default ProfilePage;
