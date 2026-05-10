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
  },
  { timestamps: true }
);

/**
 * SAFE EXPORT (prevents model overwrite in dev hot reload)
 */
export default mongoose.models.Lead ||
  mongoose.model('Lead', LeadSchema);