import React from 'react';
import Link from "next/link";
import { Search, Building2, ArrowRight, Play } from "lucide-react";
import { Counter } from "@/components/Counter";
import { CategoryChip } from "@/components/CategoryChip";
import { InternshipCard } from "@/components/InternshipCard";
import { AdSlot } from "@/components/AdSlot";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";
import { SAMPLE_INTERNSHIPS, CATEGORIES, LOCATIONS, DEPARTMENTS, STATS } from "@/data/internships";

export default async function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-background border-b border-border py-16 lg:py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mx-auto max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6 leading-[1.1] text-balance">
              Find Your First Internship in{" "}
              <span className="text-primary">Bangladesh</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Discover verified internships in Dhaka, Chattogram, Sylhet, and across Bangladesh.
              Opportunities for students and fresh graduates in Software, Marketing, Design, Finance, HR, Data/AI, and more.
            </p>

            <div
              className={cn(
                "bg-card border border-input rounded-xl p-1 shadow-sm flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto"
              )}
            >
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                />
                <input
                  type="text"
                  placeholder="Search by keyword, company, or title..."
                  className="w-full pl-10 pr-4 py-3.5 rounded-lg border-transparent bg-transparent focus:ring-2 focus-ring-primary outline-none text-foreground placeholder-text-muted-foreground"
                />
              </div>
              <select
                className="px-4 py-3.5 rounded-lg border border-input bg-background text-foreground outline-none focus:ring-2 focus-ring-primary sm:w-48"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                className="px-4 py-3.5 rounded-lg border border-input bg-background text-foreground outline-none focus:ring-2 focus-ring-primary sm:w-48"
              >
                <option value="">All Locations</option>
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <select
                className="px-4 py-3.5 rounded-lg border border-input bg-background text-foreground outline-none focus:ring-2 focus-ring-primary sm:w-48"
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <Button className="px-6 py-3.5 whitespace-nowrap">
                <Search className="w-4 h-4 mr-2" /> Search
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
              <Counter value={STATS.totalInternships} label="Total Internships" />
              <Counter value={STATS.totalCompanies} label="Companies" />
              <Counter value={STATS.newToday} label="Added Today" />
            </div>
          </div>
        </div>
      </section>

      {/* Latest Internships */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold text-foreground text-bangla mb-1">Latest Internships</h2>
              <p className="text-sm text-muted-foreground">
                {SAMPLE_INTERNSHIPS.length} opportunity available
              </p>
            </div>
            <Link
              href="/internships"
              className="text-sm font-medium text-primary hover:text-primary/90 transition-colors flex items-center gap-1"
            >
              Browse all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_INTERNSHIPS.map((internship) => (
              <InternshipCard key={internship.id} internship={internship} />
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-16 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-foreground text-bangla">Browse by Category</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {CATEGORIES.map((cat) => (
              <CategoryChip key={cat} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Location */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-foreground text-bangla">Browse by Location</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {LOCATIONS.map((loc) => (
              <Link
                key={loc}
                href={`/internships?location=${encodeURIComponent(loc)}`}
                className="flex items-center justify-between px-4 py-3 rounded-lg border border-input bg-card hover:bg-secondary hover:border-primary transition-colors group"
              >
                <span className="text-sm font-medium text-foreground text-bangla">{loc}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Department */}
      <section className="py-16 bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-foreground text-bangla">Browse by Department</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {DEPARTMENTS.map((dept) => (
              <Link
                key={dept}
                href={`/internships?department=${encodeURIComponent(dept)}`}
                className="flex items-center justify-between px-4 py-3 rounded-lg border border-input bg-card hover:bg-secondary hover:border-primary transition-colors group"
              >
                <span className="text-sm font-medium text-foreground text-bangla">{dept}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground text-bangla mb-3">How it works</h2>
            <p className="text-muted-foreground">Simple steps to find your internship</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Search",
                desc: "Find internships by category, location, or department.",
              },
              {
                title: "Apply",
                desc: "Click through to the company website to apply directly.",
              },
              {
                title: "Track",
                desc: "Save internships you like and track deadlines.",
              },
            ].map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-4 text-foreground/60">
                  {i === 0 ? (
                    <Search className="w-5 h-5" />
                  ) : i === 1 ? (
                    <Building2 className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-primary p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4 text-bangla">
              Hiring interns?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Post your internship for free and reach thousands of students and fresh graduates across Bangladesh.
            </p>
            <Link
              href="/post"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              <Play className="w-4 h-4" /> Post a Free Internship
            </Link>
          </div>
        </div>
      </section>

      <AdSlot placement="between-cards" />

      <Footer />
    </div>
  );
}
