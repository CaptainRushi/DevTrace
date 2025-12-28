import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, MapPin, Globe, Loader2, Send, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from "@/lib/supabase";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CreateJobPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        job_title: '',
        job_type: 'full-time',
        location: '',
        company_name: '',
        description: '',
        apply_link: '',
        tags: '',
        duration: '7'
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePublish = async () => {
        if (!user) {
            toast.error("You must be logged in to post a job");
            return;
        }

        // Validation
        if (!formData.job_title || !formData.company_name || !formData.location || !formData.apply_link || !formData.description) {
            toast.error("Please fill in all required fields");
            return;
        }
        if (!formData.apply_link.startsWith('http')) {
            toast.error("Apply link must start with http/https");
            return;
        }
        if (formData.description.length < 50) {
            toast.error("Description should be more detailed (min 50 chars)");
            return;
        }

        setIsSubmitting(true);
        try {
            // Calculate expiry
            const days = parseInt(formData.duration);
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + days);

            const { error } = await supabase.from('job_posts').insert({
                role: formData.job_title,
                type: formData.job_type,
                location: formData.location,
                company: formData.company_name,
                description: formData.description,
                apply_link: formData.apply_link,
                stack: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                user_id: user.id,
                expires_at: expiresAt.toISOString()
            });

            if (error) throw error;

            toast.success("Job posted successfully!");
            navigate('/jobs');
        } catch (e) {
            console.error("Post job error", e);
            toast.error("Failed to post job");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <div className="max-w-3xl mx-auto space-y-6 pb-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4"
                >
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Post a Job</h1>
                        <p className="text-muted-foreground">Find talent for your team</p>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl border border-border bg-card p-6 space-y-6"
                >
                    {/* Role & Company */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Job Title *</Label>
                            <Input
                                placeholder="e.g. Senior Frontend Engineer"
                                value={formData.job_title}
                                onChange={(e) => handleInputChange('job_title', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Company Name *</Label>
                            <Input
                                placeholder="e.g. Acme Corp"
                                value={formData.company_name}
                                onChange={(e) => handleInputChange('company_name', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Type & Location */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Job Type *</Label>
                            <Select
                                value={formData.job_type}
                                onValueChange={(val) => handleInputChange('job_type', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="full-time">Full-time</SelectItem>
                                    <SelectItem value="remote">Remote</SelectItem>
                                    <SelectItem value="freelance">Freelance</SelectItem>
                                    <SelectItem value="internship">Internship</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Location *</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="e.g. Bangalore, India or 'Remote'"
                                    className="pl-9"
                                    value={formData.location}
                                    onChange={(e) => handleInputChange('location', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Duration Selection */}
                    <div className="space-y-2">
                        <Label>Listing Duration</Label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Select
                                value={formData.duration}
                                onValueChange={(val) => handleInputChange('duration', val)}
                            >
                                <SelectTrigger className="pl-9">
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">7 Days</SelectItem>
                                    <SelectItem value="14">14 Days</SelectItem>
                                    <SelectItem value="30">30 Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="text-xs text-muted-foreground">Job will automatically expire after this period.</p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label>Job Description (Markdown) *</Label>
                        <Textarea
                            placeholder="Responsibilities, requirements, benefits..."
                            className="min-h-[200px] font-mono text-sm"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                    </div>

                    {/* Link & Tags */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Apply Link *</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="https://..."
                                    className="pl-9"
                                    value={formData.apply_link}
                                    onChange={(e) => handleInputChange('apply_link', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Tags (Optional)</Label>
                            <Input
                                placeholder="React, Node.js, Startup"
                                value={formData.tags}
                                onChange={(e) => handleInputChange('tags', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                        <Button variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button className="gap-1.5" onClick={handlePublish} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Post Job
                        </Button>
                    </div>

                </motion.div>
            </div>
        </>
    );
};

export default CreateJobPage;
