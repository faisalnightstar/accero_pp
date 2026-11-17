/**
 * ISO/IEC 7810 ID-1 (CR80) PVC Card Dimension & High-DPI Resolution Engine
 * Accero PrintPortal (https://printportal.accero.app)
 *
 * SPECIFICATIONS (ISO/IEC 7810 Standard):
 * - Physical Width: 85.60 mm (3.3700787 inches)
 * - Physical Height: 53.98 mm (2.1251969 inches)
 * - Corner Radius: 3.18 mm (0.1251969 inches)
 * - Standard Thickness: 0.76 mm (30 mil / 0.030 inches)
 *
 * CALCULATION FORMULAS:
 * - mm to inches: mm / 25.4
 * - pixels = Math.round((dimensionMm / 25.4) * DPI)
 */

export const CR80_STANDARD = {
  WIDTH_MM: 85.6,
  HEIGHT_MM: 53.98,
  CORNER_RADIUS_MM: 3.18,
  THICKNESS_MM: 0.76,
  ASPECT_RATIO: 85.6 / 53.98, // ~1.58577
} as const;

export interface DpiCalculationResult {
  dpi: number;
  bleedMm: number;
  // Card base dimensions
  cardWidthMm: number;
  cardHeightMm: number;
  cardWidthInches: number;
  cardHeightInches: number;
  cardWidthPx: number;
  cardHeightPx: number;
  cornerRadiusPx: number;
  // Total dimensions including bleed
  totalWidthMm: number;
  totalHeightMm: number;
  totalWidthInches: number;
  totalHeightInches: number;
  totalWidthPx: number;
  totalHeightPx: number;
  bleedPx: number;
  aspectRatio: number;
}

export interface DpiPreset {
  label: string;
  dpi: number;
  useCase: string;
  dimensions: DpiCalculationResult;
}

/**
 * Calculates pixel dimensions and print metrics for ISO 7810 CR80 card blanks.
 *
 * @param dpi - Target dots per inch (must be between 72 and 4800)
 * @param bleedMm - Outer trim bleed in millimeters per edge (default: 0, max: 25)
 */
export function calculateCr80Dimensions(dpi: number, bleedMm: number = 0): DpiCalculationResult {
  if (!Number.isFinite(dpi) || dpi < 72 || dpi > 4800) {
    throw new Error(
      `Invalid DPI: ${dpi}. Target DPI must be a finite number between 72 and 4800.`
    );
  }

  const safeBleed = Number.isFinite(bleedMm) && bleedMm >= 0 && bleedMm <= 25 ? bleedMm : 0;

  const mmToInches = (mm: number) => Number((mm / 25.4).toFixed(5));
  const mmToPx = (mm: number) => Math.round((mm / 25.4) * dpi);

  const cardWidthMm = CR80_STANDARD.WIDTH_MM;
  const cardHeightMm = CR80_STANDARD.HEIGHT_MM;
  const cardWidthInches = mmToInches(cardWidthMm);
  const cardHeightInches = mmToInches(cardHeightMm);

  const cardWidthPx = mmToPx(cardWidthMm);
  const cardHeightPx = mmToPx(cardHeightMm);
  const cornerRadiusPx = mmToPx(CR80_STANDARD.CORNER_RADIUS_MM);

  const totalWidthMm = Number((cardWidthMm + safeBleed * 2).toFixed(2));
  const totalHeightMm = Number((cardHeightMm + safeBleed * 2).toFixed(2));
  const totalWidthInches = mmToInches(totalWidthMm);
  const totalHeightInches = mmToInches(totalHeightMm);

  const totalWidthPx = mmToPx(totalWidthMm);
  const totalHeightPx = mmToPx(totalHeightMm);
  const bleedPx = mmToPx(safeBleed);

  return {
    dpi,
    bleedMm: safeBleed,
    cardWidthMm,
    cardHeightMm,
    cardWidthInches,
    cardHeightInches,
    cardWidthPx,
    cardHeightPx,
    cornerRadiusPx,
    totalWidthMm,
    totalHeightMm,
    totalWidthInches,
    totalHeightInches,
    totalWidthPx,
    totalHeightPx,
    bleedPx,
    aspectRatio: Number((cardWidthMm / cardHeightMm).toFixed(4)),
  };
}

/**
 * Standard industry DPI presets for desktop inkjet trays and thermal card printers.
 */
export const CR80_DPI_PRESETS: DpiPreset[] = [
  {
    label: '96 DPI',
    dpi: 96,
    useCase: 'Web browser canvas preview & CSS layout',
    dimensions: calculateCr80Dimensions(96),
  },
  {
    label: '300 DPI',
    dpi: 300,
    useCase: 'Standard inkjet card tray (Epson L805 / Canon G-Series)',
    dimensions: calculateCr80Dimensions(300),
  },
  {
    label: '600 DPI',
    dpi: 600,
    useCase: 'High-definition photo print & fine Devanagari text',
    dimensions: calculateCr80Dimensions(600),
  },
  {
    label: '1200 DPI',
    dpi: 1200,
    useCase: 'Commercial micro-text & security guilloche patterns',
    dimensions: calculateCr80Dimensions(1200),
  },
];
