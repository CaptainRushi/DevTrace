import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, GitBranch, Star, MessageSquare, ExternalLink, User, Share2, Info } from 'lucide-react';
import { ShareMenu } from '@/components/common/ShareMenu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TimeAgo } from '@/components/common/TimeAgo';
import { OpenSourceProject, toggleProjectStar } from '@/services/api';
import { ContributeModal } from './ContributeModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FollowButton } from '@/components/common/FollowButton';

interface OpenSourceProjectCardProps {
    project: OpenSourceProject;
}

export function OpenSourceProjectCard({ project }: OpenSourceProjectCardProps) {
    const { user } = useAuth();
    const [starred, setStarred] = useState(project.isStarred || false);
    const [starCount, setStarCount] = useState(project.star_count || 0);
    const [toggling, setToggling] = useState(false);

    // Determine if it's GitHub or GitLab for icon
    const isGitLab = project.repo_url.includes('gitlab.com');
    const RepoIcon = isGitLab ? GitBranch : Github;

    const handleStarToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("Please sign in to star projects");
            return;
        }

        const newStarredState = !starred;
        const newStarCount = newStarredState ? starCount + 1 : Math.max(0, starCount - 1);

        // Optimistic Update
        setStarred(newStarredState);
        setStarCount(newStarCount);
        setToggling(true);

        try {
            await toggleProjectStar(supabase, project.id, starred);
        } catch (error) {
            console.error(error);
            // Revert on error
            setStarred(!newStarredState);
            setStarCount(starCount);
            toast.error("Failed to update star");
        } finally {
            setToggling(false);
        }
    };

    return (
        <div className="group flex flex-col h-full rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg overflow-hidden relative">
            {/* Row 1: Header (Title + Star) */}
            <div className="p-5 pb-2 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/80">
                        <RepoIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors font-iceland tracking-wide">
                            <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                                {project.project_name}
                            </a>
                        </h3>
                        {/* Contribution Badge - Subtle placement */}
                        {project.contribution_type && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Badge variant="secondary" className="h-4 px-1 text-[10px] font-normal bg-primary/10 text-primary border-0 rounded-sm">
                                    {project.contribution_type}
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 -mr-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-8 w-8 transition-colors",
                            starred ? "text-yellow-500 hover:bg-yellow-500/10" : "text-muted-foreground hover:text-yellow-500 hover:bg-muted"
                        )}
                        onClick={handleStarToggle}
                        disabled={toggling}
                        title={starred ? "Unstar" : "Star"}
                    >
                        <Star className={cn("h-4 w-4", starred && "fill-current")} />
                    </Button>
                    <ShareMenu
                        title={project.project_name}
                        path={`/open-source/${project.id}`}
                        trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted">
                                <Share2 className="h-4 w-4" />
                            </Button>
                        }
                    />
                </div>
            </div>

            {/* Row 2: Description */}
            <div className="px-5 mb-4">
                <p className="text-muted-foreground text-sm line-clamp-2 h-10 leading-relaxed">
                    {project.description}
                </p>
            </div>

            {/* Row 3: Tech Stack */}
            <div className="px-5 mb-4 mt-auto">
                <div className="flex flex-wrap gap-1.5 min-h-[1.5rem]">
                    {project.tech_stack?.slice(0, 4).map((tech) => (
                        <span key={tech} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                            {tech}
                        </span>
                    ))}
                    {(project.tech_stack?.length || 0) > 4 && (
                        <span className="text-[10px] text-muted-foreground self-center">+{project.tech_stack.length - 4}</span>
                    )}
                </div>
            </div>

            {/* Row 4: Metadata (Author + Time) */}
            <div className="px-5 py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Link to={`/profile/${project.author?.username}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors font-medium">
                        <User className="h-3 w-3" />
                        {project.author?.username}
                    </Link>
                    <FollowButton
                        targetUserId={project.created_by}
                        targetUsername={project.author?.username}
                        size="xs"
                        variant="ghost"
                        className="h-5 px-1.5 text-[10px]"
                    />
                </div>
                <div className="flex items-center gap-1">
                    <TimeAgo date={project.created_at} showIcon={true} />
                </div>
            </div>

            {/* Row 5: Action Buttons */}
            <div className="p-3 gap-2 grid grid-cols-2 border-t border-border bg-card">
                <Button
                    asChild
                    variant="default"
                    size="sm"
                    className="w-full font-semibold shadow-sm"
                >
                    <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                        <RepoIcon className="h-3.5 w-3.5" />
                        Contribute
                    </a>
                </Button>

                <ContributeModal project={project}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                        <Info className="h-3.5 w-3.5" />
                        Details
                    </Button>
                </ContributeModal>
            </div>
        </div>
    );
}
