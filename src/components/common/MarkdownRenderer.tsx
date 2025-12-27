import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import { Check, Copy, Terminal } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={cn("prose prose-invert max-w-none", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Custom Code Block Renderer
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        const language = match ? match[1] : 'text';
                        const codeString = String(children).replace(/\n$/, '');

                        if (!inline && match) {
                            return (
                                <CodeBlock language={language} code={codeString} />
                            );
                        }

                        // Inline code
                        return (
                            <code className={cn("bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-primary", className)} {...props}>
                                {children}
                            </code>
                        );
                    },
                    // Custom Paragraph Renderer to enforce styles (opacity/font)
                    p: ({ children }) => <p className="leading-relaxed mb-4 text-foreground/90 font-iceland text-xl">{children}</p>,
                    // Custom Headers
                    h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4 font-iceland text-primary">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-2xl font-semibold mt-6 mb-3 font-iceland text-primary/90">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-xl font-semibold mt-4 mb-2 font-iceland">{children}</h3>,
                    // Custom Links
                    a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline underline-offset-4">
                            {children}
                        </a>
                    ),
                    // Lists
                    ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
                    li: ({ children }) => <li className="pl-1">{children}</li>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

// Separate component for the Code Card logic (Copy, ID, etc)
function CodeBlock({ language, code }: { language: string; code: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-6 rounded-lg overflow-hidden border border-border/50 bg-[#1e1e1e] shadow-xl">
            {/* Code Header / Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-border/10">
                <div className="flex items-center gap-2">
                    {/* Window dots for aesthetics */}
                    <div className="flex gap-1.5 mr-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                    </div>
                    <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
                        {language}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/10"
                    onClick={handleCopy}
                >
                    {copied ? (
                        <>
                            <Check className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="mr-1.5 h-3.5 w-3.5" />
                            Copy
                        </>
                    )}
                </Button>
            </div>

            {/* Syntax Highlighter */}
            <div className="relative group">
                <SyntaxHighlighter
                    language={language}
                    style={vscDarkPlus}
                    customStyle={{
                        margin: 0,
                        padding: '1.5rem',
                        background: 'transparent',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        fontFamily: '"JetBrains Mono", monospace',
                    }}
                    showLineNumbers={true}
                    lineNumberStyle={{ minWidth: '2em', paddingRight: '1em', color: '#6e7681', textAlign: 'right' }}
                    wrapLines={true}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}
