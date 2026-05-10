import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    company: {
      type: String,
      trim: true,
      default: '',
    },

    role: {
      type: String,
      trim: true,
      default: '',
    },

    teamSize: {
      type: Number,
      default: 1,
    },

    auditShareId: {
      type: String,
      index: true,
      default: null,
    },

    totalMonthlySavings: {
      type: Number,
      default: 0,
    },

    highSavings: {
      type: Boolean,
      default: false,
    },

    // Referral system
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    referredBy: {
      type: String, // referral code of the referrer
      index: true,
      default: null,
    },

    referralCount: {
      type: Number,
      default: 0,
    },

    referralCredits: {
      type: Number,
      default: 0, // credits earned from referrals
    },
  },
  { timestamps: true }
);

/**
 * SAFE EXPORT (prevents model overwrite in dev hot reload)
 */
export default mongoose.models.Lead ||
  mongoose.model('Lead', LeadSchema);