"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const socialPostSchema = z.object({
  platform: z.string(),
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  status: z.string(),
  scheduled_at: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export async function createSocialPost(data: z.infer<typeof socialPostSchema>) {
  const supabase = await createClerkSupabaseClient();
  const parsed = socialPostSchema.parse(data);

  // We need the user's Clerk ID to be set correctly by RLS or manually.
  // Actually, since RLS is enabled and checks `auth.uid() = user_id`, 
  // we must provide user_id. Let's get it from clerk auth.
  const { auth } = await import("@clerk/nextjs/server");
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase.from("social_posts").insert({
    ...parsed,
    user_id: userId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/planner");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  return { success: true };
}

export async function updateSocialPost(id: string, data: z.infer<typeof socialPostSchema>) {
  const supabase = await createClerkSupabaseClient();
  const parsed = socialPostSchema.parse(data);

  const { error } = await supabase
    .from("social_posts")
    .update({ ...parsed })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/planner");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  return { success: true };
}

export async function deleteSocialPost(id: string) {
  const supabase = await createClerkSupabaseClient();

  const { error } = await supabase
    .from("social_posts")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/planner");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  return { success: true };
}
