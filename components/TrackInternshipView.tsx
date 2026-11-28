"use client";

import { useEffect } from "react";
import { trackInternshipView } from "@/lib/actions/internships";

export function TrackInternshipView({ internshipId }: { internshipId: string }) {
  useEffect(() => {
    trackInternshipView(internshipId);
  }, [internshipId]);

  return null;
}
