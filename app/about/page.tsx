import Link from "next/link";
import { Target, Users, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground text-bangla mb-6">About InternBD</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              InternBD is a free internship discovery platform built for Bangladeshi students and fresh graduates. Our mission is to bridge the gap between students and internship opportunities across Bangladesh.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you're looking for a paid internship in Dhaka, a remote opportunity, or your first experience in Software/IT, Marketing, Design, Finance, or Data/AI — we help you find it.
            </p>
          </section>

          <section className="bg-card border border-input rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Why InternBD?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground">30+ Sample Internships</h3>
                  <p className="text-sm text-muted-foreground">Realistic opportunities across Bangladesh</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground">For Students & Grads</h3>
                  <p className="text-sm text-muted-foreground">Built specifically for Bangladeshi talent</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground">Local Focus</h3>
                  <p className="text-sm text-muted-foreground">Dhaka, Chattogram, Sylhet, Remote and more</p>
                </div>
              </div>
            </div>
          </section>
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
