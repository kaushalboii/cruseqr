import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, ids, targetProjectId, targetFolderId } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "IDs array is required" }, { status: 400 });
    }

    if (action === "delete") {
      await prisma.qrCode.deleteMany({
        where: {
          id: { in: ids },
          userId: sessionUser.id,
        },
      });
      return NextResponse.json({ success: true, count: ids.length });
    }

    if (action === "pause") {
      await prisma.qrCode.updateMany({
        where: {
          id: { in: ids },
          userId: sessionUser.id,
        },
        data: { status: "PAUSED" },
      });
      return NextResponse.json({ success: true, count: ids.length });
    }

    if (action === "activate") {
      await prisma.qrCode.updateMany({
        where: {
          id: { in: ids },
          userId: sessionUser.id,
        },
        data: { status: "ACTIVE" },
      });
      return NextResponse.json({ success: true, count: ids.length });
    }

    if (action === "move") {
      await prisma.qrCode.updateMany({
        where: {
          id: { in: ids },
          userId: sessionUser.id,
        },
        data: {
          projectId: targetProjectId || null,
          folderId: targetFolderId || null,
        },
      });
      return NextResponse.json({ success: true, count: ids.length });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Bulk action error:", err);
    return NextResponse.json({ error: "Failed to perform bulk action" }, { status: 500 });
  }
}

