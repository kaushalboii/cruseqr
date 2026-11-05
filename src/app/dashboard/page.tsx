"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  QrCode,
  Zap,
  BarChart3,
  Layers,
  ArrowRight,
  Plus,
  ExternalLink,
  Smartphone,
  TrendingUp,
  Sparkles,
  Calendar,
  Eye,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function DashboardOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQr: 0,
    totalScans: 0,
    dynamicQr: 0,
    activeCampaigns: 0,
  });
  const [analytics, setAnalytics] = useState<{
    scanTrends: { date: string; scans: number }[];
    deviceBreakdown: { name: string; value: number; color: string }[];
    topQrCodes: any[];
  }>({
    scanTrends: [],
    deviceBreakdown: [],
    topQrCodes: [],
  });
  const [recentQrs, setRecentQrs] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [qrsRes, analyticsRes] = await Promise.all([
          fetch("/api/qrcodes?sort=newest"),
          fetch("/api/analytics?range=30d"),
        ]);

        if (qrsRes.ok) {
          const qrsData = await qrsRes.json();
          const qrs = qrsData.qrCodes || [];
          setRecentQrs(qrs.slice(0, 5));

          const totalScans = qrs.reduce((acc: number, curr: any) => acc + (curr.totalScans || 0), 0);
          const dynamicCount = qrs.filter((q: any) => q.isDynamic).length;
          const activeCount = qrs.filter((q: any) => q.status === "ACTIVE").length;

          setStats({
            totalQr: qrs.length,
            totalScans,
            dynamicQr: dynamicCount,
            activeCampaigns: activeCount,
          });
        }

        if (analyticsRes.ok) {
          const aData = await analyticsRes.json();
          setAnalytics({
            scanTrends: aData.scanTrends || [],
            deviceBreakdown: aData.deviceBreakdown || [],
            topQrCodes: aData.topQrCodes || [],
          });
        }
      } catch (err) {
        console.error("Dashboard overview load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Monitor real-time engagement and active dynamic QR campaigns
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/ai-art"
            className="px-4 py-2.5 rounded-xl bg-[#171724] hover:bg-[#202034] border border-[#272738] text-xs font-semibold text-white flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-cyan" />
            <span>AI Art Studio</span>
          </Link>

          <Link
            href="/dashboard/create"
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-2 shadow-glow transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create QR Code</span>
          </Link>
        </div>
      </div>

      {/* 4 Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-[#171724] border border-[#272738] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary font-medium">Total QR Codes</span>
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalQr}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>All types configured</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#171724] border border-[#272738] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary font-medium">Total Scans Recorded</span>
            <div className="w-8 h-8 rounded-xl bg-accent-cyan/10 text-accent-cyan flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.totalScans}</div>
          <div className="text-[11px] text-accent-cyan flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Across all devices</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#171724] border border-[#272738] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary font-medium">Dynamic QR Codes</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-primary-light flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.dynamicQr}</div>
          <div className="text-[11px] text-purple-400 flex items-center gap-1">
            <span>Editable destinations</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#171724] border border-[#272738] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-secondary font-medium">Active Campaigns</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{stats.activeCampaigns}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span>Live & resolving</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scan Activity Over Time (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Scan Activity Trends</h2>
              <p className="text-[11px] text-text-muted">Interactions recorded over last 30 days</p>
            </div>
            <Link
              href="/dashboard/analytics"
              className="text-xs text-primary hover:text-primary-light flex items-center gap-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full pt-4">
            {analytics.scanTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.scanTrends}>
                  <defs>
                    <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#272738" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#71717A"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#71717A"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#11111B",
                      border: "1px solid #272738",
                      borderRadius: "12px",
                      fontSize: "12px",
                      color: "#FFF",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="scans"
                    stroke="#8B5CF6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorScans)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-text-muted">
                No scan activity recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Device Breakdown Donut (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#171724] border border-[#272738] flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Device Breakdown</h2>
            <p className="text-[11px] text-text-muted">Audience platform distribution</p>

            <div className="h-44 w-full my-4 flex items-center justify-center">
              {analytics.deviceBreakdown.some((d) => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.deviceBreakdown}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analytics.deviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#11111B",
                        border: "1px solid #272738",
                        borderRadius: "10px",
                        fontSize: "11px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-text-muted text-center">
                  Waiting for device interactions
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 border-t border-[#272738] pt-4">
            {analytics.deviceBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-zinc-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </span>
                <span className="font-semibold text-white">{item.value} scans</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent QR Codes & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent QR Codes Table (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Recently Created QR Codes</h2>
            <Link
              href="/dashboard/qr-codes"
              className="text-xs text-primary hover:text-primary-light flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#272738]">
            {recentQrs.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-muted">
                No QR codes created yet. Click "+ Create QR Code" above!
              </div>
            ) : (
              recentQrs.map((qr) => (
                <div key={qr.id} className="py-3.5 flex items-center justify-between gap-4 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#11111B] border border-[#272738] flex items-center justify-center text-primary flex-shrink-0">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate group-hover:text-primary-light transition-colors">
                        {qr.title}
                      </div>
                      <div className="text-[11px] text-text-muted truncate flex items-center gap-2 mt-0.5">
                        <span className="px-1.5 py-0.2 rounded bg-[#11111B] border border-[#272738] text-[10px] text-zinc-300 font-mono">
                          {qr.qrType}
                        </span>
                        {qr.isDynamic && (
                          <span className="text-emerald-400 font-medium">Dynamic</span>
                        )}
                        <span>•</span>
                        <span>{qr.totalScans} scans</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/r/${qr.shortCode}`}
                      target="_blank"
                      className="p-2 rounded-lg bg-[#11111B] border border-[#272738] text-zinc-400 hover:text-white"
                      title="Open redirect"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Fast Shortcuts (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-4">
          <h2 className="text-sm font-bold text-white">Platform Hub</h2>
          <div className="space-y-2.5">
            <Link
              href="/dashboard/bio"
              className="p-3.5 rounded-2xl bg-[#11111B] border border-[#272738] hover:border-emerald-500/40 flex items-center justify-between text-xs text-white group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">Biolink Builder</div>
                  <div className="text-[10px] text-text-muted">tree.icqr.com style links</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            </Link>

            <Link
              href="/dashboard/business-cards"
              className="p-3.5 rounded-2xl bg-[#11111B] border border-[#272738] hover:border-amber-500/40 flex items-center justify-between text-xs text-white group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">Digital Business Card</div>
                  <div className="text-[10px] text-text-muted">vCard 3.0 .vcf contact card</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
            </Link>

            <Link
              href="/dashboard/templates"
              className="p-3.5 rounded-2xl bg-[#11111B] border border-[#272738] hover:border-primary/40 flex items-center justify-between text-xs text-white group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">Curated Templates</div>
                  <div className="text-[10px] text-text-muted">Menus, events & retail</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

