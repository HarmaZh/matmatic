import type { Border } from '../../packages/core/src/math';

export default function OpticalCenteringHint({ border, result, onApply }: {
  border: Border;
  result: { outerH: number };
  onApply: (b: { top: number; right: number; bottom: number; left: number }) => void;
}) {
  const symmetric = border.kind === 'symmetric';
  if (!symmetric) return null;
  const mult = result.outerH < 16 ? 1.15 : 1.20;
  const newBottom = +(border.border * mult).toFixed(4);
  const apply = () => onApply({ top: border.border, right: border.border, bottom: newBottom, left: border.border });

  return (
    <div className="mt-4 rounded-md border border-ink/10 bg-mat-cream/60 px-4 py-3 text-sm">
      <p className="text-ink mb-2"><span aria-hidden>⚖</span> Optical center: bottom border ~{Math.round((mult - 1) * 100)}% taller balances visual weight.</p>
      <div className="flex gap-2">
        <button onClick={apply} className="px-3 py-1.5 rounded-md bg-pigment text-paper text-sm transition-transform active:scale-[0.97]">Apply</button>
      </div>
    </div>
  );
}
