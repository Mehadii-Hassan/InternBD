"use client";

import Link from "next/link";
import { FramerMotion } from "@/components/FramerMotion";
import { BookmarkButton } from "@/components/BookmarkButton";
import { VoteWidget } from "@/components/vote/VoteWidget";
import type { Internship } from "@/lib/types";
import { cn } from "@/lib/utils";

interface InternshipCardProps {
  internship: Internship;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function InternshipCard({ internship }: InternshipCardProps) {
  const deadlineDate = new Date(internship.deadline);
  const now = new Date();
  const daysLeft = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isUrgent = daysLeft <= 7 && daysLeft > 0;
  const isExpired = daysLeft <= 0;

  return (
    <FramerMotion className="group">
      <div className="bg-card border border-border rounded-md overflow-hidden flex flex-col h-full hover:border-primary/30 transition-colors duration-200">
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-secondary flex items-center justify-center text-muted-foreground font-bold text-[10px]">
                {getInitials(internship.company_name)}
              </div>
              <div>
                <p className="text-xs font-medium text-foreground/60 leading-none">{internship.company_name}</p>
              </div>
            </div>
            <BookmarkButton
              internshipId={internship.id}
              className="p-1"
            />
          </div>

          <div className="flex items-center gap-1.5 mb-2">
            {internship.is_sample && (
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
                Sample
              </span>
            )}
            <span
              className={cn(
                "px-2 py-0.5 rounded text-[9px] font-medium",
                internship.is_paid === "Paid"
                  ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                  : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
              )}
            >
              {internship.is_paid}
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-secondary text-foreground/60">
              {internship.work_mode}
            </span>
            {internship.is_verified && (
              <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-primary text-primary-foreground">
                Verified
              </span>
            )}
          </div>

          <Link
            href={`/internship/${internship.id}`}
            className="block"
          >
            <h3 className="font-semibold text-foreground text-bangla line-clamp-2 mb-1 text-sm group-hover:text-primary transition-colors">
              {internship.title}
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {internship.location}
              {internship.department && ` · ${internship.department}`}
            </p>
          </Link>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-xs font-medium text-foreground">{internship.stipend}</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded font-bold",
                isExpired
                  ? "bg-destructive/10 text-destructive dark:text-destructive/40"
                  : isUrgent
                  ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                  : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
              )}
            >
              {isExpired ? "Expired" : `${daysLeft} days`}
            </span>
          </div>
        </div>

        <div className="border-t border-border/50 bg-secondary/30 p-3">
          <VoteWidget
            internshipId={internship.id}
            currentRealVotes={internship.real_votes}
            currentFakeVotes={internship.fake_votes}
            compact
          />
        </div>
      </div>
    </FramerMotion>
  );
}
