"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { Bell, CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function InboxView() {
  const supabase = useSupabase();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('notifications');
      if (error) throw error;
      return data;
    }
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-green-500" size={20} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={20} />;
      case 'error': return <XCircle className="text-red-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center text-zinc-500">Loading notifications...</div>;
  }

  if (!notifications?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500 bg-zinc-50 dark:bg-zinc-900/20">
        <Bell className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-lg font-medium">All caught up!</p>
        <p className="text-sm opacity-70">You don't have any new notifications.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      <div className="flex-1 overflow-y-auto">
        {notifications.map((notification: any) => (
          <div 
            key={notification.id} 
            className={`flex items-start gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
          >
            <div className="mt-1">{getIcon(notification.type)}</div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-medium text-zinc-900 dark:text-zinc-50">{notification.title}</h4>
                <span className="text-xs text-zinc-500">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </span>
              </div>
              {notification.message && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{notification.message}</p>
              )}
            </div>
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-blue-500 self-center" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
