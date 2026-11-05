"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Check, Eye } from "lucide-react";
import { AI_STYLE_PRESETS } from "@/lib/ai-qr";

export function AiArtShowcase() {
  const [activeStyle, setActiveStyle] = useState(AI_STYLE_PRESETS[0]);

  return (
    <div id="ai-art" className="relative py-16 scroll-mt-20">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-primary-light mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generative AI Art Studio</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
          Where Generative AI Meets Optical Precision
        </h2>
        <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
          Blend stunning generative art into fully scannable QR codes. Unlike naive image overlays, CruseQR protects finder anchors and calculates real contrast thresholds to ensure reliable camera recognition.
        </p>
      </div>

      {/* Style selector pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {AI_STYLE_PRESETS.slice(0, 6).map((preset) => (
          <button
            key={preset.id}
            onClick={() => setActiveStyle(preset)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeStyle.id === preset.id
                ? "bg-primary text-white shadow-glow"
                : "bg-[#171724] border border-[#272738] text-text-secondary hover:text-white hover:border-primary/40"
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Featured AI Card Showcase */}
      <div className="max-w-4xl mx-auto bg-[#171724] border border-[#272738] rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Visual Showcase (7 cols) */}
          <div className="md:col-span-7 relative group">
            <div className="aspect-square w-full rounded-2xl overflow-hidden border border-[#272738] relative bg-[#09090F] shadow-2xl">
              <img
                src={activeStyle.sampleImage}
                alt={activeStyle.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Verified Scannability Badge */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-emerald-400">97.8% Scannability</span>
              </div>

              {/* Prompt tag at bottom */}
              <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-[#09090F]/90 backdrop-blur-md border border-white/10">
                <div className="text-[10px] uppercase font-semibold text-primary tracking-wider mb-1">
                  AI Synthesizer Prompt
                </div>
                <p className="text-xs text-zinc-300 line-clamp-2 italic">
                  "{activeStyle.promptModifier}"
                </p>
              </div>
            </div>
          </div>

          {/* Details & CTA (5 cols) */}
          <div className="md:col-span-5 space-y-5">
            <div>
              <span className="text-xs text-primary font-semibold uppercase tracking-wider">
                Preset Spotlight
              </span>
              <h3 className="text-2xl font-bold text-white mt-1 mb-2">{activeStyle.name}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                {activeStyle.description}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Preserves 3 critical finder patterns</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>High 30% error correction tolerance (Level H)</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Real-time contrast ratio validation</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/dashboard/ai-art"
                className="w-full py-3 px-5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all active:scale-95"
              >
                <span>Open AI Art Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

