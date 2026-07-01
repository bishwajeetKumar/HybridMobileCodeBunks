import { useToast } from './Toast.jsx';

export default function AdminView({ state, dispatch, onPublished }) {
  const flash = useToast();
  const { draft, versions } = state;
  const latest = versions[versions.length - 1];

  const publish = () => {
    dispatch({ type: 'PUBLISH' });
    const pay = draft.headers.filter((h) => h.type === 'payment').length;
    flash(`Published v${versions.length + 1} · ${draft.endpoints.length} endpoints · ${pay} payment headers · ${draft.sla.length} SLA fields`);
    if (onPublished) onPublished();
  };

  return (
    <div>
      <div className="view-head">
        <div className="eyebrow">Blueprint Builder</div>
        <h2>Define your billing model architecture</h2>
        <p>
          Design the schema every client contract inherits — request headers, meterable endpoints, and the SLA fields
          your team commits to. Publish to snapshot a version; Contract Managers bind clients to it.
        </p>
      </div>

      {/* version bar */}
      <div className="verbar">
        <div className="left">
          <span className="chip amber">✎ Editing draft</span>
          <span>
            {versions.length
              ? `${versions.length} version${versions.length > 1 ? 's' : ''} published · latest ${latest.label} on ${new Date(latest.publishedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`
              : 'No versions published yet'}
          </span>
        </div>
        <div className="right">
          <select
            className="field verselect"
            aria-label="Load a version into draft"
            value=""
            onChange={(e) => {
              if (e.target.value) {
                dispatch({ type: 'LOAD_VERSION', id: e.target.value });
                const v = versions.find((x) => x.id === e.target.value);
                flash(`Loaded ${v.label} into draft`);
              }
            }}
          >
            <option value="">Load a version…</option>
            {versions
              .slice()
              .reverse()
              .map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} · {new Date(v.publishedAt).toLocaleDateString()}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Headers */}
      <Panel
        glyph="⛃"
        title="Request Headers"
        subtitle="Classify which headers trigger billing vs. metadata-only"
        action={<button className="btn tiny" onClick={() => dispatch({ type: 'ADD_HEADER' })}><span className="plus">+</span> Add header</button>}
      >
        <div className="col-label header-row"><div>Header key</div><div>Classification</div><div /></div>
        <div className="row-list">
          {draft.headers.length === 0 && <div className="empty">No headers defined yet.</div>}
          {draft.headers.map((h) => (
            <div className="brow header-row" key={h.id}>
              <input
                className="field"
                placeholder="X-Header-Name"
                aria-label="Header key"
                value={h.key}
                onChange={(e) => dispatch({ type: 'SET_HEADER', id: h.id, key: 'key', value: e.target.value })}
              />
              <select
                className="field"
                aria-label="Header classification"
                value={h.type}
                onChange={(e) => dispatch({ type: 'SET_HEADER', id: h.id, key: 'type', value: e.target.value })}
              >
                <option value="payment">Payment</option>
                <option value="nonpayment">Non-payment</option>
              </select>
              <button className="del" title="Remove" aria-label="Remove header" onClick={() => dispatch({ type: 'DEL_HEADER', id: h.id })}>✕</button>
            </div>
          ))}
        </div>
      </Panel>

      {/* Endpoints */}
      <Panel
        glyph="◧"
        title="Available Endpoints"
        subtitle="The metered API surface clients can be billed against"
        action={<button className="btn tiny" onClick={() => dispatch({ type: 'ADD_ENDPOINT' })}><span className="plus">+</span> Add endpoint</button>}
      >
        <div className="col-label endpoint-row"><div>Endpoint path</div><div>Billing unit</div><div /></div>
        <div className="row-list">
          {draft.endpoints.length === 0 && <div className="empty">No endpoints defined yet.</div>}
          {draft.endpoints.map((ep) => (
            <div className="brow endpoint-row" key={ep.id}>
              <input
                className="field mono"
                placeholder="/v1/resource"
                aria-label="Endpoint path"
                value={ep.path}
                onChange={(e) => dispatch({ type: 'SET_ENDPOINT', id: ep.id, key: 'path', value: e.target.value })}
              />
              <input
                className="field"
                placeholder="per request"
                aria-label="Billing unit"
                value={ep.unit}
                onChange={(e) => dispatch({ type: 'SET_ENDPOINT', id: ep.id, key: 'unit', value: e.target.value })}
              />
              <button className="del" title="Remove" aria-label="Remove endpoint" onClick={() => dispatch({ type: 'DEL_ENDPOINT', id: ep.id })}>✕</button>
            </div>
          ))}
        </div>
      </Panel>

      {/* SLA */}
      <Panel
        glyph="◈"
        title="SLA Tracking Fields"
        subtitle="Service metrics tracked and enforced per contract"
        action={<button className="btn tiny" onClick={() => dispatch({ type: 'ADD_SLA' })}><span className="plus">+</span> Add SLA field</button>}
      >
        <div className="col-label sla-row"><div>Metric name</div><div>Unit</div><div className="third">Direction</div><div /></div>
        <div className="row-list">
          {draft.sla.length === 0 && <div className="empty">No SLA fields defined yet.</div>}
          {draft.sla.map((s) => (
            <div className="brow sla-row" key={s.id}>
              <input
                className="field"
                placeholder="Metric name"
                aria-label="Metric name"
                value={s.name}
                onChange={(e) => dispatch({ type: 'SET_SLA', id: s.id, key: 'name', value: e.target.value })}
              />
              <input
                className="field"
                placeholder="unit"
                aria-label="Metric unit"
                value={s.unit}
                onChange={(e) => dispatch({ type: 'SET_SLA', id: s.id, key: 'unit', value: e.target.value })}
              />
              <select
                className="field third"
                aria-label="Direction"
                value={s.dir}
                onChange={(e) => dispatch({ type: 'SET_SLA', id: s.id, key: 'dir', value: e.target.value })}
              >
                <option value="min">At least</option>
                <option value="max">At most</option>
              </select>
              <button className="del" title="Remove" aria-label="Remove SLA field" onClick={() => dispatch({ type: 'DEL_SLA', id: s.id })}>✕</button>
            </div>
          ))}
        </div>
      </Panel>

      <div className="admin-actions">
        <button className="btn ghost" onClick={() => { dispatch({ type: 'RESET_DRAFT' }); flash('Draft reset to sample'); }}>
          Reset draft to sample
        </button>
        <button className="btn primary" onClick={publish}>Publish as new version →</button>
      </div>
    </div>
  );
}

function Panel({ glyph, title, subtitle, action, children }) {
  return (
    <div className="section">
      <div className="panel">
        <div className="panel-head">
          <div className="titles">
            <div className="glyph">{glyph}</div>
            <div>
              <h3>{title}</h3>
              <div className="sub">{subtitle}</div>
            </div>
          </div>
          {action}
        </div>
        <div className="panel-body">{children}</div>
      </div>
    </div>
  );
}
