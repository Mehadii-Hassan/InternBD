"use client";

import Link from "next/link";
import { FramerMotion } from "@/components/FramerMotion";
import { BookmarkButton } from "@/components/BookmarkButton";
import { formatDistanceToNowStrict } from "date-fns";
import type { Internship } from "@/lib/types";

interface InternshipCardProps {
  internship: Internship;
}

const TYPE_LABELS: Record<string, string> = {
  Paid: "Paid",
  Unpaid: "Unpaid",
};

const MODE_LABELS: Record<string, string> = {
  "On-site": "On-site",
  Remote: "Remote",
  Hybrid: "Hybrid",
};

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

  return (
    <FramerMotion className="group">
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="relative h-40 bg-muted">
          {internship.logo ? (
            <img
              src={internship.logo}
              alt={internship.company}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-lg font-bold text-inter">
                {getInitials(internship.company)}
              </div>
            </div>
          )}
          {internship.isNew && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold bg-green-500 text-white">
              New
            </span>
          )}
          {internship.isVerified && (
            <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold bg-blue-500 text-white">
              Verified
            </span>
          )}
          <BookmarkButton internshipId={internship.id} className="absolute top-2 right-2 z-10" />
        </div>

        <div className="p-4">
          <div className="flex flex-wrap gap-1 mb-2">
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-secondary text-foreground/80">
              {internship.paidStatus}
            </span>
            <span className="px-2 py-0.5 rounded text-xs font-medium bg-secondary text-foreground/80">
              {internship.workMode}
            </span>
          </div>

          <Link
            href={`/internship/${internship.id}`}
            className="block"
          >
            <h3 className="font-semibold text-foreground text-bangla line-clamp-1 mb-1 text-lg group-hover:text-primary-600 transition-colors">
              {internship.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">{internship.company}</p>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <span>{internship.location}</span>
              <span className="w-px h-3 bg-gray-300 dark:bg-gray-600 mx-1" aria-hidden="true" />
              <span>{internship.duration}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">
                {internship.stipend}
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  daysLeft <= 0
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    : isUrgent
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                    : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                }`}
              >
                {daysLeft <= 0 ? "Expired" : `${daysLeft} days left`}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </FramerMotion>
  );
}