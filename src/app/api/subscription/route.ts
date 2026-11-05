import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: { userId: sessionUser.id },
    orderBy: { createdAt: "desc" },
  });

  const qrCount = await prisma.qrCode.count({
    where: { userId: sessionUser.id },
  });

  const dynamicQrCount = await prisma.qrCode.count({
    where: { userId: sessionUser.id, isDynamic: true },
  });

  return NextResponse.json({
    plan: sessionUser.plan || "FREE",
    subscription,
    usage: {
      qrCodesCreated: qrCount,
      dynamicQrCodes: dynamicQrCount,
      aiGenerations: await prisma.aiQrGeneration.count({ where: { userId: sessionUser.id } }),
    },
  });
}

export async function POST(request: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { targetPlan } = await request.json();
    const validPlans = ["FREE", "PRO", "BUSINESS", "ENTERPRISE"];

    if (!validPlans.includes(targetPlan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Update user plan
    const updatedUser = await prisma.user.update({
      where: { id: sessionUser.id },
      data: { plan: targetPlan },
    });

    // Update or create subscription record
    await prisma.subscription.create({
      data: {
        userId: sessionUser.id,
        plan: targetPlan,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      plan: updatedUser.plan,
    });
  } catch (err: any) {
    console.error("Subscription update error:", err);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}

