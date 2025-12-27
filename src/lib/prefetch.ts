const pageImports: Record<string, () => Promise<any>> = {
    '/': () => import('../pages/Index'),
    '/communities': () => import('../pages/CommunitiesPage'),
    '/jobs': () => import('../pages/JobsPage'),
    '/challenges': () => import('../pages/ChallengesPage'),
    '/highlights': () => import('../pages/HighlightsPage'),
    '/open-source': () => import('../pages/OpenSourcePage'),
    '/tools': () => import('../pages/ToolsPage'),
    '/settings': () => import('../pages/SettingsPage'),
    'community': () => import('../pages/CommunityPage'),
    'job': () => import('../pages/JobDetailsPage'),
    'challenge': () => import('../pages/ChallengeDetailsPage'),
    'post': () => import('../pages/PostPage'),
};

export const prefetchPage = (path: string) => {
    let importFn = pageImports[path];

    if (!importFn) {
        if (path.startsWith('/community/')) importFn = pageImports['community'];
        else if (path.startsWith('/jobs/')) importFn = pageImports['job'];
        else if (path.startsWith('/challenges/')) importFn = pageImports['challenge'];
        else if (path.startsWith('/post/')) importFn = pageImports['post'];
    }

    if (importFn) {
        importFn().catch(() => { }); // Catch errors if import fails
    }
};
