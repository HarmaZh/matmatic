import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { calculate, type Border, type OverlapPreset, MatMathError } from '../../packages/core/src/math';
import { useLocalStorage } from '../lib/useLocalStorage';
import { DEFAULT_PROFILE, type Profile } from '../lib/profile';
import { saveMockup } from '../lib/mockups';
import { getArt } from '../lib/idb';
import {
  renderScene, canvasSizeFor, FRAMES, WALLS,
  type Scene, type FrameStyle, type WallId,
} from '../lib/scene';

const FRAME_WIDTH_IN = 1.75;

const isFrame = (v: string | null): v is FrameStyle => !!v && FRAMES.some((f) => f.id === v);
const isWall = (v: string | null): v is WallId => !!v && WALLS.some((w) => w.id === v);

/** Downscale the live canvas into a small JPEG dataURL for the history grid. */
function makeThumb(canvas: HTMLCanvasElement): string {
  const t = document.createElement('canvas');
  const maxW = 320;
  const scale = maxW / canvas.width;
  t.width = maxW;
  t.height = Math.round(canvas.height * scale);
  const ctx = t.getContext('2d');
  if (!ctx) return '';
  ctx.drawImage(canvas, 0, 0, t.width, t.height);
  return t.toDataURL('image/jpeg', 0.7);
}

