"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Mail, MessageSquare, MapPin, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#09090F] text-white flex flex-col selection:bg-primary selection:text-white">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Get in Touch
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
              We&apos;re Here to Help
            </h1>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              Have questions about CruseQR enterprise features, custom integrations, or partnerships? Reach out directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Contact Details (5 cols) */}
            <div className="md:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-[#171724] border border-[#272738] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">Direct Email</div>
                    <div className="text-sm font-semibold text-white">support@cruseqr.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">Headquarters</div>
                    <div className="text-sm font-semibold text-white">San Francisco, CA, USA</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-text-muted">Response Time</div>
                    <div className="text-sm font-semibold text-white">Under 2 hours for Pro users</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form (7 cols) */}
            <div className="md:col-span-7 bg-[#171724] border border-[#272738] rounded-3xl p-6 sm:p-8">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Message Dispatched!</h3>
                  <p className="text-xs text-text-secondary max-w-xs mx-auto">
                    Thank you for reaching out. Our support engineering team will review your note and get back to you promptly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", subject: "", message: "" });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#272738] hover:bg-[#34344A] text-xs font-semibold text-white transition-all"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-300">Your Name</label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Alex Morgan"
                        className="w-full px-3.5 py-2.5 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-300">Email Address</label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="alex@domain.com"
                        className="w-full px-3.5 py-2.5 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">Subject</label>
                    <input
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="Enterprise plan inquiry / API integration"
                      className="w-full px-3.5 py-2.5 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-300">Message</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Tell us about your campaign requirements or question..."
                      className="w-full px-3.5 py-2.5 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary resize-none"
                    />
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
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

