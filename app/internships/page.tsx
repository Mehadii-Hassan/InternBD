"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, Filter, X, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Counter } from "@/components/Counter";
import { CategoryChip } from "@/components/CategoryChip";
import { InternshipCard } from "@/components/InternshipCard";
import { AdSlot } from "@/components/AdSlot";
import { getInternships, getFilterCounts } from "@/lib/actions/internships";
import { cn } from "@/lib/utils";
import type { MouseEvent } from "react";

const PAGE_SIZE = 12;

const FILTER_CONFIG = [
  { key: "category", label: "Category", options: [] as string[] },
  { key: "location", label: "Location", options: [] as string[] },
  { key: "department", label: "Department", options: [] as string[] },
  { key: "paid", label: "Paid/Unpaid", options: ["Paid", "Unpaid"] },
  { key: "mode", label: "Work Mode", options: ["On-site", "Remote", "Hybrid"] },
  { key: "duration", label: "Duration", options: ["1 month", "2 months", "3 months", "6 months", "12 months"] },
];

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

export default function InternshipsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterCounts, setFilterCounts] = useState<{
    categories: Record<string, number>;
    locations: Record<string, number>;
    departments: Record<string, number>;
  } | null>(null);

  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const location = searchParams.get("location") || "";
  const department = searchParams.get("department") || "";
  const paid = searchParams.get("paid") || "";
  const mode = searchParams.get("mode") || "";
  const duration = searchParams.get("duration") || "";
  const deadline = searchParams.get("deadline") || "any";
  const posted = searchParams.get("posted") || "any";
  const verified = searchParams.get("verified") === "true";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);

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

  const [internships, setInternships] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getInternships({
        search: query || undefined,
        category: category || undefined,
        location: location || undefined,
        department: department || undefined,
        paid: paid || undefined,
        mode: mode || undefined,
        duration: duration || undefined,
        deadline: deadline || undefined,
        posted: posted || undefined,
        verified,
        sort,
        page,
        limit: PAGE_SIZE,
      });
      setInternships(result.internships || []);
      setTotal(result.total || 0);
    } finally {
      setIsLoading(false);
    }
  }, [query, category, location, department, paid, mode, duration, deadline, posted, verified, sort, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    getFilterCounts().then((result) => {
      setFilterCounts(result);
    });
  }, []);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function setQueryParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAllFilters() {
    router.push(pathname);
  }

  return (
    <div className="min-h-screen bg-background">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

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
              onClick={() => setMobileOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            <select
              value={sort}
              onChange={(e) => setQueryParam("sort", e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-2 focus-ring-primary"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-foreground">
            {total} internship{total !== 1 ? "s" : ""} found
          </p>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs font-medium text-muted-foreground">Active filters:</span>
            {activeFilters.map((f) => (
                <Link
                  key={`${f.key}-${f.value}`}
                  href="#"
                  onClick={(e: MouseEvent) => {
                  e.preventDefault();
                  removeFilter(f.key);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-colors"
              >
                <span>{f.label}</span>
                <span>{f.value}</span>
                <X className="w-3 h-3" onClick={(e: MouseEvent) => { e.stopPropagation(); removeFilter(f.key); }} />
              </Link>
            ))}
            <button
              onClick={clearAllFilters}
              className="ml-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 flex-shrink-0 hidden lg:block">
            <FilterSidebar
              current={{
                category, location, department, paid, mode, duration, deadline, posted, verified, sort,
              }}
              onChange={setQueryParam}
              filterCounts={filterCounts}
            />
            <AdSlot placement="sidebar" className="mt-8" />
          </aside>

          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-96 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : internships.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {internships.map((internship) => (
                    <InternshipCard key={internship.id} internship={internship} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setQueryParam("page", String(Math.max(1, page - 1)))}
                        disabled={page <= 1}
                        className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium disabled:opacity-50 disabled:pointer-events-none hover:bg-secondary transition-colors"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setQueryParam("page", String(Math.min(totalPages, page + 1)))}
                        disabled={page >= totalPages}
                        className="px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium disabled:opacity-50 disabled:pointer-events-none hover:bg-secondary transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="lg:col-span-3 text-center py-20">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No internships found</h3>
                <p className="text-muted-foreground mb-8">
                  Try adjusting your filters or search terms to see more results.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AdSlot placement="between-cards" className="mt-12" />

      {mobileOpen && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-foreground text-bangla">Filters</h2>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar
              current={{
                category, location, department, paid, mode, duration, deadline, posted, verified, sort,
              }}
              onChange={setQueryParam}
              filterCounts={filterCounts}
            />
            <div className="mt-6 pt-6 border-t">
              <button
                onClick={clearAllFilters}
                className="w-full py-3 rounded-lg border border-dashed border-border text-sm text-foreground/60 hover:bg-secondary transition-colors"
              >
                Clear all filters
              </button>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSidebar({
  current,
  onChange,
  filterCounts,
}: {
  current: {
    category: string;
    location: string;
    department: string;
    paid: string;
    mode: string;
    duration: string;
    deadline: string;
    posted: string;
    verified: boolean;
    sort: string;
  };
  onChange: (key: string, value: string) => void;
  filterCounts: {
    categories: Record<string, number>;
    locations: Record<string, number>;
    departments: Record<string, number>;
  } | null;
}) {
  const categoryOptions = filterCounts?.categories
    ? Object.entries(filterCounts.categories).map(([cat, count]) => ({ name: cat, count }))
    : [];
  const locationOptions = filterCounts?.locations
    ? Object.entries(filterCounts.locations).map(([loc, count]) => ({ name: loc, count }))
    : [];
  const departmentOptions = filterCounts?.departments
    ? Object.entries(filterCounts.departments).map(([dept, count]) => ({ name: dept, count }))
    : [];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider text-bangla">
          Search
        </label>
        <input
          type="text"
          placeholder="Keyword, company, title..."
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:ring-2 focus-ring-primary"
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider text-bangla">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {categoryOptions.map(({ name, count }) => {
            const isSelected = current.category === name;
            return (
              <button
                key={name}
                onClick={() => onChange("category", isSelected ? "" : name)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium border transition-colors",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-secondary text-foreground/60"
                )}
              >
                {name} <span className="text-[10px] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider text-bangla">
          Location
        </label>
        <div className="flex flex-wrap gap-2">
          {locationOptions.map(({ name, count }) => {
            const isSelected = current.location === name;
            return (
              <button
                key={name}
                onClick={() => onChange("location", isSelected ? "" : name)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium border transition-colors",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-secondary text-foreground/60"
                )}
              >
                {name} <span className="text-[10px] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider text-bangla">
          Department
        </label>
        <div className="flex flex-wrap gap-2">
          {departmentOptions.map(({ name, count }) => {
            const isSelected = current.department === name;
            return (
              <button
                key={name}
                onClick={() => onChange("department", isSelected ? "" : name)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium border transition-colors",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-secondary text-foreground/60"
                )}
              >
                {name} <span className="text-[10px] opacity-60">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider text-bangla">
          Paid/Unpaid
        </label>
        <div className="flex flex-wrap gap-2">
          {FILTER_CONFIG[3].options.map((opt) => {
            const isSelected = current.paid === opt;
            return (
              <button
                key={opt}
                onClick={() => onChange("paid", isSelected ? "" : opt)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium border transition-colors",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-secondary text-foreground/60"
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider text-bangla">
          Work Mode
        </label>
        <div className="flex flex-wrap gap-2">
          {FILTER_CONFIG[4].options.map((opt) => {
            const isSelected = current.mode === opt;
            return (
              <button
                key={opt}
                onClick={() => onChange("mode", isSelected ? "" : opt)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium border transition-colors",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-secondary text-foreground/60"
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider text-bangla">
          Duration
        </label>
        <div className="flex flex-wrap gap-2">
          {FILTER_CONFIG[5].options.map((opt) => {
            const isSelected = current.duration === opt;
            return (
              <button
                key={opt}
                onClick={() => onChange("duration", isSelected ? "" : opt)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium border transition-colors",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-secondary text-foreground/60"
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider text-bangla">
          Deadline
        </label>
        <div className="flex flex-wrap gap-2">
          {DEADLINE_OPTIONS.map((o) => {
            const isSelected = current.deadline === o.value;
            return (
              <button
                key={o.value}
                onClick={() => onChange("deadline", isSelected ? "any" : o.value)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium border transition-colors",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-secondary text-foreground/60"
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider text-bangla">
          Posted
        </label>
        <div className="flex flex-wrap gap-2">
          {POSTED_OPTIONS.map((o) => {
            const isSelected = current.posted === o.value;
            return (
              <button
                key={o.value}
                onClick={() => onChange("posted", isSelected ? "any" : o.value)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium border transition-colors",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-secondary text-foreground/60"
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={current.verified}
            onChange={() => onChange("verified", current.verified ? "false" : "true")}
            className="w-4 h-4 rounded border-border text-primary accent-primary"
          />
          <span className="text-sm text-foreground">Verified only</span>
        </label>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider text-bangla">
          Sort by
        </label>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((o) => {
            const isSelected = current.sort === o.value;
            return (
              <button
                key={o.value}
                onClick={() => onChange("sort", isSelected ? "newest" : o.value)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium border transition-colors",
                  isSelected
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-secondary text-foreground/60"
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
