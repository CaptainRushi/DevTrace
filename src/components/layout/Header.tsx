import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, Plus, X, LogIn, UserPlus, User, Settings, LogOut } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { RunningLogo } from '@/components/common/RunningLogo';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (!window.confirm("Are you sure you want to sign out?")) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error signing out');
      console.error(error);
    }
  };

  const displayName = profile?.username || user?.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 transition-all duration-300 ease-in-out group",
              "w-auto px-2" // Allow natural width for full text
            )}
          >
            <RunningLogo collapsed={true} />
          </Link>
        </div>

        {/* Center section - Search */}
        <div className="hidden flex-1 max-w-xl px-8 md:block">
          <GlobalSearch />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSearchOpen(!searchOpen)}
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>

          {user ? (
            <>
              {/* Create Post Button */}
              <Link to="/create">
                <Button className="hidden gap-2 sm:flex">
                  <Plus className="h-4 w-4" />
                  <span>Create Post</span>
                </Button>
                <Button size="icon" className="sm:hidden">
                  <Plus className="h-4 w-4" />
                </Button>
              </Link>

              {/* Notifications */}
              <NotificationsDropdown />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-transparent">
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="h-8 w-8 rounded-full border border-border"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link to={`/profile/${displayName}`} className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer focus:text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2 items-center">
              <Link to="/auth/sign-in">
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <LogIn className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth/sign-up">
                <Button size="sm" className="hidden sm:flex">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
                <Button size="icon" className="sm:hidden">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border px-4 py-3 md:hidden"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="w-full pl-10 bg-muted"
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
