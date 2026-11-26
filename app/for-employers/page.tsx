import React from 'react';
import Link from "next/link";

export default function ForEmployersPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground text-bangla mb-6">For Employers</h1>
        
        <div className="space-y-8">
          <section className="bg-card border border-input rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Post Free Internships</h2>
            <p className="text-muted-foreground mb-4">
              Post your internship opportunities for free and reach thousands of students and fresh graduates across Bangladesh.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Free posting for all companies</li>
              <li>Reach students across all divisions</li>
              <li>Track applications and manage listings</li>
              <li>Verified company badge for trusted employers</li>
            </ul>
            <Link
              href="/post"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Post an Internship →
            </Link>
          </section>

          <section className="bg-card border border-input rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Boost Your Post</h2>
            <p className="text-muted-foreground mb-4">
              Give your internship more visibility with a featured listing.
            </p>
            <div className="p-4 rounded-lg border border-input bg-secondary/50">
              <h3 className="font-semibold text-foreground mb-2">Featured Listing</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Your internship appears at the top of listings with a "Featured" badge.
              </p>
              <p className="text-sm font-medium text-foreground">Price: ৳500 per post</p>
              <p className="text-xs text-muted-foreground mt-2">
                Payment via bKash or Nagad. Admin will activate your featured listing after payment confirmation.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-primary hover:text-primary/90 font-medium">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
