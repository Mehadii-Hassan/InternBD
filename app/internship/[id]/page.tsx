import { notFound } from "next/navigation";
import { Metadata } from "next";
import { SAMPLE_INTERNSHIPS } from "@/data/internships";
import { ShareButtons } from "@/components/ShareButtons";
import { FakeReportWidget } from "@/components/FakeReportWidget";
import { BookmarkButton } from "@/components/BookmarkButton";
import Link from "next/link";
import { Mail, MapPin, Clock, Link as LinkIcon, Play, CheckCircle, Loader2 } from "lucide-react";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const internship = SAMPLE_INTERNSHIPS.find((i) => i.id === params.id);
  if (!internship) {
    return { title: "Internship Not Found | InternBD" };
  }
  return {
    title: `${internship.title} at ${internship.company} | InternBD`,
    description: internship.description.slice(0, 160),
    openGraph: {
      title: `${internship.title} at ${internship.company}`,
      description: internship.description,
      type: "website",
    },
  };
}

export default function InternshipDetailPage({ params }: { params: { id: string } }) {
  const internship = SAMPLE_INTERNSHIPS.find((i) => i.id === params.id);

  if (!internship) {
    notFound();
  }

  const applyUrl = internship.applyLink || `mailto:${internship.applyEmail}`;
  const isEmail = !!internship.applyEmail && !internship.applyLink;

  const related = SAMPLE_INTERNSHIPS.filter(
    (i) => i.id !== internship.id && i.category === internship.category
  ).slice(0, 3);

  const deadlineDate = new Date(internship.deadline);
  const now = new Date();
  const daysLeft = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium mb-4"
            >
              <LinkIcon className="w-3 h-3" /> Back to all internships
            </Link>
            <div className="flex items-center gap-1 mb-1">
              {internship.isNew && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-500 text-white">New</span>
              )}
              {internship.isVerified && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-500 text-white">Verified</span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground text-bangla mb-2">
              {internship.title}
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 text-lg font-bold text-inter">
                {internship.company.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <span className="text-lg font-semibold text-foreground">{internship.company}</span>
            </div>
          </div>
          <BookmarkButton internshipId={internship.id} />
        </div>

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
              {internship.paidStatus} · {internship.workMode}
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
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  daysLeft <= 0
                    ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                    : daysLeft <= 7
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                    : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                }`}
              >
                {daysLeft <= 0 ? "Expired" : `${daysLeft} days left`}
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
                  <p key={i} className="mb-3 leading-relaxed">
                    {para}
                  </p>
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

            <section className="bg-primary-600 rounded-xl p-6 text-white">
              <h2 className="text-xl font-bold mb-4 text-bangla">How to Apply</h2>
              <p className="text-primary-100 mb-6">
                {internship.applyLink
                  ? "Click the button below to apply directly on the company website."
                  : `Send your application to ${internship.applyEmail}`}
              </p>
              <a
                href={applyUrl}
                target={isEmail ? undefined : "_blank"}
                rel={isEmail ? undefined : "noopener noreferrer"}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors"
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
              <p className="mt-4 text-xs text-primary-200 text-center">
                {isEmail ? "Opens your email client" : "Opens in a new tab"}
              </p>
            </section>

            <FakeReportWidget />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider text-bangla">Apply Now</h3>
              <a
                href={applyUrl}
                target={isEmail ? undefined : "_blank"}
                rel={isEmail ? undefined : "noopener noreferrer"}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors mb-4"
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
              <ShareButtons url={typeof window !== "undefined" ? window.location.href : ""} title={internship.title} />
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider text-bangla">Related Internships</h3>
              <div className="space-y-4">
                {related.map((rel) => (
                  <Link key={rel.id} href={`/internship/${rel.id}`} className="block">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground/60">
                        {rel.company.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-foreground line-clamp-1">{rel.title}</h4>
                        <p className="text-xs text-muted-foreground">{rel.company} · {rel.location}</p>
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