import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401 });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    const { clerk_user_id, email, full_name, avatar_url } = await req.json();

    if (!clerk_user_id || !email) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // Upsert profile
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .upsert(
        { clerk_user_id, email, full_name, avatar_url, updated_at: new Date().toISOString() },
        { onConflict: "clerk_user_id" }
      )
      .select()
      .single();

    if (profileError) throw profileError;

    // Upsert default settings if they don't exist
    const { error: settingsError } = await supabaseClient
      .from("settings")
      .insert({ user_id: clerk_user_id })
      .select()
      .single();
    
    // Ignore duplicate key error for settings
    if (settingsError && settingsError.code !== '23505') {
       throw settingsError;
    }

    return new Response(JSON.stringify({ profile }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});
