"use client";

import { useState } from "react";

export default function InternshipsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-foreground text-bangla">Internships</h1>
        <p className="text-muted-foreground text-sm">
          Find the right internship to start your career in Bangladesh.
        </p>
      </div>
    </div>
  );
}
