const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CruseQR database...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const demoPassword = await bcrypt.hash('Demo@123456', 10);

  // Clean existing data for clean seed
  await prisma.qrScan.deleteMany();
  await prisma.linkItem.deleteMany();
  await prisma.linkInBioPage.deleteMany();
  await prisma.digitalBusinessCard.deleteMany();
  await prisma.aiQrGeneration.deleteMany();
  await prisma.qrCode.deleteMany();
  await prisma.folder.deleteMany();
  await prisma.project.deleteMany();
  await prisma.template.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

  // Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@cruseqr.com',
      passwordHash: adminPassword,
      name: 'CruseQR Admin',
      role: 'ADMIN',
      plan: 'ENTERPRISE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // Create Demo User
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@cruseqr.com',
      passwordHash: demoPassword,
      name: 'Alex Morgan',
      role: 'USER',
      plan: 'PRO',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    },
  });

  // Create Subscription for demo user
  await prisma.subscription.create({
    data: {
      userId: demoUser.id,
      plan: 'PRO',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Create Projects
  const projectMarketing = await prisma.project.create({
    data: {
      userId: demoUser.id,
      name: 'Summer Campaign 2026',
      description: 'Outdoor billboards and digital media QR codes',
      color: '#8B5CF6',
    },
  });

  const projectRetail = await prisma.project.create({
    data: {
      userId: demoUser.id,
      name: 'Retail Store Displays',
      description: 'In-store product discovery and Wi-Fi access',
      color: '#10B981',
    },
  });

  // Create Folders
  const folderFlyers = await prisma.folder.create({
    data: {
      userId: demoUser.id,
      projectId: projectMarketing.id,
      name: 'Printed Flyers',
    },
  });

  const folderPackaging = await prisma.folder.create({
    data: {
      userId: demoUser.id,
      projectId: projectMarketing.id,
      name: 'Product Packaging',
    },
  });

  // Create Sample QR Codes
  const qr1 = await prisma.qrCode.create({
    data: {
      userId: demoUser.id,
      projectId: projectMarketing.id,
      folderId: folderFlyers.id,
      title: 'Summer Launch Page',
      description: 'Main promotional campaign landing page',
      qrType: 'URL',
      isDynamic: true,
      shortCode: 'summer26',
      destinationUrl: 'https://cruseqr.com/features',
      contentData: JSON.stringify({ url: 'https://cruseqr.com/features' }),
      designConfig: JSON.stringify({
        dotsColor: '#8B5CF6',
        backgroundColor: '#FFFFFF',
        dotsType: 'rounded',
        cornersSquareType: 'extra-rounded',
        cornersDotType: 'dot',
        frame: 'bottom-banner',
        frameText: 'SCAN FOR 20% OFF',
        frameColor: '#8B5CF6',
        errorCorrectionLevel: 'Q',
      }),
      status: 'ACTIVE',
      totalScans: 148,
      uniqueScans: 112,
      tags: 'campaign,summer,flyer',
    },
  });

  const qr2 = await prisma.qrCode.create({
    data: {
      userId: demoUser.id,
      projectId: projectRetail.id,
      title: 'Store Guest Wi-Fi',
      description: 'Instant Wi-Fi connection for flagship store visitors',
      qrType: 'WIFI',
      isDynamic: true,
      shortCode: 'wifi-guest',
      destinationUrl: 'https://cruseqr.com/welcome-wifi',
      contentData: JSON.stringify({
        ssid: 'CruseFlagship_Guest',
        password: 'WelcomeCruse2026',
        encryption: 'WPA',
        hidden: false,
      }),
      designConfig: JSON.stringify({
        dotsColor: '#10B981',
        backgroundColor: '#FFFFFF',
        dotsType: 'dots',
        cornersSquareType: 'dot',
        cornersDotType: 'dot',
        frame: 'badge',
        frameText: 'FREE WI-FI',
        frameColor: '#10B981',
        errorCorrectionLevel: 'M',
      }),
      status: 'ACTIVE',
      totalScans: 312,
      uniqueScans: 245,
      tags: 'wifi,store,guest',
    },
  });

  const qr3 = await prisma.qrCode.create({
    data: {
      userId: demoUser.id,
      title: 'Alex Morgan vCard',
      description: 'Personal executive contact card',
      qrType: 'VCARD',
      isDynamic: true,
      shortCode: 'alex-contact',
      destinationUrl: 'https://cruseqr.com/card/alex-morgan',
      contentData: JSON.stringify({
        firstName: 'Alex',
        lastName: 'Morgan',
        title: 'VP of Product',
        company: 'Cruse Innovations',
        phone: '+1 (555) 234-5678',
        email: 'alex@cruseqr.com',
        website: 'https://cruseqr.com',
      }),
      designConfig: JSON.stringify({
        dotsColor: '#3B82F6',
        backgroundColor: '#FFFFFF',
        dotsType: 'classy',
        cornersSquareType: 'square',
        cornersDotType: 'square',
        frame: 'phone',
        frameText: 'SAVE CONTACT',
        frameColor: '#3B82F6',
        errorCorrectionLevel: 'H',
      }),
      status: 'ACTIVE',
      totalScans: 89,
      uniqueScans: 74,
      tags: 'vcard,contact,business',
    },
  });

  // Seed realistic scan events for analytics
  const devices = ['mobile', 'mobile', 'mobile', 'desktop', 'tablet'];
  const osList = ['iOS', 'iOS', 'Android', 'macOS', 'Windows'];
  const browsers = ['Safari', 'Chrome', 'Chrome', 'Firefox', 'Edge'];
  const countries = ['United States', 'United Kingdom', 'Germany', 'Canada', 'France', 'Japan'];
  const cities = ['New York', 'London', 'Berlin', 'Toronto', 'Paris', 'Tokyo'];

  const now = Date.now();
  const scanData = [];

  for (let i = 0; i < 60; i++) {
    // Generate scans over the last 14 days
    const daysAgo = Math.floor(Math.random() * 14);
    const hoursAgo = Math.floor(Math.random() * 24);
    const timestamp = new Date(now - (daysAgo * 24 + hoursAgo) * 3600 * 1000);
    const randIdx = Math.floor(Math.random() * countries.length);

    scanData.push({
      qrCodeId: qr1.id,
      timestamp,
      ipHash: `anon_${Math.random().toString(36).substring(2, 10)}`,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      deviceType: devices[Math.floor(Math.random() * devices.length)],
      os: osList[Math.floor(Math.random() * osList.length)],
      browser: browsers[Math.floor(Math.random() * browsers.length)],
      country: countries[randIdx],
      city: cities[randIdx],
      referer: i % 3 === 0 ? 'instagram.com' : i % 5 === 0 ? 'linkedin.com' : 'direct',
    });
  }

  for (const s of scanData) {
    await prisma.qrScan.create({ data: s });
  }

  // Create Link-in-Bio page (like tree.icqr.com)
  const bioPage = await prisma.linkInBioPage.create({
    data: {
      userId: demoUser.id,
      username: 'alexmorgan',
      title: 'Alex Morgan | Product & Design',
      bio: 'Creating next-gen experiences. Exploring AI, interactive design, and product architecture. Say hello! ✨',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200',
      theme: 'cosmic',
      buttonStyle: 'rounded',
      views: 1240,
      socialLinks: JSON.stringify({
        twitter: 'https://x.com/alexmorgan',
        github: 'https://github.com',
        linkedin: 'https://linkedin.com/in/alexmorgan',
        instagram: 'https://instagram.com/alexmorgan',
        youtube: 'https://youtube.com',
      }),
    },
  });

  // Bio page links
  await prisma.linkItem.createMany({
    data: [
      {
        bioPageId: bioPage.id,
        title: '🚀 Try CruseQR Platform',
        url: 'https://cruseqr.com',
        icon: 'Sparkles',
        type: 'LINK',
        order: 0,
        clicks: 432,
      },
      {
        bioPageId: bioPage.id,
        title: '🎙️ Latest Podcast: The Future of QR & AI',
        url: 'https://spotify.com',
        icon: 'Headphones',
        type: 'LINK',
        order: 1,
        clicks: 289,
      },
      {
        bioPageId: bioPage.id,
        title: '📖 Read My Design Systems Guide',
        url: 'https://cruseqr.com/features',
        icon: 'BookOpen',
        type: 'LINK',
        order: 2,
        clicks: 198,
      },
      {
        bioPageId: bioPage.id,
        title: '☕ Schedule a 1:1 Coffee Chat',
        url: 'https://calendly.com',
        icon: 'Coffee',
        type: 'LINK',
        order: 3,
        clicks: 154,
      },
    ],
  });

  // Create Digital Business Card
  await prisma.digitalBusinessCard.create({
    data: {
      userId: demoUser.id,
      slug: 'alex-morgan',
      fullName: 'Alex Morgan',
      jobTitle: 'VP of Product Experience',
      company: 'CruseQR Technologies',
      email: 'alex@cruseqr.com',
      phone: '+1 (555) 234-5678',
      website: 'https://cruseqr.com',
      address: 'San Francisco, CA',
      bio: 'Passionate about seamless connectivity, brand design, and modern web software.',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
      bannerColor: '#8B5CF6',
      views: 342,
      saves: 89,
      socials: JSON.stringify({
        linkedin: 'https://linkedin.com',
        twitter: 'https://x.com',
        github: 'https://github.com',
      }),
    },
  });

  // Create AI QR Art generation demo
  await prisma.aiQrGeneration.create({
    data: {
      userId: demoUser.id,
      prompt: 'Cyberpunk neon city street with glowing violet light trails and rainy reflections',
      stylePreset: 'Cyberpunk',
      destinationUrl: 'https://cruseqr.com',
      qrData: 'https://cruseqr.com',
      resultImageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
      scannabilityScore: 98.4,
      status: 'COMPLETED',
    },
  });

  // Create Curated Templates
  const templates = [
    {
      title: 'Bistro & Cafe Digital Menu',
      category: 'RESTAURANT',
      description: 'Elegant amber & charcoal styling for contactless tabletop dining menus.',
      qrType: 'URL',
      previewColor: '#F59E0B',
      designConfig: JSON.stringify({
        dotsColor: '#F59E0B',
        backgroundColor: '#FFFFFF',
        dotsType: 'rounded',
        cornersSquareType: 'extra-rounded',
        frame: 'bottom-banner',
        frameText: 'SCAN FOR MENU',
      }),
      isFeatured: true,
    },
    {
      title: 'VIP Tech Conference Pass',
      category: 'EVENT',
      description: 'Cyber purple with badge frame for ticket check-in and attendee badges.',
      qrType: 'EVENT',
      previewColor: '#8B5CF6',
      designConfig: JSON.stringify({
        dotsColor: '#8B5CF6',
        backgroundColor: '#FFFFFF',
        dotsType: 'classy',
        cornersSquareType: 'dot',
        frame: 'badge',
        frameText: 'VIP ACCESS',
      }),
      isFeatured: true,
    },
    {
      title: 'Store Guest High-Speed Wi-Fi',
      category: 'RETAIL',
      description: 'Emerald green with instant connect frame for retail stores and showrooms.',
      qrType: 'WIFI',
      previewColor: '#10B981',
      designConfig: JSON.stringify({
        dotsColor: '#10B981',
        backgroundColor: '#FFFFFF',
        dotsType: 'dots',
        cornersSquareType: 'square',
        frame: 'bottom-banner',
        frameText: 'FREE HIGH-SPEED WI-FI',
      }),
      isFeatured: true,
    },
    {
      title: 'Executive Digital Business Card',
      category: 'BUSINESS',
      description: 'Sleek obsidian & cobalt palette with phone frame to save contact instantly.',
      qrType: 'VCARD',
      previewColor: '#3B82F6',
      designConfig: JSON.stringify({
        dotsColor: '#2563EB',
        backgroundColor: '#FFFFFF',
        dotsType: 'classy-rounded',
        cornersSquareType: 'extra-rounded',
        frame: 'phone',
        frameText: 'SAVE CONTACT',
      }),
      isFeatured: true,
    },
    {
      title: 'Creator Social Link-In-Bio',
      category: 'PERSONAL',
      description: 'Gradient sunset theme with phone mockup frame for Instagram and TikTok bios.',
      qrType: 'BIO',
      previewColor: '#EC4899',
      designConfig: JSON.stringify({
        dotsColor: '#EC4899',
        backgroundColor: '#FFFFFF',
        dotsType: 'rounded',
        cornersSquareType: 'dot',
        frame: 'badge',
        frameText: 'VISIT MY LINKS',
      }),
      isFeatured: true,
    },
    {
      title: 'Healthcare Patient Portal',
      category: 'HEALTHCARE',
      description: 'Clean medical cyan styling for safe patient check-in and clinic forms.',
      qrType: 'URL',
      previewColor: '#06B6D4',
      designConfig: JSON.stringify({
        dotsColor: '#0891B2',
        backgroundColor: '#FFFFFF',
        dotsType: 'square',
        cornersSquareType: 'square',
        frame: 'bottom-banner',
        frameText: 'PATIENT CHECK-IN',
      }),
      isFeatured: false,
    },
    {
      title: 'Boutique Hotel Keyless Check-in',
      category: 'HOSPITALITY',
      description: 'Gold and slate aesthetic for luxury guest services and concierge.',
      qrType: 'URL',
      previewColor: '#D97706',
      designConfig: JSON.stringify({
        dotsColor: '#B45309',
        backgroundColor: '#FFFFFF',
        dotsType: 'classy',
        cornersSquareType: 'extra-rounded',
        frame: 'bottom-banner',
        frameText: 'ROOM CONCIERGE',
      }),
      isFeatured: false,
    },
  ];

  for (const t of templates) {
    await prisma.template.create({ data: t });
  }

  console.log('✅ Database seeded successfully!');
  console.log('Admin account: admin@cruseqr.com / Admin@123456');
  console.log('Demo account:  demo@cruseqr.com  / Demo@123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

