import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let card = await prisma.digitalBusinessCard.findFirst({
    where: { userId: sessionUser.id },
  });

  if (!card) {
    const slug = `${sessionUser.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Math.floor(Math.random() * 900 + 100)}`;
    card = await prisma.digitalBusinessCard.create({
      data: {
        userId: sessionUser.id,
        slug,
        fullName: sessionUser.name,
        jobTitle: "Founder & Creator",
        company: "CruseQR Innovations",
        email: sessionUser.email,
        phone: "+1 (555) 019-2834",
        website: "https://cruseqr.com",
        address: "San Francisco, California",
        bio: "Connecting people with high-impact QR experiences, digital links, and modern design.",
        avatarUrl: sessionUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300",
        bannerColor: "#8B5CF6",
        socials: JSON.stringify({
          linkedin: "https://linkedin.com",
          twitter: "https://x.com",
          github: "https://github.com",
        }),
      },
    });
  }

  return NextResponse.json({ card });
}

export async function PUT(request: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      fullName,
      jobTitle,
      company,
      email,
      phone,
      website,
      address,
      bio,
      avatarUrl,
      bannerColor,
      socials,
    } = body;

    let card = await prisma.digitalBusinessCard.findFirst({
      where: { userId: sessionUser.id },
    });

    if (!card) {
      const slug = `${(fullName || sessionUser.name).toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Math.floor(Math.random() * 900 + 100)}`;
      card = await prisma.digitalBusinessCard.create({
        data: {
          userId: sessionUser.id,
          slug,
          fullName: fullName || sessionUser.name,
          email: email || sessionUser.email,
        },
      });
    }

    const updated = await prisma.digitalBusinessCard.update({
      where: { id: card.id },
      data: {
        ...(fullName !== undefined ? { fullName: fullName.trim() } : {}),
        ...(jobTitle !== undefined ? { jobTitle: jobTitle?.trim() || null } : {}),
        ...(company !== undefined ? { company: company?.trim() || null } : {}),
        ...(email !== undefined ? { email: email.trim() } : {}),
        ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
        ...(website !== undefined ? { website: website?.trim() || null } : {}),
        ...(address !== undefined ? { address: address?.trim() || null } : {}),
        ...(bio !== undefined ? { bio: bio?.trim() || null } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        ...(bannerColor !== undefined ? { bannerColor } : {}),
        ...(socials !== undefined ? { socials: JSON.stringify(socials) } : {}),
      },
    });

    return NextResponse.json({ card: updated });
  } catch (err: any) {
    console.error("Update card error:", err);
    return NextResponse.json({ error: "Failed to update business card" }, { status: 500 });
  }
}

