export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const KEY = process.env.NEWS_API_KEY;
  try {
    const r = await fetch(`https://newsapi.org/v2/everything?q=Corinthians+futebol&language=pt&sortBy=publishedAt&pageSize=30&apiKey=${KEY}`);
    const d = await r.json();
    const articles = (d.articles || [])
      .filter(a => a.title && !a.title.includes('[Removed]'))
      .map(a => ({
        title: a.title,
        url: a.url,
        source: a.source?.name || 'Notícia',
        time: new Date(a.publishedAt).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
      }));
    res.json(articles);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
