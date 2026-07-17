"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { createSocialPost, updateSocialPost, deleteSocialPost } from "@/actions/social-posts";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  platform: z.enum(["twitter", "linkedin", "reddit"]),
  status: z.enum(["draft", "scheduled", "published", "archived"]),
  scheduled_at: z.string().optional().nullable(),
  notes: z.string().optional(),
});

interface PlannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post?: any | null; // We can type this properly later with Supabase Database types
  defaultDate?: string;
}

export function PlannerDialog({ open, onOpenChange, post, defaultDate }: PlannerDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      platform: "twitter",
      status: "draft",
      scheduled_at: defaultDate || "",
      notes: "",
    },
  });

  const contentValue = form.watch("content") || "";

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        content: post.content || "",
        platform: post.platform,
        status: post.status,
        scheduled_at: post.scheduled_at ? new Date(post.scheduled_at).toISOString().slice(0, 16) : "",
        notes: post.notes || "",
      });
    } else {
      form.reset({
        title: "",
        content: "",
        platform: "twitter",
        status: "draft",
        scheduled_at: defaultDate ? new Date(defaultDate).toISOString().slice(0, 16) : "",
        notes: "",
      });
    }
  }, [post, defaultDate, form, open]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      if (post) {
        await updateSocialPost(post.id, values);
        toast.success("Social post updated successfully");
      } else {
        await createSocialPost(values);
        toast.success("Social post created successfully");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error((error as Error).message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async () => {
    if (!post) return;
    setIsDeleting(true);
    try {
      await deleteSocialPost(post.id);
      toast.success("Social post deleted successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error((error as Error).message || "Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const isWorking = isSubmitting || isDeleting;

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!isWorking) onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{post ? "Edit Social Post" : "Create Social Post"}</DialogTitle>
          <DialogDescription>
            {post ? "Update your planned social media content." : "Draft and schedule a new social media post."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input 
              id="title"
              {...form.register("title")} 
              placeholder="Post title..." 
              aria-invalid={!!form.formState.errors.title}
              disabled={isWorking}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-red-500" role="alert">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <Select 
                value={form.watch("platform")} 
                onValueChange={(val) => { if (val) form.setValue("platform", val as any) }}
                disabled={isWorking}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="twitter">X (Twitter)</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="reddit">Reddit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select 
                disabled={isWorking}
                onValueChange={(val) => { if (val) form.setValue("status", val as any) }} 
                value={form.watch("status")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="content" className="text-sm font-medium">Content</label>
              <span className="text-xs text-muted-foreground">{contentValue.length} chars</span>
            </div>
            <Textarea 
              id="content"
              {...form.register("content")} 
              placeholder="What do you want to say?" 
              className="resize-none h-32 font-mono text-sm" 
              disabled={isWorking}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="scheduled_at" className="text-sm font-medium">Scheduled Date & Time</label>
              <Input 
                id="scheduled_at"
                type="datetime-local" 
                {...form.register("scheduled_at")} 
                disabled={isWorking}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</label>
              <Input 
                id="notes"
                {...form.register("notes")} 
                placeholder="Internal notes..."
                disabled={isWorking}
              />
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
                {isSubmitting ? "Saving..." : post ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
