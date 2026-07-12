import React, { useEffect, useRef } from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  const okBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      okBtnRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal-box" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <AlertTriangle size={24} className="text-danger" style={{ color: 'var(--color-danger)', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ margin: 0, fontSize: '0.98rem', lineHeight: '1.4', color: 'var(--color-ink)' }}>
            {message}
          </p>
        </div>
        <div className="modal-actions" style={{ marginTop: '4px' }}>
          <button onClick={onCancel} className="btn btn-tertiary">
            <X size={16} className="btn-icon" /> Cancel
          </button>
          <button ref={okBtnRef} onClick={onConfirm} className="btn btn-danger">
            <Trash2 size={16} className="btn-icon" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
