import mongoose from 'mongoose';
const ExpenseSchema = new mongoose.Schema({
  groupId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  description: { type: String, required: true },
  amount:      { type: Number, required: true },
  paidBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  splitAmong:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  date:        { type: Date, default: Date.now },
  settled:     { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.model('Expense', ExpenseSchema);
