import Link from "next/link";
import React from "react";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-4 sm:px-6 lg:px-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
