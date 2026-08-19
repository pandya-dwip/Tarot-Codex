import React, { useState, useEffect } from 'react';
import DashboardView from './components/DashboardView';
import EditorView from './components/EditorView';
import BulkCreateView from './components/BulkCreateView';
import Toast from './components/Toast';
import ConfirmModal from './components/ConfirmModal';
import PdfPreviewModal from './components/PdfPreviewModal';
import BulkUpdateModal from './components/BulkUpdateModal';
import { generatePdfBlob } from './utils/pdfGenerator';

const migrateCard = (card) => {
  if (card.description_en !== undefined) return card;

  // If card was in tabbed schema (en/gu structure), convert back to flat
  if (card.en && card.gu) {
    const flat = {
      id: card.id,
      image: card.image,
      description_en: card.en.description || '',
      description_gu: card.gu.description || ''
    };
    const FIELD_NAMES = [
      'cardName', 'arcana', 'number', 'planet', 'element', 'direction', 'day',
      'chakra', 'color', 'cardType', 'timeDuration', 'nameInitial'
    ];
    FIELD_NAMES.forEach(name => {
      flat[name] = card.en[name] || '';
    });
    return flat;
  }

  // If card was flat
  const migrated = { ...card };
  migrated.description_en = card.description || '';
  migrated.description_gu = '';
  delete migrated.description;
  return migrated;
};

