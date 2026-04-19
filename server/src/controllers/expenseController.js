import Expense from "../models/Expense.js";
import { calculateBalances } from "../utils/calculateBalances.js";
import { simpleBalances } from "../utils/simplifyBalances.js";

const normalizeMembers = (paidBy, splitAmong = []) => {
  const normalized = [...new Set([paidBy, ...splitAmong])]
    .map((member) => member?.trim())
    .filter(Boolean);

  return normalized;
};

const canManageExpense = (expense, username) =>
  expense.createdBy === username || expense.paidBy === username;

const validateExpensePayload = ({ description, amount, paidBy, splitAmong }) => {
  if (!description?.trim() || amount === undefined || amount === null || !paidBy?.trim()) {
    return "Description, amount, and paidBy are required";
  }

  if (Number(amount) <= 0) {
    return "Amount must be greater than 0";
  }

  if (!Array.isArray(splitAmong) || splitAmong.length === 0) {
    return "Select at least one member to split the bill with";
  }

  return null;
};

export const addExpense = async (req, res) => {
  try {
    const { description, amount, paidBy } = req.body;
    const splitAmong = normalizeMembers(req.body.paidBy, req.body.splitAmong);
    const validationError = validateExpensePayload({
      description,
      amount,
      paidBy,
      splitAmong,
    });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const expense = new Expense({
      description: description.trim(),
      amount: Number(amount),
      paidBy: paidBy.trim(),
      createdBy: req.user.username,
      splitAmong,
      settled: Boolean(req.body.settled),
    });

    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({
      $or: [
        { createdBy: req.user.username },
        { paidBy: req.user.username },
        { splitAmong: req.user.username },
      ],
    }).sort({ createdAt: -1 });

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    if (!canManageExpense(expense, req.user.username)) {
      return res.status(403).json({ error: "You cannot edit this expense" });
    }

    const nextPaidBy = req.body.paidBy ?? expense.paidBy;
    const nextSplitAmong = normalizeMembers(
      nextPaidBy,
      req.body.splitAmong ?? expense.splitAmong
    );
    const nextDescription = req.body.description ?? expense.description;
    const nextAmount = req.body.amount ?? expense.amount;
    const validationError = validateExpensePayload({
      description: nextDescription,
      amount: nextAmount,
      paidBy: nextPaidBy,
      splitAmong: nextSplitAmong,
    });

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    expense.description = nextDescription.trim();
    expense.amount = Number(nextAmount);
    expense.paidBy = nextPaidBy.trim();
    expense.splitAmong = nextSplitAmong;

    if (typeof req.body.settled === "boolean") {
      expense.settled = req.body.settled;
    }

    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    if (!canManageExpense(expense, req.user.username)) {
      return res.status(403).json({ error: "You cannot delete this expense" });
    }

    await expense.deleteOne();

    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBalances = async (req, res) => {
  try {
    const expenses = await Expense.find({
      $or: [
        { createdBy: req.user.username },
        { paidBy: req.user.username },
        { splitAmong: req.user.username },
      ],
    });

    const balances = calculateBalances(expenses);
    const simplifiedBalances = simpleBalances(balances);

    res.json({
      balances,
      simplifiedBalances,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
