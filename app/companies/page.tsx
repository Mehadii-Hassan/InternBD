import Link from "next/link";
import { Building2, Users } from "lucide-react";
import { SAMPLE_INTERNSHIPS } from "@/data/internships";

const companies = Array.from(
  new Map(
    SAMPLE_INTERNSHIPS.map((i) => [i.company_name, i])
  ).values()
);

export default function CompaniesPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-foreground text-bangla">Companies</h1>
            <p className="text-muted-foreground text-sm">
              Explore companies offering internships in Bangladesh.
            </p>
          </div>
          <Link
            href="/post"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-input bg-background text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            <Building2 className="w-4 h-4" /> Post Free
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => {
            const related = SAMPLE_INTERNSHIPS.filter(
              (i) => i.company_name === company.company_name
            );
            return (
              <Link
                key={company.company_name}
                href={`/company/${company.company_name.toLowerCase().replace(/\s+/g, "-")}`}
                className="block"
              >
                <div className="bg-card border border-input rounded-xl p-6 hover:bg-secondary hover:border-primary transition-colors group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground font-bold text-sm">
                      {company.company_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{company.company_name}</h3>
                      <p className="text-xs text-muted-foreground">{related.length} internship{related.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary">
                      {company.is_verified ? "Verified" : "Not verified"}
                    </span>
                    <Users className="w-3 h-3 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
