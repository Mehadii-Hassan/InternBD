import Link from "next/link";
import { Search, Filter, X } from "lucide-react";
import { InternshipCard } from "@/components/InternshipCard";
import { getInternships } from "@/lib/actions/internships";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Deadline Soon", value: "deadline" },
  { label: "Stipend (High)", value: "stipend" },
];

const DEADLINE_OPTIONS = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Any", value: "any" },
];

const POSTED_OPTIONS = [
  { label: "Last 24 Hours", value: "24h" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
];

export default async function InternshipsPage({
  searchParams,
}: {
  searchParams: Promise<URLSearchParams>;
}) {
  const params = await searchParams;

  const getStr = (key: string): string => {
    const val = params.get(key);
    if (val !== null) return val;
    return "";
  };

  const query = getStr("q");
  const category = getStr("category");
  const location = getStr("location");
  const department = getStr("department");
  const paid = getStr("paid");
  const mode = getStr("mode");
  const duration = getStr("duration");
  const deadline = getStr("deadline") || "any";
  const posted = getStr("posted") || "any";
  const verified = params.get("verified") === "true";
  const sort = getStr("sort") || "newest";
  const page = parseInt(getStr("page") || "1", 10);

  const { internships } = await getInternships({
    search: query || undefined,
    category: category || undefined,
    location: location || undefined,
    department: department || undefined,
    paid: paid || undefined,
    mode: mode || undefined,
    duration: duration || undefined,
    deadline: deadline || "any",
    posted: posted || "any",
    verified: verified || undefined,
    sort,
    page,
    limit: PAGE_SIZE,
  });

  const activeFilters = [
    { key: "category", label: "Category", value: category },
    { key: "location", label: "Location", value: location },
    { key: "department", label: "Department", value: department },
    { key: "paid", label: "Paid/Unpaid", value: paid },
    { key: "mode", label: "Work Mode", value: mode },
    { key: "duration", label: "Duration", value: duration },
    { key: "deadline", label: "Deadline", value: deadline },
    { key: "posted", label: "Posted", value: posted },
  ].filter((f) => f.value && f.value !== "any");

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground text-bangla">Internships</h1>
            <p className="text-muted-foreground text-sm">
              Find the right internship to start your career in Bangladesh.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-input bg-background text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            <select
              defaultValue={sort}
              className="px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus-ring-primary"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-foreground">
              {internships.length} internship{internships.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-xs font-medium text-muted-foreground">Active filters:</span>
              {activeFilters.map((f) => (
                <Link
                  key={`${f.key}-${f.value}`}
                  href="#" // Placeholder - client-side would handle this
                  onClick={(e) => e.preventDefault()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-colors"
                >
                  <span>{f.label}</span>
                  <span>{f.value}</span>
                  <X className="w-3 h-3" />
                </Link>
              ))}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-72 flex-shrink-0 hidden lg:block">
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Sort</p>
                  <select defaultValue={sort} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus-ring-primary">
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Deadline</p>
                  <select defaultValue={deadline} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus-ring-primary">
                    {DEADLINE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Posted</p>
                  <select defaultValue={posted} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus-ring-primary">
                    {POSTED_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </aside>

            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {internships.length > 0 ? (
                  internships.map((internship) => (
                    <InternshipCard key={internship.id} internship={internship} />
                  ))
                ) : (
                  <div className="lg:col-span-3 text-center py-20">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">No internships found</h3>
                    <p className="text-muted-foreground mb-8">
                      Try adjusting your filters or search terms to see more results.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
