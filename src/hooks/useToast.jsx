import { useState, useCallback } from 'react';

let idCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((message, type = 'success') => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const success = useCallback((msg) => show(msg, 'success'), [show]);
  const error = useCallback((msg) => show(msg, 'error'), [show]);

  const ToastContainer = toasts.length > 0 ? (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' ? '✓' : '✕'}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  ) : null;

  return { success, error, ToastContainer };
}
