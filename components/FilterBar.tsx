"use client";

import { useState, useCallback } from "react";
import {
  Filter,
  Clock,
  Briefcase,
  Home,
  SortAsc,
  ArrowUpDown,
} from "lucide-react";
import Link from "next/link";

import {
  CATEGORIES,
  LOCATIONS,
  PAID_STATUSES,
  WORK_MODES,
  DURATIONS,
  Category,
  Location,
  PaidStatus,
  WorkMode,
  Duration,
} from "@/lib/types";

interface FilterState {
  category: string;
  location: string;
  paidStatus: string;
  workMode: string;
  duration: string;
  sort: string;
  search: string;
}

const DEFAULT_FILTER: FilterState = {
  category: "",
  location: "",
  paidStatus: "",
  workMode: "",
  duration: "",
  sort: "newest",
  search: "",
};

export function FilterBar({
  initialFilters,
  onChange,
}: {
  initialFilters?: Partial<FilterState>;
  onChange?: (filters: FilterState) => void;
}) {
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTER,
    ...initialFilters,
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const updateFilter = useCallback(
    (key: keyof FilterState, value: string) => {
      const next = { ...filters, [key]: value };
      setFilters(next);
      onChange?.(next);
    },
    [filters, onChange]
  );

  return (
    <div className="w-full">
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-secondary rounded-xl border border-border mb-4"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-foreground/60" />
          <span className="text-sm font-medium text-foreground">
            Filters{" "}
            <span className="text-xs text-muted-foreground">
              {Object.values(filters).filter(Boolean).length} active
            </span>
          </span>
        </div>
        <ArrowUpDown className={`w-4 h-4 transition-transform ${mobileOpen ? "rotate-180" : ""}`} />
      </button>

      {mobileOpen && (
        <div className="space-y-4 px-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Search</label>
          </div>
          <input
            type="text"
            placeholder="Keyword, company, title..."
            className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary-500 outline-none"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            {Object.entries({
              Category: { options: CATEGORIES, key: "category" as keyof FilterState },
              Location: { options: LOCATIONS, key: "location" as keyof FilterState },
              "Paid/Unpaid": { options: PAID_STATUSES, key: "paidStatus" as keyof FilterState },
              "Work Mode": { options: WORK_MODES, key: "workMode" as keyof FilterState },
            }).map(([label, { options, key }]) => (
              <div key={label} className="space-y-1">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">{label}</label>
                <div className="flex flex-wrap gap-1">
                  {options.map((opt) => {
                    const isSelected = filters[key] === String(opt);
                    return (
                      <button
                        key={String(opt)}
                        onClick={() =>
                          updateFilter(key, isSelected ? "" : String(opt))
                        }
                        className={`px-2.5 py-1.5 rounded text-xs font-medium border transition-all ${
                          isSelected
                            ? "bg-primary-600 border-primary-600 text-white"
                            : "border-border bg-background hover:bg-secondary text-foreground/80"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Duration</label>
            <div className="flex flex-wrap gap-1">
              {DURATIONS.map((dur) => {
                const isSelected = filters.duration === dur;
                return (
                  <button
                    key={dur}
                    onClick={() => updateFilter("duration", isSelected ? "" : dur)}
                    className={`px-2.5 py-1.5 rounded text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-primary-600 border-primary-600 text-white"
                        : "border-border bg-background hover:bg-secondary text-foreground/80"
                    }`}
                  >
                    {dur}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider">Sort by</label>
            <div className="flex flex-wrap gap-1">
              {[
                { label: "Newest", value: "newest" },
                { label: "Deadline soon", value: "deadline" },
              ].map((opt) => {
                const isSelected = filters.sort === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => updateFilter("sort", isSelected ? "" : opt.value)}
                    className={`px-2.5 py-1.5 rounded text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-primary-600 border-primary-600 text-white"
                        : "border-border bg-background hover:bg-secondary text-foreground/80"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => {
              setFilters(DEFAULT_FILTER);
              onChange?.(DEFAULT_FILTER);
            }}
            className="w-full py-2 rounded-lg border border-dashed border-border text-sm text-foreground/60 hover:bg-secondary transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}