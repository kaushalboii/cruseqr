"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import {
  LayoutDashboard,
  PlusCircle,
  QrCode,
  Sparkles,
  Layers,
  Contact2,
  FolderKanban,
  BarChart3,
  LayoutTemplate,
  CreditCard,
  Settings,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  User,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    plan: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Create QR Code", href: "/dashboard/create", icon: <PlusCircle className="w-4 h-4 text-primary" /> },
    { label: "My QR Codes", href: "/dashboard/qr-codes", icon: <QrCode className="w-4 h-4" /> },
    { label: "AI QR Art Studio", href: "/dashboard/ai-art", icon: <Sparkles className="w-4 h-4 text-accent-cyan" /> },
    { label: "Link in Bio", href: "/dashboard/bio", icon: <Layers className="w-4 h-4 text-emerald-400" /> },
    { label: "Digital Cards", href: "/dashboard/business-cards", icon: <Contact2 className="w-4 h-4 text-amber-400" /> },
    { label: "Projects & Folders", href: "/dashboard/projects", icon: <FolderKanban className="w-4 h-4" /> },
    { label: "Scan Analytics", href: "/dashboard/analytics", icon: <BarChart3 className="w-4 h-4" /> },
    { label: "Templates", href: "/dashboard/templates", icon: <LayoutTemplate className="w-4 h-4" /> },
    { label: "Billing & Plans", href: "/dashboard/billing", icon: <CreditCard className="w-4 h-4" /> },
    { label: "Settings", href: "/dashboard/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#09090F] text-white flex flex-col md:flex-row selection:bg-primary selection:text-white">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#272738] bg-[#0E0E18] p-5 justify-between flex-shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        <div className="space-y-6">
          {/* Logo */}
          <div className="px-2">
            <Logo size="md" />
          </div>

          {/* Quick Create Action */}
          <Link
            href="/dashboard/create"
            className="w-full py-2.5 px-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New QR</span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? "bg-primary text-white shadow-glow"
                      : "text-text-secondary hover:text-white hover:bg-[#171724]"
                  }`}
                >
                  <span className={active ? "text-white" : "text-zinc-400"}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Admin Link if role === ADMIN */}
            {user?.role === "ADMIN" && (
              <div className="pt-3 mt-3 border-t border-[#272738]">
                <Link
                  href="/admin"
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    pathname.startsWith("/admin")
                      ? "bg-purple-600 text-white shadow-glow"
                      : "text-purple-400 hover:text-white hover:bg-purple-500/10"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Console</span>
                </Link>
              </div>
            )}
          </nav>
        </div>

        {/* User Profile & Logout Bottom Bar */}
        <div className="pt-4 border-t border-[#272738] space-y-3">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 overflow-hidden flex items-center justify-center text-primary text-sm font-bold flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0) || "U"
              )}
            </div>
            <div className="truncate flex-1">
              <div className="text-xs font-semibold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-text-muted flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-primary/20 text-primary-light font-bold">
                  {user?.plan || "FREE"}
                </span>
                <span className="truncate">{user?.email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0E0E18] border-b border-[#272738] sticky top-0 z-40">
        <Logo size="sm" />
        <button
          onClick={() => setMobileSidebar(!mobileSidebar)}
          className="p-2 rounded-xl bg-[#171724] border border-[#272738] text-white"
        >
          {mobileSidebar ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebar && (
        <div className="md:hidden fixed inset-0 z-50 bg-[#09090F]/95 backdrop-blur-xl p-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Logo size="md" />
              <button
                onClick={() => setMobileSidebar(false)}
                className="p-2 rounded-xl bg-[#171724] border border-[#272738] text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileSidebar(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium ${
                    pathname === item.href ? "bg-primary text-white" : "text-text-secondary hover:text-white"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileSidebar(false)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-purple-400"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Admin Console</span>
                </Link>
              )}
            </nav>
          </div>

          <div className="pt-6 border-t border-[#272738]">
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-xl bg-rose-500/10 text-rose-400 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl">
        {children}
      </main>
    </div>
  );
}

