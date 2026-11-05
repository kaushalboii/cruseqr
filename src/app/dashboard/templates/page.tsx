"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutTemplate,
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
  ShoppingBag,
  Ticket,
  User,
  HeartPulse,
  Building,
  Share2,
} from "lucide-react";
import { generateQrSvg } from "@/lib/qr-engine";

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<any[]>([]);
  const [category, setCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const url = category === "ALL" ? "/api/templates" : `/api/templates?category=${category}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setTemplates(data.templates || []);
        }
      } catch (err) {
        console.error("Load templates error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, [category]);

  const categories = [
    { id: "ALL", label: "All Templates" },
    { id: "RESTAURANT", label: "Restaurants & Menus", icon: <UtensilsCrossed className="w-3.5 h-3.5" /> },
    { id: "EVENT", label: "Events & Tickets", icon: <Ticket className="w-3.5 h-3.5" /> },
    { id: "RETAIL", label: "Retail & Stores", icon: <ShoppingBag className="w-3.5 h-3.5" /> },
    { id: "BUSINESS", label: "Business & vCard", icon: <Building className="w-3.5 h-3.5" /> },
    { id: "PERSONAL", label: "Personal & Bio", icon: <User className="w-3.5 h-3.5" /> },
    { id: "HEALTHCARE", label: "Healthcare", icon: <HeartPulse className="w-3.5 h-3.5" /> },
  ];

  const handleApplyTemplate = (tmpl: any) => {
    const encoded = encodeURIComponent(
      JSON.stringify({
        title: tmpl.title,
        qrType: tmpl.qrType,
        designConfig: tmpl.designConfig,
      })
    );
    router.push(`/dashboard/create?template=${encoded}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-2">
          <LayoutTemplate className="w-3.5 h-3.5" />
          <span>Curated Design Presets</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Template Gallery</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Select a professionally styled template to prefill frame styles, custom palettes, and dot patterns
        </p>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
              category === c.id
                ? "bg-primary text-white shadow-glow"
                : "bg-[#171724] border border-[#272738] text-text-secondary hover:text-white"
            }`}
          >
            {c.icon}
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tmpl) => {
          let design = {};
          try {
            design = JSON.parse(tmpl.designConfig);
          } catch {}
          const svg = generateQrSvg("https://cruseqr.com", design);

          return (
            <div
              key={tmpl.id}
              className="p-6 rounded-3xl bg-[#171724] border border-[#272738] hover:border-primary/50 transition-all duration-300 flex flex-col justify-between group shadow-card"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary-light text-[10px] font-bold uppercase tracking-wider">
                    {tmpl.category}
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">{tmpl.qrType}</span>
                </div>

                {/* Live Preview of Template Design */}
                <div className="w-full aspect-square max-w-[200px] mx-auto p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                </div>

                <h3 className="text-base font-bold text-white mb-1.5">{tmpl.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{tmpl.description}</p>
              </div>

              <div className="pt-6 mt-auto">
                <button
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Use This Template</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

