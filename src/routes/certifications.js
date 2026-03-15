const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { readDB, writeDB } = require('../data/store');
const { v4: uuidv4 } = require('uuid');

// ── PUBLIC ────────────────────────────────────────
router.get('/', (req, res) => {
  const db = readDB();
  res.json({ success: true, data: db.certifications || [] });
});

// ── ADMIN (protected) ─────────────────────────────
router.post('/', auth, (req, res) => {
  const { title, org, date, credentialUrl } = req.body;
  if (!title || !org) {
    return res.status(400).json({ error: 'Title and organization are required.' });
  }
  const db = readDB();
  const newCert = {
    id: uuidv4(),
    title: title.trim(),
    org: org.trim(),
    date: date || '',
    credentialUrl: credentialUrl || '',
    createdAt: new Date().toISOString(),
  };
  db.certifications = [...(db.certifications || []), newCert];
  writeDB(db);
  res.status(201).json({ success: true, data: newCert });
});

router.put('/:id', auth, (req, res) => {
  const db = readDB();
  const idx = (db.certifications || []).findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Certification not found.' });

  const { title, org, date, credentialUrl } = req.body;
  const updated = {
    ...db.certifications[idx],
    title: title?.trim() || db.certifications[idx].title,
    org: org?.trim() || db.certifications[idx].org,
    date: date !== undefined ? date : db.certifications[idx].date,
    credentialUrl: credentialUrl !== undefined ? credentialUrl : db.certifications[idx].credentialUrl,
    updatedAt: new Date().toISOString(),
  };
  db.certifications[idx] = updated;
  writeDB(db);
  res.json({ success: true, data: updated });
});

router.delete('/:id', auth, (req, res) => {
  const db = readDB();
  const before = (db.certifications || []).length;
  db.certifications = (db.certifications || []).filter(c => c.id !== req.params.id);
  if (db.certifications.length === before) {
    return res.status(404).json({ error: 'Certification not found.' });
  }
  writeDB(db);
  res.json({ success: true, message: 'Certification deleted.' });
});

module.exports = router;
