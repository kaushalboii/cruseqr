import jsPDF from "jspdf";
import JSZip from "jszip";

/**
 * Convert SVG string to PNG Data URL or blob at chosen resolution
 */
export async function svgToPngBlob(
  svgString: string,
  width: number = 1024,
  height: number = 1024
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Unable to create canvas context"));
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas to blob conversion failed"));
      }, "image/png");
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };

    img.src = url;
  });
}

/**
 * Triggers a file download in the browser
 */
export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export QR Code as SVG vector file
 */
export function exportSvg(svgString: string, filename: string = "cruseqr.svg") {
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  triggerDownload(blob, filename.endsWith(".svg") ? filename : `${filename}.svg`);
}

/**
 * Export QR Code as High-Res PNG
 */
export async function exportPng(
  svgString: string,
  filename: string = "cruseqr.png",
  resolution: number = 1024
) {
  const blob = await svgToPngBlob(svgString, resolution, resolution);
  triggerDownload(blob, filename.endsWith(".png") ? filename : `${filename}.png`);
}

/**
 * Export QR Code as Print-Ready PDF
 */
export async function exportPdf(
  svgString: string,
  title: string = "CruseQR Code",
  destinationUrl?: string
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Convert SVG to high-res PNG for PDF embedding
  const pngBlob = await svgToPngBlob(svgString, 1200, 1200);
  const reader = new FileReader();

  return new Promise<void>((resolve) => {
    reader.onloadend = () => {
      const base64Data = reader.result as string;

      // Page background
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, "F");

      // Brand Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 15, 25);
      doc.text("CruseQR", 105, 30, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 140);
      doc.text("Scan. Create. Connect.", 105, 38, { align: "center" });

      // QR Code centered
      const qrSize = 110;
      const qrX = (210 - qrSize) / 2;
      const qrY = 55;
      doc.addImage(base64Data, "PNG", qrX, qrY, qrSize, qrSize);

      // Title & destination
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(20, 20, 30);
      doc.text(title, 105, qrY + qrSize + 16, { align: "center" });

      if (destinationUrl) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 120);
        doc.text(destinationUrl, 105, qrY + qrSize + 24, { align: "center" });
      }

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(160, 160, 175);
      doc.text("Generated with CruseQR Platform — https://cruseqr.com", 105, 280, {
        align: "center",
      });

      doc.save(`${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-cruseqr.pdf`);
      resolve();
    };
    reader.readAsDataURL(pngBlob);
  });
}

/**
 * Batch download multiple QR codes as a single ZIP archive
 */
export async function exportBatchZip(
  items: { id: string; title: string; svgString: string }[],
  zipFilename: string = "cruseqr-batch-export.zip"
) {
  const zip = new JSZip();

  for (const item of items) {
    const safeTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, "-") || `qr-${item.id}`;
    // Add SVG
    zip.file(`${safeTitle}.svg`, item.svgString);

    // Add PNG
    try {
      const pngBlob = await svgToPngBlob(item.svgString, 1024, 1024);
      zip.file(`${safeTitle}.png`, pngBlob);
    } catch (err) {
      console.warn("Could not convert SVG to PNG for item:", item.title, err);
    }
  }

  const content = await zip.generateAsync({ type: "blob" });
  triggerDownload(content, zipFilename);
}

