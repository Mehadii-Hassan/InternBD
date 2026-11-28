import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Mail, MapPin, Clock, Play, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { getInternshipById, getRelatedInternships } from "@/lib/actions/internships";
import { FakeReportWidget } from "@/components/FakeReportWidget";
import { ShareButtons } from "@/components/ShareButtons";
import { BookmarkButton } from "@/components/BookmarkButton";

export const revalidate = 1800;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
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

export default async function InternshipDetailPage({ params }: { params: Promise<{ id: string }> }) {
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
  const isCritical = daysLeft <= 3 && daysLeft > 0;

  const totalVotes = internship.real_votes + internship.fake_votes;
  const fakeShare = totalVotes > 0 ? internship.fake_votes / totalVotes : 0;
  const isLikelyFake = totalVotes >= 5 && fakeShare >= 0.6;
  const isVerified = internship.is_verified;

  return (
    <div className="min-h-screen bg-background">
      <a href="#content" className="skip-link">Skip to content</a>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/internships"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/90 text-sm font-medium mb-4 text-bangla"
          >
            <span className="w-3 h-3" /> Back to all internships
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-1 mb-1">
              {internship.is_sample && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30">
                  Sample
                </span>
              )}
              {internship.is_verified && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground">
                  Verified
                </span>
              )}
              {isLikelyFake && !isVerified && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-destructive text-destructive">
                  Community Flagged
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground text-bangla mb-2 leading-tight" id="content">
              {internship.title}
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground font-bold text-sm">
                {internship.company_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <span className="text-lg font-semibold text-foreground">{internship.company_name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BookmarkButton internshipId={internship.id} className="p-1.5" />
            <ShareButtons
              url={typeof window !== "undefined" ? window.location.href : ""}
              title={internship.title}
            />
          </div>
        </div>

        {isLikelyFake && !isVerified && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-5 text-destructive mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-destructive">Community Flagged as Potentially Fake</h3>
                <p className="text-xs text-destructive/60 mt-1">
                  This listing has received multiple "fake" votes from the community. Please verify before applying.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left column: Content */}
          <div className="md:col-span-8 space-y-8">
            <section className="bg-card border border-input rounded-xl p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-card border border-input rounded-lg p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <MapPin className="w-3 h-3" /> <span>Location</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{internship.location}</p>
                </div>
                <div className="bg-card border border-input rounded-lg p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Clock className="w-3 h-3" /> <span>Duration</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{internship.duration}</p>
                </div>
                <div className="bg-card border border-input rounded-lg p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span>Type</span>
                  </div>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1">
                    {internship.is_paid} · {internship.work_mode}
                  </p>
                </div>
                <div className="bg-card border border-input rounded-lg p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span>Stipend</span>
                  </div>
                  <p className="text-sm font-medium text-foreground">{internship.stipend}</p>
                </div>
                <div className="bg-card border border-input rounded-lg p-4 md:col-span-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Clock className="w-3 h-3" /> <span>Deadline</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span className="text-sm font-medium text-foreground">{internship.deadline}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isExpired
                          ? "bg-destructive/10 text-destructive dark:text-destructive/40"
                          : isCritical
                          ? "bg-accent/10 text-accent dark:text-accent/90"
                          : isUrgent
                          ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                          : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                      }`}
                    >
                      {isExpired ? "Expired" : isCritical ? "3 days" : isUrgent ? "7 days" : `${daysLeft} days left`}
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="text-xl font-bold text-foreground mb-4 text-bangla">Description</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                {internship.description.split("\n").map((para, i) => (
                  <p key={i} className="mb-3 leading-relaxed">{para}</p>
                ))}
              </div>
            </section>

            <section className="bg-card border border-input rounded-xl p-6">
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

            <section className="bg-card border border-input rounded-xl p-6">
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

            <section className="bg-card border border-input rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 text-bangla flex items-center gap-2">
                <Mail className="w-4 h-4" /> How to Apply
              </h2>
              <p className="text-muted-foreground mb-4">
                {internship.apply_link ? "Apply using the link below." : internship.apply_email ? "Apply via email at " + internship.apply_email : "Apply using the link or email below."}
              </p>
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
              <p className="mt-4 text-xs text-muted-foreground text-center">
                {isExpired ? "Expired" : `${daysLeft} days left`}
              </p>

              <div className="mt-6 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/30">
                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">Safety Note</h3>
                <p className="text-sm text-amber-700 dark:text-amber-200">
                  Never pay to apply for an internship. Legitimate employers do not charge application,
                  processing, or security fees. If asked to pay, report the listing immediately.
                </p>
              </div>
            </section>

            {internship.source_name && (
              <div className="bg-muted/50 border border-input rounded-xl p-4 text-sm">
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

            <FakeReportWidget currentRealVotes={internship.real_votes} currentFakeVotes={internship.fake_votes} />
          </div>

          {/* Right column: Sticky apply card */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-card border border-input rounded-xl p-6 sticky top-24">
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
                    <Play className="w-5 h-5" /> Apply on Company Website
                  </>
                )}
              </a>
              {isLikelyFake && !isVerified && (
                <p className="mt-2 text-xs text-destructive text-center">
                  Community Flagged as Potentially Fake
                </p>
              )}
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/60">Deadline</span>
                  <span className="font-medium text-foreground">{internship.deadline}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/60">Stipend</span>
                  <span className="font-medium text-foreground tabular-nums">{internship.stipend}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/60">Work Mode</span>
                  <span className="font-medium text-foreground">{internship.work_mode}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/60">Duration</span>
                  <span className="font-medium text-foreground">{internship.duration}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Internships */}
        <div className="mt-12">
          <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider text-bangla">
            Related Internships
          </h3>
          <div className="space-y-4">
            {related.map((rel) => (
              <Link key={rel.id} href={`/internship/${rel.id}`} className="block">
                <div className="flex items-start gap-3 p-3 rounded-lg border border-input hover:bg-secondary hover:border-primary transition-colors">
                  <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center text-xs font-bold text-foreground/60 shrink-0">
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
      </div>

      {/* Mobile sticky apply bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pt-2 pb-4">
        <div className="mx-auto max-w-sm px-4">
          <a
            href={applyUrl}
            target={isEmail ? undefined : "_blank"}
            rel={isEmail ? undefined : "noopener noreferrer"}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
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
        </div>
      </div>
    </div>
  );
}
