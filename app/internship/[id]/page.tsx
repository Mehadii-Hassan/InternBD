import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getInternshipById, getRelatedInternships } from "@/lib/actions/internships";
import { ShareButtons } from "@/components/ShareButtons";
import { FakeReportWidget } from "@/components/FakeReportWidget";
import { BookmarkButton } from "@/components/BookmarkButton";
import { VoteWidget } from "@/components/vote/VoteWidget";
import { RemovalRequestForm } from "@/components/vote/RemovalRequestForm";
import { AdSlot } from "@/components/AdSlot";
import Link from "next/link";
import { Mail, MapPin, Clock, Link as LinkIcon, Play, CheckCircle, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import type { Internship } from "@/lib/types";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const resolvedParams = await params;
  const { internship, error } = await getInternshipById(resolvedParams.id);
  if (error || !internship) {
    return { title: "Internship Not Found | InternBD" };
  }
  return {
    title: `${internship.title} at ${internship.company_name} | InternBD`,
    description: internship.description.slice(0, 160),
    openGraph: {
      title: `${internship.title} at ${internship.company_name}`,
      description: internship.description,
      type: "website",
    },
  };
}

export default async function InternshipDetailPage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const { internship, error } = await getInternshipById(resolvedParams.id);

  if (error || !internship) {
    notFound();
  }

  const applyUrl = internship.apply_link || `mailto:${internship.apply_email}`;
  const isEmail = !!internship.apply_email && !internship.apply_link;

  const { internships: related } = await getRelatedInternships(resolvedParams.id, internship.category, 3);

  const deadlineDate = new Date(internship.deadline);
  const now = new Date();
  const daysLeft = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isExpired = daysLeft <= 0;
  const isUrgent = daysLeft <= 7 && daysLeft > 0;

  const totalVotes = internship.real_votes + internship.fake_votes;
  const fakeShare = totalVotes > 0 ? internship.fake_votes / totalVotes : 0;
  const isLikelyFake = totalVotes >= 5 && fakeShare >= 0.6;
  const isVerified = internship.is_verified;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/internships"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/90 text-sm font-medium mb-4"
            >
              <LinkIcon className="w-3 h-3" /> Back to all internships
            </Link>
            <div className="flex items-center gap-1 mb-1">
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
                  Community Flagged
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground text-bangla mb-2 leading-tight">
              {internship.title}
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center text-muted-foreground font-bold text-sm">
                {internship.company_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <span className="text-lg font-semibold text-foreground">{internship.company_name}</span>
            </div>
          </div>
          <BookmarkButton internshipId={internship.id} />
        </div>

        {/* Likely Fake Warning */}
        {isLikelyFake && !isVerified && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-destructive">Community Flagged as Potentially Fake</h3>
                <p className="text-xs text-destructive/60 mt-1">
                  This listing has received multiple "fake" votes from the community. Please verify before applying.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Meta info grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <MapPin className="w-3 h-3" /> <span>Location</span>
            </div>
            <p className="text-sm font-medium text-foreground">{internship.location}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Clock className="w-3 h-3" /> <span>Duration</span>
            </div>
            <p className="text-sm font-medium text-foreground">{internship.duration}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span>Type</span>
            </div>
            <p className="text-sm font-medium text-foreground flex items-center gap-1">
              {internship.is_paid} · {internship.work_mode}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span>Stipend</span>
            </div>
            <p className="text-sm font-medium text-foreground">{internship.stipend}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 col-span-2 md:col-span-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Clock className="w-3 h-3" /> <span>Deadline</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">{internship.deadline}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  isExpired
                    ? "bg-destructive/10 text-destructive dark:text-destructive/40"
                    : isUrgent
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                    : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                }`}
              >
                {isExpired ? "Expired" : `${daysLeft} days left`}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 text-bangla">Description</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                {internship.description.split("\n").map((para, i) => (
                  <p key={i} className="mb-3 leading-relaxed">{para}</p>
                ))}
              </div>
            </section>

            <section className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 text-bangla flex items-center gap-2">
                <Loader2 className="w-4 h-4" /> Requirements
              </h2>
              <ul className="space-y-3">
                {internship.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 text-bangla flex items-center gap-2">
                <Play className="w-4 h-4" /> Responsibilities
              </h2>
              <ul className="space-y-3">
                {internship.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    {resp}
                  </li>
                ))}
              </ul>
            </section>

            <section className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 text-bangla flex items-center gap-2">
                <Mail className="w-4 h-4" /> How to Apply
              </h2>
              <p className="text-muted-foreground mb-4">{internship.how_to_apply || "Apply using the link or email below."}</p>
              <a
                href={applyUrl}
                target={isEmail ? undefined : "_blank"}
                rel={isEmail ? undefined : "noopener noreferrer"}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-lg transition-colors ${
                  isLikelyFake && !isVerified
                    ? "bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isEmail ? (
                  <>
                    <Mail className="w-5 h-5" /> Apply via Email
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" /> Apply on Company Website
                  </>
                )}
              </a>
              {isLikelyFake && !isVerified && (
                <p className="mt-2 text-xs text-destructive text-center">
                  Warning: This listing is community-flagged. Verify the opportunity before applying.
                </p>
              )}
              <p className="mt-3 text-xs text-muted-foreground text-center">
                {isEmail ? "Opens your email client" : "Opens in a new tab"}
              </p>
            </section>

            {internship.source_name && (
              <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm">
                <p className="text-muted-foreground mb-2">Source:</p>
                <a
                  href={internship.source_url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {internship.source_name}
                </a>
              </div>
            )}

            {/* Vote Widget */}
            <VoteWidget
              internshipId={internship.id}
              currentRealVotes={internship.real_votes}
              currentFakeVotes={internship.fake_votes}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider text-bangla">
                Apply Now
              </h3>
              <a
                href={applyUrl}
                target={isEmail ? undefined : "_blank"}
                rel={isEmail ? undefined : "noopener noreferrer"}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-lg transition-colors ${
                  isLikelyFake && !isVerified
                    ? "bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isEmail ? (
                  <>
                    <Mail className="w-5 h-5" /> Apply via Email
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" /> Apply Now
                  </>
                )}
              </a>
              {isLikelyFake && !isVerified && (
                <p className="mt-2 text-xs text-destructive text-center">
                  Community-flagged. Verify before applying.
                </p>
              )}
              <ShareButtons url={typeof window !== "undefined" ? window.location.href : ""} title={internship.title} />
            </div>

            {/* Trust Badge & Voting in Sidebar */}
            <VoteWidget
              internshipId={internship.id}
              currentRealVotes={internship.real_votes}
              currentFakeVotes={internship.fake_votes}
              className="sticky top-[100px]"
            />

            {/* Removal Request Form */}
            <RemovalRequestForm
              internshipId={internship.id}
              postUrl={typeof window !== "undefined" ? window.location.href : ""}
            />

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider text-bangla">
                Related Internships
              </h3>
              <div className="space-y-4">
                {related.map((rel) => (
                  <Link key={rel.id} href={`/internship/${rel.id}`} className="block">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center text-xs font-bold text-foreground/60">
                        {rel.company_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground line-clamp-1">{rel.title}</h4>
                        <p className="text-xs text-muted-foreground">{rel.company_name} · {rel.location}</p>
                        <p className="text-xs text-foreground font-medium">{rel.stipend}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <AdSlot placement="sidebar" />
          </div>
        </div>
      </div>
    </div>
  );
}
