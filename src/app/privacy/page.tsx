import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#09090F] text-white flex flex-col selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-sm text-zinc-300 leading-relaxed">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Legal & Trust
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 mb-2">
              Privacy Policy
            </h1>
            <p className="text-xs text-text-muted">Last updated: November 2026</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">1. Information We Collect</h2>
            <p>
              CruseQR collects information necessary to deliver and manage your QR codes, accounts, and analytics. For account holders, this includes your name, email address, password hash, and optional profile avatar.
            </p>
            <p>
              For visitors scanning a CruseQR dynamic redirect link (e.g. <code>cruseqr.com/r/:code</code>), we collect aggregated scan metrics including device classification (mobile, desktop), operating system, browser, country, and timestamp.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">2. IP Anonymization & Security</h2>
            <p>
              To respect end-user privacy and comply with GDPR, CCPA, and global data privacy standards, visitor IP addresses are immediately hashed using one-way cryptographic algorithms and are never stored in raw readable format in our databases.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">3. Data Ownership & Storage</h2>
            <p>
              You retain 100% full ownership over the content, logos, URLs, and business card assets you configure on CruseQR. We do not sell or monetize your visitor scan data to third-party ad networks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-white">4. Contacting Us</h2>
            <p>
              For privacy inquiries or data deletion requests, email our data protection officer at <code>privacy@cruseqr.com</code>.
            </p>
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}

