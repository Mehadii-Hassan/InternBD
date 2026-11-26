import React from 'react';
import Link from "next/link";

export default function SafetyTipsPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground text-bangla mb-6">Safety Tips for Students</h1>
        
        <div className="space-y-6">
          <div className="bg-card border border-input rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">How to Spot Fake Internships</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-3">
              <li><strong>Never pay to apply:</strong> Legitimate internships never ask for application fees, processing fees, or security deposits.</li>
              <li><strong>Verify the company:</strong> Check the company website and contact them directly through official channels.</li>
              <li><strong>Be wary of unrealistic offers:</strong> Very high stipends with minimal requirements can be a red flag.</li>
              <li><strong>Check the apply link:</strong> Make sure the application link goes to the official company website, not a random form.</li>
              <li><strong>Trust your instincts:</strong> If something feels off, report it using the "Report Fake" button on the listing page.</li>
            </ul>
          </div>

          <div className="bg-card border border-input rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">What to Do If You Suspect a Fake Listing</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-3">
              <li>Click "Report Fake" on the internship detail page</li>
              <li>Provide details about why you think it's suspicious</li>
              <li>Our team will review and take appropriate action</li>
              <li>Never share personal documents or money with unverified employers</li>
            </ul>
          </div>

          <div className="bg-card border border-input rounded-xl p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Safe Application Practices</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-3">
              <li>Apply through official company websites when possible</li>
              <li>Keep records of your applications</li>
              <li>Research the company before interviews</li>
              <li>Meet in public places for in-person interviews</li>
            </ul>
          </div>
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
