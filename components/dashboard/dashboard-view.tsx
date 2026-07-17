"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { Activity, Calendar, Clock, FileEdit, CheckCircle2, LucideIcon } from "lucide-react";

export function DashboardView() {
  const supabase = useSupabase();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('dashboard-stats');
      if (error) throw error;
      return data;
    }
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />)}
      </div>
    </div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Posts this month" value={stats?.thisMonth || 0} icon={Calendar} color="text-blue-500" />
        <StatCard title="Scheduled" value={stats?.scheduled || 0} icon={Clock} color="text-purple-500" />
        <StatCard title="Ready" value={stats?.ready || 0} icon={CheckCircle2} color="text-green-500" />
        <StatCard title="Drafts" value={stats?.drafts || 0} icon={FileEdit} color="text-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="font-semibold mb-4">Upcoming Content</h3>
          <div className="flex flex-col items-center justify-center h-48 text-zinc-500 border border-dashed rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
            <Calendar className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">No upcoming posts scheduled for this week.</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity size={18} />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivity?.map((log) => (
              <div key={log.id} className="flex gap-3 text-sm">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                <div className="text-zinc-600 dark:text-zinc-400">
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">You</span> {log.action.replace('_', ' ')}
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {new Date(log.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {!recentActivity?.length && (
              <p className="text-sm text-zinc-500">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-950 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-full bg-zinc-50 dark:bg-zinc-900 ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
