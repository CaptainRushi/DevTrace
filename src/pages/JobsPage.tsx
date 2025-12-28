import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Filter, MapPin, Search, Loader2 } from 'lucide-react';

import { JobCard } from '@/components/jobs/JobCard';
import { JobSkeleton } from '@/components/common/Skeletons';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from "@/lib/supabase";

type JobFilter = 'all' | 'full-time' | 'freelance' | 'remote' | 'internship';

const JobsPage = () => {
  const [filter, setFilter] = useState<JobFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('job_posts')
          .select('*')
          .gt('expires_at', new Date().toISOString());

        if (error) throw error;

        if (data) {
          setJobs(data.map(job => ({
            id: job.id,
            title: job.role,
            company: job.company,
            location: job.location,
            type: job.type || 'full-time',
            salary: 'Competitive',
            postedAt: job.created_at,
            tags: job.stack || [],
            logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=random`,
            expiresAt: job.expires_at
          })));
        }
      } catch (e) {
        console.error("Fetch jobs error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    if (filter !== 'all' && job.type !== filter) return false;
    if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Job Board</h1>
              <p className="text-muted-foreground">Find your next opportunity in tech</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as JobFilter)}>
            <TabsList className="bg-muted">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="full-time">Full-time</TabsTrigger>
              <TabsTrigger value="remote">Remote</TabsTrigger>
              <TabsTrigger value="freelance">Freelance</TabsTrigger>
              <TabsTrigger value="internship">Internship</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              className="pl-10 bg-muted"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <JobSkeleton key={i} />
            ))
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job, index) => (
              <JobCard key={job.id} job={job} index={index} />
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">No jobs found</h3>
              <p className="mt-2 text-muted-foreground">Try adjusting your filters</p>
            </div>
          )}
        </div>

        {/* Post Job CTA */}
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 p-6 text-center">
          <h3 className="font-mono text-lg font-bold text-primary">Hiring developers?</h3>
          <p className="mt-2 text-muted-foreground">Post your job to reach thousands of talented developers</p>
          <Link to="/jobs/create">
            <Button className="mt-4">Post a Job</Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default JobsPage;
