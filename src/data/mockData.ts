// Mock data for the developer community platform

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  tags: string[];
  memberCount: number;
  postCount: number;
  color: string;
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  skills: string[];
  joinedDate: string;
  postCount: number;
  reputation: number;
}

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: User;
  community: Community;
  type: 'experience' | 'question' | 'tool' | 'job' | 'challenge';
  tags: string[];
  createdAt: string;
  readTime: number;
  likes: number;
  comments: number;
  views: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  type: 'full-time' | 'freelance' | 'remote' | 'internship';
  techStack: string[];
  salary?: string;
  applyLink: string;
  postedAt: string;
  community: Community;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  author: User;
  submissions: number;
  createdAt: string;
}

export interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  useCase: string;
  pros: string[];
  cons: string[];
  upvotes: number;
  website: string;
  icon: string;
}

export interface DailyHighlight {
  id: string;
  author: User;
  content: string;
  reactions: { emoji: string; count: number }[];
  createdAt: string;
}

export const communities: Community[] = [
  {
    id: '1',
    name: 'Frontend',
    slug: 'frontend',
    description: 'React, Vue, Angular, and everything frontend',
    icon: '⚛️',
    tags: ['React', 'Vue', 'Angular', 'TypeScript', 'CSS'],
    memberCount: 45230,
    postCount: 12450,
    color: 'hsl(200, 80%, 55%)',
  },
  {
    id: '2',
    name: 'Backend',
    slug: 'backend',
    description: 'Node.js, Django, Spring, and server-side magic',
    icon: '🔧',
    tags: ['Node.js', 'Python', 'Java', 'Go', 'Rust'],
    memberCount: 38120,
    postCount: 9870,
    color: 'hsl(145, 70%, 45%)',
  },
  {
    id: '3',
    name: 'Mobile',
    slug: 'mobile',
    description: 'Android, iOS, Flutter, React Native',
    icon: '📱',
    tags: ['Android', 'iOS', 'Flutter', 'React Native', 'Swift'],
    memberCount: 22450,
    postCount: 5670,
    color: 'hsl(280, 60%, 60%)',
  },
  {
    id: '4',
    name: 'DevOps & Cloud',
    slug: 'devops',
    description: 'AWS, GCP, Azure, Docker, Kubernetes',
    icon: '☁️',
    tags: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    memberCount: 28900,
    postCount: 7230,
    color: 'hsl(35, 90%, 55%)',
  },
  {
    id: '5',
    name: 'AI / ML',
    slug: 'ai-ml',
    description: 'Machine Learning, Deep Learning, Data Science',
    icon: '🤖',
    tags: ['Python', 'TensorFlow', 'PyTorch', 'LLMs', 'NLP'],
    memberCount: 35670,
    postCount: 8920,
    color: 'hsl(320, 60%, 55%)',
  },
  {
    id: '6',
    name: 'Open Source',
    slug: 'open-source',
    description: 'Contributing to and building open source projects',
    icon: '🌐',
    tags: ['GitHub', 'OSS', 'Community', 'Contributions'],
    memberCount: 19870,
    postCount: 4560,
    color: 'hsl(175, 80%, 50%)',
  },
  {
    id: '7',
    name: 'System Design',
    slug: 'system-design',
    description: 'Architecture, scalability, and distributed systems',
    icon: '🏗️',
    tags: ['Architecture', 'Scalability', 'Microservices', 'Databases'],
    memberCount: 24560,
    postCount: 6120,
    color: 'hsl(220, 70%, 55%)',
  },
  {
    id: '8',
    name: 'Career & Jobs',
    slug: 'career',
    description: 'Job hunting, interviews, career growth',
    icon: '💼',
    tags: ['Interviews', 'Resume', 'Salary', 'Career Growth'],
    memberCount: 42300,
    postCount: 11230,
    color: 'hsl(45, 85%, 55%)',
  },
];

export const users: User[] = [
  {
    id: '1',
    username: 'sarahdev',
    displayName: 'Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    bio: 'Senior Frontend Engineer @TechCorp. React enthusiast. Open source contributor.',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
    joinedDate: '2023-01-15',
    postCount: 156,
    reputation: 4520,
  },
  {
    id: '2',
    username: 'alexrust',
    displayName: 'Alex Kumar',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    bio: 'Backend developer. Rust advocate. Building scalable systems.',
    skills: ['Rust', 'Go', 'PostgreSQL', 'Kubernetes'],
    joinedDate: '2022-08-22',
    postCount: 89,
    reputation: 3210,
  },
  {
    id: '3',
    username: 'miacloud',
    displayName: 'Mia Rodriguez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mia',
    bio: 'DevOps Engineer. AWS certified. Automating everything.',
    skills: ['AWS', 'Docker', 'Terraform', 'Python'],
    joinedDate: '2023-03-10',
    postCount: 67,
    reputation: 2890,
  },
  {
    id: '4',
    username: 'jakeml',
    displayName: 'Jake Thompson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jake',
    bio: 'ML Engineer. Working on LLMs and NLP. PhD dropout.',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'NLP'],
    joinedDate: '2022-11-05',
    postCount: 134,
    reputation: 5670,
  },
];

