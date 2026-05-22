import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { loadRecent, type RecentCalc } from '../lib/recent';
import { toFractionString } from '../../packages/core/src/math';

function opticalDelta(calc: RecentCalc): number {
  if (calc.kind !== 'asymmetric') return 0;
  return Math.abs((calc.bottom ?? 0) - (calc.top ?? 0));
}

function CompareCard({ calc }: { calc: RecentCalc }) {
  const delta = opticalDelta(calc);
  const outerW = calc.outerW;
  const outerH = calc.outerH;

  // Mini SVG preview
  const scale = 80 / Math.max(outerW, outerH);
  const svgW = outerW * scale;
  const svgH = outerH * scale;
  const leftOff = (calc.kind === 'asymmetric' ? (calc.left ?? 2) : (calc.border ?? 2)) * scale;
  const topOff  = (calc.kind === 'asymmetric' ? (calc.top  ?? 2) : (calc.border ?? 2)) * scale;
  const innerW  = calc.artW * scale;
  const innerH  = calc.artH * scale;

  return (
    <div
      className="rounded-[6px] border border-ink/[0.08] bg-mat-cream/30 px-4 py-4 flex flex-col gap-3"
    >
      <div className="flex justify-center">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width={svgW}
          height={svgH}
          aria-hidden="true"
          className="rounded-[2px]"
        >
          <rect x="0" y="0" width={svgW} height={svgH} fill="#EDE5D3" stroke="#1F1B17" strokeWidth="0.5" />
          <rect
            x={leftOff} y={topOff}
            width={innerW} height={innerH}
            fill="#9C3E2C" fillOpacity="0.18"
            stroke="#1F1B17" strokeWidth="0.5"
          />
        </svg>
      </div>

      <div className="space-y-1">
        <p className="font-mono tabular-nums text-ink font-medium" style={{ fontSize: '13px' }}>
          {toFractionString(outerW)} × {toFractionString(outerH)}"
        </p>
        <p className="text-graphite" style={{ fontSize: '11px' }}>
          Art {calc.artW} × {calc.artH}"
        </p>
        <p className="text-graphite" style={{ fontSize: '11px' }}>
          {calc.kind}
          {calc.kind === 'asymmetric' && calc.top !== undefined && calc.bottom !== undefined
            ? ` · T ${toFractionString(calc.top)}" B ${toFractionString(calc.bottom)}"`
            : calc.border !== undefined
              ? ` · ${toFractionString(calc.border)}" border`
              : ''}
        </p>
        {delta > 0 && (
          <p className="text-graphite" style={{ fontSize: '11px' }}>
            Optical delta: {toFractionString(delta)}"
          </p>
        )}
      </div>

      <Link
        to={`/calc?w=${calc.artW}&h=${calc.artH}&overlap=${calc.overlap}${calc.kind === 'asymmetric'
          ? `&t=${calc.top ?? 2}&r=${calc.right ?? 2}&b=${calc.bottom ?? 2}&l=${calc.left ?? 2}`
          : `&border=${calc.border ?? 2}`
        }`}
        className="text-pigment text-sm hover:opacity-80 transition-opacity font-medium"
        style={{ marginTop: 'auto' }}
      >
        Open →
      </Link>
    </div>
  );
}

export default function ComparePage() {
  const calcs = useMemo(() => loadRecent().slice(0, 4), []);

  return (
    <main className="bg-paper text-ink px-5 pt-10 pb-8 max-w-2xl mx-auto">
      {/* Eyebrow */}
      <p
        className="font-serif font-medium uppercase text-pigment mb-3"
        style={{ fontSize: '11px', letterSpacing: '0.18em' }}
      >
        Compare
      </p>

      {/* H1 */}
      <h1 className="font-serif text-[36px] font-medium leading-tight tracking-tight mb-2">
        Side by side
      </h1>

      <p className="text-graphite mb-8" style={{ fontSize: '14px' }}>
        Your four most recent mats. Optical delta = bottom minus top border.
      </p>

      {calcs.length === 0 ? (
        <div
          className="rounded-[6px] flex flex-col items-center justify-center text-center py-10 px-6"
          style={{ border: '1px dashed rgba(31,27,23,0.20)' }}
        >
          <p className="text-graphite font-serif leading-snug mb-4" style={{ fontSize: '16px' }}>
            No mats to compare yet.
          </p>
          <Link
            to="/calc"
            className="inline-block font-serif text-lg bg-pigment text-paper rounded-[4px] transition-transform active:scale-[0.97] px-6"
            style={{ minHeight: '48px', lineHeight: '48px' }}
          >
            Make one →
          </Link>
        </div>
      ) : (
        /* Mobile: vertical stack; ≥640px: grid-cols-2; ≥1024px: grid-cols-4 */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {calcs.map((calc) => (
            <CompareCard key={calc.id} calc={calc} />
          ))}
        </div>
      )}
    </main>
  );
}
