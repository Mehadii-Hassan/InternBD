import { Search, Filter } from "lucide-react";
import { InternshipCard } from "@/components/InternshipCard";
import { getInternships } from "@/lib/actions/internships";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Deadline Soon", value: "deadline" },
  { label: "Stipend (High)", value: "stipend" },
];

export default async function InternshipsPage() {
  const { internships } = await getInternships({
    limit: PAGE_SIZE,
    sort: "newest",
  });

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
              className="lg:hidden flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            <select
              defaultValue="newest"
              className="px-4 py-3 rounded-md border border-input bg-background text-sm text-foreground outline-none focus:ring-2 focus-ring-primary"
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
                <h3 className="text-lg font-medium text-foreground mb-2">No internships found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters or search terms to see more results.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
