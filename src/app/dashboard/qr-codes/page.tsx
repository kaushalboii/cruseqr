"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  QrCode,
  Search,
  Filter,
  Download,
  Copy,
  Check,
  Pause,
  Play,
  Trash2,
  CopyPlus,
  BarChart3,
  ExternalLink,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Archive,
  Layers,
  Sparkles,
} from "lucide-react";
import { generateQrSvg } from "@/lib/qr-engine";
import { exportPng, exportSvg, exportPdf, exportBatchZip } from "@/lib/export-utils";

export default function MyQrCodesPage() {
  const [qrs, setQrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchQrs = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (typeFilter !== "ALL") params.set("type", typeFilter);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (sort) params.set("sort", sort);

      const res = await fetch(`/api/qrcodes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQrs(data.qrCodes || []);
      }
    } catch (err) {
      console.error("Fetch QRs error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQrs();
  }, [search, typeFilter, statusFilter, sort]);

  const handleCopyLink = (shortCode: string, id: string) => {
    const url = `${window.location.origin}/r/${shortCode}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = async (qr: any) => {
    const nextStatus = qr.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const res = await fetch(`/api/qrcodes/${qr.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setQrs(qrs.map((item) => (item.id === qr.id ? { ...item, status: nextStatus } : item)));
      }
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this QR code? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/qrcodes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setQrs(qrs.filter((item) => item.id !== id));
        setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
      }
    } catch {
      alert("Failed to delete QR code");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch(`/api/qrcodes/${id}/duplicate`, { method: "POST" });
      if (res.ok) {
        fetchQrs();
      }
    } catch {
      alert("Failed to duplicate QR code");
    }
  };

  const handleBulkAction = async (action: "delete" | "pause" | "activate" | "export") => {
    if (selectedIds.length === 0) return;

    if (action === "export") {
      const selectedItems = qrs
        .filter((q) => selectedIds.includes(q.id))
        .map((q) => {
          let design = {};
          try {
            design = JSON.parse(q.designConfig);
          } catch {}
          const svg = generateQrSvg(q.destinationUrl || "https://cruseqr.com", design);
          return { id: q.id, title: q.title, svgString: svg };
        });

      await exportBatchZip(selectedItems, "cruseqr-batch-export.zip");
      return;
    }

    if (action === "delete" && !confirm(`Delete ${selectedIds.length} selected QR codes?`)) return;

    try {
      const res = await fetch("/api/qrcodes/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids: selectedIds }),
      });

      if (res.ok) {
        setSelectedIds([]);
        fetchQrs();
      }
    } catch {
      alert("Failed to perform bulk action");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === qrs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(qrs.map((q) => q.id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">My QR Codes</h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Manage, duplicate, track, and download all your static and dynamic QR campaigns
          </p>
        </div>

        <Link
          href="/dashboard/create"
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-2 shadow-glow transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New QR Code</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#171724] border border-[#272738] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, destination, or tag..."
              className="w-full pl-9 pr-4 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
            />
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-primary"
          >
            <option value="ALL">All QR Types</option>
            <option value="URL">Website / URL</option>
            <option value="WIFI">Wi-Fi Connect</option>
            <option value="VCARD">vCard Contact</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="BIO">Link in Bio</option>
            <option value="PAYMENT">Payment / UPI</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="PAUSED">Paused Only</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-primary"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="scans">Most Scans</option>
            <option value="title">Alphabetical</option>
          </select>

          {/* View toggle */}
          <div className="flex items-center p-1 bg-[#11111B] border border-[#272738] rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs ${
                viewMode === "grid" ? "bg-[#171724] text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs ${
                viewMode === "table" ? "bg-[#171724] text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (when items selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-white font-semibold">
            <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px]">
              {selectedIds.length}
            </span>
            <span>QR Codes Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction("export")}
              className="px-3 py-1.5 rounded-lg bg-[#171724] border border-[#272738] hover:border-primary text-white flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Export Selected (ZIP)</span>
            </button>

            <button
              onClick={() => handleBulkAction("activate")}
              className="px-3 py-1.5 rounded-lg bg-[#171724] border border-[#272738] hover:border-emerald-500 text-white flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Resume</span>
            </button>

            <button
              onClick={() => handleBulkAction("pause")}
              className="px-3 py-1.5 rounded-lg bg-[#171724] border border-[#272738] hover:border-amber-500 text-white flex items-center gap-1.5"
            >
              <Pause className="w-3.5 h-3.5 text-amber-400" />
              <span>Pause</span>
            </button>

            <button
              onClick={() => handleBulkAction("delete")}
              className="px-3 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 hover:bg-rose-500/30 flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrs.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-text-muted space-y-3 bg-[#171724]/40 border border-[#272738] rounded-3xl">
              <QrCode className="w-10 h-10 mx-auto text-zinc-600" />
              <p>No QR codes match the current filter or search criteria.</p>
              <Link
                href="/dashboard/create"
                className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold hover:text-primary-light"
              >
                <span>Create a new QR code</span>
              </Link>
            </div>
          ) : (
            qrs.map((qr) => {
              let design = {};
              try {
                design = JSON.parse(qr.designConfig);
              } catch {}
              const svg = generateQrSvg(qr.destinationUrl || "https://cruseqr.com", design);
              const isSelected = selectedIds.includes(qr.id);

              return (
                <div
                  key={qr.id}
                  className={`p-5 rounded-3xl bg-[#171724] border transition-all duration-200 space-y-4 relative ${
                    isSelected ? "border-primary shadow-glow" : "border-[#272738] hover:border-[#3B3B54]"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (isSelected) setSelectedIds(selectedIds.filter((id) => id !== qr.id));
                          else setSelectedIds([...selectedIds, qr.id]);
                        }}
                        className="accent-primary rounded"
                      />
                      <span className="px-2 py-0.5 rounded bg-[#11111B] border border-[#272738] text-[10px] font-mono text-zinc-300">
                        {qr.qrType}
                      </span>
                      {qr.isDynamic && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                          DYNAMIC
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleStatus(qr)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                        qr.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {qr.status === "ACTIVE" ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>Paused</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* QR Preview & Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 bg-white rounded-2xl p-1.5 shadow-md flex-shrink-0 flex items-center justify-center">
                      <div
                        className="w-full h-full flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: svg }}
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="text-sm font-bold text-white truncate" title={qr.title}>
                        {qr.title}
                      </h3>
                      <p className="text-[11px] text-text-secondary truncate" title={qr.destinationUrl}>
                        {qr.destinationUrl || "Static payload"}
                      </p>
                      <div className="text-[11px] text-text-muted flex items-center gap-2 pt-1">
                        <span className="font-semibold text-white">{qr.totalScans}</span> scans
                        {qr.project && (
                          <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary-light text-[10px]">
                            {qr.project.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons Bar */}
                  <div className="border-t border-[#272738] pt-3 flex items-center justify-between gap-1 text-xs">
                    <button
                      onClick={() => handleCopyLink(qr.shortCode, qr.id)}
                      className="p-2 rounded-xl bg-[#11111B] border border-[#272738] text-zinc-400 hover:text-white"
                      title="Copy redirect link"
                    >
                      {copiedId === qr.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => exportPng(svg, `${qr.title}.png`, 1024)}
                      className="p-2 rounded-xl bg-[#11111B] border border-[#272738] text-zinc-400 hover:text-white"
                      title="Download PNG"
                    >
                      <Download className="w-3.5 h-3.5 text-primary" />
                    </button>

                    <button
                      onClick={() => exportSvg(svg, `${qr.title}.svg`)}
                      className="p-2 rounded-xl bg-[#11111B] border border-[#272738] text-zinc-400 hover:text-white"
                      title="Download Vector SVG"
                    >
                      <Download className="w-3.5 h-3.5 text-accent-cyan" />
                    </button>

                    <button
                      onClick={() => handleDuplicate(qr.id)}
                      className="p-2 rounded-xl bg-[#11111B] border border-[#272738] text-zinc-400 hover:text-white"
                      title="Duplicate"
                    >
                      <CopyPlus className="w-3.5 h-3.5" />
                    </button>

                    <Link
                      href={`/r/${qr.shortCode}`}
                      target="_blank"
                      className="p-2 rounded-xl bg-[#11111B] border border-[#272738] text-zinc-400 hover:text-white"
                      title="Open redirect"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => handleDelete(qr.id)}
                      className="p-2 rounded-xl bg-[#11111B] border border-[#272738] text-zinc-400 hover:text-rose-400"
                      title="Delete QR"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === "table" && (
        <div className="bg-[#171724] border border-[#272738] rounded-3xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#11111B] text-text-muted border-b border-[#272738]">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === qrs.length && qrs.length > 0}
                    onChange={toggleSelectAll}
                    className="accent-primary"
                  />
                </th>
                <th className="p-4">Title & Type</th>
                <th className="p-4">Destination</th>
                <th className="p-4">Status</th>
                <th className="p-4">Scans</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272738]">
              {qrs.map((qr) => (
                <tr key={qr.id} className="hover:bg-[#1E1E30] transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(qr.id)}
                      onChange={() => {
                        if (selectedIds.includes(qr.id)) {
                          setSelectedIds(selectedIds.filter((id) => id !== qr.id));
                        } else {
                          setSelectedIds([...selectedIds, qr.id]);
                        }
                      }}
                      className="accent-primary"
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white">{qr.title}</div>
                    <div className="text-[11px] text-text-muted">{qr.qrType}</div>
                  </td>
                  <td className="p-4 text-text-secondary truncate max-w-xs">{qr.destinationUrl}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        qr.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {qr.status}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-white">{qr.totalScans}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleCopyLink(qr.shortCode, qr.id)}
                      className="px-2.5 py-1 rounded bg-[#11111B] border border-[#272738] hover:border-primary text-zinc-300"
                    >
                      {copiedId === qr.id ? "Copied" : "Copy"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

