
import { SupabaseClient } from '@supabase/supabase-js';
// import { Database } from '../types/supabase';

export type Profile = {
    id: string;
    username: string;
    displayName?: string; // Mapped property
    avatar_url: string;
    banner_path?: string | null;
    bio: string | null;
    skills: string[];
    created_at: string;
};

export type Community = {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    category: string | null;
};

export type Post = {
    id: string;
    title: string;
    content: string;
    type: 'journey' | 'question' | 'tool' | 'job' | 'challenge' | 'highlight';
    created_at: string;
    author: Profile;
    community: Community;
    likes_count: number;
    comments_count: number;
    hashtags: string[];
    isLiked: boolean;
    isBookmarked: boolean;
    cover_image_url?: string;
};

// Helper to fetch posts with relations
export async function getPosts(supabase: SupabaseClient) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('posts')
        .select(`
      *,
      author:users!posts_user_id_fkey(*),
      community:communities!posts_community_id_fkey(*),
      user_vote:votes(value),
      user_bookmark:post_bookmarks(user_id)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', error);
        return [];
    }

    // Transform data to match UI needs
    // Transform data to match UI needs
    return data.map((post: any) => transformPost(post, user));
}

// Reusable transform function to keep consistent
export function transformPost(post: any, user: any) {
    const isLiked = user ? post.user_vote?.some((v: any) => v.value === 1) : false;
    const isBookmarked = user ? post.user_bookmark?.some((b: any) => b.user_id === user.id) : false;

    return {
        id: post.id,
        title: post.title,
        content: post.content,
        cover_image_url: post.cover_image_url,
        type: post.type,
        created_at: post.created_at,
        author: {
            id: post.author?.id,
            username: post.author?.username || 'Unknown',
            displayName: post.author?.username || 'Unknown',
            avatar: post.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username || 'unknown'}`,
        },
        community: {
            id: post.community?.id,
            name: post.community?.name || 'General',
            slug: post.community?.slug || 'general',
            icon: '🌍',
        },
        excerpt: post.content?.substring(0, 200) + (post.content?.length > 200 ? '...' : ''),
        readTime: Math.ceil((post.content?.length || 0) / 1000) || 1,
        likes: post.likes_count || 0,
        comments: post.comments_count || 0,
        bookmarks: post.bookmarks_count || 0,
        engagement_score: post.engagement_score || 0,
        hashtags: post.hashtags || [],
        views: 0,
        isLiked,
        isBookmarked
    };
}

export async function getUserPosts(supabase: SupabaseClient, userId: string) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:users!posts_user_id_fkey(*),
            community:communities!posts_community_id_fkey(*),
            user_vote:votes(value),
            user_bookmark:post_bookmarks(user_id)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user posts:', error);
        return [];
    }

    return data.map(post => transformPost(post, user));
}

