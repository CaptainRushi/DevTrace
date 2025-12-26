import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Briefcase,
  Lightbulb,
  Zap,
  Wrench,
  Github,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { communities } from '@/data/mockData';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

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
  { icon: Github, label: 'Open Source', href: '/community/open-source' },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();

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
          'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-border bg-sidebar transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <ScrollArea className="h-full py-4">
          <nav className="space-y-1 px-3">
            {/* Main Navigation */}
            {mainNavItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-accent text-primary'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Separator className="my-4" />

          {/* Communities */}
          <div className="px-3">
            <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Communities
            </h3>
            <nav className="space-y-1">
              {communities.slice(0, 6).map((community) => {
                const isActive = location.pathname === `/community/${community.slug}`;
                return (
                  <Link
                    key={community.id}
                    to={`/community/${community.slug}`}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-sidebar-accent text-primary'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <span className="text-base">{community.icon}</span>
                    <span className="flex-1 truncate">{community.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(community.memberCount / 1000).toFixed(1)}k
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <Separator className="my-4" />

          {/* Resources */}
          <div className="px-3">
            <h3 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Resources
            </h3>
            <nav className="space-y-1">
              <Link
                to="/roadmap"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <TrendingUp className="h-5 w-5" />
                Public Roadmap
              </Link>
              <Link
                to="/contribute"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <BookOpen className="h-5 w-5" />
                Contribute
              </Link>
            </nav>
          </div>

          {/* Footer */}
          <div className="mt-6 px-6">
            <div className="rounded-lg border border-border bg-card p-4">
              <h4 className="font-mono text-sm font-semibold text-primary">
                Open Source
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                This platform is open source. Contribute on GitHub!
              </p>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex items-center gap-2 text-xs font-medium text-primary hover:underline"
              >
                <Github className="h-4 w-4" />
                View on GitHub
              </a>
            </div>
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
