import { activityData } from '@/data/mockData';

interface ActivityGraphProps {
  data?: number[][];
}

export function ActivityGraph({ data = activityData }: ActivityGraphProps) {
  const activityLevels = ['activity-0', 'activity-1', 'activity-2', 'activity-3', 'activity-4'];

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h4 className="mb-3 font-mono text-sm font-semibold text-foreground">
        <span className="text-muted-foreground">#</span>contributions
      </h4>
      <div className="flex gap-1">
        {data.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={`${weekIndex}-${dayIndex}`}
                className={`h-3 w-3 rounded-sm ${activityLevels[day]} transition-all hover:ring-2 hover:ring-primary/50`}
                title={`${day} contributions`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1 text-xs text-muted-foreground">
        <span>Less</span>
        {activityLevels.map((level, i) => (
          <div key={i} className={`h-3 w-3 rounded-sm ${level}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
