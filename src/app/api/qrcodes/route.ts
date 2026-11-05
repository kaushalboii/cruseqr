import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateShortCode } from "@/lib/utils";
import { encodeQrPayload, QrType } from "@/lib/qr-engine";

export async function GET(request: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const qrType = searchParams.get("type");
  const status = searchParams.get("status");
  const projectId = searchParams.get("projectId");
  const folderId = searchParams.get("folderId");
  const sort = searchParams.get("sort") || "newest";

  const whereClause: any = {
    userId: sessionUser.id,
  };

  if (search) {
    whereClause.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { tags: { contains: search } },
      { destinationUrl: { contains: search } },
    ];
  }

  if (qrType && qrType !== "ALL") {
    whereClause.qrType = qrType;
  }

  if (status && status !== "ALL") {
    whereClause.status = status;
  }

  if (projectId) {
    whereClause.projectId = projectId;
  }

  if (folderId) {
    whereClause.folderId = folderId;
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };
  else if (sort === "scans") orderBy = { totalScans: "desc" };
  else if (sort === "title") orderBy = { title: "asc" };

  try {
    const qrCodes = await prisma.qrCode.findMany({
      where: whereClause,
      include: {
        project: { select: { id: true, name: true, color: true } },
        folder: { select: { id: true, name: true } },
      },
      orderBy,
    });

    return NextResponse.json({ qrCodes });
  } catch (err: any) {
    console.error("Fetch QR codes error:", err);
    return NextResponse.json({ error: "Failed to fetch QR codes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      qrType = "URL",
      isDynamic = true,
      contentData = {},
      designConfig = {},
      projectId,
      folderId,
      expiresAt,
      password,
      tags,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Generate unique short code for dynamic redirect
    let shortCode = generateShortCode(7);
    let collision = await prisma.qrCode.findUnique({ where: { shortCode } });
    while (collision) {
      shortCode = generateShortCode(8);
      collision = await prisma.qrCode.findUnique({ where: { shortCode } });
    }

    // Determine destination URL
    const destinationUrl = isDynamic
      ? contentData.url || contentData.destinationUrl || encodeQrPayload(qrType as QrType, contentData)
      : encodeQrPayload(qrType as QrType, contentData);

    const qrCode = await prisma.qrCode.create({
      data: {
        userId: sessionUser.id,
        title: title.trim(),
        description: description?.trim() || null,
        qrType,
        isDynamic,
        shortCode,
        destinationUrl,
        contentData: JSON.stringify(contentData),
        designConfig: JSON.stringify(designConfig),
        status: "ACTIVE",
        projectId: projectId || null,
        folderId: folderId || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        password: password?.trim() || null,
        tags: tags || null,
      },
      include: {
        project: true,
        folder: true,
      },
    });

    return NextResponse.json({ qrCode }, { status: 201 });
  } catch (err: any) {
    console.error("Create QR error:", err);
    return NextResponse.json({ error: "Failed to create QR code" }, { status: 500 });
  }
}

