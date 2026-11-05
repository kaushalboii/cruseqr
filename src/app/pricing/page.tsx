"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Check, X, ArrowRight, Zap, Sparkles, ShieldCheck } from "lucide-react";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      id: "FREE",
      name: "Free Starter",
      desc: "Ideal for testing and individual personal links.",
      monthlyPrice: 0,
      annualPrice: 0,
      badge: null,
      features: [
        "Unlimited Static QR Codes",
        "1 Dynamic QR Code",
        "Standard PNG download (1024px)",
        "Basic color customization",
        "Standard scan resolution",
      ],
      notIncluded: [
        "AI QR Art Studio",
        "Link in Bio Builder",
        "Vector SVG & Print PDF exports",
        "Scan analytics & device trends",
        "Password protection",
      ],
      cta: "Get Started Free",
      href: "/register",
      primary: false,
    },
    {
      id: "PRO",
      name: "Pro Creator",
      desc: "For creators, designers, founders and active businesses.",
      monthlyPrice: 14,
      annualPrice: 11,
      badge: "Most Popular",
      features: [
        "Everything in Starter",
        "50 Dynamic QR Codes",
        "Full AI QR Art Studio (All 10 styles)",
        "Link-in-Bio Landing Page Builder",
        "Digital Business Card (.vcf download)",
        "High-res PNG (up to 4096px)",
        "Vector SVG & Print PDF exports",
        "Real-time scan analytics & device insights",
        "Password protection & scheduled expiration",
      ],
      notIncluded: ["Batch bulk generation", "Dedicated account manager"],
      cta: "Start 14-Day Pro Trial",
      href: "/register?plan=PRO",
      primary: true,
    },
    {
      id: "BUSINESS",
      name: "Business",
      desc: "For creative agencies, retail chains & growing marketing teams.",
      monthlyPrice: 39,
      annualPrice: 31,
      badge: "For Teams",
      features: [
        "Everything in Pro",
        "Unlimited Dynamic QR Codes",
        "Batch Bulk Creation & ZIP Archive export",
        "Projects & Folder Organization",
        "Custom center logo watermark removal",
        "Advanced scan analytics with export CSV",
        "Campaign pausing & expiration workflows",
        "Priority customer support",
      ],
      notIncluded: ["Custom contract & SLA"],
      cta: "Upgrade to Business",
      href: "/register?plan=BUSINESS",
      primary: false,
    },
    {
      id: "ENTERPRISE",
      name: "Enterprise",
      desc: "For high-volume corporations requiring SLA & custom infrastructure.",
      monthlyPrice: 99,
      annualPrice: 79,
      badge: "Scale",
      features: [
        "Everything in Business",
        "High-throughput redirect edge cluster",
        "99.99% Guaranteed uptime SLA",
        "Custom redirect domain support",
        "Full REST API access for automated generation",
        "Dedicated account manager",
        "Custom billing & invoicing",
      ],
      notIncluded: [],
      cta: "Contact Enterprise",
      href: "/contact",
      primary: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090F] text-white flex flex-col selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        {/* Header */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Fair & Transparent Pricing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Invest in Connections That Convert
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto mb-8">
            Choose the plan that fits your campaign volume. Upgrade, downgrade, or cancel anytime with zero lock-in.
          </p>

          {/* Billing Interval Toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-2xl bg-[#171724] border border-[#272738]">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                !annual ? "bg-primary text-white shadow-glow" : "text-text-secondary hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                annual ? "bg-primary text-white shadow-glow" : "text-text-secondary hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                SAVE 20%
              </span>
            </button>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {plans.map((p) => {
              const price = annual ? p.annualPrice : p.monthlyPrice;

              return (
                <div
                  key={p.id}
                  className={`p-6 rounded-3xl flex flex-col justify-between transition-all duration-300 relative ${
                    p.primary
                      ? "bg-[#171724] border-2 border-primary shadow-glow hover:border-primary-light"
                      : "bg-[#171724]/70 border border-[#272738] hover:border-[#3B3B54]"
                  }`}
                >
                  {p.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-[10px] font-bold text-white uppercase tracking-wider">
                      {p.badge}
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-text-muted mt-1 min-h-[32px]">{p.desc}</p>

                    <div className="my-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-white">${price}</span>
                        <span className="text-xs text-text-muted">/ month</span>
                      </div>
                      {annual && price > 0 && (
                        <div className="text-[11px] text-emerald-400 mt-1">Billed annually</div>
                      )}
                    </div>

                    <div className="border-t border-[#272738] pt-5 space-y-2.5 text-xs">
                      {p.features.map((f, fi) => (
                        <div key={fi} className="flex items-start gap-2 text-zinc-300">
                          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </div>
                      ))}
                      {p.notIncluded.map((nf, nfi) => (
                        <div key={nfi} className="flex items-start gap-2 text-zinc-600">
                          <X className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
                          <span>{nf}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 mt-auto">
                    <Link
                      href={p.href}
                      className={`w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        p.primary
                          ? "bg-primary hover:bg-primary-hover text-white shadow-glow"
                          : "bg-[#272738] hover:bg-[#323248] text-white"
                      }`}
                    >
                      <span>{p.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

