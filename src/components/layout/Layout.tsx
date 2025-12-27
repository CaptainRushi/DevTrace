import { useState, Suspense } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';
import { Outlet } from 'react-router-dom';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="transition-all duration-300 lg:pl-[72px]">
        <div className="container mx-auto px-4 py-6 lg:px-8">
          <Suspense fallback={
            <div className="space-y-6">
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
                ))}
              </div>
            </div>
          }>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
