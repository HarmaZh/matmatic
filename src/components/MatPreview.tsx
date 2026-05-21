import type { Border } from '../../packages/core/src/math';

export default function MatPreview({ artW, artH, border, result }: {
  artW: number; artH: number; border: Border;
  result: { outerW: number; outerH: number; openingW: number; openingH: number };
}) {
  const sx = 320 / Math.max(result.outerW, result.outerH);
  const w = result.outerW * sx;
  const h = result.outerH * sx;
  const bt = border.kind === 'symmetric' ? border.border : border.top;
  const bl = border.kind === 'symmetric' ? border.border : border.left;
  const innerW = artW * sx;
  const innerH = artH * sx;

  return (
    <div className="flex justify-center">
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="rounded-sm" aria-label="Mat preview">
        <rect x="0" y="0" width={w} height={h} fill="#EDE5D3" stroke="#1F1B17" strokeWidth="0.5" />
        <rect
          x={bl * sx} y={bt * sx}
          width={innerW} height={innerH}
          fill="#9C3E2C" fillOpacity="0.18"
          stroke="#1F1B17" strokeWidth="0.5"
        />
      </svg>
    </div>
  );
}
