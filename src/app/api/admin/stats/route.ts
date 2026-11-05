import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessionUser = await getSession();
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
  }

  try {
    const totalUsers = await prisma.user.count();
    const totalQrCodes = await prisma.qrCode.count();
    const dynamicQrCodes = await prisma.qrCode.count({ where: { isDynamic: true } });
    const totalScans = await prisma.qrScan.count();
    const totalAiGenerations = await prisma.aiQrGeneration.count();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        createdAt: true,
        _count: {
          select: {
            qrCodes: true,
            aiGenerations: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const recentQrCodes = await prisma.qrCode.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalQrCodes,
        dynamicQrCodes,
        totalScans,
        totalAiGenerations,
      },
      users,
      recentQrCodes,
    });
  } catch (err: any) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ error: "Failed to load admin statistics" }, { status: 500 });
  }
}

