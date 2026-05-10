import express from 'express';
import { explainAudit, getAudit, getSharedAudit } from '../controllers/auditController.js';

const router = express.Router();
router.post('/', getAudit);
router.post('/explain', explainAudit);
router.get('/:shareId', getSharedAudit);

export default router;
