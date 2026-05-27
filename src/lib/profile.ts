import type { Border, OverlapPreset } from '../../packages/core/src/math';

export type Preset = {
  id: string;
  name: string;
  artW: number;
  artH: number;
  border: Border;
  overlap: OverlapPreset;
  ts: number;
};

export type Profile = {
  units: 'in' | 'cm';
  defaultOverlap: 0.125 | 0.25 | 0.375;
  defaultBorder: number;
  theme: 'paper-light' | 'paper-dark';
  presets: Preset[];
  premium: boolean; // concept-demo Pro unlock (local only — no billing backend)
};

export type SaveResult =
  | { ok: true }
  | { ok: false; reason: 'PRESET_CAP' | 'QUOTA_EXCEEDED' };

const KEY = 'matmatic.profile';

export const DEFAULT_PROFILE: Profile = {
  units: 'in',
  defaultOverlap: 0.25,
  defaultBorder: 2,
  theme: 'paper-light',
  presets: [],
  premium: false,
};

export function loadProfile(): Profile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<Profile>) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

/**
 * Saves the given partial profile merged over the current stored profile.
 * Returns { ok: false, reason: 'PRESET_CAP' } if partial.presets.length > 12.
 * Returns { ok: false, reason: 'QUOTA_EXCEEDED' } if localStorage throws QuotaExceededError.
 */
export function saveProfile(partial: Partial<Profile>): SaveResult {
  if (partial.presets && partial.presets.length > 12) {
    return { ok: false, reason: 'PRESET_CAP' };
  }
  try {
    const current = loadProfile();
    const next: Profile = { ...current, ...partial };
    localStorage.setItem(KEY, JSON.stringify(next));
    return { ok: true };
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      return { ok: false, reason: 'QUOTA_EXCEEDED' };
    }
    return { ok: false, reason: 'QUOTA_EXCEEDED' };
  }
}
