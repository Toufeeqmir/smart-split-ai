import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: false },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paidBy: {
      type: String, 
      required: true,
    },
    createdBy: {
      type: String,
      required: false,
    },
    splitAmong: [{ type: String }],
    date: {
      type: Date,
      default: Date.now,
    },
    settled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Expense", ExpenseSchema);
