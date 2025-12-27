import { format, formatDistanceToNowStrict, differenceInDays } from 'date-fns';

export function safeParseDate(dateInput: string | Date): Date {
    if (typeof dateInput === 'string' && !dateInput.endsWith('Z') && !dateInput.includes('+')) {
        return new Date(dateInput + 'Z');
    }
    return new Date(dateInput);
}

export function formatRelativeTime(dateString: string | Date): string {
    let date = safeParseDate(dateString);
    const now = new Date();
    // Handle future dates (prevent "in X seconds" due to clock skew)
    if (date > now) {
        date = now;
    }

    const diffInDays = differenceInDays(now, date);

    // If more than 7 days, show absolute date
    if (diffInDays > 7) {
        return format(date, 'd MMM yyyy');
    }

    // Relative time
    const distance = formatDistanceToNowStrict(date, { addSuffix: true });

    // Custom replacements to match "Just now", "mins ago" style
    if (distance.includes('seconds')) {
        return 'Just now';
    }

    return distance
        .replace(' minutes', ' mins')
        .replace(' minute', ' min')
        .replace(' hours', ' hrs')
        .replace(' hour', ' hr')
        .replace(' days', ' days')
        .replace(' day', ' day');
}
