"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { Image as ImageIcon, FileText, Upload, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/supabase";

type Attachment = Database["public"]["Tables"]["attachments"]["Row"];

export function LibraryView() {
  const supabase = useSupabase();

  const { data: attachments, isLoading } = useQuery({
    queryKey: ['attachments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attachments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Attachment[];
    }
  });

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="search"
            placeholder="Search files..."
            className="h-9 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-9 pr-4 text-sm outline-none transition-all focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:focus:border-zinc-700"
          />
        </div>
        <Button className="gap-2">
          <Upload size={16} />
          Upload Files
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-square bg-zinc-100 dark:bg-zinc-900 rounded-lg animate-pulse" />)}
          </div>
        ) : !attachments?.length ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <ImageIcon className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">Your library is empty</p>
            <p className="text-sm opacity-70 mb-4">Upload images and videos to use in your posts.</p>
            <Button variant="outline" className="gap-2">
              <Upload size={16} />
              Browse Files
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {attachments.map((file: Attachment) => (
              <div key={file.id} className="group relative aspect-square bg-zinc-100 dark:bg-zinc-900 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col">
                {file.file_type?.startsWith('image/') ? (
                  <div className="flex-1 bg-cover bg-center" style={{ backgroundImage: `url(${file.file_url})` }} />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-zinc-400">
                    <FileText size={32} />
                  </div>
                )}
                <div className="p-2 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 text-xs truncate font-medium">
                  {file.file_name}
                </div>
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full">
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
