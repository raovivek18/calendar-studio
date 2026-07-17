import { auth, currentUser } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export async function SyncUser() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) return null;

  const supabase = await createClerkSupabaseClient();

  const email = user.emailAddresses[0]?.emailAddress ?? "";
  const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  const avatarUrl = user.imageUrl ?? "";

  // Upsert profile gracefully
  // Since we use the user's authenticated Clerk JWT to make this request,
  // RLS policies natively allow this insertion/update for their own clerk_user_id.
  await supabase.from("profiles").upsert(
    {
      clerk_user_id: userId,
      email,
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "clerk_user_id",
    }
  );

  return null;
}