export default function VisualizerPage() {
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useLocalStorage<Profile>('matmatic.profile', DEFAULT_PROFILE);
  const premium = profile.premium;

  // Hydrate calc from URL params (same contract as CalcPage), fall back to defaults.
  const artW = Number(searchParams.get('w')) || 8;
  const artH = Number(searchParams.get('h')) || 10;
  const overlap = (Number(searchParams.get('overlap')) || profile.defaultOverlap) as OverlapPreset;
  const asymmetric = !!(searchParams.get('t') || searchParams.get('r') || searchParams.get('b') || searchParams.get('l'));
  const symBorder = Number(searchParams.get('border')) || profile.defaultBorder;
  const bT = Number(searchParams.get('t')) || profile.defaultBorder;
  const bR = Number(searchParams.get('r')) || profile.defaultBorder;
  const bB = Number(searchParams.get('b')) || profile.defaultBorder;
  const bL = Number(searchParams.get('l')) || profile.defaultBorder;

  const border: Border = asymmetric
    ? { kind: 'asymmetric', top: bT, right: bR, bottom: bB, left: bL }
    : { kind: 'symmetric', border: symBorder };

  const result = useMemo(() => {
    try { return calculate({ artW, artH, border, overlap }); }
    catch (e) { return e instanceof MatMathError ? { error: e.message } : { error: 'Math error' }; }
  }, [artW, artH, border, overlap]);

  const frameParam = searchParams.get('frame');
  const wallParam = searchParams.get('wall');
  const [frame, setFrame] = useState<FrameStyle>(isFrame(frameParam) ? frameParam : 'black');
  const [wall, setWall] = useState<WallId>(isWall(wallParam) ? wallParam : 'gallery');
  const [art, setArt] = useState<ImageBitmap | null>(null);
  const [artBlob, setArtBlob] = useState<Blob | null>(null);
  const [artDims, setArtDims] = useState({ w: 0, h: 0 });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Restore a saved mockup's artwork from IndexedDB (calc/frame/wall come from the URL).
  const mockupId = searchParams.get('mockup');
  const restoredId = useRef<string | null>(null);
  useEffect(() => {
    if (!mockupId || restoredId.current === mockupId) return;
    restoredId.current = mockupId;
    (async () => {
      const blob = await getArt(mockupId);
      if (!blob) return;
      const bmp = await createImageBitmap(blob, { imageOrientation: 'from-image' }).catch(() => createImageBitmap(blob));
      setArt(bmp);
      setArtBlob(blob);
      setArtDims({ w: bmp.width, h: bmp.height });
    })();
  }, [mockupId]);

  // Build the scene from calc result + visual choices.
  const scene: Scene | null = useMemo(() => {
    if ('error' in result) return null;
    const borderLeftIn = asymmetric ? bL : symBorder;
    const borderTopIn = asymmetric ? bT : symBorder;
    return {
      outerW: result.outerW,
      outerH: result.outerH,
      openingW: result.openingW,
      openingH: result.openingH,
      borderLeftIn,
      borderTopIn,
      frame,
      frameWidthIn: FRAME_WIDTH_IN,
      wall,
      art,
      artNatW: artDims.w,
      artNatH: artDims.h,
      watermark: !premium, // free tier exports carry a mark; Pro removes it
    };
  }, [result, asymmetric, bL, bT, symBorder, frame, wall, art, artDims, premium]);

  // Render whenever the scene changes. Canvas is sized to full export resolution
  // and CSS-downscaled, so the live canvas IS the export surface.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !scene) return;
    const fw = scene.frame === 'none' ? 0 : scene.frameWidthIn;
    const pieceAR = (scene.outerW + 2 * fw) / (scene.outerH + 2 * fw);
    const { w, h } = canvasSizeFor(pieceAR);
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (ctx) renderScene(ctx, scene);
  }, [scene]);

  const onUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
      setArt(bmp); setArtBlob(file); setArtDims({ w: bmp.width, h: bmp.height });
    } catch {
      const bmp = await createImageBitmap(file);
      setArt(bmp); setArtBlob(file); setArtDims({ w: bmp.width, h: bmp.height });
    } finally {
      e.target.value = '';
      setSaved(false);
    }
  }, []);

  const onExport = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    try {
      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92));
      if (!blob) return;
      const file = new File([blob], 'matmatic-mockup.jpg', { type: 'image/jpeg' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My framed artwork' });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'matmatic-mockup.jpg'; a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      /* user cancelled share, or unsupported — no-op */
    } finally {
      setBusy(false);
    }
  }, []);

  const unlockPro = useCallback(() => {
    // Concept-demo unlock — no billing backend. Flips a local flag only.
    if (window.confirm('Unlock Pro for this demo? (No payment — local only.)')) {
      setProfile({ ...profile, premium: true });
    }
  }, [profile, setProfile]);

  const onSaveToGallery = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !artBlob || 'error' in result) return;
    if (!premium) { unlockPro(); return; }
    setBusy(true);
    try {
      const id = await saveMockup({
        artW, artH, overlap,
        kind: asymmetric ? 'asymmetric' : 'symmetric',
        ...(asymmetric ? { top: bT, right: bR, bottom: bB, left: bL } : { border: symBorder }),
        frame, wall,
        thumb: makeThumb(canvas),
      }, artBlob);
      if (id) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
    } finally {
      setBusy(false);
    }
  }, [artBlob, result, premium, unlockPro, artW, artH, overlap, asymmetric, bT, bR, bB, bL, symBorder, frame, wall]);

  const calcParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set('w', String(artW)); p.set('h', String(artH)); p.set('overlap', String(overlap));
    if (asymmetric) { p.set('t', String(bT)); p.set('r', String(bR)); p.set('b', String(bB)); p.set('l', String(bL)); }
    else { p.set('border', String(symBorder)); }
    return p.toString();
  }, [artW, artH, overlap, asymmetric, bT, bR, bB, bL, symBorder]);

  return (
    <main className="bg-paper text-ink px-5 py-8 max-w-md mx-auto">
      <p
        className="font-serif font-medium uppercase text-pigment mb-6"
        style={{ fontSize: '11px', letterSpacing: '0.18em' }}
      >
        Visualize · on a wall
      </p>

      {scene === null ? (
        <div className="text-pigment text-base">
          {'error' in result ? result.error : 'Adjust your dimensions to preview.'}{' '}
          <Link to={`/calc?${calcParams}`} className="underline">Edit dimensions</Link>
        </div>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            className="block w-full h-auto rounded-sm shadow-sm"
            aria-label="Framed artwork preview"
          />

          <div className="mt-5 flex justify-center">
            <label className="cursor-pointer inline-flex items-center justify-center min-h-[48px] px-5 border border-ink/20 rounded-sm font-serif text-base active:bg-ink/[0.04]">
              {art ? 'Replace artwork' : 'Add your artwork'}
              <input type="file" accept="image/*" className="sr-only" onChange={onUpload} />
            </label>
          </div>

          <fieldset className="mt-8">
            <legend className="font-serif uppercase text-graphite mb-3" style={{ fontSize: '11px', letterSpacing: '0.14em' }}>
              Frame
            </legend>
            <div className="flex flex-wrap gap-2">
              {FRAMES.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFrame(id)}
                  className={[
                    'min-h-[44px] px-4 rounded-sm font-serif text-sm border',
                    frame === id ? 'border-pigment text-ink' : 'border-ink/15 text-graphite',
                  ].join(' ')}
                  style={frame === id ? { boxShadow: 'inset 0 -2px 0 #9C3E2C' } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="font-serif uppercase text-graphite mb-3" style={{ fontSize: '11px', letterSpacing: '0.14em' }}>
              Wall
            </legend>
            <div className="flex flex-wrap gap-2">
              {WALLS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setWall(id)}
                  className={[
                    'min-h-[44px] px-4 rounded-sm font-serif text-sm border',
                    wall === id ? 'border-pigment text-ink' : 'border-ink/15 text-graphite',
                  ].join(' ')}
                  style={wall === id ? { boxShadow: 'inset 0 -2px 0 #9C3E2C' } : undefined}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={onExport}
            disabled={busy}
            className="mt-8 w-full min-h-[52px] rounded-sm bg-ink text-paper font-serif text-base active:opacity-90 disabled:opacity-50"
          >
            {busy ? 'Preparing…' : 'Save / share image'}
          </button>

          <button
            type="button"
            onClick={onSaveToGallery}
            disabled={busy || !art}
            className="mt-3 w-full min-h-[48px] rounded-sm border border-ink/20 font-serif text-base text-ink active:bg-ink/[0.04] disabled:opacity-40"
          >
            {saved ? 'Saved to gallery ✓' : !art ? 'Add artwork to save' : premium ? 'Save to gallery' : 'Save to gallery · Pro'}
          </button>

          <p className="mt-4 text-center text-sm text-graphite">
            {premium ? (
              <span className="text-seal">Pro ✓ · clean exports</span>
            ) : (
              <>
                Free · exports watermarked.{' '}
                <button type="button" onClick={unlockPro} className="underline text-pigment">Unlock Pro</button>
              </>
            )}
          </p>

          <p className="mt-3 text-center text-sm text-graphite">
            <Link to={`/calc?${calcParams}`} className="underline">Edit dimensions</Link>
          </p>
        </>
      )}
    </main>
  );
}
