import '@testing-library/jest-dom';

// jsdom does not always expose Node's global structuredClone, which fake-indexeddb
// (v5) relies on to store values. Polyfill it before loading the DB shim.
if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = (value) => JSON.parse(JSON.stringify(value));
}

// Load the in-memory IndexedDB shim *after* the polyfill (require runs in order,
// unlike hoisted static imports).
require('fake-indexeddb/auto');
