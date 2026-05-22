export type SeriesItem = {
  id: string;
  artW: number;
  artH: number;
  label?: string;
};

export type Series = {
  id: string;
  name: string;
  sharedMargin:
    | { kind: 'symmetric'; border: number }
    | { kind: 'optical'; topRL: number; bottom: number };
  items: SeriesItem[];
  ts: number;
};

export type SeriesResult =
  | { ok: true }
  | { ok: false; reason: 'SERIES_CAP' | 'ITEMS_CAP' | 'QUOTA_EXCEEDED' };

const KEY = 'matmatic.series';
const MAX_SERIES = 6;
const MAX_ITEMS = 24;

export function loadSeries(): Series[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * REPLACES the entire series entry by id (NOT a merge).
 * Pass the FULL updated Series object. This function replaces the entry with matching id;
 * a new id creates a new entry. Caller is responsible for mutating items[] before calling.
 *
 * Returns { ok: false, reason: 'SERIES_CAP' } if no existing series matches s.id AND
 * existing series count >= 6.
 * Returns { ok: false, reason: 'ITEMS_CAP' } if s.items.length > 24.
 * Returns { ok: false, reason: 'QUOTA_EXCEEDED' } if localStorage write fails.
 */
export function saveSeries(s: Series): SeriesResult {
  if (s.items.length > MAX_ITEMS) {
    return { ok: false, reason: 'ITEMS_CAP' };
  }
  try {
    const existing = loadSeries();
    const idx = existing.findIndex((e) => e.id === s.id);
    if (idx === -1 && existing.length >= MAX_SERIES) {
      return { ok: false, reason: 'SERIES_CAP' };
    }
    let next: Series[];
    if (idx === -1) {
      next = [...existing, s];
    } else {
      next = [...existing];
      next[idx] = s;
    }
    localStorage.setItem(KEY, JSON.stringify(next));
    return { ok: true };
  } catch (e) {
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      return { ok: false, reason: 'QUOTA_EXCEEDED' };
    }
    return { ok: false, reason: 'QUOTA_EXCEEDED' };
  }
}

export function deleteSeries(id: string): void {
  try {
    const existing = loadSeries();
    localStorage.setItem(KEY, JSON.stringify(existing.filter((s) => s.id !== id)));
  } catch {}
}
