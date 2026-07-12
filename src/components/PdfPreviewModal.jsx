import React from 'react';
import { Download, X } from 'lucide-react';

export default function PdfPreviewModal({ isOpen, blobUrl, onClose, onDownload }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box preview-modal-box">
        <header className="preview-modal-header">
          <h2>PDF Preview</h2>
          <div className="preview-modal-actions">
            <button onClick={onDownload} className="btn btn-primary">
              <Download size={16} className="btn-icon" /> Download
            </button>
            <button onClick={onClose} className="btn btn-tertiary">
              <X size={16} className="btn-icon" /> Close
            </button>
          </div>
        </header>
        <div className="preview-modal-body">
          <iframe 
            id="pdfPreviewFrame" 
            src={blobUrl} 
            title="PDF Preview"
          />
        </div>
      </div>
    </div>
  );
}
