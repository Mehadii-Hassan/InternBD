"use client";

export function SkeletonLoader({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-muted rounded-lg h-full w-full ${className}`}
    />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="h-48 bg-muted w-full" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-muted w-3/4" />
        <div className="h-4 bg-muted w-1/2" />
        <div className="h-4 bg-muted w-full" />
        <div className="h-4 bg-muted w-2/3" />
      </div>
    </div>
  );
}