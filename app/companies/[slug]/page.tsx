import React from 'react';
import { notFound } from "next/navigation";
import Link from "next/link";
import { Building2, MapPin, Clock } from "lucide-react";import { SAMPLE_INTERNSHIPS } from "@/data/internships";

export default function CompanyPage({ params }: { params: { slug: string } }) {
  const companyName = params.slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const companyInternships = SAMPLE_INTERNSHIPS.filter((i) => i.company_name === companyName);

  if (companyInternships.length === 0) {
    notFound();
  }

  const company = companyInternships[0];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-1">
          <Link
            href="/companies"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Companies
          </Link>
        </div>

        <div className="bg-card border border-input rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                {company.company_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground text-bangla">{company.company_name}</h1>
                <p className="text-muted-foreground text-sm">{companyInternships.length} internship{companyInternships.length !== 1 ? "s" : ""} available</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                <span>{company.company_name}</span>
              </div>
              <div className="w-px h-3 bg-border mx-2" />
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{companyInternships[0].duration}</span>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-bold text-foreground mb-4">Available Internships</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companyInternships.map((internship) => (
            <div key={internship.id} className="bg-card border border-input rounded-xl p-4 hover:bg-secondary hover:border-primary transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  {internship.is_paid}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-foreground/60">
                  {internship.work_mode}
                </span>
              </div>
              <Link
                href={`/internship/${internship.id}`}
                className="block"
              >
                <h3 className="font-semibold text-foreground text-bangla line-clamp-1 mb-1 text-lg group-hover:text-primary transition-colors">
                  {internship.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">{internship.location}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-auto">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{internship.location}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{internship.stipend}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                    {Math.ceil((new Date(internship.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
