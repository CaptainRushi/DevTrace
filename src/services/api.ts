
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
    description: string;
    category: string | null;
    member_count?: number;
    memberCount: number;
    is_featured: boolean;
    icon: string;
    isJoined?: boolean;
    postCount?: number;
    tags?: string[];
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

const MAX_GUEST_POSTS = 5;

// Helper to fetch posts with relations
export async function getPosts(supabase: SupabaseClient) {
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
        .from('posts')
        .select(`
      *,
      author:users!posts_user_id_fkey(*),
      community:communities!posts_community_id_fkey(*),
      user_liked_post:post_likes(user_id),
      user_bookmark:post_bookmarks(user_id)
    `)
        .order('created_at', { ascending: false });

    if (!user) {
        query = query.limit(MAX_GUEST_POSTS);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching posts:', error);
        return [];
    }

    // Transform data to match UI needs
    return data.map((post: any) => transformPost(post, user));
}

// Reusable transform function to keep consistent
export function transformPost(post: any, user: any, authorOverride?: any) {
    const isLiked = user ? post.user_liked_post?.some((l: any) => l.user_id === user.id) : false;
    const isBookmarked = user ? post.user_bookmark?.some((b: any) => b.user_id === user.id) : false;

    const author = authorOverride || post.author;

    return {
        id: post.id,
        title: post.title,
        content: post.content,
        cover_image_url: post.cover_image_url,
        type: post.type,
        created_at: post.created_at,
        author: {
            id: author?.id,
            username: author?.username || 'Unknown',
            displayName: author?.username || 'Unknown',
            avatar: author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author?.username || 'unknown'}`,
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

export async function getUserPosts(supabase: SupabaseClient, userId: string, authorData?: any) {
    const { data: { user } } = await supabase.auth.getUser();

    let query = supabase
        .from('posts')
        .select(`
            *,
            community:communities!posts_community_id_fkey(*),
            user_liked_post:post_likes(user_id),
            user_bookmark:post_bookmarks(user_id)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching user posts:', error);
        return [];
    }

    return data.map(post => transformPost(post, user, authorData));
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
                user_liked_post:post_likes(user_id),
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

    let query = supabase
        .from('posts')
        .select(`
            *,
            author:users!posts_user_id_fkey(*),
            community:communities!posts_community_id_fkey(*),
            user_liked_post:post_likes(user_id),
            user_bookmark:post_bookmarks(user_id)
        `)
        .eq('community_id', communityId)
        .order('created_at', { ascending: false });

    if (!user) {
        query = query.limit(MAX_GUEST_POSTS);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching community posts:', error);
        return [];
    }

    return data.map(post => transformPost(post, user));
}

