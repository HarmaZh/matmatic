import { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { calculate, toFractionString, type Border, type OverlapPreset, MatMathError } from '../../packages/core/src/math';
import DimensionEntry from '../components/DimensionEntry';
import AsymmetricToggle from '../components/AsymmetricToggle';
import MatPreview from '../components/MatPreview';
import DropshipCTA from '../components/DropshipCTA';
import OpticalCenteringHint from '../components/OpticalCenteringHint';
import { saveRecent } from '../lib/recent';

export default function CalcPage() {
  const [searchParams] = useSearchParams();

  // Hydrate from URL params on mount
  const initArtW = Number(searchParams.get('w')) || 8;
  const initArtH = Number(searchParams.get('h')) || 10;
  const initOverlap = (Number(searchParams.get('overlap')) || 0.25) as OverlapPreset;
  const initAsymmetric = !!(searchParams.get('t') || searchParams.get('r') || searchParams.get('b') || searchParams.get('l'));
  const initSymBorder = Number(searchParams.get('border')) || 2;
  const initT = Number(searchParams.get('t')) || 2;
  const initR = Number(searchParams.get('r')) || 2;
  const initB = Number(searchParams.get('b')) || 2;
  const initL = Number(searchParams.get('l')) || 2;

  const [artW, setArtW] = useState(initArtW);
  const [artH, setArtH] = useState(initArtH);
  const [overlap] = useState<OverlapPreset>(initOverlap);
  const [asymmetric, setAsymmetric] = useState(initAsymmetric);
  const [symBorder, setSymBorder] = useState(initSymBorder);
  const [borderT, setBorderT] = useState(initT);
  const [borderR, setBorderR] = useState(initR);
  const [borderB, setBorderB] = useState(initB);
  const [borderL, setBorderL] = useState(initL);

  const border: Border = asymmetric
    ? { kind: 'asymmetric', top: borderT, right: borderR, bottom: borderB, left: borderL }
    : { kind: 'symmetric', border: symBorder };

  const result = useMemo(() => {
    try { return calculate({ artW, artH, border, overlap }); }
    catch (e) { return e instanceof MatMathError ? { error: e.message } : { error: 'Math error' }; }
  }, [artW, artH, border, overlap]);

  // Debounce-save to recent: 1.5s after last input change
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if ('error' in result) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveRecent({
        artW,
        artH,
        kind: asymmetric ? 'asymmetric' : 'symmetric',
        ...(asymmetric
          ? { top: borderT, right: borderR, bottom: borderB, left: borderL }
          : { border: symBorder }),
        overlap,
        outerW: result.outerW,
        outerH: result.outerH,
      });
    }, 1500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [artW, artH, asymmetric, symBorder, borderT, borderR, borderB, borderL, overlap, result]);

  return (
    <main className="min-h-[100dvh] bg-paper text-ink px-5 py-8 max-w-md mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <Link to="/" className="text-sm text-graphite hover:text-ink transition-colors">
          ← Matmatic
        </Link>
        <Link
          to="/profile"
          className="text-sm text-graphite hover:text-ink transition-colors"
        >
          Recent
        </Link>
      </header>

      <p
        className="font-serif font-medium uppercase text-pigment mb-6"
        style={{ fontSize: '11px', letterSpacing: '0.18em' }}
      >
        Calculate · your mat
      </p>

      <section className="space-y-6">
        <DimensionEntry label="Artwork width"  value={artW} onChange={setArtW} />
        <DimensionEntry label="Artwork height" value={artH} onChange={setArtH} />
        <AsymmetricToggle value={asymmetric} onChange={setAsymmetric} />
        {asymmetric ? (
          <div className="space-y-3 pl-3 border-l border-ink/10">
            <DimensionEntry label="Top border"    value={borderT} onChange={setBorderT} />
            <DimensionEntry label="Right border"  value={borderR} onChange={setBorderR} />
            <DimensionEntry label="Bottom border" value={borderB} onChange={setBorderB} />
            <DimensionEntry label="Left border"   value={borderL} onChange={setBorderL} />
          </div>
        ) : (
          <DimensionEntry label="Border" value={symBorder} onChange={setSymBorder} />
        )}
      </section>

      <section className="my-10">
        {'error' in result ? (
          <div className="text-pigment text-base">{result.error}</div>
        ) : (
          <>
            <MatPreview artW={artW} artH={artH} border={border} result={result} />
            <p className="text-center mt-4 text-base tabular-nums">
              Outer: <strong>{toFractionString(result.outerW)} × {toFractionString(result.outerH)}"</strong>
            </p>
            <OpticalCenteringHint border={border} result={result} onApply={(b) => {
              setBorderT(b.top); setBorderR(b.right); setBorderB(b.bottom); setBorderL(b.left);
              setAsymmetric(true);
            }} />
            {result.warnings.length > 0 && (
              <ul className="mt-4 space-y-1 text-sm text-graphite">
                {result.warnings.map((w, i) => <li key={i}>· {w}</li>)}
              </ul>
            )}
          </>
        )}
      </section>

      {!('error' in result) && <DropshipCTA result={result} />}
    </main>
  );
}
