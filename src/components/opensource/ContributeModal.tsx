import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OpenSourceProject, logContribution } from '@/services/api';
import { Github, Bug, Lightbulb, GitPullRequest, MessageSquare, ExternalLink, Loader2, BookOpen, Stars, HelpCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';

interface ContributeModalProps {
    project: OpenSourceProject;
    children?: React.ReactNode;
}

export function ContributeModal({ project, children }: ContributeModalProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form states
    const [contribType, setContribType] = useState('Issue');
    const [refUrl, setRefUrl] = useState('');
    const [desc, setDesc] = useState('');

    const handleLogContribution = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSubmitting(true);
        try {
            await logContribution(supabase, {
                project_id: project.id,
                user_id: user.id,
                contribution_type: contribType as any,
                reference_url: refUrl,
                description: desc
            });
            toast.success("Contribution logged! Thank you for supporting open source.");
            setOpen(false);
            setRefUrl('');
            setDesc('');
        } catch (error) {
            console.error(error);
            toast.error("Failed to log contribution");
        } finally {
            setSubmitting(false);
        }
    };

    const contributionWays = [
        { icon: Bug, label: 'Report a Bug', color: 'text-red-500', link: `${project.repo_url}/issues/new?labels=bug` },
        { icon: Lightbulb, label: 'Suggest Feature', color: 'text-yellow-500', link: `${project.repo_url}/issues/new?labels=enhancement` },
        { icon: Stars, label: 'Good First Issue', color: 'text-purple-500', link: `${project.repo_url}/issues?q=is:open+is:issue+label:"good+first+issue"` },
        { icon: BookOpen, label: 'Documentation', color: 'text-blue-500', link: `${project.repo_url}/tree/main#documentation` },
        { icon: GitPullRequest, label: 'Submit PR', color: 'text-green-500', link: `${project.repo_url}/pulls` },
        { icon: MessageSquare, label: 'Discuss', color: 'text-cyan-500', link: `${project.repo_url}/discussions` },
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                        Contribute to <span className="text-primary">{project.project_name}</span>
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        Your contributions help grow the developer ecosystem. Choose a way to help or log your recent activity.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8 mt-6">
                    {/* 1. Repository Access */}
                    <section className="bg-muted/30 p-5 rounded-xl border border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center border border-border">
                                <Github className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Repository Source</h4>
                                <p className="text-xs text-muted-foreground truncate max-w-[200px] md:max-w-xs">{project.repo_url}</p>
                            </div>
                        </div>
                        <Button asChild className="shrink-0 w-full sm:w-auto">
                            <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open on GitHub
                            </a>
                        </Button>
                    </section>

                    {/* 2. Contribution Ways */}
                    <section>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-primary" />
                            Ways to Contribute
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {contributionWays.map((way) => (
                                <a
                                    key={way.label}
                                    href={way.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-muted/50 transition-all text-center gap-2 group shadow-sm bg-card"
                                >
                                    <way.icon className={`h-6 w-6 ${way.color} group-hover:scale-110 transition-transform`} />
                                    <span className="text-xs font-bold whitespace-nowrap">{way.label}</span>
                                </a>
                            ))}
                        </div>
                    </section>

                    {/* 3. Contribution Guidelines */}
                    <section className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                        <h4 className="text-sm font-bold text-primary mb-2">Contribution Guidelines</h4>
                        <p className="text-sm text-balance leading-relaxed">
                            Check the repository README and <code>CONTRIBUTING.md</code> for specific instructions on environment setup, coding standards, and submission processes.
                        </p>
                    </section>

                </div>
            </DialogContent>
        </Dialog>
    );
}
