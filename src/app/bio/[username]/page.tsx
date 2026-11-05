import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  Sparkles,
  Share2,
  CheckCircle2,
  Globe,
  Mail,
  Phone,
  Calendar,
  Headphones,
  BookOpen,
  Coffee,
  Instagram,
  Twitter,
  Linkedin,
  Github,
  Youtube,
  Send,
} from "lucide-react";

interface BioPageProps {
  params: { username: string };
}

export default async function PublicBioPage({ params }: BioPageProps) {
  const { username } = params;

  const bioPage = await prisma.linkInBioPage.findUnique({
    where: { username: username.toLowerCase() },
    include: {
      links: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
      user: {
        select: { name: true, plan: true },
      },
    },
  });

  if (!bioPage) {
    notFound();
  }

  // Increment view counter
  await prisma.linkInBioPage.update({
    where: { id: bioPage.id },
    data: { views: { increment: 1 } },
  });

  let socials: Record<string, string> = {};
  try {
    if (bioPage.socialLinks) {
      socials = JSON.parse(bioPage.socialLinks);
    }
  } catch {}

  const themeStyles: Record<string, { bg: string; card: string; text: string; accent: string }> = {
    cosmic: {
      bg: "bg-gradient-to-b from-[#09090F] via-[#111122] to-[#0D0B18]",
      card: "bg-[#17172B]/80 hover:bg-[#1E1E38] border-[#2E2E48] text-white",
      text: "text-white",
      accent: "text-purple-400",
    },
    obsidian: {
      bg: "bg-gradient-to-b from-[#000000] via-[#0A0A0A] to-[#141414]",
      card: "bg-[#141414]/90 hover:bg-[#1F1F1F] border-[#2A2A2A] text-white",
      text: "text-white",
      accent: "text-zinc-400",
    },
    emerald: {
      bg: "bg-gradient-to-b from-[#041A14] via-[#07241C] to-[#041410]",
      card: "bg-[#093327]/80 hover:bg-[#0D4434] border-[#135E49] text-white",
      text: "text-white",
      accent: "text-emerald-400",
    },
    sunset: {
      bg: "bg-gradient-to-b from-[#1C0A1E] via-[#2A0E2B] to-[#120614]",
      card: "bg-[#331336]/80 hover:bg-[#461A4A] border-[#57225D] text-white",
      text: "text-white",
      accent: "text-pink-400",
    },
  };

  const currentTheme = themeStyles[bioPage.theme] || themeStyles.cosmic;

  return (
    <div className={`min-h-screen ${currentTheme.bg} flex flex-col items-center justify-between p-4 py-12 text-white relative selection:bg-primary selection:text-white`}>
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="w-full max-w-md mx-auto z-10 flex flex-col items-center">
        {/* Profile Avatar */}
        <div className="relative mb-4 group">
          <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-primary to-accent-cyan shadow-glow">
            {bioPage.avatarUrl ? (
              <img
                src={bioPage.avatarUrl}
                alt={bioPage.title}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-[#171724] rounded-full flex items-center justify-center text-3xl font-bold">
                {bioPage.title.charAt(0)}
              </div>
            )}
          </div>
        </div>

        {/* Name & Handle */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-white">{bioPage.title}</h1>
            <CheckCircle2 className="w-5 h-5 text-primary fill-primary/20" />
          </div>
          <p className="text-sm text-text-secondary font-medium">@{bioPage.username}</p>

          {bioPage.bio && (
            <p className="text-sm text-zinc-300 mt-3 max-w-xs mx-auto leading-relaxed">
              {bioPage.bio}
            </p>
          )}
        </div>

        {/* Links list */}
        <div className="w-full space-y-3.5 mb-8">
          {bioPage.links.length === 0 ? (
            <div className="text-center py-8 text-sm text-text-muted">No links published yet.</div>
          ) : (
            bioPage.links.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full p-4 rounded-2xl border ${currentTheme.card} transition-all duration-200 transform hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-between shadow-lg backdrop-blur-md group`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    {getLinkIcon(link.icon || link.title)}
                  </div>
                  <span className="font-medium text-sm text-white group-hover:text-primary-light transition-colors">
                    {link.title}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
              </a>
            ))
          )}
        </div>

        {/* Social Icons row */}
        {Object.keys(socials).length > 0 && (
          <div className="flex items-center justify-center gap-4 mb-8">
            {socials.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            {socials.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
            {socials.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {socials.github && (
              <a
                href={socials.github}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {socials.youtube && (
              <a
                href={socials.youtube}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </main>

      {/* Powered by CruseQR Footer Pill */}
      <footer className="z-10 mt-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-400 hover:text-white transition-all backdrop-blur-md"
        >
          <div className="w-4 h-4 rounded-md bg-primary flex items-center justify-center text-white text-[10px] font-bold">
            C
          </div>
          <span>Create your own free page with <strong>CruseQR</strong></span>
        </Link>
      </footer>
    </div>
  );
}

function getLinkIcon(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes("globe") || lower.includes("portfolio") || lower.includes("website")) return <Globe className="w-4 h-4" />;
  if (lower.includes("podcast") || lower.includes("headphones") || lower.includes("music") || lower.includes("spotify")) return <Headphones className="w-4 h-4" />;
  if (lower.includes("book") || lower.includes("read") || lower.includes("guide")) return <BookOpen className="w-4 h-4" />;
  if (lower.includes("coffee") || lower.includes("chat") || lower.includes("calendly")) return <Coffee className="w-4 h-4" />;
  if (lower.includes("mail") || lower.includes("newsletter")) return <Mail className="w-4 h-4" />;
  return <Sparkles className="w-4 h-4" />;
}

