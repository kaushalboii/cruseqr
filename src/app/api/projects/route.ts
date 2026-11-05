import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { userId: sessionUser.id },
    include: {
      folders: true,
      _count: {
        select: { qrCodes: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description, color } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        userId: sessionUser.id,
        name: name.trim(),
        description: description?.trim() || null,
        color: color || "#8B5CF6",
      },
      include: {
        folders: true,
        _count: { select: { qrCodes: true } },
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

