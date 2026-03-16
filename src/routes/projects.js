const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { readDB, writeDB } = require('../data/store');
const { v4: uuidv4 } = require('uuid');

// Setup uploads folder
const uploadsDir = path.join(__dirname, '../../uploads/projects');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `project-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only image files allowed (jpg, png, webp, gif)'));
  },
});

// ── PUBLIC ────────────────────────────────────────
router.get('/', (req, res) => {
  const db = readDB();
  const { category } = req.query;
  let projects = db.projects || [];
  if (category && category !== 'All') {
    projects = projects.filter(p => p.category === category);
  }
  res.json({ success: true, count: projects.length, data: projects });
});

router.get('/:id', (req, res) => {
  const db = readDB();
  const project = (db.projects || []).find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found.' });
  res.json({ success: true, data: project });
});

// ── ADMIN (protected) ─────────────────────────────
// POST /api/projects — create project
router.post('/', auth, (req, res) => {
  const { title, description, tech, category, liveDemo, source, featured } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }
  const db = readDB();
  const newProject = {
    id: uuidv4(),
    title: title.trim(),
    description: description.trim(),
    tech: Array.isArray(tech) ? tech : (tech ? tech.split(',').map(t => t.trim()) : []),
    category: category || 'Other',
    liveDemo: liveDemo || '',
    source: source || '',
    featured: !!featured,
    image: '',
    createdAt: new Date().toISOString(),
  };
  db.projects = [...(db.projects || []), newProject];
  writeDB(db);
  res.status(201).json({ success: true, data: newProject });
});

// PUT /api/projects/:id — update project
router.put('/:id', auth, (req, res) => {
  const db = readDB();
  const idx = (db.projects || []).findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found.' });

  const { title, description, tech, category, liveDemo, source, featured } = req.body;
  const updated = {
    ...db.projects[idx],
    title: title?.trim() || db.projects[idx].title,
    description: description?.trim() || db.projects[idx].description,
    tech: Array.isArray(tech) ? tech : (tech ? tech.split(',').map(t => t.trim()) : db.projects[idx].tech),
    category: category || db.projects[idx].category,
    liveDemo: liveDemo !== undefined ? liveDemo : db.projects[idx].liveDemo,
    source: source !== undefined ? source : db.projects[idx].source,
    featured: featured !== undefined ? !!featured : db.projects[idx].featured,
    updatedAt: new Date().toISOString(),
  };
  db.projects[idx] = updated;
  writeDB(db);
  res.json({ success: true, data: updated });
});

// POST /api/projects/:id/image — upload project image
router.post('/:id/image', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  const db = readDB();
  const idx = (db.projects || []).findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found.' });

  // Delete old image if exists
  const old = db.projects[idx].image;
  if (old && old.startsWith('/uploads/')) {
    const oldPath = path.join(__dirname, '../../', old);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  const imageUrl = `/uploads/projects/${req.file.filename}`;
  db.projects[idx].image = imageUrl;
  db.projects[idx].updatedAt = new Date().toISOString();
  writeDB(db);

  res.json({ success: true, imageUrl });
});

// DELETE /api/projects/:id/image — remove project image
router.delete('/:id/image', auth, (req, res) => {
  const db = readDB();
  const idx = (db.projects || []).findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Project not found.' });

  const old = db.projects[idx].image;
  if (old && old.startsWith('/uploads/')) {
    const oldPath = path.join(__dirname, '../../', old);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }

  db.projects[idx].image = '';
  db.projects[idx].updatedAt = new Date().toISOString();
  writeDB(db);
  res.json({ success: true, message: 'Image removed.' });
});

// DELETE /api/projects/:id
router.delete('/:id', auth, (req, res) => {
  const db = readDB();
  const before = (db.projects || []).length;
  // Also delete image file
  const project = (db.projects || []).find(p => p.id === req.params.id);
  if (project?.image && project.image.startsWith('/uploads/')) {
    const imgPath = path.join(__dirname, '../../', project.image);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }
  db.projects = (db.projects || []).filter(p => p.id !== req.params.id);
  if (db.projects.length === before) {
    return res.status(404).json({ error: 'Project not found.' });
  }
  writeDB(db);
  res.json({ success: true, message: 'Project deleted.' });
});

// Error handler for multer
router.use((err, req, res, next) => {
  if (err.message) return res.status(400).json({ error: err.message });
  next(err);
});

module.exports = router;