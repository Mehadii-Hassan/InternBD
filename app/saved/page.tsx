"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSavedIds } from "@/lib/storage";
import { SAMPLE_INTERNSHIPS } from "@/data/internships";
import { InternshipCard } from "@/components/InternshipCard";
import { Bookmark } from "lucide-react";
import { AdSlot } from "@/components/AdSlot";

export default function SavedPage() {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedIds(getSavedIds());
  }, []);

  const savedInternships = SAMPLE_INTERNSHIPS.filter((i) => savedIds.includes(i.id));

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground text-bangla mb-2">Saved Internships</h1>
          <p className="text-muted-foreground">
            You have {savedInternships.length} saved internship{savedInternships.length !== 1 ? "s" : ""}.
          </p>
        </div>

        {savedInternships.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <Bookmark className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No saved internships yet</h3>
            <p className="text-muted-foreground mb-6">
              Bookmark internships you're interested in to find them easily later.
            </p>
            <Link
              href="/"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse internships
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedInternships.map((internship) => (
              <div key={internship.id}>
                <InternshipCard internship={internship} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 lg:hidden">
          <AdSlot placement="between-cards" />
        </div>
      </div>
    </div>
  );
}