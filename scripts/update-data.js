const fs = require('fs');
const https = require('https');
const http = require('http');

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, { headers: options.headers || {}, timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => ({
        ok: res.statusCode < 400,
        json: () => JSON.parse(data),
        text: () => data
      }));
      res.on('end', () => resolve({ ok: res.statusCode < 400, json: () => JSON.parse(data), text: () => data }));
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.end();
  });
}

function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/))?.[1]?.trim() || '';
    const link = (item.match(/<link>(.*?)<\/link>/) || [])[1]?.trim() || '';
    const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1]?.trim() || '';
    if (title && link && title.toLowerCase().includes('corinthians')) {
      items.push({ title, url: link, pubDate });
    }
  }
  return items;
}

function fmtDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} · ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  } catch { return ''; }
}

async function main() {
  console.log('Iniciando atualizacao...');

  const RSS_FEEDS = [
    { url: 'https://www.meutimao.com.br/feed/', source: 'Meu Timao', color: '#1a7a3a' },
    { url: 'https://www.tudotimao.com.br/feed/', source: 'Tudo Timao', color: '#c8a84b' },
    { url: 'https://www.gazetaesportiva.com/times/corinthians/feed/', source: 'Gazeta Esportiva', color: '#E5820A' },
    { url: 'https://www.lance.com.br/corinthians/feed/', source: 'Lance!', color: '#FF6B00' },
    { url: 'https://br.bolavip.com/rss/feed/category/corinthians', source: 'Bolavip', color: '#0055A5' },
    { url: 'https://jovempan.com.br/tag/corinthians/feed/', source: 'Jovem Pan', color: '#cc0000' },
    { url: 'https://ge.globo.com/futebol/times/corinthians/rss2.xml', source: 'ge.Globo', color: '#e8000d' },
    { url: 'https://esporte.uol.com.br/futebol/campeonatos/brasileiro/rss.xml', source: 'UOL Esporte', color: '#7B1FA2' },
  ];

  let allNews = [];
  for (const feed of RSS_FEEDS) {
    try {
      const r = await fetchUrl(feed.url);
      const xml = await r.text();
      const items = parseRSS(xml).slice(0, 8);
      items.forEach(item => allNews.push({
        source: feed.source, color: feed.color,
        title: item.title, url: item.url,
        time: fmtDate(item.pubDate), pubDate: item.pubDate
      }));
      console.log(`OK ${feed.source}: ${items.length} noticias`);
    } catch(e) { console.log(`ERRO ${feed.source}: ${e.message}`); }
  }

  allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  allNews = allNews.slice(0, 30);

  const KEY = process.env.RAPIDAPI_KEY;
  const HDRS = { "X-RapidAPI-Key": KEY, "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com" };
  const BASE = "https://api-football-v1.p.rapidapi.com/v3";
  const TEAM = 131;

  let upcoming = [], results = [], standings = [];

  try {
    const r = await fetchUrl(`${BASE}/fixtures?team=${TEAM}&next=10`, { headers: HDRS });
    const d = r.json();
    upcoming = (d.response || []).map(f => ({
      id: f.fixture.id, date: f.fixture.date,
      status: f.fixture.status?.short || 'NS',
      home: f.teams.home.name, homeId: f.teams.home.id,
      away: f.teams.away.name, awayId: f.teams.away.id,
      comp: f.league.name, round: f.league.round,
      venue: f.fixture.venue?.name || ''
    }));
    console.log(`OK Proximos: ${upcoming.length}`);
  } catch(e) { console.log(`ERRO Proximos: ${e.message}`); }

  try {
    const r = await fetchUrl(`${BASE}/fixtures?team=${TEAM}&last=10`, { headers: HDRS });
    const d = r.json();
    results = (d.response || []).reverse().map(f => ({
      id: f.fixture.id, date: f.fixture.date, status: 'FT',
      home: f.teams.home.name, homeId: f.teams.home.id,
      away: f.teams.away.name, awayId: f.teams.away.id,
      homeScore: f.goals.home, awayScore: f.goals.away,
      comp: f.league.name, round: f.league.round,
      venue: f.fixture.venue?.name || ''
    }));
    console.log(`OK Resultados: ${results.length}`);
  } catch(e) { console.log(`ERRO Resultados: ${e.message}`); }

  try {
    const r = await fetchUrl(`${BASE}/standings?league=71&season=2026`, { headers: HDRS });
    const d = r.json();
    standings = (d.response?.[0]?.league?.standings?.[0] || []).map(t => ({
      pos: t.rank, name: t.team.name, teamId: t.team.id,
      pts: t.points, j: t.all.played,
      v: t.all.win, e: t.all.draw, d: t.all.lose,
      gp: t.all.goals.for, gc: t.all.goals.against, sg: t.goalsDiff
    }));
    console.log(`OK Tabela: ${standings.length}`);
  } catch(e) { console.log(`ERRO Tabela: ${e.message}`); }

  // Buscar momentos/videos do Meu Timao RSS
  let highlights = [];
  try {
    const r = await fetchUrl('https://www.meutimao.com.br/feed/');
    const xml = await r.text();
    const allItems = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];
      const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/))?.[1]?.trim() || '';
      const link = (item.match(/<link>(.*?)<\/link>/) || [])[1]?.trim() || '';
      const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1]?.trim() || '';
      const isVideo = title.toLowerCase().match(/video|vídeo|momento|melhores|gol|assistir|assista/);
      if (title && link && isVideo) {
        allItems.push({ title, url: link, pubDate, date: fmtDate(pubDate) });
      }
    }
    highlights = allItems.slice(0, 8);
    console.log(`OK Momentos: ${highlights.length}`);
  } catch(e) { console.log(`ERRO Momentos: ${e.message}`); }

  const data = { updatedAt: new Date().toISOString(), news: allNews, upcoming, results, standings, highlights };

  fs.writeFileSync('src/data.js', `// Gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
const LIVE_DATA = ${JSON.stringify(data, null, 2)};
export default LIVE_DATA;
`);

  console.log('data.js atualizado!');
  console.log(`Noticias: ${allNews.length}, Proximos: ${upcoming.length}, Resultados: ${results.length}, Tabela: ${standings.length}, Momentos: ${highlights.length}`);
}

main().catch(console.error);
