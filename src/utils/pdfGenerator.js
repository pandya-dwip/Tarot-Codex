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

  const totalPages = cards.length + 2;
  const isGu = lang === 'gu';

  // 1. Cover Page (Page 1 - Left blank as requested)
  const coverPage = document.createElement('div');
  coverPage.className = 'pdf-page pdf-cover-page';
  coverPage.innerHTML = `
    <div class="pdf-page-count">Page 1 of ${totalPages}</div>
    <div class="pdf-cover-content"></div>
  `;
  root.appendChild(coverPage);

  // 2. Overview Page (Page 2)
  const overviewPage = document.createElement('div');
  overviewPage.className = 'pdf-page pdf-overview-page';

  const overviewTitle = isGu ? 'ઓવરવ્યૂ' : 'Overview';
  const overviewHtml = isGu
    ? `
      <div class="pdf-overview-container">
        <div class="pdf-overview-card">
          <h2 class="pdf-overview-section-title">ટેરેટ ડેક પરિચય</h2>
          <p class="pdf-overview-text">ટેરેટ ડેક માં ટોટલ <strong>78 કાર્ડ</strong> છે.</p>
          <p class="pdf-overview-text">આ 78 કાર્ડને બે ભાગમાં વહેંચવામાં આવે છે:</p>
          <ul class="pdf-overview-list">
            <li><strong>મેજર કાર્ડ:</strong> 0 - 21 (ટોટલ 22 છે)</li>
            <li><strong>માઇનર કાર્ડ:</strong> 56 છે (22 + 56 = 78 કાર્ડ)</li>
          </ul>
        </div>

        <div class="pdf-overview-card">
          <h2 class="pdf-overview-section-title">માઇનર કાર્ડ વિભાગ</h2>
          <p class="pdf-overview-text">માઇનર કાર્ડને ચાર ભાગમાં વહેંચવામાં આવ્યા છે:</p>
          <div class="pdf-overview-suits-grid">
            <div class="pdf-suit-item">
              <div class="pdf-suit-thumb">
                <img src="/uploads/suit-pentacles.jpg" alt="Pentacles">
              </div>
              <div class="pdf-suit-details">
                <div class="pdf-suit-header">
                  <span class="pdf-suit-num">1</span>
                  <span class="pdf-suit-name">પેન્ટાકસ</span>
                </div>
                <span class="pdf-suit-count">14 Cards</span>
              </div>
            </div>

            <div class="pdf-suit-item">
              <div class="pdf-suit-thumb">
                <img src="/uploads/suit-cups.jpg" alt="Cups">
              </div>
              <div class="pdf-suit-details">
                <div class="pdf-suit-header">
                  <span class="pdf-suit-num">2</span>
                  <span class="pdf-suit-name">કપ</span>
                </div>
                <span class="pdf-suit-count">14 Cards</span>
              </div>
            </div>

            <div class="pdf-suit-item">
              <div class="pdf-suit-thumb">
                <img src="/uploads/suit-wands.jpg" alt="Wands">
              </div>
              <div class="pdf-suit-details">
                <div class="pdf-suit-header">
                  <span class="pdf-suit-num">3</span>
                  <span class="pdf-suit-name">વોન્ટસ</span>
                </div>
                <span class="pdf-suit-count">14 Cards</span>
              </div>
            </div>

            <div class="pdf-suit-item">
              <div class="pdf-suit-thumb">
                <img src="/uploads/suit-swords.jpg" alt="Swords">
              </div>
              <div class="pdf-suit-details">
                <div class="pdf-suit-header">
                  <span class="pdf-suit-num">4</span>
                  <span class="pdf-suit-name">સ્વૉર્ડ્સ</span>
                </div>
                <span class="pdf-suit-count">14 Cards</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    : `
      <div class="pdf-overview-container">
        <div class="pdf-overview-card">
          <h2 class="pdf-overview-section-title">Tarot Deck Overview</h2>
          <p class="pdf-overview-text">There are a total of <strong>78 cards</strong> in a Tarot deck.</p>
          <p class="pdf-overview-text">These 78 cards are divided into two main categories:</p>
          <ul class="pdf-overview-list">
            <li><strong>Major Arcana:</strong> 0 - 21 (Total 22 cards)</li>
            <li><strong>Minor Arcana:</strong> 56 cards (22 + 56 = 78 cards)</li>
          </ul>
        </div>

        <div class="pdf-overview-card">
          <h2 class="pdf-overview-section-title">Minor Arcana Suits</h2>
          <p class="pdf-overview-text">The Minor Arcana is divided into four suits:</p>
          <div class="pdf-overview-suits-grid">
            <div class="pdf-suit-item">
              <div class="pdf-suit-thumb">
                <img src="/uploads/suit-pentacles.jpg" alt="Pentacles">
              </div>
              <div class="pdf-suit-details">
                <div class="pdf-suit-header">
                  <span class="pdf-suit-num">1</span>
                  <span class="pdf-suit-name">Pentacles</span>
                </div>
                <span class="pdf-suit-count">14 Cards</span>
              </div>
            </div>

            <div class="pdf-suit-item">
              <div class="pdf-suit-thumb">
                <img src="/uploads/suit-cups.jpg" alt="Cups">
              </div>
              <div class="pdf-suit-details">
                <div class="pdf-suit-header">
                  <span class="pdf-suit-num">2</span>
                  <span class="pdf-suit-name">Cups</span>
                </div>
                <span class="pdf-suit-count">14 Cards</span>
              </div>
            </div>

            <div class="pdf-suit-item">
              <div class="pdf-suit-thumb">
                <img src="/uploads/suit-wands.jpg" alt="Wands">
              </div>
              <div class="pdf-suit-details">
                <div class="pdf-suit-header">
                  <span class="pdf-suit-num">3</span>
                  <span class="pdf-suit-name">Wands</span>
                </div>
                <span class="pdf-suit-count">14 Cards</span>
              </div>
            </div>

            <div class="pdf-suit-item">
              <div class="pdf-suit-thumb">
                <img src="/uploads/suit-swords.jpg" alt="Swords">
              </div>
              <div class="pdf-suit-details">
                <div class="pdf-suit-header">
                  <span class="pdf-suit-num">4</span>
                  <span class="pdf-suit-name">Swords</span>
                </div>
                <span class="pdf-suit-count">14 Cards</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

  overviewPage.innerHTML = `
    <div class="pdf-page-count">Page 2 of ${totalPages}</div>
    <h1 class="pdf-page-title">${escapeHtml(overviewTitle)}</h1>
    ${overviewHtml}
  `;
  root.appendChild(overviewPage);

  // 3. Tarot Card Pages (Page 3 onwards)
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
    const pageNumHtml = `<div class="pdf-page-count">Page ${index + 3} of ${totalPages}</div>`;

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
