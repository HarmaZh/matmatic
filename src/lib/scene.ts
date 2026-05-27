/**
 * Canvas scene renderer for the Matmatic visualizer ("the picture part").
 *
 * Composites a wall + frame + mat board + the artist's uploaded artwork into a
 * single export-quality canvas. This is the SINGLE source of truth for both the
 * on-screen preview and the exported image — the on-screen <canvas> is rendered
 * at full export resolution and CSS-downscaled, so toBlob() on the live canvas
 * IS the export (no separate offscreen pass).
 *
 * Colors here are FIXED product colors, intentionally decoupled from the UI
 * theme (paper-light / paper-dark). A physical cream mat stays cream whether the
 * app chrome is light or dark — the mockup is a standalone shareable image.
 * (Canvas cannot read CSS vars anyway; see index.css.)
 */

export type FrameStyle = 'none' | 'black' | 'wood' | 'white' | 'brass';
export type WallId = 'gallery' | 'plaster' | 'charcoal' | 'linen';

export const FRAMES: { id: FrameStyle; label: string }[] = [
  { id: 'none',  label: 'No frame' },
  { id: 'black', label: 'Black' },
  { id: 'wood',  label: 'Wood' },
  { id: 'white', label: 'White' },
  { id: 'brass', label: 'Brass' },
];

export const WALLS: { id: WallId; label: string }[] = [
  { id: 'gallery',  label: 'Gallery' },
  { id: 'plaster',  label: 'Plaster' },
  { id: 'charcoal', label: 'Charcoal' },
  { id: 'linen',    label: 'Linen' },
];

export interface Scene {
  outerW: number;       // mat outer width, inches
  outerH: number;       // mat outer height, inches
  openingW: number;     // window width, inches
  openingH: number;     // window height, inches
  borderLeftIn: number; // left border (opening x-offset within mat), inches
  borderTopIn: number;  // top border (opening y-offset within mat), inches
  frame: FrameStyle;
  frameWidthIn: number; // frame band width, inches (ignored when frame === 'none')
  wall: WallId;
  art: CanvasImageSource | null;
  artNatW: number;      // artwork natural pixel width (for cover-fit)
  artNatH: number;      // artwork natural pixel height
  watermark: boolean;   // free tier draws a "made with matmatic" mark
}

const MAT_CREAM = '#EDE5D3';
const MAT_BEVEL = '#FBF9F4'; // bright cut-mat core

interface WallSpec {
  top: string;
  bottom: string;
  floor: string;   // bottom band tone (wall-meets-floor)
  vignette: number; // 0..1 corner darkening strength
}

const WALL_SPECS: Record<WallId, WallSpec> = {
  gallery:  { top: '#FAFAF8', bottom: '#EBE9E3', floor: '#E0DDD5', vignette: 0.10 },
  plaster:  { top: '#F0E8D9', bottom: '#E1D5C0', floor: '#D6C8AF', vignette: 0.12 },
  charcoal: { top: '#332F2A', bottom: '#211F1C', floor: '#191715', vignette: 0.22 },
  linen:    { top: '#E8E0D1', bottom: '#D9CEB9', floor: '#CCC0A6', vignette: 0.13 },
};

interface FrameSpec {
  base: string;
  highlight: string; // top/left inner bevel
  shadow: string;    // bottom/right inner bevel
  gradient?: [string, string]; // optional vertical sheen
}

const FRAME_SPECS: Record<Exclude<FrameStyle, 'none'>, FrameSpec> = {
  black: { base: '#1C1A17', highlight: '#3C372F', shadow: '#000000' },
  wood:  { base: '#9A7B52', highlight: '#BE9A6C', shadow: '#6E552F', gradient: ['#A98A63', '#86683F'] as [string, string] },
  white: { base: '#F4F1EA', highlight: '#FFFFFF', shadow: '#D7D1C4' },
  brass: { base: '#B79A5B', highlight: '#D6BE84', shadow: '#8C7235', gradient: ['#C6AC6F', '#9C7F44'] as [string, string] },
};

/** Fill the wall background: vertical gradient + floor band + corner vignette. */
function drawWall(ctx: CanvasRenderingContext2D, w: number, h: number, wall: WallId): void {
  const spec = WALL_SPECS[wall];

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, spec.top);
  grad.addColorStop(1, spec.bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Floor band — bottom ~16% reads as where the wall meets the floor.
  const floorY = h * 0.84;
  const floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
  floorGrad.addColorStop(0, spec.bottom);
  floorGrad.addColorStop(1, spec.floor);
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, floorY, w, h - floorY);

  // Corner vignette.
  const vig = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.2, w / 2, h / 2, Math.max(w, h) * 0.75);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, `rgba(0,0,0,${spec.vignette})`);
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

