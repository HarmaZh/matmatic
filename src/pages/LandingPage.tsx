import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Demo SVG: 11x14 art, 2/2/3/2 asymmetric borders, at 240px max dimension
function DemoSvg() {
  const outerW = 11 + 2 + 2; // art + left + right
  const outerH = 14 + 2 + 3; // art + top + bottom
  const scale = 200 / Math.max(outerW, outerH);
  const w = outerW * scale;
  const h = outerH * scale;
  const leftOffset = 2 * scale;
  const topOffset = 2 * scale;
  const innerW = 11 * scale;
  const innerH = 14 * scale;

  return (
    <figure className="flex flex-col items-center gap-2 my-8">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width={w}
        height={h}
        className="rounded-sm"
        aria-label="Demo mat preview: 11x14 art with asymmetric 2/2/3/2 borders"
      >
        {/* Mat body */}
        <rect x="0" y="0" width={w} height={h} fill="#EDE5D3" stroke="#1F1B17" strokeWidth="0.75" />
        {/* Opening with pigment tint */}
        <rect
          x={leftOffset} y={topOffset}
          width={innerW} height={innerH}
          fill="#9C3E2C" fillOpacity="0.16"
          stroke="#1F1B17" strokeWidth="0.75"
        />
      </svg>
      <figcaption className="font-mono text-[10px] tabular-nums text-graphite">
        11 × 14 art &middot; 2 / 2 / 3 / 2 borders &middot; outer {outerW} × {outerH}"
      </figcaption>
    </figure>
  );
}

export default function LandingPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after first paint
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <main className="bg-paper text-ink font-serif min-h-[100dvh] px-5 pt-12 pb-8 max-w-md mx-auto">
      {/* Nav */}
      <nav className="flex items-center justify-between mb-16">
        <span className="font-serif text-lg font-medium tracking-tight">Matmatic</span>
        <Link to="/profile" className="text-sm text-graphite hover:text-ink transition-colors">
          Recent
        </Link>
      </nav>

      {/* Hero — entrance motion */}
      <div
        className="transition-[opacity,transform] duration-[280ms] ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(8px)',
        }}
      >
        {/* Eyebrow */}
        <p
          className="font-serif font-medium uppercase text-pigment mb-4"
          style={{ fontSize: '11px', letterSpacing: '0.18em' }}
        >
          Mat math &middot; for artists
        </p>

        {/* H1 */}
        <h1 className="font-serif text-[46px] font-medium leading-[1.02] tracking-[-0.02em] mb-5">
          Stop measuring twice.<br />Cut once.
        </h1>

        {/* Subhead */}
        <p className="text-graphite leading-relaxed mb-8" style={{ fontSize: '17px', maxWidth: '32ch' }}>
          A pocket calculator for the picture mat around your work. Asymmetric borders, double-mat reveals, optical centering — figured out before you reach for the knife.
        </p>

        {/* Primary CTA */}
        <Link
          to="/calc"
          className="block w-full text-center font-serif text-lg bg-pigment text-paper rounded-[4px] transition-transform active:scale-[0.97] hover:opacity-95"
          style={{ minHeight: '48px', lineHeight: '48px' }}
        >
          Calculate my mat
        </Link>
      </div>

      {/* Demo SVG */}
      <DemoSvg />

      {/* Section divider */}
      <hr className="border-t border-ink/[0.12] my-0" />

      {/* Value bullets */}
      <ol className="mt-6 grid gap-6">
        {([
          ['01', 'Asymmetric borders by default — the optical-centering trick framers charge for.'],
          ['02', 'Built for the phone in the studio, not a desktop in the back office.'],
          ['03', 'Free. No paywall on the math. Ever.'],
        ] as const).map(([num, text]) => (
          <li key={num} className="flex gap-4 items-start">
            <span className="font-mono text-pigment shrink-0" style={{ fontSize: '11px', lineHeight: '1.6', letterSpacing: '0.05em' }}>
              {num}
            </span>
            <span className="font-serif text-base text-ink leading-snug">{text}</span>
          </li>
        ))}
      </ol>

      {/* Footer */}
      <footer className="pt-6 mt-8 border-t border-ink/[0.12]">
        <p className="text-graphite" style={{ fontSize: '12px' }}>
          For artists, by someone who keeps re-cutting the same mat.
        </p>
        <p className="font-mono text-graphite mt-1" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>
          v0.1 &middot; 2026
        </p>
      </footer>
    </main>
  );
}
