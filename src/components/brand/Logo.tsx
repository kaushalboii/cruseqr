import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
}

export function Logo({ className = "", size = "md", showTagline = false }: LogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      {/* CruseQR Isometric Monogram / Optical QR Symbol */}
      <div
        className={`${iconSizes[size]} relative rounded-xl bg-gradient-to-tr from-primary via-[#9333EA] to-accent-cyan p-[1.5px] shadow-glow transition-all duration-300 group-hover:shadow-glow-lg group-hover:scale-105`}
      >
        <div className="w-full h-full bg-[#09090F] rounded-[10px] flex items-center justify-center p-1.5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full text-white"
          >
            {/* Top-left corner box */}
            <rect x="2" y="2" width="8" height="8" rx="2.5" stroke="currentColor" strokeWidth="2.2" />
            <rect x="4.5" y="4.5" width="3" height="3" rx="1" fill="#8B5CF6" />

            {/* Top-right corner box */}
            <rect x="14" y="2" width="8" height="8" rx="2.5" stroke="currentColor" strokeWidth="2.2" />
            <rect x="16.5" y="4.5" width="3" height="3" rx="1" fill="#06B6D4" />

            {/* Bottom-left corner box */}
            <rect x="2" y="14" width="8" height="8" rx="2.5" stroke="currentColor" strokeWidth="2.2" />
            <rect x="4.5" y="16.5" width="3" height="3" rx="1" fill="#A78BFA" />

            {/* Modern dynamic connectivity pulse */}
            <circle cx="16.5" cy="16.5" r="2.5" fill="#8B5CF6" />
            <path d="M14 20H20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <span className={`font-bold tracking-tight text-white font-sans ${textSizes[size]}`}>
          Cruse<span className="text-primary bg-gradient-to-r from-primary to-accent-cyan bg-clip-text text-transparent">QR</span>
        </span>
        {showTagline && (
          <span className="text-[10px] text-text-secondary tracking-wider uppercase font-medium">
            Scan. Create. Connect.
          </span>
        )}
      </div>
    </Link>
  );
}

