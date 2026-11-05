import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encodeQrPayload, QrType } from "@/lib/qr-engine";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const qrCode = await prisma.qrCode.findFirst({
    where: {
      id: params.id,
      userId: sessionUser.id,
    },
    include: {
      project: true,
      folder: true,
      scans: {
        take: 50,
        orderBy: { timestamp: "desc" },
      },
    },
  });

  if (!qrCode) {
    return NextResponse.json({ error: "QR Code not found" }, { status: 404 });
  }

  return NextResponse.json({ qrCode });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await prisma.qrCode.findFirst({
      where: {
        id: params.id,
        userId: sessionUser.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "QR Code not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      title,
      description,
      destinationUrl,
      contentData,
      designConfig,
      status,
      projectId,
      folderId,
      expiresAt,
      password,
      tags,
    } = body;

    let computedDestination = destinationUrl;
    if (contentData && !computedDestination) {
      computedDestination = encodeQrPayload(existing.qrType as QrType, contentData);
    }

    const updated = await prisma.qrCode.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
        ...(computedDestination !== undefined ? { destinationUrl: computedDestination } : {}),
        ...(contentData !== undefined ? { contentData: JSON.stringify(contentData) } : {}),
        ...(designConfig !== undefined ? { designConfig: JSON.stringify(designConfig) } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(projectId !== undefined ? { projectId: projectId || null } : {}),
        ...(folderId !== undefined ? { folderId: folderId || null } : {}),
        ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
        ...(password !== undefined ? { password: password?.trim() || null } : {}),
        ...(tags !== undefined ? { tags: tags || null } : {}),
      },
      include: {
        project: true,
        folder: true,
      },
    });

    return NextResponse.json({ qrCode: updated });
  } catch (err: any) {
    console.error("Update QR error:", err);
    return NextResponse.json({ error: "Failed to update QR code" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await prisma.qrCode.findFirst({
      where: {
        id: params.id,
        userId: sessionUser.id,
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "QR Code not found" }, { status: 404 });
    }

    await prisma.qrCode.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete QR error:", err);
    return NextResponse.json({ error: "Failed to delete QR code" }, { status: 500 });
  }
}

