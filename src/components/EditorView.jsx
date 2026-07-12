import React, { useState, useEffect, useRef } from 'react';
import { FIELD_NAMES, FIELD_LABELS } from '../utils/pdfGenerator';
import { ArrowLeft, Trash2, Save, UploadCloud, X } from 'lucide-react';

const FIELD_PLACEHOLDERS = {
  cardName: 'e.g. The Fool',
  arcana: 'e.g. The Fool',
  number: 'e.g. 0',
  planet: 'e.g. Mercury',
  element: 'e.g. Air',
  direction: 'e.g. Upright',
  day: 'e.g. Sunday',
  chakra: 'e.g. Crown',
  color: 'e.g. Gold',
  cardType: 'e.g. Major Arcana',
  timeDuration: 'e.g. Days',
  nameInitial: 'e.g. F'
};

export default function EditorView({
  card,
  onBack,
  onSave,
  onDelete,
  onUploadImage,
  showToast
}) {
  const [formData, setFormData] = useState({});
  const [image, setImage] = useState(null);
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionGu, setDescriptionGu] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);
  const initialDataRef = useRef(null);

  // Initialize fields
  useEffect(() => {
    const defaultData = {};
    FIELD_NAMES.forEach(name => {
      defaultData[name] = card?.[name] || '';
    });

    const descEn = card?.description_en || '';
    const descGu = card?.description_gu || '';

    setFormData(defaultData);
    setImage(card?.image || null);
    setDescriptionEn(descEn);
    setDescriptionGu(descGu);

    // Keep snapshot for dirty checking
    initialDataRef.current = {
      fields: defaultData,
      image: card?.image || null,
      descriptionEn: descEn,
      descriptionGu: descGu
    };
  }, [card]);

  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getIsDirty = () => {
    if (!initialDataRef.current) return false;
    const current = {
      fields: formData,
      image,
      descriptionEn,
      descriptionGu
    };
    return JSON.stringify(current) !== JSON.stringify(initialDataRef.current);
  };

  const handleImageFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      if (file) showToast('Please choose an image file.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await onUploadImage(file);
      setImage(imageUrl);
      showToast('Image uploaded successfully.');
    } catch (err) {
      console.error(err);
      showToast('Image upload failed.', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSave({
      id: card?.id,
      image,
      description_en: descriptionEn,
      description_gu: descriptionGu,
      ...formData
    });
  };

  const handleBackClick = () => {
    onBack(getIsDirty());
  };

  return (
    <section id="editorView" className="view">
      <header className="editor-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{card?.id ? 'Edit Card' : 'New Card'}</h1>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button" 
            onClick={handleBackClick}
            className="btn btn-tertiary"
          >
            <ArrowLeft size={16} className="btn-icon" /> Back
          </button>
          
          {card?.id && (
            <button 
              type="button" 
              onClick={onDelete}
              className="btn btn-danger"
            >
              <Trash2 size={16} className="btn-icon" /> Delete
            </button>
          )}
        </div>
      </header>

      <form onSubmit={handleSave} id="cardForm" noValidate>
        {/* SECTION 1: image + fields */}
        <div className="editor-section section-top">
          
          <div className="editor-col image-col">
            <label className="field-label">Card Image</label>
            <div 
              id="imageDropzone" 
              className={`image-dropzone ${isDragOver ? 'drag-over' : ''}`}
              onClick={triggerFileSelect}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {image ? (
                <>
                  <img src={image} className="image-preview" alt="Card preview" />
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage(null);
                    }}
                    className="image-remove-btn" 
                    aria-label="Remove image"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="image-placeholder">
                  <UploadCloud 
                    size={32} 
                    className="upload-glyph" 
                    style={{ strokeWidth: 1.5, animation: isUploading ? 'pulse 1.5s infinite' : 'none' }}
                  />
                  <span>{isUploading ? 'Uploading…' : 'Upload Image'}</span>
                  <span className="upload-hint">or drag &amp; drop</span>
                </div>
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={(e) => handleImageFile(e.target.files?.[0])}
              accept="image/*" 
              className="visually-hidden" 
            />

            {image && (
              <button 
                type="button" 
                onClick={triggerFileSelect}
                className="btn btn-tertiary"
                style={{ width: '100%', marginTop: '4px' }}
              >
                <UploadCloud size={16} className="btn-icon" /> Replace Image
              </button>
            )}
          </div>

          <div className="editor-col fields-col">
            <div className="field-grid">
              {FIELD_NAMES.map(name => (
                <div className="field" key={name}>
                  <label className="field-label" htmlFor={`f-${name}`}>
                    {FIELD_LABELS[name]}
                  </label>
                  <input 
                    type="text" 
                    id={`f-${name}`} 
                    value={formData[name] || ''}
                    onChange={(e) => handleFieldChange(name, e.target.value)}
                    placeholder={FIELD_PLACEHOLDERS[name]} 
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* SECTION 2: bilingual descriptions */}
        <div className="editor-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div className="field" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="field-label" htmlFor="f-description-en">English Description</label>
            <textarea 
              id="f-description-en" 
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              placeholder="Write the meaning, symbolism, and notes for this card in English…"
              style={{ width: '100%', height: '320px', resize: 'vertical', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: '#FDFDFC', outline: 'none', lineHeight: '1.6' }}
            />
          </div>
          <div className="field" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="field-label" htmlFor="f-description-gu">Gujarati Description (ગુજરાતી વર્ણન)</label>
            <textarea 
              id="f-description-gu" 
              value={descriptionGu}
              onChange={(e) => setDescriptionGu(e.target.value)}
              placeholder="કાર્ડનો અર્થ અને પ્રતીકવાદ ગુજરાતીમાં લખો…"
              style={{ width: '100%', height: '320px', resize: 'vertical', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: '#FDFDFC', outline: 'none', lineHeight: '1.6' }}
            />
          </div>
        </div>

        {/* SECTION 3: actions */}
        <div className="editor-section section-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ minWidth: '160px' }}
          >
            <Save size={16} className="btn-icon" /> Save Card
          </button>
        </div>
      </form>
    </section>
  );
}
