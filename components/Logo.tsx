"use client";

import { cn } from "@/lib/utils";

export function Logo({ className = "", wordmark = true }: { className?: string; wordmark?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <rect width="30" height="30" x="1" y="1" rx="6" stroke="currentColor" strokeWidth="2" />
        <path
          d="M10 10h4v2h-4zM16 10h4v2h-4zM10 14h6v2h-6zM16 14h4v2h-4z"
          fill="currentColor"
        />
        <path d="M10 20h12v2H10z" fill="currentColor" />
      </svg>
      {wordmark && (
        <span className="text-bangla font-bold text-lg tracking-tight">
          Intern<span className="text-primary">BD</span>
        </span>
      )}
    </div>
  );
}
