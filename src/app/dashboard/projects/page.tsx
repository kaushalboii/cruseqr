"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderKanban,
  FolderPlus,
  Plus,
  Trash2,
  Folder,
  QrCode,
  ArrowRight,
  Palette,
  Check,
} from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New project modal / form
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("#8B5CF6");
  const [creatingProject, setCreatingProject] = useState(false);

  // New folder form
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);

  const loadData = async () => {
    try {
      const [projRes, foldRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/folders"),
      ]);

      if (projRes.ok) {
        const pData = await projRes.json();
        setProjects(pData.projects || []);
      }
      if (foldRes.ok) {
        const fData = await foldRes.json();
        setFolders(fData.folders || []);
      }
    } catch (err) {
      console.error("Load projects error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setCreatingProject(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDesc.trim(),
          color: newProjectColor,
        }),
      });

      if (res.ok) {
        setNewProjectName("");
        setNewProjectDesc("");
        loadData();
      }
    } catch {
      alert("Failed to create project");
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setCreatingFolder(true);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFolderName.trim(),
          projectId: selectedProjectId || undefined,
        }),
      });

      if (res.ok) {
        setNewFolderName("");
        loadData();
      }
    } catch {
      alert("Failed to create folder");
    } finally {
      setCreatingFolder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Projects & Organization</h1>
        <p className="text-xs text-text-secondary mt-0.5">
          Group QR codes into campaigns, physical locations, client spaces, or internal folders
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Create Project & Create Folder (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Create Project Card */}
          <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-primary" />
              <span>New Campaign Project</span>
            </h2>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-300">Project Name</label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Summer Music Festival 2026"
                  className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-300">Description (Optional)</label>
                <input
                  type="text"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Billboard ads, print flyers, VIP passes"
                  className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-300">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newProjectColor}
                    onChange={(e) => setNewProjectColor(e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer bg-transparent"
                  />
                  <span className="text-xs font-mono text-zinc-400">{newProjectColor}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={creatingProject}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all active:scale-95 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Create Project</span>
              </button>
            </form>
          </div>

          {/* Create Folder Card */}
          <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-accent-cyan" />
              <span>New Sub-Folder</span>
            </h2>

            <form onSubmit={handleCreateFolder} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-300">Folder Name</label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Tabletop Menus"
                  className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-300">Assign to Project (Optional)</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white"
                >
                  <option value="">No Project (Standalone)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={creatingFolder}
                className="w-full py-2.5 rounded-xl bg-[#272738] hover:bg-[#34344A] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>Add Folder</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right List: Projects & Folders (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Active Projects ({projects.length})
              </h2>
            </div>

            <div className="space-y-3">
              {projects.length === 0 ? (
                <div className="py-8 text-center text-xs text-text-muted">
                  No projects created yet. Add one on the left to organize your campaigns!
                </div>
              ) : (
                projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-2xl bg-[#11111B] border border-[#272738] hover:border-primary/40 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3.5 h-10 rounded-full"
                        style={{ backgroundColor: proj.color || "#8B5CF6" }}
                      />
                      <div>
                        <h3 className="text-xs font-bold text-white">{proj.name}</h3>
                        {proj.description && (
                          <p className="text-[11px] text-text-muted truncate max-w-sm">
                            {proj.description}
                          </p>
                        )}
                        <div className="text-[10px] text-text-secondary flex items-center gap-2 mt-1">
                          <span className="font-semibold text-white">
                            {proj._count?.qrCodes || 0} QR codes
                          </span>
                          <span>•</span>
                          <span>{proj.folders?.length || 0} folders</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/qr-codes?projectId=${proj.id}`}
                      className="px-3 py-1.5 rounded-xl bg-[#171724] border border-[#272738] hover:border-primary text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <span>Filter QRs</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Standalone Folders List */}
          <div className="p-6 rounded-3xl bg-[#171724] border border-[#272738] space-y-4">
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Folders ({folders.length})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {folders.map((f) => (
                <div
                  key={f.id}
                  className="p-3.5 rounded-2xl bg-[#11111B] border border-[#272738] flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Folder className="w-4 h-4 text-accent-cyan flex-shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-white truncate">{f.name}</div>
                      <div className="text-[10px] text-text-muted truncate">
                        {f.project?.name || "Standalone"} • {f._count?.qrCodes || 0} QRs
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/qr-codes?folderId=${f.id}`}
                    className="p-1.5 rounded-lg bg-[#171724] text-zinc-400 hover:text-white"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

