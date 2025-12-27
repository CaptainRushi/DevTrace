import { memo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
// import { Job } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Job {
  id: string;
  title: string;
  company: string;
  logo: string;
  type: string;
  location: string;
  salary: string;
  tags: string[];
  postedAt: string;
}

interface JobCardProps {
  job: Job;
  index?: number;
}

const jobTypeColors = {
  'full-time': 'bg-success/20 text-success',
  'freelance': 'bg-secondary/20 text-secondary',
  'remote': 'bg-info/20 text-info',
  'internship': 'bg-warning/20 text-warning',
};

const jobTypeLabels = {
  'full-time': 'Full-time',
  'freelance': 'Freelance',
  'remote': 'Remote',
  'internship': 'Internship',
};

export const JobCard = memo(({ job, index = 0 }: JobCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group rounded-xl border border-border bg-card p-5 transition-all card-glow block"
    >
      <Link to={`/jobs/${job.id}`}>
        <div className="flex items-start gap-4">
          <img
            src={job.logo}
            alt={job.company}
            loading="lazy"
            decoding="async"
            className="h-12 w-12 rounded-lg bg-muted"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {job.title}
                </h3>
                <p className="text-sm text-muted-foreground">{job.company}</p>
              </div>
              <span className={cn("tag", jobTypeColors[job.type as keyof typeof jobTypeColors] || 'bg-muted text-muted-foreground')}>
                {jobTypeLabels[job.type as keyof typeof jobTypeLabels] || job.type}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
              {job.salary && (
                <>
                  <span>·</span>
                  <span className="font-medium text-success">{job.salary}</span>
                </>
              )}
            </div>

            {/* Tech Stack */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.tags.map((tech) => (
                <span key={tech} className="tag text-xs">
                  {tech}
                </span>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Posted {new Date(job.postedAt).toLocaleDateString()}
              </span>
              <Button size="sm" className="gap-1.5">
                Apply
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});
