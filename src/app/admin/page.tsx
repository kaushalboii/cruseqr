"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import {
  ShieldAlert,
  Users,
  QrCode,
  BarChart3,
  Sparkles,
  ArrowLeft,
  Search,
  CheckCircle2,
  Lock,
  ExternalLink,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    stats: {
      totalUsers: 0,
      totalQrCodes: 0,
      dynamicQrCodes: 0,
      totalScans: 0,
      totalAiGenerations: 0,
    },
    users: [],
    recentQrCodes: [],
  });
  const [searchUser, setSearchUser] = useState("");

  useEffect(() => {
    async function loadAdminData() {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) {
          if (res.status === 403 || res.status === 401) {
            router.push("/dashboard");
            return;
          }
          throw new Error("Unauthorized");
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [router]);

  const filteredUsers = (data.users || []).filter(
    (u: any) =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.plan.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#09090F] text-white p-4 sm:p-8 space-y-8 selection:bg-purple-600 selection:text-white">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#272738] pb-6">
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <div className="h-6 w-[1px] bg-[#272738]" />
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Root Admin Console</span>
          </div>
        </div>

        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-xl bg-[#171724] border border-[#272738] hover:border-primary text-xs font-semibold text-white flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to User Dashboard</span>
        </Link>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-[#171724] border border-[#272738] space-y-2">
            <span className="text-[11px] text-text-muted">Total Users</span>
            <div className="text-2xl font-bold text-white">{data.stats.totalUsers}</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#171724] border border-[#272738] space-y-2">
            <span className="text-[11px] text-text-muted">Total QR Codes</span>
            <div className="text-2xl font-bold text-primary">{data.stats.totalQrCodes}</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#171724] border border-[#272738] space-y-2">
            <span className="text-[11px] text-text-muted">Dynamic Redirects</span>
            <div className="text-2xl font-bold text-emerald-400">{data.stats.dynamicQrCodes}</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#171724] border border-[#272738] space-y-2">
            <span className="text-[11px] text-text-muted">System Scans</span>
            <div className="text-2xl font-bold text-accent-cyan">{data.stats.totalScans}</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#171724] border border-[#272738] space-y-2">
            <span className="text-[11px] text-text-muted">AI Art Synthesized</span>
            <div className="text-2xl font-bold text-purple-400">{data.stats.totalAiGenerations}</div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-white">Registered User Directory</h2>
              <p className="text-[11px] text-text-muted">
                User accounts, roles, subscription plans, and activity volume
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                placeholder="Search user name or email..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white focus:outline-none focus:border-primary"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#11111B] text-text-muted border-b border-[#272738]">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">QR Volume</th>
                  <th className="p-3">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#272738]">
                {filteredUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-[#1E1E30] transition-colors">
                    <td className="p-3">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-[10px] text-text-muted">{u.email}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === "ADMIN"
                            ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                            : "bg-white/5 text-zinc-300"
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-primary/20 text-primary-light font-bold text-[10px]">
                        {u.plan}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-white">
                      {u._count?.qrCodes || 0} QRs
                    </td>
                    <td className="p-3 text-text-muted">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Platform QR Creations */}
        <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-4">
          <h2 className="text-sm font-bold text-white">System-Wide Recent QR Deployments</h2>

          <div className="divide-y divide-[#272738] text-xs">
            {data.recentQrCodes.map((qr: any) => (
              <div key={qr.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold text-white truncate">{qr.title}</div>
                  <div className="text-[10px] text-text-muted truncate">
                    Created by {qr.user?.name || "Unknown"} ({qr.user?.email}) • {qr.qrType} • {qr.totalScans} scans
                  </div>
                </div>

                <Link
                  href={`/r/${qr.shortCode}`}
                  target="_blank"
                  className="px-2.5 py-1 rounded-lg bg-[#11111B] border border-[#272738] hover:border-primary text-[11px] text-zinc-300 flex items-center gap-1.5"
                >
                  <span>Test Link</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

