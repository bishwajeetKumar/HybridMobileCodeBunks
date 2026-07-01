import { storeReducer } from './reducer.js';
import { freshStore } from './blueprint.js';

const base = () => freshStore();

describe('draft header actions', () => {
  it('adds, edits and removes a header', () => {
    let s = base();
    const before = s.draft.headers.length;
    s = storeReducer(s, { type: 'ADD_HEADER' });
    expect(s.draft.headers.length).toBe(before + 1);

    const id = s.draft.headers[s.draft.headers.length - 1].id;
    s = storeReducer(s, { type: 'SET_HEADER', id, key: 'key', value: 'X-New' });
    expect(s.draft.headers.find((h) => h.id === id).key).toBe('X-New');

    s = storeReducer(s, { type: 'DEL_HEADER', id });
    expect(s.draft.headers.length).toBe(before);
  });
});

describe('draft endpoint & sla actions', () => {
  it('adds an endpoint and an sla field', () => {
    let s = base();
    const e0 = s.draft.endpoints.length;
    const a0 = s.draft.sla.length;
    s = storeReducer(s, { type: 'ADD_ENDPOINT' });
    s = storeReducer(s, { type: 'ADD_SLA' });
    expect(s.draft.endpoints.length).toBe(e0 + 1);
    expect(s.draft.sla.length).toBe(a0 + 1);
  });
});

describe('publishing versions', () => {
  it('snapshots the draft with an incrementing label', () => {
    let s = base();
    expect(s.versions.length).toBe(1);
    s = storeReducer(s, { type: 'PUBLISH' });
    expect(s.versions.length).toBe(2);
    expect(s.versions[1].label).toBe('v2');
    // snapshot is a copy, not a live reference to the draft
    s = storeReducer(s, { type: 'ADD_HEADER' });
    expect(s.versions[1].headers.length).not.toBe(s.draft.headers.length);
  });

  it('loads a published version back into the draft', () => {
    let s = base();
    s = storeReducer(s, { type: 'ADD_HEADER' }); // mutate draft
    const v1 = s.versions[0];
    s = storeReducer(s, { type: 'LOAD_VERSION', id: v1.id });
    expect(s.draft.headers.length).toBe(v1.headers.length);
  });
});

describe('client actions', () => {
  it('creates a new client bound to the latest version', () => {
    let s = base();
    s = storeReducer(s, { type: 'PUBLISH' }); // now v2 is latest
    s = storeReducer(s, { type: 'NEW_CLIENT' });
    const created = s.clients[s.clients.length - 1];
    expect(s.clients.length).toBe(2);
    expect(created.blueprintId).toBe(s.versions[s.versions.length - 1].id);
    expect(s.activeClientId).toBe(created.id);
  });

  it('does not delete the last remaining client', () => {
    let s = base();
    const id = s.clients[0].id;
    s = storeReducer(s, { type: 'DELETE_CLIENT', id });
    expect(s.clients.length).toBe(1);
  });

  it('deletes a client and reassigns active id', () => {
    let s = base();
    s = storeReducer(s, { type: 'NEW_CLIENT' });
    const victim = s.activeClientId;
    s = storeReducer(s, { type: 'DELETE_CLIENT', id: victim });
    expect(s.clients.find((c) => c.id === victim)).toBeUndefined();
    expect(s.activeClientId).toBe(s.clients[0].id);
  });

  it('upgrades a client to the latest published version', () => {
    let s = base();
    const oldVersion = s.clients[0].blueprintId;
    s = storeReducer(s, { type: 'PUBLISH' });
    s = storeReducer(s, { type: 'UPGRADE_CLIENT', id: s.clients[0].id });
    expect(s.clients[0].blueprintId).not.toBe(oldVersion);
    expect(s.clients[0].blueprintId).toBe(s.versions[s.versions.length - 1].id);
  });
});

describe('contract value actions', () => {
  it('toggles an endpoint entitlement', () => {
    let s = base();
    const client = s.clients[0];
    const epId = s.versions[0].endpoints[0].id;
    const before = client.endpoints[epId].active;
    s = storeReducer(s, { type: 'TOGGLE_ENDPOINT', clientId: client.id, endpointId: epId });
    expect(s.clients[0].endpoints[epId].active).toBe(!before);
  });

  it('sets an endpoint rate and sla target and base fee', () => {
    let s = base();
    const client = s.clients[0];
    const epId = s.versions[0].endpoints[0].id;
    const slaId = s.versions[0].sla[0].id;
    s = storeReducer(s, { type: 'SET_ENDPOINT_RATE', clientId: client.id, endpointId: epId, value: '0.5' });
    s = storeReducer(s, { type: 'SET_SLA_TARGET', clientId: client.id, slaId, value: '99.99' });
    s = storeReducer(s, { type: 'SET_META', id: client.id, key: 'baseFee', value: '9,000' });
    expect(s.clients[0].endpoints[epId].rate).toBe('0.5');
    expect(s.clients[0].sla[slaId].target).toBe('99.99');
    expect(s.clients[0].baseFee).toBe('9,000');
  });
});

describe('lifecycle actions', () => {
  it('HYDRATE replaces the whole state', () => {
    const s = base();
    const other = { ...base(), activeClientId: 'zzz' };
    expect(storeReducer(s, { type: 'HYDRATE', payload: other }).activeClientId).toBe('zzz');
  });
  it('WIPE returns a fresh seeded store', () => {
    const wiped = storeReducer(base(), { type: 'WIPE' });
    expect(wiped.versions.length).toBe(1);
    expect(wiped.clients.length).toBe(1);
  });
  it('is immutable — original state is untouched', () => {
    const s = base();
    const headers = s.draft.headers;
    storeReducer(s, { type: 'ADD_HEADER' });
    expect(s.draft.headers).toBe(headers);
  });
});
