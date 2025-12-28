import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, MapPin, Globe, Loader2, Calendar, Share2, Building } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow } from 'date-fns';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';
import { ShareMenu } from '@/components/common/ShareMenu';

const JobDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJob = async () => {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from('job_posts')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;

                setJob({
                    ...data,
                    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.company)}&background=random`
                });
            } catch (error) {
                console.error("Error fetching job", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [id]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
                <div className="flex items-start gap-6">
                    <div className="h-20 w-20 rounded-xl bg-muted" />
                    <div className="space-y-3 flex-1">
                        <div className="h-8 w-3/4 bg-muted rounded" />
                        <div className="h-4 w-1/4 bg-muted rounded" />
                    </div>
                </div>
                <div className="h-10 w-full bg-muted rounded" />
                <div className="space-y-4">
                    <div className="h-6 w-1/3 bg-muted rounded" />
                    <div className="h-24 w-full bg-muted rounded" />
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <>
                <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                    <div className="rounded-full bg-muted p-4">
                        <Briefcase className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-bold">Job Not Found</h2>
                    <p className="text-muted-foreground">This job post may have been removed or expired.</p>
                    <Link to="/jobs">
                        <Button variant="outline">Back to Jobs</Button>
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="max-w-4xl mx-auto space-y-8 pb-12">
                {/* Navigation */}
                <Link to="/jobs">
                    <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Jobs
                    </Button>
                </Link>

                <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Header */}
                        <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                                <img
                                    src={job.logo}
                                    alt={job.company}
                                    className="h-20 w-20 rounded-xl bg-muted object-cover"
                                />
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{job.role}</h1>
                                            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                                                <span className="font-semibold text-foreground flex items-center gap-1.5">
                                                    <Building className="h-4 w-4" />
                                                    {job.company}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1.5">
                                                    <MapPin className="h-4 w-4" />
                                                    {job.location}
                                                </span>
                                            </div>
                                        </div>
                                        {/* Share or Bookmark could go here */}
                                        <ShareMenu
                                            title={`${job.role} at ${job.company}`}
                                            path={`/jobs/${job.id}`}
                                            trigger={
                                                <Button variant="ghost" size="icon">
                                                    <Share2 className="h-4 w-4" />
                                                </Button>
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-wrap gap-2 pt-2">
                                        <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-sm font-medium">
                                            {job.type}
                                        </span>
                                        <span className="bg-success/10 text-success px-2.5 py-1 rounded-md text-sm font-medium flex items-center gap-1.5">
                                            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                                            Actively Hiring
                                        </span>
                                        <span className="text-sm text-muted-foreground flex items-center gap-1.5 px-2 py-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold font-iceland text-foreground">Job Description</h2>
                            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
                                <MarkdownRenderer content={job.description} />
                            </div>
                        </div>

                        {/* Tech Stack */}
                        {job.stack && job.stack.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold font-iceland text-foreground">Tech Stack</h2>
                                <div className="flex flex-wrap gap-2">
                                    {job.stack.map((tech: string) => (
                                        <span key={tech} className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground font-mono text-sm">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        {/* Apply Card */}
                        <div className="rounded-xl border border-border bg-card p-6 space-y-6 sticky top-24">
                            <h3 className="font-semibold text-lg">Detailed Info</h3>

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Experience Level</span>
                                    <span className="font-medium">Mid - Senior</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Job Type</span>
                                    <span className="font-medium capitalize">{job.type}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-border/50">
                                    <span className="text-muted-foreground">Salary</span>
                                    <span className="font-medium">Competitive</span>
                                </div>
                            </div>

                            <a
                                href={job.apply_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                            >
                                <Button className="w-full gap-2 text-md py-6">
                                    Apply Now
                                    <Globe className="h-4 w-4" />
                                </Button>
                            </a>
                            <p className="text-xs text-center text-muted-foreground">
                                You will be redirected to the company's application page.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default JobDetailsPage;
