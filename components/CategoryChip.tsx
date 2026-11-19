"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

const CATEGORY_ICONS: Record<string, string> = {
  "Software/IT": "💻",
  Marketing: "📢",
  Design: "🎨",
  Finance: "💰",
  HR: "👥",
  Business: "📊",
  "Data/AI": "🤖",
  "Content Writing": "✍️",
  Engineering: "🔧",
  Others: "📦",
};

interface CategoryChipProps {
  category: string;
  active?: boolean;
  count?: number;
}

export function CategoryChip({ category, active = false, count }: CategoryChipProps) {
  return (
    <Link
      href={`/?category=${encodeURIComponent(category)}`}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
        active
          ? "bg-primary-600 text-white"
          : "bg-secondary text-foreground/80 hover:bg-primary-600 hover:text-white"
      }`}
    >
      <span>{CATEGORY_ICONS[category] || "📦"}</span>
      {category}
      {count !== undefined && <span className="ml-1">{count}</span>}
    </Link>
  );
}