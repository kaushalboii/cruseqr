import QRCode from "qrcode";

export type QrType =
  | "URL"
  | "TEXT"
  | "EMAIL"
  | "PHONE"
  | "SMS"
  | "WHATSAPP"
  | "WIFI"
  | "VCARD"
  | "LOCATION"
  | "EVENT"
  | "PDF"
  | "SOCIAL"
  | "APP"
  | "PAYMENT"
  | "BIO"
  | "MULTI";

export type DotStyle = "square" | "dots" | "rounded" | "extra-rounded" | "classy" | "classy-rounded";
export type CornerSquareStyle = "square" | "extra-rounded" | "dot";
export type CornerDotStyle = "square" | "dot";
export type FrameStyle = "none" | "bottom-banner" | "top-banner" | "badge" | "phone" | "stamp";

export interface QrDesignConfig {
  dotsColor?: string;
  dotsType?: DotStyle;
  isGradient?: boolean;
  gradientColor2?: string;
  gradientAngle?: number;
  backgroundColor?: string;
  transparentBackground?: boolean;
  cornersSquareColor?: string;
  cornersSquareType?: CornerSquareStyle;
  cornersDotColor?: string;
  cornersDotType?: CornerDotStyle;
  logoUrl?: string;
  logoSize?: number; // 0.15 - 0.35
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  margin?: number;
  frame?: FrameStyle;
  frameText?: string;
  frameColor?: string;
  frameTextColor?: string;
}

export const DEFAULT_DESIGN_CONFIG: QrDesignConfig = {
  dotsColor: "#8B5CF6",
  dotsType: "rounded",
  isGradient: false,
  gradientColor2: "#A78BFA",
  gradientAngle: 45,
  backgroundColor: "#FFFFFF",
  transparentBackground: false,
  cornersSquareColor: "#8B5CF6",
  cornersSquareType: "extra-rounded",
  cornersDotColor: "#8B5CF6",
  cornersDotType: "dot",
  logoUrl: "",
  logoSize: 0.22,
  errorCorrectionLevel: "Q",
  margin: 3,
  frame: "none",
  frameText: "SCAN ME",
  frameColor: "#8B5CF6",
  frameTextColor: "#FFFFFF",
};

/**
 * Encode specific QR type payload into scannable standard QR string
 */
export function encodeQrPayload(type: QrType, data: Record<string, any>): string {
  switch (type) {
    case "URL":
      return data.url || "https://cruseqr.com";
    case "TEXT":
      return data.text || "Hello from CruseQR";
    case "EMAIL":
      return `mailto:${data.email || ""}?subject=${encodeURIComponent(data.subject || "")}&body=${encodeURIComponent(data.body || "")}`;
    case "PHONE":
      return `tel:${data.phone || ""}`;
    case "SMS":
      return `sms:${data.phone || ""}?body=${encodeURIComponent(data.message || "")}`;
    case "WHATSAPP": {
      const cleanPhone = (data.phone || "").replace(/[^0-9]/g, "");
      return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(data.message || "")}`;
    }
    case "WIFI": {
      const ssid = (data.ssid || "").replace(/([\\;:"])/g, "\\$1");
      const password = (data.password || "").replace(/([\\;:"])/g, "\\$1");
      const enc = data.encryption || "WPA";
      const hidden = data.hidden ? "true" : "false";
      return `WIFI:T:${enc};S:${ssid};P:${password};H:${hidden};;`;
    }
    case "VCARD": {
      const vcard = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${data.lastName || ""};${data.firstName || ""};;;`,
        `FN:${[data.firstName, data.lastName].filter(Boolean).join(" ")}`,
        data.company ? `ORG:${data.company}` : "",
        data.title ? `TITLE:${data.title}` : "",
        data.phone ? `TEL;TYPE=CELL:${data.phone}` : "",
        data.workPhone ? `TEL;TYPE=WORK:${data.workPhone}` : "",
        data.email ? `EMAIL:${data.email}` : "",
        data.website ? `URL:${data.website}` : "",
        data.address ? `ADR;TYPE=WORK:;;${data.address};;;;` : "",
        data.note ? `NOTE:${data.note}` : "",
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\n");
      return vcard;
    }
    case "LOCATION":
      if (data.latitude && data.longitude) {
        return `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`;
      }
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address || "New York")}`;
    case "EVENT": {
      const formatDT = (d?: string) => {
        if (!d) return "";
        return new Date(d).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      };
      return [
        "BEGIN:VEVENT",
        `SUMMARY:${data.title || "CruseQR Event"}`,
        data.description ? `DESCRIPTION:${data.description}` : "",
        data.location ? `LOCATION:${data.location}` : "",
        data.startDate ? `DTSTART:${formatDT(data.startDate)}` : "",
        data.endDate ? `DTEND:${formatDT(data.endDate)}` : "",
        "END:VEVENT",
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "PDF":
      return data.pdfUrl || "https://cruseqr.com";
    case "SOCIAL":
      return data.socialUrl || "https://cruseqr.com";
    case "APP":
      return data.appUrl || "https://cruseqr.com";
    case "PAYMENT":
      if (data.paymentType === "UPI") {
        return `upi://pay?pa=${data.upiId || ""}&pn=${encodeURIComponent(data.payeeName || "")}&am=${data.amount || ""}&cu=INR`;
      }
      if (data.paymentType === "CRYPTO") {
        return `${data.cryptoType || "bitcoin"}:${data.walletAddress || ""}${data.amount ? `?amount=${data.amount}` : ""}`;
      }
      return data.paymentUrl || "https://paypal.me";
    case "BIO":
      return data.bioUrl || `https://cruseqr.com/bio/${data.username || ""}`;
    case "MULTI":
      return data.landingUrl || "https://cruseqr.com";
    default:
      return data.url || "https://cruseqr.com";
  }
}

