import { PlannerView } from "@/components/planner/planner-view";

export default function PlannerPage() {
  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Social Planner</h2>
          <p className="text-muted-foreground">Plan and organize your upcoming social media posts.</p>
        </div>
      </div>
      <PlannerView />
    </div>
  );
}
