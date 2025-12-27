import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Code2, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeInsertionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onInsert: (language: string, code: string) => void;
}

const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'sql', label: 'SQL' },
    { value: 'graphql', label: 'GraphQL' },
    { value: 'bash', label: 'Bash' },
    { value: 'dockerfile', label: 'Dockerfile' },
    { value: 'yaml', label: 'YAML' },
    { value: 'nginx', label: 'NGINX' },
    { value: 'text', label: 'Plain Text' },
];

export function CodeInsertionDialog({ open, onOpenChange, onInsert }: CodeInsertionDialogProps) {
    const [language, setLanguage] = useState<string>('javascript'); // Default
    const [code, setCode] = useState('');
    const [openCombobox, setOpenCombobox] = useState(false);

    const handleInsert = () => {
        if (!code.trim()) return;
        onInsert(language, code);
        setCode(''); // Reset
        onOpenChange(false);
    };

    const selectedLanguageLabel = languages.find((l) => l.value === language)?.label;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-6 overflow-hidden">
                <DialogHeader className="px-0">
                    <DialogTitle className="flex items-center gap-2">
                        <Code2 className="h-5 w-5 text-primary" />
                        Insert Code Block
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 flex-1 min-h-0">
                    {/* Language Selector */}
                    <div className="flex flex-col gap-2">
                        <Label>Language</Label>
                        <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openCombobox}
                                    className="w-[250px] justify-between"
                                >
                                    {selectedLanguageLabel || "Select language..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[250px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search language..." />
                                    <CommandList>
                                        <CommandEmpty>No language found.</CommandEmpty>
                                        <CommandGroup>
                                            {languages.map((l) => (
                                                <CommandItem
                                                    key={l.value}
                                                    value={l.label} // Use label for better searching interaction? No, value usually is what you search.
                                                    // CMDK issue: Use the value prop for unique ID/Search
                                                    onSelect={() => {
                                                        setLanguage(l.value);
                                                        setOpenCombobox(false);
                                                    }}
                                                >
                                                    <Check
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            language === l.value ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {l.label}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Editor Area */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
                        {/* Input */}
                        <div className="flex flex-col gap-2 h-full">
                            <Label>Code</Label>
                            <Textarea
                                placeholder={`// Paste or type your ${selectedLanguageLabel} code here...`}
                                className="flex-1 font-mono text-sm resize-none bg-muted/50 focus-visible:ring-1"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                spellCheck={false}
                            />
                        </div>

                        {/* Preview */}
                        <div className="flex flex-col gap-2 h-full min-h-0 overflow-hidden hidden md:flex">
                            <Label>Preview</Label>
                            <div className="flex-1 rounded-md border border-border bg-[#1e1e1e] overflow-auto relative custom-scrollbar">
                                <SyntaxHighlighter
                                    language={language}
                                    style={vscDarkPlus}
                                    customStyle={{
                                        margin: 0,
                                        padding: '1rem',
                                        background: 'transparent',
                                        fontSize: '0.8rem',
                                        fontFamily: '"JetBrains Mono", monospace',
                                    }}
                                    showLineNumbers={true}
                                    wrapLines={true}
                                >
                                    {code || '// Preview will appear here'}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleInsert} disabled={!code.trim()}>
                        Insert Code
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
