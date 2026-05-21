export type OverlapPreset = 0.125 | 0.25 | 0.375;

export interface BorderSymmetric { kind: 'symmetric'; border: number }
export interface BorderAsymmetric {
  kind: 'asymmetric';
  top: number; right: number; bottom: number; left: number;
}
export type Border = BorderSymmetric | BorderAsymmetric;

export interface MatInput {
  artW: number;
  artH: number;
  border: Border;
  overlap: OverlapPreset;
  reveal?: number;
}

export interface MatOutput {
  openingW: number;
  openingH: number;
  outerW: number;
  outerH: number;
  bottomOpeningW?: number;
  bottomOpeningH?: number;
  topOpeningW?: number;
  topOpeningH?: number;
  foamcoreW: number;
  foamcoreH: number;
  glassW: number;
  glassH: number;
  warnings: string[];
}

export class MatMathError extends Error {
  constructor(public code: string, message: string) { super(message); }
}

export function snapTo16(n: number): number {
  return Math.round(n * 16) / 16;
}

export function calculate(input: MatInput): MatOutput {
  const { artW, artH, border, overlap, reveal } = input;
  const warnings: string[] = [];

  if (artW <= 0 || artH <= 0) {
    throw new MatMathError('ART_DIM_NONPOSITIVE', 'Artwork dimensions must be positive.');
  }
  if (overlap >= artW || overlap >= artH) {
    throw new MatMathError('OVERLAP_EXCEEDS_ART', 'Overlap exceeds artwork size. Reduce overlap.');
  }

  const bottomOpeningW = snapTo16(artW - overlap);
  const bottomOpeningH = snapTo16(artH - overlap);

  let openingW = bottomOpeningW;
  let openingH = bottomOpeningH;
  let topOpeningW: number | undefined;
  let topOpeningH: number | undefined;

  if (reveal !== undefined && reveal > 0) {
    if (reveal >= bottomOpeningW / 2 || reveal >= bottomOpeningH / 2) {
      throw new MatMathError('REVEAL_TOO_LARGE', 'Reveal too large; bottom mat opening would be inverted.');
    }
    topOpeningW = snapTo16(bottomOpeningW + 2 * reveal);
    topOpeningH = snapTo16(bottomOpeningH + 2 * reveal);
    openingW = topOpeningW;
    openingH = topOpeningH;
  }

  let outerW: number;
  let outerH: number;
  let minBorder: number;

  if (border.kind === 'symmetric') {
    outerW = snapTo16(openingW + 2 * border.border);
    outerH = snapTo16(openingH + 2 * border.border);
    minBorder = border.border;
    if (border.border === 0) warnings.push('edge-to-edge');
  } else {
    outerW = snapTo16(openingW + border.left + border.right);
    outerH = snapTo16(openingH + border.top + border.bottom);
    minBorder = Math.min(border.top, border.right, border.bottom, border.left);
  }

  if (artW < 2 || artH < 2) {
    warnings.push('Art is very small — recommend 1/16" overlap and verify cutter precision.');
  }
  if (minBorder > 0 && minBorder < 0.25) {
    warnings.push('Borders below 1/4" can look cramped; industry minimum is usually 2".');
  }
  if (border.kind === 'symmetric' && border.border >= Math.min(artW, artH) / 2) {
    warnings.push('Border exceeds half the short artwork dimension — visual imbalance.');
  }
  if (reveal !== undefined && reveal > 0) {
    const refBorder = border.kind === 'symmetric'
      ? border.border
      : Math.min(border.top, border.right, border.bottom, border.left);
    if (reveal > refBorder) {
      warnings.push('Reveal exceeds border — top mat will be visible only as a thin strip.');
    }
  }
  if (overlap === 0.375 && (artW < 6 || artH < 6)) {
    warnings.push('Conservation overlap on small art may obscure significant image area.');
  }
  if (outerW > 32 || outerH > 40) {
    warnings.push('Outer mat exceeds standard 32×40 sheet — custom cut required, expect higher cost.');
  }

  return {
    openingW: bottomOpeningW,
    openingH: bottomOpeningH,
    outerW,
    outerH,
    bottomOpeningW: topOpeningW !== undefined ? bottomOpeningW : undefined,
    bottomOpeningH: topOpeningH !== undefined ? bottomOpeningH : undefined,
    topOpeningW,
    topOpeningH,
    foamcoreW: outerW,
    foamcoreH: outerH,
    glassW: outerW,
    glassH: outerH,
    warnings,
  };
}

const UNICODE_FRACTIONS: Record<string, string> = {
  '1/16': '¹⁄₁₆', '1/8': '⅛', '3/16': '³⁄₁₆', '1/4': '¼',
  '5/16': '⁵⁄₁₆', '3/8': '⅜', '7/16': '⁷⁄₁₆', '1/2': '½',
  '9/16': '⁹⁄₁₆', '5/8': '⅝', '11/16': '¹¹⁄₁₆', '3/4': '¾',
  '13/16': '¹³⁄₁₆', '7/8': '⅞', '15/16': '¹⁵⁄₁₆',
};

export function toFractionString(n: number, opts: { unicode?: boolean } = {}): string {
  const snapped = snapTo16(n);
  const whole = Math.floor(snapped);
  const remainder = snapped - whole;
  const sixteenths = Math.round(remainder * 16);
  if (sixteenths === 0) return `${whole}`;
  if (sixteenths === 16) return `${whole + 1}`;
  let num = sixteenths;
  let den = 16;
  while (num % 2 === 0 && den % 2 === 0) { num /= 2; den /= 2; }
  const frac = `${num}/${den}`;
  const fracDisplay = opts.unicode ? (UNICODE_FRACTIONS[frac] ?? frac) : frac;
  return whole === 0 ? fracDisplay : `${whole} ${fracDisplay}`;
}
