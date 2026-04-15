// Parse LLM output and validate it's a clean expense object
import { callLLM } from './llmClient.js';
import { parseExpensePrompt } from '../prompts/parseExpensePrompt.js';

export async function parseExpenseText(text) {
  const raw = await callLLM({ systemPrompt: parseExpensePrompt, userMessage: text });
  try {
    const cleaned = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned invalid JSON');
  }
}
