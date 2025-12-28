import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { followUser, unfollowUser, checkIsFollowing } from '@/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface FollowButtonProps {
    targetUserId: string;
    targetUsername?: string;
    size?: 'default' | 'sm' | 'xs' | 'icon';
    variant?: 'default' | 'outline' | 'ghost';
    className?: string;
    showLabel?: boolean;
}

export function FollowButton({
    targetUserId,
    targetUsername,
    size = 'sm',
    variant = 'default',
    className,
    showLabel = true
}: FollowButtonProps) {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    const isOwner = user?.id === targetUserId;

    useEffect(() => {
        const fetchStatus = async () => {
            if (!user || isOwner) {
                setLoading(false);
                return;
            }
            try {
                const status = await checkIsFollowing(supabase, targetUserId);
                setIsFollowing(status);
            } catch (error) {
                console.error("Error checking follow status:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [user, targetUserId, isOwner]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error("Please sign in to follow users");
            return;
        }

        if (isOwner) return;

        setToggling(true);
        const wasFollowing = isFollowing;

        // Optimistic Update
        setIsFollowing(!wasFollowing);

        try {
            if (wasFollowing) {
                await unfollowUser(supabase, targetUserId);
                toast.success(`Unfollowed ${targetUsername || 'user'}`);
            } else {
                await followUser(supabase, targetUserId);
                toast.success(`Following ${targetUsername || 'user'}`);
            }
        } catch (error) {
            console.error(error);
            setIsFollowing(wasFollowing);
            toast.error("Action failed");
        } finally {
            setToggling(false);
        }
    };

    if (isOwner || (loading && user)) return null;

    const label = isFollowing ? 'Following' : 'Follow';
    const Icon = isFollowing ? UserCheck : UserPlus;

    const buttonElement = (
        <Button
            size={size === 'xs' ? 'sm' : size}
            variant={isFollowing ? 'outline' : variant}
            onClick={handleToggle}
            disabled={toggling}
            className={cn(
                "transition-all duration-200 group/follow",
                size === 'xs' && "h-7 px-2 text-[10px]",
                isFollowing && "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50",
                className
            )}
        >
            {toggling ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
            ) : (
                <Icon className={cn(
                    "h-3.5 w-3.5",
                    showLabel && "mr-1.5",
                    isFollowing && "group-hover/follow:hidden"
                )} />
            )}
            {showLabel && (
                <>
                    <span className={cn(isFollowing && "group-hover/follow:hidden")}>{label}</span>
                    {isFollowing && <span className="hidden group-hover/follow:inline">Unfollow</span>}
                </>
            )}
        </Button>
    );

    if (!user) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="inline-block opacity-60 cursor-not-allowed">
                            {buttonElement}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="text-xs">Sign in to follow users</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    return buttonElement;
}