export const posts: Post[] = [
  {
    id: '1',
    title: 'How I built a real-time collaboration editor with React and WebSockets',
    excerpt: 'A deep dive into building a Google Docs-like editor from scratch, including handling conflicts and state synchronization...',
    content: '# Building a Real-time Collaboration Editor\n\nIn this post, I\'ll share my journey of building a real-time collaboration editor...',
    author: users[0],
    community: communities[0],
    type: 'experience',
    tags: ['React', 'WebSockets', 'Real-time', 'TypeScript'],
    createdAt: '2024-01-15T10:30:00Z',
    readTime: 12,
    likes: 456,
    comments: 89,
    views: 12340,
  },
  {
    id: '2',
    title: 'Why I switched from REST to GraphQL and never looked back',
    excerpt: 'After 5 years of building REST APIs, I made the switch to GraphQL. Here\'s what I learned and why I\'m not going back...',
    content: '# From REST to GraphQL\n\nGraphQL has completely changed how I think about API design...',
    author: users[1],
    community: communities[1],
    type: 'experience',
    tags: ['GraphQL', 'REST', 'API Design', 'Node.js'],
    createdAt: '2024-01-14T15:45:00Z',
    readTime: 8,
    likes: 234,
    comments: 56,
    views: 8920,
  },
  {
    id: '3',
    title: 'How do you handle state management in large React applications?',
    excerpt: 'Working on a large enterprise app and struggling with state management. Redux feels heavy, Context has limitations...',
    content: '# State Management Question\n\nI\'m working on a large-scale React application and...',
    author: users[2],
    community: communities[0],
    type: 'question',
    tags: ['React', 'State Management', 'Redux', 'Zustand'],
    createdAt: '2024-01-13T09:20:00Z',
    readTime: 3,
    likes: 89,
    comments: 145,
    views: 5670,
  },
  {
    id: '4',
    title: 'The complete guide to Kubernetes for developers',
    excerpt: 'Everything you need to know about Kubernetes as a developer, from pods to deployments to services...',
    content: '# Kubernetes for Developers\n\nKubernetes can be intimidating at first, but once you understand the core concepts...',
    author: users[2],
    community: communities[3],
    type: 'experience',
    tags: ['Kubernetes', 'Docker', 'DevOps', 'Cloud'],
    createdAt: '2024-01-12T14:00:00Z',
    readTime: 15,
    likes: 567,
    comments: 78,
    views: 23450,
  },
  {
    id: '5',
    title: 'Building production-ready LLM applications with LangChain',
    excerpt: 'A practical guide to building AI applications that actually work in production, with tips on prompt engineering and error handling...',
    content: '# LLM Applications in Production\n\nBuilding an LLM-powered demo is easy. Building one that works in production is hard...',
    author: users[3],
    community: communities[4],
    type: 'experience',
    tags: ['LLM', 'LangChain', 'Python', 'AI'],
    createdAt: '2024-01-11T11:30:00Z',
    readTime: 10,
    likes: 789,
    comments: 123,
    views: 34560,
  },
];

export const jobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    company: 'TechCorp',
    companyLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=techcorp',
    location: 'San Francisco, CA',
    type: 'full-time',
    techStack: ['React', 'TypeScript', 'GraphQL', 'Node.js'],
    salary: '$150k - $200k',
    applyLink: '#',
    postedAt: '2024-01-14',
    community: communities[0],
  },
  {
    id: '2',
    title: 'Backend Developer - Go',
    company: 'ScaleUp Inc',
    companyLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=scaleup',
    location: 'Remote',
    type: 'remote',
    techStack: ['Go', 'PostgreSQL', 'gRPC', 'Kubernetes'],
    salary: '$130k - $170k',
    applyLink: '#',
    postedAt: '2024-01-13',
    community: communities[1],
  },
  {
    id: '3',
    title: 'ML Engineer Intern',
    company: 'AI Labs',
    companyLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=ailabs',
    location: 'New York, NY',
    type: 'internship',
    techStack: ['Python', 'PyTorch', 'Transformers'],
    salary: '$40/hr',
    applyLink: '#',
    postedAt: '2024-01-12',
    community: communities[4],
  },
  {
    id: '4',
    title: 'DevOps Consultant',
    company: 'CloudFirst',
    companyLogo: 'https://api.dicebear.com/7.x/identicon/svg?seed=cloudfirst',
    location: 'Remote',
    type: 'freelance',
    techStack: ['AWS', 'Terraform', 'Docker', 'CI/CD'],
    applyLink: '#',
    postedAt: '2024-01-11',
    community: communities[3],
  },
];

