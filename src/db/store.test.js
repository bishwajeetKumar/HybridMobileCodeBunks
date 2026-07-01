import { loadStore, saveStore, clearStore } from './store.js';
import { freshStore } from '../domain/blueprint.js';

// fake-indexeddb/auto is loaded via jest setup, so IndexedDB works in jsdom.

describe('IndexedDB persistence', () => {
  afterEach(async () => {
    await clearStore();
  });

  it('returns null when nothing is saved', async () => {
    await clearStore();
    expect(await loadStore()).toBeNull();
  });

  it('round-trips the store through IndexedDB', async () => {
    const state = freshStore();
    await saveStore(state);
    const loaded = await loadStore();
    expect(loaded).not.toBeNull();
    expect(loaded.activeClientId).toBe(state.activeClientId);
    expect(loaded.versions[0].label).toBe('v1');
    expect(loaded.clients[0].name).toBe('Northwind Analytics');
  });

  it('overwrites a previous save', async () => {
    const a = freshStore();
    a.clients[0].name = 'First';
    await saveStore(a);
    const b = freshStore();
    b.clients[0].name = 'Second';
    await saveStore(b);
    const loaded = await loadStore();
    expect(loaded.clients[0].name).toBe('Second');
  });

  it('clearStore removes the saved record', async () => {
    await saveStore(freshStore());
    await clearStore();
    expect(await loadStore()).toBeNull();
  });
});
