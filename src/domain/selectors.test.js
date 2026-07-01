import { activeClient, versionById, latestVersion, isClientOutdated, computeSummary, buildContractJSON } from './selectors.js';
import { storeReducer } from './reducer.js';
import { freshStore } from './blueprint.js';

describe('basic selectors', () => {
  it('resolves active client, version lookups and latest version', () => {
    const s = freshStore();
    expect(activeClient(s).id).toBe(s.activeClientId);
    expect(versionById(s, s.versions[0].id)).toBe(s.versions[0]);
    expect(versionById(s, 'nope')).toBeNull();
    expect(latestVersion(s)).toBe(s.versions[0]);
  });

  it('detects an outdated client after a new publish', () => {
    let s = freshStore();
    expect(isClientOutdated(s, s.clients[0])).toBe(false);
    s = storeReducer(s, { type: 'PUBLISH' });
    expect(isClientOutdated(s, s.clients[0])).toBe(true);
  });
});

describe('computeSummary', () => {
  it('counts active endpoints and averages positive rates', () => {
    const s = freshStore();
    const client = s.clients[0];
    const version = s.versions[0];
    const summary = computeSummary(client, version);
    // sample seeds 3 active endpoints (rates 0.012, 0.004, 0.08) of 4 total
    expect(summary.totalEndpoints).toBe(4);
    expect(summary.activeCount).toBe(3);
    expect(summary.blended).toBeCloseTo((0.012 + 0.004 + 0.08) / 3, 6);
    expect(summary.slaTotal).toBe(3);
    expect(summary.slaSet).toBe(3);
    expect(summary.base).toBe(2500);
  });

  it('returns zeros for missing client/version', () => {
    expect(computeSummary(null, null).activeCount).toBe(0);
    expect(computeSummary(null, null).blended).toBe(0);
  });
});

describe('buildContractJSON', () => {
  it('produces a resolved, exportable contract', () => {
    const s = freshStore();
    const client = s.clients[0];
    const version = s.versions[0];
    const json = buildContractJSON(client, version);

    expect(json.client).toEqual({ name: 'Northwind Analytics', term: 'Annual', baseFeeUSD: 2500 });
    expect(json.blueprint.version).toBe('v1');
    expect(json.blueprint.headers[0]).toEqual({ key: 'X-Usage-Token', classification: 'payment' });

    const inference = json.contract.endpoints.find((e) => e.path === '/v1/inference');
    expect(inference).toEqual({ path: '/v1/inference', unit: 'per 1K tokens', active: true, rateUSD: 0.012 });

    // inactive endpoint exports null rate
    const search = json.contract.endpoints.find((e) => e.path === '/v1/search');
    expect(search.active).toBe(false);
    expect(search.rateUSD).toBeNull();

    const uptime = json.contract.sla.find((x) => x.metric === 'Uptime');
    expect(uptime).toEqual({ metric: 'Uptime', unit: '%', direction: 'at_least', target: 99.9 });
  });
});
