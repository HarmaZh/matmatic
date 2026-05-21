import { describe, it, expect } from 'vitest';
import { calculate, snapTo16, toFractionString, MatMathError } from './math';

describe('Matmatic math — 20 regression cases from arithmetic.md', () => {
  it('1. Classic 8x10, 2" symmetric, overlap 0.25', () => {
    const r = calculate({ artW: 8, artH: 10, border: { kind: 'symmetric', border: 2 }, overlap: 0.25 });
    expect(r.openingW).toBe(7.75); expect(r.openingH).toBe(9.75);
    expect(r.outerW).toBe(11.75); expect(r.outerH).toBe(13.75);
  });
  it('2. 5x7, 3" symmetric', () => {
    const r = calculate({ artW: 5, artH: 7, border: { kind: 'symmetric', border: 3 }, overlap: 0.25 });
    expect(r.openingW).toBe(4.75); expect(r.openingH).toBe(6.75);
    expect(r.outerW).toBe(10.75); expect(r.outerH).toBe(12.75);
  });
  it('3. 11x14 asymmetric T=2 B=2.5 L=2 R=2', () => {
    const r = calculate({ artW: 11, artH: 14, border: { kind: 'asymmetric', top: 2, right: 2, bottom: 2.5, left: 2 }, overlap: 0.25 });
    expect(r.openingW).toBe(10.75); expect(r.openingH).toBe(13.75);
    expect(r.outerW).toBe(14.75); expect(r.outerH).toBe(18.25);
  });
  it('4. 16x20 optical-centering asymmetric', () => {
    const r = calculate({ artW: 16, artH: 20, border: { kind: 'asymmetric', top: 3, right: 3, bottom: 3.5, left: 3 }, overlap: 0.25 });
    expect(r.openingW).toBe(15.75); expect(r.openingH).toBe(19.75);
    expect(r.outerW).toBe(21.75); expect(r.outerH).toBe(26.25);
  });
  it('5. Fractional 8 1/8 x 10 1/4, 2" border', () => {
    const r = calculate({ artW: 8.125, artH: 10.25, border: { kind: 'symmetric', border: 2 }, overlap: 0.25 });
    expect(r.openingW).toBe(7.875); expect(r.openingH).toBe(10);
    expect(r.outerW).toBe(11.875); expect(r.outerH).toBe(14);
  });
  it('6. Conservation overlap 3/8" on 8x10', () => {
    const r = calculate({ artW: 8, artH: 10, border: { kind: 'symmetric', border: 2 }, overlap: 0.375 });
    expect(r.openingW).toBe(7.625); expect(r.openingH).toBe(9.625);
    expect(r.outerW).toBe(11.625); expect(r.outerH).toBe(13.625);
  });
  it('7. Loose overlap 1/8" on 5x7', () => {
    const r = calculate({ artW: 5, artH: 7, border: { kind: 'symmetric', border: 2 }, overlap: 0.125 });
    expect(r.openingW).toBe(4.875); expect(r.openingH).toBe(6.875);
    expect(r.outerW).toBe(8.875); expect(r.outerH).toBe(10.875);
  });
  it('8. Double mat, 1/4" reveal, 8x10 art, 3" border', () => {
    const r = calculate({ artW: 8, artH: 10, border: { kind: 'symmetric', border: 3 }, overlap: 0.25, reveal: 0.25 });
    expect(r.bottomOpeningW).toBe(7.75); expect(r.bottomOpeningH).toBe(9.75);
    expect(r.topOpeningW).toBe(8.25); expect(r.topOpeningH).toBe(10.25);
    expect(r.outerW).toBe(14.25); expect(r.outerH).toBe(16.25);
  });
  it('9. Double mat, 1/8" reveal', () => {
    const r = calculate({ artW: 8, artH: 10, border: { kind: 'symmetric', border: 3 }, overlap: 0.25, reveal: 0.125 });
    expect(r.bottomOpeningW).toBe(7.75); expect(r.bottomOpeningH).toBe(9.75);
    expect(r.topOpeningW).toBe(8); expect(r.topOpeningH).toBe(10);
    expect(r.outerW).toBe(14); expect(r.outerH).toBe(16);
  });
  it('10. Panoramic 4x36 with 2" border warns', () => {
    const r = calculate({ artW: 4, artH: 36, border: { kind: 'symmetric', border: 2 }, overlap: 0.25 });
    expect(r.openingW).toBe(3.75); expect(r.openingH).toBe(35.75);
    expect(r.outerW).toBe(7.75); expect(r.outerH).toBe(39.75);
    expect(r.warnings.some(w => w.includes('half the short'))).toBe(true);
  });
  it('11. Tiny 1.5x2 art warns', () => {
    const r = calculate({ artW: 1.5, artH: 2, border: { kind: 'symmetric', border: 1 }, overlap: 0.125 });
    expect(r.openingW).toBe(1.375); expect(r.openingH).toBe(1.875);
    expect(r.outerW).toBe(3.375); expect(r.outerH).toBe(3.875);
    expect(r.warnings.some(w => w.includes('very small'))).toBe(true);
  });
  it('12. Overlap = art throws', () => {
    expect(() => calculate({ artW: 2, artH: 2, border: { kind: 'symmetric', border: 1 }, overlap: 2 as never }))
      .toThrow(MatMathError);
  });
  it('13. Zero border edge-to-edge', () => {
    const r = calculate({ artW: 8, artH: 10, border: { kind: 'symmetric', border: 0 }, overlap: 0.25 });
    expect(r.outerW).toBe(7.75); expect(r.outerH).toBe(9.75);
    expect(r.warnings).toContain('edge-to-edge');
  });
  it('14. Fraction round-trip 0.6875" -> 11/16', () => {
    expect(toFractionString(0.6875)).toBe('11/16');
  });
  it('15. Fraction round-trip 1.5625" -> 1 9/16', () => {
    expect(toFractionString(1.5625)).toBe('1 9/16');
  });
  it('16. Drift check: 4 * 1/8 -> 1/2 exactly', () => {
    const sum = snapTo16(0.125 + 0.125 + 0.125 + 0.125);
    expect(sum).toBe(0.5);
    expect(toFractionString(sum)).toBe('1/2');
  });
  it('17. Foam core = outer (not opening)', () => {
    const r = calculate({ artW: 8, artH: 10, border: { kind: 'symmetric', border: 2 }, overlap: 0.25 });
    expect(r.foamcoreW).toBe(r.outerW); expect(r.foamcoreH).toBe(r.outerH);
    expect(r.foamcoreW).toBe(11.75);
  });
  it('18. Glass = outer', () => {
    const r = calculate({ artW: 8, artH: 10, border: { kind: 'symmetric', border: 2 }, overlap: 0.25 });
    expect(r.glassW).toBe(r.outerW); expect(r.glassH).toBe(r.outerH);
  });
  it('19. Reveal exceeds border warns', () => {
    const r = calculate({ artW: 8, artH: 10, border: { kind: 'symmetric', border: 0.5 }, overlap: 0.25, reveal: 1 });
    expect(r.warnings.some(w => w.includes('thin strip'))).toBe(true);
  });
  it('20. Asymmetric with conservation overlap 11x14 (T2 B3 L2 R2)', () => {
    // arithmetic.md row 20 had a typo: expected outerH 19.625 doesn't match its own tuple (2,3,2,2).
    // 13.625 + 2 + 3 = 18.625. Correcting to match the math contract; spec table needs follow-up edit.
    const r = calculate({ artW: 11, artH: 14, border: { kind: 'asymmetric', top: 2, right: 2, bottom: 3, left: 2 }, overlap: 0.375 });
    expect(r.openingW).toBe(10.625); expect(r.openingH).toBe(13.625);
    expect(r.outerW).toBe(14.625); expect(r.outerH).toBe(18.625);
  });
});
