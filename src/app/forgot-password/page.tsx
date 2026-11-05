"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Mail, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#09090F] flex flex-col justify-center items-center p-4 relative selection:bg-primary selection:text-white">
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-6" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Reset Password</h1>
          <p className="text-xs text-text-secondary mt-1">
            Enter your account email to receive a recovery link
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-[#171724] border border-[#272738] shadow-2xl space-y-5">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Check Your Inbox</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                If an account exists for <strong>{email}</strong>, we have sent instructions to reset your password.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:text-primary-light"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to sign in</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Account Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
                  />
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="text-xs text-text-muted hover:text-white transition-colors"
                >
                  Remember password? Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

