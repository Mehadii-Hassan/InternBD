"use client";

import { useState, useMemo } from "react";
import type { MouseEvent } from "react";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, Filter, X, ArrowRight } from "lucide-react";
import Link from "next/link";

import { Counter } from "@/components/Counter";
import { CategoryChip } from "@/components/CategoryChip";
import { InternshipCard } from "@/components/InternshipCard";
import { AdSlot } from "@/components/AdSlot";
import { SkeletonCard } from "@/components/SkeletonLoader";
import {
  SAMPLE_INTERNSHIPS,
  CATEGORIES,
  LOCATIONS,
  DEPARTMENTS,
  DURATIONS,
  PAID_STATUSES,
  WORK_MODES,
} from "@/data/internships";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

const FILTER_CONFIG = [
  { key: "category", label: "Category", options: CATEGORIES },
  { key: "location", label: "Location", options: LOCATIONS },
  { key: "department", label: "Department", options: DEPARTMENTS },
  { key: "paid", label: "Paid/Unpaid", options: PAID_STATUSES },
  { key: "mode", label: "Work Mode", options: WORK_MODES },
  { key: "duration", label: "Duration", options: DURATIONS },
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

  const filtered = useMemo(() => {
    let result = SAMPLE_INTERNSHIPS.filter((i) => {
      const matchSearch =
        i.title.toLowerCase().includes(query.toLowerCase()) ||
        i.company.toLowerCase().includes(query.toLowerCase());
      const matchCat = category ? i.category === category : true;
      const matchLoc = location ? i.location === location : true;
      const matchDept = department ? i.department === department : true;
      const matchPaid = paid ? i.paidStatus === paid : true;
      const matchMode = mode ? i.workMode === mode : true;
      const matchDur = duration ? i.duration === duration : true;

      let matchDeadline = true;
      if (deadline !== "any") {
        const d = new Date(i.deadline);
        const now = new Date();
        if (deadline === "week") {
          matchDeadline = d <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        } else if (deadline === "month") {
          matchDeadline = d <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        }
      }

      let matchPosted = true;
      if (posted !== "any") {
        const d = new Date(i.postedAt);
        const now = new Date();
        if (posted === "24h") {
          matchPosted = d >= new Date(now.getTime() - 24 * 60 * 60 * 1000);
        } else if (posted === "7d") {
          matchPosted = d >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (posted === "30d") {
          matchPosted = d >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
      }

      let matchVerified = true;
      if (verified) {
        matchVerified = i.isVerified;
      }

      return (
        matchSearch &&
        matchCat &&
        matchLoc &&
        matchDept &&
        matchPaid &&
        matchMode &&
        matchDur &&
        matchDeadline &&
        matchPosted &&
        matchVerified
      );
    });

    if (sort === "newest") {
      result.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    } else if (sort === "deadline") {
      result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } else if (sort === "stipend") {
      result.sort((a, b) => {
        const pa = parseInt(a.stipend.replace(/[^\d]/g, ""));
        const pb = parseInt(b.stipend.replace(/[^\d]/g, ""));
        return (pb || 0) - (pa || 0);
      });
    }

    return result;
  }, [
    query, category, location, department, paid, mode, duration,
    deadline, posted, verified, sort,
  ]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
            {filtered.length} internship{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-xs font-medium text-muted-foreground">Active filters:</span>
            {activeFilters.map((f) => (
              <Link
                key={`${f.key}-${f.value}`}
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
            />
            <AdSlot placement="sidebar" className="mt-8" />
          </aside>

          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.length > 0 ? (
                paginated.map((internship) => (
                  <InternshipCard key={internship.id} internship={internship} />
                ))
              ) : (
                <div className="lg:col-span-3 text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-muted-foreground" />
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

            {paginated.length > 0 && totalPages > 1 && (
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
}) {
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

      {FILTER_CONFIG.map((field) => (
        <div key={field.key} className="space-y-3">
          <label className="text-xs font-semibold text-foreground/60 uppercase tracking-wider text-bangla">
            {field.label}
          </label>
          <div className="flex flex-wrap gap-2">
            {field.options.map((opt) => {
              const isSelected = current[field.key as keyof typeof current] === String(opt);
              return (
                <button
                  key={String(opt)}
                  onClick={() => onChange(field.key, isSelected ? "" : String(opt))}
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
      ))}

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
