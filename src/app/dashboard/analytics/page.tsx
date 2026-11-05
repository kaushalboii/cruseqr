"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Calendar,
  Smartphone,
  Globe,
  Download,
  Filter,
  TrendingUp,
  Users,
  Compass,
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
  BarChart,
  Bar,
} from "recharts";

export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    totalScans: 0,
    uniqueScans: 0,
    scanTrends: [],
    deviceBreakdown: [],
    osBreakdown: [],
    browserBreakdown: [],
    countryBreakdown: [],
    topQrCodes: [],
  });

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?range=${range}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Analytics load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [range]);

  const exportCsv = () => {
    if (!data.scanTrends.length) return;
    const rows = [["Date", "Scans"]];
    data.scanTrends.forEach((item: any) => {
      rows.push([item.date, item.scans]);
    });
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cruseqr-analytics-${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Range Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Scan Analytics Engine</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Privacy-preserving insights on physical-to-digital interactions across devices and regions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <div className="flex items-center p-1 bg-[#171724] border border-[#272738] rounded-2xl text-xs">
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "90d", label: "90 Days" },
              { id: "all", label: "All Time" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setRange(t.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                  range === t.id ? "bg-primary text-white shadow-glow" : "text-text-muted hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={exportCsv}
            className="px-3.5 py-2.5 rounded-xl bg-[#171724] hover:bg-[#202034] border border-[#272738] text-white text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top Aggregate Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-2">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium">
            <span>Period Total Scans</span>
            <BarChart3 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-extrabold text-white">{data.totalScans}</div>
          <p className="text-[11px] text-text-muted">Total camera impressions recorded</p>
        </div>

        <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-2">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium">
            <span>Estimated Unique Devices</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{data.uniqueScans}</div>
          <p className="text-[11px] text-emerald-400">Anonymized device fingerprint</p>
        </div>

        <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-2">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium">
            <span>Top Performing Campaign</span>
            <TrendingUp className="w-4 h-4 text-accent-cyan" />
          </div>
          <div className="text-xl font-bold text-white truncate">
            {data.topQrCodes[0]?.title || "None yet"}
          </div>
          <p className="text-[11px] text-text-muted">
            {data.topQrCodes[0]?.periodScans || 0} scans in selected period
          </p>
        </div>
      </div>

      {/* Main Scan Trend Chart */}
      <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Scan Trend Activity</h2>
            <p className="text-[11px] text-text-muted">Volume over selected time window</p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.scanTrends}>
              <defs>
                <linearGradient id="analyticsScans" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#272738" vertical={false} />
              <XAxis dataKey="date" stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
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
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#analyticsScans)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row: Device Breakdown & Operating System */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Categories */}
        <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" />
            <span>Device Distribution</span>
          </h2>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.deviceBreakdown}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.deviceBreakdown.map((entry: any, index: number) => (
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
          </div>

          <div className="space-y-2 pt-2 border-t border-[#272738]">
            {data.deviceBreakdown.map((item: any) => (
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

        {/* Operating Systems */}
        <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-accent-cyan" />
            <span>Operating Systems</span>
          </h2>

          <div className="space-y-3 pt-2">
            {data.osBreakdown.length === 0 ? (
              <div className="py-12 text-center text-xs text-text-muted">
                No OS telemetry recorded yet.
              </div>
            ) : (
              data.osBreakdown.map((item: any) => {
                const pct = data.totalScans > 0 ? Math.round((item.count / data.totalScans) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 font-medium">{item.name}</span>
                      <span className="text-text-muted">
                        {item.count} scans ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#11111B] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent-cyan"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Row: Geographic Countries & Top QRs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country Breakdown */}
        <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>Geographic Distribution</span>
          </h2>

          <div className="divide-y divide-[#272738] text-xs">
            {data.countryBreakdown.length === 0 ? (
              <div className="py-8 text-center text-text-muted">No location data captured yet.</div>
            ) : (
              data.countryBreakdown.map((c: any) => (
                <div key={c.country} className="py-2.5 flex items-center justify-between">
                  <span className="text-zinc-300 font-medium">{c.country}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-text-muted">{c.percent}%</span>
                    <span className="font-bold text-white">{c.count} scans</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top QR Codes */}
        <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-4">
          <h2 className="text-sm font-bold text-white">Top Performing QR Codes</h2>

          <div className="divide-y divide-[#272738] text-xs">
            {data.topQrCodes.length === 0 ? (
              <div className="py-8 text-center text-text-muted">No scans in this period.</div>
            ) : (
              data.topQrCodes.map((q: any) => (
                <div key={q.id} className="py-2.5 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-white truncate">{q.title}</div>
                    <div className="text-[10px] text-text-muted font-mono">{q.shortCode}</div>
                  </div>
                  <div className="font-bold text-emerald-400 whitespace-nowrap">
                    {q.periodScans} scans
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

