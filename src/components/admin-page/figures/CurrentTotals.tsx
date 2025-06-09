import { BarChart2, Users, Activity, Database, CalendarDays } from "lucide-react";

export const CurrentTotals = ({ totals }: { totals: Record<string, number> }) => (
  <div className="bg-card text-card-foreground rounded-lg shadow p-6 space-y-4">
    <h3 className="text-lg font-semibold">📊 Current Totals</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
      <div className="flex items-center gap-1">
        <Database className="w-5 h-5 text-muted-foreground" />
        <span className="text-muted-foreground">Accuracy Rows:</span>
        <span className="ml-auto font-medium text-white">{totals.total_accuracy_rows}</span>
      </div>
      <div className="flex items-center gap-1">
        <Activity className="w-5 h-5 text-muted-foreground" />
        <span className="text-muted-foreground">Unique Set Creators:</span>
        <span className="ml-auto font-medium text-white">{totals.total_unique_emails_in_sets}</span>
      </div>
      <div className="flex items-center gap-1">
        <BarChart2 className="w-5 h-5 text-muted-foreground" />
        <span className="text-muted-foreground">Total Sets:</span>
        <span className="ml-auto font-medium text-white">{totals.total_set_rows}</span>
      </div>
      <div className="flex items-center gap-1">
        <Users className="w-5 h-5 text-muted-foreground" />
        <span className="text-muted-foreground">Registered Users:</span>
        <span className="ml-auto font-medium text-white">{totals.total_user_rows}</span>
      </div>
      <div className="flex items-center gap-1">
        <CalendarDays className="w-5 h-5 text-muted-foreground" />
        <span className="text-muted-foreground">Active Days:</span>
        <span className="ml-auto font-medium text-white">{totals.total_daily_stats_rows}</span>
      </div>
    </div>
  </div>
);
