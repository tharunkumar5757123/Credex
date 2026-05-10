import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
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
      referralCode, // referral code used by this lead
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

    // ⚠️ DB fallback mode
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        persisted: false,
        message: 'Lead received, but MongoDB is not connected.',
        lead: {
          email: email.toLowerCase().trim(),
          company,
          role,
          teamSize: Number(teamSize || 0),
          auditShareId,
          totalMonthlySavings: Number(totalMonthlySavings || 0),
          highSavings: Number(totalMonthlySavings || 0) > 500,
        },
      });
    }

    // Handle referral tracking
    let referredBy = null;
    let referralCreditsEarned = 0;

    if (referralCode) {
      const referrer = await Lead.findOne({ referralCode });
      if (referrer) {
        referredBy = referralCode;
        // Award credits to referrer (5 credits for each successful referral)
        referralCreditsEarned = 5;
        await Lead.findByIdAndUpdate(referrer._id, {
          $inc: { referralCount: 1, referralCredits: referralCreditsEarned }
        });
      }
    }

    // Generate unique referral code for this lead
    let newReferralCode;
    let attempts = 0;
    do {
      newReferralCode = randomUUID().slice(0, 8).toUpperCase();
      attempts++;
    } while (attempts < 10 && await Lead.findOne({ referralCode: newReferralCode }));

    // 📦 lead object
    const lead = {
      email: email.toLowerCase().trim(),
      company,
      role,
      teamSize: Number(teamSize || 0),
      auditShareId,
      totalMonthlySavings: Number(totalMonthlySavings || 0),
      highSavings: Number(totalMonthlySavings || 0) > 500,
      referralCode: newReferralCode,
      referredBy,
    };

    const savedLead = await Lead.create(lead);

    return res.json({
      success: true,
      persisted: true,
      message: 'Lead saved successfully.',
      lead: {
        ...savedLead.toObject(),
        referralCreditsEarned,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to save lead',
    });
  }
}