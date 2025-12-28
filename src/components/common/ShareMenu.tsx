import { useState } from 'react';
import {
    Share2,
    Twitter,
    Linkedin,
    MessageCircle,
    Send as Telegram,
    Link as CopyIcon,
    Facebook,
    Check
} from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ShareMenuProps {
    title: string;
    path: string; // e.g. /post/123
    trigger?: React.ReactNode;
}

export const ShareMenu = ({ title, path, trigger }: ShareMenuProps) => {
    const [copied, setCopied] = useState(false);
    const baseUrl = "https://devtrace.com";
    const shareUrl = `${baseUrl}${path}`;
    const shareText = `${title} 🚀 via DevTrace`;

    const platforms = [
        {
            name: 'X (Twitter)',
            icon: Twitter,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
            color: 'hover:text-sky-500'
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
            color: 'hover:text-blue-600'
        },
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            url: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
            color: 'hover:text-green-500'
        },
        {
            name: 'Telegram',
            icon: Telegram,
            url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
            color: 'hover:text-sky-400'
        },
        {
            name: 'Reddit',
            icon: ({ className }: { className?: string }) => (
                <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.056 1.597.04.21.06.42.06.645 0 2.846-3.75 5.161-8.358 5.161-4.607 0-8.357-2.315-8.357-5.161 0-.225.02-.435.06-.645a1.751 1.751 0 0 1-1.056-1.597c0-.968.786-1.754 1.754-1.754.463 0 .89.182 1.207.491 1.207-.856 2.846-1.404 4.674-1.488l.8-3.747a1.25 1.25 0 0 1 1.249-1.249c.036 0 .07 0 .103.003L15.655 4.7c.023-.71.606-1.256 1.355-1.256zM9 11.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zm6 0a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zM12 18c-2.454 0-3.39-1.341-3.535-1.53a.75.75 0 1 1 1.2-.9c.026.035.7.83 2.335.83 1.635 0 2.309-.795 2.335-.83a.75.75 0 0 1 1.2.9c-.145.189-1.081 1.53-3.335 1.53z" />
                </svg>
            ),
            url: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`,
            color: 'hover:text-orange-600'
        },
        {
            name: 'Facebook',
            icon: Facebook,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            color: 'hover:text-blue-700'
        }
    ];

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success("Link copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy link");
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full border border-border hover:bg-muted">
                        <Share2 className="h-4 w-4" />
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
                <div className="grid grid-cols-1 gap-1">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Share to
                    </div>
                    {platforms.map((platform) => (
                        <a
                            key={platform.name}
                            href={platform.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent ${platform.color}`}
                        >
                            <platform.icon className="h-4 w-4 shrink-0" />
                            <span>{platform.name}</span>
                        </a>
                    ))}
                    <div className="my-1 h-px bg-border" />
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent text-primary font-medium"
                    >
                        {copied ? <Check className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                        <span>{copied ? "Copied!" : "Copy Link"}</span>
                    </button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
