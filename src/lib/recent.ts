export type RecentCalc = {
  id: string;
  artW: number;
  artH: number;
  kind: 'symmetric' | 'asymmetric';
  border?: number;
  top?: number; right?: number; bottom?: number; left?: number;
  overlap: number;
  outerW: number;
  outerH: number;
  ts: number;
};

const KEY = 'matmatic.recent';
const MAX = 20;

export function loadRecent(): RecentCalc[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : [];
  } catch { return []; }
}

export function saveRecent(calc: Omit<RecentCalc, 'id' | 'ts'>): void {
  try {
    const existing = loadRecent();
    const entry: RecentCalc = { ...calc, id: crypto.randomUUID(), ts: Date.now() };
    // de-dupe: skip if last entry has identical inputs (within 1 minute)
    const last = existing[0];
    if (last && Date.now() - last.ts < 60_000 &&
        last.artW === calc.artW && last.artH === calc.artH &&
        last.kind === calc.kind && last.overlap === calc.overlap) {
      return;
    }
    const next = [entry, ...existing].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
}

export function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const day = 86_400_000;
  if (diff < day) return 'today';
  if (diff < 2 * day) return 'yesterday';
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
  if (diff < 30 * day) return `${Math.floor(diff / (7 * day))} weeks ago`;
  return 'a while ago';
}
