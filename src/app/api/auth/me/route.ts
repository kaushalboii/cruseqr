import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      avatar: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function PUT(request: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, avatar } = await request.json();

    const updated = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        avatar: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

