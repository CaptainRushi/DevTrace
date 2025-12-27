import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { OpenSourceProject, logContribution } from '@/services/api';
import { Github, Bug, Lightbulb, GitPullRequest, MessageSquare, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    children?: React.ReactNode; // Button trigger
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
            toast.success("Contribution logged! Pending approval.");
            setOpen(false);
            // Reset form
            setRefUrl('');
            setDesc('');
        } catch (error) {
            console.error(error);
            toast.error("Failed to log contribution");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl flex items-center gap-2">
                        Contribute to <span className="text-primary">{project.project_name}</span>
                    </DialogTitle>
                    <DialogDescription>
                        Join the development! You can contribute by reporting bugs, suggesting features, or submitting code.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* 1. Repository Access */}
                    <div className="bg-muted/50 p-4 rounded-lg border border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Github className="h-6 w-6" />
                            <div>
                                <h4 className="font-semibold text-sm">Main Repository</h4>
                                <p className="text-xs text-muted-foreground">{project.repo_url}</p>
                            </div>
                        </div>
                        <Button asChild size="sm">
                            <a href={project.repo_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open Repo
                            </a>
                        </Button>
                    </div>

                    {/* 2. Contribution Options (Guidance) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <a href={`${project.repo_url}/issues/new`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-center gap-2 group">
                            <Bug className="h-6 w-6 text-red-500 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">Report Bug</span>
                        </a>
                        <a href={`${project.repo_url}/issues`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-center gap-2 group">
                            <Lightbulb className="h-6 w-6 text-yellow-500 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">Suggest Feature</span>
                        </a>
                        <a href={`${project.repo_url}/pulls`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-center gap-2 group">
                            <GitPullRequest className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">Submit PR</span>
                        </a>
                        <a href={`${project.repo_url}/discussions`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors text-center gap-2 group">
                            <MessageSquare className="h-6 w-6 text-green-500 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">Discuss</span>
                        </a>
                    </div>

                    {/* 3. Guidelines Placeholder (If we had a field for it) */}
                    {/* <div className="text-sm text-muted-foreground bg-blue-500/10 p-3 rounded-md border border-blue-500/20">
             <strong>Tip:</strong> Check the <code>CONTRIBUTING.md</code> file in the repository for specific guidelines.
           </div> */}

                    {/* 4. Log Contribution (Logged-in only) */}
                    {user ? (
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold mb-4">Log Your Contribution</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Did you submit an issue or PR? Log it here to track your community impact!
                            </p>

                            <form onSubmit={handleLogContribution} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select value={contribType} onValueChange={setContribType}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Issue">Issue</SelectItem>
                                                <SelectItem value="PR">Pull Request</SelectItem>
                                                <SelectItem value="Idea">Idea / Discussion</SelectItem>
                                                <SelectItem value="Docs">Documentation</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Reference URL (Optional)</Label>
                                        <Input
                                            placeholder="e.g. GitHub Issue Link"
                                            value={refUrl}
                                            onChange={(e) => setRefUrl(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Description <span className="text-red-500">*</span></Label>
                                    <Textarea
                                        placeholder="Briefly describe what you did..."
                                        value={desc}
                                        onChange={(e) => setDesc(e.target.value)}
                                        required
                                        className="resize-none"
                                    />
                                </div>
                                <Button type="submit" disabled={submitting} className="w-full">
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Log Contribution
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="border-t pt-6 text-center">
                            <p className="text-muted-foreground mb-4">Log in to track your contributions and build your profile.</p>
                            <Button asChild variant="outline">
                                <Link to="/auth/sign-in">Sign In to Log Contribution</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
