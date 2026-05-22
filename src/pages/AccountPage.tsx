import { useState } from 'react';
import { useLocalStorage } from '../lib/useLocalStorage';
import { DEFAULT_PROFILE, saveProfile, type Profile } from '../lib/profile';

type OverlapOption = { label: string; value: 0.125 | 0.25 | 0.375 };
const OVERLAPS: OverlapOption[] = [
  { label: '1/8"', value: 0.125 },
  { label: '1/4"', value: 0.25 },
  { label: '3/8"', value: 0.375 },
];

type ThemeOption = { label: string; value: 'paper-light' | 'paper-dark' };
const THEMES: ThemeOption[] = [
  { label: 'Light', value: 'paper-light' },
  { label: 'Dark',  value: 'paper-dark'  },
];

/**
 * Segmented control button with a 2px pigment underline indicator when active.
 * Uses relative + after: pseudo. The parent must NOT clip overflow (no overflow-hidden).
 */
function SegBtn({
  active,
  onClick,
  children,
  mono = false,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'relative min-h-[48px] px-5 py-2.5 border border-ink/[0.12] -ml-px first:ml-0 transition-colors',
        'after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2',
        'after:w-6 after:h-[2px] after:bg-pigment after:transition-opacity',
        active ? 'text-ink font-medium after:opacity-100' : 'text-graphite after:opacity-0 hover:text-ink',
        mono ? 'font-mono tabular-nums text-sm' : 'font-serif text-base',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export default function AccountPage() {
  const [profile, setProfile] = useLocalStorage<Profile>('matmatic.profile', DEFAULT_PROFILE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const update = (partial: Partial<Profile>) => {
    const next = { ...profile, ...partial };
    const result = saveProfile(next);
    if (result.ok) {
      setProfile(next);
      setErrorMsg(null);
    } else if (result.reason === 'QUOTA_EXCEEDED') {
      setErrorMsg('Storage is full. Clear some presets or history and try again.');
    }
  };

  const borderStep = (delta: number) => {
    const next = Math.round((profile.defaultBorder + delta) * 8) / 8;
    if (next >= 0 && next <= 10) update({ defaultBorder: next });
  };

  return (
    <main className="bg-paper text-ink px-5 pt-10 pb-8 max-w-md mx-auto">
      {/* Eyebrow */}
      <p
        className="font-serif font-medium uppercase text-pigment mb-3"
        style={{ fontSize: '11px', letterSpacing: '0.18em' }}
      >
        Account
      </p>

      {/* H1 */}
      <h1 className="font-serif text-[36px] font-medium leading-tight tracking-tight mb-1">
        Defaults
      </h1>

      {/* Subhead — VERBATIM per spec */}
      <p className="text-graphite mb-8" style={{ fontSize: '14px' }}>
        Defaults applied to every new calc.
      </p>

      {errorMsg && (
        <div className="mb-6 text-pigment text-sm">{errorMsg}</div>
      )}

      <div className="space-y-8">
        {/* Units */}
        <section>
          <label className="block text-xs uppercase tracking-wider text-graphite mb-3">
            Units
          </label>
          <div className="inline-flex">
            {(['in', 'cm'] as const).map((u) => (
              <SegBtn key={u} active={profile.units === u} onClick={() => update({ units: u })}>
                {u}
              </SegBtn>
            ))}
          </div>
        </section>

        {/* Default overlap */}
        <section>
          <label className="block text-xs uppercase tracking-wider text-graphite mb-3">
            Default overlap
          </label>
          <div className="inline-flex">
            {OVERLAPS.map(({ label, value }) => (
              <SegBtn
                key={value}
                active={profile.defaultOverlap === value}
                onClick={() => update({ defaultOverlap: value })}
                mono
              >
                {label}
              </SegBtn>
            ))}
          </div>
          <p className="mt-2 text-graphite" style={{ fontSize: '12px' }}>
            How much mat covers the art edge. 1/4" is standard.
          </p>
        </section>

        {/* Default border */}
        <section>
          <label className="block text-xs uppercase tracking-wider text-graphite mb-3">
            Default border
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => borderStep(-0.125)}
              className="w-10 h-10 rounded-[4px] border border-ink/[0.12] text-ink text-lg flex items-center justify-center hover:bg-ink/5 active:scale-[0.97] transition-transform"
              aria-label="Decrease border by 1/8 inch"
            >
              -
            </button>
            <span className="font-mono tabular-nums text-ink text-lg min-w-[3rem] text-center">
              {profile.defaultBorder}"
            </span>
            <button
              type="button"
              onClick={() => borderStep(0.125)}
              className="w-10 h-10 rounded-[4px] border border-ink/[0.12] text-ink text-lg flex items-center justify-center hover:bg-ink/5 active:scale-[0.97] transition-transform"
              aria-label="Increase border by 1/8 inch"
            >
              +
            </button>
          </div>
          <p className="mt-2 text-graphite" style={{ fontSize: '12px' }}>
            Steps 1/8". Standard framing minimum is 2".
          </p>
        </section>

        {/* Theme */}
        <section>
          <label className="block text-xs uppercase tracking-wider text-graphite mb-3">
            Theme
          </label>
          <div className="inline-flex">
            {THEMES.map(({ label, value }) => (
              <SegBtn
                key={value}
                active={profile.theme === value}
                onClick={() => update({ theme: value })}
              >
                {label}
              </SegBtn>
            ))}
          </div>
        </section>
      </div>

      {/* Storage note */}
      <div className="mt-12 pt-6 border-t border-ink/[0.08]">
        <p className="text-graphite" style={{ fontSize: '12px' }}>
          All settings saved locally on this device. No account needed.
        </p>
      </div>
    </main>
  );
}
