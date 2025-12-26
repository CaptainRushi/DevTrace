import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Image, Code, Link2, Send } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
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
import { communities } from '@/data/mockData';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [postType, setPostType] = useState('experience');
  const [community, setCommunity] = useState('');

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
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
            <h1 className="text-2xl font-bold text-foreground">Create Post</h1>
            <p className="text-muted-foreground">Share your knowledge with the community</p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card p-6 space-y-6"
        >
          {/* Post Type & Community */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Post Type</Label>
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="experience">Experience / Journey</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="tool">Tool Recommendation</SelectItem>
                  <SelectItem value="challenge">Challenge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Community</Label>
              <Select value={community} onValueChange={setCommunity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select community" />
                </SelectTrigger>
                <SelectContent>
                  {communities.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      <span className="flex items-center gap-2">
                        <span>{c.icon}</span>
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              placeholder="What's your post about?"
              className="text-lg"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              placeholder="Write your post content here... Markdown is supported!"
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <Input
              placeholder="Add tags separated by commas (e.g., React, TypeScript, Tutorial)"
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 border-t border-border pt-4">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Image className="h-4 w-4" />
              Image
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Code className="h-4 w-4" />
              Code
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Link2 className="h-4 w-4" />
              Link
            </Button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button variant="ghost">Save Draft</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button className="gap-1.5">
                <Send className="h-4 w-4" />
                Publish Post
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default CreatePostPage;
