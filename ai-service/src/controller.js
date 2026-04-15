import { parseExpenseText } from './services/parserService.js';

export async function parseExpense(req, res) {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'text is required' });
    const expense = await parseExpenseText(text);
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
