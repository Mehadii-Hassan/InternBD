"use client";

import Link from "next/link";
import {
  Code2,
  Megaphone,
  Palette,
  Banknote,
  Users,
  Building2,
  CircuitBoard,
  FileText,
  HardHat,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "Software/IT": Code2,
  Marketing: Megaphone,
  Design: Palette,
  Finance: Banknote,
  HR: Users,
  Business: Building2,
  "Data/AI": CircuitBoard,
  "Content Writing": FileText,
  Engineering: HardHat,
  Others: Briefcase,
};

interface CategoryChipProps {
  category: string;
  active?: boolean;
  count?: number;
}

export function CategoryChip({ category, active = false, count }: CategoryChipProps) {
  const Icon = CATEGORY_ICONS[category] || Briefcase;

  return (
    <Link
      href={`/internships?category=${encodeURIComponent(category)}`}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-foreground/60 hover:bg-primary hover:text-primary-foreground"
      )}
    >
      <Icon className="w-3 h-3" />
      {category}
      {count !== undefined && <span className="ml-1">{count}</span>}
    </Link>
  );
}
