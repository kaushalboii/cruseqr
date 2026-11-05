import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const whereClause: any = {};
  if (category && category !== "ALL") {
    whereClause.category = category;
  }

  const templates = await prisma.template.findMany({
    where: whereClause,
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ templates });
}

