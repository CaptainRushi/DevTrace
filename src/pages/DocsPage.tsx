import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Book, Search, ChevronRight, FileText, Code, Users, Zap, Terminal, Github, User, Settings, Shield, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState, useMemo } from 'react';

// --- Documentation Content ---
// This is hardcoded for speed and simplicity. In a larger app, this would come from .md files or a CMS.

interface DocSection {
    id: string;
    title: string;
    icon: any;
    content: React.ReactNode;
}

const docsData: DocSection[] = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: Book,
        content: (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Getting Started with DevTrace</h1>
                <p className="text-muted-foreground text-lg">
                    DevTrace is a developer-first community platform designed for sharing knowledge, tracking progress, and collaborating on open source.
                </p>

                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">What is DevTrace?</h2>
                    <p>
                        Think of it as a hybrid between a social network and a technical portfolio. It allows you to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                        <li>Share your daily coding journey via <strong>Daily Highlights</strong>.</li>
                        <li>Post technical articles, questions, and tools in focused <strong>Communities</strong>.</li>
                        <li>Participate in community-created <strong>Coding Challenges</strong>.</li>
                        <li>showcase and find contributors for <strong>Open Source Projects</strong>.</li>
                        <li>Build a detailed developer <strong>Profile</strong> with automated stats.</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">Account Creation</h2>
                    <p>
                        You can browse most content without an account, but to interact (post, like, comment, join communities), you need to sign in.
                    </p>
                    <div className="bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Supported Methods:</h3>
                        <ul className="list-none space-y-1 text-sm">
                            <li>• Google OAuth (Recommended)</li>
                            <li>• GitHub OAuth</li>
                            <li>• Email & Password</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'posts',
        title: 'Posting Content',
        icon: FileText,
        content: (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Posting Content</h1>
                <p className="text-muted-foreground">The core of DevTrace is sharing knowledge through rich posts.</p>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Creating a Post</h2>
                    <p>To create a post, click the <strong>+</strong> button in the navigation or sidebar. You will need:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>Title:</strong> Clear and descriptive.</li>
                        <li><strong>Community:</strong> Choose the most relevant community (e.g., Frontend, Python).</li>
                        <li><strong>Content:</strong> Supports Markdown, code blocks, and images.</li>
                        <li><strong>Tags:</strong> Add up to 4 hashtags (e.g., #react, #tutorial).</li>
                    </ul>

                    <div className="bg-muted/50 border border-border p-4 rounded-xl mt-4">
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><Code className="h-4 w-4" /> Code Snippets</h3>
                        <p className="text-sm">Use standard markdown syntax for code blocks:</p>
                        <pre className="mt-2 bg-black/50 p-3 rounded text-xs font-mono text-muted-foreground">
                            ```python<br />
                            def hello():<br />
                            &nbsp;&nbsp;print("Hello World")<br />
                            ```
                        </pre>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Limits</h2>
                    <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
                        <li>Logged-out users cannot post.</li>
                        <li>Posts must belong to a community.</li>
                        <li>Content quality is monitored; spam may be removed.</li>
                    </ul>
                </section>
            </div>
        )
    },
    {
        id: 'communities',
        title: 'Communities',
        icon: Users,
        content: (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Communities</h1>
                <p className="text-muted-foreground">DevTrace is organized into focused spaces called Communities.</p>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Joining Communities</h2>
                    <p>
                        You can browse all communities from the sidebar or the <Link to="/communities" className="text-primary hover:underline">Communities page</Link>.
                        Click <strong>Join</strong> to subscribe to posts from that community in your home feed.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Post Counts</h2>
                    <p>
                        Each community tracks its total number of posts. This count updates instantly when you or anyone else creates or deletes a post.
                    </p>
                </section>
            </div>
        )
    },
    {
        id: 'highlights',
        title: 'Daily Highlights',
        icon: Zap,
        content: (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Daily Highlights</h1>
                <p className="text-muted-foreground">For ephemeral, day-to-day updates.</p>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">How it Works</h2>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                        <li><strong>One per day:</strong> You can only post ONE highlight every 24 hours (reset at midnight UTC).</li>
                        <li><strong>48-Hour Visibility:</strong> Highlights from Today and Yesterday are visible. Older highlights are automatically hidden.</li>
                        <li><strong>Short & Sweet:</strong> Perfect for "Learned a new regex trick" or "Fixed a bug".</li>
                    </ul>
                </section>
            </div>
        )
    },
    {
        id: 'challenges',
        title: 'Coding Challenges',
        icon: Terminal,
        content: (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Coding Challenges</h1>
                <p className="text-muted-foreground">Community-driven problems to test your skills.</p>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Creating Challenges</h2>
                    <p>Users can contribute challenges. A challenge consists of:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Title & Difficulty (Easy/Medium/Hard)</li>
                        <li>Problem Description (Markdown)</li>
                        <li>Input/Output Formats & Constraints</li>
                        <li>Example Cases</li>
                    </ul>
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mt-4 flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-yellow-500">No Solutions Policy</h3>
                            <p className="text-sm text-yellow-500/90">
                                To keep challenges fair and discussion-driven, we do not host official solutions.
                                Users are encouraged to discuss approaches in the comments.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        )
    },
    {
        id: 'opensource',
        title: 'Open Source',
        icon: Github,
        content: (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Open Source</h1>
                <p className="text-muted-foreground">Discover and showcase projects looking for contributors.</p>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Adding Projects</h2>
                    <p>
                        You can list your own open source projects. You must provide a valid repository URL (GitHub/GitLab).
                        Projects can be tagged as "Beginner-friendly" to attract new contributors.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Stars</h2>
                    <p>
                        DevTrace has its own internal starring system separate from GitHub. Starring a project here helps it trend on the platform.
                    </p>
                </section>
            </div>
        )
    },
    {
        id: 'profile',
        title: 'Profile & Social',
        icon: User,
        content: (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Profile & Social</h1>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Your Developer Card</h2>
                    <p>Your profile acts as your resume on DevTrace. It displays:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Your top skills</li>
                        <li>Engagement stats (followers, likes received)</li>
                        <li>Your post history</li>
                        <li>Bookmarks (private to you)</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Following</h2>
                    <p>
                        Follow other developers to see their posts in your "Following" feed. You can unfollow at any time from their profile.
                    </p>
                </section>
            </div>
        )
    },
    {
        id: 'settings',
        title: 'Settings & Privacy',
        icon: Settings,
        content: (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Settings & Privacy</h1>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold">Managing Your Data</h2>
                    <p>The Settings page allows you to control:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Profile Visibility:</strong> Public or Limited.</li>
                        <li><strong>Email Visibility:</strong> Show or hide your email on your profile.</li>
                        <li><strong>Notifications:</strong> Toggle alerts for likes, comments, and follows.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-destructive">Danger Zone</h2>
                    <p>
                        You can delete your account permanently. This action wipes all your posts, profile data, and interactions. It cannot be undone.
                    </p>
                </section>
            </div>
        )
    },
    {
        id: 'limits',
        title: 'Limits & Permissions',
        icon: Shield,
        content: (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Limits & Permissions</h1>
                <p className="text-muted-foreground">To ensure platform stability and quality.</p>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="border border-border bg-card p-4 rounded-xl">
                        <h3 className="font-semibold mb-2">Guest Users</h3>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>✅ Can view public posts</li>
                            <li>✅ Can browse communities</li>
                            <li>✅ Can view profiles</li>
                            <li>❌ Cannot post or comment</li>
                            <li>❌ Cannot like or star</li>
                        </ul>
                    </div>
                    <div className="border border-border bg-card p-4 rounded-xl">
                        <h3 className="font-semibold mb-2">Logged-in Users</h3>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>✅ Unlimited public posts</li>
                            <li>✅ 1 Daily Highlight / 24hrs</li>
                            <li>✅ Unlimited comments</li>
                            <li>✅ Create Challenges & Projects</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
];

export default function DocsPage() {
    const [selectedDocId, setSelectedDocId] = useState('getting-started');
    const [searchQuery, setSearchQuery] = useState('');

    const activeDoc = docsData.find(d => d.id === selectedDocId) || docsData[0];

    const filteredDocs = useMemo(() => {
        if (!searchQuery) return docsData;
        return docsData.filter(doc =>
            doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            // Simple content text search (naive)
            JSON.stringify(doc.content).toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="mb-8 space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Documentation</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Everything you need to know about navigating and contributing to DevTrace.
                </p>
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search docs..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
                {/* Sidebar */}
                <aside className="hidden lg:block space-y-2 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-4">
                    <nav className="flex flex-col gap-1">
                        {filteredDocs.map(doc => (
                            <Button
                                key={doc.id}
                                variant={selectedDocId === doc.id ? "secondary" : "ghost"}
                                className={cn(
                                    "justify-start gap-3 h-10 font-normal",
                                    selectedDocId === doc.id && "bg-secondary font-medium text-primary"
                                )}
                                onClick={() => setSelectedDocId(doc.id)}
                            >
                                <doc.icon className="h-4 w-4" />
                                {doc.title}
                            </Button>
                        ))}
                        {filteredDocs.length === 0 && (
                            <p className="text-sm text-muted-foreground  py-4 text-center">No results found.</p>
                        )}
                    </nav>
                </aside>

                {/* Mobile Nav (Top) - Visible only on small screens already handled by main layout, 
                    but for docs specific navigation inside the page: */}
                <div className="lg:hidden mb-6 flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                    {filteredDocs.map(doc => (
                        <Button
                            key={doc.id}
                            size="sm"
                            variant={selectedDocId === doc.id ? "secondary" : "outline"}
                            className="whitespace-nowrap gap-2"
                            onClick={() => setSelectedDocId(doc.id)}
                        >
                            <doc.icon className="h-3 w-3" />
                            {doc.title}
                        </Button>
                    ))}
                </div>

                {/* Content Area */}
                <main className="min-h-[500px]">
                    <motion.div
                        key={selectedDocId}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="prose prose-invert max-w-none prose-headings:scroll-mt-20"
                    >
                        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                            {activeDoc.content}
                        </div>
                    </motion.div>

                    {/* Quick Footer Navigation */}
                    <div className="mt-12 flex justify-between pt-8 border-t border-border">
                        {(() => {
                            const index = docsData.findIndex(d => d.id === selectedDocId);
                            const prev = docsData[index - 1];
                            const next = docsData[index + 1];
                            return (
                                <>
                                    <div>
                                        {prev && (
                                            <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all" onClick={() => setSelectedDocId(prev.id)}>
                                                <ChevronRight className="h-4 w-4 rotate-180" />
                                                <div className="text-left">
                                                    <div className="text-xs text-muted-foreground">Previous</div>
                                                    <div className="font-semibold">{prev.title}</div>
                                                </div>
                                            </Button>
                                        )}
                                    </div>
                                    <div>
                                        {next && (
                                            <Button variant="ghost" className="gap-2 pr-0 hover:pr-2 transition-all" onClick={() => setSelectedDocId(next.id)}>
                                                <div className="text-right">
                                                    <div className="text-xs text-muted-foreground">Next</div>
                                                    <div className="font-semibold">{next.title}</div>
                                                </div>
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </main>
            </div>
        </div>
    );
}

// Helper util import placeholder removal
import { cn } from '@/lib/utils';
