import { getInternships, getStats } from "@/lib/actions/internships";
import { Counter } from "@/components/Counter";
import { CategoryChip } from "@/components/CategoryChip";
import { InternshipCard } from "@/components/InternshipCard";
import { AdSlot } from "@/components/AdSlot";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  CATEGORIES,
  LOCATIONS,
  DEPARTMENTS,
} from "@/lib/types";

export default async function HomePage() {
  const { internships, total } = await getInternships({
    sort: "newest",
    page: 1,
    limit: 9,
  });

  const stats = await getStats();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-secondary border-b border-border py-16 lg:py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mx-auto max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground text-bangla tracking-tight mb-6 leading-[1.1]">
              Find Your First Internship in{" "}
              <span className="text-primary">Bangladesh</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto text-inter leading-relaxed">
              Discover verified internships in Dhaka, Chattogram, Sylhet, and across Bangladesh. Opportunities for students and fresh graduates in Software, Marketing, Design, Finance, HR, Data/AI, and more.
            </p>

            <div
              className="bg-card border border-border rounded-xl p-1 shadow-xl flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto"
            >
              <div className="flex-1 relative relative">
                <input
                  type="text"
                  placeholder="Search by keyword, company, or title..."
                  className="w-full pl-10 pr-4 py-3.5 rounded-lg border-transparent bg-transparent focus:ring-2 focus-ring-primary outline-none text-foreground placeholder-text-muted-foreground"
                />
              </div>
              <Link
                href="/internships"
                className="px-6 py-3.5 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                Browse Internships <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
              <Counter value={stats.totalInternships} label="Total Internships" />
              <Counter value={stats.totalCompanies} label="Companies" />
              <Counter value={stats.newToday} label="Added Today" />
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
                {total} opportunity{total !== 1 ? "s" : ""} available
              </p>
            </div>
            <Link
              href="/internships"
              className="text-sm font-medium text-primary hover:text-primary/90 transition-colors flex items-center gap-1"
            >
              Browse all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {internships.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No internships found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.map((internship) => (
                <InternshipCard key={internship.id} internship={internship as any} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-16 bg-secondary/50">
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
                className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-card hover:bg-secondary hover:border-primary transition-colors group"
              >
                <span className="text-sm font-medium text-foreground text-bangla">
                  {loc}
                </span>
                <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Browse by Department */}
      <section className="py-16 bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-foreground text-bangla">Browse by Department</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {DEPARTMENTS.map((dept) => (
              <Link
                key={dept}
                href={`/internships?department=${encodeURIComponent(dept)}`}
                className="flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-card hover:bg-secondary hover:border-primary transition-colors group"
              >
                <span className="text-sm font-medium text-foreground text-bangla">
                  {dept}
                </span>
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  ) : i === 1 ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 3a1 1 0 011 1v6h10a1 1 0 110 2H4v6a1 1 0 01-1 1H1a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2z"></path></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" stroke="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Post a Free Internship
            </Link>
          </div>
        </div>
      </section>

      <AdSlot placement="between-cards" />

      <footer className="border-t mt-auto">
        <div className="px-4 py-12 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 text-bangla font-bold text-lg tracking-tight">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                IB
              </div>
              <span className="text-inter">Intern<span className="text-primary">BD</span></span>
            </div>
            <div className="flex gap-8 text-sm text-foreground/60">
              <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
              <Link href="/post" className="hover:text-foreground transition-colors">Post an Internship</Link>
            </div>
            <div className="flex gap-4 text-foreground/40">
              <a href="#" className="hover:text-foreground transition-colors">Facebook</a>
              <a href="#" className="hover:text-foreground transition-colors">LinkedIn</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-xs text-foreground/50">
            InternBD &copy; {new Date().getFullYear()}. Free internship discovery for Bangladeshi students.
          </div>
        </div>
      </footer>
    </div>
  );
}
