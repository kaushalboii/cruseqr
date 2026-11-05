import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#09090F] text-white flex flex-col selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-sm text-zinc-300 leading-relaxed">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Terms of Agreement
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 mb-2">
              Terms of Service
            </h1>
            <p className="text-xs text-text-muted">Last updated: November 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By signing up for or using the CruseQR platform, services, APIs, and websites, you agree to be bound by these Terms of Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. Permitted Use & Prohibited Content</h2>
            <p>
              CruseQR may not be used to distribute malware, phishing links, scam promotions, illegal narcotics, violent materials, or deceptive deceptive redirects. Accounts found violating these safety rules will be terminated immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Subscription Billing & Cancellation</h2>
            <p>
              Paid subscription plans are billed in advance on a recurring monthly or annual basis. You may cancel your subscription at any time via your billing settings, preserving plan access until the conclusion of your current paid billing period.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Availability & SLA</h2>
            <p>
              We maintain high availability across global edge networks. Enterprise tier subscribers benefit from guaranteed 99.99% uptime service level agreements.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}

