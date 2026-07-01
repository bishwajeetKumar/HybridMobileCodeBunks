import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState(null);
  const timer = useRef(null);

  const flash = useCallback((text) => {
    setMsg(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), 2600);
  }, []);

  return (
    <ToastContext.Provider value={flash}>
      {children}
      <div className={'toast' + (msg ? ' show' : '')} role="status" aria-live="polite">
        {msg && (
          <>
            <span className="toast-check">✓</span>
            {msg}
          </>
        )}
      </div>
    </ToastContext.Provider>
  );
}
