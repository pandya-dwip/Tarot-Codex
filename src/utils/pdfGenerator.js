export const FIELD_NAMES = [
  'cardName', 'arcana', 'number', 'planet', 'element', 'direction', 'day',
  'chakra', 'color', 'cardType', 'timeDuration', 'nameInitial'
];

export const FIELD_LABELS = {
  cardName: 'Card Name',
  arcana: 'Arcana',
  number: 'Number',
  planet: 'Planet',
  element: 'Element',
  direction: 'Direction',
  day: 'Day',
  chakra: 'Chakra',
  color: 'Color',
  cardType: 'Card Type',
  timeDuration: 'Time Duration',
  nameInitial: 'Name Initial'
};

const escapeHtml = (str) => {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
};

export const buildPageDOM = (cards, lang = 'en') => {
  const root = document.createElement('div');
  root.className = 'pdf-root';
  root.style.display = 'block';
  root.style.position = 'relative';

  cards.forEach((card, index) => {
    const page = document.createElement('div');
    page.className = 'pdf-page';

    const imageHtml = card.image
      ? `<img src="${card.image}" alt="">`
      : `<span class="no-image-glyph">✦</span>`;

    // Always use standard English labels for metadata fields in the PDF
    const fieldRows = FIELD_NAMES.map(name => `
      <div class="pdf-field-row">
        <span class="pdf-field-label">${FIELD_LABELS[name]}</span>
        <span class="pdf-field-value">${escapeHtml(card[name]) || '&mdash;'}</span>
      </div>
    `).join('');

    // Select correct description block based on requested PDF language
    const descText = lang === 'gu' ? card.description_gu : card.description_en;
    const descriptionHtml = descText
      ? descText.trim().split(/\n+/).map(p => `<p class="pdf-description-paragraph">${escapeHtml(p)}</p>`).join('')
      : '<p class="pdf-description-paragraph">&mdash;</p>';

    const displayName = card.cardName || card.arcana || 'Tarot Card';
    const numberedTitle = `${index + 1}. ${displayName}`;
    
    // Always use English page indicator and headers
    const pageNumHtml = `<div class="pdf-page-count">Page ${index + 1} of ${cards.length}</div>`;

    if (index === cards.length - 1) {
      page.style.pageBreakAfter = 'auto';
    }

    page.innerHTML = `
      ${pageNumHtml}
      <h1 class="pdf-page-title">${escapeHtml(numberedTitle)}</h1>
      <div class="pdf-top">
        <div class="pdf-image-wrap">${imageHtml}</div>
        <div class="pdf-fields">${fieldRows}</div>
      </div>
      <div class="pdf-description">
        <h2 class="pdf-description-heading">Description</h2>
        ${descriptionHtml}
      </div>
    `;

    root.appendChild(page);
  });

  return root;
};

// Wait for all images inside an element to decode and browser animation frames to finish painting
export const waitForLayoutAndImages = (element) => {
  const images = Array.from(element.querySelectorAll('img'));
  const imageReady = images.map(img => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    if (img.decode) return img.decode().catch(() => {});
    return new Promise(resolve => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  });
  const paint = new Promise(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
  return Promise.all([...imageReady, paint]);
};

export const generatePdfBlob = async (cards, lang = 'en') => {
  const pdfDOM = buildPageDOM(cards, lang);
  document.body.appendChild(pdfDOM);

  try {
    await waitForLayoutAndImages(pdfDOM);

    const jsPDFConstructor = window.jspdf?.jsPDF || window.jsPDF;
    if (!jsPDFConstructor) {
      throw new Error('jsPDF library was not loaded on page.');
    }

    const pdf = new jsPDFConstructor({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pages = Array.from(pdfDOM.querySelectorAll('.pdf-page'));
    
    for (let idx = 0; idx < pages.length; idx++) {
      const pageEl = pages[idx];
      const canvas = await window.html2canvas(pageEl, {
        scale: 2, // High resolution is safe now
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      if (idx > 0) {
        pdf.addPage();
      }
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    }

    return pdf;
  } finally {
    if (pdfDOM) pdfDOM.remove();
  }
};
