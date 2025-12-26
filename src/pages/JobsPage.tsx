import { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Filter, MapPin, Search } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { JobCard } from '@/components/jobs/JobCard';
import { SectionHeader } from '@/components/common/SectionHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { jobs } from '@/data/mockData';

type JobFilter = 'all' | 'full-time' | 'freelance' | 'remote' | 'internship';

const JobsPage = () => {
  const [filter, setFilter] = useState<JobFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = jobs.filter((job) => {
    if (filter !== 'all' && job.type !== filter) return false;
    if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <Layout>
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
          {filteredJobs.map((job, index) => (
            <JobCard key={job.id} job={job} index={index} />
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No jobs found</h3>
            <p className="mt-2 text-muted-foreground">Try adjusting your filters</p>
          </div>
        )}

        {/* Post Job CTA */}
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-secondary/10 p-6 text-center">
          <h3 className="font-mono text-lg font-bold text-primary">Hiring developers?</h3>
          <p className="mt-2 text-muted-foreground">Post your job to reach thousands of talented developers</p>
          <Button className="mt-4">Post a Job</Button>
        </div>
      </div>
    </Layout>
  );
};

export default JobsPage;
