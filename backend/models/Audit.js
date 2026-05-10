import mongoose from 'mongoose';

/**
 * TOOL INPUT (frontend user input)
 */
const ToolInputSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    plan: { type: String, required: true },
    seats: { type: Number, default: 0 },
    monthlySpend: { type: Number, default: 0 },
  },
  { _id: false }
);

/**
 * CONFIDENCE SUB-SCHEMA
 */
const ConfidenceSchema = new mongoose.Schema(
  {
    level: String,
    score: Number,
    label: String,
    rationale: String,
    components: mongoose.Schema.Types.Mixed,
  },
  { _id: false }
);

/**
 * AUDIT RESULT (per tool analysis)
 */
const AuditResultSchema = new mongoose.Schema(
  {
    toolId: { type: String, required: true },
    toolType: String,

    currentSpend: Number,
    reportedSpend: Number,
    benchmarkSpend: Number,
    benchmarkAvailable: Boolean,
    expectedRetail: Number,
    recommendedSpend: Number,

    recommendation: String,
    potentialSavings: Number,

    reason: String,
    source: String,
    calculation: String,

    confidence: ConfidenceSchema,

    savingsRatio: Number,
    isHighlySuspect: Boolean,
    needsVerification: Boolean,
    riskLabel: String,

    confidenceReasons: [String],

    currentPlan: mongoose.Schema.Types.Mixed,
    benchmarkPlan: mongoose.Schema.Types.Mixed,
    targetPlan: mongoose.Schema.Types.Mixed,

    action: String,
  },
  { _id: false }
);

/**
 * MAIN AUDIT SCHEMA
 */
const AuditSchema = new mongoose.Schema(
  {
    shareId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    input: {
      teamSize: { type: Number, required: true },
      primaryUseCase: { type: String, required: true },
      tools: [ToolInputSchema],
    },

    audit: {
      totalMonthlySavings: { type: Number, default: 0 },
      totalAnnualSavings: { type: Number, default: 0 },
      summary: { type: String, default: '' },

      aiExplanation: {
        narrative: String,
        provider: String,
        model: String,
        status: String,
        note: String,
      },

      results: [AuditResultSchema],
    },
  },
  { timestamps: true }
);

/**
 * SAFE MODEL EXPORT (prevents overwrite in dev hot reload)
 */
export default mongoose.models.Audit ||
  mongoose.model('Audit', AuditSchema);