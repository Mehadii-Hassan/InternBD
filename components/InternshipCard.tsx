"use client";

import Link from "next/link";
import { FramerMotion } from "@/components/FramerMotion";
import { BookmarkButton } from "@/components/BookmarkButton";
import { VoteWidget } from "@/components/vote/VoteWidget";
import { MapPin, Clock } from "lucide-react";
import type { Internship } from "@/lib/types";
import { cn } from "@/lib/utils";

interface InternshipCardProps {
  internship: Internship;
}

function badgeColorForCompany(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [170, 190, 210, 230, 250, 270, 290, 310, 330, 350];
  return hues[Math.abs(hash) % hues.length];
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
  const isCritical = daysLeft <= 3 && daysLeft > 0;
  const isExpired = daysLeft <= 0;

  const totalVotes = internship.real_votes + internship.fake_votes;
  const fakeShare = totalVotes > 0 ? internship.fake_votes / totalVotes : 0;
  const isLikelyFake = totalVotes >= 5 && fakeShare >= 0.6;
  const isVerified = internship.is_verified;

  const badgeHue = badgeColorForCompany(internship.company_name);

  return (
    <FramerMotion className="group">
      <div
        className={cn(
          "bg-card border border-border rounded-lg overflow-hidden flex flex-col h-full transition-all duration-200 group-hover:border-primary/30 group-hover:shadow-sm group-hover:-translate-y-1"
        )}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold",
                  `bg-hsl(${badgeHue} 40% 85%)`,
                  `text-hsl(${badgeHue} 60% 35%)`
                )}
              >
                {getInitials(internship.company_name)}
              </div>
              <div>
                <p className="text-xs font-medium text-foreground/60 leading-none">
                  {internship.company_name}
                </p>
              </div>
            </div>
            <BookmarkButton internshipId={internship.id} className="p-1" />
          </div>

          {internship.is_sample && (
             <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30 mb-2 inline-block">
              Sample
            </span>
          )}

          <div className="flex items-center gap-1.5 mb-2">
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[9px] font-medium",
                  internship.is_paid === "Paid"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                )}
              >
                {internship.is_paid}
              </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-secondary text-foreground/60">
              {internship.work_mode}
            </span>
            {internship.is_verified && (
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-primary text-primary-foreground">
                Verified
              </span>
            )}
            {isLikelyFake && !isVerified && (
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-destructive text-destructive">
                Likely Fake
              </span>
            )}
          </div>

          <Link
            href={`/internship/${internship.id}`}
            className="block"
          >
            <h3 className="font-semibold text-foreground text-bangla line-clamp-2 mb-2 text-sm group-hover:text-primary transition-colors">
              {internship.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{internship.location}</span>
              {internship.department && (
                <span className="w-px h-3 bg-border mx-1" />
              )}
              {internship.department && <span>{internship.department}</span>}
              <Clock className="w-3 h-3 shrink-0" />
              <span>{internship.duration}</span>
            </div>
          </Link>

          <div className="flex items-center justify-between text-[10px] pt-2 border-t border-border/50">
            <span
              className={cn(
                "px-2 py-0.5 rounded font-bold tabular-nums",
                isExpired
                  ? "bg-destructive/10 text-destructive dark:text-destructive/40"
                  : isCritical
                  ? "bg-accent/10 text-accent dark:text-accent/90"
                  : isUrgent
                    ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                    : "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
              )}
            >
              {isExpired ? "Expired" : isCritical ? "3 days" : isUrgent ? "7 days" : `${daysLeft} days`}
            </span>
            <span className="font-medium text-foreground">{internship.stipend}</span>
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
