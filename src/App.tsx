import { useState, useMemo } from 'react';
import { calculate, toFractionString, type Border, type OverlapPreset, MatMathError } from '../packages/core/src/math';
import DimensionEntry from './components/DimensionEntry';
import AsymmetricToggle from './components/AsymmetricToggle';
import MatPreview from './components/MatPreview';
import DropshipCTA from './components/DropshipCTA';
import OpticalCenteringHint from './components/OpticalCenteringHint';

export default function App() {
  const [artW, setArtW] = useState(8);
  const [artH, setArtH] = useState(10);
  const [overlap] = useState<OverlapPreset>(0.25);
  const [asymmetric, setAsymmetric] = useState(false);
  const [symBorder, setSymBorder] = useState(2);
  const [borderT, setBorderT] = useState(2);
  const [borderR, setBorderR] = useState(2);
  const [borderB, setBorderB] = useState(2);
  const [borderL, setBorderL] = useState(2);

  const border: Border = asymmetric
    ? { kind: 'asymmetric', top: borderT, right: borderR, bottom: borderB, left: borderL }
    : { kind: 'symmetric', border: symBorder };

  const result = useMemo(() => {
    try { return calculate({ artW, artH, border, overlap }); }
    catch (e) { return e instanceof MatMathError ? { error: e.message } : { error: 'Math error' }; }
  }, [artW, artH, border, overlap]);

  return (
    <main className="min-h-[100dvh] bg-paper text-ink px-5 py-8 max-w-md mx-auto">
      <header className="mb-8">
        <h1 className="font-serif text-5xl font-medium tracking-tight">Matmatic</h1>
        <p className="text-graphite text-base mt-1">Mat math for artists. Free.</p>
      </header>

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
