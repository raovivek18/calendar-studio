import { LibraryView } from "@/components/library/library-view";

export default function LibraryPage() {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Library</h2>
          <p className="text-muted-foreground">Manage your uploaded assets and media.</p>
        </div>
      </div>
      <div className="flex-1 rounded-xl border bg-card text-card-foreground shadow overflow-hidden">
        <LibraryView />
      </div>
    </div>
  );
}
