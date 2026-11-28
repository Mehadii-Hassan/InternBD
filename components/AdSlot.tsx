"use client";

import { getAdSlots } from "@/lib/actions/internships";
import { useState, useEffect } from "react";

export function AdSlot() {
  const [adSlots, setAdSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdSlots() {
      const { adSlots } = await getAdSlots();
      // Filter active slots within date range
      const now = new Date();
      const active = adSlots.filter((slot) => {
        if (!slot.is_active) return false;
        if (slot.start_date && new Date(slot.start_date) > now) return false;
        if (slot.end_date && new Date(slot.end_date) < now) return false;
        return true;
      });
      setAdSlots(active);
      setLoading(false);
    }
    loadAdSlots();
  }, []);

  useEffect(() => {
    // Track impression
  }, [adSlots]);

  const ad = adSlots[0];
  if (!ad || loading) return null;

  return (
    <div className="bg-card border border-input rounded-xl p-6 my-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
          <span className="text-xs font-bold">{ad.title.charAt(0)}</span>
        </div>
        <div className="flex-1">
          <a
            href={ad.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <h3 className="text-sm font-medium text-foreground mb-1">{ad.title}</h3>
            <p className="text-xs text-muted-foreground">{ad.description || ""}</p>
          </a>
        </div>
      </div>
    </div>
  );
}
