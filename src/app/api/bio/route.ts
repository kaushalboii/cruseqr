import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let bioPage = await prisma.linkInBioPage.findFirst({
    where: { userId: sessionUser.id },
    include: {
      links: {
        orderBy: { order: "asc" },
      },
    },
  });

  // If user doesn't have a bio page yet, initialize one
  if (!bioPage) {
    const baseSlug = sessionUser.name.toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
    let username = baseSlug;
    let existing = await prisma.linkInBioPage.findUnique({ where: { username } });
    if (existing) {
      username = `${baseSlug}${Math.floor(Math.random() * 900 + 100)}`;
    }

    bioPage = await prisma.linkInBioPage.create({
      data: {
        userId: sessionUser.id,
        username,
        title: sessionUser.name,
        bio: "Welcome to my official links! Explore my portfolio, social media, and latest work.",
        avatarUrl: sessionUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300",
        theme: "cosmic",
        buttonStyle: "rounded",
        socialLinks: JSON.stringify({
          twitter: "https://x.com",
          linkedin: "https://linkedin.com",
          instagram: "https://instagram.com",
        }),
      },
      include: {
        links: true,
      },
    });

    // Add 2 default links
    await prisma.linkItem.createMany({
      data: [
        {
          bioPageId: bioPage.id,
          title: "My Portfolio Website",
          url: "https://cruseqr.com",
          icon: "Globe",
          order: 0,
        },
        {
          bioPageId: bioPage.id,
          title: "Schedule a Consultation",
          url: "https://calendly.com",
          icon: "Calendar",
          order: 1,
        },
      ],
    });

    bioPage = await prisma.linkInBioPage.findUnique({
      where: { id: bioPage.id },
      include: { links: { orderBy: { order: "asc" } } },
    });
  }

  return NextResponse.json({ bioPage });
}

export async function PUT(request: Request) {
  const sessionUser = await getSession();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { username, title, bio, avatarUrl, bannerUrl, theme, buttonStyle, socialLinks, links } = body;

    const current = await prisma.linkInBioPage.findFirst({
      where: { userId: sessionUser.id },
    });

    if (!current) {
      return NextResponse.json({ error: "Bio page not found" }, { status: 404 });
    }

    // Check username uniqueness if changed
    if (username && username !== current.username) {
      const taken = await prisma.linkInBioPage.findUnique({
        where: { username: username.toLowerCase().trim() },
      });
      if (taken && taken.id !== current.id) {
        return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
      }
    }

    const updated = await prisma.linkInBioPage.update({
      where: { id: current.id },
      data: {
        ...(username ? { username: username.toLowerCase().trim() } : {}),
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(bio !== undefined ? { bio: bio?.trim() || null } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        ...(bannerUrl !== undefined ? { bannerUrl } : {}),
        ...(theme !== undefined ? { theme } : {}),
        ...(buttonStyle !== undefined ? { buttonStyle } : {}),
        ...(socialLinks !== undefined ? { socialLinks: JSON.stringify(socialLinks) } : {}),
      },
    });

    // If links are provided, update them
    if (Array.isArray(links)) {
      await prisma.linkItem.deleteMany({
        where: { bioPageId: current.id },
      });

      for (let i = 0; i < links.length; i++) {
        const item = links[i];
        if (item.title && item.url) {
          await prisma.linkItem.create({
            data: {
              bioPageId: current.id,
              title: item.title.trim(),
              url: item.url.trim(),
              icon: item.icon || "Link",
              type: item.type || "LINK",
              order: i,
              clicks: item.clicks || 0,
              isActive: item.isActive !== false,
            },
          });
        }
      }
    }

    const fullBio = await prisma.linkInBioPage.findUnique({
      where: { id: current.id },
      include: { links: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ bioPage: fullBio });
  } catch (err: any) {
    console.error("Update bio error:", err);
    return NextResponse.json({ error: "Failed to update bio page" }, { status: 500 });
  }
}

