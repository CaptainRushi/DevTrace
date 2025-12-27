import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  href?: string;
  linkText?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function SectionHeader({ title, href, linkText = 'View all', className, icon }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="terminal-heading text-xl font-bold">{title}</h2>
      </div>
      {href && (
        <Link
          to={href}
          className="group flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {linkText}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
