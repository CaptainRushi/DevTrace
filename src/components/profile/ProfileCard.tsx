import { useRef, useState } from 'react';
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Link } from 'react-router-dom';
import { MapPin, Calendar, Award, Camera, Loader2 } from 'lucide-react';
// import { User } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { ActivityGraph } from './ActivityGraph';
import { cn } from "@/lib/utils";

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  skills: string[];
  joinedDate: string;
  reputation: number;
  postCount: number;
  likesReceived?: number;
  banner?: string | null;
}

interface ProfileCardProps {
  user: User;
  isOwner?: boolean;
  action?: React.ReactNode;
  onProfileUpdate?: () => void;
}

export function ProfileCard({ user, isOwner, action, onProfileUpdate }: ProfileCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    if (file.size > 200 * 1024) { // 200KB Strict Limit
      toast.error("Banner image must be under 200KB");
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Format must be JPG, PNG, or WEBP");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/banner_${Date.now()}.${fileExt}`;

      // Upload to 'avatars' bucket (assuming public access)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update User Profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ banner_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success("Banner updated successfully");
      if (onProfileUpdate) onProfileUpdate();

    } catch (error) {
      console.error("Banner upload failed:", error);
      toast.error("Failed to upload banner");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">

        {/* Banner Section */}
        <div className="relative h-32 w-full bg-muted md:h-48">
          {user.banner ? (
            <img
              src={user.banner}
              alt="Profile Banner"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-primary/10 via-primary/5 to-background" />
          )}

          {/* Owner Edit Button */}
          {isOwner && (
            <>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBannerUpload}
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute right-4 top-4 opacity-0 transition-opacity hover:opacity-100 group-hover:opacity-100" // Visible on hover
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                Edit Banner
              </Button>
            </>
          )}
        </div>

        <div className="p-6 pt-0">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-6">
            {/* Avatar - Negative Margin for Overlap */}
            <div className="-mt-12 relative">
              <img
                src={user.avatar}
                alt={user.displayName}
                className="h-24 w-24 rounded-full ring-4 ring-card bg-card object-cover"
              />
            </div>

            <div className="flex-1 mt-4 sm:mt-2"> {/* Adjusted margin for text */}
              <h1 className="text-2xl font-bold text-foreground">{user.displayName}</h1>
              <p className="mt-1 font-mono text-muted-foreground">@{user.username}</p>
              <p className="mt-3 text-foreground">{user.bio}</p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground justify-center sm:justify-start">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-primary" />
                  {user.reputation.toLocaleString()} reputation
                </span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0 self-center sm:self-start mt-4 sm:mt-2">
              {isOwner ? (
                <div className="w-full sm:w-auto">
                  {action}
                </div>
              ) : (
                <>
                  <Button>Follow</Button>
                  <Button variant="outline">Message</Button>
                </>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="mt-6">
            <h3 className="font-mono text-sm font-semibold text-foreground mb-3">
              <span className="text-muted-foreground">#</span>skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <span key={skill} className="tag tag-primary">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 divide-x divide-border border-t border-border pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{user.postCount || 0}</div>
              <div className="text-sm font-medium text-muted-foreground">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{user.likesReceived || 0}</div>
              <div className="text-sm font-medium text-muted-foreground">Likes Received</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{user.reputation || 0}</div>
              <div className="text-sm font-medium text-muted-foreground">Reputation</div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Graph */}
      <ActivityGraph />
    </div>
  );
}
