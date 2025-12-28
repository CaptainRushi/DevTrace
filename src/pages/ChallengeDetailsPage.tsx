import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Code, Terminal, AlertCircle, MessageCircle, Share2 } from 'lucide-react';
import { ShareMenu } from '@/components/common/ShareMenu';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from "@/lib/supabase";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const ChallengeDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [challenge, setChallenge] = useState<any>(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchChallenge = async () => {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from('challenges')
                    .select('*, author:users!challenges_user_id_fkey(*)')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setChallenge(data);
            } catch (e) {
                console.error("Error fetching challenge", e);
            } finally {
                setLoading(false);
            }
        };
        fetchChallenge();
    }, [id]);



    if (loading) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
                <div className="space-y-4">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-10 w-3/4 bg-muted rounded" />
                    <div className="flex gap-4">
                        <div className="h-6 w-20 bg-muted rounded-full" />
                        <div className="h-6 w-20 bg-muted rounded-full" />
                    </div>
                </div>
                <div className="h-32 w-full bg-muted rounded-xl" />
                <div className="h-64 w-full bg-muted rounded-xl" />
            </div>
        );
    }

    if (!challenge) {
        return <><div className="py-20 text-center">Challenge not found</div></>;
    }

    // Parse examples if they are JSON strings
    let examples = [];
    try {
        if (typeof challenge.examples === 'string') {
            examples = JSON.parse(challenge.examples);
        }
    } catch (e) { /* ignore */ }


    return (
        <>
            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                <Button variant="ghost" className="gap-2" onClick={() => navigate('/challenges')}>
                    <ArrowLeft className="h-4 w-4" /> Back to Challenges
                </Button>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Content */}
                    <div className="md:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl border border-border bg-card p-6"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-4xl font-bold font-iceland tracking-wide text-foreground">{challenge.title}</h1>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant={challenge.difficulty === 'easy' ? 'default' : challenge.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                                            {challenge.difficulty?.toUpperCase()}
                                        </Badge>
                                        {challenge.language_category && <Badge variant="outline">{challenge.language_category}</Badge>}
                                        <span className="text-sm text-muted-foreground">
                                            by {challenge.author?.username || 'Platform'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-muted-foreground">
                                        Read-Only
                                    </Badge>
                                    <Button variant="ghost" size="sm" className="gap-2" onClick={() => toast.info("Discussion feature coming soon!")}>
                                        <MessageCircle className="h-4 w-4" /> Discuss
                                    </Button>
                                    <ShareMenu
                                        title={challenge.title}
                                        path={`/challenges/${challenge.id}`}
                                        trigger={
                                            <Button variant="ghost" size="sm" className="gap-2">
                                                <Share2 className="h-4 w-4" /> Share
                                            </Button>
                                        }
                                    />
                                </div>
                            </div>

                            <div className="mt-6 prose prose-invert max-w-none">
                                <ReactMarkdown>{challenge.description}</ReactMarkdown>
                            </div>
                        </motion.div>

                        {/* Input / Output Format */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-xl border border-border bg-card p-5">
                                <h3 className="font-semibold flex items-center gap-2 mb-3">
                                    <Terminal className="h-4 w-4 text-primary" /> Input Format
                                </h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{challenge.input_format || "Not specified"}</p>
                            </div>
                            <div className="rounded-xl border border-border bg-card p-5">
                                <h3 className="font-semibold flex items-center gap-2 mb-3">
                                    <Code className="h-4 w-4 text-primary" /> Output Format
                                </h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{challenge.output_format || "Not specified"}</p>
                            </div>
                        </div>

                        {/* Examples */}
                        {examples.length > 0 && (
                            <div className="rounded-xl border border-border bg-card p-6">
                                <h3 className="font-semibold mb-4">Examples</h3>
                                <div className="space-y-4">
                                    {examples.map((ex: any, i: number) => (
                                        <div key={i} className="bg-muted/50 rounded-lg p-4 font-mono text-sm space-y-2">
                                            <div>
                                                <span className="text-primary font-bold">Input:</span> {ex.input}
                                            </div>
                                            <div>
                                                <span className="text-primary font-bold">Output:</span> {ex.output}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="rounded-xl border border-border bg-card p-6">
                            <h3 className="font-semibold flex items-center gap-2 mb-4">
                                <AlertCircle className="h-4 w-4" /> Constraints
                            </h3>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
                                {challenge.constraints ? (
                                    challenge.constraints.split(',').map((c: string, i: number) => (
                                        <li key={i}>{c}</li>
                                    ))
                                ) : (<li>No constraints specified</li>)}
                            </ul>
                        </div>

                        <div className="rounded-xl border border-border bg-card p-6">
                            <h3 className="font-semibold mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {challenge.tags && challenge.tags.map((tag: string) => (
                                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChallengeDetailsPage;
