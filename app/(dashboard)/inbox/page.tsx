import { InboxView } from "@/components/inbox/inbox-view";

export default function InboxPage() {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inbox</h2>
          <p className="text-muted-foreground">Stay updated on your schedule changes.</p>
        </div>
      </div>
      <div className="flex-1 rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
        <InboxView />
      </div>
    </div>
  );
}
