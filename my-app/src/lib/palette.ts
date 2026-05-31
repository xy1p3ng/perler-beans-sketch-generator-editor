import paletteData from './mard-palette.json';

export interface PaletteColor {
  brand: string;
  color_no: string;
  name: string;
  hex: string;
  rgb: string;
}

export const MARD_PALETTE: PaletteColor[] = paletteData as PaletteColor[];

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

export function colorDistance(rgb1: { r: number; g: number; b: number }, rgb2: { r: number; g: number; b: number }): number {
  return Math.sqrt(
    Math.pow(rgb1.r - rgb2.r, 2) +
    Math.pow(rgb1.g - rgb2.g, 2) +
    Math.pow(rgb1.b - rgb2.b, 2)
  );
}

export function findClosestPaletteColor(hex: string, palette: PaletteColor[] = MARD_PALETTE): PaletteColor | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  let minDist = Infinity;
  let closest = palette[0];
  for (const color of palette) {
    const paletteRgb = hexToRgb(color.hex);
    if (!paletteRgb) continue;
    const dist = colorDistance(rgb, paletteRgb);
    if (dist < minDist) {
      minDist = dist;
      closest = color;
    }
  }
  return closest || null;
}
