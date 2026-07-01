// Application-level persistence: read/write the whole store object to IndexedDB.
import { getRecord, putRecord, deleteRecord } from './indexedDb.js';

export const STORE_KEY = 'app_store_v1';

export async function loadStore() {
  try {
    return await getRecord(STORE_KEY);
  } catch (err) {
    // Persistence is best-effort; never block the UI on a DB error.
    console.warn('loadStore failed:', err);
    return null;
  }
}

export async function saveStore(state) {
  try {
    await putRecord(STORE_KEY, state);
    return true;
  } catch (err) {
    console.warn('saveStore failed:', err);
    return false;
  }
}

export async function clearStore() {
  try {
    await deleteRecord(STORE_KEY);
    return true;
  } catch (err) {
    console.warn('clearStore failed:', err);
    return false;
  }
}
