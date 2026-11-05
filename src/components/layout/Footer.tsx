import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#09090F] border-t border-[#272738] pt-16 pb-12 text-sm text-text-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Logo size="md" showTagline />
            <p className="text-xs text-text-muted max-w-sm leading-relaxed">
              CruseQR is the unified platform for next-generation dynamic QR codes, AI-synthesized visual art, Link-in-Bio pages, and precision scan analytics.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>All Redirection Nodes Operational</span>
              </div>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/dashboard/create" className="hover:text-white transition-colors">
                  Dynamic QR Generator
                </Link>
              </li>
              <li>
                <Link href="/#ai-art" className="hover:text-white transition-colors">
                  AI QR Art Studio
                </Link>
              </li>
              <li>
                <Link href="/dashboard/bio" className="hover:text-white transition-colors">
                  Link in Bio Pages
                </Link>
              </li>
              <li>
                <Link href="/dashboard/business-cards" className="hover:text-white transition-colors">
                  Digital Business Cards
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Scan Analytics Engine
                </Link>
              </li>
              <li>
                <Link href="/dashboard/templates" className="hover:text-white transition-colors">
                  Template Library
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions Column */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Solutions
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Restaurants & Menus
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Retail & Packaging
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Events & Ticketing
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Real Estate Showcases
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Enterprise Solutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Company & Legal
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About CruseQR
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#272738] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <div>© {new Date().getFullYear()} CruseQR Technologies Inc. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>SOC2 & GDPR Compliant Architecture</span>
            </span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

