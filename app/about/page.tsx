import { FramerMotion } from "@/components/FramerMotion";
import { Building2, Users, ShieldCheck, Clock, MapPin, Mail } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <a href="#content" className="skip-link">Skip to content</a>

      <section className="py-16 lg:py-24 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground text-bangla mb-4" id="content">
              About InternBD
            </h1>
            <p className="text-lg text-muted-foreground">
              Bangladesh's trusted platform for discovering verified internships. We connect students
              and fresh graduates with real opportunities across the country.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FramerMotion className="bg-card border border-input rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Verified Listings</h3>
              <p className="text-sm text-muted-foreground">
                Every internship is reviewed before publication. We flag suspicious listings and
                remove fake postings to keep the platform safe.
              </p>
            </FramerMotion>

            <FramerMotion className="bg-card border border-input rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Community Trust</h3>
              <p className="text-sm text-muted-foreground">
                Students vote on whether listings look real or fake. Community trust badges help
                you identify genuine opportunities at a glance.
              </p>
            </FramerMotion>

            <FramerMotion className="bg-card border border-input rounded-xl p-6">
              <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Free for Everyone</h3>
              <p className="text-sm text-muted-foreground">
                Posting and browsing internships is always free. No hidden fees, no application
                charges, no premium tiers.
              </p>
            </FramerMotion>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-start gap-12">
            <div className="lg:w-1/2 space-y-6">
              <h2 className="text-2xl font-bold text-foreground text-bangla">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                Finding your first internship shouldn't be harder than the internship itself.
                InternBD was built to give Bangladeshi students a single, trustworthy place to
                discover opportunities — without application fees, without fake listings, without
                nonsense.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We believe every student deserves a fair shot at real work experience. That's why
                we verify listings, surface community trust signals, and keep the platform open to
                all employers — big and small.
              </p>
            </div>
            <div className="lg:w-1/2 grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0 mt-1">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Real deadlines</h3>
                  <p className="text-sm text-muted-foreground">
                    Every listing shows exactly how many days are left to apply.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0 mt-1">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">All of Bangladesh</h3>
                  <p className="text-sm text-muted-foreground">
                    From Dhaka to Chattogram, Sylhet to Khulna — opportunities across all divisions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0 mt-1">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Direct applications</h3>
                  <p className="text-sm text-muted-foreground">
                    Apply through company websites or direct email — no middlemen, no fees.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground shrink-0 mt-1">
                  <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Student-built</h3>
                  <p className="text-sm text-muted-foreground">
                    Built with input from students who've been through the internship search.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
