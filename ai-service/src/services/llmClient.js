// LLM API wrapper — swap between OpenAI / Anthropic here
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openai'; // 'openai' | 'anthropic'

export async function callLLM({ systemPrompt, userMessage }) {
  if (LLM_PROVIDER === 'openai') {
    const { default: OpenAI } = await import('openai');
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });
    return res.choices[0].message.content;
  }
  throw new Error(`Unsupported LLM_PROVIDER: ${LLM_PROVIDER}`);
}
