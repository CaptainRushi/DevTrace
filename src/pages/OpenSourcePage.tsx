import { useState, useEffect } from 'react';

import { OpenSourceProjectCard } from '@/components/opensource/OpenSourceProjectCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Filter, Github, Loader2 } from 'lucide-react';
import { getOpenSourceProjects, OpenSourceProject } from '@/services/api';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export default function OpenSourcePage() {
    const [projects, setProjects] = useState<OpenSourceProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'beginner', 'maintained'
    const { user } = useAuth();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await getOpenSourceProjects(supabase);
            setProjects(data as OpenSourceProject[]);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(project => {
        const matchesSearch =
            project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.tech_stack.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesFilter =
            filter === 'all' ? true :
                filter === 'beginner' ? project.contribution_type === 'Beginner-friendly' :
                    filter === 'maintained' ? project.contribution_type === 'Actively maintained' :
                        true;

        return matchesSearch && matchesFilter;
    });

    return (
        <>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-3xl font-bold text-foreground">Open Source</h1>
                        <p className="text-muted-foreground mt-1">Discover, contribute, and share community-driven projects.</p>
                    </motion.div>
                    {user ? (
                        <Button asChild className="gap-2">
                            <Link to="/open-source/new">
                                <Plus className="h-4 w-4" />
                                Add Project
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild variant="secondary" className="gap-2">
                            <Link to="/auth">
                                Sign In to Add Project
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search projects by name, stack, description..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Tabs value={filter} onValueChange={setFilter} className="w-full md:w-auto">
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="beginner">Beginner Friendly</TabsTrigger>
                            <TabsTrigger value="maintained">Actively Maintained</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* content */}
                {loading ? (
                    <div className="flex h-60 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredProjects.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredProjects.map((project) => (
                            <OpenSourceProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
                        <Github className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">No projects found</h3>
                        <p className="text-muted-foreground mt-2">
                            {searchQuery ? "Try adjusting your search terms." : "Be the first to share an open source project!"}
                        </p>
                        {!searchQuery && user && (
                            <Button asChild className="mt-6">
                                <Link to="/open-source/new">Add Project</Link>
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
