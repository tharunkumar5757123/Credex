import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import Audit from '../models/Audit.js';
// import { runAudit } from '../../frontend/src/utils/auditEngine.js';
// import { pricingData } from '../../frontend/src/utils/pricingData.js';
import { generateAuditExplanation } from '../services/hfService.js';

export async function getAudit(req, res) {
  try {
    const { input, audit: clientAudit } = req.body;

    if (!input || !Array.isArray(input.tools)) {
      return res.status(400).json({
        error: 'Missing or invalid input payload.',
      });
    }

    const audit = clientAudit || runAudit(input, pricingData);

    const aiExplanation = await generateAuditExplanation(input, audit);

    const enrichedAudit = {
      ...audit,
      aiExplanation,
    };

    const shareId = randomUUID().slice(0, 8);

    // If DB not connected → still return computed audit
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        audit: {
          shareId,
          input,
          audit: enrichedAudit,
        },
        persisted: false,
      });
    }

    const savedAudit = await Audit.create({
      shareId,
      input,
      audit: enrichedAudit,
    });

    return res.json({
      audit: savedAudit,
      persisted: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Failed to generate audit',
    });
  }
}

export async function explainAudit(req, res) {
  try {
    const { input, audit: clientAudit } = req.body;

    if (!input || !clientAudit) {
      return res.status(400).json({
        error: 'Missing input or audit payload.',
      });
    }

    const aiExplanation = await generateAuditExplanation(input, clientAudit);

    return res.json({ aiExplanation });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Failed to generate explanation',
    });
  }
}

export async function getSharedAudit(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'MongoDB is not connected.',
      });
    }

    const audit = await Audit.findOne({
      shareId: req.params.shareId,
    }).lean();

    if (!audit) {
      return res.status(404).json({
        error: 'Audit not found.',
      });
    }

    return res.json({
      shareId: audit.shareId,
      audit: audit.audit,
      input: {
        teamSize: audit.input.teamSize,
        primaryUseCase: audit.input.primaryUseCase,
        tools: audit.input.tools,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Failed to fetch shared audit',
    });
  }
}