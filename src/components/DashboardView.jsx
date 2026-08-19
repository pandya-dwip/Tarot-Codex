import React, { useRef } from 'react';
import { 
  Plus, 
  Eye, 
  Download, 
  Database, 
  FolderOpen, 
  Search as SearchIcon, 
  X, 
  HelpCircle,
  Globe,
  ListPlus,
  ListChecks
} from 'lucide-react';

export default function DashboardView({
  cards,
  searchTerm,
  onSearchChange,
  onNewCard,
  onBulkCreate,
  onEditCard,
  onPreviewPdf,
  onGeneratePdf,
  onBackup,
  onRestore,
  isPdfGenerating,
  activeLanguage,
  onActiveLanguageChange,
  isSelectionMode,
  onToggleSelectionMode,
  selectedCardIds,
  onSelectCard,
  onBulkUpdateClick,
  onClearSelection
}) {
  const fileInputRef = useRef(null);

  const term = searchTerm.trim().toLowerCase();
  const visibleCards = term
    ? cards.filter(card => {
        const haystack = [
          card.cardName,
          card.arcana,
          card.element,
          card.number,
          card.planet,
          card.description_en,
          card.description_gu
        ].join(' ').toLowerCase();
        return haystack.includes(term);
      })
    : cards;

  const totalLabel = cards.length === 1 ? '1 card' : `${cards.length} cards`;
  const countMessage = term
    ? `${visibleCards.length} of ${totalLabel} matching “${searchTerm}”`
    : `${totalLabel} in your codex`;

  const handleRestoreChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onRestore(file);
      e.target.value = ''; // clear input
    }
  };

  return (
    <section id="dashboardView" className="view">
      <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <div className="brand">
            <span className="brand-mark">✦</span>
            <h1>Tarot Codex</h1>
          </div>
          <p className="brand-sub">Your personal deck reference, one card at a time.</p>
        </div>
        
        {/* PDF Export Target Language Selector */}
        <div className="language-toggle-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid var(--color-border)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
          <Globe size={15} style={{ color: 'var(--color-ink-muted)', marginLeft: '6px' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--color-ink-muted)', marginRight: '2px', fontWeight: 500 }}>PDF Language:</span>
          <button 
            type="button" 
            onClick={() => onActiveLanguageChange('en')}
            className="btn"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              borderRadius: 'calc(var(--radius-sm) - 2px)',
              background: activeLanguage === 'en' ? 'var(--color-accent)' : 'transparent',
              color: activeLanguage === 'en' ? '#fff' : 'var(--color-ink)',
              border: 'none',
              fontWeight: 600
            }}
          >
            English
          </button>
          <button 
            type="button" 
            onClick={() => onActiveLanguageChange('gu')}
            className="btn"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              borderRadius: 'calc(var(--radius-sm) - 2px)',
              background: activeLanguage === 'gu' ? 'var(--color-accent)' : 'transparent',
              color: activeLanguage === 'gu' ? '#fff' : 'var(--color-ink)',
              border: 'none',
              fontWeight: 600
            }}
          >
            Gujarati
          </button>
        </div>
      </header>

      <div className="toolbar">
        <div className="toolbar-actions">
          <button onClick={onNewCard} className="btn btn-primary" id="newCardBtn">
            <Plus size={16} className="btn-icon" /> New Card
          </button>
          
          <button onClick={onBulkCreate} className="btn btn-secondary" id="bulkCreateBtn">
            <ListPlus size={16} className="btn-icon" /> Bulk Create
          </button>
          
          <button 
            onClick={onToggleSelectionMode} 
            className={`btn ${isSelectionMode ? 'btn-primary' : 'btn-secondary'}`} 
            id="bulkUpdateBtn"
            disabled={cards.length === 0}
          >
            <ListChecks size={16} className="btn-icon" /> {isSelectionMode ? 'Exit Selection' : 'Bulk Update'}
          </button>
          
          <button 
            onClick={onPreviewPdf} 
            className="btn btn-secondary" 
            id="previewPdfBtn"
            disabled={isPdfGenerating || cards.length === 0}
          >
            <Eye size={16} className="btn-icon" /> Preview PDF ({activeLanguage === 'gu' ? 'Gujarati' : 'English'})
          </button>
          
          <button 
            onClick={onGeneratePdf} 
            className="btn btn-secondary" 
            id="generatePdfBtn"
            disabled={isPdfGenerating || cards.length === 0}
          >
            <Download size={16} className="btn-icon" /> {isPdfGenerating ? 'Generating…' : `Generate PDF (${activeLanguage === 'gu' ? 'Gujarati' : 'English'})`}
          </button>

          <button 
            onClick={onBackup} 
            className="btn btn-secondary" 
            id="backupBtn"
            disabled={cards.length === 0}
            title="Save database backup to local backup folder"
          >
            <Database size={16} className="btn-icon" /> Backup
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="btn btn-secondary" 
            id="restoreBtn"
            title="Restore database from a JSON backup file"
          >
            <FolderOpen size={16} className="btn-icon" /> Restore
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleRestoreChange}
            accept=".json,application/json"
            style={{ display: 'none' }}
          />
        </div>
        
        <div className="search-wrap">
          <SearchIcon size={18} className="search-glyph" />
          <input 
            type="text" 
            id="searchInput" 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search cards by name, arcana, planet, element, details…" 
            autoComplete="off"
          />
          {searchTerm && (
            <button 
              type="button" 
              onClick={() => onSearchChange('')}
              id="searchClearBtn" 
              className="search-clear" 
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {cards.length > 0 && (
        <p id="cardCount" className="card-count">{countMessage}</p>
      )}

      {cards.length === 0 ? (
        <div id="emptyState" className="empty-state">
          <div className="empty-glyph">✦</div>
          <h2>No cards yet</h2>
          <p>Start your codex by creating your first tarot card entry.</p>
          <button onClick={onNewCard} className="btn btn-primary">
            <Plus size={16} className="btn-icon" /> Create a Card
          </button>
        </div>
      ) : visibleCards.length === 0 ? (
        <div id="noResultsState" className="empty-state">
          <HelpCircle size={40} className="empty-glyph" style={{ strokeWidth: 1.5 }} />
          <h2>No matches found</h2>
          <p>Try a different search term.</p>
        </div>
      ) : (
        <div id="cardsGrid" className="cards-grid" aria-live="polite">
          {visibleCards.map((card, index) => {
            const title = card.cardName || card.arcana || 'Untitled Card';
            const isSelected = selectedCardIds.includes(card.id);
            
            const metaParts = [];
            if (card.arcana) metaParts.push(<span key="arcana">{card.arcana}</span>);
            if (card.element) metaParts.push(<span key="element">{card.element}</span>);
            if (card.planet) metaParts.push(<span key="planet">{card.planet}</span>);

            return (
              <div 
                key={card.id}
                className={`card-preview premium-tarot-card ${isSelectionMode ? 'in-selection-mode' : ''} ${isSelected ? 'selected' : ''}`} 
                onClick={() => {
                  if (isSelectionMode) {
                    onSelectCard(card.id);
                  } else {
                    onEditCard(card.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={isSelectionMode ? `Select ${title}` : `Open ${title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (isSelectionMode) {
                      onSelectCard(card.id);
                    } else {
                      onEditCard(card.id);
                    }
                  }
                }}
              >
                {/* Physical Gold Border Inlay Overlay */}
                <div className="card-inlay-border"></div>

                <div className="card-preview-image">
                  {/* Top-Left Gold Index Badge */}
                  <div className="card-number-badge">
                    {card.number || (index + 1)}
                  </div>

                  {/* Top-Right Selection Checkbox */}
                  {isSelectionMode && (
                    <div className={`card-select-checkbox ${isSelected ? 'checked' : ''}`}>
                      {isSelected && <ListChecks size={12} style={{ color: '#fff' }} />}
                    </div>
                  )}
                  
                  {card.image ? (
                    <img src={card.image} alt={title || 'Tarot card'} />
                  ) : (
                    <span className="no-image-glyph">✦</span>
                  )}
                </div>
                <div className="card-preview-body">
                  <h3 className="card-preview-title">{title}</h3>
                  <div className="card-preview-meta">
                    {metaParts}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Selection Banner */}
      {isSelectionMode && (
        <div className="selection-floating-banner">
          <div className="banner-content">
            <span className="banner-text">
              <strong>{selectedCardIds.length}</strong> {selectedCardIds.length === 1 ? 'card' : 'cards'} selected
            </span>
            <div className="banner-actions">
              <button 
                type="button" 
                onClick={onClearSelection} 
                className="btn btn-tertiary"
                style={{ color: '#ffffff', opacity: 0.85 }}
                disabled={selectedCardIds.length === 0}
              >
                Clear Selection
              </button>
              <button 
                type="button" 
                onClick={onBulkUpdateClick} 
                className="btn btn-primary"
                style={{ background: '#ffffff', color: 'var(--color-accent)', fontWeight: 600 }}
                disabled={selectedCardIds.length === 0}
              >
                Update Fields
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
