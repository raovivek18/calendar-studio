"use client";

import { memo } from "react";
import { MegaphoneIcon } from "lucide-react";

interface CalendarSocialPostProps {
  post: any;
  onClick: () => void;
}

export const CalendarSocialPost = memo(function CalendarSocialPost({ post, onClick }: CalendarSocialPostProps) {
  const statusColors: Record<string, string> = {
    draft: "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
    scheduled: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/50",
    published: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50",
    archived: "bg-zinc-200 text-zinc-500 border-zinc-300 dark:bg-zinc-700 dark:text-zinc-400 dark:border-zinc-600",
  };

  const platformIconMap: Record<string, string> = {
    twitter: "X",
    linkedin: "in",
    reddit: "red",
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative flex flex-col p-1.5 rounded text-xs font-medium border shadow-sm transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 ${statusColors[post.status] || statusColors.draft}`}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="truncate flex items-center gap-1">
          <MegaphoneIcon className="size-3 flex-shrink-0" />
          {post.title}
        </span>
      </div>
      <div className="flex items-center gap-1 opacity-70">
        <span className="font-bold text-[9px] uppercase tracking-wider">{platformIconMap[post.platform] || post.platform}</span>
        <span className="text-[10px] capitalize">{post.status}</span>
        {post.scheduled_at && (
          <span className="text-[10px] ml-auto">
            {new Date(post.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
});