export default function App() {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');
  const [editingCardId, setEditingCardId] = useState(null);
  
  // PDF Export target language: 'en' (English) or 'gu' (Gujarati)
  const [activeLanguage, setActiveLanguage] = useState('en');

  // Modals & Overlay state
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfOverlayOpen, setPdfOverlayOpen] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [activePdfBlobUrl, setActivePdfBlobUrl] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [cardToDeleteId, setCardToDeleteId] = useState(null);
  
  // Selection Mode & Bulk Update States
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [isBulkUpdateModalOpen, setIsBulkUpdateModalOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchCards = async () => {
    try {
      const res = await fetch('/api/cards');
      const data = await res.json();
      const migrated = data.map(migrateCard);
      setCards(migrated);
    } catch (err) {
      console.error('Failed to load cards:', err);
      showToast('Failed to load cards database.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const handleUploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Upload failed');
    }
    const data = await res.json();
    return data.imageUrl;
  };

  const handleSaveCard = async (cardData, options = {}) => {
    const navigateToNext = options?.navigateToNext || false;
    const cardId = cardData.id || 'card-' + Date.now() + '-' + Math.random().toString(16).slice(2);
    const payload = { ...cardData, id: cardId };

    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Save failed');
      
      // Fetch latest list of cards
      const freshRes = await fetch('/api/cards');
      const freshData = await freshRes.json();
      const migrated = freshData.map(migrateCard);
      setCards(migrated);

      if (navigateToNext) {
        const currentIndex = migrated.findIndex(c => c.id === cardId);
        if (currentIndex !== -1 && currentIndex + 1 < migrated.length) {
          const nextCard = migrated[currentIndex + 1];
          setEditingCardId(nextCard.id);
          setCurrentView('editor');
          window.scrollTo(0, 0);
          showToast(`Card saved. Switched to next card: "${nextCard.cardName || 'Untitled Card'}".`);
        } else if (migrated.length > 0) {
          const firstCard = migrated[0];
          setEditingCardId(firstCard.id);
          setCurrentView('editor');
          window.scrollTo(0, 0);
          showToast(`Card saved. Reached end of cards, looped to "${firstCard.cardName || 'First Card'}".`);
        } else {
          setCurrentView('dashboard');
          setEditingCardId(null);
          showToast('Card saved.');
        }
      } else {
        showToast('Card saved.');
        setCurrentView('dashboard');
        setEditingCardId(null);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save card.', 'error');
    }
  };

  const handleSaveBulkCards = async (bulkList) => {
    setIsLoading(true);
    try {
      const FIELD_NAMES = [
        'cardName', 'arcana', 'number', 'planet', 'element', 'direction', 'day',
        'chakra', 'color', 'cardType', 'timeDuration', 'nameInitial'
      ];
      
      const requests = bulkList
        .filter(item => item.name.trim() !== '')
        .map(item => {
          const payload = {
            id: 'card-' + Date.now() + '-' + Math.round(Math.random() * 1e9),
            image: item.image || null,
            cardName: item.name || '',
            description_en: '',
            description_gu: '',
          };
          FIELD_NAMES.forEach(name => {
            if (name === 'number') {
              payload[name] = String(item.number !== undefined ? item.number : '');
            } else if (name !== 'cardName') {
              payload[name] = '';
            }
          });
          return fetch('/api/cards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
        });
      
      await Promise.all(requests);
      showToast(`Successfully created ${requests.length} cards in bulk.`);
      fetchCards();
      setCurrentView('dashboard');
    } catch (err) {
      console.error(err);
      showToast('Failed to create cards in bulk.', 'error');
      setIsLoading(false);
    }
  };

  const handleToggleSelectionMode = () => {
    setIsSelectionMode(prev => {
      const next = !prev;
      if (!next) {
        setSelectedCardIds([]);
      }
      return next;
    });
  };

  const handleSelectCard = (id) => {
    setSelectedCardIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleConfirmBulkUpdate = async (field, value) => {
    if (selectedCardIds.length === 0) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/cards/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ids: selectedCardIds,
          field,
          value
        })
      });
      if (!res.ok) throw new Error('Bulk update failed');
      const data = await res.json();
      showToast(`Successfully updated ${data.count} cards.`);
      setIsSelectionMode(false);
      setSelectedCardIds([]);
      setIsBulkUpdateModalOpen(false);
      fetchCards();
    } catch (err) {
      console.error(err);
      showToast('Failed to apply bulk update.', 'error');
      setIsLoading(false);
    }
  };

  const handleDeleteCardConfirm = () => {
    if (cardToDeleteId) {
      handleDeleteCard(cardToDeleteId);
    }
  };

  const handleDeleteCard = async (id) => {
    try {
      const res = await fetch(`/api/cards/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');
      
      showToast('Card deleted.');
      fetchCards();
      setCurrentView('dashboard');
      setEditingCardId(null);
      setDeleteConfirmOpen(false);
      setCardToDeleteId(null);
    } catch (err) {
      console.error(err);
      showToast('Failed to delete card.', 'error');
    }
  };

  const handleBackup = async () => {
    try {
      const res = await fetch('/api/backup', { method: 'POST' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Backup failed');
      }
      const data = await res.json();
      showToast(`Backup saved to "backup" folder (${data.filename})`);
    } catch (err) {
      console.error('Backup error:', err);
      showToast(err.message || 'Failed to save backup file.', 'error');
    }
  };

  const handleRestore = async (file) => {
    try {
      const formData = new FormData();
      formData.append('backupFile', file);
      const res = await fetch('/api/restore', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Restore failed');
      }
      const result = await res.json();
      showToast(`Database restored! Loaded ${result.count} cards.`);
      fetchCards();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to restore database.', 'error');
    }
  };

  const handleGeneratePdf = async () => {
    if (cards.length === 0) return;
    setIsPdfGenerating(true);
    setPdfOverlayOpen(true);
    
    try {
      const pdf = await generatePdfBlob(cards, activeLanguage);
      const filename = activeLanguage === 'gu' ? 'tarot-codex-gujarati.pdf' : 'tarot-codex-english.pdf';
      pdf.save(filename);
      showToast('PDF generated.');
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('Something went wrong generating the PDF.', 'error');
    } finally {
      setPdfOverlayOpen(false);
      setIsPdfGenerating(false);
    }
  };

  const handlePreviewPdf = async () => {
    if (cards.length === 0) return;
    setIsPdfGenerating(true);
    setPdfOverlayOpen(true);

    try {
      const pdf = await generatePdfBlob(cards, activeLanguage);
      const pdfBlob = pdf.output('blob');

      if (activePdfBlobUrl) {
        URL.revokeObjectURL(activePdfBlobUrl);
      }

      const blobUrl = URL.createObjectURL(pdfBlob);
      setActivePdfBlobUrl(blobUrl);
      setPdfPreviewOpen(true);
    } catch (err) {
      console.error('PDF preview error:', err);
      showToast('Something went wrong preparing the preview.', 'error');
    } finally {
      setPdfOverlayOpen(false);
      setIsPdfGenerating(false);
    }
  };

  const handleClosePreview = () => {
    setPdfPreviewOpen(false);
    if (activePdfBlobUrl) {
      URL.revokeObjectURL(activePdfBlobUrl);
      setActivePdfBlobUrl(null);
    }
  };

  const handleBackFromEditor = (isDirty) => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Discard them?')) {
        setCurrentView('dashboard');
        setEditingCardId(null);
      }
    } else {
      setCurrentView('dashboard');
      setEditingCardId(null);
    }
  };

  const activeCard = editingCardId ? cards.find(c => c.id === editingCardId) : null;

  return (
    <div id="app">
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--color-ink-muted)' }}>
          <div className="pdf-spinner" style={{ marginBottom: '16px' }}></div>
          <p>Loading your Tarot Codex…</p>
        </div>
      ) : currentView === 'dashboard' ? (
        <DashboardView
          cards={cards}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onNewCard={() => {
            setEditingCardId(null);
            setCurrentView('editor');
          }}
          onBulkCreate={() => {
            setCurrentView('bulk-create');
          }}
          onEditCard={(id) => {
            setEditingCardId(id);
            setCurrentView('editor');
          }}
          onPreviewPdf={handlePreviewPdf}
          onGeneratePdf={handleGeneratePdf}
          onBackup={handleBackup}
          onRestore={handleRestore}
          isPdfGenerating={isPdfGenerating}
          activeLanguage={activeLanguage}
          onActiveLanguageChange={setActiveLanguage}
          isSelectionMode={isSelectionMode}
          onToggleSelectionMode={handleToggleSelectionMode}
          selectedCardIds={selectedCardIds}
          onSelectCard={handleSelectCard}
          onBulkUpdateClick={() => setIsBulkUpdateModalOpen(true)}
          onClearSelection={() => setSelectedCardIds([])}
        />
      ) : currentView === 'bulk-create' ? (
        <BulkCreateView
          onBack={() => setCurrentView('dashboard')}
          onSaveBulk={handleSaveBulkCards}
          onUploadImage={handleUploadImage}
          showToast={showToast}
        />
      ) : (
        <EditorView
          card={activeCard}
          onBack={handleBackFromEditor}
          onSave={handleSaveCard}
          onDelete={() => {
            setCardToDeleteId(editingCardId);
            setDeleteConfirmOpen(true);
          }}
          onUploadImage={handleUploadImage}
          showToast={showToast}
        />
      )}

      {/* Confirmation Modal overlay */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        message="Delete this card? This cannot be undone."
        onConfirm={handleDeleteCardConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setCardToDeleteId(null);
        }}
      />

      {/* PDF Preview Modal overlay */}
      <PdfPreviewModal
        isOpen={pdfPreviewOpen}
        blobUrl={activePdfBlobUrl}
        onClose={handleClosePreview}
        onDownload={() => {
          handleGeneratePdf();
          handleClosePreview();
        }}
      />

      {/* Bulk Update Modal Overlay */}
      <BulkUpdateModal
        isOpen={isBulkUpdateModalOpen}
        onClose={() => setIsBulkUpdateModalOpen(false)}
        onConfirm={handleConfirmBulkUpdate}
        selectedCount={selectedCardIds.length}
      />

      {/* PDF Loading Overlay */}
      {pdfOverlayOpen && (
        <div id="pdfOverlay" className="pdf-overlay">
          <div className="pdf-spinner"></div>
          <p>Generating your PDF…</p>
        </div>
      )}

      {/* Toast notifications */}
      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
