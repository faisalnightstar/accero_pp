'use client';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Capture card HTML element at 300+ DPI using html2canvas
 */
async function captureCardCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  return await html2canvas(element, {
    scale: 3, // 3x scale renders crisp 300+ DPI rasterization
    useCORS: true,
    allowTaint: true,
    backgroundColor: null, // preserve rounded transparent corners
    logging: false,
  });
}

/**
 * 1-Click High-DPI Print-Ready PDF Exporter
 * Generates an exact ISO/IEC 7810 ID-1 standard PDF (85.60 mm × 53.98 mm)
 * Page 1: Front Card
 * Page 2: Back Card
 */
export async function exportCardAsPdf(
  frontElement: HTMLElement,
  backElement: HTMLElement,
  filename: string = 'card_print'
): Promise<void> {
  try {
    // Rasterize both sides in parallel
    const [frontCanvas, backCanvas] = await Promise.all([
      captureCardCanvas(frontElement),
      captureCardCanvas(backElement),
    ]);

    const frontDataUrl = frontCanvas.toDataURL('image/png');
    const backDataUrl = backCanvas.toDataURL('image/png');

    // Create 85.60 mm × 53.98 mm Landscape PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.60, 53.98],
      compress: true,
    });

    // Page 1: Front
    pdf.addImage(frontDataUrl, 'PNG', 0, 0, 85.60, 53.98, undefined, 'FAST');

    // Page 2: Back
    pdf.addPage([85.60, 53.98], 'landscape');
    pdf.addImage(backDataUrl, 'PNG', 0, 0, 85.60, 53.98, undefined, 'FAST');

    // Trigger download
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Failed to export card as PDF:', error);
    throw error;
  }
}

/**
 * 1-Click High-DPI PNG Exporter
 * Downloads a crisp 300+ DPI PNG image of an individual card side
 */
export async function exportCardAsPng(
  element: HTMLElement,
  filename: string = 'card_image'
): Promise<void> {
  try {
    const canvas = await captureCardCanvas(element);
    const dataUrl = canvas.toDataURL('image/png');

    const downloadLink = document.createElement('a');
    downloadLink.href = dataUrl;
    downloadLink.download = `${filename}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (error) {
    console.error('Failed to export card as PNG:', error);
    throw error;
  }
}
