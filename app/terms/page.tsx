import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground text-bangla mb-6">Terms of Service</h1>
        
        <div className="prose prose-lg text-muted-foreground leading-relaxed space-y-6 max-w-none">
          <p>Last updated: November 2026</p>
          
          <p>
            Welcome to InternBD. By accessing or using our website, you agree to be bound by these Terms of Service.
          </p>

          <h2 className="text-xl font-semibold text-foreground mb-3 mt-6">1. Use of the Site</h2>
          <p>
            InternBD is a free internship discovery platform. You may use the site to search for internships, save bookmarks, and submit internship postings. You agree not to misuse the site or attempt to bypass security measures.
          </p>

          <h2 className="text-xl font-semibold text-foreground mb-3 mt-6">2. Internship Listings</h2>
          <p>
            Internship listings are provided by companies, HR departments, and scraped from public sources. We do not guarantee the accuracy or completeness of any listing. Always verify opportunities directly with the company before applying.
          </p>

          <h2 className="text-xl font-semibold text-foreground mb-3 mt-6">3. No Fees</h2>
          <p>
            InternBD is free for students and fresh graduates. You should never pay to apply for an internship. If a listing asks for money, report it immediately.
          </p>

          <h2 className="text-xl font-semibold text-foreground mb-3 mt-6">4. Limitation of Liability</h2>
          <p>
            InternBD is not responsible for any loss, damage, or inconvenience caused by using the site or relying on any internship listing.
          </p>

          <h2 className="text-xl font-semibold text-foreground mb-3 mt-6">5. Contact</h2>
          <p>
            For questions about these Terms, contact us at legal@internbd.com.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-primary hover:text-primary/90 font-medium">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
