"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function CookieNotice() {
  const [accepted, setAccepted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("internbd_cookies") === "accepted";
  });

  useEffect(() => {
    if (accepted) {
      const el = document.getElementById("cookie-notice");
      if (el) el.style.display = "none";
    }
  }, [accepted]);

  if (accepted) return null;

  return (
    <div
      id="cookie-notice"
      className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg px-4 pb-4 pt-3 sm:px-6 lg:px-8 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 rounded-lg bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground text-[10px] font-bold">
            C
          </div>
          <div className="text-sm">
            <p className="text-foreground">
              We use cookies to improve your experience and analyze site traffic.
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              By continuing, you accept our use of cookies.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              localStorage.setItem("internbd_cookies", "accepted");
              setAccepted(true);
            }}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Accept
          </button>
          <Link
            href="/privacy"
            className="px-4 py-2 rounded-md border border-input bg-background text-sm text-foreground hover:bg-secondary transition-colors"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
