export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { messages } = req.body;
  const KEY = process.env.ANTHROPIC_KEY;
  
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: 'Você é o assistente do Corinthians de Wanderson. Responda em português, seja entusiasta. Use emojis ⚽🖤🤍.',
        messages
      })
    });
    const d = await r.json();
    res.json({ reply: d.content?.[0]?.text || 'Erro.' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
