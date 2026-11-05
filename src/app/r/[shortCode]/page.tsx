import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import Link from "next/link";
import { ShieldAlert, Lock, ArrowRight, Clock, AlertTriangle } from "lucide-react";

interface RedirectProps {
  params: { shortCode: string };
  searchParams: { pwd?: string };
}

function parseUserAgent(ua: string) {
  let deviceType = "desktop";
  if (/mobile|android|iphone|ipod/i.test(ua)) {
    deviceType = "mobile";
  } else if (/ipad|tablet/i.test(ua)) {
    deviceType = "tablet";
  }

  let os = "Other";
  if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/windows/i.test(ua)) os = "Windows";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Other";
  if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/edg/i.test(ua)) browser = "Edge";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";

  return { deviceType, os, browser };
}

export default async function DynamicRedirectPage({ params, searchParams }: RedirectProps) {
  const { shortCode } = params;

  const qr = await prisma.qrCode.findUnique({
    where: { shortCode },
  });

  if (!qr) {
    notFound();
  }

  // 1. Check if paused
  if (qr.status === "PAUSED") {
    return (
      <div className="min-h-screen bg-[#09090F] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#171724] border border-[#272738] rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-amber-400">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">QR Code Paused</h1>
          <p className="text-sm text-text-secondary mb-6">
            The creator has temporarily paused this QR code campaign. Please check back later.
          </p>
          <div className="text-xs text-text-muted">Powered by CruseQR</div>
        </div>
      </div>
    );
  }

  // 2. Check if expired
  if (qr.expiresAt && new Date(qr.expiresAt) < new Date()) {
    return (
      <div className="min-h-screen bg-[#09090F] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#171724] border border-[#272738] rounded-2xl p-8 text-center">
          <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-400">
            <Clock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Campaign Expired</h1>
          <p className="text-sm text-text-secondary mb-6">
            This QR code has reached its scheduled expiration date and is no longer active.
          </p>
          <div className="text-xs text-text-muted">Powered by CruseQR</div>
        </div>
      </div>
    );
  }

  // 3. Password check
  if (qr.password) {
    const enteredPassword = searchParams.pwd;
    if (enteredPassword !== qr.password) {
      return (
        <div className="min-h-screen bg-[#09090F] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#171724] border border-[#272738] rounded-2xl p-8">
            <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5 text-primary">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-white text-center mb-2">Protected Destination</h1>
            <p className="text-sm text-text-secondary text-center mb-6">
              This QR code requires an access passcode to view the destination.
            </p>

            <form method="GET" action={`/r/${shortCode}`} className="space-y-4">
              <div>
                <input
                  type="password"
                  name="pwd"
                  placeholder="Enter passcode..."
                  required
                  className="w-full px-4 py-3 bg-[#11111B] border border-[#272738] rounded-xl text-white placeholder-text-muted text-center focus:outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-glow flex items-center justify-center gap-2"
              >
                <span>Unlock Destination</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      );
    }
  }

  // 4. Record Scan Event asynchronously
  const headersList = headers();
  const ua = headersList.get("user-agent") || "";
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] || headersList.get("x-real-ip") || "127.0.0.1";
  const referer = headersList.get("referer") || "direct";
  const countryHeader = headersList.get("x-vercel-ip-country") || "United States";
  const cityHeader = headersList.get("x-vercel-ip-city") || "New York";

  const { deviceType, os, browser } = parseUserAgent(ua);
  const ipHash = crypto.createHash("sha256").update(ip).digest("hex").substring(0, 16);

  try {
    // Record scan record and increment stats
    await prisma.$transaction([
      prisma.qrScan.create({
        data: {
          qrCodeId: qr.id,
          ipHash,
          userAgent: ua.substring(0, 200),
          deviceType,
          os,
          browser,
          country: countryHeader,
          city: cityHeader,
          referer: referer.substring(0, 150),
        },
      }),
      prisma.qrCode.update({
        where: { id: qr.id },
        data: {
          totalScans: { increment: 1 },
        },
      }),
    ]);
  } catch (err) {
    console.error("Scan recording error:", err);
  }

  // 5. Execute Redirect
  const target = qr.destinationUrl || "https://cruseqr.com";
  redirect(target);
}

