import { activeClient, versionById, computeSummary, buildContractJSON } from '../domain/selectors.js';
import { num, numOrNull, slugify, formatRate } from '../utils/format.js';
import { downloadJson } from '../utils/download.js';
import { useToast } from './Toast.jsx';

export default function ReviewView({ state, dispatch }) {
  const flash = useToast();
  const client = activeClient(state);

  if (!client || state.versions.length === 0) {
    return (
      <div className="banner warn">
        <span>◆</span>
        <div>Nothing to review yet — publish a blueprint and configure a client first.</div>
      </div>
    );
  }

  const version = versionById(state, client.blueprintId);
  const summary = computeSummary(client, version);
  const pay = version.headers.filter((h) => h.type === 'payment');
  const nonpay = version.headers.filter((h) => h.type !== 'payment');
  const now = new Date();

  const exportJson = () => {
    downloadJson(`contract-${slugify(client.name)}-${version.label}.json`, buildContractJSON(client, version));
    flash('Contract JSON exported');
  };
  const print = () => {
    if (typeof window !== 'undefined' && window.print) window.print();
  };

  return (
    <div>
      <div className="review-actions">
        <select
          className="field verselect"
          aria-label="Select client to review"
          value={client.id}
          onChange={(e) => dispatch({ type: 'SELECT_CLIENT', id: e.target.value })}
        >
          {state.clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name || 'Untitled client'}</option>
          ))}
        </select>
        <button className="btn" onClick={exportJson}>⬇ Export JSON</button>
        <button className="btn primary" onClick={print}>🖨 Print / Save PDF</button>
      </div>

      <div className="doc">
        <div className="doc-head">
          <div className="kicker">Usage-Based Billing Contract</div>
          <h2>{client.name || 'Untitled client'}</h2>
          <div className="sub">{client.term || '—'} term · generated {now.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
          <div className="doc-chips">
            <span className="chip accent">◆ Blueprint {version.label}</span>
            <span className="chip">Base fee ${num(client.baseFee).toLocaleString()}</span>
            <span className="chip">{summary.activeCount}/{summary.totalEndpoints} endpoints active</span>
          </div>
        </div>

        <div className="doc-stats">
          <Cell k="Active endpoints" v={`${summary.activeCount}`} sub={` / ${summary.totalEndpoints}`} />
          <Cell k="Blended rate" v={`$${summary.blended.toFixed(2)}`} />
          <Cell k="SLA targets" v={`${summary.slaSet}`} sub={` / ${summary.slaTotal}`} />
          <Cell k="Base fee" v={`$${num(client.baseFee).toLocaleString()}`} />
        </div>

        <div className="doc-sec">
          <h3>Billing Headers</h3>
          <div className="hdr-cols">
            <HeaderGroup label={`Payment (${pay.length})`} color="var(--green)" headers={pay} cls="payment" />
            <HeaderGroup label={`Non-payment (${nonpay.length})`} color="var(--accent)" headers={nonpay} cls="nonpayment" />
          </div>
        </div>

        <div className="doc-sec">
          <h3>Metered Endpoints &amp; Rates</h3>
          <table className="dtable">
            <thead>
              <tr><th>Endpoint</th><th>Unit</th><th>Status</th><th style={{ textAlign: 'right' }}>Rate (USD)</th></tr>
            </thead>
            <tbody>
              {version.endpoints.length === 0 && (
                <tr><td colSpan={4} style={{ color: 'var(--txt-faint)' }}>No endpoints</td></tr>
              )}
              {version.endpoints.map((e) => {
                const cv = client.endpoints[e.id] || {};
                const on = !!cv.active;
                let rate;
                if (on && num(cv.rate) > 0) rate = formatRate(cv.rate);
                else if (on) rate = <span style={{ color: 'var(--txt-faint)' }}>unpriced</span>;
                else rate = '—';
                return (
                  <tr className={on ? '' : 'off'} key={e.id}>
                    <td className="path">{e.path || '/untitled'}</td>
                    <td>{e.unit || '—'}</td>
                    <td>
                      <span className={'status ' + (on ? 'on' : 'off')}>
                        <span className="sd" />{on ? 'Entitled' : 'Not entitled'}
                      </span>
                    </td>
                    <td className="money" style={{ textAlign: 'right' }}>{rate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="doc-sec">
          <h3>SLA Commitments</h3>
          <div className="sla-list">
            {version.sla.length === 0 && <span style={{ color: 'var(--txt-faint)', fontSize: 12 }}>No SLA fields</span>}
            {version.sla.map((s) => {
              const t = numOrNull(client.sla[s.id] && client.sla[s.id].target);
              const req = s.dir === 'min' ? 'At least' : 'At most';
              if (t === null) {
                return (
                  <div className="sla-item unset" key={s.id}>
                    <div><div className="n">{s.name || 'Metric'}</div><div className="req">{req} · {s.unit || ''}</div></div>
                    <div className="val">Not set</div>
                  </div>
                );
              }
              return (
                <div className="sla-item" key={s.id}>
                  <div><div className="n">{s.name || 'Metric'}</div><div className="req">{req} target</div></div>
                  <div className="val">{t.toLocaleString()}<small> {s.unit || ''}</small></div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="doc-foot">
          <span>Usage &amp; Billing Platform · {client.name} · Blueprint {version.label} (published {new Date(version.publishedAt).toLocaleDateString()})</span>
          <span>This document reflects saved contract values. Read-only.</span>
        </div>
      </div>
    </div>
  );
}

function Cell({ k, v, sub }) {
  return (
    <div className="cell">
      <div className="k">{k}</div>
      <div className="v">{v}{sub && <small>{sub}</small>}</div>
    </div>
  );
}

function HeaderGroup({ label, color, headers, cls }) {
  return (
    <div>
      <div className="grp-label" style={{ color }}>
        <span className="tdot" style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
        {label}
      </div>
      <div className="hdr-tags">
        {headers.length === 0 && <span style={{ color: 'var(--txt-faint)', fontSize: 12 }}>None</span>}
        {headers.map((h, i) => (
          <span className={'tag ' + cls} key={h.id || i}><span className="tdot" />{h.key || '—'}</span>
        ))}
      </div>
    </div>
  );
}
