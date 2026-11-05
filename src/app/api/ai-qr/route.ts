import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAiQrArt, AI_STYLE_PRESETS } from "@/lib/ai-qr";

export async function GET() {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const generations = await prisma.aiQrGeneration.findMany({
    where: { userId: sessionUser.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json({
    generations,
    presets: AI_STYLE_PRESETS,
  });
}

export async function POST(request: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { destinationUrl, prompt, stylePresetId, customColors } = await request.json();

    if (!destinationUrl || !destinationUrl.trim()) {
      return NextResponse.json({ error: "Destination URL is required" }, { status: 400 });
    }

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: "Creative prompt is required" }, { status: 400 });
    }

    const result = await generateAiQrArt({
      destinationUrl: destinationUrl.trim(),
      prompt: prompt.trim(),
      stylePresetId: stylePresetId || "cyberpunk",
      customColors,
    });

    const record = await prisma.aiQrGeneration.create({
      data: {
        userId: sessionUser.id,
        prompt: prompt.trim(),
        stylePreset: result.stylePreset.name,
        destinationUrl: destinationUrl.trim(),
        qrData: destinationUrl.trim(),
        resultImageUrl: result.imageUrl,
        scannabilityScore: result.scannability.score,
        status: "COMPLETED",
        parameters: JSON.stringify({
          stylePresetId,
          customColors,
          scannability: result.scannability,
        }),
      },
    });

    return NextResponse.json({
      generation: record,
      scannability: result.scannability,
      svg: result.svg,
      imageUrl: result.imageUrl,
    });
  } catch (err: any) {
    console.error("AI QR generation error:", err);
    return NextResponse.json({ error: "Failed to generate AI QR art" }, { status: 500 });
  }
}

