const fs = require('fs');
const https = require('https');
const http = require('http');

// ── Fetch helper ────────────────────────────────────────
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, { headers: options.headers || {} }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ ok: res.statusCode < 400, json: () => JSON.parse(data), text: () => data }));
    });
    req.on('error', reject);
    req.end();
  });
}

// ── RSS Parser ──────────────────────────────────────────
function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/))?.[1]?.trim() || '';
    const link = (item.match(/<link>(.*?)<\/link>/) || [])[1]?.trim() || '';
    const pubDate = (item.match(/<pubDate>(.*?)<\/pubDate>/) || [])[1]?.trim() || '';
    if (title && link) items.push({ title, url: link, pubDate });
  }
  return items;
}

// ── Formatar data ────────────────────────────────────────
function fmtDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} · ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  } catch { return ''; }
}

async function main() {
  console.log('Iniciando atualização de dados...');

  // ── 1. Notícias via RSS (gratuito, tempo real) ──────
  const RSS_FEEDS = [
    { url: 'https://www.meutimao.com.br/feed/', source: 'Meu Timão', color: '#1a7a3a' },
    { url: 'https://www.tudotimao.com.br/feed/', source: 'Tudo Timão', color: '#c8a84b' },
    { url: 'https://www.gazetaesportiva.com/times/corinthians/feed/', source: 'Gazeta Esportiva', color: '#E5820A' },
    { url: 'https://www.lance.com.br/corinthians/feed/', source: 'Lance!', color: '#FF6B00' },
    { url: 'https://br.bolavip.com/rss/feed/category/corinthians', source: 'Bolavip', color: '#0055A5' },
    { url: 'https://jovempan.com.br/tag/corinthians/feed/', source: 'Jovem Pan', color: '#cc0000' },
    { url: 'https://placar.com.br/feed/', source: 'Placar', color: '#555' },
    { url: 'https://eotimedopovo.com.br/feed/', source: 'É o Time do Povo', color: '#333' },
    { url: 'https://futebolinterior.com.br/feed/', source: 'Futebol Interior', color: '#2196F3' },
    { url: 'https://ge.globo.com/futebol/times/corinthians/rss2.xml', source: 'ge.Globo', color: '#e8000d' },
    { url: 'https://www1.folha.uol.com.br/esporte/rss091.xml', source: 'Folha de S.Paulo', color: '#1a237e' },
    { url: 'https://esporte.uol.com.br/futebol/campeonatos/brasileiro/rss.xml', source: 'UOL Esporte', color: '#7B1FA2' },
  ];

  let allNews = [];
  for (const feed of RSS_FEEDS) {
    try {
      const r = await fetch(feed.url);
      const xml = await r.text();
      const items = parseRSS(xml).slice(0, 8);
      items.forEach(item => allNews.push({
        source: feed.source,
        color: feed.color,
        title: item.title,
        url: item.url,
        time: fmtDate(item.pubDate),
        pubDate: item.pubDate
      }));
      console.log(`✅ ${feed.source}: ${items.length} notícias`);
    } catch(e) {
      console.log(`❌ ${feed.source}: ${e.message}`);
    }
  }

  // Ordenar por data mais recente
  allNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  allNews = allNews.slice(0, 30);

  // ── 2. Jogos via API-Football ────────────────────────
  const KEY = process.env.RAPIDAPI_KEY;
  const HDRS = { "X-RapidAPI-Key": KEY, "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com" };
  const BASE = "https://api-football-v1.p.rapidapi.com/v3";
  const TEAM = 131;

  let upcoming = [], results = [], standings = [];

  try {
    const r = await fetch(`${BASE}/fixtures?team=${TEAM}&next=10`, { headers: HDRS });
    const d = await r.json();
    upcoming = (d.response || []).map(f => ({
      id: f.fixture.id,
      date: f.fixture.date,
      status: f.fixture.status?.short || 'NS',
      home: f.teams.home.name,
      homeId: f.teams.home.id,
      away: f.teams.away.name,
      awayId: f.teams.away.id,
      comp: f.league.name,
      round: f.league.round,
      venue: f.fixture.venue?.name || ''
    }));
    console.log(`✅ Próximos jogos: ${upcoming.length}`);
  } catch(e) { console.log(`❌ Próximos jogos: ${e.message}`); }

  try {
    const r = await fetch(`${BASE}/fixtures?team=${TEAM}&last=10`, { headers: HDRS });
    const d = await r.json();
    results = (d.response || []).reverse().map(f => ({
      id: f.fixture.id,
      date: f.fixture.date,
      status: 'FT',
      home: f.teams.home.name,
      homeId: f.teams.home.id,
      away: f.teams.away.name,
      awayId: f.teams.away.id,
      homeScore: f.goals.home,
      awayScore: f.goals.away,
      comp: f.league.name,
      round: f.league.round,
      venue: f.fixture.venue?.name || ''
    }));
    console.log(`✅ Resultados: ${results.length}`);
  } catch(e) { console.log(`❌ Resultados: ${e.message}`); }

  try {
    const r = await fetch(`${BASE}/standings?league=71&season=2026`, { headers: HDRS });
    const d = await r.json();
    standings = (d.response?.[0]?.league?.standings?.[0] || []).map(t => ({
      pos: t.rank,
      name: t.team.name,
      teamId: t.team.id,
      pts: t.points,
      j: t.all.played,
      v: t.all.win,
      e: t.all.draw,
      d: t.all.lose,
      gp: t.all.goals.for,
      gc: t.all.goals.against,
      sg: t.goalsDiff
    }));
    console.log(`✅ Tabela: ${standings.length} times`);
  } catch(e) { console.log(`❌ Tabela: ${e.message}`); }

  // ── 3. Salvar dados ──────────────────────────────────
  const data = {
    updatedAt: new Date().toISOString(),
    news: allNews,
    upcoming,
    results,
    standings
  };

  fs.writeFileSync('src/data.js', `// Gerado automaticamente em ${new Date().toLocaleString('pt-BR')}
const LIVE_DATA = ${JSON.stringify(data, null, 2)};
export default LIVE_DATA;
`);

  console.log('✅ src/data.js atualizado com sucesso!');
  console.log(`📰 Notícias: ${allNews.length}`);
  console.log(`📅 Próximos: ${upcoming.length}`);
  console.log(`📊 Resultados: ${results.length}`);
  console.log(`🏆 Tabela: ${standings.length}`);
}

main().catch(console.error);
