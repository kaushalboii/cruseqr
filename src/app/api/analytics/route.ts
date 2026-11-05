import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "30d"; // today, 7d, 30d, 90d, all
  const specificQrId = searchParams.get("qrCodeId");

  const now = new Date();
  let startDate = new Date();
  if (range === "today") {
    startDate.setHours(0, 0, 0, 0);
  } else if (range === "7d") {
    startDate.setDate(now.getDate() - 7);
  } else if (range === "30d") {
    startDate.setDate(now.getDate() - 30);
  } else if (range === "90d") {
    startDate.setDate(now.getDate() - 90);
  } else {
    startDate = new Date(0); // All time
  }

  try {
    // 1. Get user QR codes
    const userQrCodes = await prisma.qrCode.findMany({
      where: {
        userId: sessionUser.id,
        ...(specificQrId ? { id: specificQrId } : {}),
      },
      select: { id: true, title: true, shortCode: true, qrType: true, totalScans: true, uniqueScans: true },
    });

    const qrIds = userQrCodes.map((q) => q.id);

    // 2. Fetch all scan records within range for user's QR codes
    const scans = await prisma.qrScan.findMany({
      where: {
        qrCodeId: { in: qrIds },
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: "asc" },
    });

    const totalScans = scans.length;
    const uniqueIps = new Set(scans.map((s) => s.ipHash).filter(Boolean));
    const uniqueScans = uniqueIps.size || totalScans;

    // Group scans by date for trends
    const dateMap: { [key: string]: number } = {};
    const daysCount = range === "today" ? 24 : range === "7d" ? 7 : range === "90d" ? 90 : 30;

    if (range === "today") {
      for (let h = 0; h < 24; h++) {
        const hourStr = `${h.toString().padStart(2, "0")}:00`;
        dateMap[hourStr] = 0;
      }
      for (const s of scans) {
        const hour = new Date(s.timestamp).getHours();
        const hourStr = `${hour.toString().padStart(2, "0")}:00`;
        dateMap[hourStr] = (dateMap[hourStr] || 0) + 1;
      }
    } else {
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        dateMap[dateStr] = 0;
      }
      for (const s of scans) {
        const dateStr = new Date(s.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        if (dateMap[dateStr] !== undefined) {
          dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
        }
      }
    }

    const scanTrends = Object.entries(dateMap).map(([date, count]) => ({
      date,
      scans: count,
    }));

    // Device breakdown
    const deviceCounts: { [key: string]: number } = { mobile: 0, desktop: 0, tablet: 0 };
    for (const s of scans) {
      const dev = (s.deviceType || "mobile").toLowerCase();
      deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;
    }
    const deviceBreakdown = [
      { name: "Mobile", value: deviceCounts.mobile || 0, color: "#8B5CF6" },
      { name: "Desktop", value: deviceCounts.desktop || 0, color: "#06B6D4" },
      { name: "Tablet", value: deviceCounts.tablet || 0, color: "#10B981" },
    ];

    // OS Breakdown
    const osMap: { [key: string]: number } = {};
    for (const s of scans) {
      const os = s.os || "Unknown";
      osMap[os] = (osMap[os] || 0) + 1;
    }
    const osBreakdown = Object.entries(osMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Browser Breakdown
    const browserMap: { [key: string]: number } = {};
    for (const s of scans) {
      const browser = s.browser || "Unknown";
      browserMap[browser] = (browserMap[browser] || 0) + 1;
    }
    const browserBreakdown = Object.entries(browserMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Country Breakdown
    const countryMap: { [key: string]: number } = {};
    for (const s of scans) {
      const c = s.country || "Other";
      countryMap[c] = (countryMap[c] || 0) + 1;
    }
    const countryBreakdown = Object.entries(countryMap)
      .map(([country, count]) => ({
        country,
        count,
        percent: totalScans > 0 ? Math.round((count / totalScans) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Top Performing QR Codes
    const qrScansMap: { [key: string]: number } = {};
    for (const s of scans) {
      qrScansMap[s.qrCodeId] = (qrScansMap[s.qrCodeId] || 0) + 1;
    }
    const topQrCodes = userQrCodes
      .map((q) => ({
        id: q.id,
        title: q.title,
        qrType: q.qrType,
        shortCode: q.shortCode,
        periodScans: qrScansMap[q.id] || 0,
        totalScans: q.totalScans,
      }))
      .sort((a, b) => b.periodScans - a.periodScans)
      .slice(0, 5);

    return NextResponse.json({
      totalScans,
      uniqueScans,
      scanTrends,
      deviceBreakdown,
      osBreakdown,
      browserBreakdown,
      countryBreakdown,
      topQrCodes,
    });
  } catch (err: any) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
  }
}

