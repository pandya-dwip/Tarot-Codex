import React, { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 2400);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div 
      className={`toast ${toast.type === 'error' ? 'toast-error' : ''}`}
      role="alert"
    >
      {toast.message}
    </div>
  );
}
