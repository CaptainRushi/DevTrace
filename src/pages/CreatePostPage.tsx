import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Image, Code, Link2, Send, Loader2, Upload, X } from 'lucide-react';

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
import { supabase } from "@/lib/supabase";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CodeInsertionDialog } from '@/components/posts/CodeInsertionDialog';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [postType, setPostType] = useState('journey');
  const [communitySlug, setCommunitySlug] = useState(searchParams.get('community') || '');
  const [communities, setCommunities] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(true);
  const [showCodeDialog, setShowCodeDialog] = useState(false);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const { data, error } = await supabase.from('communities').select('*');
        if (error) throw error;
        setCommunities(data || []);
      } catch (e) {
        console.error("Failed to load communities", e);
      } finally {
        setIsLoadingCommunities(false);
      }
    };
    fetchCommunities();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (300KB)
    if (file.size > 300 * 1024) {
      toast.error("Image too large. Max size is 300KB.");
      return;
    }

    // Validate type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error("Only JPG, PNG and WEBP formats are allowed.");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post-covers')
        .getPublicUrl(filePath);

      setCoverImageUrl(publicUrl);
      toast.success("Cover image uploaded!");
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!user) {
      toast.error("You must be logged in to post");
      return;
    }
    // Content Word Limit Check
    const wordCount = content.trim().split(/\s+/).length;
    if (wordCount > 1000) {
      toast.error(`Post content exceeds limit (${wordCount}/1000 words).`);
      return;
    }

    // Verify community selection strictly
    if (!communitySlug) {
      toast.error("Please select a community to post in.");
      return;
    }

    if (!title || !content) {
      toast.error("Please fill in Title and Content");
      return;
    }

    // Strict: No images in content
    if (content.match(/!\[.*?\]\(.*?\)/) || content.match(/<img.*?src=.*?>/)) {
      toast.error("Images are not allowed inside post content. Use a cover image instead.");
      return;
    }

    if (hashtags.length > 4) {
      toast.error("Maximum 4 hashtags allowed.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Find community ID
      const community = communities.find(c => c.slug === communitySlug);
      if (!community) throw new Error("Invalid community selected");

      const { error } = await supabase.from('posts').insert({
        title,
        content,
        // type: postType, 
        type: postType,
        hashtags, // Array of strings
        user_id: user.id, // Using correct column name from schema
        community_id: community.id,
        cover_image_url: coverImageUrl || null,
        created_at: new Date().toISOString()
      });

      if (error) throw error;

      toast.success("Post published successfully!");
      navigate(`/community/${communitySlug}`); // Redirect to the community page
    } catch (e) {
      console.error("Publish error", e);
      toast.error("Failed to publish post");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const value = hashtagInput.trim().toLowerCase();

      if (!value) return;

      if (!value.startsWith('#')) {
        toast.error("Hashtags must start with #");
        return;
      }

      if (value.length < 2) return; // just '#'

      // Letters and numbers only after #
      if (!/^#[a-z0-9]+$/.test(value)) {
        toast.error("Hashtags can only contain letters and numbers.");
        return;
      }

      if (hashtags.includes(value)) {
        setHashtagInput('');
        return;
      }

      if (hashtags.length >= 4) {
        toast.error("You can add up to 4 hashtags per post.");
        return;
      }

      setHashtags([...hashtags, value]);
      setHashtagInput('');
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  return (
    <>
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
          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image (Max 300KB)</Label>
            {coverImageUrl ? (
              <div className="relative rounded-lg overflow-hidden border border-border w-full h-48 bg-muted">
                <img src={coverImageUrl} alt="Cover" className="h-full w-full object-cover" />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => setCoverImageUrl('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Input
                    id="cover-upload"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                  />
                  <Button
                    variant="outline"
                    className="gap-2 w-full sm:w-auto"
                    onClick={() => document.getElementById('cover-upload')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Upload Cover Image
                  </Button>
                  <span className="text-sm text-muted-foreground">JPG, PNG, WEBP allowed.</span>
                </div>
              </div>
            )}
          </div>

          {/* Post Type & Community */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Post Type</Label>
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="journey">Experience / Journey</SelectItem>
                  <SelectItem value="question">Question</SelectItem>
                  <SelectItem value="tool">Tool Recommendation</SelectItem>
                  <SelectItem value="challenge">Challenge</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Community</Label>
              <Select value={communitySlug} onValueChange={setCommunitySlug} disabled={isLoadingCommunities}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingCommunities ? "Loading..." : "Select community"} />
                </SelectTrigger>
                <SelectContent>
                  {communities.map((c) => (
                    <SelectItem key={c.id} value={c.slug}>
                      <span className="flex items-center gap-2">
                        {/* <span>{c.icon}</span> */}
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              placeholder="Write your post content here... Markdown is supported!"
              className="min-h-[300px] font-mono text-sm"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <Label>Hashtags ({hashtags.length}/4)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {hashtags.map(tag => (
                <span key={tag} className="bg-primary/10 text-primary px-2 py-1 rounded-full text-sm flex items-center gap-1">
                  {tag}
                  <button onClick={() => removeHashtag(tag)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <Input
              placeholder="Type #hashtag and press Enter (max 4)"
              value={hashtagInput}
              onChange={(e) => setHashtagInput(e.target.value)}
              onKeyDown={handleHashtagKeyDown}
              disabled={hashtags.length >= 4}
            />
            <p className="text-xs text-muted-foreground">
              Format: #hashtag (letters and numbers only)
            </p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 border-t border-border pt-4">
            {/* Image button removed */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setShowCodeDialog(true)}
            >
              <Code className="h-4 w-4" />
              Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => setContent(prev => prev + "[Link Text](https://example.com)")}
            >
              <Link2 className="h-4 w-4" />
              Link
            </Button>
            <span className="text-xs text-muted-foreground ml-auto">
              No images allowed in content. Use cover image.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button variant="ghost">Save Draft</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate(-1)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button className="gap-1.5" onClick={handlePublish} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Publish Post
              </Button>
            </div>
          </div>
        </motion.div>

        <CodeInsertionDialog
          open={showCodeDialog}
          onOpenChange={setShowCodeDialog}
          onInsert={(language, code) => {
            setContent(prev => prev + `\n\`\`\`${language}\n${code}\n\`\`\`\n`);
          }}
        />
      </div>
    </>
  );
};

export default CreatePostPage;
