import { Link } from 'react-router-dom';
import { toFractionString, type MatOutput } from '../../packages/core/src/math';

function buildCutListText(result: MatOutput): string {
  const lines = [
    `Mat outer:    ${toFractionString(result.outerW, { unicode: true })} × ${toFractionString(result.outerH, { unicode: true })}"`,
    `Opening:      ${toFractionString(result.openingW, { unicode: true })} × ${toFractionString(result.openingH, { unicode: true })}"`,
    `Foam core:    ${toFractionString(result.foamcoreW, { unicode: true })} × ${toFractionString(result.foamcoreH, { unicode: true })}"`,
    `Glass:        ${toFractionString(result.glassW, { unicode: true })} × ${toFractionString(result.glassH, { unicode: true })}"`,
  ];
  if (result.topOpeningW !== undefined && result.topOpeningH !== undefined) {
    lines.push(`Top opening:  ${toFractionString(result.topOpeningW, { unicode: true })} × ${toFractionString(result.topOpeningH, { unicode: true })}"`);
  }
  if (result.bottomOpeningW !== undefined && result.bottomOpeningH !== undefined) {
    lines.push(`Bot opening:  ${toFractionString(result.bottomOpeningW, { unicode: true })} × ${toFractionString(result.bottomOpeningH, { unicode: true })}"`);
  }
  return lines.join('\n');
}

export default function CutListPanel({
  result,
  calcId,
}: {
  result: MatOutput;
  calcId: string | null;
}) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildCutListText(result));
  };

  return (
    <div className="mt-8 space-y-4">
      {/* Inline summary */}
      <div className="rounded-[4px] border border-ink/[0.10] bg-mat-cream/50 px-4 py-3 font-mono tabular-nums text-sm text-ink space-y-1">
        <div className="flex justify-between">
          <span className="text-graphite">Outer</span>
          <span>{toFractionString(result.outerW)} × {toFractionString(result.outerH)}"</span>
        </div>
        <div className="flex justify-between">
          <span className="text-graphite">Opening</span>
          <span>{toFractionString(result.openingW)} × {toFractionString(result.openingH)}"</span>
        </div>
        <div className="flex justify-between">
          <span className="text-graphite">Foam core</span>
          <span>{toFractionString(result.foamcoreW)} × {toFractionString(result.foamcoreH)}"</span>
        </div>
        <div className="flex justify-between">
          <span className="text-graphite">Glass</span>
          <span>{toFractionString(result.glassW)} × {toFractionString(result.glassH)}"</span>
        </div>
      </div>

      {/* Primary action */}
      <button
        onClick={handleCopy}
        className="block w-full text-center py-4 rounded-[4px] bg-pigment text-paper font-serif text-lg transition-transform active:scale-[0.97] hover:opacity-95"
      >
        Copy cut list
      </button>

      {/* Secondary: saving state vs active link */}
      <div className="text-center">
        {calcId === null ? (
          <span className="text-graphite text-sm">
            View as cut list{' '}
            <em className="not-italic text-graphite/60">(saving…)</em>
          </span>
        ) : (
          <Link
            to={`/calc/${calcId}/cutlist`}
            className="text-pigment text-sm hover:opacity-80 transition-opacity"
          >
            View as cut list →
          </Link>
        )}
      </div>
    </div>
  );
}