export async function getBookmarkedPosts(supabase: SupabaseClient) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('post_bookmarks')
        .select(`
            post:posts (
                *,
                author:users!posts_user_id_fkey(*),
                community:communities!posts_community_id_fkey(*),
                user_vote:votes(value),
                user_bookmark:post_bookmarks(user_id)
            )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching bookmarks:', error);
        return [];
    }

    // Flatten structure since we select post:*
    // Flatten structure since we select post:*
    return data.map((item: any) => transformPost(item.post, user));
}

export async function getCommunityPosts(supabase: SupabaseClient, communityId: string) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:users!posts_user_id_fkey(*),
            community:communities!posts_community_id_fkey(*),
            user_vote:votes(value),
            user_bookmark:post_bookmarks(user_id)
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching community posts:', error);
        return [];
    }

    return data.map(post => transformPost(post, user));
}

export async function toggleLike(supabase: SupabaseClient, postId: string, currentLikeStatus: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in");

    if (currentLikeStatus) {
        // Unlike: Remove vote
        return await supabase.from('votes').delete().match({ post_id: postId, user_id: user.id });
    } else {
        // Like: Add vote
        return await supabase.from('votes').upsert({ post_id: postId, user_id: user.id, value: 1 });
    }
}

export async function toggleBookmark(supabase: SupabaseClient, postId: string, currentBookmarkStatus: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in");

    if (currentBookmarkStatus) {
        // Unbookmark
        return await supabase.from('post_bookmarks').delete().match({ post_id: postId, user_id: user.id });
    } else {
        // Bookmark
        return await supabase.from('post_bookmarks').insert({ post_id: postId, user_id: user.id });
    }
}

export type OpenSourceProject = {
    id: string;
    project_name: string;
    repo_url: string;
    description: string;
    tech_stack: string[];
    contribution_type: 'Beginner-friendly' | 'Good first issue' | 'Actively maintained' | string;
    license?: string;
    hashtags: string[];
    created_at: string;
    created_by: string; // userId
    author?: Profile;
};

export async function getOpenSourceProjects(supabase: SupabaseClient) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('open_source_projects')
        .select(`
      *,
      author:users!open_source_projects_created_by_fkey(username, avatar_url)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching open source projects:', error);
        return [];
    }

    // Map to match type if necessary, usually standard
    return data.map((project: any) => ({
        ...project,
        author: {
            username: project.author?.username || 'Unknown',
            displayName: project.author?.username || 'Unknown',
            avatar: project.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.author?.username || 'unknown'}`,
        }
    }));
}

export async function createOpenSourceProject(supabase: SupabaseClient, project: Omit<OpenSourceProject, 'id' | 'created_at' | 'author' | 'created_by'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in");

    const { data, error } = await supabase
        .from('open_source_projects')
        .insert({
            ...project,
            created_by: user.id
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export type ProjectContribution = {
    id: string;
    project_id: string;
    user_id: string;
    contribution_type: 'Issue' | 'PR' | 'Idea' | 'Docs' | 'Other';
    reference_url?: string;
    description?: string;
    status: 'submitted' | 'accepted' | 'rejected' | 'merged';
    created_at: string;
    contributor?: Profile;
};

export async function logContribution(supabase: SupabaseClient, contribution: Omit<ProjectContribution, 'id' | 'created_at' | 'status' | 'contributor'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in");

    const { data, error } = await supabase
        .from('project_contributions')
        .insert({
            ...contribution,
            user_id: user.id
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function getProjectContributions(supabase: SupabaseClient, projectId: string) {
    const { data, error } = await supabase
        .from('project_contributions')
        .select(`
            *,
            contributor:users!project_contributions_user_id_fkey(username, avatar_url)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching contributions:", error);
        return [];
    }

    return data.map((c: any) => ({
        ...c,
        contributor: {
            username: c.contributor?.username || 'Unknown',
            avatar: c.contributor?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.contributor?.username || 'unknown'}`,
        }
    }));
}

export type NotificationType = 'like' | 'comment' | 'reply' | 'bookmark' | 'contribution' | 'system';
export type EntityType = 'post' | 'comment' | 'project' | 'job' | 'challenge';

export type AppNotification = {
    id: string;
    user_id: string;
    actor_id?: string;
    type: NotificationType;
    entity_id: string;
    entity_type: EntityType;
    is_read: boolean;
    message?: string;
    created_at: string;
    actor?: Profile;
};

export async function createNotification(
    supabase: SupabaseClient,
    notification: Omit<AppNotification, 'id' | 'created_at' | 'is_read' | 'actor'>
) {
    // Don't notify yourself
    if (notification.user_id === notification.actor_id) return;

    const { error } = await supabase
        .from('notifications')
        .insert(notification);

    if (error) console.error("Error creating notification:", error);
}

export async function getNotifications(supabase: SupabaseClient) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('notifications')
        .select(`
            *,
            actor:users!notifications_actor_id_fkey(username, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }

    return data.map((n: any) => ({
        ...n,
        actor: n.actor ? {
            username: n.actor.username || 'Unknown',
            avatar: n.actor.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${n.actor.username || 'unknown'}`,
        } : undefined
    }));
}

export async function markNotificationAsRead(supabase: SupabaseClient, notificationId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

    if (error) console.error("Error marking notification read:", error);
}

export async function markAllNotificationsAsRead(supabase: SupabaseClient) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false); // Only update unread ones

    if (error) console.error("Error marking all read:", error);
}

// Search Function
export async function globalSearch(supabase: SupabaseClient, query: string) {
    if (!query) return { posts: [], users: [], communities: [], projects: [] };

    // This is a naive parallel search. For better performance use a dedicated RPC or FTS function.
    // Searching posts
    const postsPromise = supabase
        .from('posts')
        .select('id, title, content, type, created_at')
        .ilike('title', `%${query}%`)
        .limit(5);

    // Searching users
    const usersPromise = supabase
        .from('users')
        .select('id, username, avatar_url, bio')
        .ilike('username', `%${query}%`)
        .limit(5);

    // Searching communities
    const communitiesPromise = supabase
        .from('communities')
        .select('id, name, slug, description, icon')
        .ilike('name', `%${query}%`)
        .limit(5);

    // Searching projects
    const projectsPromise = supabase
        .from('open_source_projects')
        .select('id, project_name, description, repo_url')
        .ilike('project_name', `%${query}%`)
        .limit(5);

    const [posts, users, communities, projects] = await Promise.all([
        postsPromise,
        usersPromise,
        communitiesPromise,
        projectsPromise
    ]);

    return {
        posts: posts.data || [],
        users: users.data || [],
        communities: communities.data || [],
        projects: projects.data || []
    };
}

export type UserSettings = {
    user_id: string;
    notification_preferences: {
        likes: boolean;
        comments: boolean;
        replies: boolean;
        contributions: boolean;
        system: boolean;
    };
    privacy_preferences: {
        profile_visibility: 'public' | 'limited';
        show_email: boolean;
        allow_messages: boolean;
        show_activity: boolean;
    };
    appearance_preferences: {
        theme: 'light' | 'dark' | 'system';
        sidebar_collapsed: boolean;
        reduced_motion: boolean;
    };
    updated_at: string;
};

// Default settings if row is missing
const defaultSettings: UserSettings = {
    user_id: '',
    notification_preferences: { likes: true, comments: true, replies: true, contributions: true, system: true },
    privacy_preferences: { profile_visibility: 'public', show_email: false, allow_messages: true, show_activity: true },
    appearance_preferences: { theme: 'system', sidebar_collapsed: false, reduced_motion: false },
    updated_at: new Date().toISOString()
};

export async function getUserSettings(supabase: SupabaseClient) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') { // Ignore not found error
        console.error("Error fetching settings:", error);
    }

    // Merge with defaults
    return {
        ...defaultSettings,
        ...(data || {}),
        user_id: user.id
    } as UserSettings;
}

export async function updateUserSettings(supabase: SupabaseClient, settings: Partial<UserSettings>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in");

    // Remove immutable fields
    const { user_id, updated_at, ...updates } = settings as any;

    const { error } = await supabase
        .from('user_settings')
        .upsert({
            user_id: user.id,
            ...updates,
            updated_at: new Date().toISOString()
        });

    if (error) throw error;
}

// --- Profile & Social Features ---

export async function followUser(supabase: SupabaseClient, targetUserId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in");

    const { error } = await supabase
        .from('followers')
        .insert({ follower_id: user.id, following_id: targetUserId });

    if (error) throw error;

    // Create notification
    await createNotification(supabase, {
        user_id: targetUserId,
        actor_id: user.id,
        type: 'system', // or 'follow' if we added it to enum, defaulting to system for now
        entity_id: user.id,
        entity_type: 'post', // Fallback, technically 'user' but schema might restrict.
        message: 'started following you',
        // created_at is automatic, is_read is false by default
    });
}

export async function unfollowUser(supabase: SupabaseClient, targetUserId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in");

    const { error } = await supabase
        .from('followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

    if (error) throw error;
}

export async function checkIsFollowing(supabase: SupabaseClient, targetUserId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
        .from('followers')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .maybeSingle();

    if (error) return false;
    return !!data;
}

export async function getUserStats(supabase: SupabaseClient, userId: string) {
    if (!userId) return null;

    // Single row fetch from users table - sub-5ms performance
    const { data, error } = await supabase
        .from('users')
        .select('posts_count, likes_received, comments_received, bookmarks_received')
        .eq('id', userId)
        .single();

    if (error || !data) {
        return {
            posts: 0,
            followers: 0,
            following: 0,
            saved: 0,
            challenges: 0,
            communities: 0
        };
    }

    // Dynamic stats that might not be pre-computed yet or are private/sensitive
    const followersPromise = supabase.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', userId);
    const followingPromise = supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
    const challengesPromise = supabase.from('challenges').select('*', { count: 'exact', head: true }).eq('created_by', userId);
    const communitiesPromise = supabase.from('community_members').select('*', { count: 'exact', head: true }).eq('user_id', userId);

    const [followers, following, challenges, communities] = await Promise.all([
        followersPromise,
        followingPromise,
        challengesPromise,
        communitiesPromise
    ]);

    return {
        posts: data.posts_count || 0,
        followers: followers.count || 0,
        following: following.count || 0,
        saved: data.bookmarks_received || 0,
        challenges: challenges.count || 0,
        communities: communities.count || 0
    };
}

export async function getUserAnalytics(supabase: SupabaseClient, userId: string) {
    // Single row fetch from users table - extremely fast and scalable
    const { data, error } = await supabase
        .from('users')
        .select('posts_count, likes_received, comments_received, bookmarks_received')
        .eq('id', userId)
        .single();

    if (error || !data) {
        return { totalLikes: 0, totalComments: 0, totalBookmarks: 0, avgEngagement: 0, totalPosts: 0 };
    }

    const totalEngagement = (data.likes_received * 1) + (data.comments_received * 2) + (data.bookmarks_received * 3);
    const avgEngagement = data.posts_count > 0 ? (totalEngagement / data.posts_count).toFixed(1) : 0;

    return {
        totalLikes: data.likes_received,
        totalComments: data.comments_received,
        totalBookmarks: data.bookmarks_received,
        avgEngagement,
        totalPosts: data.posts_count
    };
}

export async function getTopPerformerPost(supabase: SupabaseClient, userId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:users!posts_user_id_fkey(*),
            community:communities!posts_community_id_fkey(*),
            user_vote:votes(value),
            user_bookmark:post_bookmarks(user_id)
        `)
        .eq('user_id', userId)
        .order('engagement_score', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) return null;
    return transformPost(data, user);
}
