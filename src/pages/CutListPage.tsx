import { Link, useParams } from 'react-router-dom';
import { loadRecent, type RecentCalc } from '../lib/recent';
import { toFractionString } from '../../packages/core/src/math';

function toUnicodeFraction(n: number): string {
  return toFractionString(n, { unicode: true });
}

function CutListTable({ calc }: { calc: RecentCalc }) {
  const rows: Array<{ label: string; w: number; h: number }> = [
    { label: 'Outer mat', w: calc.outerW, h: calc.outerH },
    { label: 'Foam core', w: calc.outerW, h: calc.outerH },
    { label: 'Glass', w: calc.outerW, h: calc.outerH },
  ];

  // Opening: reconstruct from stored fields
  // opening = artW - overlap (approximately); we store artW and outerW so use those as proxies
  const openingW = calc.artW - calc.overlap;
  const openingH = calc.artH - calc.overlap;
  rows.splice(1, 0, { label: 'Opening', w: openingW, h: openingH });

  return (
    <table className="w-full border-collapse mt-6" style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: '14px' }}>
      <thead>
        <tr className="border-b border-ink/[0.12]">
          <th className="text-left text-graphite font-normal pb-2 pr-4" style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Component
          </th>
          <th className="text-right text-graphite font-normal pb-2 pr-4" style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Width
          </th>
          <th className="text-right text-graphite font-normal pb-2" style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Height
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label} className="border-b border-ink/[0.06]">
            <td className="py-2 pr-4 text-graphite">{row.label}</td>
            <td className="py-2 pr-4 text-right tabular-nums text-ink">
              {toUnicodeFraction(row.w)}"
            </td>
            <td className="py-2 text-right tabular-nums text-ink">
              {toUnicodeFraction(row.h)}"
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function CutListPage() {
  const { id } = useParams<{ id: string }>();
  const calc = loadRecent().find((c) => c.id === id) ?? null;

  if (!calc) {
    return (
      <main
        className="min-h-[100dvh] bg-paper text-ink flex flex-col items-center justify-center px-8 text-center"
      >
        <p className="font-serif text-2xl font-medium mb-3">Cut list not found</p>
        <p className="text-graphite mb-8" style={{ fontSize: '15px' }}>
          This mat may have been cleared from your device.
        </p>
        <Link
          to="/calc"
          className="font-serif text-lg bg-pigment text-paper rounded-[4px] transition-transform active:scale-[0.97] px-6"
          style={{ minHeight: '48px', lineHeight: '48px', display: 'inline-block' }}
        >
          Start a new mat
        </Link>
      </main>
    );
  }

  // Build hero: outer dims with unicode fractions
  const heroW = toUnicodeFraction(calc.outerW);
  const heroH = toUnicodeFraction(calc.outerH);

  return (
    <main className="min-h-[100dvh] bg-paper text-ink px-6 pt-5 pb-10 max-w-md mx-auto relative">
      {/* Back arrow — chrome-less, minimal */}
      <Link
        to="/calc"
        className="text-ink text-2xl leading-none block mb-10"
        aria-label="Back to calculator"
        style={{ width: 'max-content' }}
      >
        &#8592;
      </Link>

      {/* Eyebrow */}
      <p
        className="font-serif font-medium uppercase text-pigment mb-3"
        style={{ fontSize: '11px', letterSpacing: '0.18em' }}
      >
        Cut list
      </p>

      {/* Hero: outer dims at display size */}
      <h1
        className="font-serif font-medium leading-none tracking-tight tabular-nums mb-2"
        style={{ fontSize: 'clamp(3rem, 16vw, 4.5rem)' }}
      >
        {heroW} × {heroH}"
      </h1>

      <p className="text-graphite mb-1" style={{ fontSize: '13px' }}>
        Art {calc.artW} × {calc.artH}"
        &nbsp;&middot;&nbsp;
        {calc.kind}
        &nbsp;&middot;&nbsp;
        overlap {toUnicodeFraction(calc.overlap)}"
      </p>

      {/* Cut list table */}
      <CutListTable calc={calc} />

      {/* Footer */}
      <p
        className="absolute bottom-6 right-6 text-graphite"
        style={{ fontSize: '11px', letterSpacing: '0.05em', fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}
      >
        made with matmatic
      </p>
    </main>
  );
}
