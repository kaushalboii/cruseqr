"use client";

import { useState, useEffect } from "react";
import {
  User,
  Lock,
  Key,
  Bell,
  Save,
  Check,
  Shield,
  Copy,
} from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>({ name: "", email: "", avatar: "" });
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          setName(data.user.name);
          setAvatar(data.user.avatar || "");
        }
      });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatar }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(err.message || "Update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(`cqr_live_${user.id || "key8943892019"}`);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Account Settings</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Manage your personal profile, credentials, and API authentication keys
        </p>
      </div>

      {/* Profile Form Card */}
      <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <span>Profile Information</span>
        </h2>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Account Email (Read-only)</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3 py-2 bg-[#09090F] border border-[#272738] rounded-xl text-xs text-text-muted cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-zinc-300">Avatar Image URL</label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-2 shadow-glow transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
        </form>
      </div>

      {/* API Key Card */}
      <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-4">
        <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Key className="w-4 h-4 text-accent-cyan" />
          <span>Developer API Key</span>
        </h2>
        <p className="text-xs text-text-secondary">
          Use this secret key to authenticate programmatic QR generation from your backend servers or mobile applications.
        </p>

        <div className="flex items-center gap-2">
          <input
            type="password"
            readOnly
            value={`cqr_live_${user.id || "a849f2849102c48"}`}
            className="w-full px-3.5 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs font-mono text-zinc-300"
          />
          <button
            type="button"
            onClick={copyApiKey}
            className="px-3.5 py-2 rounded-xl bg-[#272738] hover:bg-[#34344A] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Key</span>
          </button>
        </div>
      </div>
    </div>
  );
}

