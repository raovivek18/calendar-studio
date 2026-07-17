"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { Database } from "@/types/supabase";

type Post = Database["public"]["Tables"]["posts"]["Row"];

interface CalendarPostProps {
  post: Post;
}

export function CalendarPost({ post }: CalendarPostProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id,
    data: {
      type: 'Post',
      post,
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  const statusColors = {
    draft: "bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
    ready: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50",
    scheduled: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50",
    published: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/50",
  };

  const platformIconMap = {
    twitter: "X", // Simplification
    linkedin: "in",
    facebook: "f",
    instagram: "ig",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group flex flex-col p-1.5 rounded text-xs font-medium border cursor-default shadow-sm ${statusColors[post.status] || statusColors.draft}`}
    >
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="truncate">{post.title}</span>
        <div 
          className="cursor-grab opacity-0 group-hover:opacity-100 p-0.5 hover:bg-black/5 dark:hover:bg-white/10 rounded active:cursor-grabbing"
          {...listeners} 
          {...attributes}
        >
          <GripVertical size={12} />
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-70">
        <span className="font-bold text-[9px] uppercase tracking-wider">{platformIconMap[post.platform]}</span>
        <span className="text-[10px] capitalize">{post.status}</span>
      </div>
    </div>
  );
}
