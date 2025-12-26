import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share2, Clock, Eye } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { posts } from '@/data/mockData';

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground">Post not found</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back button */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to Feed
          </Button>
        </Link>

        {/* Post Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-border bg-card p-6 lg:p-8"
        >
          {/* Author */}
          <div className="flex items-center gap-4">
            <Link to={`/profile/${post.author.username}`}>
              <img
                src={post.author.avatar}
                alt={post.author.displayName}
                className="h-12 w-12 rounded-full ring-2 ring-primary/20"
              />
            </Link>
            <div>
              <Link
                to={`/profile/${post.author.username}`}
                className="font-semibold text-foreground hover:text-primary transition-colors"
              >
                {post.author.displayName}
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link to={`/community/${post.community.slug}`} className="hover:text-primary">
                  {post.community.icon} {post.community.name}
                </Link>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime} min read
                </span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="mt-6 text-3xl font-bold text-foreground">
            {post.title}
          </h1>

          {/* Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="tag">#{tag}</span>
            ))}
          </div>

          {/* Content */}
          <div className="mt-8 prose prose-invert max-w-none">
            <p className="text-foreground leading-relaxed">
              {post.content}
            </p>
            <p className="text-foreground leading-relaxed mt-4">
              {post.excerpt}
            </p>
            <p className="text-muted-foreground mt-4">
              This is a preview of the post content. Full markdown rendering would be implemented here
              with syntax highlighting for code blocks, proper heading hierarchy, and more.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Heart className="h-4 w-4" />
                {post.likes}
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <MessageCircle className="h-4 w-4" />
                {post.comments}
              </Button>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                {(post.views / 1000).toFixed(1)}k views
              </span>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.article>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="terminal-heading text-lg font-bold">comments</h3>

          <div className="mt-4">
            <Textarea
              placeholder="Share your thoughts..."
              className="min-h-[100px]"
            />
            <div className="mt-3 flex justify-end">
              <Button>Post Comment</Button>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-6">
            <p className="text-center text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default PostPage;
