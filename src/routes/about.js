const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { readDB, writeDB } = require('../data/store');

// Store uploaded photos in /uploads folder
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only image files are allowed (jpg, png, webp, gif)'));
  },
});

// ── PUBLIC ────────────────────────────────────────
// GET /api/about
router.get('/', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.about || {} });
});

// ── ADMIN (protected) ─────────────────────────────
// PUT /api/about  — update all text fields
router.put('/', auth, (req, res) => {
  const db = readDB();
  const current = db.about || {};

  // Merge incoming fields (never overwrite photo from this route)
  const {
    name, subtitle, bio, email, location, github, linkedin,
    resumeUrl, available, education, educationSub, focusArea, focusSub,
    journey, philosophy, philosophyQuote, milestones, hobbies, skills,
  } = req.body;

  db.about = {
    ...current,
    ...(name !== undefined            && { name }),
    ...(subtitle !== undefined        && { subtitle }),
    ...(bio !== undefined             && { bio }),
    ...(email !== undefined           && { email }),
    ...(location !== undefined        && { location }),
    ...(github !== undefined          && { github }),
    ...(linkedin !== undefined        && { linkedin }),
    ...(resumeUrl !== undefined       && { resumeUrl }),
    ...(available !== undefined       && { available: !!available }),
    ...(education !== undefined       && { education }),
    ...(educationSub !== undefined    && { educationSub }),
    ...(focusArea !== undefined       && { focusArea }),
    ...(focusSub !== undefined        && { focusSub }),
    ...(journey !== undefined         && { journey }),
    ...(philosophy !== undefined      && { philosophy }),
    ...(philosophyQuote !== undefined && { philosophyQuote }),
    ...(milestones !== undefined      && { milestones }),
    ...(hobbies !== undefined         && { hobbies }),
    ...(skills !== undefined          && { skills }),
    updatedAt: new Date().toISOString(),
  };

  writeDB(db);
  res.json({ success: true, data: db.about });
});

// POST /api/about/photo — upload profile photo
router.post('/photo', auth, upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const db = readDB();
  const photoUrl = `/uploads/${req.file.filename}`;
  db.about = { ...(db.about || {}), photo: photoUrl };
  writeDB(db);

  res.json({ success: true, photoUrl });
});

// DELETE /api/about/photo — remove profile photo
router.delete('/photo', auth, (req, res) => {
  const db = readDB();
  const old = db.about?.photo;

  if (old) {
    const filePath = path.join(__dirname, '../../', old);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }

  db.about = { ...(db.about || {}), photo: '' };
  writeDB(db);
  res.json({ success: true, message: 'Photo removed.' });
});

// Error handler for multer
router.use((err, req, res, next) => {
  if (err.message) return res.status(400).json({ error: err.message });
  next(err);
});

module.exports = router;
