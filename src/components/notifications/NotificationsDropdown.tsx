import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Loader2, MousePointerClick } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    AppNotification,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead
} from '@/services/api';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { TimeAgo } from '@/components/common/TimeAgo';
import { useAuth } from '@/contexts/AuthContext';

export function NotificationsDropdown() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await getNotifications(supabase);
            setNotifications(data as AppNotification[]);
            setUnreadCount((data as AppNotification[]).filter(n => !n.is_read).length);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && user) {
            fetchNotifications();
        } else if (user) {
            // Initial fetch for count
            fetchNotifications();
        }
    }, [open, user]);

    // Real-time subscription could go here
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    console.log('New notification:', payload);
                    setUnreadCount((prev) => prev + 1);
                    // Optionally refetch or append if open
                    if (open) fetchNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, open]);


    const handleMarkAllRead = async () => {
        try {
            await markAllNotificationsAsRead(supabase);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Failed to mark all as read:", error);
        }
    };

    const handleNotificationClick = async (notif: AppNotification) => {
        if (!notif.is_read) {
            try {
                await markNotificationAsRead(supabase, notif.id);
                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error("Failed to mark notification as read:", error);
            }
        }
    };

    const getLink = (notif: AppNotification) => {
        // Canonical Deep Linking
        if (notif.target_post_id) {
            return `/post/${notif.target_post_id}`; // Always open the post
        }

        switch (notif.entity_type) {
            case 'post': return `/post/${notif.entity_id}`;
            case 'comment': return `/post/${notif.entity_id}`; // Legacy/Fallback (might break if entity_id is comment id, but handled by target_post_id logic above)
            case 'project': return `/open-source`;
            case 'job': return `/jobs/${notif.entity_id}`;
            case 'challenge': return `/challenges/${notif.entity_id}`;
            default: return '/';
        }
    };

    const getActionText = (type: string) => {
        switch (type) {
            case 'like': return 'liked your post';
            case 'comment': return 'commented on your post';
            case 'reply': return 'replied to you';
            case 'bookmark': return 'bookmarked your post';
            case 'contribution': return 'contributed to your project';
            case 'system': return 'System Announcement';
            default: return 'interacted with you';
        }
    };

    if (!user) return null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 text-xs text-muted-foreground hover:text-primary"
                            onClick={handleMarkAllRead}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {loading && notifications.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y">
                            {notifications.map((notif) => (
                                <Link
                                    key={notif.id}
                                    to={getLink(notif)}
                                    onClick={() => handleNotificationClick(notif)}
                                    className={`flex gap-3 p-4 transition-colors hover:bg-muted/50 ${!notif.is_read ? 'bg-muted/20' : ''}`}
                                >
                                    <div className="h-2 w-2 mt-2 rounded-full shrink-0"
                                        style={{ backgroundColor: notif.is_read ? 'transparent' : 'hsl(var(--primary))' }}
                                    />
                                    <div className="space-y-1">
                                        <p className="text-sm leading-none">
                                            <span className="font-semibold">{notif.actor?.username || 'Someone'}</span>
                                            {" "}
                                            {getActionText(notif.type)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            <TimeAgo date={notif.created_at} showIcon={false} />
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">No notifications yet</p>
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
