"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Menu, X, ArrowRight, Sparkles, Layers, QrCode, BarChart3, Shield } from "lucide-react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    // Check if user is logged in
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "/features" },
    { label: "AI Art Studio", href: "/#ai-art" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "FAQ", href: "/faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#09090F]/85 backdrop-blur-xl border-b border-[#272738]/80 py-3.5 shadow-lg"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Logo size="md" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#171724]/60 border border-[#272738]/80 px-4 py-1.5 rounded-full backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-glow"
                    : "text-text-secondary hover:text-white hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171724] border border-[#272738] text-xs font-semibold text-white hover:border-primary/50 transition-all shadow-sm"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Dashboard ({user.name.split(" ")[0]})</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-glow transition-all active:scale-95"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl bg-[#171724] border border-[#272738] text-zinc-300 hover:text-white"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0D0D17] border-b border-[#272738] px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-white hover:bg-[#171724]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-[#272738] flex flex-col gap-2.5">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="w-full py-2.5 rounded-xl bg-primary text-center text-xs font-semibold text-white"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-[#171724] border border-[#272738] text-center text-xs font-semibold text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-primary text-center text-xs font-semibold text-white shadow-glow"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

