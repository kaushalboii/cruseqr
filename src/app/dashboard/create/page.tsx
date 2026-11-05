"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  generateQrSvg,
  encodeQrPayload,
  QrType,
  QrDesignConfig,
  DotStyle,
  CornerSquareStyle,
  CornerDotStyle,
  FrameStyle,
  DEFAULT_DESIGN_CONFIG,
} from "@/lib/qr-engine";
import { evaluateScannability } from "@/lib/ai-qr";
import { exportPng, exportSvg, exportPdf } from "@/lib/export-utils";
import {
  Globe,
  FileText,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Wifi,
  Contact2,
  MapPin,
  Calendar,
  FileDown,
  Share2,
  Download,
  CreditCard,
  Layers,
  Sparkles,
  Palette,
  Sliders,
  Image as ImageIcon,
  ShieldCheck,
  Check,
  Lock,
  Clock,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  FolderPlus,
  Copy,
} from "lucide-react";

function CreateQrStudio() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // QR Type & Metadata
  const [qrType, setQrType] = useState<QrType>("URL");
  const [title, setTitle] = useState("My New Campaign QR");
  const [description, setDescription] = useState("");
  const [isDynamic, setIsDynamic] = useState(true);
  const [password, setPassword] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [projectId, setProjectId] = useState("");
  const [folderId, setFolderId] = useState("");
  const [tags, setTags] = useState("");

  // Projects & Folders options
  const [projects, setProjects] = useState<any[]>([]);

  // Content state by type
  const [contentData, setContentData] = useState<Record<string, any>>({
    url: "https://cruseqr.com",
    text: "Welcome to CruseQR",
    email: "contact@company.com",
    subject: "Inquiry",
    body: "Hello CruseQR team",
    phone: "+15550192834",
    message: "Hi, I scanned your QR code!",
    ssid: "Office_Guest_WiFi",
    wifiPassword: "Password123!",
    encryption: "WPA",
    firstName: "Alex",
    lastName: "Morgan",
    company: "CruseQR",
    jobTitle: "Founder",
    website: "https://cruseqr.com",
    address: "San Francisco, CA",
    latitude: "37.7749",
    longitude: "-122.4194",
    eventTitle: "Annual Keynote 2026",
    startDate: "2026-11-20T10:00",
    endDate: "2026-11-20T12:00",
    pdfUrl: "https://example.com/menu.pdf",
    socialUrl: "https://instagram.com",
    appUrl: "https://apps.apple.com",
    paymentType: "UPI",
    upiId: "cruse@bank",
    amount: "15.00",
    bioUrl: "https://cruseqr.com/bio/alexmorgan",
  });

  // Design Configuration
  const [design, setDesign] = useState<QrDesignConfig>({
    ...DEFAULT_DESIGN_CONFIG,
    dotsColor: "#8B5CF6",
    backgroundColor: "#FFFFFF",
    dotsType: "rounded",
    cornersSquareType: "extra-rounded",
    cornersDotType: "dot",
    frame: "bottom-banner",
    frameText: "SCAN WITH PHONE",
    frameColor: "#8B5CF6",
    frameTextColor: "#FFFFFF",
  });

  const [activeTab, setActiveTab] = useState<"colors" | "shapes" | "logo" | "frames" | "campaign">("colors");
  const [saving, setSaving] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Load projects
  useEffect(() => {
    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : { projects: [] }))
      .then((data) => setProjects(data.projects || []))
      .catch(() => { });
  }, []);

  // Check if template was passed via query params
  useEffect(() => {
    const templateParam = searchParams.get("template");
    if (templateParam) {
      try {
        const decoded = JSON.parse(decodeURIComponent(templateParam));
        if (decoded.qrType) setQrType(decoded.qrType);
        if (decoded.designConfig) {
          const cfg = typeof decoded.designConfig === "string" ? JSON.parse(decoded.designConfig) : decoded.designConfig;
          setDesign((prev) => ({ ...prev, ...cfg }));
        }
        if (decoded.title) setTitle(`${decoded.title} (From Template)`);
      } catch { }
    }
  }, [searchParams]);

  // Compute final payload string
  const encodedPayload = useMemo(() => {
    return encodeQrPayload(qrType, contentData);
  }, [qrType, contentData]);

  // Compute preview SVG string
  const svgOutput = useMemo(() => {
    return generateQrSvg(encodedPayload, design);
  }, [encodedPayload, design]);

  // Scannability rating
  const scannability = useMemo(() => {
    return evaluateScannability(design, false);
  }, [design]);

  const updateContent = (key: string, val: any) => {
    setContentData((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a campaign title");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/qrcodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          qrType,
          isDynamic,
          contentData,
          designConfig: design,
          projectId: projectId || undefined,
          folderId: folderId || undefined,
          expiresAt: expiresAt || undefined,
          password: password || undefined,
          tags,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      router.push("/dashboard/qr-codes");
    } catch (err: any) {
      alert(err.message || "Failed to save QR code");
    } finally {
      setSaving(false);
    }
  };

  const qrTypesList: { type: QrType; label: string; icon: any }[] = [
    { type: "URL", label: "Website URL", icon: <Globe className="w-4 h-4" /> },
    { type: "TEXT", label: "Plain Text", icon: <FileText className="w-4 h-4" /> },
    { type: "EMAIL", label: "Send Email", icon: <Mail className="w-4 h-4" /> },
    { type: "PHONE", label: "Phone Call", icon: <Phone className="w-4 h-4" /> },
    { type: "SMS", label: "SMS Message", icon: <MessageSquare className="w-4 h-4" /> },
    { type: "WHATSAPP", label: "WhatsApp", icon: <Send className="w-4 h-4" /> },
    { type: "WIFI", label: "Wi-Fi Connect", icon: <Wifi className="w-4 h-4" /> },
    { type: "VCARD", label: "vCard Contact", icon: <Contact2 className="w-4 h-4" /> },
    { type: "LOCATION", label: "Map Location", icon: <MapPin className="w-4 h-4" /> },
    { type: "EVENT", label: "Calendar Event", icon: <Calendar className="w-4 h-4" /> },
    { type: "PDF", label: "PDF Document", icon: <FileDown className="w-4 h-4" /> },
    { type: "SOCIAL", label: "Social Link", icon: <Share2 className="w-4 h-4" /> },
    { type: "APP", label: "App Download", icon: <Download className="w-4 h-4" /> },
    { type: "PAYMENT", label: "Payment / UPI", icon: <CreditCard className="w-4 h-4" /> },
    { type: "BIO", label: "Link in Bio", icon: <Layers className="w-4 h-4" /> },
  ];

  const presetColors = [
    "#8B5CF6",
    "#06B6D4",
    "#10B981",
    "#F59E0B",
    "#EC4899",
    "#2563EB",
    "#0F172A",
    "#64748B",
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">QR Code Creation Studio</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Configure type, content, high-contrast vector design, and campaign settings
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-2 shadow-glow transition-all active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save QR Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: QR Type & Content Form (4 cols) */}
        <div className="lg:col-span-4 bg-[#171724] border border-[#272738] rounded-3xl p-5 sm:p-6 space-y-6">
          <div>
            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
              Step 1: Select QR Purpose
            </div>
            {/* Scrollable Type Selector Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
              {qrTypesList.map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setQrType(item.type)}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 text-left transition-all ${qrType === item.type
                      ? "bg-primary text-white border-primary shadow-glow"
                      : "bg-[#11111B] border-[#272738] text-text-secondary hover:text-white hover:bg-[#1E1E30]"
                    }`}
                >
                  <span className={qrType === item.type ? "text-white" : "text-primary"}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Redirection Mode Banner */}
          <div className="p-3.5 rounded-2xl bg-[#11111B] border border-[#272738] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Dynamic Redirect</span>
              </span>
              <button
                type="button"
                onClick={() => setIsDynamic(!isDynamic)}
                className={`w-11 h-6 rounded-full transition-colors relative ${isDynamic ? "bg-primary" : "bg-zinc-700"
                  }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${isDynamic ? "left-6" : "left-1"
                    }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              {isDynamic
                ? "Destination URL can be updated anytime after printing. Scan analytics are recorded."
                : "Content is permanently baked into pixels. Cannot be modified or tracked."}
            </p>
          </div>

          {/* Dynamic Content Form */}
          <div className="space-y-4 border-t border-[#272738] pt-4">
            <div className="text-xs font-semibold text-white uppercase tracking-wider">
              Content Details
            </div>

            {qrType === "URL" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Destination Website URL</label>
                <input
                  type="url"
                  value={contentData.url || ""}
                  onChange={(e) => updateContent("url", e.target.value)}
                  placeholder="https://yourbrand.com/landing"
                  className="w-full px-3.5 py-2.5 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {qrType === "TEXT" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Plain Text Content</label>
                <textarea
                  rows={4}
                  value={contentData.text || ""}
                  onChange={(e) => updateContent("text", e.target.value)}
                  placeholder="Enter text, instructions, or notes..."
                  className="w-full px-3.5 py-2.5 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>
            )}

            {qrType === "WIFI" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Network Name (SSID)</label>
                  <input
                    type="text"
                    value={contentData.ssid || ""}
                    onChange={(e) => updateContent("ssid", e.target.value)}
                    placeholder="Cafe_HighSpeed_WiFi"
                    className="w-full px-3.5 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Wi-Fi Password</label>
                  <input
                    type="text"
                    value={contentData.wifiPassword || ""}
                    onChange={(e) => updateContent("wifiPassword", e.target.value)}
                    placeholder="SecretWiFiKey2026"
                    className="w-full px-3.5 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}

            {qrType === "VCARD" && (
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-zinc-300">First Name</label>
                    <input
                      type="text"
                      value={contentData.firstName || ""}
                      onChange={(e) => updateContent("firstName", e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#11111B] border border-[#272738] rounded-lg text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-300">Last Name</label>
                    <input
                      type="text"
                      value={contentData.lastName || ""}
                      onChange={(e) => updateContent("lastName", e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-[#11111B] border border-[#272738] rounded-lg text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-zinc-300">Phone</label>
                  <input
                    type="text"
                    value={contentData.phone || ""}
                    onChange={(e) => updateContent("phone", e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#11111B] border border-[#272738] rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-300">Email</label>
                  <input
                    type="email"
                    value={contentData.email || ""}
                    onChange={(e) => updateContent("email", e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#11111B] border border-[#272738] rounded-lg text-xs text-white"
                  />
                </div>
              </div>
            )}

            {qrType === "WHATSAPP" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-300">Phone Number (with Country Code)</label>
                  <input
                    type="text"
                    value={contentData.phone || ""}
                    onChange={(e) => updateContent("phone", e.target.value)}
                    placeholder="+14155552671"
                    className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-300">Pre-filled Chat Message</label>
                  <input
                    type="text"
                    value={contentData.message || ""}
                    onChange={(e) => updateContent("message", e.target.value)}
                    placeholder="Hi! I want to inquire about..."
                    className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            )}

            {qrType === "EMAIL" && (
              <div className="space-y-2">
                <input
                  type="email"
                  value={contentData.email || ""}
                  onChange={(e) => updateContent("email", e.target.value)}
                  placeholder="support@domain.com"
                  className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
                />
                <input
                  type="text"
                  value={contentData.subject || ""}
                  onChange={(e) => updateContent("subject", e.target.value)}
                  placeholder="Subject line"
                  className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
                />
              </div>
            )}

            {qrType === "BIO" && (
              <div className="space-y-2">
                <label className="text-xs text-zinc-300">Link-in-Bio Target Page</label>
                <input
                  type="url"
                  value={contentData.bioUrl || ""}
                  onChange={(e) => updateContent("bioUrl", e.target.value)}
                  placeholder="https://cruseqr.com/bio/username"
                  className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
                />
              </div>
            )}

            {qrType === "PAYMENT" && (
              <div className="space-y-2.5">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-300">UPI ID / Payee Handle</label>
                  <input
                    type="text"
                    value={contentData.upiId || ""}
                    onChange={(e) => updateContent("upiId", e.target.value)}
                    placeholder="merchant@okhdfcbank"
                    className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-300">Default Amount ($)</label>
                  <input
                    type="number"
                    value={contentData.amount || ""}
                    onChange={(e) => updateContent("amount", e.target.value)}
                    placeholder="25.00"
                    className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER PANEL: Large Live QR Preview & Scannability (4 cols) */}
        <div className="lg:col-span-4 bg-[#171724] border border-[#272738] rounded-3xl p-6 flex flex-col items-center justify-between relative shadow-2xl min-h-[580px]">
          {/* Top Bar: Camera Scannability Badge */}
          <div className="w-full flex items-center justify-between pb-3 border-b border-[#272738]">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${scannability.isScannable ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
                  }`}
              />
              <span className="text-xs font-bold text-white">
                {scannability.score}% Scannable ({scannability.rating})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoom(Math.max(0.8, zoom - 0.1))}
                className="p-1 rounded bg-[#11111B] text-zinc-400 hover:text-white"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoom(Math.min(1.4, zoom + 0.1))}
                className="p-1 rounded bg-[#11111B] text-zinc-400 hover:text-white"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Canvas Preview */}
          <div className="my-auto py-6 flex items-center justify-center w-full overflow-hidden">
            <div
              style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
              className="p-4 bg-white rounded-2xl shadow-2xl transition-all duration-200"
            >
              <div
                className="w-64 h-64 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: svgOutput }}
              />
            </div>
          </div>

          {/* Bottom Export Strip */}
          <div className="w-full space-y-3 pt-4 border-t border-[#272738]">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => exportPng(svgOutput, `${title || "cruseqr"}.png`, 1024)}
                className="py-2 rounded-xl bg-[#11111B] hover:bg-[#1C1C2C] border border-[#272738] text-[11px] font-semibold text-white transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-3 h-3 text-primary" />
                <span>PNG (1024)</span>
              </button>

              <button
                type="button"
                onClick={() => exportSvg(svgOutput, `${title || "cruseqr"}.svg`)}
                className="py-2 rounded-xl bg-[#11111B] hover:bg-[#1C1C2C] border border-[#272738] text-[11px] font-semibold text-white transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-3 h-3 text-accent-cyan" />
                <span>Vector SVG</span>
              </button>

              <button
                type="button"
                onClick={() => exportPdf(svgOutput, title, encodedPayload)}
                className="py-2 rounded-xl bg-[#11111B] hover:bg-[#1C1C2C] border border-[#272738] text-[11px] font-semibold text-white transition-all flex items-center justify-center gap-1.5"
              >
                <Download className="w-3 h-3 text-emerald-400" />
                <span>PDF Print</span>
              </button>
            </div>

            <div className="text-[10px] text-center text-text-muted">
              Live scannable on iOS Camera & Android Google Lens
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Design Customization (4 cols) */}
        <div className="lg:col-span-4 bg-[#171724] border border-[#272738] rounded-3xl p-5 sm:p-6 space-y-6">
          <div className="text-xs font-semibold text-primary uppercase tracking-wider">
            Step 2: Customization & Branding
          </div>

          {/* Subtabs */}
          <div className="flex items-center gap-1 p-1 bg-[#11111B] border border-[#272738] rounded-2xl">
            {(
              [
                { id: "colors", label: "Colors", icon: <Palette className="w-3 h-3" /> },
                { id: "shapes", label: "Shapes", icon: <Sliders className="w-3 h-3" /> },
                { id: "logo", label: "Logo", icon: <ImageIcon className="w-3 h-3" /> },
                { id: "frames", label: "Frames", icon: <Layers className="w-3 h-3" /> },
                { id: "campaign", label: "Settings", icon: <Lock className="w-3 h-3" /> },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${activeTab === t.id
                    ? "bg-primary text-white shadow-glow"
                    : "text-text-secondary hover:text-white"
                  }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Colors */}
          {activeTab === "colors" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">Dots Foreground Color</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {presetColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setDesign({ ...design, dotsColor: c, frameColor: c })}
                      className={`w-6 h-6 rounded-full transition-transform ${design.dotsColor === c ? "ring-2 ring-white scale-125" : ""
                        }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input
                    type="color"
                    value={design.dotsColor || "#8B5CF6"}
                    onChange={(e) =>
                      setDesign({ ...design, dotsColor: e.target.value, frameColor: e.target.value })
                    }
                    className="w-6 h-6 rounded-full bg-transparent cursor-pointer"
                  />
                </div>
              </div>

              {/* Gradient Toggle */}
              <div className="p-3 rounded-xl bg-[#11111B] border border-[#272738] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white">Gradient Color Blend</span>
                  <input
                    type="checkbox"
                    checked={design.isGradient || false}
                    onChange={(e) => setDesign({ ...design, isGradient: e.target.checked })}
                    className="accent-primary"
                  />
                </div>
                {design.isGradient && (
                  <div className="space-y-2 pt-1">
                    <label className="text-[11px] text-text-secondary">Stop 2 Color</label>
                    <input
                      type="color"
                      value={design.gradientColor2 || "#06B6D4"}
                      onChange={(e) => setDesign({ ...design, gradientColor2: e.target.value })}
                      className="w-full h-8 rounded-lg cursor-pointer bg-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Background Color */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={design.backgroundColor || "#FFFFFF"}
                    onChange={(e) => setDesign({ ...design, backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-zinc-400">{design.backgroundColor}</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Shapes & Patterns */}
          {activeTab === "shapes" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">Data Module Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["rounded", "dots", "classy", "square", "extra-rounded", "classy-rounded"] as DotStyle[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setDesign({ ...design, dotsType: st })}
                        className={`p-2 rounded-xl border text-[11px] capitalize font-medium transition-all ${design.dotsType === st
                            ? "bg-primary text-white border-primary shadow-glow"
                            : "bg-[#11111B] border-[#272738] text-text-secondary hover:text-white"
                          }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">Corner Square Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["extra-rounded", "dot", "square"] as CornerSquareStyle[]).map((cs) => (
                    <button
                      key={cs}
                      type="button"
                      onClick={() => setDesign({ ...design, cornersSquareType: cs })}
                      className={`p-2 rounded-xl border text-[11px] capitalize font-medium transition-all ${design.cornersSquareType === cs
                          ? "bg-primary text-white border-primary shadow-glow"
                          : "bg-[#11111B] border-[#272738] text-text-secondary hover:text-white"
                        }`}
                    >
                      {cs}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">Corner Dot Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["dot", "square"] as CornerDotStyle[]).map((cd) => (
                    <button
                      key={cd}
                      type="button"
                      onClick={() => setDesign({ ...design, cornersDotType: cd })}
                      className={`p-2 rounded-xl border text-[11px] capitalize font-medium transition-all ${design.cornersDotType === cd
                          ? "bg-primary text-white border-primary shadow-glow"
                          : "bg-[#11111B] border-[#272738] text-text-secondary hover:text-white"
                        }`}
                    >
                      {cd}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Logo */}
          {activeTab === "logo" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">Custom Logo URL</label>
                <input
                  type="url"
                  value={design.logoUrl || ""}
                  onChange={(e) =>
                    setDesign({
                      ...design,
                      logoUrl: e.target.value,
                      errorCorrectionLevel: "H",
                    })
                  }
                  placeholder="https://yourbrand.com/logo.png"
                  className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                />
                <p className="text-[10px] text-text-muted">
                  Error correction is automatically upgraded to Level H (30%) to maintain scan fidelity.
                </p>
              </div>

              {/* Logo Quick Presets */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">Preset Icons</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setDesign({
                        ...design,
                        logoUrl: "https://api.iconify.design/lucide:sparkles.svg",
                        errorCorrectionLevel: "H",
                      })
                    }
                    className="p-2 rounded-xl bg-[#11111B] border border-[#272738] text-primary hover:border-primary text-xs"
                  >
                    Sparkles
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDesign({
                        ...design,
                        logoUrl: "https://api.iconify.design/lucide:globe.svg",
                        errorCorrectionLevel: "H",
                      })
                    }
                    className="p-2 rounded-xl bg-[#11111B] border border-[#272738] text-accent-cyan hover:border-primary text-xs"
                  >
                    Globe
                  </button>
                  <button
                    type="button"
                    onClick={() => setDesign({ ...design, logoUrl: "" })}
                    className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs"
                  >
                    Remove Logo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Frames & CTA */}
          {activeTab === "frames" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300">Frame Layout</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["none", "bottom-banner", "top-banner", "badge", "phone", "stamp"] as FrameStyle[]).map(
                    (fr) => (
                      <button
                        key={fr}
                        type="button"
                        onClick={() => setDesign({ ...design, frame: fr })}
                        className={`p-2 rounded-xl border text-[11px] capitalize font-medium transition-all ${design.frame === fr
                            ? "bg-primary text-white border-primary shadow-glow"
                            : "bg-[#11111B] border-[#272738] text-text-secondary hover:text-white"
                          }`}
                      >
                        {fr.replace("-", " ")}
                      </button>
                    )
                  )}
                </div>
              </div>

              {design.frame !== "none" && (
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Frame Call to Action</label>
                    <input
                      type="text"
                      value={design.frameText || ""}
                      onChange={(e) => setDesign({ ...design, frameText: e.target.value })}
                      placeholder="SCAN ME"
                      className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Frame Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={design.frameColor || design.dotsColor || "#8B5CF6"}
                        onChange={(e) => setDesign({ ...design, frameColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent"
                      />
                      <span className="text-xs font-mono text-zinc-400">
                        {design.frameColor || design.dotsColor}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 5: Campaign Settings */}
          {activeTab === "campaign" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Launch Flyer"
                  className="w-full px-3.5 py-2.5 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Assign to Project</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="">No Project (General)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Passcode Protection (Optional)</label>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave empty for public access"
                  className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Campaign Expiration (Optional)</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CreateQrPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-400">Loading Studio...</div>}>
      <CreateQrStudio />
    </Suspense>
  );
}