"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Check,
  Zap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    plan: "FREE",
    usage: { qrCodesCreated: 0, dynamicQrCodes: 0, aiGenerations: 0 },
  });
  const [upgrading, setUpgrading] = useState(false);

  const loadBilling = async () => {
    try {
      const res = await fetch("/api/subscription");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Billing load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBilling();
  }, []);

  const handleUpgrade = async (targetPlan: string) => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPlan }),
      });

      if (!res.ok) throw new Error("Upgrade failed");

      alert(`Plan successfully switched to ${targetPlan}!`);
      loadBilling();
    } catch (err: any) {
      alert(err.message || "Upgrade failed");
    } finally {
      setUpgrading(false);
    }
  };

  const planTiers = [
    {
      id: "FREE",
      name: "Starter",
      price: "$0",
      desc: "For testing & basic static codes",
      features: ["1 Dynamic QR Code", "Standard PNG Export", "Basic Dashboard"],
    },
    {
      id: "PRO",
      name: "Pro Creator",
      price: "$14/mo",
      desc: "For creators, designers & founders",
      features: [
        "50 Dynamic QR Codes",
        "Full AI QR Art Studio",
        "Link in Bio Builder",
        "Vector SVG & Print PDF Exports",
        "Scan Analytics",
      ],
    },
    {
      id: "BUSINESS",
      name: "Business",
      price: "$39/mo",
      desc: "For agencies & growing teams",
      features: [
        "Unlimited Dynamic QR Codes",
        "Bulk Generation & ZIP Archive Export",
        "Team Projects & Folders",
        "Password Protected QR Redirects",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Billing & Plan Subscription</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Manage your subscription tier, usage quotas, and account limits
        </p>
      </div>

      {/* Current Plan Overview Card */}
      <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-text-muted">Current Active Plan</div>
              <div className="text-xl font-extrabold text-white flex items-center gap-2">
                <span>{data.plan} Tier</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-text-secondary">
            Next billing renewal: <strong>30 days from signup</strong>
          </div>
        </div>

        {/* Usage meters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#272738]">
          <div className="p-4 rounded-2xl bg-[#11111B] border border-[#272738] space-y-1">
            <span className="text-[11px] text-text-muted">Total QR Codes</span>
            <div className="text-lg font-bold text-white">{data.usage.qrCodesCreated} Created</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#11111B] border border-[#272738] space-y-1">
            <span className="text-[11px] text-text-muted">Dynamic Redirects Used</span>
            <div className="text-lg font-bold text-emerald-400">
              {data.usage.dynamicQrCodes} Active
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#11111B] border border-[#272738] space-y-1">
            <span className="text-[11px] text-text-muted">AI Art Generations</span>
            <div className="text-lg font-bold text-accent-cyan">
              {data.usage.aiGenerations} Created
            </div>
          </div>
        </div>
      </div>

      {/* Available Plans Switcher */}
      <div>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
          Available Subscription Plans
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planTiers.map((p) => {
            const isCurrent = data.plan === p.id;
            return (
              <div
                key={p.id}
                className={`p-6 rounded-3xl flex flex-col justify-between transition-all ${
                  isCurrent
                    ? "bg-[#171724] border-2 border-primary shadow-glow"
                    : "bg-[#171724]/70 border border-[#272738] hover:border-[#3B3B54]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-white">{p.name}</h3>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mb-4">{p.desc}</p>
                  <div className="text-2xl font-extrabold text-white mb-5">{p.price}</div>

                  <div className="space-y-2 text-xs border-t border-[#272738] pt-4">
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-auto">
                  <button
                    disabled={isCurrent || upgrading}
                    onClick={() => handleUpgrade(p.id)}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                      isCurrent
                        ? "bg-[#11111B] text-text-muted cursor-default border border-[#272738]"
                        : "bg-primary hover:bg-primary-hover text-white shadow-glow active:scale-95"
                    }`}
                  >
                    {isCurrent ? "Active Plan" : `Switch to ${p.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

