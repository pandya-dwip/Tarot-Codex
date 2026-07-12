import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { FIELD_LABELS } from '../utils/pdfGenerator';

const FIELD_OPTIONS = [
  { value: 'cardName', label: 'Card Name' },
  { value: 'arcana', label: 'Arcana' },
  { value: 'number', label: 'Number' },
  { value: 'planet', label: 'Planet' },
  { value: 'element', label: 'Element' },
  { value: 'direction', label: 'Direction' },
  { value: 'day', label: 'Day' },
  { value: 'chakra', label: 'Chakra' },
  { value: 'color', label: 'Color' },
  { value: 'cardType', label: 'Card Type' },
  { value: 'timeDuration', label: 'Time Duration' },
  { value: 'nameInitial', label: 'Name Initial' },
  { value: 'description_en', label: 'English Description' },
  { value: 'description_gu', label: 'Gujarati Description' }
];

export default function BulkUpdateModal({ isOpen, onClose, onConfirm, selectedCount }) {
  const [selectedField, setSelectedField] = useState('element');
  const [newValue, setNewValue] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(selectedField, newValue);
    setNewValue('');
  };

  const isTextarea = selectedField === 'description_en' || selectedField === 'description_gu';

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: '500px', width: '95%', padding: '28px 32px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', margin: 0 }}>
            Bulk Update ({selectedCount} Cards)
          </h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="search-clear" 
            style={{ position: 'static', width: '28px', height: '28px' }}
          >
            <X size={16} />
          </button>
        </header>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="field">
            <label className="field-label" htmlFor="bulk-field-select">Select Field to Update</label>
            <select
              id="bulk-field-select"
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: '#FDFDFC',
                fontSize: '0.92rem',
                color: 'var(--color-ink)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {FIELD_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="bulk-field-val">New Value</label>
            {isTextarea ? (
              <textarea
                id="bulk-field-val"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                rows={6}
                placeholder="Enter new text description..."
                style={{
                  width: '100%',
                  resize: 'vertical',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: '#FDFDFC',
                  outline: 'none',
                  fontSize: '0.92rem',
                  lineHeight: '1.5'
                }}
              />
            ) : (
              <input
                id="bulk-field-val"
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Enter new value..."
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  background: '#FDFDFC',
                  outline: 'none',
                  fontSize: '0.92rem'
                }}
              />
            )}
            <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: 'var(--color-ink-muted)' }}>
              Note: This will overwrite the selected field for all {selectedCount} cards.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '130px' }}>
              <Check size={16} className="btn-icon" /> Apply Update
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
