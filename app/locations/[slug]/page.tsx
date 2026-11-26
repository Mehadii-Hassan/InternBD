import Link from "next/link";
import { SAMPLE_INTERNSHIPS } from "@/data/internships";

export default function LocationPage({ params }: { params: { slug: string } }) {
  const locationName = params.slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const internships = SAMPLE_INTERNSHIPS.filter((i) => i.location === locationName);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {internships.length === 0 ? (
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold text-foreground mb-4">{locationName}</h1>
            <p className="text-muted-foreground">No internships available in this location.</p>
            <Link href="/internships" className="text-primary hover:text-primary/90 font-medium">
              Browse all internships
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground text-bangla">{locationName}</h1>
              <p className="text-muted-foreground text-sm">
                {internships.length} internship{internships.length !== 1 ? "s" : ""} available
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.map((internship) => (
                <div key={internship.id} className="bg-card border border-input rounded-xl p-4 hover:bg-secondary hover:border-primary transition-colors group">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      {internship.is_paid}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-foreground/60">
                      {internship.work_mode}
                    </span>
                  </div>
                  <Link href={`/internship/${internship.id}`} className="block">
                    <h3 className="font-semibold text-foreground text-bangla line-clamp-1 mb-1 text-lg group-hover:text-primary transition-colors">
                      {internship.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">{internship.company_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-auto">
                      <span>{internship.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-foreground">{internship.stipend}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
