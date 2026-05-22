import { useState } from 'react';
import { loadSeries, saveSeries, deleteSeries, type Series, type SeriesItem } from '../lib/series';
import { toFractionString } from '../../packages/core/src/math';

const MAX_SERIES = 6;
const MAX_ITEMS = 24;

function SeriesCard({
  series,
  onDelete,
}: {
  series: Series;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const marginLabel =
    series.sharedMargin.kind === 'symmetric'
      ? `${toFractionString(series.sharedMargin.border)}" symmetric`
      : `T/R/L ${toFractionString(series.sharedMargin.topRL)}" · B ${toFractionString(series.sharedMargin.bottom)}"`;

  return (
    <div
      className="rounded-[6px] border border-ink/[0.08] bg-mat-cream/30 px-4 py-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-serif text-ink font-medium leading-snug">{series.name}</p>
          <p className="text-graphite mt-0.5" style={{ fontSize: '12px', fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>
            {series.items.length} {series.items.length === 1 ? 'piece' : 'pieces'}
            &nbsp;&middot;&nbsp;
            {marginLabel}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-graphite hover:text-ink text-sm transition-colors min-h-[44px] px-2 flex items-center"
          >
            {expanded ? 'Hide' : 'Items'}
          </button>
          <button
            onClick={onDelete}
            className="text-graphite hover:text-ink text-sm transition-colors min-h-[44px] px-2 flex items-center"
            aria-label={`Delete series ${series.name}`}
          >
            &times;
          </button>
        </div>
      </div>

      {expanded && series.items.length > 0 && (
        <ul className="mt-3 border-t border-ink/[0.06] pt-3 space-y-1.5">
          {series.items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 text-sm"
            >
              <span className="font-mono tabular-nums text-ink" style={{ fontSize: '12px' }}>
                {item.artW} × {item.artH}"
              </span>
              {item.label && (
                <span className="text-graphite truncate" style={{ fontSize: '12px' }}>
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SeriesPage() {
  const [allSeries, setAllSeries] = useState<Series[]>(loadSeries);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBorder, setNewBorder] = useState(2);

  const handleDelete = (id: string) => {
    deleteSeries(id);
    setAllSeries(loadSeries());
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    if (allSeries.length >= MAX_SERIES) {
      setErrorMsg('Series limit reached — you can have up to 6 series.');
      return;
    }

    const defaultItem: SeriesItem = {
      id: crypto.randomUUID(),
      artW: 8,
      artH: 10,
      label: 'Piece 1',
    };

    const s: Series = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      sharedMargin: { kind: 'symmetric', border: newBorder },
      items: [defaultItem],
      ts: Date.now(),
    };

    const result = saveSeries(s);
    if (result.ok) {
      setAllSeries(loadSeries());
      setNewName('');
      setNewBorder(2);
      setCreating(false);
      setErrorMsg(null);
    } else if (result.reason === 'SERIES_CAP') {
      setErrorMsg('Series limit reached — you can have up to 6 series.');
    } else if (result.reason === 'ITEMS_CAP') {
      setErrorMsg(`Each series is limited to ${MAX_ITEMS} pieces.`);
    } else {
      setErrorMsg('Storage is full. Delete a series and try again.');
    }
  };

  return (
    <main className="bg-paper text-ink px-5 pt-10 pb-8 max-w-md mx-auto">
      {/* Eyebrow */}
      <p
        className="font-serif font-medium uppercase text-pigment mb-3"
        style={{ fontSize: '11px', letterSpacing: '0.18em' }}
      >
        Series
      </p>

      {/* H1 */}
      <h1 className="font-serif text-[36px] font-medium leading-tight tracking-tight mb-2">
        Bodies of work
      </h1>

      <p className="text-graphite mb-6" style={{ fontSize: '14px' }}>
        Apply one margin system across a body of work. Up to {MAX_SERIES} series, {MAX_ITEMS} pieces each.
      </p>

      {errorMsg && (
        <div className="mb-4 text-pigment text-sm">{errorMsg}</div>
      )}

      {/* Empty state */}
      {allSeries.length === 0 && !creating ? (
        <div
          className="rounded-[6px] flex flex-col items-center justify-center text-center py-12 px-6 mb-6"
          style={{ border: '1px dashed rgba(31,27,23,0.20)' }}
        >
          <p className="font-serif text-ink text-lg font-medium mb-2">No series yet.</p>
          <p className="text-graphite mb-6" style={{ fontSize: '14px', maxWidth: '24ch' }}>
            Group pieces that share a mat margin. Good for editions, portfolios, installations.
          </p>
          <button
            onClick={() => setCreating(true)}
            className="font-serif text-lg bg-pigment text-paper rounded-[4px] transition-transform active:scale-[0.97] px-6"
            style={{ minHeight: '48px', lineHeight: '48px' }}
          >
            Start a series
          </button>
        </div>
      ) : (
        <div className="space-y-3 mb-6">
          {allSeries.map((s) => (
            <SeriesCard
              key={s.id}
              series={s}
              onDelete={() => handleDelete(s.id)}
            />
          ))}
        </div>
      )}

      {/* Inline create */}
      {creating ? (
        <div
          className="rounded-[4px] border border-pigment/40 bg-mat-cream/30 px-4 py-4 space-y-4"
        >
          <div>
            <label className="block text-xs uppercase tracking-wider text-graphite mb-2">
              Series name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
              placeholder="e.g. Portland 2026"
              autoFocus
              className="w-full h-12 rounded-[4px] border border-ink/[0.15] bg-paper px-3 font-serif text-base text-ink focus:outline-none focus:ring-2 focus:ring-pigment"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-graphite mb-2">
              Shared border (inches)
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setNewBorder((b) => Math.max(0, Math.round((b - 0.125) * 8) / 8))}
                className="w-10 h-10 rounded-[4px] border border-ink/[0.12] text-ink text-lg flex items-center justify-center hover:bg-ink/5 active:scale-[0.97] transition-transform"
              >
                -
              </button>
              <span className="font-mono tabular-nums text-ink text-lg min-w-[3rem] text-center">
                {newBorder}"
              </span>
              <button
                onClick={() => setNewBorder((b) => Math.min(10, Math.round((b + 0.125) * 8) / 8))}
                className="w-10 h-10 rounded-[4px] border border-ink/[0.12] text-ink text-lg flex items-center justify-center hover:bg-ink/5 active:scale-[0.97] transition-transform"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              className="px-5 py-2 rounded-[4px] bg-pigment text-paper font-serif text-sm transition-transform active:scale-[0.97]"
            >
              Create series
            </button>
            <button
              onClick={() => { setCreating(false); setNewName(''); }}
              className="px-5 py-2 text-graphite text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : allSeries.length > 0 && allSeries.length < MAX_SERIES ? (
        <button
          onClick={() => setCreating(true)}
          className="block w-full text-center py-3 rounded-[4px] border border-ink/[0.12] text-graphite hover:text-ink text-sm transition-colors"
        >
          + New series
        </button>
      ) : allSeries.length >= MAX_SERIES ? (
        <p className="text-center text-graphite text-sm">
          Series limit reached ({MAX_SERIES} of {MAX_SERIES}).
        </p>
      ) : null}
    </main>
  );
}
