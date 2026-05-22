import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { loadRecent, formatRelativeTime, type RecentCalc } from '../lib/recent';
import { toFractionString } from '../../packages/core/src/math';

// Mini mat preview SVG at 64x48 viewport
function MiniMatPreview({ calc }: { calc: RecentCalc }) {
  const outerW = calc.outerW;
  const outerH = calc.outerH;
  // Scale to fit 64x48, maintain aspect ratio
  const scaleX = 64 / outerW;
  const scaleY = 48 / outerH;
  const scale = Math.min(scaleX, scaleY);
  const svgW = outerW * scale;
  const svgH = outerH * scale;

  const leftOffset = (calc.kind === 'asymmetric' ? (calc.left ?? 2) : (calc.border ?? 2)) * scale;
  const topOffset  = (calc.kind === 'asymmetric' ? (calc.top  ?? 2) : (calc.border ?? 2)) * scale;
  const innerW = calc.artW * scale;
  const innerH = calc.artH * scale;

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width={64}
      height={48}
      aria-hidden="true"
      className="rounded-[3px] shrink-0"
    >
      <rect
        x="0" y="0" width={svgW} height={svgH}
        style={{ fill: 'rgb(var(--color-paper-rgb))', stroke: 'rgb(var(--color-ink-rgb))' }}
        strokeWidth="0.5"
      />
      <rect
        x={leftOffset} y={topOffset}
        width={innerW} height={innerH}
        fill="#9C3E2C" fillOpacity="0.18"
        style={{ stroke: 'rgb(var(--color-ink-rgb))' }}
        strokeWidth="0.5"
      />
    </svg>
  );
}

function buildCalcUrl(calc: RecentCalc): string {
  const p = new URLSearchParams();
  p.set('w', String(calc.artW));
  p.set('h', String(calc.artH));
  p.set('overlap', String(calc.overlap));
  if (calc.kind === 'asymmetric') {
    p.set('t', String(calc.top ?? 2));
    p.set('r', String(calc.right ?? 2));
    p.set('b', String(calc.bottom ?? 2));
    p.set('l', String(calc.left ?? 2));
  } else {
    p.set('border', String(calc.border ?? 2));
  }
  return `/calc?${p.toString()}`;
}

// Format outer dimensions with fraction strings
function formatDims(outerW: number, outerH: number): string {
  return `${toFractionString(outerW)} × ${toFractionString(outerH)}`;
}

export default function HistoryPage() {
  const [recent, setRecent] = useState<RecentCalc[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRecent(loadRecent());
    // Small delay so the stagger animation fires visibly on mount
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <main className="bg-paper text-ink px-5 pt-10 pb-8 max-w-md mx-auto">
      {/* Eyebrow */}
      <p
        className="font-serif font-medium uppercase text-pigment mb-3"
        style={{ fontSize: '11px', letterSpacing: '0.18em' }}
      >
        This device
      </p>

      {/* H1 */}
      <h1 className="font-serif text-[36px] font-medium leading-tight tracking-tight mb-2">
        Your recent mats
      </h1>

      {/* Subhead */}
      <p className="text-graphite mb-8" style={{ fontSize: '14px' }}>
        Saved here on this phone. Cross-device sync is on the bench.
      </p>

      {/* Card list or empty state */}
      {recent.length === 0 ? (
        <div
          className="rounded-[6px] flex flex-col items-center justify-center text-center py-10 px-6"
          style={{ border: '1px dashed rgba(31,27,23,0.20)' }}
        >
          <p className="text-graphite font-serif leading-snug mb-4" style={{ fontSize: '16px' }}>
            No mats yet.<br />The first one&rsquo;s the hardest.
          </p>
          <Link
            to="/calc"
            className="block text-center font-serif text-lg bg-pigment text-paper rounded-[4px] transition-transform active:scale-[0.97] px-6"
            style={{ minHeight: '48px', lineHeight: '48px' }}
          >
            Make one →
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {recent.map((calc, i) => (
            <li
              key={calc.id}
              className="transition-[opacity,transform] ease-out duration-200"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(4px)',
                transitionDelay: `${i * 60}ms`,
              }}
            >
              <div
                className="bg-mat-cream rounded-[6px] p-4 grid items-center gap-3"
                style={{
                  border: '1px solid rgba(31,27,23,0.08)',
                  gridTemplateColumns: '64px 1fr auto',
                }}
              >
                {/* Mini preview */}
                <MiniMatPreview calc={calc} />

                {/* Text info */}
                <div className="min-w-0">
                  <p className="font-mono tabular-nums text-ink font-medium leading-snug" style={{ fontSize: '14px' }}>
                    {formatDims(calc.outerW, calc.outerH)}"
                  </p>
                  <p className="text-graphite mt-0.5 leading-snug truncate" style={{ fontSize: '12px' }}>
                    {calc.artW} × {calc.artH} art
                    &nbsp;&middot;&nbsp;
                    {calc.kind}
                    &nbsp;&middot;&nbsp;
                    {formatRelativeTime(calc.ts)}
                  </p>
                </div>

                {/* Open link */}
                <Link
                  to={buildCalcUrl(calc)}
                  className="inline-flex items-center min-h-[48px] text-pigment font-medium shrink-0 transition-opacity hover:opacity-70 px-2"
                  style={{ fontSize: '14px' }}
                  aria-label={`Open mat ${formatDims(calc.outerW, calc.outerH)}`}
                >
                  Open →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
