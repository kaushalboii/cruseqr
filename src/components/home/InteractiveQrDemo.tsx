"use client";

import { useState, useMemo } from "react";
import { generateQrSvg, DotStyle, FrameStyle, CornerSquareStyle } from "@/lib/qr-engine";
import { exportPng, exportSvg } from "@/lib/export-utils";
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Palette,
  Maximize2,
  Sliders,
  Zap,
  CheckCircle2,
} from "lucide-react";

export function InteractiveQrDemo() {
  const [url, setUrl] = useState("https://cruseqr.com");
  const [dotColor, setDotColor] = useState("#8B5CF6");
  const [dotStyle, setDotStyle] = useState<DotStyle>("rounded");
  const [cornerSquareStyle, setCornerSquareStyle] = useState<CornerSquareStyle>("extra-rounded");
  const [frame, setFrame] = useState<FrameStyle>("bottom-banner");
  const [frameText, setFrameText] = useState("SCAN WITH PHONE");
  const [copied, setCopied] = useState(false);

  const colors = ["#8B5CF6", "#06B6D4", "#10B981", "#F59E0B", "#EC4899", "#2563EB", "#0F172A"];

  const svgOutput = useMemo(() => {
    return generateQrSvg(url, {
      dotsColor: dotColor,
      backgroundColor: "#FFFFFF",
      dotsType: dotStyle,
      cornersSquareType: cornerSquareStyle,
      cornersSquareColor: dotColor,
      cornersDotColor: dotColor,
      frame,
      frameText,
      frameColor: dotColor,
      frameTextColor: "#FFFFFF",
      margin: 2,
    });
  }, [url, dotColor, dotStyle, cornerSquareStyle, frame, frameText]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#171724]/70 border border-[#272738] rounded-3xl p-6 lg:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[100px] pointer-events-none opacity-40"
        style={{ backgroundColor: dotColor }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Controls (6 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Instant Interactive Sandbox</span>
            </span>
            <span className="text-xs text-text-muted">Zero registration needed</span>
          </div>

          <div>
            <h3 className="text-xl lg:text-2xl font-bold text-white tracking-tight mb-2">
              Generate & customize your QR code live
            </h3>
            <p className="text-xs text-text-secondary">
              Type any destination URL, customize pattern aesthetics and CTA frames, and test camera scan reliability in real time.
            </p>
          </div>

          {/* URL Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Target Website or Link</label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-3 bg-[#11111B] border border-[#272738] rounded-xl text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
              />
              <button
                onClick={handleCopy}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-[#171724] border border-[#272738] text-zinc-400 hover:text-white"
                title="Copy Link"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Color Palettes */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-primary" />
              <span>Brand Color Accent</span>
            </label>
            <div className="flex items-center gap-2.5">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setDotColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    dotColor === c ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#171724]" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
              <input
                type="color"
                value={dotColor}
                onChange={(e) => setDotColor(e.target.value)}
                className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0 p-0"
                title="Custom Color"
              />
            </div>
          </div>

          {/* Dot Patterns */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-primary" />
              <span>Dot Style Pattern</span>
            </label>
            <div className="grid grid-cols-4 gap-2 text-xs">
              {(["rounded", "dots", "classy", "square"] as DotStyle[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setDotStyle(style)}
                  className={`py-2 px-3 rounded-xl border capitalize font-medium transition-all ${
                    dotStyle === style
                      ? "bg-primary/20 border-primary text-white shadow-glow"
                      : "bg-[#11111B] border-[#272738] text-text-secondary hover:text-white hover:bg-[#1E1E30]"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Frames */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300">Call-to-Action Frame</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {(["none", "bottom-banner", "badge"] as FrameStyle[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFrame(f)}
                  className={`py-2 px-3 rounded-xl border font-medium capitalize transition-all ${
                    frame === f
                      ? "bg-primary/20 border-primary text-white shadow-glow"
                      : "bg-[#11111B] border-[#272738] text-text-secondary hover:text-white hover:bg-[#1E1E30]"
                  }`}
                >
                  {f === "bottom-banner" ? "Bottom Bar" : f}
                </button>
              ))}
            </div>
          </div>

          {frame !== "none" && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Frame Call to Action</label>
              <input
                type="text"
                value={frameText}
                onChange={(e) => setFrameText(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>
          )}
        </div>

        {/* Right Preview Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-[#11111B]/80 border border-[#272738] rounded-2xl relative">
          <div className="flex items-center justify-between w-full mb-4">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Camera Scannable (100%)</span>
            </div>
            <span className="text-[10px] text-text-muted uppercase tracking-wider">High Density</span>
          </div>

          {/* SVG Preview Box */}
          <div className="w-64 h-64 sm:w-72 sm:h-72 p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 group hover:shadow-glow">
            <div
              className="w-full h-full flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: svgOutput }}
            />
          </div>

          {/* Fast Export Buttons */}
          <div className="w-full grid grid-cols-2 gap-3 mt-6">
            <button
              onClick={() => exportPng(svgOutput, "cruseqr-demo.png", 1024)}
              className="py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={() => exportSvg(svgOutput, "cruseqr-demo.svg")}
              className="py-2.5 px-4 rounded-xl bg-[#171724] hover:bg-[#202034] border border-[#272738] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-accent-cyan" />
              <span>Vector SVG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

