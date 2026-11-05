import { NextResponse } from "next/server";
import { generateQrSvg, encodeQrPayload, QrDesignConfig, QrType } from "@/lib/qr-engine";
import QRCode from "qrcode";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      content,
      qrType = "URL",
      format = "svg", // "svg" | "dataUrl"
      contentData,
      design = {},
    } = body;

    const payload = content || (contentData ? encodeQrPayload(qrType as QrType, contentData) : "https://cruseqr.com");

    const svg = generateQrSvg(payload, design as QrDesignConfig);

    if (format === "dataUrl") {
      const dataUrl = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: design.errorCorrectionLevel || "Q",
        margin: design.margin || 2,
        color: {
          dark: design.dotsColor || "#8B5CF6",
          light: design.backgroundColor || "#FFFFFF",
        },
      });

      return NextResponse.json({
        success: true,
        dataUrl,
        payload,
      });
    }

    if (format === "rawSvg") {
      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
        },
      });
    }

    return NextResponse.json({
      success: true,
      svg,
      payload,
    });
  } catch (err: any) {
    console.error("Render API error:", err);
    return NextResponse.json({ error: "Failed to render QR code" }, { status: 500 });
  }
}

