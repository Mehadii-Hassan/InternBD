export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-background">
      <a href="#content" className="skip-link">Skip to content</a>

      <section className="py-16 lg:py-24 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground text-bangla mb-4" id="content">
              Disclaimer
            </h1>
            <p className="text-muted-foreground">
              Last updated: November 2026
            </p>
          </div>

          <div className="prose prose-lg text-muted-foreground leading-relaxed max-w-none">
            <h2 className="text-xl font-bold text-foreground mt-12 mb-4">Information Accuracy</h2>
            <p>
              InternBD aggregates internship listings from various sources including company websites,
              job boards, and direct employer submissions. While we review listings before publication,
              we cannot guarantee that every detail — including deadlines, stipends, requirements, or
              application procedures — is current or accurate.
            </p>
            <p>
              Always verify information directly on the company's official website or through their
              official contact channels before applying.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-12 mb-4">No Employment Guarantee</h2>
            <p>
              InternBD is a discovery platform, not an employer or recruiting agency. Listing an
              internship on InternBD does not constitute an employment offer, and InternBD does not
              guarantee interviews, selection, or placement. All hiring decisions are made solely by
              the hiring company.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-12 mb-4">No Application Fees</h2>
            <p>
              InternBD does not charge any fees to browse, search, or apply for internships. Employers
              can post listings for free. If anyone claiming to represent InternBD or a listed company
              asks you to pay money for an application, processing, or "security deposit," it is a
              scam. Report it immediately using the "Report Fake" button on the listing page.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-12 mb-4">External Links</h2>
            <p>
              Internship listings may contain links to external company websites and application
              portals. InternBD is not responsible for the content, privacy practices, or actions of
              third-party websites. Use those sites at your own risk.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-12 mb-4">User-Generated Content</h2>
            <p>
              Community votes, trust badges, and removal requests are user-submitted opinions, not
              verified facts. InternBD does not endorse or validate the accuracy of user-generated
              content. Use it as one signal among many when evaluating a listing.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-12 mb-4">Changes to This Disclaimer</h2>
            <p>
              We may update this disclaimer from time to time. Changes are effective when posted on
              this page. Your continued use of InternBD after updates indicates acceptance of the
              revised disclaimer.
            </p>

            <h2 className="text-xl font-bold text-foreground mt-12 mb-4">Contact Us</h2>
            <p>
              If you have questions about this disclaimer or need to report an issue, contact us at
              <a href="mailto:support@internbd.com" className="text-primary hover:text-primary/90 underline underline-offset-2">
                support@internbd.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
