import React, { useState, useRef } from 'react';
import { ArrowLeft, Plus, UploadCloud, X, Save, HelpCircle } from 'lucide-react';

export default function BulkCreateView({
  onBack,
  onSaveBulk,
  onUploadImage,
  showToast
}) {
  const [step, setStep] = useState(1); // 1 = select count, 2 = enter details
  const [quantity, setQuantity] = useState(3);
  const [startingIndex, setStartingIndex] = useState(1);
  const [cardsData, setCardsData] = useState([]); // Array of { name: '', image: null, number: 1, isUploading: false }

  const fileInputRefs = useRef([]);

  const handleQuantitySubmit = (e) => {
    e.preventDefault();
    if (quantity < 1 || quantity > 30) {
      showToast('Please choose a quantity between 1 and 30.', 'error');
      return;
    }

    // Initialize cardsData array with startingIndex incremented sequentially
    const initialList = Array.from({ length: quantity }, (_, idx) => ({
      name: '',
      image: null,
      number: startingIndex + idx,
      isUploading: false
    }));
    setCardsData(initialList);
    setStep(2);
  };

  const handleCardNameChange = (index, value) => {
    setCardsData(prev => {
      const copy = [...prev];
      copy[index].name = value;
      return copy;
    });
  };

  const handleImageFile = async (index, file) => {
    if (!file || !file.type.startsWith('image/')) {
      if (file) showToast('Please select a valid image file.', 'error');
      return;
    }

    // Mark slot as uploading
    setCardsData(prev => {
      const copy = [...prev];
      copy[index].isUploading = true;
      return copy;
    });

    try {
      const imageUrl = await onUploadImage(file);
      setCardsData(prev => {
        const copy = [...prev];
        copy[index].image = imageUrl;
        copy[index].isUploading = false;
        return copy;
      });
      showToast(`Image uploaded for Card ${index + 1}.`);
    } catch (err) {
      console.error(err);
      showToast('Image upload failed.', 'error');
      setCardsData(prev => {
        const copy = [...prev];
        copy[index].isUploading = false;
        return copy;
      });
    }
  };

  const handleSaveAll = (e) => {
    e.preventDefault();
    
    // Validate: must have at least one card name
    const validCards = cardsData.filter(c => c.name.trim() !== '');
    if (validCards.length === 0) {
      showToast('Please enter a name for at least one card.', 'error');
      return;
    }

    onSaveBulk(cardsData);
  };

  return (
    <section id="bulkCreateView" className="view">
      <header className="editor-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Bulk Create Cards</h1>
        <button 
          type="button" 
          onClick={onBack}
          className="btn btn-tertiary"
        >
          <ArrowLeft size={16} className="btn-icon" /> Cancel
        </button>
      </header>

      {step === 1 ? (
        <form onSubmit={handleQuantitySubmit} className="editor-section" style={{ maxWidth: '500px', margin: '40px auto 0', padding: '36px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          <HelpCircle size={48} style={{ color: 'var(--color-gold)', strokeWidth: 1.2 }} />
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 8px', fontSize: '1.8rem' }}>Bulk Create Setup</h2>
            <p style={{ color: 'var(--color-ink-muted)', fontSize: '0.92rem', margin: 0 }}>Configure card count and starting sequential index number.</p>
          </div>

          <div style={{ display: 'flex', gap: '20px', width: '100%', justifyContent: 'center', alignItems: 'flex-start' }}>
            <div className="field" style={{ width: '140px' }}>
              <label className="field-label" style={{ textAlign: 'center', minHeight: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                How Many Cards
              </label>
              <input 
                type="number" 
                min={1} 
                max={30}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 600, padding: '10px' }}
              />
            </div>
            <div className="field" style={{ width: '140px' }}>
              <label className="field-label" style={{ textAlign: 'center', minHeight: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Starting Index
              </label>
              <input 
                type="number" 
                min={0}
                value={startingIndex}
                onChange={(e) => setStartingIndex(parseInt(e.target.value) || 0)}
                style={{ textAlign: 'center', fontSize: '1.1rem', fontWeight: 600, padding: '10px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
            <button type="button" onClick={onBack} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Next
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleSaveAll}>
          <div className="editor-section bulk-grid-section">
            <h2 style={{ fontFamily: 'var(--font-display)', margin: '0 0 20px', fontSize: '1.6rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
              Card Details ({quantity} Slots)
            </h2>
            
            <div className="bulk-grid">
              {cardsData.map((cardItem, idx) => (
                <div key={idx} className="bulk-item-box" style={{ gap: '12px' }}>
                  
                  {/* Compact Uploader */}
                  <div 
                    className="bulk-image-slot"
                    onClick={() => fileInputRefs.current[idx]?.click()}
                  >
                    {cardItem.image ? (
                      <>
                        <img src={cardItem.image} alt={`Slot ${idx + 1}`} />
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCardsData(prev => {
                              const copy = [...prev];
                              copy[idx].image = null;
                              return copy;
                            });
                          }}
                          className="image-remove-btn"
                          style={{ width: '22px', height: '22px', top: '4px', right: '4px' }}
                        >
                          <X size={12} />
                        </button>
                      </>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: 'var(--color-ink-muted)', fontSize: '0.72rem', textAlign: 'center', padding: '4px' }}>
                        <UploadCloud size={18} style={{ color: 'var(--color-gold)' }} />
                        <span>{cardItem.isUploading ? 'Uploading…' : 'Add Image'}</span>
                      </div>
                    )}
                  </div>

                  <input 
                    type="file"
                    ref={el => fileInputRefs.current[idx] = el}
                    onChange={(e) => handleImageFile(idx, e.target.files?.[0])}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />

                  {/* Name field */}
                  <div className="field" style={{ flex: 1 }}>
                    <label className="field-label" style={{ fontSize: '0.72rem' }}>Card Name #{idx + 1}</label>
                    <input 
                      type="text"
                      value={cardItem.name}
                      onChange={(e) => handleCardNameChange(idx, e.target.value)}
                      placeholder="e.g. The Moon"
                      style={{ padding: '8px 10px', fontSize: '0.88rem' }}
                    />
                  </div>

                  {/* Editable sequential Card Number field */}
                  <div className="field" style={{ width: '80px' }}>
                    <label className="field-label" style={{ fontSize: '0.72rem' }}>Number</label>
                    <input 
                      type="number"
                      value={cardItem.number}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setCardsData(prev => {
                          const copy = [...prev];
                          copy[idx].number = val;
                          return copy;
                        });
                      }}
                      style={{ padding: '8px 8px', fontSize: '0.88rem', textAlign: 'center' }}
                    />
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="editor-section section-actions" style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="btn btn-tertiary"
              style={{ marginRight: 'auto' }}
            >
              Back
            </button>
            <button 
              type="button" 
              onClick={onBack}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ minWidth: '160px' }}
            >
              <Save size={16} className="btn-icon" /> Create Cards
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
