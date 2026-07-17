import { SettingsView } from "@/components/settings/settings-view";

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your account and preferences.</p>
        </div>
      </div>
      <div className="flex-1 rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
        <SettingsView />
      </div>
    </div>
  );
}
