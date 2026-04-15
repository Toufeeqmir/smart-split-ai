import mongoose from 'mongoose';
const MessageSchema = new mongoose.Schema({
  groupId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  senderId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text:             { type: String },
  type:             { type: String, enum: ['text', 'ai', 'expense'], default: 'text' },
  relatedExpenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' },
}, { timestamps: true });
export default mongoose.model('Message', MessageSchema);
