import { getFilterCounts } from "@/lib/actions/internships";
import Link from "next/link";

export default async function LocationsPage() {
  const { locations } = await getFilterCounts();

  const locationsWithCounts = Object.entries(locations).map(([name, count]) => ({
    name,
    count,
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-foreground text-bangla mb-8">Locations</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {locationsWithCounts.map((loc) => (
            <Link
              key={loc.name}
              href={`/locations/${loc.name.toLowerCase()}`}
              className="block"
            >
              <div className="bg-card border border-input rounded-xl p-6 hover:bg-secondary hover:border-primary transition-colors group">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-foreground">{loc.name}</span>
                  <span className="text-xs font-medium bg-primary/10 text-primary">
                    {loc.count}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Internship opportunities in {loc.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
