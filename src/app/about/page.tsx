import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Shield, Sparkles, Zap, Globe, Heart, Award } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#09090F] text-white flex flex-col selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Our Mission
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              Connecting the Physical & Digital Worlds
            </h1>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
              CruseQR was engineered with a clear belief: QR codes are not just boring utility barcodes—they are the interactive front door to real-world engagement.
            </p>
          </div>

          {/* Story Card */}
          <div className="p-8 sm:p-10 rounded-3xl bg-[#171724] border border-[#272738] space-y-6 leading-relaxed text-sm text-zinc-300">
            <h2 className="text-xl font-bold text-white">The CruseQR Philosophy</h2>
            <p>
              Traditional QR generators produce generic black-and-white grids with rigid, uneditable URLs, zero scan insights, and clumsy interfaces. If a restaurant prints a menu QR on 500 table cards and their website domain updates, those cards are ruined.
            </p>
            <p>
              CruseQR was architected to solve this permanently. Every dynamic code connects through our global edge redirection infrastructure, allowing creators to update destinations instantly, pause traffic, test AI-synthesized designs, and observe scan analytics in real time.
            </p>
          </div>

          {/* Core Values */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#171724]/60 border border-[#272738] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Artistic Excellence</h3>
              <p className="text-xs text-text-secondary">
                We empower brands to express their visual identity without compromising camera recognition.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#171724]/60 border border-[#272738] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Sub-50ms Redirection</h3>
              <p className="text-xs text-text-secondary">
                Our dynamic redirect engine routes visitors globally with zero perceived latency.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#171724]/60 border border-[#272738] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Privacy First</h3>
              <p className="text-xs text-text-secondary">
                We anonymize IP addresses and collect zero unnecessary personally identifiable visitor data.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

