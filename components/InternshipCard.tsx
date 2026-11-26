"use client";

import Link from "next/link";
import Image from "next/image";
import { FramerMotion } from "@/components/FramerMotion";
import { BookmarkButton } from "@/components/BookmarkButton";
import { MapPin, Layers } from "lucide-react";
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

  const totalVotes = internship.real_votes + internship.fake_votes;
  const fakeShare = totalVotes > 0 ? internship.fake_votes / totalVotes : 0;
  const isLikelyFake = totalVotes >= 5 && fakeShare >= 0.6;

  return (
    <FramerMotion className="group">
      <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col h-full">
        <div className="relative h-36 bg-muted">
          {internship.company_logo_url ? (
            <Image
              src={internship.company_logo_url}
              alt={internship.company_name}
              className="absolute inset-0 w-full h-full object-cover"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              priority={false}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-md bg-secondary flex items-center justify-center text-muted-foreground font-bold text-sm">
                {getInitials(internship.company_name)}
              </div>
            </div>
          )}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {internship.is_sample && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                Sample
              </span>
            )}
            {internship.is_verified && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground">
                Verified
              </span>
            )}
            {isLikelyFake && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-destructive text-destructive">
                Flagged
              </span>
            )}
          </div>
          <BookmarkButton
            internshipId={internship.id}
            className="absolute top-2 right-2 z-10 p-1.5"
          />
        </div>

        <div className="p-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-medium",
                internship.is_paid === "Paid"
                  ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                  : "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
              )}
            >
              {internship.is_paid}
            </span>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-foreground/60"
            >
              {internship.work_mode}
            </span>
          </div>

          <Link
            href={`/internship/${internship.id}`}
            className="block"
          >
            <h3 className="font-semibold text-foreground text-bangla line-clamp-1 mb-1 text-lg group-hover:text-primary transition-colors">
              {internship.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {internship.company_name}
            </p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-auto">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{internship.location}</span>
              {internship.department && (
                <>
                  <span className="w-px h-3 bg-border mx-1" aria-hidden="true" />
                  <span>{internship.department}</span>
                </>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">
                {internship.stipend}
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded",
                  isExpired
                    ? "bg-destructive/10 text-destructive dark:text-destructive/40"
                    : isUrgent
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                    : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                )}
              >
                {isExpired ? "Expired" : `${daysLeft} days left`}
              </span>
            </div>
          </Link>

          {/* Compact Vote Widget */}
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
