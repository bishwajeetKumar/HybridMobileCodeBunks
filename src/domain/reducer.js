// Pure store reducer. Every UI mutation flows through here, which makes the
// application's behaviour straightforward to unit test without a DOM.
import { nid, clone, sampleBlueprint, freshStore } from './blueprint.js';

/** Update one row (by id) inside a draft collection, returning a new array. */
function patchRow(rows, id, key, value) {
  return rows.map((r) => (r.id === id ? { ...r, [key]: value } : r));
}

export function storeReducer(state, action) {
  const a = action || {};
  switch (a.type) {
    /* ---- hydration / lifecycle ---- */
    case 'HYDRATE':
      return a.payload || state;
    case 'WIPE':
      return freshStore();

    /* ---- draft: headers ---- */
    case 'ADD_HEADER':
      return { ...state, draft: { ...state.draft, headers: [...state.draft.headers, { id: nid(), key: '', type: 'payment' }] } };
    case 'SET_HEADER':
      return { ...state, draft: { ...state.draft, headers: patchRow(state.draft.headers, a.id, a.key, a.value) } };
    case 'DEL_HEADER':
      return { ...state, draft: { ...state.draft, headers: state.draft.headers.filter((h) => h.id !== a.id) } };

    /* ---- draft: endpoints ---- */
    case 'ADD_ENDPOINT':
      return { ...state, draft: { ...state.draft, endpoints: [...state.draft.endpoints, { id: nid(), path: '', unit: 'per request' }] } };
    case 'SET_ENDPOINT':
      return { ...state, draft: { ...state.draft, endpoints: patchRow(state.draft.endpoints, a.id, a.key, a.value) } };
    case 'DEL_ENDPOINT':
      return { ...state, draft: { ...state.draft, endpoints: state.draft.endpoints.filter((e) => e.id !== a.id) } };

    /* ---- draft: SLA ---- */
    case 'ADD_SLA':
      return { ...state, draft: { ...state.draft, sla: [...state.draft.sla, { id: nid(), name: '', unit: '', dir: 'min' }] } };
    case 'SET_SLA':
      return { ...state, draft: { ...state.draft, sla: patchRow(state.draft.sla, a.id, a.key, a.value) } };
    case 'DEL_SLA':
      return { ...state, draft: { ...state.draft, sla: state.draft.sla.filter((s) => s.id !== a.id) } };

    /* ---- draft: bulk ---- */
    case 'RESET_DRAFT':
      return { ...state, draft: sampleBlueprint() };
    case 'LOAD_VERSION': {
      const v = state.versions.find((x) => x.id === a.id);
      if (!v) return state;
      return { ...state, draft: { headers: clone(v.headers), endpoints: clone(v.endpoints), sla: clone(v.sla) } };
    }

    /* ---- publish a version snapshot ---- */
    case 'PUBLISH': {
      const label = 'v' + (state.versions.length + 1);
      const version = { id: nid(), label, publishedAt: Date.now(), ...clone(state.draft) };
      return { ...state, versions: [...state.versions, version] };
    }

    /* ---- clients ---- */
    case 'SELECT_CLIENT':
      return { ...state, activeClientId: a.id };
    case 'NEW_CLIENT': {
      const latest = state.versions[state.versions.length - 1];
      if (!latest) return state;
      const client = { id: nid(), name: 'New Client', term: 'Annual', baseFee: '0', blueprintId: latest.id, endpoints: {}, sla: {} };
      return { ...state, clients: [...state.clients, client], activeClientId: client.id };
    }
    case 'DELETE_CLIENT': {
      if (state.clients.length <= 1) return state;
      const remaining = state.clients.filter((c) => c.id !== a.id);
      const nextActive = state.activeClientId === a.id ? remaining[0].id : state.activeClientId;
      return { ...state, clients: remaining, activeClientId: nextActive };
    }
    case 'UPGRADE_CLIENT': {
      const latest = state.versions[state.versions.length - 1];
      if (!latest) return state;
      return { ...state, clients: state.clients.map((c) => (c.id === a.id ? { ...c, blueprintId: latest.id } : c)) };
    }

    /* ---- client contract values ---- */
    case 'SET_META':
      return { ...state, clients: state.clients.map((c) => (c.id === a.id ? { ...c, [a.key]: a.value } : c)) };
    case 'TOGGLE_ENDPOINT':
      return {
        ...state,
        clients: state.clients.map((c) => {
          if (c.id !== a.clientId) return c;
          const cur = c.endpoints[a.endpointId] || { active: false, rate: '' };
          return { ...c, endpoints: { ...c.endpoints, [a.endpointId]: { ...cur, active: !cur.active } } };
        }),
      };
    case 'SET_ENDPOINT_RATE':
      return {
        ...state,
        clients: state.clients.map((c) => {
          if (c.id !== a.clientId) return c;
          const cur = c.endpoints[a.endpointId] || { active: true, rate: '' };
          return { ...c, endpoints: { ...c.endpoints, [a.endpointId]: { ...cur, rate: a.value } } };
        }),
      };
    case 'SET_SLA_TARGET':
      return {
        ...state,
        clients: state.clients.map((c) => {
          if (c.id !== a.clientId) return c;
          const cur = c.sla[a.slaId] || { target: '' };
          return { ...c, sla: { ...c.sla, [a.slaId]: { ...cur, target: a.value } } };
        }),
      };

    default:
      return state;
  }
}
