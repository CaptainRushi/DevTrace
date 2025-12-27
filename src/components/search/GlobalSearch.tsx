import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, User, Hash, Briefcase, FileText, Layers, Github } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { globalSearch } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
// import { useDebounce } from '@/hooks/use-debounce'; // Removed external dependency, using inline hook

// Simple debounce hook if not present in codebase
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);
    return debouncedValue;
}

export function GlobalSearch() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const debouncedQuery = useDebounceValue(query, 300);

    useEffect(() => {
        const fetchResults = async () => {
            if (!debouncedQuery.trim()) {
                setResults(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const data = await globalSearch(supabase, debouncedQuery);
                setResults(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [debouncedQuery]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (path: string) => {
        navigate(path);
        setOpen(false);
        setQuery('');
    };

    const hasResults = results && (results.posts.length > 0 || results.users.length > 0 || results.communities.length > 0 || results.projects.length > 0);

    return (
        <div className="relative w-full max-w-sm" ref={containerRef}>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full pl-9 bg-muted/40 focus:bg-background"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                />
                {loading && (
                    <div className="absolute right-2.5 top-2.5">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {open && query.trim().length > 0 && (
                <div className="absolute top-full mt-2 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 z-50 overflow-hidden">
                    {loading && !results ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
                    ) : hasResults ? (
                        <div className="max-h-[400px] overflow-y-auto py-2">
                            {/* Users */}
                            {results.users.length > 0 && (
                                <div className="px-2 py-1">
                                    <h4 className="px-2 pb-1 text-xs font-semibold text-muted-foreground">Users</h4>
                                    {results.users.map((user: any) => (
                                        <button
                                            key={user.id}
                                            onClick={() => handleSelect(`/profile/${user.username}`)}
                                            className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                                        >
                                            <User className="h-4 w-4 opacity-50" />
                                            <span>{user.username}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Posts */}
                            {results.posts.length > 0 && (
                                <div className="px-2 py-1">
                                    <h4 className="px-2 pb-1 text-xs font-semibold text-muted-foreground">Posts</h4>
                                    {results.posts.map((post: any) => (
                                        <button
                                            key={post.id}
                                            onClick={() => handleSelect(`/post/${post.id}`)}
                                            className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground text-left"
                                        >
                                            <FileText className="h-4 w-4 opacity-50" />
                                            <span className="truncate">{post.title}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Communities */}
                            {results.communities.length > 0 && (
                                <div className="px-2 py-1">
                                    <h4 className="px-2 pb-1 text-xs font-semibold text-muted-foreground">Communities</h4>
                                    {results.communities.map((comm: any) => (
                                        <button
                                            key={comm.id}
                                            onClick={() => handleSelect(`/community/${comm.slug}`)}
                                            className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                                        >
                                            <Layers className="h-4 w-4 opacity-50" />
                                            <span>{comm.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Projects */}
                            {results.projects.length > 0 && (
                                <div className="px-2 py-1">
                                    <h4 className="px-2 pb-1 text-xs font-semibold text-muted-foreground">Projects</h4>
                                    {results.projects.map((proj: any) => (
                                        <button
                                            key={proj.id}
                                            onClick={() => handleSelect(`/open-source`)} // Just go to list for now or specific if we had page
                                            className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                                        >
                                            <Github className="h-4 w-4 opacity-50" />
                                            <span>{proj.project_name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No results found.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
