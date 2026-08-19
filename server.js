import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Setup directories
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'cards.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' })); // Support larger base64 payloads if importing legacy items
app.use(express.urlencoded({ extended: true }));

// Serve static uploads and cards
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/Cards', express.static(path.join(__dirname, 'Cards')));
app.use('/Cards', express.static(path.join(__dirname, 'public', 'Cards')));

// Setup Multer for image file uploads
const imageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `card-image-${uniqueSuffix}${ext}`);
  }
});

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Setup Multer for JSON database restore uploads
const jsonStorage = multer.memoryStorage();
const uploadJson = multer({
  storage: jsonStorage,
  fileFilter: function (req, file, cb) {
    if (!file.originalname.endsWith('.json') && file.mimetype !== 'application/json') {
      return cb(new Error('Only JSON files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Helpers
const migrateCard = (card) => {
  if (card.description_en !== undefined) {
    return card;
  }
  
  // If card was in the previous layout (en/gu structure), convert it back to flat
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

  // If card was in flat layout
  const migrated = { ...card };
  migrated.description_en = card.description || '';
  migrated.description_gu = '';
  delete migrated.description;
  return migrated;
};

const readDatabase = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    const cards = data ? JSON.parse(data) : [];
    
    let needsWrite = false;
    const migratedCards = cards.map(c => {
      if (c.description_en === undefined) {
        needsWrite = true;
        return migrateCard(c);
      }
      return c;
    });

    if (needsWrite && migratedCards.length > 0) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(migratedCards, null, 2), 'utf8');
    }

    return migratedCards;
  } catch (err) {
    console.error('Database read failed:', err);
    return [];
  }
};

const writeDatabase = (cards) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(cards, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Database write failed:', err);
    return false;
  }
};

// API Endpoints

// 1. Get all cards
app.get('/api/cards', (req, res) => {
  const cards = readDatabase();
  res.json(cards);
});

// 2. Upsert a card
app.post('/api/cards', (req, res) => {
  const newCard = req.body;
  if (!newCard || !newCard.id) {
    return res.status(400).json({ error: 'Invalid card payload.' });
  }

  const cards = readDatabase();
  const index = cards.findIndex(c => c.id === newCard.id);

  if (index >= 0) {
    // If the old card image path is changed, delete the old file
    const oldCard = cards[index];
    if (oldCard.image && oldCard.image !== newCard.image && oldCard.image.startsWith('/uploads/')) {
      const oldFilePath = path.join(__dirname, 'public', oldCard.image);
      if (fs.existsSync(oldFilePath)) {
        fs.unlink(oldFilePath, err => {
          if (err) console.error('Failed to clean up old image:', err);
        });
      }
    }
    cards[index] = newCard;
  } else {
    cards.push(newCard);
  }

  if (writeDatabase(cards)) {
    res.json(newCard);
  } else {
    res.status(500).json({ error: 'Failed to write card to server database.' });
  }
});

// 3. Delete a card
app.delete('/api/cards/:id', (req, res) => {
  const { id } = req.params;
  const cards = readDatabase();
  const index = cards.findIndex(c => c.id === id);

  if (index < 0) {
    return res.status(404).json({ error: 'Card not found.' });
  }

  const cardToDelete = cards[index];
  
  // Clean up associated image file if stored locally on server
  if (cardToDelete.image && cardToDelete.image.startsWith('/uploads/')) {
    const filePath = path.join(__dirname, 'public', cardToDelete.image);
    if (fs.existsSync(filePath)) {
      fs.unlink(filePath, err => {
        if (err) console.error('Failed to delete image file on card deletion:', err);
      });
    }
  }

  const updatedCards = cards.filter(c => c.id !== id);
  if (writeDatabase(updatedCards)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: 'Failed to delete card.' });
  }
});

// 4. File upload endpoint
app.post('/api/upload', uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }
  const relativeUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl: relativeUrl });
});

// 5. Database backup endpoint
app.get('/api/backup', (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.status(404).json({ error: 'No cards database found to backup.' });
  }
  res.download(DATA_FILE, 'tarot-codex-backup.json', (err) => {
    if (err) {
      console.error('Backup download failed:', err);
      if (!res.headersSent) {
        res.status(500).send('Backup download failed');
      }
    }
  });
});

// 6. Database restore endpoint
app.post('/api/restore', uploadJson.single('backupFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No backup file provided.' });
  }

  try {
    const rawContent = req.file.buffer.toString('utf8');
    const parsedData = JSON.parse(rawContent);

    if (!Array.isArray(parsedData)) {
      return res.status(400).json({ error: 'Backup content must be a JSON array of cards.' });
    }

    if (writeDatabase(parsedData)) {
      res.json({ success: true, count: parsedData.length });
    } else {
      res.status(500).json({ error: 'Failed to overwrite database with backup.' });
    }
  } catch (err) {
    console.error('Restore parser failure:', err);
    res.status(400).json({ error: 'Invalid backup file content.' });
  }
});

// 7. Bulk update endpoint
app.post('/api/cards/bulk-update', (req, res) => {
  const { ids, field, value } = req.body;
  if (!Array.isArray(ids) || !field) {
    return res.status(400).json({ error: 'Invalid payload. Expects ids (array) and field (string).' });
  }

  const cards = readDatabase();
  let updatedCount = 0;

  const updatedCards = cards.map(c => {
    if (ids.includes(c.id)) {
      updatedCount++;
      return {
        ...c,
        [field]: value
      };
    }
    return c;
  });

  if (writeDatabase(updatedCards)) {
    res.json({ success: true, count: updatedCount });
  } else {
    res.status(500).json({ error: 'Failed to apply bulk update to database.' });
  }
});

// Startup Server
app.listen(PORT, () => {
  console.log(`Tarot Codex Backend listening on http://localhost:${PORT}`);
});
