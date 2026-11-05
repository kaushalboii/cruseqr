"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { Eye, EyeOff, ArrowRight, Lock, Mail, ShieldAlert, Sparkles, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (type: "demo" | "admin") => {
    if (type === "demo") {
      setEmail("demo@cruseqr.com");
      setPassword("Demo@123456");
    } else {
      setEmail("admin@cruseqr.com");
      setPassword("Admin@123456");
    }
  };

  return (
    <div className="min-h-screen bg-[#09090F] flex flex-col justify-center items-center p-4 relative selection:bg-primary selection:text-white">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center">
          <Logo size="lg" className="justify-center mb-6" />
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h1>
          <p className="text-xs text-text-secondary mt-1">
            Sign in to manage your QR campaigns and scan analytics
          </p>
        </div>

        {/* Quick Demo Credentials Autofill Helper */}
        <div className="p-3.5 rounded-2xl bg-[#171724]/90 border border-[#272738] space-y-2">
          <div className="text-[11px] font-semibold text-zinc-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-primary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant One-Click Login</span>
            </span>
            <span className="text-[10px] text-text-muted">Pre-seeded accounts</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillCredentials("demo")}
              className="py-1.5 px-2.5 rounded-xl bg-[#11111B] border border-[#272738] hover:border-primary/50 text-zinc-300 hover:text-white transition-all text-left flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Demo User</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials("admin")}
              className="py-1.5 px-2.5 rounded-xl bg-[#11111B] border border-[#272738] hover:border-primary/50 text-zinc-300 hover:text-white transition-all text-left flex items-center gap-1.5"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Account</span>
            </button>
          </div>
        </div>

        {/* Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#171724] border border-[#272738] shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
                />
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-300">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-primary hover:text-primary-light transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#11111B] border border-[#272738] rounded-xl text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
                />
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center text-xs text-text-secondary">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:text-primary-light">
              Create account free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