/** Cover-fit the artwork into the opening rect (clipped). */
function drawArt(ctx: CanvasRenderingContext2D, s: Scene, ox: number, oy: number, ow: number, oh: number): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(ox, oy, ow, oh);
  ctx.clip();

  if (s.art && s.artNatW > 0 && s.artNatH > 0) {
    const artAR = s.artNatW / s.artNatH;
    const opAR = ow / oh;
    let dw: number, dh: number;
    if (artAR > opAR) { dh = oh; dw = oh * artAR; } // art wider — match height, overflow width
    else { dw = ow; dh = ow / artAR; }              // art taller — match width, overflow height
    ctx.drawImage(s.art, ox + (ow - dw) / 2, oy + (oh - dh) / 2, dw, dh);
  } else {
    // Placeholder window: faint pigment wash + hint text.
    ctx.fillStyle = 'rgba(156,62,44,0.10)';
    ctx.fillRect(ox, oy, ow, oh);
    ctx.fillStyle = 'rgba(92,84,74,0.85)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${Math.round(Math.min(ow, oh) * 0.05)}px Georgia, serif`;
    ctx.fillText('Your artwork here', ox + ow / 2, oy + oh / 2);
  }
  ctx.restore();
}

/** Cut-mat bevel around the opening: bright inner core + ink hairline at the edge. */
function drawBevel(ctx: CanvasRenderingContext2D, ox: number, oy: number, ow: number, oh: number, ppi: number): void {
  const bevel = Math.max(2, ppi * 0.06);
  ctx.lineWidth = bevel;
  ctx.strokeStyle = MAT_BEVEL;
  ctx.strokeRect(ox - bevel / 2, oy - bevel / 2, ow + bevel, oh + bevel);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(31,27,23,0.55)';
  ctx.strokeRect(ox - 0.5, oy - 0.5, ow + 1, oh + 1);
}

/**
 * Render the full scene to ctx. Uses ctx.canvas.width/height as the logical
 * (export) resolution — set that before calling.
 */
export function renderScene(ctx: CanvasRenderingContext2D, s: Scene): void {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  ctx.clearRect(0, 0, W, H);

  drawWall(ctx, W, H, s.wall);

  const fw = s.frame === 'none' ? 0 : s.frameWidthIn;
  const pieceW = s.outerW + 2 * fw; // total physical width incl. frame
  const pieceH = s.outerH + 2 * fw;

  // Fit the piece into ~64% of the smaller canvas dimension, nudged up slightly.
  const ppi = (Math.min(W, H) * 0.64) / Math.max(pieceW, pieceH);
  const totalW = pieceW * ppi;
  const totalH = pieceH * ppi;
  const fx = (W - totalW) / 2;
  const fy = (H - totalH) / 2 * 0.82;

  const fwPx = fw * ppi;
  const matX = fx + fwPx;
  const matY = fy + fwPx;
  const matW = s.outerW * ppi;
  const matH = s.outerH * ppi;

  // Contact shadow on the wall.
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.38)';
  ctx.shadowBlur = Math.max(8, ppi * 0.5);
  ctx.shadowOffsetX = ppi * 0.06;
  ctx.shadowOffsetY = ppi * 0.16;
  ctx.fillStyle = '#000';
  ctx.fillRect(fx, fy, totalW, totalH);
  ctx.restore();

  // Frame band.
  if (fw > 0) {
    const spec = FRAME_SPECS[s.frame as Exclude<FrameStyle, 'none'>];
    if (spec.gradient) {
      const g = ctx.createLinearGradient(fx, fy, fx, fy + totalH);
      g.addColorStop(0, spec.gradient[0]);
      g.addColorStop(1, spec.gradient[1]);
      ctx.fillStyle = g;
    } else {
      ctx.fillStyle = spec.base;
    }
    ctx.fillRect(fx, fy, totalW, totalH);

    // Inner bevel: highlight on top/left, shadow on bottom/right of the frame band.
    ctx.lineWidth = Math.max(1, fwPx * 0.12);
    ctx.strokeStyle = spec.highlight;
    ctx.beginPath();
    ctx.moveTo(matX, matY + matH); ctx.lineTo(matX, matY); ctx.lineTo(matX + matW, matY);
    ctx.stroke();
    ctx.strokeStyle = spec.shadow;
    ctx.beginPath();
    ctx.moveTo(matX + matW, matY); ctx.lineTo(matX + matW, matY + matH); ctx.lineTo(matX, matY + matH);
    ctx.stroke();
    // Outer edge darkening for depth.
    ctx.lineWidth = Math.max(1, ppi * 0.02);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.strokeRect(fx + 0.5, fy + 0.5, totalW - 1, totalH - 1);
  }

  // Mat board.
  ctx.fillStyle = MAT_CREAM;
  ctx.fillRect(matX, matY, matW, matH);

  // Opening (window) + artwork.
  const ox = matX + s.borderLeftIn * ppi;
  const oy = matY + s.borderTopIn * ppi;
  const ow = s.openingW * ppi;
  const oh = s.openingH * ppi;
  drawArt(ctx, s, ox, oy, ow, oh);
  drawBevel(ctx, ox, oy, ow, oh, ppi);

  // Watermark (free tier).
  if (s.watermark) {
    ctx.save();
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.font = `${Math.round(H * 0.018)}px Georgia, serif`;
    ctx.fillStyle = 'rgba(31,27,23,0.45)';
    ctx.fillText('made with matmatic', W - H * 0.025, H - H * 0.025);
    ctx.restore();
  }
}

/** Choose a logical canvas resolution from the framed-piece aspect ratio. */
export function canvasSizeFor(pieceAR: number): { w: number; h: number } {
  if (pieceAR > 1.25) return { w: 1440, h: 1080 };
  if (pieceAR < 0.8)  return { w: 1080, h: 1440 };
  return { w: 1240, h: 1240 };
}
