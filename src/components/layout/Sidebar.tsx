import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Briefcase,
  Lightbulb,
  Zap,
  Wrench,
  Github,
  Book,
  Loader2,
  ChevronRight, // Kept only if needed for something else, but likely removing
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from "@/lib/supabase";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CommunitySkeleton } from '@/components/common/Skeletons';
import { prefetchPage } from '@/lib/prefetch';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const mainNavItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Zap, label: 'Daily Highlights', href: '/highlights' },
  { icon: Lightbulb, label: 'Challenges', href: '/challenges' },
  { icon: Briefcase, label: 'Jobs', href: '/jobs' },
  { icon: Wrench, label: 'Tools & Stack', href: '/tools' },
  { icon: Github, label: 'Open Source', href: '/open-source' },
  { icon: Book, label: 'Documentation', href: '/docs' },];

import { useQuery } from '@tanstack/react-query';

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();

  const { data: communities = [], isLoading: loading } = useQuery({
    queryKey: ['communities-sidebar'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('communities')
        .select('*')
        .limit(10);

      if (error) throw error;

      return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        memberCount: c.member_count || 0,
        postCount: c.posts_count || 0,
        icon: c.icon || '🌍'
      }));
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r border-border bg-sidebar transition-transform duration-300',
          'w-[72px]', // Fixed width
          'lg:translate-x-0', // Always visible on desktop
          open ? 'translate-x-0' : '-translate-x-full' // Mobile toggle
        )}
      >
        <ScrollArea className="h-full py-4">
          <nav className="space-y-2 px-2">
            {/* Main Navigation */}
            {mainNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <TooltipProvider key={item.href} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.href}
                        onClick={onClose}
                        onMouseEnter={() => prefetchPage(item.href)}
                        className={cn(
                          'flex justify-center items-center rounded-lg py-3 transition-colors',
                          isActive
                            ? 'bg-sidebar-accent text-primary'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                        )}
                        aria-label={item.label}
                      >
                        <item.icon className="h-6 w-6" />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </nav>

          <Separator className="my-4 mx-2 w-auto" />

          {/* Communities */}
          <div className="mt-4 px-2 space-y-2">
            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex justify-center py-1">
                    <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                  </div>
                ))}
              </div>
            ) : communities.length > 0 ? (
              <nav className="space-y-2">
                {communities.map((community) => {
                  const isActive = location.pathname === `/community/${community.slug}`;
                  return (
                    <TooltipProvider key={community.id} delayDuration={0}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            key={community.id}
                            to={`/community/${community.slug}`}
                            onClick={onClose}
                            onMouseEnter={() => prefetchPage(`/community/${community.slug}`)}
                            className={cn(
                              'flex justify-center items-center rounded-lg py-2 transition-colors',
                              isActive
                                ? 'bg-sidebar-accent text-primary'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            )}
                            aria-label={community.name}
                          >
                            <span className="text-xl">{community.icon}</span>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          {community.name} <span className="text-muted-foreground opacity-80">({community.postCount || 0})</span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </nav>
            ) : null}

            {/* View All Button (Icon Only) */}
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/communities"
                    onMouseEnter={() => prefetchPage('/communities')}
                    className="flex justify-center items-center rounded-lg py-2 text-primary hover:bg-sidebar-accent transition-colors"
                    aria-label="View All Communities"
                  >
                    <Users className="h-6 w-6" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  View All Communities
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
