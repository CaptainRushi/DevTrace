import { useState, useEffect } from 'react';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getUserStats } from '@/services/api';
import { FollowButton } from './FollowButton';
import { cn } from '@/lib/utils';

interface UserHoverCardProps {
    userId: string;
    username: string;
    displayName: string;
    avatar: string;
    children: React.ReactNode;
}

export function UserHoverCard({ userId, username, displayName, avatar, children }: UserHoverCardProps) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleOpen = async (open: boolean) => {
        if (open && !stats && !loading) {
            setLoading(true);
            try {
                const data = await getUserStats(supabase, userId);
                setStats(data);
            } catch (error) {
                console.error("Error fetching hover card stats:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <HoverCard onOpenChange={handleOpen}>
            <HoverCardTrigger asChild>
                <div className="inline-block">
                    {children}
                </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-5 bg-card/95 backdrop-blur-md border-border shadow-2xl">
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <Link to={`/profile/${username}`}>
                            <Avatar className="h-14 w-14 ring-2 ring-primary/10 transition-transform hover:scale-105">
                                <AvatarImage src={avatar} />
                                <AvatarFallback>{displayName?.[0]}</AvatarFallback>
                            </Avatar>
                        </Link>
                        <FollowButton
                            targetUserId={userId}
                            targetUsername={username}
                            size="sm"
                            className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-none"
                        />
                    </div>

                    <div className="space-y-1">
                        <Link to={`/profile/${username}`} className="block group">
                            <h4 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                                {displayName}
                            </h4>
                            <p className="text-xs text-muted-foreground">@{username}</p>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/50">
                        <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Followers</p>
                            <p className="text-lg font-bold text-foreground">{stats?.followers || 0}</p>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Posts</p>
                            <p className="text-lg font-bold text-foreground">{stats?.posts || 0}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            <span>Developer</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{stats?.communities || 0} communities</span>
                        </div>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
