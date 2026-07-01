// Derived / read-only views over the store (pure).
import { num, numOrNull } from '../utils/format.js';

export function activeClient(state) {
  return state.clients.find((c) => c.id === state.activeClientId) || state.clients[0] || null;
}

export function versionById(state, id) {
  return state.versions.find((v) => v.id === id) || null;
}

export function latestVersion(state) {
  return state.versions[state.versions.length - 1] || null;
}

/** Is the client bound to a version older than the latest published one? */
export function isClientOutdated(state, client) {
  const latest = latestVersion(state);
  return !!(client && latest && client.blueprintId !== latest.id);
}

/** Summary stats shown in the Contract Manager and Review views. */
export function computeSummary(client, version) {
  if (!client || !version) {
    return { activeCount: 0, totalEndpoints: 0, blended: 0, slaSet: 0, slaTotal: 0, base: 0 };
  }
  const eps = version.endpoints;
  const active = eps.filter((e) => client.endpoints[e.id] && client.endpoints[e.id].active);
  const rates = active
    .map((e) => num(client.endpoints[e.id] && client.endpoints[e.id].rate))
    .filter((n) => n > 0);
  const blended = rates.length ? rates.reduce((s, n) => s + n, 0) / rates.length : 0;
  const slaSet = version.sla.filter((s) => numOrNull(client.sla[s.id] && client.sla[s.id].target) !== null).length;
  return {
    activeCount: active.length,
    totalEndpoints: eps.length,
    blended,
    slaSet,
    slaTotal: version.sla.length,
    base: num(client.baseFee),
  };
}

/** The finished contract as a plain, exportable object. */
export function buildContractJSON(client, version) {
  return {
    exportedAt: new Date().toISOString(),
    client: { name: client.name, term: client.term, baseFeeUSD: num(client.baseFee) },
    blueprint: {
      version: version.label,
      publishedAt: new Date(version.publishedAt).toISOString(),
      headers: version.headers.map((h) => ({
        key: h.key,
        classification: h.type === 'payment' ? 'payment' : 'non-payment',
      })),
    },
    contract: {
      endpoints: version.endpoints.map((e) => {
        const cv = client.endpoints[e.id] || {};
        return {
          path: e.path,
          unit: e.unit,
          active: !!cv.active,
          rateUSD: cv.active ? num(cv.rate) : null,
        };
      }),
      sla: version.sla.map((s) => ({
        metric: s.name,
        unit: s.unit,
        direction: s.dir === 'min' ? 'at_least' : 'at_most',
        target: numOrNull(client.sla[s.id] && client.sla[s.id].target),
      })),
    },
  };
}
