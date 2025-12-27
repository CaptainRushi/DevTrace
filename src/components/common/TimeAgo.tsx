import { useState, useEffect } from 'react';
import { formatRelativeTime, safeParseDate } from '@/lib/dateUtils';
import { Clock } from 'lucide-react';
import { differenceInHours } from 'date-fns';

interface TimeAgoProps {
    date: string | Date;
    className?: string;
    showIcon?: boolean;
}

export function TimeAgo({ date, className, showIcon = true }: TimeAgoProps) {
    const [timeLabel, setTimeLabel] = useState(() => formatRelativeTime(date));

    useEffect(() => {
        const dateObj = safeParseDate(date);

        const updateTime = () => {
            setTimeLabel(formatRelativeTime(dateObj));
        };

        // Determine update interval
        const now = new Date();
        const hoursDiff = differenceInHours(now, dateObj);

        // If < 1 hour old, update every 60 seconds (user req). 
        // Actually user said < 1 hour -> 60s. > 1 hour -> 5 mins.
        // For "Just now" (seconds), we might want faster initial updates, but 60s is safe for "min" resolution.

        const intervalDuration = hoursDiff < 1 ? 60000 : 300000; // 60s vs 5m

        const intervalId = setInterval(updateTime, intervalDuration);

        return () => clearInterval(intervalId);
    }, [date]);

    return (
        <span className={`flex items-center gap-1 text-muted-foreground ${className}`} title={new Date(date).toLocaleString()}>
            {showIcon && <Clock className="h-3 w-3" />}
            {timeLabel}
        </span>
    );
}
