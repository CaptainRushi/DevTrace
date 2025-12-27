import { Skeleton } from "@/components/ui/skeleton";

export const PostSkeleton = () => (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
            </div>
        </div>
        <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
        </div>
    </div>
);

export const CommunitySkeleton = ({ compact = false }: { compact?: boolean }) => (
    <div className={`rounded-lg border border-border bg-card p-3 flex items-center gap-3 ${compact ? '' : 'p-5'}`}>
        <Skeleton className={`${compact ? 'h-8 w-8' : 'h-14 w-14'} rounded-xl`} />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            {!compact && <Skeleton className="h-3 w-full" />}
            <Skeleton className="h-3 w-16" />
        </div>
    </div>
);

export const HighlightSkeleton = () => (
    <div className="flex gap-4 pb-6">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-20 w-full rounded-xl" />
        </div>
    </div>
);

export const JobSkeleton = () => (
    <div className="rounded-xl border border-border bg-card p-5 flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 space-y-3">
            <div className="flex justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-16" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
            </div>
        </div>
    </div>
);

export const ChallengeSkeleton = () => (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex justify-between items-start">
            <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-16 w-full rounded" />
        <div className="flex items-center justify-between">
            <div className="flex gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-8 w-24" />
        </div>
    </div>
);

export const CommunityHeaderSkeleton = () => (
    <div className="rounded-xl border border-border bg-card p-6 lg:p-8 space-y-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Skeleton className="h-20 w-20 rounded-2xl bg-muted" />
            <div className="flex-1 space-y-3">
                <Skeleton className="h-10 w-64 bg-muted" />
                <Skeleton className="h-6 w-full bg-muted" />
                <div className="flex gap-4">
                    <Skeleton className="h-4 w-24 bg-muted" />
                    <Skeleton className="h-4 w-24 bg-muted" />
                </div>
            </div>
            <Skeleton className="h-10 w-32 bg-muted rounded" />
        </div>
    </div>
);
