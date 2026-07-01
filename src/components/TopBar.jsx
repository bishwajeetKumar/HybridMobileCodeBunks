const ROLES = [
  { id: 'admin', label: 'Admin' },
  { id: 'cm', label: 'Contract Manager' },
  { id: 'review', label: 'Review' },
];

export default function TopBar({ role, onRoleChange }) {
  return (
    <div className="topbar">
      <div className="brand">
        <div className="logo" aria-hidden="true" />
        <div className="wordmark">
          <h1>Usage &amp; Billing Platform</h1>
          <span>Contract Management Console</span>
        </div>
      </div>
      <div className="switcher" role="tablist" aria-label="Role">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={role === r.id}
            className={role === r.id ? 'active' : ''}
            onClick={() => onRoleChange(r.id)}
          >
            <span className="dot" />
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
