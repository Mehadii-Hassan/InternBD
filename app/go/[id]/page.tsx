"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = params as unknown as { id: string };
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadApplyLink() {
      try {
        // Fetch the internship to get the apply link
        const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/internships?id=eq.${id}&select=apply_link,apply_email`, {
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""}`,
          },
        });
        const data = await res.json();
        if (data && data.length > 0) {
          const internship = data[0];
          const applyUrl = internship.apply_link || `mailto:${internship.apply_email}`;
          setRedirectUrl(applyUrl);
        }
      } catch (e) {
        console.error("Error loading apply link:", e);
      } finally {
        setLoading(false);
      }
    }
    loadApplyLink();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <span className="text-xs font-bold">→</span>
          </div>
          <p className="text-sm text-foreground">Redirecting to application...</p>
        </div>
      </div>
    );
  }

  if (!redirectUrl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-foreground">Application Link Not Found</h2>
          <p className="text-muted-foreground mt-2">The internship you're looking for doesn't have an application link.</p>
          <Link href="/" className="mt-4 text-primary hover:text-primary/90 font-medium">
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12">
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
          <span className="text-lg">→</span>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Redirecting to Application</h2>
        <p className="text-muted-foreground mb-4">
          You'll be redirected to the company's application page shortly.
        </p>
        <div className="flex justify-center">
          <a
            href={redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Go to Application →
          </a>
        </div>
      </div>
    </div>
  );
}
