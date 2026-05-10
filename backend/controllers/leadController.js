import mongoose from 'mongoose';
import Lead from '../models/Lead.js';

const rateLimit = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5;

export async function saveLead(req, res) {
  try {
    const {
      email,
      company,
      role,
      teamSize,
      auditShareId,
      totalMonthlySavings = 0,
      website,
    } = req.body;

    // 🚨 simple bot/spam trap
    if (website) {
      return res.status(400).json({ error: 'Spam check failed.' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // 🧠 rate limiting (per IP)
    const ip =
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      'unknown';

    const now = Date.now();

    const recentHits = (rateLimit.get(ip) || []).filter(
      (t) => now - t < WINDOW_MS
    );

    if (recentHits.length >= MAX_REQUESTS) {
      return res.status(429).json({
        error: 'Too many submissions. Try again in a minute.',
      });
    }

    rateLimit.set(ip, [...recentHits, now]);

    // 📦 lead object
    const lead = {
      email: email.toLowerCase().trim(),
      company,
      role,
      teamSize: Number(teamSize || 0),
      auditShareId,
      totalMonthlySavings: Number(totalMonthlySavings || 0),
      highSavings: Number(totalMonthlySavings || 0) > 500,
    };

    // ⚠️ DB fallback mode
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        persisted: false,
        message: 'Lead received, but MongoDB is not connected.',
        lead,
      });
    }

    const savedLead = await Lead.create(lead);

    return res.json({
      success: true,
      persisted: true,
      message: 'Lead saved successfully.',
      lead: savedLead,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to save lead',
    });
  }
}