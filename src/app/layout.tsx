import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CruseQR — Scan. Create. Connect. | QR Code SaaS Platform",
  description:
    "Next-generation QR code creation and management platform. Dynamic QR codes, Generative AI Art, Link-in-Bio pages, and real-time scan analytics.",
  keywords: [
    "QR Code Generator",
    "Dynamic QR Code",
    "AI QR Art",
    "Link in Bio",
    "Scan Analytics",
    "Digital Business Cards",
  ],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#09090F] text-white min-h-screen antialiased">{children}</body>
    </html>
  );
}

