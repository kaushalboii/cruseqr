import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { InteractiveQrDemo } from "@/components/home/InteractiveQrDemo";
import { AiArtShowcase } from "@/components/home/AiArtShowcase";
import {
  ArrowRight,
  Sparkles,
  QrCode,
  Zap,
  BarChart3,
  Layers,
  ShieldCheck,
  Check,
  Globe,
  Smartphone,
  ChevronDown,
  Building,
  UtensilsCrossed,
  ShoppingBag,
  Ticket,
  UserCheck,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: <Zap className="w-5 h-5 text-primary" />,
      title: "Real Dynamic QR Codes",
      description: "Update destination URLs at any time after printing. Zero reprints required when campaign links change.",
    },
    {
      icon: <Sparkles className="w-5 h-5 text-accent-cyan" />,
      title: "AI QR Art Studio",
      description: "Blend diffusion art prompts with optical matrices. Camera-tested contrast algorithms protect scannability.",
    },
    {
      icon: <Layers className="w-5 h-5 text-emerald-400" />,
      title: "Biolink & Landing Pages",
      description: "Create sleek multi-link mobile landing pages (like tree.icqr.com) and digital vCard business cards in seconds.",
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-amber-400" />,
      title: "Precision Analytics",
      description: "Measure scan volume, device categories, operating systems, referrers, and locations with privacy compliance.",
    },
    {
      icon: <QrCode className="w-5 h-5 text-rose-400" />,
      title: "16+ Specialized QR Types",
      description: "Generate Wi-Fi auto-connect, vCard 3.0, WhatsApp chats, app store redirects, event calendar invites, and payments.",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-primary-light" />,
      title: "Campaign Management",
      description: "Organize codes into projects and color-coded folders. Set password protection and scheduled expiration dates.",
    },
  ];

  const useCases = [
    {
      icon: <UtensilsCrossed className="w-5 h-5 text-amber-400" />,
      title: "Restaurants & Bars",
      description: "Contactless tabletop menus, drink specials, and instant Google Review feedback forms.",
      badge: "Hospitality",
    },
    {
      icon: <ShoppingBag className="w-5 h-5 text-emerald-400" />,
      title: "Retail & Packaging",
      description: "Product authenticity verification, user manuals, warranty registrations, and discounts.",
      badge: "E-Commerce",
    },
    {
      icon: <Ticket className="w-5 h-5 text-accent-cyan" />,
      title: "Events & Festivals",
      description: "High-speed badge check-ins, VIP backstage schedules, and interactive venue maps.",
      badge: "Ticketing",
    },
    {
      icon: <UserCheck className="w-5 h-5 text-primary-light" />,
      title: "Creators & Influencers",
      description: "Universal Link-in-Bio pages, podcast drops, and digital portfolio links on business cards.",
      badge: "Personal Brand",
    },
  ];

  const steps = [
    {
      step: "01",
      title: "Choose Type & Enter Content",
      description: "Select from 16 QR types including Website, Wi-Fi, vCard, WhatsApp, or Link in Bio.",
    },
    {
      step: "02",
      title: "Customize Aesthetic",
      description: "Select rounded dots, custom corner squares, gradients, your logo, and Call-to-Action frames.",
    },
    {
      step: "03",
      title: "Deploy & Track Engagement",
      description: "Download vector SVG or high-res PNG. Monitor scan interactions from your dashboard.",
    },
  ];

  const faqs = [
    {
      q: "What is the difference between static and dynamic QR codes?",
      a: "A static QR code encodes the destination directly into the pixels and cannot be altered once printed. A dynamic QR code routes through a CruseQR redirect URL (e.g. cruseqr.com/r/abc123), allowing you to change the destination URL, toggle pause status, set expiration dates, and track scan analytics at any time without changing the printed image.",
    },
    {
      q: "Do CruseQR codes ever expire?",
      a: "No! Unless you explicitly set an expiration date or pause a dynamic campaign yourself, your QR codes will continue to scan and resolve indefinitely.",
    },
    {
      q: "How does AI QR Art maintain camera scannability?",
      a: "Our synthesis engine protects the three critical finder patterns and calculates optical luminance contrast ratios between dark and light modules to prevent scan failures on iOS and Android camera apps.",
    },
    {
      q: "Can I download vector formats suitable for large billboards?",
      a: "Yes. CruseQR supports vector SVG export, print-ready PDF, and high-resolution PNGs up to 4096px, ensuring razor-sharp reproduction from business cards to giant stadium banners.",
    },
    {
      q: "Can I build Link-in-Bio pages like tree.icqr.com?",
      a: "Yes! CruseQR includes a dedicated Biolink builder with customizable themes, buttons, social links, and an auto-generated QR code linking directly to your public profile.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090F] text-white flex flex-col selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
          {/* Ambient cosmic gradient orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-accent-cyan/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Heading, Subhead, CTAs */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#171724] border border-[#272738] text-xs font-semibold text-primary-light">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>CruseQR 2.0 is live</span>
                  <span className="text-zinc-500">|</span>
                  <span className="text-zinc-300">Scan. Create. Connect.</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                  Turn Every Scan Into an{" "}
                  <span className="bg-gradient-to-r from-primary via-purple-300 to-accent-cyan bg-clip-text text-transparent">
                    Experience.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-text-secondary max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Create stunning QR codes, build digital experiences, and understand every interaction with CruseQR. From dynamic campaigns to AI-powered artistic designs.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                  <Link
                    href="/dashboard/create"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-glow transition-all active:scale-95"
                  >
                    <span>Create Your First QR</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/features"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#171724] hover:bg-[#202034] border border-[#272738] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <span>Explore Features</span>
                  </Link>
                </div>

                {/* Social proof trust row */}
                <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 text-xs text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Dynamic redirection</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Real scan analytics</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Vector exports</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Floating Preview Mockup */}
              <div className="lg:col-span-5 relative flex justify-center">
                {/* Holographic Frame Card */}
                <div className="w-full max-w-md bg-[#171724]/85 border border-[#272738] rounded-3xl p-6 backdrop-blur-xl shadow-card relative group hover:border-primary/50 transition-all duration-500">
                  {/* Decorative glowing gradient border */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-accent-cyan/30 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500 pointer-events-none" />

                  {/* Header bar of preview */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#272738] relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-[11px] font-mono text-text-muted">cruseqr.com/r/launch26</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                      ACTIVE
                    </span>
                  </div>

                  {/* Center QR Mockup */}
                  <div className="my-6 flex flex-col items-center justify-center relative z-10">
                    <div className="p-4 bg-white rounded-2xl shadow-2xl relative">
                      {/* Stylized QR SVG representation */}
                      <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
                        {/* Finder TL */}
                        <rect x="10" y="10" width="46" height="46" rx="10" fill="#8B5CF6" />
                        <rect x="18" y="18" width="30" height="30" rx="6" fill="#FFFFFF" />
                        <circle cx="33" cy="33" r="8" fill="#8B5CF6" />

                        {/* Finder TR */}
                        <rect x="124" y="10" width="46" height="46" rx="10" fill="#8B5CF6" />
                        <rect x="132" y="18" width="30" height="30" rx="6" fill="#FFFFFF" />
                        <circle cx="147" cy="33" r="8" fill="#8B5CF6" />

                        {/* Finder BL */}
                        <rect x="10" y="124" width="46" height="46" rx="10" fill="#8B5CF6" />
                        <rect x="18" y="132" width="30" height="30" rx="6" fill="#FFFFFF" />
                        <circle cx="33" cy="147" r="8" fill="#8B5CF6" />

                        {/* Data dots */}
                        <circle cx="75" cy="25" r="4" fill="#8B5CF6" />
                        <circle cx="95" cy="25" r="4" fill="#8B5CF6" />
                        <circle cx="75" cy="45" r="4" fill="#8B5CF6" />
                        <circle cx="95" cy="45" r="4" fill="#8B5CF6" />
                        <circle cx="70" cy="70" r="4" fill="#8B5CF6" />
                        <circle cx="90" cy="70" r="4" fill="#8B5CF6" />
                        <circle cx="110" cy="70" r="4" fill="#8B5CF6" />
                        <circle cx="130" cy="70" r="4" fill="#8B5CF6" />
                        <circle cx="150" cy="70" r="4" fill="#8B5CF6" />
                        <circle cx="30" cy="75" r="4" fill="#8B5CF6" />
                        <circle cx="30" cy="95" r="4" fill="#8B5CF6" />
                        <circle cx="75" cy="95" r="4" fill="#8B5CF6" />
                        <circle cx="95" cy="95" r="4" fill="#8B5CF6" />
                        <circle cx="115" cy="95" r="4" fill="#8B5CF6" />
                        <circle cx="135" cy="95" r="4" fill="#8B5CF6" />
                        <circle cx="75" cy="115" r="4" fill="#8B5CF6" />
                        <circle cx="115" cy="115" r="4" fill="#8B5CF6" />
                        <circle cx="75" cy="135" r="4" fill="#8B5CF6" />
                        <circle cx="95" cy="135" r="4" fill="#8B5CF6" />
                        <circle cx="115" cy="135" r="4" fill="#8B5CF6" />
                        <circle cx="135" cy="135" r="4" fill="#8B5CF6" />
                        <circle cx="155" cy="135" r="4" fill="#8B5CF6" />
                        <circle cx="75" cy="155" r="4" fill="#8B5CF6" />
                        <circle cx="115" cy="155" r="4" fill="#8B5CF6" />
                        <circle cx="135" cy="155" r="4" fill="#8B5CF6" />

                        {/* Center Logo Monogram */}
                        <rect x="74" y="74" width="32" height="32" rx="8" fill="#171724" />
                        <circle cx="90" cy="90" r="7" fill="#8B5CF6" />
                      </svg>
                    </div>

                    <div className="mt-3 px-3 py-1 rounded-full bg-[#11111B] border border-[#272738] text-[11px] text-zinc-300 font-semibold tracking-wide">
                      SCAN FOR LAUNCH PERKS
                    </div>
                  </div>

                  {/* Floating Metric 1 */}
                  <div className="absolute -left-6 top-1/3 p-3 rounded-2xl bg-[#11111B]/95 border border-[#272738] shadow-xl backdrop-blur-md flex items-center gap-3 animate-float">
                    <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                      <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-text-muted">Total Interactions</div>
                      <div className="text-sm font-bold text-white">4,892 Scans</div>
                    </div>
                  </div>

                  {/* Floating Metric 2 */}
                  <div className="absolute -right-6 bottom-10 p-3 rounded-2xl bg-[#11111B]/95 border border-[#272738] shadow-xl backdrop-blur-md flex items-center gap-3 animate-float [animation-delay:2s]">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[10px] text-text-muted">Scan Speed</div>
                      <div className="text-sm font-bold text-white">42ms Latency</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE QR GENERATOR SANDBOX PREVIEW */}
        <section className="py-16 bg-[#0B0B14] border-y border-[#272738]/60 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <InteractiveQrDemo />
          </div>
        </section>

        {/* AI QR ART SHOWCASE */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AiArtShowcase />
          </div>
        </section>

        {/* CORE PLATFORM FEATURES */}
        <section className="py-20 bg-[#0B0B14] border-t border-[#272738]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Full-Stack Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2 mb-4">
                Everything You Need for Enterprise QR Operations
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                Built from the ground up for modern marketing teams, creative agencies, and high-volume physical businesses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#171724]/60 border border-[#272738] hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#11111B] border border-[#272738] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="text-xs font-semibold text-accent-cyan uppercase tracking-wider">
                Workflow
              </span>
              <h2 className="text-3xl font-bold text-white tracking-tight mt-2 mb-3">
                How CruseQR Works
              </h2>
              <p className="text-xs text-text-secondary">
                Three straightforward steps from concept to physical print and analytics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {steps.map((st, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-[#171724]/40 border border-[#272738] relative space-y-3"
                >
                  <div className="text-3xl font-extrabold text-primary/30 font-mono">{st.step}</div>
                  <h3 className="text-base font-bold text-white">{st.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{st.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* USE CASES SHOWCASE */}
        <section className="py-20 bg-[#0B0B14] border-t border-[#272738]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Real-World Applications
                </span>
                <h2 className="text-3xl font-bold text-white tracking-tight mt-1">
                  Tailored For Every Industry
                </h2>
              </div>
              <Link
                href="/dashboard/templates"
                className="mt-4 md:mt-0 text-xs text-primary font-semibold hover:text-primary-light flex items-center gap-1"
              >
                <span>Browse ready-made templates</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {useCases.map((uc, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-[#171724] border border-[#272738] hover:border-primary/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-9 h-9 rounded-xl bg-[#11111B] border border-[#272738] flex items-center justify-center">
                        {uc.icon}
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                        {uc.badge}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1.5">{uc.title}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{uc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING PREVIEW TEASER */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Transparent Pricing
              </span>
              <h2 className="text-3xl font-bold text-white tracking-tight mt-2 mb-3">
                Simple Plans That Scale With You
              </h2>
              <p className="text-xs text-text-secondary">
                Start free with static codes or upgrade to Pro for dynamic redirections and AI art.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Free */}
              <div className="p-6 rounded-2xl bg-[#171724]/60 border border-[#272738] flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Starter</h3>
                  <p className="text-xs text-text-muted mt-1">For casual individuals and testing</p>
                  <div className="my-5">
                    <span className="text-3xl font-extrabold text-white">$0</span>
                    <span className="text-xs text-text-muted"> / forever</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" /> Unlimited static QR codes
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" /> 1 Dynamic QR code
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" /> Standard PNG export
                    </li>
                  </ul>
                </div>
                <Link
                  href="/register"
                  className="mt-6 w-full py-2.5 rounded-xl bg-[#272738] hover:bg-[#323248] text-white text-xs font-semibold text-center transition-all"
                >
                  Get Started Free
                </Link>
              </div>

              {/* Pro */}
              <div className="p-6 rounded-2xl bg-[#171724] border-2 border-primary relative flex flex-col justify-between shadow-glow">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-[10px] font-bold text-white uppercase tracking-wider">
                  Most Popular
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Pro Creator</h3>
                  <p className="text-xs text-text-muted mt-1">For professionals, founders & creators</p>
                  <div className="my-5">
                    <span className="text-3xl font-extrabold text-white">$14</span>
                    <span className="text-xs text-text-muted"> / month</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" /> 50 Dynamic QR codes
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" /> AI QR Art Studio access
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" /> Link-in-Bio builder
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" /> Vector SVG & Print PDF export
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" /> Real-time scan analytics
                    </li>
                  </ul>
                </div>
                <Link
                  href="/pricing"
                  className="mt-6 w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold text-center shadow-glow transition-all"
                >
                  Start 14-Day Pro Trial
                </Link>
              </div>

              {/* Business */}
              <div className="p-6 rounded-2xl bg-[#171724]/60 border border-[#272738] flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Business</h3>
                  <p className="text-xs text-text-muted mt-1">For agencies and growing brands</p>
                  <div className="my-5">
                    <span className="text-3xl font-extrabold text-white">$39</span>
                    <span className="text-xs text-text-muted"> / month</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" /> Unlimited dynamic QR codes
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" /> Bulk QR batch creation & ZIP export
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" /> Custom domain redirects
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" /> Team collaboration & folders
                    </li>
                  </ul>
                </div>
                <Link
                  href="/pricing"
                  className="mt-6 w-full py-2.5 rounded-xl bg-[#272738] hover:bg-[#323248] text-white text-xs font-semibold text-center transition-all"
                >
                  View Business Details
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQS */}
        <section className="py-20 bg-[#0B0B14] border-t border-[#272738]/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Questions & Answers
              </span>
              <h2 className="text-3xl font-bold text-white tracking-tight mt-2 mb-3">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((f, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-[#171724] border border-[#272738] space-y-2"
                >
                  <h3 className="text-sm font-bold text-white flex items-center justify-between">
                    <span>{f.q}</span>
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed pt-1">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="py-20 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="p-10 lg:p-14 rounded-3xl bg-gradient-to-tr from-primary/20 via-[#171724] to-accent-cyan/20 border border-[#272738] shadow-2xl space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Ready to Upgrade Your QR Strategy?
              </h2>
              <p className="text-sm text-text-secondary max-w-xl mx-auto">
                Join thousands of creators, brands, and businesses who connect their physical worlds to digital experiences with CruseQR.
              </p>
              <div className="pt-2">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold shadow-glow transition-all active:scale-95"
                >
                  <span>Get Started For Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

