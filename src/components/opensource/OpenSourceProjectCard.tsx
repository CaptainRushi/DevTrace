import { Link } from 'react-router-dom';
import { Github, GitBranch, Star, MessageSquare, ExternalLink, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TimeAgo } from '@/components/common/TimeAgo';
import { OpenSourceProject } from '@/services/api';
import { ContributeModal } from './ContributeModal';

interface OpenSourceProjectCardProps {
    project: OpenSourceProject;
}

export function OpenSourceProjectCard({ project }: OpenSourceProjectCardProps) {
    // Determine if it's GitHub or GitLab for icon
    const isGitLab = project.repo_url.includes('gitlab.com');
    const RepoIcon = isGitLab ? GitBranch : Github; // Lucide doesn't have GitLab icon by default, using GitBranch as fallback or generic. Github is strict.

    return (
        <div className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-lg card-glow h-full">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-foreground">
                        <RepoIcon className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                                {project.project_name}
                            </a>
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Link to={`/profile/${project.author?.username}`} className="hover:text-foreground flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {project.author?.displayName}
                            </Link>
                            <span>•</span>
                            <TimeAgo date={project.created_at} showIcon={false} />
                        </div>
                    </div>
                </div>

                {/* Contributor Friendly Label */}
                {project.contribution_type && (
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 whitespace-nowrap">
                        {project.contribution_type}
                    </Badge>
                )}
            </div>

            <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
                {project.description}
            </p>

            {/* Tech Stack */}
            <div className="flex flex-wrap gap-1.5 mb-4">
                {project.tech_stack?.slice(0, 4).map((tech) => (
                    <span key={tech} className="tag text-xs">
                        {tech}
                    </span>
                ))}
                {(project.tech_stack?.length || 0) > 4 && (
                    <span className="text-xs text-muted-foreground">+{project.tech_stack.length - 4} more</span>
                )}
            </div>

            {/* Actions */}
            <div className="mt-auto pt-4 border-t border-border flex items-center justify-between gap-3">
                <div className="flex gap-2 flex-1">
                    <ContributeModal project={project}>
                        <Button className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground border-none font-semibold">
                            Contribute
                        </Button>
                    </ContributeModal>

                    <Button variant="outline" size="icon" className="shrink-0" asChild title="View Repo">
                        <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                        </a>
                    </Button>
                </div>

                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-yellow-400" title="Bookmark (Check back later!)">
                        <Star className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary" title="Discuss">
                        <MessageSquare className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
