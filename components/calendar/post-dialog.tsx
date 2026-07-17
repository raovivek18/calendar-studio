"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabase } from "@/hooks/use-supabase";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import type { Database } from "@/types/supabase";

type Post = Database["public"]["Tables"]["posts"]["Row"];

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  platform: z.enum(["twitter", "linkedin", "facebook", "instagram"]),
  status: z.enum(["draft", "ready", "scheduled", "published"]),
  date: z.string().min(10, "Date is required"),
  time: z.string().optional(),
});

interface PostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: Post | null;
  defaultDate?: string;
}

export function PostDialog({ open, onOpenChange, post, defaultDate }: PostDialogProps) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      platform: "twitter",
      status: "draft",
      date: defaultDate || new Date().toISOString().split("T")[0],
      time: "",
    },
  });

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        description: post.description || "",
        platform: post.platform,
        status: post.status,
        date: post.date,
        time: post.time || "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        platform: "twitter",
        status: "draft",
        date: defaultDate || new Date().toISOString().split("T")[0],
        time: "",
      });
    }
  }, [post, defaultDate, form, open]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (post) {
        const { error } = await supabase.functions.invoke('update-post', {
          body: { id: post.id, ...values }
        });
        if (error) throw error;
        toast.success("Post updated successfully");
      } else {
        const { error } = await supabase.functions.invoke('create-post', {
          body: values
        });
        if (error) throw error;
        toast.success("Post created successfully");
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      onOpenChange(false);
    } catch (error) {
      toast.error((error as Error).message || "Something went wrong");
    }
  };

  const onDelete = async () => {
    if (!post) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-post', {
        body: { id: post.id }
      });
      if (error) throw error;
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      onOpenChange(false);
    } catch (error) {
      toast.error((error as Error).message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const isWorking = form.formState.isSubmitting || isDeleting;

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isWorking) onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{post ? "Edit Post" : "Create Post"}</DialogTitle>
          <DialogDescription>
            {post ? "Update the details of your scheduled content." : "Add new content to your schedule."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input 
              id="title"
              {...form.register("title")} 
              placeholder="Write an engaging title..." 
              aria-invalid={!!form.formState.errors.title}
              disabled={isWorking}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-red-500" role="alert">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Textarea 
              id="description"
              {...form.register("description")} 
              placeholder="Post content or notes..." 
              className="resize-none h-24" 
              disabled={isWorking}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select 
                value={form.watch("platform")} 
                onValueChange={(val: string) => form.setValue("platform", val as any)}
                disabled={isWorking}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                disabled={isWorking}
                onValueChange={(val: string) => form.setValue("status", val as any)} 
                value={form.watch("status")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium">Date</label>
              <Input 
                id="date"
                type="date" 
                {...form.register("date")} 
                aria-invalid={!!form.formState.errors.date}
                disabled={isWorking}
              />
              {form.formState.errors.date && (
                <p className="text-xs text-red-500" role="alert">{form.formState.errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="time" className="text-sm font-medium">Time (Optional)</label>
              <Input id="time" type="time" {...form.register("time")} disabled={isWorking} />
            </div>
          </div>

          <DialogFooter className="mt-6 flex items-center justify-between sm:justify-between w-full">
            {post ? (
              <Button type="button" variant="destructive" onClick={onDelete} disabled={isWorking}>
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isWorking}>
                Cancel
              </Button>
              <Button type="submit" disabled={isWorking}>
                {form.formState.isSubmitting ? "Saving..." : post ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
