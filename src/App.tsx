import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CommunityPage from "./pages/CommunityPage";
import JobsPage from "./pages/JobsPage";
import ChallengesPage from "./pages/ChallengesPage";
import HighlightsPage from "./pages/HighlightsPage";
import ToolsPage from "./pages/ToolsPage";
import ProfilePage from "./pages/ProfilePage";
import CreatePostPage from "./pages/CreatePostPage";
import PostPage from "./pages/PostPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/community/:slug" element={<CommunityPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/challenges" element={<ChallengesPage />} />
          <Route path="/highlights" element={<HighlightsPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/post/:id" element={<PostPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
