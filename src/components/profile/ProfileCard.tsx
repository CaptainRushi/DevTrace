import { Link } from 'react-router-dom';
import { MapPin, Calendar, Award } from 'lucide-react';
import { User } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { ActivityGraph } from './ActivityGraph';

interface ProfileCardProps {
  user: User;
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    <div className="space-y-6">
      {/* Main Profile Card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-6">
          <img
            src={user.avatar}
            alt={user.displayName}
            className="h-24 w-24 rounded-full ring-4 ring-primary/20"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{user.displayName}</h1>
            <p className="mt-1 font-mono text-muted-foreground">@{user.username}</p>
            <p className="mt-3 text-foreground">{user.bio}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
          <div className="flex gap-2">
            <Button>Follow</Button>
            <Button variant="outline">Message</Button>
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
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-muted p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{user.postCount}</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </div>
          <div className="rounded-lg bg-muted p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{user.reputation.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Reputation</div>
          </div>
          <div className="rounded-lg bg-muted p-4 text-center">
            <div className="text-2xl font-bold text-foreground">12</div>
            <div className="text-sm text-muted-foreground">Communities</div>
          </div>
        </div>
      </div>

      {/* Activity Graph */}
      <ActivityGraph />
    </div>
  );
}
