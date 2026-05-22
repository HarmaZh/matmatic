import { useSyncExternalStore, useCallback, useRef } from 'react';

/**
 * A localStorage hook backed by useSyncExternalStore.
 * Subscribes to `window`'s `storage` event for cross-tab sync.
 * The setter fires a manual StorageEvent so same-tab updates propagate too
 * (the native `storage` event only fires cross-tab).
 *
 * IMPORTANT: Pass a module-level constant as fallback — inline object literals
 * re-trigger snapshot every render because object identity changes.
 *
 * The cache ref memoizes parsed value by raw JSON string identity.
 * useSyncExternalStore compares snapshots by Object.is — returning a new
 * object on every call causes React error #185 (infinite render loop).
 * The same-raw-string short-circuit prevents that loop.
 */
export function useLocalStorage<T>(key: string, fallback: T): [T, (val: T) => void] {
  // Per-instance cache — useRef ensures no cross-mount leakage
  const cache = useRef<{ raw: string | null; parsed: T }>({ raw: null, parsed: fallback });

  const subscribe = useCallback((cb: () => void) => {
    const handler = (e: StorageEvent) => { if (e.key === key) cb(); };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  const getSnapshot = useCallback((): T => {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      if (cache.current.raw !== null) {
        cache.current = { raw: null, parsed: fallback };
      }
      return cache.current.parsed;
    }
    if (raw === cache.current.raw) return cache.current.parsed;
    try {
      const parsed = JSON.parse(raw) as T;
      cache.current = { raw, parsed };
      return parsed;
    } catch {
      return fallback;
    }
  }, [key, fallback]);

  const value = useSyncExternalStore(subscribe, getSnapshot, () => fallback);

  const setValue = useCallback((val: T) => {
    localStorage.setItem(key, JSON.stringify(val));
    // Manual StorageEvent for same-tab listeners (native storage event is cross-tab only)
    window.dispatchEvent(new StorageEvent('storage', { key }));
  }, [key]);

  return [value, setValue];
}
