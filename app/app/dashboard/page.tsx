import { StatsCard } from "@/components/data-display/stats-card";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of brands, tasks, runs, and sentiment activity.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Brands" value="12" description="Active tenant brands" />
        <StatsCard title="Tasks" value="48" description="Configured analysis tasks" />
        <StatsCard title="Runs this week" value="31" description="Manual + scheduled" />
        <StatsCard title="Failed runs" value="2" description="Needs review" />
      </section>
    </div>
  );
}
