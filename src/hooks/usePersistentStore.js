import { useEffect, useReducer, useRef, useState } from 'react';
import { storeReducer } from '../domain/reducer.js';
import { freshStore } from '../domain/blueprint.js';
import { loadStore, saveStore } from '../db/store.js';

/**
 * Wires the pure reducer to IndexedDB:
 *  - lazily seeds the sample store,
 *  - hydrates from the DB on mount,
 *  - persists (debounced) on every change once hydrated.
 */
export function usePersistentStore() {
  const [state, dispatch] = useReducer(storeReducer, undefined, freshStore);
  const [ready, setReady] = useState(false);
  const saveTimer = useRef(null);

  // Hydrate from IndexedDB once.
  useEffect(() => {
    let alive = true;
    loadStore().then((saved) => {
      if (!alive) return;
      if (saved) dispatch({ type: 'HYDRATE', payload: saved });
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Persist changes (debounced) after hydration completes.
  useEffect(() => {
    if (!ready) return undefined;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveStore(state), 250);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, ready]);

  return { state, dispatch, ready };
}
