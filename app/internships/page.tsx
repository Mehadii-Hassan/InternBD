import Link from "next/link";
import { Search, Filter, X } from "lucide-react";
import { InternshipCard } from "@/components/InternshipCard";
import { getInternships } from "@/lib/actions/internships";
import {
  CATEGORIES,
  LOCATIONS,
  DEPARTMENTS,
  PAID_STATUSES,
  WORK_MODES,
  DURATIONS,
} from "@/data/internships";

const PAGE_SIZE = 12;

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
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const getStr = (key: string): string => {
    const val = params[key];
    if (typeof val === "string") return val;
    if (Array.isArray(val)) return val[0] || "";
    return "";
  };

  const query = getStr("q");
  const category = getStr("category");
  const department = getStr("department");
  const location = getStr("location");
  const paid = getStr("paid");
  const mode = getStr("mode");
  const duration = getStr("duration");
  const deadline = getStr("deadline") || "any";
  const posted = getStr("posted") || "any";
  const verified = params["verified"] === "true";
  const sort = getStr("sort") || "newest";
  const page = parseInt(getStr("page") || "1", 10);

  const { internships, total } = await getInternships({
    search: query || undefined,
    category: category || undefined,
    department: department || undefined,
    location: location || undefined,
    paid: paid || undefined,
    mode: mode || undefined,
    duration: duration || undefined,
    deadline: deadline || undefined,
    posted: posted || undefined,
    verified: verified || undefined,
    sort,
    page,
    limit: PAGE_SIZE,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const activeFilters = [
    { key: "category", label: "Category", value: category },
    { key: "department", label: "Department", value: department },
    { key: "location", label: "Location", value: location },
    { key: "paid", label: "Paid", value: paid },
    { key: "mode", label: "Work Mode", value: mode },
    { key: "duration", label: "Duration", value: duration },
    { key: "deadline", label: "Deadline", value: deadline },
    { key: "posted", label: "Posted", value: posted },
    { key: "verified", label: "Verified Only", value: verified ? "true" : "" },
  ].filter((f) => f.value && f.value !== "any");

  function buildUrl(overrides: Record<string, string | null>): string {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "string") {
        next.set(key, value);
      }
    }
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null || value === "") {
        next.delete(key);
      } else if (value !== undefined) {
        next.set(key, value);
      }
    }
    if (overrides.page === undefined) {
      next.set("page", "1");
    }
    return `?${next.toString()}`;
  }

  return (
    <main className="min-h-screen bg-background py-8">
      <a href="#content" className="skip-link">Skip to content</a>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground text-bangla" id="content">
              Internships
            </h1>
            <p className="text-muted-foreground text-sm">
              Find the right internship to start your career in Bangladesh.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:flex-nowrap">
            <button
              className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm font-medium text-foreground">
            <span className="font-semibold tabular-nums">{total}</span>{" "}
            internship{total !== 1 ? "s" : ""} found
          </div>

          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs font-medium text-muted-foreground">
                Active filters:
              </span>
              {activeFilters.map((f) => (
                <Link
                  key={`${f.key}-${f.value}`}
                  data-testid={`filter-chip-${f.key}-${f.value}`}
                  href={buildUrl({ [f.key]: null })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-colors"
                >
                  <span>{f.label}</span>
                  <span>{f.value}</span>
                  <X className="w-3 h-3" />
                </Link>
              ))}
              <Link
                data-testid="filter-chip-clear-all"
                href={buildUrl({
                  q: null,
                  category: null,
                  department: null,
                  location: null,
                  paid: null,
                  mode: null,
                  duration: null,
                  deadline: null,
                  posted: null,
                  verified: null,
                })}
                className="ml-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
              >
                Clear all
              </Link>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop filter sidebar */}
          <aside className="lg:w-72 flex-shrink-0 hidden lg:block">
            <div className="space-y-6">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Search
                </p>
                <input
                  type="text"
                  defaultValue={query}
                  placeholder="Keyword, company, title..."
                  className="w-full px-4 py-3 rounded-md border border-input bg-background text-foreground outline-none focus:ring-2 focus-ring-primary"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Category
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat}
                      data-testid={`filter-category-${cat}`}
                      href={buildUrl({ category: cat === category ? null : cat })}
                      className={`px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                        category === cat
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-secondary text-foreground/80"
                      }`}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Location
                </p>
                <div className="flex flex-wrap gap-2">
                  {LOCATIONS.map((loc) => (
                    <Link
                      key={loc}
                      data-testid={`filter-location-${loc}`}
                      href={buildUrl({ location: loc === location ? null : loc })}
                      className={`px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                        location === loc
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-secondary text-foreground/80"
                      }`}
                    >
                      {loc}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Department
                </p>
                <div className="flex flex-wrap gap-2">
                  {DEPARTMENTS.map((dept) => (
                    <Link
                      key={dept}
                      data-testid={`filter-department-${dept}`}
                      href={buildUrl({ department: dept === department ? null : dept })}
                      className={`px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                        department === dept
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-secondary text-foreground/80"
                      }`}
                    >
                      {dept}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Work Mode
                </p>
                <div className="flex flex-wrap gap-2">
                  {WORK_MODES.map((m) => (
                    <Link
                      key={m}
                      data-testid={`filter-mode-${m}`}
                      href={buildUrl({ mode: m === mode ? null : m })}
                      className={`px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                        mode === m
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-secondary text-foreground/80"
                      }`}
                    >
                      {m}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Paid / Unpaid
                </p>
                <div className="flex flex-wrap gap-2">
                  {PAID_STATUSES.map((p) => (
                    <Link
                      key={p}
                      data-testid={`filter-paid-${p}`}
                      href={buildUrl({ paid: p === paid ? null : p })}
                      className={`px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                        paid === p
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-secondary text-foreground/80"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Duration
                </p>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <Link
                      key={d}
                      data-testid={`filter-duration-${d}`}
                      href={buildUrl({ duration: d === duration ? null : d })}
                      className={`px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                        duration === d
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-secondary text-foreground/80"
                      }`}
                    >
                      {d}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Deadline
                </p>
                <div className="flex flex-wrap gap-2">
                  {DEADLINE_OPTIONS.map((o) => (
                    <Link
                      key={o.value}
                      data-testid={`filter-deadline-${o.value}`}
                      href={buildUrl({ deadline: deadline === o.value ? null : o.value })}
                      className={`px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                        deadline === o.value
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-secondary text-foreground/80"
                      }`}
                    >
                      {o.label}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Posted
                </p>
                <div className="flex flex-wrap gap-2">
                  {POSTED_OPTIONS.map((o) => (
                    <Link
                      key={o.value}
                      data-testid={`filter-posted-${o.value}`}
                      href={buildUrl({ posted: posted === o.value ? null : o.value })}
                      className={`px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                        posted === o.value
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-border bg-background hover:bg-secondary text-foreground/80"
                      }`}
                    >
                      {o.label}
                    </Link>
                  ))}
                  <Link
                    data-testid="filter-verified"
                    href={buildUrl({ verified: verified ? null : "true" })}
                    className={`px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                      verified
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-secondary text-foreground/80"
                    }`}
                  >
                    Verified Only
                  </Link>
                </div>
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
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No internships found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search terms to see more results.
                  </p>
                  <Link
                    data-testid="filter-chip-clear-all"
                    href={buildUrl({
                      q: null,
                      category: null,
                      department: null,
                      location: null,
                      paid: null,
                      mode: null,
                      duration: null,
                      deadline: null,
                      posted: null,
                      verified: null,
                    })}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
                  >
                    Clear all filters
                  </Link>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between">
                <div className="flex -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Link
                      key={p}
                      data-testid={`page-${p}`}
                      href={buildUrl({ page: String(p) })}
                      className={`px-4 py-2 rounded-md border transition-colors text-sm font-medium ${
                        page === p
                          ? "bg-primary border-primary text-primary-foreground z-10"
                          : "border-border bg-background text-foreground/70 hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      {p}
                    </Link>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
