"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { CalendarDay } from "./calendar-day";
import { CalendarPost } from "./calendar-post";
import { PostDialog } from "./post-dialog";
import { toast } from "sonner";
import type { Database } from "@/types/supabase";

type Post = Database["public"]["Tables"]["posts"]["Row"];

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [defaultDate, setDefaultDate] = useState<string>("");
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const queryKey = ['posts', format(monthStart, 'yyyy-MM')];

  const { data: posts, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'));
      
      if (error) throw error;
      return data as Post[];
    }
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, refetch]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const postId = active.id as string;
    const newDate = over.id as string;
    
    const postToMove = posts?.find(p => p.id === postId);
    if (!postToMove || postToMove.date === newDate) return;
    
    const oldDate = postToMove.date;
    
    // Optimistic update
    queryClient.setQueryData(queryKey, (old: Post[] | undefined) => {
      if (!old) return [];
      return old.map(p => p.id === postId ? { ...p, date: newDate } : p);
    });

    try {
      const { error } = await supabase.functions.invoke('move-post', {
        body: { id: postId, newDate }
      });
      if (error) throw error;
      toast.success("Post moved");
    } catch (error) {
      // Revert on error
      queryClient.setQueryData(queryKey, (old: Post[] | undefined) => {
        if (!old) return [];
        return old.map(p => p.id === postId ? { ...p, date: oldDate } : p);
      });
      toast.error("Failed to move post");
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full bg-white dark:bg-zinc-950 rounded-xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold">{format(currentDate, "MMMM yyyy")}</h3>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={prevMonth} className="h-7 w-7">
                <ChevronLeft size={14} />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth} className="h-7 w-7">
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-md p-1 flex items-center">
              <button className="px-3 py-1 text-xs font-medium rounded shadow-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white">Month</button>
              <button className="px-3 py-1 text-xs font-medium rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-white">Week</button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-7 border-b border-zinc-200 dark:border-zinc-800">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        <div className="flex-1 grid grid-cols-7 auto-rows-fr">
          {Array.from({ length: monthStart.getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="border-r border-b border-zinc-200 dark:border-zinc-800 p-2 opacity-50 bg-zinc-50 dark:bg-zinc-900/50" />
          ))}
          
          {days.map(day => {
            const dayPosts = posts?.filter(p => p.date === format(day, 'yyyy-MM-dd')) || [];
            return (
              <div 
                key={day.toISOString()}
                onClick={(e) => {
                  // Only open create dialog if clicked directly on the day cell, not a post
                  if ((e.target as HTMLElement).closest('[data-post="true"]')) return;
                  setDefaultDate(format(day, 'yyyy-MM-dd'));
                  setSelectedPost(null);
                  setIsDialogOpen(true);
                }}
              >
                <CalendarDay day={day} currentDate={currentDate}>
                  {dayPosts.map(post => (
                    <div 
                      key={post.id} 
                      data-post="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPost(post);
                        setIsDialogOpen(true);
                      }}
                    >
                      <CalendarPost post={post} />
                    </div>
                  ))}
                </CalendarDay>
              </div>
            );
          })}
        </div>
      </div>
      <PostDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
        post={selectedPost}
        defaultDate={defaultDate}
      />
    </DndContext>
  );
}
