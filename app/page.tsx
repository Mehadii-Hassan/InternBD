"use client";

import { useState, useMemo } from "react";
import { Search, MapPin, Clock, RefreshCw } from "lucide-react";
import Link from "next/link";

import { Counter } from "@/components/Counter";
import { CategoryChip } from "@/components/CategoryChip";
import { FilterBar } from "@/components/FilterBar";
import { InternshipCard } from "@/components/InternshipCard";
import { AdSlot } from "@/components/AdSlot";
import { SkeletonCard } from "@/components/SkeletonLoader";
import {
  SAMPLE_INTERNSHIPS,
  CATEGORIES,
  LOCATIONS,
  STATS,
} from "@/data/internships";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [paidStatus, setPaidStatus] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [duration, setDuration] = useState("");
  const [sort, setSort] = useState("newest");

  const filtered = useMemo(() => {
    let result = SAMPLE_INTERNSHIPS.filter((i) => {
      const matchSearch =
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.company.toLowerCase().includes(search.toLowerCase()) ||
        i.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = category ? i.category === category : true;
      const matchLoc = location ? i.location === location : true;
      const matchPaid = paidStatus ? i.paidStatus === paidStatus : true;
      const matchMode = workMode ? i.workMode === workMode : true;
      const matchDur = duration ? i.duration === duration : true;
      return matchSearch && matchCat && matchLoc && matchPaid && matchMode && matchDur;
    });

    if (sort === "newest") {
      result.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    } else if (sort === "deadline") {
      result.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    }
    return result;
  }, [search, category, location, paidStatus, workMode, duration, sort]);

  function handleFiltersChange(filters) {
    setCategory(filters.category);
    setLocation(filters.location);
    setPaidStatus(filters.paidStatus);
    setWorkMode(filters.workMode);
    setDuration(filters.duration);
    setSort(filters.sort);
    setSearch(filters.search);
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-b from-primary-50 via-background to-background/50 dark:from-primary-900/20 dark:via-background dark:to-background/50 border-b border-border py-12 lg:py-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mx-auto max-w-3xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground text-bangla tracking-tight mb-6 leading-tight">
              Find Your First{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
                Internship in Bangladesh
              </span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-inter leading-relaxed">
              Discover the best internships in Dhaka, Chittagong, and remote. Opportunities for students and fresh graduates across Software, Marketing, Design, Finance, HR, Data/AI, and more.
            </p>

            <div className="bg-card border border-border rounded-2xl p-1 shadow-lg flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search internships, companies..."
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-transparent bg-transparent focus:ring-2 focus:ring-primary-500 outline-none text-foreground placeholder-text-muted-foreground"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-3 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="px-4 py-3 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Locations</option>
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2"
              >
                <Search className="w-4 h-4" /> Search
              </button>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-6 max-w-xl mx-auto">
              <Counter value={STATS.totalInternships} label="Total Internships" />
              <Counter value={STATS.totalCompanies} label="Companies" />
              <Counter value={STATS.newToday} label="New This Week" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 pb-8">
            <CategoryChip category="All" active={!category} />
            {CATEGORIES.map((cat) => (
              <CategoryChip key={cat} category={cat} active={category === cat} />
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-72 flex-shrink-0 hidden lg:block">
            <h2 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider text-bangla">Filters</h2>
            <FilterBar
              initialFilters={{ category, location, paidStatus, workMode, duration, sort, search }}
              onChange={handleFiltersChange}
            />
            <AdSlot placement="sidebar" />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground text-bangla">
                {filtered.length} internship{filtered.length !== 1 ? "s" : ""} found
              </h2>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No internships found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms.</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("");
                    setLocation("");
                    setPaidStatus("");
                    setWorkMode("");
                    setDuration("");
                    setSort("newest");
                  }}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((internship) => (
                  <InternshipCard key={internship.id} internship={internship} />
                ))}
              </div>
            )}

            <div className="lg:hidden mt-8">
              <AdSlot placement="between-cards" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}