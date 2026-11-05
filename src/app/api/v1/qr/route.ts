import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateShortCode } from "@/lib/utils";
import { generateQrSvg, encodeQrPayload, QrType } from "@/lib/qr-engine";

export async function GET(request: Request) {
  const user = await getSession(request);
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized. Provide 'x-api-key' or 'Authorization: Bearer <key>'" },
      { status: 401 }
    );
  }

  const qrCodes = await prisma.qrCode.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      shortCode: true,
      qrType: true,
      isDynamic: true,
      destinationUrl: true,
      status: true,
      totalScans: true,
      createdAt: true,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const enriched = qrCodes.map((q) => ({
    ...q,
    shortUrl: `${baseUrl}/r/${q.shortCode}`,
  }));

  return NextResponse.json({
    success: true,
    count: enriched.length,
    qrCodes: enriched,
  });
}

export async function POST(request: Request) {
  const user = await getSession(request);
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized. Provide 'x-api-key' or 'Authorization: Bearer <key>'" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const {
      title,
      destinationUrl,
      qrType = "URL",
      isDynamic = true,
      contentData = {},
      designConfig = {},
      password,
      expiresAt,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const shortCode = generateShortCode(7);
    const resolvedUrl = destinationUrl || contentData.url || encodeQrPayload(qrType as QrType, contentData);

    const qrCode = await prisma.qrCode.create({
      data: {
        userId: user.id,
        title: title.trim(),
        qrType,
        isDynamic,
        shortCode,
        destinationUrl: resolvedUrl,
        contentData: JSON.stringify(contentData),
        designConfig: JSON.stringify(designConfig),
        status: "ACTIVE",
        password: password?.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shortUrl = `${baseUrl}/r/${shortCode}`;
    const svg = generateQrSvg(isDynamic ? shortUrl : resolvedUrl, designConfig);

    return NextResponse.json(
      {
        success: true,
        qrCode: {
          id: qrCode.id,
          title: qrCode.title,
          shortCode: qrCode.shortCode,
          shortUrl,
          destinationUrl: qrCode.destinationUrl,
          isDynamic: qrCode.isDynamic,
          status: qrCode.status,
          totalScans: 0,
        },
        svg,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("V1 create QR error:", err);
    return NextResponse.json({ error: "Failed to create QR code" }, { status: 500 });
  }
}
