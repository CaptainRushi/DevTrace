import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DocsPage from './pages/DocsPage';
import { AuthProvider } from "./contexts/AuthContext";
import { Layout } from "./components/layout/Layout";
import { Loader2 } from "lucide-react";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const CommunitiesPage = lazy(() => import("./pages/CommunitiesPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const JobsPage = lazy(() => import("./pages/JobsPage"));
const CreateJobPage = lazy(() => import("./pages/CreateJobPage"));
const JobDetailsPage = lazy(() => import("./pages/JobDetailsPage"));
const ChallengesPage = lazy(() => import("./pages/ChallengesPage"));
const CreateChallengePage = lazy(() => import("./pages/CreateChallengePage"));
const ChallengeDetailsPage = lazy(() => import("./pages/ChallengeDetailsPage"));
const HighlightsPage = lazy(() => import("./pages/HighlightsPage"));
const ToolsPage = lazy(() => import("./pages/ToolsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const CreatePostPage = lazy(() => import("./pages/CreatePostPage"));
const PostPage = lazy(() => import("./pages/PostPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const SignIn = lazy(() => import("./pages/auth/SignIn"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const OpenSourcePage = lazy(() => import("./pages/OpenSourcePage"));
const CreateOpenSourceProjectPage = lazy(() => import("./pages/CreateOpenSourceProjectPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

const PageLoader = () => (
  <div className="space-y-6">
    <div className="h-48 w-full bg-muted animate-pulse rounded-xl" />
    <div className="space-y-4">
      <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
      <div className="h-4 w-full bg-muted animate-pulse rounded" />
      <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes - No Layout */}
            <Route path="/auth/sign-in" element={<Suspense fallback={<PageLoader />}><SignIn /></Suspense>} />
            <Route path="/auth/sign-up" element={<Suspense fallback={<PageLoader />}><SignUp /></Suspense>} />

            {/* App Routes - With Persistent Layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/community/:slug" element={<CommunityPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/jobs/create" element={<CreateJobPage />} />
              <Route path="/jobs/:id" element={<JobDetailsPage />} />
              <Route path="/challenges" element={<ChallengesPage />} />
              <Route path="/challenges/create" element={<CreateChallengePage />} />
              <Route path="/challenges/:id" element={<ChallengeDetailsPage />} />
              <Route path="/highlights" element={<HighlightsPage />} />
              <Route path="/open-source" element={<OpenSourcePage />} />
              <Route path="/open-source/new" element={<CreateOpenSourceProjectPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/profile/:username" element={<ProfilePage />} />
              <Route path="/create" element={<CreatePostPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/post/:id" element={<PostPage />} />
              <Route path="/docs" element={<DocsPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
