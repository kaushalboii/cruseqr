import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const folders = await prisma.folder.findMany({
    where: { userId: sessionUser.id },
    include: {
      project: true,
      _count: { select: { qrCodes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ folders });
}

export async function POST(request: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, projectId } = await request.json();
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    const folder = await prisma.folder.create({
      data: {
        userId: sessionUser.id,
        name: name.trim(),
        projectId: projectId || null,
      },
      include: {
        project: true,
        _count: { select: { qrCodes: true } },
      },
    });

    return NextResponse.json({ folder }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}

