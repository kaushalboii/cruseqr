import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Sparkles,
  BarChart3,
  Layers,
  Smartphone,
  ShieldCheck,
  Palette,
  FileDown,
  Globe,
  Lock,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export default function FeaturesPage() {
  const deepFeatures = [
    {
      badge: "Dynamic Redirection",
      title: "Change Destinations In Real Time",
      desc: "Never suffer from dead links or printed typos. Point dynamic QR codes to any URL, swap destinations instantly without altering the physical printed graphics, and set fallback destinations.",
      icon: <Zap className="w-6 h-6 text-primary" />,
      bullets: [
        "Instant URL propagation across global edge servers",
        "Target temporary promo links, then revert to homepage",
        "Zero reprints needed when campaign priorities shift",
      ],
    },
    {
      badge: "AI QR Art",
      title: "Generative Artistic QR Codes",
      desc: "Transform ordinary black-and-white barcodes into breathtaking branded artworks. Built-in optical contrast guards keep the code 100% camera-scannable.",
      icon: <Sparkles className="w-6 h-6 text-accent-cyan" />,
      bullets: [
        "10+ Curated art style presets (Cyberpunk, Anime, Nature, Luxury)",
        "Automated contrast checking & luminance validation",
        "Level H 30% error correction tolerance",
      ],
    },
    {
      badge: "Link-in-Bio & Cards",
      title: "Biolink & Digital Business Cards",
      desc: "Build mobile-optimized landing pages matching the aesthetic of tree.icqr.com, with customizable dark/cosmic themes, drag-and-drop links, and direct vCard 3.0 contact downloads.",
      icon: <Layers className="w-6 h-6 text-emerald-400" />,
      bullets: [
        "Custom username URL (cruseqr.com/bio/:username)",
        "Direct .vcf contact card download for iPhone & Android",
        "Individual link click analytics and profile view counts",
      ],
    },
    {
      badge: "Analytics Engine",
      title: "Privacy-Preserving Scan Intelligence",
      desc: "Understand your offline audience with granular scan tracking. View real-time device breakdowns, operating systems, geographic distributions, and top-performing campaign links.",
      icon: <BarChart3 className="w-6 h-6 text-amber-400" />,
      bullets: [
        "Track total scans & estimated unique scans",
        "Device classification (Mobile, Desktop, Tablet)",
        "Date range filtering: Today, 7D, 30D, 90D, All Time",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090F] text-white flex flex-col selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        {/* Header */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            <span>Capabilities & Infrastructure</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Engineered For Precision & Brand Expression
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto">
            Discover the comprehensive toolset that makes CruseQR the premier choice for modern marketers, designers, and high-growth brands.
          </p>
        </section>

        {/* Feature Sections */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {deepFeatures.map((f, i) => (
            <div
              key={i}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 lg:p-12 rounded-3xl bg-[#171724]/70 border border-[#272738] ${
                i % 2 === 1 ? "lg:flex-row-reverse" : ""
              }`}
            >
              <div className="lg:col-span-7 space-y-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {f.badge}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">{f.title}</h2>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
                <div className="space-y-2.5 pt-2">
                  {f.bullets.map((b, bi) => (
                    <div key={bi} className="flex items-center gap-2.5 text-xs text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-sm p-6 rounded-2xl bg-[#11111B] border border-[#272738] shadow-card flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                    {f.icon}
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{f.badge} Included</h3>
                  <p className="text-xs text-text-muted mb-4">
                    Ready to deploy immediately in your dashboard
                  </p>
                  <Link
                    href="/dashboard/create"
                    className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-glow"
                  >
                    <span>Launch in Generator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}

