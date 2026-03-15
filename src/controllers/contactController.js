const nodemailer = require('nodemailer');
const { readDB, writeDB } = require('../data/store');
const { v4: uuidv4 } = require('uuid');

const sendContactEmail = async (req, res) => {
  const { name, email, subject, message } = req.body;

  // ── 1. ALWAYS save message to db.json first ────────────────
  try {
    const db = readDB();
    const newMessage = {
      id: uuidv4(),
      name, email, subject, message,
      read: false,
      receivedAt: new Date().toISOString(),
    };
    db.messages = [newMessage, ...(db.messages || [])];
    writeDB(db);
  } catch (saveError) {
    console.error('Failed to save message to DB:', saveError);
    // Don't block the response — still try email
  }

  // ── 2. Try sending email ONLY if SMTP is configured ────────
  const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;

  if (smtpConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
        to: process.env.OWNER_EMAIL || process.env.SMTP_USER,
        subject: `[Portfolio] ${subject}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#0066FF;padding:20px;border-radius:8px 8px 0 0;">
              <h1 style="color:white;margin:0;font-size:22px;">New Portfolio Message</h1>
            </div>
            <div style="background:#f9f9f9;padding:28px;border-radius:0 0 8px 8px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="padding:6px 0;font-weight:bold;color:#555;width:80px;">From:</td><td style="color:#333;">${name}</td></tr>
                <tr><td style="padding:6px 0;font-weight:bold;color:#555;">Email:</td><td style="color:#333;"><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td style="padding:6px 0;font-weight:bold;color:#555;">Subject:</td><td style="color:#333;">${subject}</td></tr>
              </table>
              <hr style="margin:18px 0;border:1px solid #e0e0e0;"/>
              <h3 style="color:#333;margin-top:0;">Message:</h3>
              <p style="color:#555;line-height:1.7;white-space:pre-wrap;">${message}</p>
            </div>
          </div>`,
      });

      // Auto-reply to sender
      await transporter.sendMail({
        from: `"Tinku Krishna AR" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Thanks for reaching out, ${name}!`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:#0066FF;padding:20px;border-radius:8px 8px 0 0;">
              <h1 style="color:white;margin:0;font-size:22px;">Message Received! ✅</h1>
            </div>
            <div style="background:#f9f9f9;padding:28px;border-radius:0 0 8px 8px;">
              <p style="color:#333;">Hi <strong>${name}</strong>,</p>
              <p style="color:#555;line-height:1.6;">
                Thank you for reaching out! I've received your message about <strong>"${subject}"</strong>
                and will get back to you within 24–48 hours.
              </p>
              <p style="color:#888;font-size:14px;">— Tinku Krishna AR</p>
            </div>
          </div>`,
      });

    } catch (emailError) {
      console.error('Email send failed (message still saved):', emailError.message);
      // Message is already saved to DB — don't fail the whole request
    }
  }

  // ── 3. Always return success (message is saved) ─────────────
  res.status(200).json({
    success: true,
    message: "Your message has been sent! I'll get back to you soon.",
  });
};

module.exports = { sendContactEmail };
