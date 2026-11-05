import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateShortCode } from "@/lib/utils";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.qrCode.findFirst({
    where: {
      id: params.id,
      userId: sessionUser.id,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "QR Code not found" }, { status: 404 });
  }

  const newShortCode = generateShortCode(7);

  const duplicated = await prisma.qrCode.create({
    data: {
      userId: sessionUser.id,
      title: `${existing.title} (Copy)`,
      description: existing.description,
      qrType: existing.qrType,
      isDynamic: existing.isDynamic,
      shortCode: newShortCode,
      destinationUrl: existing.destinationUrl,
      contentData: existing.contentData,
      designConfig: existing.designConfig,
      status: "ACTIVE",
      projectId: existing.projectId,
      folderId: existing.folderId,
      tags: existing.tags,
      totalScans: 0,
      uniqueScans: 0,
    },
    include: {
      project: true,
      folder: true,
    },
  });

  return NextResponse.json({ qrCode: duplicated });
}

