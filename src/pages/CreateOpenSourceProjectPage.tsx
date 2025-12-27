import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { createOpenSourceProject } from '@/services/api';
import { Github, Loader2 } from 'lucide-react';

const formSchema = z.object({
    project_name: z.string().min(2, "Project name is too short"),
    repo_url: z.string().url("Must be a valid URL").regex(/^https?:\/\/(www\.)?(github\.com|gitlab\.com)\/.*$/, "Must be a GitHub or GitLab repository"),
    description: z.string().min(10, "Description must be at least 10 characters").max(300, "Description max 300 characters"),
    tech_stack: z.string().min(2, "Add at least one technology (comma separated)"),
    contribution_type: z.string(),
    license: z.string().optional(),
    hashtags: z.string().optional(),
});

export default function CreateOpenSourceProjectPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            project_name: "",
            repo_url: "",
            description: "",
            tech_stack: "",
            contribution_type: "Beginner-friendly",
            license: "",
            hashtags: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            // Process arrays
            const techStackArray = values.tech_stack.split(',').map(s => s.trim()).filter(Boolean);
            const hashtagsArray = values.hashtags ? values.hashtags.split(/[ ,]+/).map(s => s.trim().replace(/^#/, '')).filter(Boolean).slice(0, 4) : [];

            await createOpenSourceProject(supabase, {
                project_name: values.project_name,
                repo_url: values.repo_url,
                description: values.description,
                tech_stack: techStackArray,
                contribution_type: values.contribution_type,
                license: values.license || undefined,
                hashtags: hashtagsArray,
            });

            toast.success("Project submitted successfully!");
            navigate('/open-source');
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit project. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="max-w-2xl mx-auto py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Submit Open Source Project</h1>
                    <p className="text-muted-foreground">
                        Share your project with the community. Make sure it's public and valid.
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 md:p-8">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            <FormField
                                control={form.control}
                                name="project_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. React Flow" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="repo_url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Repository URL</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input placeholder="https://github.com/username/repo" className="pl-10" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormDescription>Must be a public GitHub or GitLab URL</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Short Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="What does your project do?"
                                                className="resize-none h-24"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription className="flex justify-end">
                                            {field.value.length}/300
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="tech_stack"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tech Stack</FormLabel>
                                            <FormControl>
                                                <Input placeholder="React, TypeScript, Rust" {...field} />
                                            </FormControl>
                                            <FormDescription>Comma separated</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="contribution_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contribution Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Beginner-friendly">Beginner Friendly</SelectItem>
                                                    <SelectItem value="Good first issue">Good First Issue</SelectItem>
                                                    <SelectItem value="Actively maintained">Actively Maintained</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="license"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>License (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="MIT, Apache 2.0" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="hashtags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hashtags (Max 4)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="#opensource #web" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Project
                                </Button>
                            </div>

                        </form>
                    </Form>
                </div>
            </div>
        </>
    );
}
