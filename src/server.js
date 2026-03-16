require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');

const contactRouter        = require('./routes/contact');
const projectsRouter       = require('./routes/projects');
const certificationsRouter = require('./routes/certifications');
const adminRouter          = require('./routes/admin');
const aboutRouter          = require('./routes/about');
const messagesRouter       = require('./routes/messages');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

const limiter       = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5,
  message: { error: 'Too many contact requests. Try again in an hour.' } });
const loginLimiter  = rateLimit({ windowMs: 15 * 60 * 1000, max: 10,
  message: { error: 'Too many login attempts. Try again later.' } });

app.use(limiter);
app.use(express.json({ limit: '10kb' }));

// Serve uploaded photos statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/contact',        contactLimiter, contactRouter);
app.use('/api/projects',       projectsRouter);
app.use('/api/certifications', certificationsRouter);
app.use('/api/admin',          loginLimiter, adminRouter);
app.use('/api/about',          aboutRouter);
app.use('/api/messages',       messagesRouter);

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
module.exports = app;