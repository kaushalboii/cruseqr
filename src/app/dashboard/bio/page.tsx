"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Plus,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Sparkles,
  Smartphone,
  Save,
  Twitter,
  Linkedin,
  Instagram,
  Github,
  Youtube,
  Eye,
  CheckCircle2,
} from "lucide-react";

export default function BiolinkBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [theme, setTheme] = useState("cosmic");
  const [links, setLinks] = useState<any[]>([]);
  const [socials, setSocials] = useState({
    twitter: "",
    linkedin: "",
    instagram: "",
    github: "",
    youtube: "",
  });

  const loadBio = async () => {
    try {
      const res = await fetch("/api/bio");
      if (res.ok) {
        const data = await res.json();
        const p = data.bioPage;
        if (p) {
          setUsername(p.username);
          setTitle(p.title);
          setBio(p.bio || "");
          setAvatarUrl(p.avatarUrl || "");
          setTheme(p.theme || "cosmic");
          setLinks(p.links || []);
          if (p.socialLinks) {
            try {
              setSocials(JSON.parse(p.socialLinks));
            } catch {}
          }
        }
      }
    } catch (err) {
      console.error("Load bio error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBio();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/bio", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          title,
          bio,
          avatarUrl,
          theme,
          socialLinks: socials,
          links,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save bio page");
      }

      alert("Biolink page updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const addLink = () => {
    setLinks([
      ...links,
      {
        id: `temp_${Date.now()}`,
        title: "New Featured Link",
        url: "https://",
        icon: "Globe",
        isActive: true,
      },
    ]);
  };

  const updateLink = (idx: number, field: string, val: any) => {
    const updated = [...links];
    updated[idx][field] = val;
    setLinks(updated);
  };

  const removeLink = (idx: number) => {
    setLinks(links.filter((_, i) => i !== idx));
  };

  const copyPublicLink = () => {
    const url = `${window.location.origin}/bio/${username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const themes = [
    { id: "cosmic", name: "Cosmic Dark", color: "#8B5CF6" },
    { id: "obsidian", name: "Pure Obsidian", color: "#18181B" },
    { id: "emerald", name: "Bioluminescent Emerald", color: "#10B981" },
    { id: "sunset", name: "Cyber Sunset", color: "#EC4899" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Inspired by tree.icqr.com</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Link-in-Bio Studio</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Create an elegant mobile landing page housing all your social links and portfolio work
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={copyPublicLink}
            className="px-3.5 py-2.5 rounded-xl bg-[#171724] hover:bg-[#202034] border border-[#272738] text-white text-xs font-semibold flex items-center gap-2 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Bio URL</span>
          </button>

          <Link
            href={`/bio/${username}`}
            target="_blank"
            className="px-3.5 py-2.5 rounded-xl bg-[#171724] hover:bg-[#202034] border border-[#272738] text-white text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-accent-cyan" />
            <span>View Live</span>
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
                <span>Publish Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Builder Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Profile Identity */}
          <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Profile Header
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-300">Display Name / Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Alex Morgan | Designer"
                  className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-300">Public Username Handle</label>
                <div className="flex items-center">
                  <span className="px-2.5 py-2 bg-[#11111B] border border-r-0 border-[#272738] rounded-l-xl text-xs text-text-muted">
                    cruseqr.com/bio/
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alexmorgan"
                    className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-r-xl text-xs text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Avatar Image URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Short Bio Description</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief intro for your visitors..."
                className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          {/* Theme Selector */}
          <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-3">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Aesthetic Theme
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {themes.map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setTheme(th.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    theme === th.id
                      ? "border-primary bg-primary/10 shadow-glow"
                      : "border-[#272738] bg-[#11111B] hover:border-zinc-500"
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full mb-2 border border-white/20"
                    style={{ backgroundColor: th.color }}
                  />
                  <div className="text-xs font-bold text-white truncate">{th.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Link Items List */}
          <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Destination Buttons ({links.length})
              </h2>
              <button
                type="button"
                onClick={addLink}
                className="px-3 py-1.5 rounded-xl bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary-light text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Button</span>
              </button>
            </div>

            <div className="space-y-3">
              {links.map((link, idx) => (
                <div
                  key={link.id || idx}
                  className="p-4 rounded-2xl bg-[#11111B] border border-[#272738] space-y-2.5 relative group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => updateLink(idx, "title", e.target.value)}
                      placeholder="Button title (e.g. Visit My Store)"
                      className="w-full px-3 py-1.5 bg-[#171724] border border-[#272738] rounded-lg text-xs font-bold text-white focus:outline-none focus:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => removeLink(idx)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400"
                      title="Remove button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateLink(idx, "url", e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-1.5 bg-[#171724] border border-[#272738] rounded-lg text-xs text-text-secondary focus:outline-none focus:border-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Social Icons */}
          <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Social Media Handles
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                value={socials.twitter}
                onChange={(e) => setSocials({ ...socials, twitter: e.target.value })}
                placeholder="X / Twitter URL"
                className="px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-white"
              />
              <input
                type="text"
                value={socials.linkedin}
                onChange={(e) => setSocials({ ...socials, linkedin: e.target.value })}
                placeholder="LinkedIn URL"
                className="px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-white"
              />
              <input
                type="text"
                value={socials.instagram}
                onChange={(e) => setSocials({ ...socials, instagram: e.target.value })}
                placeholder="Instagram URL"
                className="px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-white"
              />
              <input
                type="text"
                value={socials.github}
                onChange={(e) => setSocials({ ...socials, github: e.target.value })}
                placeholder="GitHub URL"
                className="px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-white"
              />
            </div>
          </div>
        </div>

        {/* Right Live Phone Preview (5 cols) */}
        <div className="lg:col-span-5 sticky top-6">
          <div className="w-full max-w-[340px] mx-auto bg-[#171724] border border-[#272738] rounded-[44px] p-3 shadow-2xl relative">
            {/* Phone Notch & Speaker */}
            <div className="w-32 h-5 bg-[#09090F] rounded-full mx-auto mb-3 flex items-center justify-center">
              <div className="w-8 h-1 rounded-full bg-zinc-800" />
            </div>

            {/* Inner Phone Screen */}
            <div
              className={`w-full min-h-[560px] rounded-[36px] p-5 flex flex-col items-center justify-between text-center overflow-hidden border border-[#272738] relative transition-all ${
                theme === "obsidian"
                  ? "bg-black text-white"
                  : theme === "emerald"
                  ? "bg-[#041A14] text-white"
                  : theme === "sunset"
                  ? "bg-[#1C0A1E] text-white"
                  : "bg-gradient-to-b from-[#09090F] to-[#121226] text-white"
              }`}
            >
              <div className="w-full flex flex-col items-center">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-primary to-accent-cyan shadow-glow mb-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={title}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#171724] rounded-full flex items-center justify-center text-xl font-bold">
                      {title.charAt(0) || "U"}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 font-bold text-sm text-white">
                  <span>{title || "Your Name"}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">@{username || "username"}</div>
                {bio && <p className="text-[11px] text-zinc-300 mt-2 max-w-xs">{bio}</p>}

                {/* Buttons Preview */}
                <div className="w-full space-y-2 mt-5">
                  {links.map((item, i) => (
                    <div
                      key={i}
                      className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-white flex items-center justify-between shadow-sm"
                    >
                      <span className="truncate">{item.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Powered by CruseQR pill */}
              <div className="text-[10px] text-zinc-500 mt-6 pt-4">
                Powered by <strong className="text-primary font-bold">CruseQR</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