export async function toggleLike(supabase: SupabaseClient, postId: string, currentLikeStatus: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in");

    // Use RPC for atomic, permission-safe, idempotent operation
    // We pass `!currentLikeStatus` because if it WAS liked (true), we want to UNLIKE (false)
    const shouldLike = !currentLikeStatus;

    const { error } = await supabase.rpc('toggle_like', {
        target_post_id: postId,
        should_like: shouldLike
    });

    if (error) {
        console.error("Toggle Like RPC Error:", error);
        throw error;
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

export async function deletePost(supabase: SupabaseClient, postId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in");

    // First check if user is owner or admin (backend RLS should also handle this)
    // For now we just attempt the delete, RLS should block if unauthorized
    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

    if (error) throw error;
    return true;
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
    star_count?: number;
    isStarred?: boolean;
};

export async function getOpenSourceProjects(supabase: SupabaseClient) {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('open_source_projects')
        .select(`
      *,
      author:users!open_source_projects_created_by_fkey(username, avatar_url),
      user_star:open_source_stars(user_id)
    `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching open source projects:', error);
        return [];
    }

    return data.map((project: any) => ({
        ...project,
        isStarred: user ? project.user_star?.some((s: any) => s.user_id === user.id) : false,
        star_count: project.star_count || 0,
        author: {
            username: project.author?.username || 'Unknown',
            displayName: project.author?.username || 'Unknown',
            avatar: project.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.author?.username || 'unknown'}`,
        }
    }));
}

export async function toggleProjectStar(supabase: SupabaseClient, projectId: string, currentStarred: boolean) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in to star projects");

    if (currentStarred) {
        // Unstar
        const { error } = await supabase
            .from('open_source_stars')
            .delete()
            .match({ project_id: projectId, user_id: user.id });
        if (error) throw error;
    } else {
        // Star
        const { error } = await supabase
            .from('open_source_stars')
            .insert({ project_id: projectId, user_id: user.id });
        if (error) throw error;
    }
    return true;
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
    target_post_id?: string;
    target_comment_id?: string;
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in");

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id); // Ensure user owns this notification

    if (error) {
        console.error("Error marking notification read:", error);
        throw error;
    }
}

export async function markAllNotificationsAsRead(supabase: SupabaseClient) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in");

    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false); // Only update unread ones

    if (error) {
        console.error("Error marking all read:", error);
        throw error;
    }
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

export type UserNotificationSettings = {
    likes_enabled: boolean;
    comments_enabled: boolean;
    replies_enabled: boolean;
    contributions_enabled: boolean;
    system_enabled: boolean;
};

export type UserPrivacySettings = {
    profile_visibility: 'public' | 'limited';
    show_email: boolean;
    allow_indexing: boolean;
    allow_follow: boolean;
};

export type UserSettings = {
    user_id: string;
    notifications: UserNotificationSettings;
    privacy: UserPrivacySettings;
    updated_at: string;
};

// Default settings if rows are missing
const defaultNotifications: UserNotificationSettings = {
    likes_enabled: true,
    comments_enabled: true,
    replies_enabled: true,
    contributions_enabled: true,
    system_enabled: true,
};

const defaultPrivacy: UserPrivacySettings = {
    profile_visibility: 'public',
    show_email: false,
    allow_indexing: true,
    allow_follow: true,
};

export async function getUserSettings(supabase: SupabaseClient): Promise<UserSettings | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch from both tables
    const [notifResult, privacyResult] = await Promise.all([
        supabase.from('user_notification_settings').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('user_privacy_settings').select('*').eq('user_id', user.id).maybeSingle(),
    ]);

    return {
        user_id: user.id,
        notifications: { ...defaultNotifications, ...notifResult.data },
        privacy: { ...defaultPrivacy, ...privacyResult.data },
        updated_at: new Date().toISOString()
    };
}

export async function updateNotificationSettings(supabase: SupabaseClient, settings: Partial<UserNotificationSettings>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from('user_notification_settings')
        .upsert({ user_id: user.id, ...settings, updated_at: new Date().toISOString() });

    if (error) throw error;
}

export async function updatePrivacySettings(supabase: SupabaseClient, settings: Partial<UserPrivacySettings>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from('user_privacy_settings')
        .upsert({ user_id: user.id, ...settings, updated_at: new Date().toISOString() });

    if (error) throw error;
}

export async function deleteUserAccount(supabase: SupabaseClient) {
    const { error } = await supabase.rpc('delete_user_account');
    if (error) throw error;
}

export async function updateProfile(supabase: SupabaseClient, updates: { username?: string; bio?: string; avatar_url?: string; banner_path?: string; skills?: string[] }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
        .from('users')
        .upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() })

    if (error) throw error;

    // Optional: Update auth metadata if username changed
    if (updates.username) {
        await supabase.auth.updateUser({
            data: { username: updates.username }
        });
    }
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

    // ULTIMATE PERFORMANCE: Single row fetch from users table (0ms runtime)
    // Uses pre-computed counters maintained by database triggers
    const { data, error } = await supabase
        .from('users')
        .select('posts_count, likes_received, comments_received, bookmarks_received, followers_count, following_count, challenges_count, communities_count')
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

    return {
        posts: data.posts_count || 0,
        followers: data.followers_count || 0,
        following: data.following_count || 0,
        saved: data.bookmarks_received || 0,
        challenges: data.challenges_count || 0,
        communities: data.communities_count || 0
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

export async function getTopPerformerPost(supabase: SupabaseClient, userId: string, authorData?: any) {
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            community:communities!posts_community_id_fkey(*),
            user_liked_post:post_likes(user_id),
            user_bookmark:post_bookmarks(user_id)
        `)
        .eq('user_id', userId)
        .order('engagement_score', { ascending: false })
        .limit(1)
        .single();

    if (error || !data) return null;
    return transformPost(data, user, authorData);
}

// --- Daily Highlights ---

export async function getDailyHighlights(supabase: SupabaseClient) {
    // Calling the RPC function which handles cleanup (retention) and fetching Today + Yesterday
    const { data, error } = await supabase.rpc('get_current_highlights');

    if (error) {
        console.error('Error fetching highlights:', error);
        return [];
    }

    return (data || []).map((h: any) => ({
        id: h.id,
        content: h.content,
        posted_date: h.posted_date,
        createdAt: h.created_at,
        author: {
            id: h.user?.id,
            displayName: h.user?.username || 'Unknown',
            username: h.user?.username || 'unknown',
            avatar: h.user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${h.user?.username || 'unknown'}`,
        },
        reactions: []
    }));
}

export async function createDailyHighlight(supabase: SupabaseClient, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Must be logged in");

    const { data, error } = await supabase
        .from('daily_highlights')
        .insert({
            content,
            posted_by: user.id,
            posted_date: new Date().toISOString().split('T')[0] // Always Today's Date
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

// --- Communities Filter Logic ---

export type CommunityFilters = {
    category?: string;
    sortBy?: 'popular' | 'newest';
    joinedOnly?: boolean;
    search?: string;
};

export async function getCommunities(supabase: SupabaseClient, filters: CommunityFilters, currentUserId?: string) {
    let query = supabase
        .from('communities')
        .select(`
            *,
            members:community_members(user_id)
        `);

    // 1. Search filter with robust ILIKE syntax
    if (filters.search) {
        const searchStr = `%${filters.search}%`;
        query = query.or(`name.ilike.${searchStr},description.ilike.${searchStr}`);
    }

    // 2. Category filter - case insensitive
    if (filters.category && filters.category !== 'all') {
        query = query.ilike('category', filters.category);
    }

    // 3. Sorting - defensive check for member_count
    if (filters.sortBy === 'popular') {
        query = query.order('member_count', { ascending: false, nullsFirst: false });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching communities:', error);
        // Fallback for sorting if column missing, just try again without sort
        if (error.message?.includes('member_count')) {
            const fallback = await supabase.from('communities').select('*, members:community_members(user_id)');
            return fallback.data?.map((c: any) => ({
                ...c,
                isJoined: currentUserId ? c.members?.some((m: any) => m.user_id === currentUserId) : false,
                memberCount: 0,
                tags: c.category ? [c.category] : [],
                icon: c.icon || '🌍',
                description: c.description || '',
            })) || [];
        }
        return [];
    }

    let results = data.map((c: any) => ({
        ...c,
        isJoined: currentUserId ? c.members?.some((m: any) => m.user_id === currentUserId) : false,
        memberCount: c.member_count || 0,
        postCount: c.posts_count || 0,
        tags: c.category ? [c.category] : [],
        icon: c.icon || '🌍',
        description: c.description || '',
    }));

    // 4. Joined only
    if (filters.joinedOnly && currentUserId) {
        results = results.filter(c => c.isJoined);
    }

    return results as Community[];
}
export async function getCommunityCategories(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('communities')
        .select('category')
        .not('category', 'is', null);

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    // Get unique categories, ignore nulls and empty strings
    const uniqueCategories = Array.from(new Set(data.map(c => c.category))).filter(Boolean);
    return uniqueCategories.map(cat => ({
        id: cat,
        label: cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : ''
    }));
}
