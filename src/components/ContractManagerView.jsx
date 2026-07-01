import { useToast } from './Toast.jsx';
import { activeClient, versionById, latestVersion, isClientOutdated, computeSummary, buildContractJSON } from '../domain/selectors.js';
import { formatCurrency, slugify } from '../utils/format.js';
import { downloadJson } from '../utils/download.js';

export default function ContractManagerView({ state, dispatch }) {
  const flash = useToast();
  const hasVersions = state.versions.length > 0;
  const client = activeClient(state);

  if (!hasVersions || !client) {
    return (
      <div>
        <Head />
        <div className="banner warn">
          <span>◆</span>
          <div>No blueprint versions published yet. Switch to <b>Admin</b> and publish one first.</div>
        </div>
      </div>
    );
  }

  const version = versionById(state, client.blueprintId);
  const outdated = isClientOutdated(state, client);
  const latest = latestVersion(state);
  const summary = computeSummary(client, version);

  const setMeta = (key, value) => dispatch({ type: 'SET_META', id: client.id, key, value });

  const newClient = () => {
    dispatch({ type: 'NEW_CLIENT' });
    flash('New client created');
  };
  const deleteClient = () => {
    if (state.clients.length <= 1) return flash('At least one client is required');
    // eslint-disable-next-line no-alert
    if (typeof window !== 'undefined' && window.confirm && !window.confirm(`Delete client "${client.name}"?`)) return;
    dispatch({ type: 'DELETE_CLIENT', id: client.id });
    flash('Client deleted');
  };
  const upgrade = () => {
    dispatch({ type: 'UPGRADE_CLIENT', id: client.id });
    flash(`${client.name} upgraded to ${latest.label}`);
  };
  const exportJson = () => {
    downloadJson(`contract-${slugify(client.name)}-${version.label}.json`, buildContractJSON(client, version));
    flash('Contract JSON exported');
  };

  return (
    <div>
      <Head />

      {/* client toolbar */}
      <div className="verbar">
        <div className="left">
          <span style={{ fontWeight: 500, color: 'var(--txt)' }}>Client</span>
          <select
            className="field verselect"
            aria-label="Select client"
            value={client.id}
            onChange={(e) => dispatch({ type: 'SELECT_CLIENT', id: e.target.value })}
          >
            {state.clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name || 'Untitled client'}</option>
            ))}
          </select>
          <button className="btn tiny" onClick={newClient}><span className="plus">+</span> New client</button>
          <button className="btn tiny danger" onClick={deleteClient}>Delete</button>
        </div>
        <div className="right">
          <span className="chip accent">◆ Blueprint {version ? version.label : '—'}</span>
          {outdated && <button className="btn tiny" onClick={upgrade}>Upgrade to {latest.label}</button>}
        </div>
      </div>

      {/* client meta */}
      <div className="cm-meta">
        <div className="meta-card">
          <label htmlFor="clientName">Client name</label>
          <input id="clientName" className="field" value={client.name} onChange={(e) => setMeta('name', e.target.value)} />
        </div>
        <div className="meta-card">
          <label htmlFor="clientTerm">Contract term</label>
          <select id="clientTerm" className="field" value={client.term} onChange={(e) => setMeta('term', e.target.value)}>
            <option>Monthly</option>
            <option>Annual</option>
            <option>Multi-year</option>
          </select>
        </div>
        <div className="meta-card">
          <label htmlFor="baseFee">Base platform fee</label>
          <div className="input-usd">
            <input id="baseFee" className="field" value={client.baseFee} onChange={(e) => setMeta('baseFee', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="eyebrow" style={{ marginBottom: 12 }}>Endpoint entitlements &amp; rates</div>
      <div className="cards">
        {version.endpoints.length === 0 && <div className="empty">No endpoints in this blueprint version.</div>}
        {version.endpoints.map((ep) => {
          const cv = client.endpoints[ep.id] || { active: true, rate: '' };
          return (
            <div className="card" key={ep.id}>
              <div className="card-top">
                <div>
                  <h4 className="mono">{ep.path || '/untitled'}</h4>
                  <div className="desc">Billed {ep.unit || '—'}</div>
                </div>
                <button
                  type="button"
                  className={'switch' + (cv.active ? ' on' : '')}
                  role="switch"
                  aria-checked={cv.active}
                  aria-label={`Toggle ${ep.path}`}
                  onClick={() => dispatch({ type: 'TOGGLE_ENDPOINT', clientId: client.id, endpointId: ep.id })}
                />
              </div>
              <div className="card-body">
                <div className="field-group">
                  <label>USD rate <span className="hint">{ep.unit || 'per unit'}</span></label>
                  <div className="input-usd">
                    <input
                      className="field"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={cv.rate}
                      disabled={!cv.active}
                      aria-label={`Rate for ${ep.path}`}
                      onChange={(e) => dispatch({ type: 'SET_ENDPOINT_RATE', clientId: client.id, endpointId: ep.id, value: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="eyebrow" style={{ margin: '22px 0 12px' }}>SLA commitments</div>
      <div className="cards">
        {version.sla.length === 0 && <div className="empty">No SLA fields in this blueprint version.</div>}
        {version.sla.map((s) => {
          const cv = client.sla[s.id] || { target: '' };
          const dirLabel = s.dir === 'min' ? 'Must be at least' : 'Must not exceed';
          return (
            <div className="card" key={s.id}>
              <div className="card-top">
                <div>
                  <h4>{s.name || 'Metric'}</h4>
                  <div className="desc">{dirLabel} · measured in {s.unit || '—'}</div>
                </div>
              </div>
              <div className="card-body">
                <div className="field-group">
                  <label>Target <span className="hint">{s.unit}</span></label>
                  <div className="suffix-field">
                    <input
                      className="field"
                      inputMode="decimal"
                      placeholder="0"
                      value={cv.target}
                      aria-label={`Target for ${s.name}`}
                      onChange={(e) => dispatch({ type: 'SET_SLA_TARGET', clientId: client.id, slaId: s.id, value: e.target.value })}
                    />
                    <span className="sfx">{s.unit}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* summary */}
      <div className="summary">
        <div className="stats">
          <Stat k="Active endpoints" v={`${summary.activeCount}`} sub={` / ${summary.totalEndpoints}`} />
          <Stat k="Est. blended rate" v={`$${summary.blended.toFixed(2)}`} />
          <Stat k="SLA targets set" v={`${summary.slaSet}`} sub={` / ${summary.slaTotal}`} />
          <Stat k="Base fee" v={formatCurrency(client.baseFee)} />
        </div>
        <div className="actions">
          <button className="btn" onClick={exportJson}>⬇ Export JSON</button>
          <button className="btn primary" onClick={() => flash(`Contract saved for ${client.name}`)}>Save contract</button>
        </div>
      </div>
    </div>
  );
}

function Head() {
  return (
    <div className="view-head">
      <div className="eyebrow">Contract Manager</div>
      <h2>Configure client contract</h2>
      <p>Fill in commercial values against a published blueprint. Toggle entitled endpoints, set USD rates, commit SLA targets, then export the contract as JSON.</p>
    </div>
  );
}

function Stat({ k, v, sub }) {
  return (
    <div className="stat">
      <div className="k">{k}</div>
      <div className="v">{v}{sub && <small>{sub}</small>}</div>
    </div>
  );
}
