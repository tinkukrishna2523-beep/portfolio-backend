const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../controllers/contactController');

// Input validation middleware
const validateContact = (req, res, next) => {
  const { name, email, subject, message } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters.' });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
    return res.status(400).json({ error: 'Subject must be at least 3 characters.' });
  }
  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return res.status(400).json({ error: 'Message must be at least 10 characters.' });
  }

  req.body.name = name.trim().substring(0, 100);
  req.body.email = email.trim().substring(0, 200);
  req.body.subject = subject.trim().substring(0, 200);
  req.body.message = message.trim().substring(0, 2000);

  next();
};

router.post('/', validateContact, sendContactEmail);

module.exports = router;
