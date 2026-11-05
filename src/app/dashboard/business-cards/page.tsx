"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Contact2,
  Save,
  Download,
  Copy,
  Check,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  MapPin,
  Briefcase,
  Building,
  Sparkles,
} from "lucide-react";

export default function BusinessCardsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [card, setCard] = useState<any>({
    fullName: "Alex Morgan",
    jobTitle: "Founder & Product Architect",
    company: "CruseQR Innovations",
    email: "alex@cruseqr.com",
    phone: "+1 (555) 019-2834",
    website: "https://cruseqr.com",
    address: "San Francisco, CA",
    bio: "Building next-generation QR connectivity and design systems.",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300",
    bannerColor: "#8B5CF6",
    slug: "alex-morgan",
  });

  const loadCard = async () => {
    try {
      const res = await fetch("/api/cards");
      if (res.ok) {
        const data = await res.json();
        if (data.card) setCard(data.card);
      }
    } catch (err) {
      console.error("Load card error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCard();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/cards", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(card),
      });

      if (!res.ok) throw new Error("Failed to save card");

      alert("Business Card updated successfully!");
    } catch (err: any) {
      alert(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const copyLink = () => {
    const url = `${window.location.origin}/card/${card.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Prepare vCard 3.0 content
  const vcardText = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${card.fullName}`,
    card.company ? `ORG:${card.company}` : "",
    card.jobTitle ? `TITLE:${card.jobTitle}` : "",
    card.phone ? `TEL;TYPE=CELL:${card.phone}` : "",
    card.email ? `EMAIL:${card.email}` : "",
    card.website ? `URL:${card.website}` : "",
    card.address ? `ADR;TYPE=WORK:;;${card.address};;;;` : "",
    card.bio ? `NOTE:${card.bio}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");

  const vcfDataUri = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcardText)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Digital Business Card</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Create an executive vCard 3.0 profile that saves directly into Apple Contacts and Google Contacts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copyLink}
            className="px-3.5 py-2.5 rounded-xl bg-[#171724] hover:bg-[#202034] border border-[#272738] text-white text-xs font-semibold flex items-center gap-2 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Card URL</span>
          </button>

          <Link
            href={`/card/${card.slug}`}
            target="_blank"
            className="px-3.5 py-2.5 rounded-xl bg-[#171724] hover:bg-[#202034] border border-[#272738] text-white text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-accent-cyan" />
            <span>View Public Card</span>
          </Link>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-2 shadow-glow transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Card</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-[#171724] border border-[#272738] rounded-3xl p-6 space-y-4">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
            Card Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Full Name</label>
              <input
                type="text"
                value={card.fullName}
                onChange={(e) => setCard({ ...card, fullName: e.target.value })}
                className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Job Title</label>
              <input
                type="text"
                value={card.jobTitle || ""}
                onChange={(e) => setCard({ ...card, jobTitle: e.target.value })}
                className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Company Name</label>
              <input
                type="text"
                value={card.company || ""}
                onChange={(e) => setCard({ ...card, company: e.target.value })}
                className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Direct Phone</label>
              <input
                type="text"
                value={card.phone || ""}
                onChange={(e) => setCard({ ...card, phone: e.target.value })}
                className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Email Address</label>
              <input
                type="email"
                value={card.email}
                onChange={(e) => setCard({ ...card, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Website</label>
              <input
                type="url"
                value={card.website || ""}
                onChange={(e) => setCard({ ...card, website: e.target.value })}
                className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Location / City</label>
            <input
              type="text"
              value={card.address || ""}
              onChange={(e) => setCard({ ...card, address: e.target.value })}
              placeholder="e.g. San Francisco, California"
              className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Avatar Image URL</label>
            <input
              type="url"
              value={card.avatarUrl || ""}
              onChange={(e) => setCard({ ...card, avatarUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Banner Accent Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={card.bannerColor || "#8B5CF6"}
                onChange={(e) => setCard({ ...card, bannerColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono text-zinc-400">{card.bannerColor}</span>
            </div>
          </div>
        </div>

        {/* Live Preview Card (5 cols) */}
        <div className="lg:col-span-5 sticky top-6 space-y-4">
          <div className="w-full max-w-sm mx-auto bg-[#171724] border border-[#272738] rounded-3xl overflow-hidden shadow-2xl">
            {/* Banner */}
            <div
              className="h-24 w-full relative"
              style={{
                background: `linear-gradient(135deg, ${card.bannerColor || "#8B5CF6"}, #09090F)`,
              }}
            />

            {/* Profile info */}
            <div className="px-6 pb-6 -mt-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full border-4 border-[#171724] overflow-hidden bg-[#11111B] shadow-md mb-2">
                {card.avatarUrl ? (
                  <img src={card.avatarUrl} alt={card.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-primary text-white">
                    {card.fullName.charAt(0)}
                  </div>
                )}
              </div>

              <h3 className="text-base font-bold text-white">{card.fullName}</h3>
              <p className="text-xs text-primary-light font-medium">{card.jobTitle}</p>
              <p className="text-[11px] text-text-secondary">{card.company}</p>

              <div className="w-full mt-4 space-y-2 text-xs text-left">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#11111B] text-text-secondary">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  <span className="truncate">{card.email}</span>
                </div>
                {card.phone && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#11111B] text-text-secondary">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{card.phone}</span>
                  </div>
                )}
              </div>

              {/* Direct vCard Download Test */}
              <a
                href={vcfDataUri}
                download={`${card.fullName.replace(/\s+/g, "_")}.vcf`}
                className="w-full mt-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Test Download .vcf Contact</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

