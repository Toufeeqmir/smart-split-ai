import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { errorHandler } from './middlewares/errorMiddleware.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth',     authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/chat',     chatRoutes);
app.use('/api/ai',       aiRoutes);

app.use(errorHandler);
export default app;
