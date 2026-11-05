import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Download,
  Share2,
  Building,
  Briefcase,
  QrCode as QrIcon,
} from "lucide-react";
import { generateQrSvg } from "@/lib/qr-engine";

interface CardPageProps {
  params: { slug: string };
}

export default async function PublicCardPage({ params }: CardPageProps) {
  const { slug } = params;

  const card = await prisma.digitalBusinessCard.findUnique({
    where: { slug },
  });

  if (!card) {
    notFound();
  }

  // Increment views
  await prisma.digitalBusinessCard.update({
    where: { id: card.id },
    data: { views: { increment: 1 } },
  });

  // Prepare vCard 3.0 content
  const vcardText = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${card.fullName}`,
    card.company ? `ORG:${card.company}` : "",
    card.jobTitle ? `TITLE:${card.jobTitle}` : "",
    card.phone ? `TEL;TYPE=CELL:${card.phone}` : "",
    card.email ? `EMAIL:${card.email}` : "",
    card.website ? `URL:${card.website}` : "",
    card.address ? `ADR;TYPE=WORK:;;${card.address};;;;` : "",
    card.bio ? `NOTE:${card.bio}` : "",
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");

  const vcfDataUri = `data:text/vcard;charset=utf-8,${encodeURIComponent(vcardText)}`;

  // Generate QR for this page URL
  const qrSvg = generateQrSvg(`https://cruseqr.com/card/${card.slug}`, {
    dotsColor: card.bannerColor || "#8B5CF6",
    backgroundColor: "#FFFFFF",
    dotsType: "classy",
    cornersSquareType: "extra-rounded",
    cornersDotType: "dot",
    margin: 2,
  });

  return (
    <div className="min-h-screen bg-[#09090F] flex flex-col items-center justify-between p-4 py-10 text-white selection:bg-primary selection:text-white">
      <main className="w-full max-w-md bg-[#171724] border border-[#272738] rounded-3xl overflow-hidden shadow-2xl relative">
        {/* Banner Top */}
        <div
          className="h-32 w-full relative"
          style={{
            background: `linear-gradient(135deg, ${card.bannerColor || "#8B5CF6"}, #09090F)`,
          }}
        >
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
        </div>

        {/* Profile Info Section */}
        <div className="px-6 pb-6 relative -mt-14 flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full border-4 border-[#171724] overflow-hidden bg-[#11111B] shadow-lg mb-3">
            {card.avatarUrl ? (
              <img
                src={card.avatarUrl}
                alt={card.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold bg-primary text-white">
                {card.fullName.charAt(0)}
              </div>
            )}
          </div>

          <h1 className="text-xl font-bold text-white mb-0.5">{card.fullName}</h1>
          {card.jobTitle && (
            <p className="text-sm text-primary-light font-medium flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              <span>{card.jobTitle}</span>
            </p>
          )}
          {card.company && (
            <p className="text-xs text-text-secondary flex items-center gap-1.5 mt-0.5">
              <Building className="w-3 h-3" />
              <span>{card.company}</span>
            </p>
          )}

          {card.bio && (
            <p className="text-xs text-zinc-300 mt-3 leading-relaxed max-w-xs">{card.bio}</p>
          )}

          {/* Quick Actions (Save Contact, Call, Email) */}
          <div className="w-full grid grid-cols-2 gap-3 mt-6">
            <a
              href={vcfDataUri}
              download={`${card.fullName.replace(/\s+/g, "_")}.vcf`}
              className="py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-glow transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Save Contact</span>
            </a>

            {card.phone ? (
              <a
                href={`tel:${card.phone}`}
                className="py-3 px-4 rounded-xl bg-[#272738] hover:bg-[#34344A] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call Directly</span>
              </a>
            ) : (
              <a
                href={`mailto:${card.email}`}
                className="py-3 px-4 rounded-xl bg-[#272738] hover:bg-[#34344A] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Mail className="w-4 h-4 text-primary" />
                <span>Send Email</span>
              </a>
            )}
          </div>

          {/* Contact Details List */}
          <div className="w-full mt-6 space-y-2.5 text-left text-xs">
            <a
              href={`mailto:${card.email}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#11111B] border border-[#272738] hover:border-primary/40 text-text-secondary hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="truncate">{card.email}</span>
            </a>

            {card.phone && (
              <a
                href={`tel:${card.phone}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-[#11111B] border border-[#272738] hover:border-primary/40 text-text-secondary hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{card.phone}</span>
              </a>
            )}

            {card.website && (
              <a
                href={card.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-[#11111B] border border-[#272738] hover:border-primary/40 text-text-secondary hover:text-white transition-colors"
              >
                <Globe className="w-4 h-4 text-accent-cyan flex-shrink-0" />
                <span className="truncate">{card.website}</span>
              </a>
            )}

            {card.address && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#11111B] border border-[#272738] text-text-secondary">
                <MapPin className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{card.address}</span>
              </div>
            )}
          </div>

          {/* Share QR Code Section */}
          <div className="mt-6 p-4 rounded-2xl bg-[#11111B] border border-[#272738] w-full flex flex-col items-center">
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-3">
              Scan to exchange contact
            </div>
            <div
              className="w-36 h-36 bg-white p-2 rounded-xl shadow-md"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-6">
        <Link
          href="/"
          className="text-xs text-text-muted hover:text-white transition-colors flex items-center gap-1.5"
        >
          <span>Created with</span>
          <span className="font-semibold text-primary">CruseQR</span>
        </Link>
      </footer>
    </div>
  );
}

