import {
    Code2,
    Database,
    Layout,
    Server,
    Shield,
    CreditCard,
    Terminal,
    Wrench,
    Cpu,
    Palette,
    Box,
    FileCode,
    Globe,
    Lock,
    Cloud,
    Github,
    Zap,
    BarChart,
    MessageSquare,
} from 'lucide-react';

export interface TechStackItem {
    name: string;
    category: string;
    description: string;
    icon?: any;
    link?: string;
}

export interface TechStackCategory {
    id: string;
    title: string;
    icon: any;
    items: TechStackItem[];
}

export const techStackData: TechStackCategory[] = [
    {
        id: 'frontend',
        title: 'Frontend Stack',
        icon: Layout,
        items: [
            {
                name: 'React',
                category: 'Framework',
                description: 'A JavaScript library for building user interfaces',
                icon: Code2,
                link: 'https://react.dev'
            },
            {
                name: 'Vite',
                category: 'Build Tool',
                description: 'Next Generation Frontend Tooling',
                icon: Zap,
                link: 'https://vitejs.dev'
            },
            {
                name: 'Tailwind CSS',
                category: 'Styling',
                description: 'A utility-first CSS framework for rapid UI development',
                icon: Palette,
                link: 'https://tailwindcss.com'
            },
            {
                name: 'React Query',
                category: 'State Management',
                description: 'Powerful asynchronous state management',
                icon: Database,
                link: 'https://tanstack.com/query'
            },
            {
                name: 'React Hook Form + Zod',
                category: 'Forms & Validation',
                description: 'Performant, flexible and extensible forms with schema validation',
                icon: FileCode,
                link: 'https://react-hook-form.com'
            },
            {
                name: 'Recharts',
                category: 'Charts',
                description: 'Redefined chart library built with React and D3',
                icon: BarChart,
                link: 'https://recharts.org'
            },
            {
                name: 'Lucide Icons',
                category: 'Icons',
                description: 'Beautiful & consistent icon toolkit',
                icon: Box,
                link: 'https://lucide.dev'
            }
        ]
    },
    {
        id: 'backend',
        title: 'Backend Stack',
        icon: Server,
        items: [
            {
                name: 'Node.js',
                category: 'Runtime',
                description: 'JavaScript runtime built on Chrome\'s V8 JavaScript engine',
                icon: Terminal,
                link: 'https://nodejs.org'
            },
            {
                name: 'Supabase',
                category: 'Backend as a Service',
                description: 'The open source Firebase alternative',
                icon: Database,
                link: 'https://supabase.com'
            },
            {
                name: 'REST API',
                category: 'API Architecture',
                description: 'Standard architectural style for APIs',
                icon: Globe,
            },
            {
                name: 'Row Level Security',
                category: 'Security',
                description: 'Granular authorization rules for database rows',
                icon: Shield,
                link: 'https://supabase.com/docs/guides/auth/row-level-security'
            }
        ]
    },
    {
        id: 'database',
        title: 'Database & Data',
        icon: Database,
        items: [
            {
                name: 'PostgreSQL',
                category: 'Database Engine',
                description: 'The World\'s Most Advanced Open Source Relational Database',
                icon: Database,
                link: 'https://postgresql.org'
            },
            {
                name: 'Supabase Realtime',
                category: 'Real-time Sync',
                description: 'Listen to database changes in real-time',
                icon: Zap,
                link: 'https://supabase.com/docs/guides/realtime'
            },
            {
                name: 'Supabase Storage',
                category: 'File Storage',
                description: 'Store and serve large files',
                icon: Cloud,
                link: 'https://supabase.com/storage'
            }
        ]
    },
    {
        id: 'community',
        title: 'Community Tools',
        icon: Globe,
        items: [
            {
                name: 'React Markdown',
                category: 'Editor',
                description: 'Markdown component for React',
                icon: FileCode,
                link: 'https://github.com/remarkjs/react-markdown'
            },
            {
                name: 'Reactions & Comments',
                category: 'Interaction',
                description: 'Custom implementation for community engagement',
                icon: MessageSquare
            }
        ]
    },
    {
        id: 'auth',
        title: 'Auth & Profile',
        icon: Shield,
        items: [
            {
                name: 'Supabase Auth',
                category: 'Auth Provider',
                description: 'Complete user management system',
                icon: Lock,
                link: 'https://supabase.com/auth'
            }
        ]
    },
    {
        id: 'infrastructure',
        title: 'Infrastructure',
        icon: Cloud,
        items: [
            {
                name: 'Vercel',
                category: 'Hosting',
                description: 'Develop. Preview. Ship.',
                icon: Globe,
                link: 'https://vercel.com'
            },
            {
                name: 'GitHub Actions',
                category: 'CI/CD',
                description: 'Automate your workflow from idea to production',
                icon: Github,
                link: 'https://github.com/features/actions'
            }
        ]
    },
    {
        id: 'devtools',
        title: 'Developer Tools',
        icon: Wrench,
        items: [
            {
                name: 'Git + GitHub',
                category: 'Version Control',
                description: 'Distributed version control',
                icon: Github,
                link: 'https://github.com'
            },
            {
                name: 'ESLint',
                category: 'Linting',
                description: 'Find and fix problems in your JavaScript code',
                icon: Code2,
                link: 'https://eslint.org'
            },
            {
                name: 'TypeScript',
                category: 'Language',
                description: 'JavaScript with syntax for types',
                icon: Code2,
                link: 'https://typescriptlang.org'
            }
        ]
    }
];
