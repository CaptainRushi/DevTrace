import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Send, Loader2, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from "@/lib/supabase";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const CreateChallengePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        difficulty: 'easy',
        description: '',
        input_format: '',
        output_format: '',
        example_input: '',
        example_output: '',
        constraints: '',
        solution: '',
        tags: '',
        language_category: 'DSA'
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePublish = async () => {
        if (!user) {
            toast.error("You must be logged in to create a challenge");
            return;
        }

        // Basic validation
        if (!formData.title || !formData.description || !formData.difficulty || !formData.example_input || !formData.example_output) {
            toast.error("Please fill in all required fields (including examples)");
            return;
        }
        if (formData.title.length < 10) {
            toast.error("Title must be at least 10 characters");
            return;
        }
        if (formData.description.length < 100) {
            toast.error("Description is too short (min 100 chars)");
            return;
        }

        setIsSubmitting(true);
        try {
            // Construct examples JSON
            const examples = JSON.stringify([{
                input: formData.example_input,
                output: formData.example_output
            }]);

            const { error } = await supabase.from('challenges').insert({
                title: formData.title,
                difficulty: formData.difficulty,
                description: formData.description,
                input_format: formData.input_format,
                output_format: formData.output_format,
                examples: examples,
                constraints: formData.constraints,
                solution: formData.solution || null,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                language_category: formData.language_category,
                user_id: user.id,
                is_default: false
            });

            if (error) throw error;

            toast.success("Challenge created successfully!");
            navigate('/challenges');
        } catch (e) {
            console.error("Create challenge error", e);
            toast.error("Failed to create challenge");
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
                        <h1 className="text-2xl font-bold text-foreground">Create Challenge</h1>
                        <p className="text-muted-foreground">Contribute a problem to the community</p>
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl border border-border bg-card p-6 space-y-6"
                >
                    {/* Title & Difficulty */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Challenge Title *</Label>
                            <Input
                                placeholder="e.g., Valid Palindrome"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Difficulty *</Label>
                            <Select
                                value={formData.difficulty}
                                onValueChange={(val) => handleInputChange('difficulty', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Problem Description (Markdown) *</Label>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Info className="h-3 w-3" /> Supports Markdown
                            </span>
                        </div>
                        <Textarea
                            placeholder="Describe the problem, logic, and goals..."
                            className="min-h-[200px] font-mono text-sm"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                    </div>

                    {/* Example Case */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Example Input *</Label>
                            <Textarea
                                placeholder="e.g. nums = [2,7,11,15], target = 9"
                                className="min-h-[100px] font-mono text-sm"
                                value={formData.example_input}
                                onChange={(e) => handleInputChange('example_input', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Example Output *</Label>
                            <Textarea
                                placeholder="e.g. [0,1]"
                                className="min-h-[100px] font-mono text-sm"
                                value={formData.example_output}
                                onChange={(e) => handleInputChange('example_output', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Input/Output Format */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Input Format</Label>
                            <Textarea
                                placeholder="e.g. A single integer N..."
                                className="min-h-[100px]"
                                value={formData.input_format}
                                onChange={(e) => handleInputChange('input_format', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Output Format</Label>
                            <Textarea
                                placeholder="e.g. Return an array of strings..."
                                className="min-h-[100px]"
                                value={formData.output_format}
                                onChange={(e) => handleInputChange('output_format', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Constraints */}
                    <div className="space-y-2">
                        <Label>Constraints</Label>
                        <Input
                            placeholder="e.g. 1 <= N <= 1000"
                            value={formData.constraints}
                            onChange={(e) => handleInputChange('constraints', e.target.value)}
                        />
                    </div>

                    {/* Meta */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Tags (comma separated)</Label>
                            <Input
                                placeholder="Array, DP, String"
                                value={formData.tags}
                                onChange={(e) => handleInputChange('tags', e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={formData.language_category}
                                onValueChange={(val) => handleInputChange('language_category', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DSA">Data Structures & Algorithms</SelectItem>
                                    <SelectItem value="Frontend">Frontend</SelectItem>
                                    <SelectItem value="Backend">Backend</SelectItem>
                                    <SelectItem value="SQL">SQL</SelectItem>
                                    <SelectItem value="System Design">System Design</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Reference Solution */}
                    <div className="space-y-2">
                        <Label>Reference Solution (Optional)</Label>
                        <Textarea
                            placeholder="Share the optimal approach or code..."
                            className="min-h-[150px] font-mono text-sm"
                            value={formData.solution}
                            onChange={(e) => handleInputChange('solution', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Visible only after users attempt the challenge (future feature) or on details page.</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                        <Button variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button className="gap-1.5" onClick={handlePublish} disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            Publish Challenge
                        </Button>
                    </div>

                </motion.div>
            </div>
        </>
    );
};

export default CreateChallengePage;
