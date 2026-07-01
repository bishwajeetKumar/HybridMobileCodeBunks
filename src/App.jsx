import { useState } from 'react';
import TopBar from './components/TopBar.jsx';
import AdminView from './components/AdminView.jsx';
import ContractManagerView from './components/ContractManagerView.jsx';
import ReviewView from './components/ReviewView.jsx';
import { ToastProvider } from './components/Toast.jsx';
import { usePersistentStore } from './hooks/usePersistentStore.js';
import { clearStore } from './db/store.js';

export default function App() {
  const { state, dispatch, ready } = usePersistentStore();
  const [role, setRole] = useState('admin');

  const wipe = async () => {
    // eslint-disable-next-line no-alert
    if (typeof window !== 'undefined' && window.confirm && !window.confirm('Reset all data to the sample set?')) return;
    await clearStore();
    dispatch({ type: 'WIPE' });
  };

  return (
    <ToastProvider>
      <div className="wrap">
        <TopBar role={role} onRoleChange={setRole} />
        {!ready && <div className="empty">Loading saved data…</div>}
        {ready && role === 'admin' && (
          <AdminView state={state} dispatch={dispatch} onPublished={() => setRole('cm')} />
        )}
        {ready && role === 'cm' && <ContractManagerView state={state} dispatch={dispatch} />}
        {ready && role === 'review' && <ReviewView state={state} dispatch={dispatch} />}
        <div className="foot">
          Prototype · saved to your browser (IndexedDB) ·{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); wipe(); }} style={{ color: 'var(--txt-faint)' }}>reset all data</a>
        </div>
      </div>
    </ToastProvider>
  );
}