/**
 * Generate a complete, stylized SVG string for the QR code
 */
export function generateQrSvg(content: string, options: QrDesignConfig = {}): string {
  const config = { ...DEFAULT_DESIGN_CONFIG, ...options };
  const qr = QRCode.create(content || "https://cruseqr.com", {
    errorCorrectionLevel: config.errorCorrectionLevel || "Q",
  });

  const matrix = qr.modules;
  const size = matrix.size;
  const margin = config.margin || 2;
  const totalGrid = size + margin * 2;
  const cellSize = 10;
  const qrInnerDimension = totalGrid * cellSize;

  // Frame calculation
  const hasFrame = config.frame && config.frame !== "none";
  let svgWidth = qrInnerDimension;
  let svgHeight = qrInnerDimension;
  let qrOffsetX = 0;
  let qrOffsetY = 0;
  const frameHeight = 60;
  const frameColor = config.frameColor || config.dotsColor || "#8B5CF6";
  const frameTextColor = config.frameTextColor || "#FFFFFF";
  const frameText = config.frameText || "SCAN ME";

  if (hasFrame) {
    if (config.frame === "bottom-banner") {
      svgHeight += frameHeight + 10;
      qrOffsetX = 0;
      qrOffsetY = 0;
    } else if (config.frame === "top-banner") {
      svgHeight += frameHeight + 10;
      qrOffsetX = 0;
      qrOffsetY = frameHeight + 10;
    } else if (config.frame === "badge") {
      svgWidth += 30;
      svgHeight += frameHeight + 25;
      qrOffsetX = 15;
      qrOffsetY = 15;
    } else if (config.frame === "phone") {
      svgWidth += 40;
      svgHeight += 110;
      qrOffsetX = 20;
      qrOffsetY = 45;
    } else if (config.frame === "stamp") {
      svgWidth += 24;
      svgHeight += 24;
      qrOffsetX = 12;
      qrOffsetY = 12;
    }
  }

  // Determine if module is part of the 3 finder patterns (top-left, top-right, bottom-left)
  const isFinderModule = (row: number, col: number): boolean => {
    // Top-left
    if (row < 7 && col < 7) return true;
    // Top-right
    if (row < 7 && col >= size - 7) return true;
    // Bottom-left
    if (row >= size - 7 && col < 7) return true;
    return false;
  };

  // Center logo clearance area (if logo is set)
  const logoRadius = config.logoUrl ? Math.floor(size * (config.logoSize || 0.22) * 0.7) : 0;
  const centerCoord = Math.floor(size / 2);
  const isInLogoArea = (row: number, col: number): boolean => {
    if (!config.logoUrl) return false;
    return Math.abs(row - centerCoord) <= logoRadius && Math.abs(col - centerCoord) <= logoRadius;
  };

  // Generate SVG definitions (Gradients, filters)
  let defs = "";
  let dotsFill = config.dotsColor || "#8B5CF6";
  if (config.isGradient) {
    defs += `
      <linearGradient id="qrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${config.dotsColor || "#8B5CF6"}" />
        <stop offset="100%" stop-color="${config.gradientColor2 || "#A78BFA"}" />
      </linearGradient>
    `;
    dotsFill = "url(#qrGrad)";
  }

  // Background
  const bgFill = config.transparentBackground ? "none" : config.backgroundColor || "#FFFFFF";
  let elements = "";

  // Main QR elements
  elements += `<rect width="${svgWidth}" height="${svgHeight}" fill="${bgFill}" rx="${hasFrame && config.frame === 'badge' ? 24 : 12}"/>`;

  // Draw Frame elements if enabled
  if (hasFrame) {
    if (config.frame === "bottom-banner") {
      elements += `
        <rect x="0" y="${qrInnerDimension + 5}" width="${svgWidth}" height="${frameHeight}" rx="12" fill="${frameColor}" />
        <text x="${svgWidth / 2}" y="${qrInnerDimension + 5 + frameHeight / 2 + 5}" fill="${frameTextColor}" font-family="Inter, system-ui, sans-serif" font-weight="700" font-size="16" text-anchor="middle" letter-spacing="1.5">${escapeXml(frameText)}</text>
      `;
    } else if (config.frame === "top-banner") {
      elements += `
        <rect x="0" y="0" width="${svgWidth}" height="${frameHeight}" rx="12" fill="${frameColor}" />
        <text x="${svgWidth / 2}" y="${frameHeight / 2 + 6}" fill="${frameTextColor}" font-family="Inter, system-ui, sans-serif" font-weight="700" font-size="16" text-anchor="middle" letter-spacing="1.5">${escapeXml(frameText)}</text>
      `;
    } else if (config.frame === "badge") {
      elements += `
        <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" rx="24" fill="none" stroke="${frameColor}" stroke-width="4" />
        <rect x="${svgWidth / 2 - 80}" y="${svgHeight - 48}" width="160" height="36" rx="18" fill="${frameColor}" />
        <text x="${svgWidth / 2}" y="${svgHeight - 25}" fill="${frameTextColor}" font-family="Inter, system-ui, sans-serif" font-weight="700" font-size="13" text-anchor="middle" letter-spacing="1">${escapeXml(frameText)}</text>
      `;
    } else if (config.frame === "phone") {
      elements += `
        <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" rx="36" fill="none" stroke="${frameColor}" stroke-width="6" />
        <rect x="${svgWidth / 2 - 25}" y="14" width="50" height="6" rx="3" fill="${frameColor}" />
        <rect x="10" y="${svgHeight - 45}" width="${svgWidth - 20}" height="32" rx="16" fill="${frameColor}" />
        <text x="${svgWidth / 2}" y="${svgHeight - 24}" fill="${frameTextColor}" font-family="Inter, system-ui, sans-serif" font-weight="700" font-size="13" text-anchor="middle" letter-spacing="1.2">${escapeXml(frameText)}</text>
      `;
    } else if (config.frame === "stamp") {
      elements += `
        <rect x="2" y="2" width="${svgWidth - 4}" height="${svgHeight - 4}" rx="8" fill="none" stroke="${frameColor}" stroke-width="4" stroke-dasharray="8 6" />
      `;
    }
  }

  // Draw QR Modules (data dots)
  let modulesSvg = `<g transform="translate(${qrOffsetX}, ${qrOffsetY})">`;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isInLogoArea(r, c)) continue;
      if (isFinderModule(r, c)) continue; // Finders are custom rendered below

      const isDark = matrix.get(r, c);
      if (!isDark) continue;

      const x = (c + margin) * cellSize;
      const y = (r + margin) * cellSize;

      const style = config.dotsType || "rounded";
      if (style === "dots") {
        modulesSvg += `<circle cx="${x + cellSize / 2}" cy="${y + cellSize / 2}" r="${cellSize * 0.42}" fill="${dotsFill}" />`;
      } else if (style === "rounded") {
        modulesSvg += `<rect x="${x + 0.5}" y="${y + 0.5}" width="${cellSize - 1}" height="${cellSize - 1}" rx="${cellSize * 0.35}" fill="${dotsFill}" />`;
      } else if (style === "extra-rounded") {
        modulesSvg += `<rect x="${x + 0.5}" y="${y + 0.5}" width="${cellSize - 1}" height="${cellSize - 1}" rx="${cellSize * 0.48}" fill="${dotsFill}" />`;
      } else if (style === "classy") {
        modulesSvg += `<path d="M ${x + 2} ${y + cellSize - 2} Q ${x + 2} ${y + 2} ${x + cellSize - 2} ${y + 2} Q ${x + cellSize - 2} ${y + cellSize - 2} ${x + 2} ${y + cellSize - 2} Z" fill="${dotsFill}" />`;
      } else if (style === "classy-rounded") {
        modulesSvg += `<rect x="${x + 1}" y="${y + 1}" width="${cellSize - 2}" height="${cellSize - 2}" rx="${cellSize * 0.4}" fill="${dotsFill}" />`;
      } else {
        // square
        modulesSvg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${dotsFill}" />`;
      }
    }
  }

  // Render the 3 Finder Patterns (Corners) with chosen styles
  const finderPositions = [
    { r: 0, c: 0 },
    { r: 0, c: size - 7 },
    { r: size - 7, c: 0 },
  ];

  const cornerSquareColor = config.cornersSquareColor || config.dotsColor || "#8B5CF6";
  const cornerDotColor = config.cornersDotColor || config.dotsColor || "#8B5CF6";
  const cornerSquareStyle = config.cornersSquareType || "extra-rounded";
  const cornerDotStyle = config.cornersDotType || "dot";

  for (const pos of finderPositions) {
    const fx = (pos.c + margin) * cellSize;
    const fy = (pos.r + margin) * cellSize;
    const outerSize = 7 * cellSize;
    const innerSize = 3 * cellSize;
    const innerOffset = 2 * cellSize;

    // Outer frame of finder
    let outerRx = 0;
    if (cornerSquareStyle === "extra-rounded") outerRx = 14;
    else if (cornerSquareStyle === "dot") outerRx = outerSize / 2;

    modulesSvg += `
      <rect x="${fx}" y="${fy}" width="${outerSize}" height="${outerSize}" rx="${outerRx}" fill="${cornerSquareColor}" />
      <rect x="${fx + cellSize}" y="${fy + cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" rx="${Math.max(0, outerRx - 6)}" fill="${bgFill}" />
    `;

    // Center dot of finder
    const cx = fx + innerOffset;
    const cy = fy + innerOffset;
    if (cornerDotStyle === "dot") {
      modulesSvg += `<circle cx="${cx + innerSize / 2}" cy="${cy + innerSize / 2}" r="${innerSize * 0.46}" fill="${cornerDotColor}" />`;
    } else {
      modulesSvg += `<rect x="${cx}" y="${cy}" width="${innerSize}" height="${innerSize}" rx="${cornerSquareStyle === 'extra-rounded' ? 6 : 0}" fill="${cornerDotColor}" />`;
    }
  }

  // Center Logo
  if (config.logoUrl) {
    const logoPx = Math.floor(size * (config.logoSize || 0.22) * cellSize * 1.5);
    const logoX = (totalGrid * cellSize - logoPx) / 2;
    const logoY = (totalGrid * cellSize - logoPx) / 2;
    modulesSvg += `
      <rect x="${logoX - 4}" y="${logoY - 4}" width="${logoPx + 8}" height="${logoPx + 8}" rx="10" fill="${bgFill}" />
      <image href="${escapeXml(config.logoUrl)}" x="${logoX}" y="${logoY}" width="${logoPx}" height="${logoPx}" preserveAspectRatio="xMidYMid meet" />
    `;
  }

  modulesSvg += `</g>`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">
      <defs>${defs}</defs>
      ${elements}
      ${modulesSvg}
    </svg>
  `.trim();
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

