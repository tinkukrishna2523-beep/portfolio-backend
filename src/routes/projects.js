const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { readDB, writeDB } = require('../data/store');
const { v4: uuidv4 } = require('uuid');

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
    createdAt: new Date().toISOString(),
  };
  db.projects = [...(db.projects || []), newProject];
  writeDB(db);
  res.status(201).json({ success: true, data: newProject });
});

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

router.delete('/:id', auth, (req, res) => {
  const db = readDB();
  const before = (db.projects || []).length;
  db.projects = (db.projects || []).filter(p => p.id !== req.params.id);
  if (db.projects.length === before) {
    return res.status(404).json({ error: 'Project not found.' });
  }
  writeDB(db);
  res.json({ success: true, message: 'Project deleted.' });
});

module.exports = router;
