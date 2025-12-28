import { memo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, Share2, Clock } from 'lucide-react';
import { ShareMenu } from '@/components/common/ShareMenu';
import { motion } from 'framer-motion';
// import { Job } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { differenceInDays, differenceInHours, parseISO } from 'date-fns';

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
  expiresAt?: string;
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
  // Expiry Logic
  const calculateTimeLeft = () => {
    if (!job.expiresAt) return null;

    const expiryDate = parseISO(job.expiresAt);
    const now = new Date();
    const daysLeft = differenceInDays(expiryDate, now);
    const hoursLeft = differenceInHours(expiryDate, now);

    if (hoursLeft <= 0) return { label: "Expired", color: "text-muted-foreground" };
    if (daysLeft < 1) return { label: "Expires today", color: "text-destructive font-medium" };
    if (daysLeft === 1) return { label: "1 day left", color: "text-warning font-medium" };

    return { label: `${daysLeft} days left`, color: "text-muted-foreground" };
  };

  const timer = calculateTimeLeft();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group rounded-xl border border-border bg-card p-5 transition-all card-glow block h-full flex flex-col"
    >
      <Link to={`/jobs/${job.id}`} className="flex-1 block">
        <div className="flex items-start gap-4">
          <img
            src={job.logo}
            alt={job.company}
            loading="lazy"
            decoding="async"
            className="h-12 w-12 rounded-lg bg-muted object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-iceland text-xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{job.company}</p>
              </div>
              <span className={cn("tag whitespace-nowrap", jobTypeColors[job.type as keyof typeof jobTypeColors] || 'bg-muted text-muted-foreground')}>
                {jobTypeLabels[job.type as keyof typeof jobTypeLabels] || job.type}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {job.location}
              </span>
              {timer && (
                <>
                  <span>·</span>
                  <span className={cn("flex items-center gap-1", timer.color)}>
                    <Clock className="h-3.5 w-3.5" />
                    {timer.label}
                  </span>
                </>
              )}
            </div>

            {/* Tech Stack */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.tags.slice(0, 4).map((tech) => (
                <span key={tech} className="tag text-xs">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Posted {new Date(job.postedAt).toLocaleDateString()}
        </span>
        <div className="flex items-center gap-2">
          <ShareMenu
            title={`${job.title} at ${job.company}`}
            path={`/jobs/${job.id}`}
            trigger={
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            }
          />
          <Link to={`/jobs/${job.id}`}>
            <Button size="sm" className="gap-1.5">
              Apply
              <ExternalLink className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
});
