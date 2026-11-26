import { getAdminStats } from "@/lib/actions/admin";
import { Users, Shield, FileText, Clock, AlertTriangle, BarChart3, Mail } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  change?: string;
}

function StatCard({ title, value, icon, color, change }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change && <p className="text-xs text-muted-foreground">{change}</p>}
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground text-bangla mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage internships, reviews, and platform settings.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Internships"
          value={stats.total}
          icon={<Users />}
          color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          title="Pending Review"
          value={stats.pending}
          icon={<Clock />}
          color="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          change={`${stats.newToday} new today`}
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={<Shield />}
          color="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatCard
          title="Removal Requests"
          value={stats.removalRequests}
          icon={<Mail />}
          color="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Posts by Category */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Posts by Category</h3>
          <div className="space-y-3">
            {stats.byCategory.map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between text-sm">
                <span className="text-foreground/60">{cat}</span>
                <span className="font-medium text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Posts by Location */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Posts by Location</h3>
          <div className="space-y-3">
            {stats.byLocation.map(([loc, count]) => (
              <div key={loc} className="flex items-center justify-between text-sm">
                <span className="text-foreground/60">{loc}</span>
                <span className="font-medium text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Companies */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top Companies</h3>
          <div className="space-y-3">
            {stats.topCompanies.map(([company, count]) => (
              <div key={company} className="flex items-center justify-between text-sm">
                <span className="text-foreground/60 truncate max-w-[150px]">{company}</span>
                <span className="font-medium text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Scrape Runs */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Scrape Runs</h3>
          <div className="space-y-3">
            {stats.scrapeRuns.map((run: any) => (
              <div key={run.id} className="flex items-center justify-between text-sm p-2 rounded bg-secondary/50">
                <div>
                  <p className="text-sm text-foreground">{run.source_name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(run.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium">{run.status}</p>
                  <p className="text-xs text-muted-foreground">
                    {run.inserted}/{run.found}
                  </p>
                </div>
              </div>
            ))}
            {stats.scrapeRuns.length === 0 && (
              <p className="text-xs text-muted-foreground text-center">No scrape runs yet</p>
            )}
          </div>
        </div>

        {/* Failing Sources */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Failing Sources</h3>
          <div className="space-y-3">
            {stats.scrapeRuns.filter((r: any) => r.errors > 0).map((run: any) => (
              <div key={run.id} className="flex items-center justify-between text-sm p-2 rounded bg-destructive/10">
                <span className="text-xs text-destructive">{run.source_name}</span>
                <span className="text-xs text-destructive">{run.errors} errors</span>
              </div>
            ))}
            {stats.scrapeRuns.filter((r: any) => r.errors > 0).length === 0 && (
              <p className="text-xs text-muted-foreground text-center">No failing sources</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
