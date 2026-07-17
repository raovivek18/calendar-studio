"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { Activity, Calendar, Clock, FileEdit, CheckCircle2, LucideIcon, Plus, Settings, ArrowRight, Sparkles, Trash, Image as ImageIcon } from "lucide-react";
import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function DashboardView() {
  const supabase = useSupabase();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('dashboard-stats');
      if (error) throw error;
      return data;
    }
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
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

  if (statsLoading || activityLoading) {
    return <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 h-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
        <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
      </div>
    </div>;
  }

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 300, damping: 24 } }
  };

  const getActivityIcon = (action: string) => {
    if (action.includes('delete')) return <Trash size={14} className="text-red-500" />;
    if (action.includes('update') || action.includes('edit')) return <FileEdit size={14} className="text-yellow-500" />;
    if (action.includes('upload')) return <ImageIcon size={14} className="text-blue-500" />;
    return <Sparkles size={14} className="text-green-500" />;
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full max-w-6xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-zinc-500">Welcome back. Here's what's happening with your content.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/settings" className={buttonVariants({ variant: "outline", size: "sm", className: "hidden sm:flex rounded-full" })}>
            <Settings size={16} className="mr-2" /> Settings
          </Link>
          <Link href="/calendar" className={buttonVariants({ size: "sm", className: "rounded-full" })}>
            <Plus size={16} className="mr-2" /> New Post
          </Link>
        </div>
      </div>



      <motion.div variants={container} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Posts this month" value={stats?.thisMonth || 0} icon={Calendar} color="text-blue-500" bg="bg-blue-500/10" />
        <StatCard title="Scheduled" value={stats?.scheduled || 0} icon={Clock} color="text-purple-500" bg="bg-purple-500/10" />
        <StatCard title="Ready to post" value={stats?.ready || 0} icon={CheckCircle2} color="text-green-500" bg="bg-green-500/10" />
        <StatCard title="Drafts" value={stats?.drafts || 0} icon={FileEdit} color="text-yellow-500" bg="bg-yellow-500/10" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="col-span-1 lg:col-span-2 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/20">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Upcoming Content</h3>
            <Link href="/calendar" className={buttonVariants({ variant: "ghost", size: "sm", className: "text-xs text-zinc-500 hover:text-zinc-900 rounded-full h-8" })}>
              View Calendar <ArrowRight size={14} className="ml-1" />
            </Link>
          </div>
          
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4"
            >
              <Calendar className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
            </motion.div>
            <h4 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-1">Your schedule is clear</h4>
            <p className="text-sm text-zinc-500 max-w-[250px] mb-6">You don't have any upcoming posts scheduled for this week.</p>
            <Link href="/calendar" className={buttonVariants({ className: "rounded-full shadow-sm" })}>
              <Plus size={16} className="mr-2" /> Schedule a Post
            </Link>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Activity size={16} className="text-zinc-500" />
              Recent Activity
            </h3>
          </div>
          <div className="flex-1 p-6 space-y-5">
            {recentActivity?.map((log, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                key={log.id} 
                className="flex gap-4 group"
              >
                <div className="relative mt-1 shrink-0">
                  <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 group-hover:scale-110 transition-transform">
                    {getActivityIcon(log.action)}
                  </div>
                  {i !== recentActivity.length - 1 && (
                    <div className="absolute top-7 bottom-[-20px] left-1/2 w-[1px] bg-zinc-100 dark:bg-zinc-800 -translate-x-1/2" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-snug">
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">You</span> {log.action.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1 font-medium">
                    {new Date(log.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
            {!recentActivity?.length && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <Sparkles className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mb-3" />
                <p className="text-sm text-zinc-500">No recent activity yet.<br/>Start planning your content!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
}

const itemVariant: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: "spring" as any, stiffness: 300, damping: 24 } }
};

function StatCard({ title, value, icon: Icon, color, bg }: StatCardProps) {
  return (
    <motion.div variants={itemVariant} className="group relative bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex flex-col gap-4 relative">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-xl ${bg} ${color} transition-transform group-hover:scale-110`}>
            <Icon size={20} strokeWidth={2.5} />
          </div>
        </div>
        <div>
          <p className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{value}</p>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">{title}</p>
        </div>
      </div>
    </motion.div>
  );
}
