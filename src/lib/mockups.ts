import type { FrameStyle, WallId } from './scene';
import { putArt, delArt } from './idb';

/**
 * Saved-mockup index. The lightweight metadata (calc params, frame, wall, a
 * small thumbnail dataURL) lives in localStorage; the original artwork blob
 * lives in IndexedDB under the same id (see idb.ts). On restore, the visualizer
 * re-renders from the calc params + the original blob, so quality is preserved.
 */

export type Mockup = {
  id: string;
  artW: number;
  artH: number;
  overlap: number;
  kind: 'symmetric' | 'asymmetric';
  border?: number;
  top?: number; right?: number; bottom?: number; left?: number;
  frame: FrameStyle;
  wall: WallId;
  thumb: string; // small JPEG dataURL for the history grid
  ts: number;
};

const KEY = 'matmatic.mockups';
const MAX = 24;

export function loadMockups(): Mockup[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX) : [];
  } catch { return []; }
}

/** Persist a mockup: blob → IDB, metadata → localStorage. Evicts oldest past MAX. */
export async function saveMockup(meta: Omit<Mockup, 'id' | 'ts'>, artBlob: Blob): Promise<string | null> {
  try {
    const id = crypto.randomUUID();
    await putArt(id, artBlob);
    const existing = loadMockups();
    const next = [{ ...meta, id, ts: Date.now() }, ...existing];
    const kept = next.slice(0, MAX);
    // Drop IDB blobs for evicted entries.
    for (const dropped of next.slice(MAX)) delArt(dropped.id);
    localStorage.setItem(KEY, JSON.stringify(kept));
    return id;
  } catch { return null; }
}

export async function deleteMockup(id: string): Promise<void> {
  try {
    const next = loadMockups().filter((m) => m.id !== id);
    localStorage.setItem(KEY, JSON.stringify(next));
    await delArt(id);
  } catch { /* no-op */ }
}
