export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-foreground text-bangla mb-6">Privacy Policy</h1>
        
        <div className="prose prose-lg text-muted-foreground leading-relaxed space-y-6 max-w-none">
          <p>Last updated: November 2026</p>
          
          <p>
            InternBD ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website.
          </p>

          <h2 className="text-xl font-semibold text-foreground mb-3 mt-6">1. Information We Collect</h2>
          <p>
            We may collect personal information such as your name, email address, and resume when you voluntarily submit it through our contact or internship posting forms. We also collect non-personal usage data through analytics.
          </p>

          <h2 className="text-xl font-semibold text-foreground mb-3 mt-6">2. How We Use Your Information</h2>
          <p>
            We use collected information to: respond to your inquiries, display internship opportunities, improve our website, and send relevant updates (only with your consent).
          </p>

          <h2 className="text-xl font-semibold text-foreground mb-3 mt-6">3. Data Storage</h2>
          <p>
            Currently, InternBD is a frontend-only demo. Any saved bookmarks are stored locally in your browser using localStorage and are not transmitted to any server.
          </p>

          <h2 className="text-xl font-semibold text-foreground mb-3 mt-6">4. Third-Party Services</h2>
          <p>
            We may use third-party services such as analytics providers and advertising networks (e.g., Google AdSense) in the future. These services may collect information according to their own privacy policies.
          </p>

          <h2 className="text-xl font-semibold text-foreground mb-3 mt-6">5. Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data by contacting us at the email below.
          </p>

          <h2 className="text-xl font-semibold text-foreground mb-3 mt-6">6. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, contact us at: privacy@internbd.com
          </p>
        </div>

        <div className="mt-12 pt-8 border-t">
          <a href="/" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  );
}