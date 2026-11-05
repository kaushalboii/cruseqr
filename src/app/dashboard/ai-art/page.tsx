"use client";

import { useState, useEffect } from "react";
import { AI_STYLE_PRESETS, AiArtStylePreset } from "@/lib/ai-qr";
import { exportPng, exportSvg } from "@/lib/export-utils";
import {
  Sparkles,
  Download,
  ShieldCheck,
  Check,
  RefreshCw,
  Palette,
  Sliders,
  History,
  Copy,
  ExternalLink,
  Zap,
} from "lucide-react";

export default function AiArtStudioPage() {
  const [destinationUrl, setDestinationUrl] = useState("https://cruseqr.com");
  const [prompt, setPrompt] = useState("Cyberpunk neon street at twilight with glowing violet reflections");
  const [selectedPreset, setSelectedPreset] = useState<AiArtStylePreset>(AI_STYLE_PRESETS[0]);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    svg: string;
    imageUrl: string;
    scannability: any;
  } | null>(null);

  const [history, setHistory] = useState<any[]>([]);

  // Fetch AI generations history
  const loadHistory = async () => {
    try {
      const res = await fetch("/api/ai-qr");
      if (res.ok) {
        const data = await res.json();
        setHistory(data.generations || []);
      }
    } catch {}
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleGenerate = async () => {
    if (!destinationUrl || !prompt) {
      alert("Please provide both destination URL and creative prompt");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/ai-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destinationUrl,
          prompt,
          stylePresetId: selectedPreset.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setResult({
        svg: data.svg,
        imageUrl: data.imageUrl,
        scannability: data.scannability,
      });

      loadHistory();
    } catch (err: any) {
      alert(err.message || "Failed to generate AI QR art");
    } finally {
      setGenerating(false);
    }
  };

  const promptSuggestions = [
    "Cyberpunk neon street at twilight with glowing violet reflections",
    "Ghibli anime magical floating islands with blooming sakura trees and blue skies",
    "Deep bioluminescent enchanted forest with glowing green moss and mushrooms",
    "Italian black marble with 24k polished gold veins and luxury lighting",
    "Holographic titanium spaceship cockpit with ultraviolet indicators",
    "Retro 80s synthwave horizon with pink neon wireframe grid and sun",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-primary mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Optical Generative Synthesis</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">AI QR Art Studio</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Generate visually breathtaking artistic QR codes that preserve camera scan readability
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs (6 cols) */}
        <div className="lg:col-span-6 bg-[#171724] border border-[#272738] rounded-3xl p-6 space-y-6">
          {/* Destination URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Destination Website URL</label>
            <input
              type="url"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              placeholder="https://yourbrand.com/campaign"
              className="w-full px-3.5 py-2.5 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-primary"
            />
          </div>

          {/* Style Presets */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300">Artistic Style Preset</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AI_STYLE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPreset(p);
                    setPrompt(p.description);
                  }}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all ${
                    selectedPreset.id === p.id
                      ? "bg-primary text-white border-primary shadow-glow"
                      : "bg-[#11111B] border-[#272738] text-text-secondary hover:text-white"
                  }`}
                >
                  <div className="font-semibold truncate">{p.name}</div>
                  <div className="text-[10px] opacity-75 truncate">{p.recommendedColors.dots}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Creative Prompt Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-300">Creative Generation Prompt</label>
              <span className="text-[10px] text-text-muted">Describe atmosphere & aesthetic</span>
            </div>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe scene, colors, lighting, textures..."
              className="w-full px-3.5 py-2.5 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Prompt Suggestions Pills */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-text-muted">Prompt Ideas:</span>
            <div className="flex flex-wrap gap-1.5">
              {promptSuggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(s)}
                  className="px-2.5 py-1 rounded-lg bg-[#11111B] border border-[#272738] hover:border-primary/50 text-[10px] text-zinc-300 hover:text-white truncate max-w-xs transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all active:scale-95 disabled:opacity-50"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Synthesizing Artistic QR Matrix...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate AI QR Art</span>
              </>
            )}
          </button>
        </div>

        {/* Right Preview & Scannability Test (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-[#171724] border border-[#272738] rounded-3xl p-6 flex flex-col items-center justify-center relative min-h-[440px]">
            {result ? (
              <div className="w-full space-y-5">
                {/* Scannability Test Badge */}
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-white">
                        {result.scannability.score}% Camera Scannability ({result.scannability.rating})
                      </div>
                      <div className="text-[10px] text-text-muted">
                        Contrast Ratio: {result.scannability.contrastRatio}:1 (Passes threshold)
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    VERIFIED
                  </span>
                </div>

                {/* The QR artwork visual preview */}
                <div className="relative group mx-auto w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden border border-[#272738] shadow-2xl flex items-center justify-center bg-white p-4">
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: result.svg }}
                  />
                </div>

                {/* Downloads */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => exportPng(result.svg, "ai-qr-art.png", 2048)}
                    className="py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PNG (2K)</span>
                  </button>
                  <button
                    onClick={() => exportSvg(result.svg, "ai-qr-art.svg")}
                    className="py-2.5 rounded-xl bg-[#11111B] hover:bg-[#1E1E30] border border-[#272738] text-white text-xs font-semibold flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 text-accent-cyan" />
                    <span>Download SVG</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-primary">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-white">AI Art Generator Standby</h3>
                <p className="text-xs text-text-secondary max-w-xs mx-auto">
                  Pick a style preset and click &ldquo;Generate AI QR Art&rdquo; to synthesize your custom high-contrast artwork.
                </p>
              </div>
            )}
          </div>

          {/* History Gallery */}
          {history.length > 0 && (
            <div className="bg-[#171724] border border-[#272738] rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-primary" />
                  <span>Recent AI Generations</span>
                </span>
                <span className="text-[10px] text-text-muted">{history.length} saved</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {history.slice(0, 6).map((h) => (
                  <div
                    key={h.id}
                    className="p-2 rounded-xl bg-[#11111B] border border-[#272738] space-y-1.5 text-left"
                  >
                    <div className="text-[11px] font-bold text-white truncate">{h.stylePreset}</div>
                    <div className="text-[10px] text-text-muted truncate">{h.prompt}</div>
                    <div className="text-[9px] text-emerald-400 font-semibold">
                      {h.scannabilityScore}% Scannable
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

