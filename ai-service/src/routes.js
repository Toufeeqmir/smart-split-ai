import express from 'express';
import { parseExpense } from './controller.js';

const router = express.Router();
router.post('/parse', parseExpense);
export default router;
