"use client";

import { SkeletonCard } from "@/components/SkeletonLoader";

export default function InternshipsLoading() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-foreground text-bangla mb-8">Internships</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-72 flex-shrink-0 hidden lg:block">
            <div className="space-y-6">
              <div className="h-4 bg-muted rounded w-full mb-3" />
              <div className="h-4 bg-muted rounded w-3/4 mb-3" />
              <div className="h-4 bg-muted rounded w-full mb-3" />
              <div className="h-4 bg-muted rounded w-1/2 mb-3" />
            </div>
          </aside>
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
