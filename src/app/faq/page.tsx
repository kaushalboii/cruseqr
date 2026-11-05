"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChevronDown, Search } from "lucide-react";

export default function FaqPage() {
  const [search, setSearch] = useState("");
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      category: "QR Fundamentals",
      q: "What is the difference between static and dynamic QR codes?",
      a: "A static QR code encodes your data directly into the black-and-white grid pattern. Once printed, it cannot be modified. A dynamic QR code encodes a short redirect link (cruseqr.com/r/xyz). When scanned, our server instantly directs the user to your destination. This allows you to update the destination URL anytime without reprinting your flyers, menus, or packaging.",
    },
    {
      category: "QR Fundamentals",
      q: "Do dynamic QR codes expire?",
      a: "CruseQR dynamic QR codes never expire automatically unless you explicitly set an expiration date in the code's campaign settings.",
    },
    {
      category: "AI QR Art",
      q: "Can smartphones actually scan AI-generated QR art?",
      a: "Yes! Unlike naive art generators that overlay images randomly, CruseQR protects the three essential finder square patterns and maintains strict contrast ratio thresholds between modules. We also default to Level H error correction (30% recovery tolerance).",
    },
    {
      category: "Biolinks & Cards",
      q: "How does the Link-in-Bio builder work?",
      a: "CruseQR includes a dedicated Biolink page builder similar to tree.icqr.com. You can configure your profile picture, bio, custom theme, and unlimited links. Each page comes with its own vanity URL (cruseqr.com/bio/:username) and dedicated QR code.",
    },
    {
      category: "Analytics & Privacy",
      q: "What metrics are tracked during a scan?",
      a: "We record total scan events, estimated unique visitors, device categories (mobile, tablet, desktop), operating system (iOS, Android, macOS, Windows), browser, referrer source, and country/city where available. All IP addresses are anonymized via SHA256 hashing.",
    },
    {
      category: "Exports & Formats",
      q: "What file formats can I download?",
      a: "You can download PNG (from 512px up to 4096px high-res), Vector SVG (infinite scalability for billboards), and print-ready A4 PDF sheets with title and instructions.",
    },
    {
      category: "Billing",
      q: "Can I cancel or switch my plan at any time?",
      a: "Yes. There are no long-term contracts. You can upgrade, downgrade, or cancel directly from your Billing settings.",
    },
  ];

  const filtered = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#09090F] text-white flex flex-col selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Knowledge Base
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              Frequently Asked Questions
            </h1>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Everything you need to know about dynamic QR codes, AI QR synthesis, and scan analytics.
            </p>

            {/* Search Input */}
            <div className="pt-4 max-w-md mx-auto relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions or keywords..."
                className="w-full pl-10 pr-4 py-3 bg-[#171724] border border-[#272738] rounded-xl text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 mt-2" />
            </div>
          </div>

          <div className="space-y-3.5">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-sm text-text-muted">
                No matching questions found for &ldquo;{search}&rdquo;.
              </div>
            ) : (
              filtered.map((item, idx) => {
                const isOpen = openIdx === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-[#171724] border border-[#272738] overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenIdx(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-white hover:text-primary-light transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                          {item.category}
                        </span>
                        <span>{item.q}</span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-zinc-400 flex-shrink-0 transition-transform ${
                          isOpen ? "rotate-180 text-primary" : ""
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs text-text-secondary leading-relaxed border-t border-[#272738]/50">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

