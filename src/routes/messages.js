const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { readDB, writeDB } = require('../data/store');

// GET /api/messages — admin only, get all messages
router.get('/', auth, (req, res) => {
  const db = readDB();
  const messages = (db.messages || []).sort(
    (a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)
  );
  res.json({ success: true, count: messages.length, unread: messages.filter(m => !m.read).length, data: messages });
});

// PATCH /api/messages/:id/read — mark as read
router.patch('/:id/read', auth, (req, res) => {
  const db = readDB();
  const idx = (db.messages || []).findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Message not found.' });
  db.messages[idx].read = true;
  writeDB(db);
  res.json({ success: true });
});

// PATCH /api/messages/read-all — mark all as read
router.patch('/read-all', auth, (req, res) => {
  const db = readDB();
  db.messages = (db.messages || []).map(m => ({ ...m, read: true }));
  writeDB(db);
  res.json({ success: true });
});

// DELETE /api/messages/:id
router.delete('/:id', auth, (req, res) => {
  const db = readDB();
  const before = (db.messages || []).length;
  db.messages = (db.messages || []).filter(m => m.id !== req.params.id);
  if (db.messages.length === before) return res.status(404).json({ error: 'Message not found.' });
  writeDB(db);
  res.json({ success: true, message: 'Message deleted.' });
});

module.exports = router;
