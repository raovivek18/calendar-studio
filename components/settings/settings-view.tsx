"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useUser, UserProfile } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function SettingsView() {
  const { user } = useUser();
  const supabase = useSupabase();
  const { theme, setTheme } = useTheme();

  const [timezone, setTimezone] = useState("UTC");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { data: settings } = useQuery({
    queryKey: ['settings', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found
      return data;
    }
  });

  useEffect(() => {
    if (settings) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setTimezone(settings.timezone || "UTC");
      setNotificationsEnabled(settings.notifications_enabled ?? true);
      if (settings.theme && settings.theme !== theme) {
        setTheme(settings.theme);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const handleSave = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          user_id: user.id,
          timezone,
          notifications_enabled: notificationsEnabled,
          theme,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        
      if (error) throw error;
      toast.success("Settings saved");
    } catch (error) {
      toast.error((error as Error).message || "Failed to save settings");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 p-6 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-8 max-w-5xl">
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-medium">Profile</h3>
            <p className="text-sm text-zinc-500 mb-4">Manage your personal information.</p>
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
              <UserProfile routing="hash" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Preferences</h3>
            <p className="text-sm text-zinc-500 mb-4">Customize your dashboard experience.</p>
            
            <div className="space-y-4 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Theme</h4>
                  <p className="text-sm text-zinc-500">Select your preferred color theme.</p>
                </div>
                <Select value={theme} onValueChange={(val) => { if (val) setTheme(val) }}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800" />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Timezone</h4>
                  <p className="text-sm text-zinc-500">Used for scheduling your posts.</p>
                </div>
                <Select value={timezone} onValueChange={(val) => { if (val) setTimezone(val) }}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800" />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notifications</h4>
                  <p className="text-sm text-zinc-500">Receive alerts about your schedule.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notificationsEnabled} 
                  onChange={(e) => setNotificationsEnabled(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:checked:bg-white"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={handleSave}>Save Preferences</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
