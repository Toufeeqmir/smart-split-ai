// Calls the AI service to parse natural language → expense JSON
import axios from 'axios';
export async function parseExpenseText(text) {
  const res = await axios.post(`${process.env.AI_SERVICE_URL}/parse`, { text });
  return res.data; // { amount, description, paidBy, splitAmong }
}