export const challenges: Challenge[] = [
  {
    id: '1',
    title: 'Implement a LRU Cache',
    description: 'Design and implement a data structure for Least Recently Used (LRU) cache.',
    difficulty: 'medium',
    tags: ['Data Structures', 'Algorithms'],
    author: users[0],
    submissions: 234,
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    title: 'Build a Rate Limiter',
    description: 'Implement a rate limiter that limits the number of requests per time window.',
    difficulty: 'hard',
    tags: ['System Design', 'Backend'],
    author: users[1],
    submissions: 156,
    createdAt: '2024-01-09',
  },
  {
    id: '3',
    title: 'Debounce Function',
    description: 'Implement a debounce function that delays invoking a function until after a wait period.',
    difficulty: 'easy',
    tags: ['JavaScript', 'Frontend'],
    author: users[0],
    submissions: 567,
    createdAt: '2024-01-08',
  },
];

export const tools: Tool[] = [
  {
    id: '1',
    name: 'Cursor',
    category: 'IDE',
    description: 'AI-powered code editor built on VS Code',
    useCase: 'AI-assisted coding and pair programming',
    pros: ['AI code generation', 'VS Code familiar', 'Fast autocomplete'],
    cons: ['Subscription required', 'Can be distracting'],
    upvotes: 1234,
    website: 'https://cursor.com',
    icon: '✨',
  },
  {
    id: '2',
    name: 'Bun',
    category: 'Runtime',
    description: 'Fast all-in-one JavaScript runtime',
    useCase: 'Replacing Node.js for faster development',
    pros: ['Extremely fast', 'Built-in bundler', 'Drop-in Node replacement'],
    cons: ['Newer ecosystem', 'Some compatibility issues'],
    upvotes: 987,
    website: 'https://bun.sh',
    icon: '🥟',
  },
  {
    id: '3',
    name: 'Supabase',
    category: 'Backend',
    description: 'Open source Firebase alternative',
    useCase: 'Backend-as-a-service for rapid prototyping',
    pros: ['PostgreSQL based', 'Real-time subscriptions', 'Great DX'],
    cons: ['Vendor lock-in concerns', 'Learning curve for Postgres'],
    upvotes: 856,
    website: 'https://supabase.com',
    icon: '⚡',
  },
];

export const dailyHighlights: DailyHighlight[] = [
  {
    id: '1',
    author: users[0],
    content: 'Finally shipped the new dashboard! 🚀 Took 3 weeks but the team is super happy with the result.',
    reactions: [
      { emoji: '🎉', count: 45 },
      { emoji: '🚀', count: 32 },
      { emoji: '❤️', count: 28 },
    ],
    createdAt: '2024-01-15T18:30:00Z',
  },
  {
    id: '2',
    author: users[1],
    content: 'Fixed that nasty race condition that was causing random 500 errors. Sometimes the simplest bugs are the hardest to find.',
    reactions: [
      { emoji: '🔥', count: 23 },
      { emoji: '💪', count: 18 },
    ],
    createdAt: '2024-01-15T16:45:00Z',
  },
  {
    id: '3',
    author: users[3],
    content: 'My fine-tuned model just hit 95% accuracy on the test set! Time to deploy and see how it performs in the wild.',
    reactions: [
      { emoji: '🤖', count: 56 },
      { emoji: '🎯', count: 34 },
      { emoji: '⭐', count: 29 },
    ],
    createdAt: '2024-01-15T14:20:00Z',
  },
];

export const activityData: number[][] = [
  [0, 1, 2, 0, 1, 3, 2, 1, 0, 2, 4, 3, 2],
  [1, 2, 0, 1, 2, 0, 3, 4, 2, 1, 0, 2, 1],
  [2, 0, 1, 3, 2, 1, 0, 2, 3, 4, 2, 1, 0],
  [0, 1, 2, 1, 0, 2, 3, 1, 2, 0, 1, 3, 2],
  [3, 2, 1, 0, 1, 2, 0, 1, 0, 2, 3, 1, 4],
  [1, 0, 2, 3, 2, 1, 4, 2, 1, 0, 2, 0, 1],
  [2, 3, 1, 0, 1, 3, 2, 0, 1, 2, 1, 3, 2],
];
