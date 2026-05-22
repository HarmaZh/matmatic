import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '../lib/useLocalStorage';
import { DEFAULT_PROFILE, saveProfile, type Profile, type Preset } from '../lib/profile';
import { toFractionString } from '../../packages/core/src/math';

const MAX_PRESETS = 12;

function buildCalcUrl(preset: Preset): string {
  const p = new URLSearchParams();
  p.set('w', String(preset.artW));
  p.set('h', String(preset.artH));
  p.set('overlap', String(preset.overlap));
  if (preset.border.kind === 'asymmetric') {
    p.set('t', String(preset.border.top));
    p.set('r', String(preset.border.right));
    p.set('b', String(preset.border.bottom));
    p.set('l', String(preset.border.left));
  } else {
    p.set('border', String(preset.border.border));
  }
  return `/calc?${p.toString()}`;
}

export default function PresetsPage() {
  const [profile, setProfile] = useLocalStorage<Profile>('matmatic.profile', DEFAULT_PROFILE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Inline create form state
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');

  const deletePreset = (id: string) => {
    const next = { ...profile, presets: profile.presets.filter((p) => p.id !== id) };
    const result = saveProfile(next);
    if (result.ok) setProfile(next);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    if (profile.presets.length >= MAX_PRESETS) {
      setErrorMsg(`Preset limit reached — you can store up to ${MAX_PRESETS} presets.`);
      return;
    }
    const preset: Preset = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      artW: 8,
      artH: 10,
      border: { kind: 'symmetric', border: profile.defaultBorder },
      overlap: profile.defaultOverlap,
      ts: Date.now(),
    };
    const next = { ...profile, presets: [...profile.presets, preset] };
    const result = saveProfile(next);
    if (result.ok) {
      setProfile(next);
      setNewName('');
      setCreating(false);
      setErrorMsg(null);
    } else if (result.reason === 'QUOTA_EXCEEDED') {
      setErrorMsg('Storage is full. Delete a preset and try again.');
    } else if (result.reason === 'PRESET_CAP') {
      setErrorMsg(`Preset limit reached — you can store up to ${MAX_PRESETS} presets.`);
    }
  };

  return (
    <main className="bg-paper text-ink px-5 pt-10 pb-8 max-w-md mx-auto">
      {/* Eyebrow */}
      <p
        className="font-serif font-medium uppercase text-pigment mb-3"
        style={{ fontSize: '11px', letterSpacing: '0.18em' }}
      >
        Presets
      </p>

      {/* H1 */}
      <h1 className="font-serif text-[36px] font-medium leading-tight tracking-tight mb-2">
        Saved mat recipes
      </h1>

      <p className="text-graphite mb-6" style={{ fontSize: '14px' }}>
        Named setups you return to. Up to {MAX_PRESETS}.
      </p>

      {errorMsg && (
        <div className="mb-4 text-pigment text-sm">{errorMsg}</div>
      )}

      {/* Cap message */}
      {profile.presets.length >= MAX_PRESETS && (
        <div
          className="mb-6 px-4 py-3 rounded-[4px] text-sm text-graphite"
          style={{ border: '1px solid rgba(31,27,23,0.12)' }}
        >
          {MAX_PRESETS} presets max — delete one to add another.
        </div>
      )}

      {/* Preset list */}
      {profile.presets.length === 0 && !creating ? (
        <div
          className="rounded-[6px] flex flex-col items-center justify-center text-center py-10 px-6 mb-6"
          style={{ border: '1px dashed rgba(31,27,23,0.20)' }}
        >
          <p className="text-graphite font-serif leading-snug mb-4" style={{ fontSize: '16px' }}>
            No presets yet.
          </p>
        </div>
      ) : (
        <ul className="space-y-2 mb-6">
          {profile.presets.map((preset) => (
            <li
              key={preset.id}
              className="rounded-[4px] border border-ink/[0.08] bg-mat-cream/40 px-4 py-3 grid items-center gap-3"
              style={{ gridTemplateColumns: '1fr auto auto' }}
            >
              <div>
                <p className="font-serif text-ink font-medium leading-snug">{preset.name}</p>
                <p className="text-graphite mt-0.5" style={{ fontSize: '12px', fontFamily: '"JetBrains Mono", ui-monospace, monospace' }}>
                  {preset.artW} × {preset.artH}"
                  &nbsp;&middot;&nbsp;
                  {preset.border.kind === 'symmetric'
                    ? `${toFractionString(preset.border.border)}" border`
                    : 'asymmetric'}
                </p>
              </div>

              <Link
                to={buildCalcUrl(preset)}
                className="text-pigment font-medium text-sm hover:opacity-80 transition-opacity px-2 py-2 min-h-[44px] flex items-center"
              >
                Apply →
              </Link>

              <button
                onClick={() => deletePreset(preset.id)}
                className="text-graphite hover:text-ink transition-colors text-sm px-2 py-2 min-h-[44px] flex items-center"
                aria-label={`Delete preset ${preset.name}`}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Inline create card */}
      {creating ? (
        <div
          className="rounded-[4px] border border-pigment/40 bg-mat-cream/30 px-4 py-4 space-y-3"
        >
          <label className="block text-xs uppercase tracking-wider text-graphite">
            Preset name
          </label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false); }}
            placeholder="e.g. 8x10 standard"
            autoFocus
            className="w-full h-12 rounded-[4px] border border-ink/[0.15] bg-paper px-3 font-serif text-base text-ink focus:outline-none focus:ring-2 focus:ring-pigment"
          />
          <p className="text-graphite" style={{ fontSize: '12px' }}>
            Uses your current account defaults for art size and border.
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              className="px-5 py-2 rounded-[4px] bg-pigment text-paper font-serif text-sm transition-transform active:scale-[0.97]"
            >
              Save preset
            </button>
            <button
              onClick={() => { setCreating(false); setNewName(''); }}
              className="px-5 py-2 text-graphite text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : profile.presets.length < MAX_PRESETS ? (
        <button
          onClick={() => setCreating(true)}
          className="block w-full text-center py-3 rounded-[4px] border border-ink/[0.12] text-graphite hover:text-ink text-sm transition-colors"
        >
          + New preset
        </button>
      ) : null}
    </main>
  );
}
