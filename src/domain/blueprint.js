// Blueprint & store factory helpers (pure).

let counter = 0;
/** Collision-resistant id generator (unique enough for a client-side prototype). */
export function nid() {
  counter += 1;
  return 'x' + Date.now().toString(36) + counter.toString(36);
}

export function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/** A realistic starter blueprint so the app is populated on first run. */
export function sampleBlueprint() {
  return {
    headers: [
      { id: nid(), key: 'X-Usage-Token', type: 'payment' },
      { id: nid(), key: 'X-Account-Id', type: 'payment' },
      { id: nid(), key: 'X-Trace-Id', type: 'nonpayment' },
      { id: nid(), key: 'X-Region', type: 'nonpayment' },
    ],
    endpoints: [
      { id: nid(), path: '/v1/inference', unit: 'per 1K tokens' },
      { id: nid(), path: '/v1/embeddings', unit: 'per 1K tokens' },
      { id: nid(), path: '/v1/documents/parse', unit: 'per document' },
      { id: nid(), path: '/v1/search', unit: 'per query' },
    ],
    sla: [
      { id: nid(), name: 'Uptime', unit: '%', dir: 'min' },
      { id: nid(), name: 'p99 Latency', unit: 'ms', dir: 'max' },
      { id: nid(), name: 'Support response', unit: 'hrs', dir: 'max' },
    ],
  };
}

/** A fully-seeded store: one published version + one configured client. */
export function freshStore() {
  const bp = sampleBlueprint();
  const v1 = { id: nid(), label: 'v1', publishedAt: Date.now(), ...clone(bp) };
  const client = {
    id: nid(),
    name: 'Northwind Analytics',
    term: 'Annual',
    baseFee: '2,500',
    blueprintId: v1.id,
    endpoints: {},
    sla: {},
  };
  const seedRates = ['0.012', '0.004', '0.08', ''];
  v1.endpoints.forEach((e, i) => {
    client.endpoints[e.id] = { active: i < 3, rate: seedRates[i] || '' };
  });
  const seedTargets = ['99.9', '250', '4'];
  v1.sla.forEach((s, i) => {
    client.sla[s.id] = { target: seedTargets[i] || '' };
  });
  return { draft: bp, versions: [v1], clients: [client], activeClientId: client.id };
}
