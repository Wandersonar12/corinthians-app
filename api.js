import { RAPIDAPI_KEY, NEWS_API_KEY, CORINTHIANS_ID, API_BASE } from './config';

const HDRS = {
  "X-RapidAPI-Key": RAPIDAPI_KEY,
  "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com"
};

// ── Fixture helpers ──────────────────────────────────
function mapFixture(f) {
  return {
    id: f.fixture.id,
    date: f.fixture.date,
    status: f.fixture.status,
    teams: f.teams,
    league: { name: f.league.name, round: f.league.round },
    goals: f.goals,
    venue: f.fixture.venue?.name || ""
  };
}

// ── Live match + events + stats + lineups ────────────
export async function fetchLiveMatch() {
  const liveRes = await fetch(`${API_BASE}/fixtures?team=${CORINTHIANS_ID}&live=all`, { headers: HDRS });
  const liveData = await liveRes.json();
  const liveFix = liveData?.response || [];

  if (liveFix.length > 0) {
    const f = liveFix[0];
    const fid = f.fixture.id;
    const [evD, stD, lnD] = await Promise.all([
      fetch(`${API_BASE}/fixtures/events?fixture=${fid}`, { headers: HDRS }).then(r => r.json()),
      fetch(`${API_BASE}/fixtures/statistics?fixture=${fid}`, { headers: HDRS }).then(r => r.json()),
      fetch(`${API_BASE}/fixtures/lineups?fixture=${fid}`, { headers: HDRS }).then(r => r.json()),
    ]);
    return {
      ...mapFixture(f),
      events: evD?.response || [],
      statistics: stD?.response || [],
      lineups: lnD?.response || [],
      isLive: true
    };
  }

  // No live match — fetch next game + lineup
  const nxtRes = await fetch(`${API_BASE}/fixtures?team=${CORINTHIANS_ID}&next=1`, { headers: HDRS });
  const nxtData = await nxtRes.json();
  const nxt = nxtData?.response?.[0];
  if (nxt) {
    const lnRes = await fetch(`${API_BASE}/fixtures/lineups?fixture=${nxt.fixture.id}`, { headers: HDRS });
    const lnD = await lnRes.json();
    return {
      ...mapFixture(nxt),
      events: [],
      statistics: [],
      lineups: lnD?.response || [],
      isLive: false
    };
  }
  return null;
}

// ── Upcoming + past fixtures ─────────────────────────
export async function fetchFixtures() {
  const [nD, lD] = await Promise.all([
    fetch(`${API_BASE}/fixtures?team=${CORINTHIANS_ID}&next=10`, { headers: HDRS }).then(r => r.json()),
    fetch(`${API_BASE}/fixtures?team=${CORINTHIANS_ID}&last=10`, { headers: HDRS }).then(r => r.json()),
  ]);
  return {
    upcoming: (nD?.response || []).map(mapFixture),
    results: (lD?.response || []).reverse().map(mapFixture)
  };
}

// ── Match stats (for past games) ─────────────────────
export async function fetchMatchStats(fixtureId) {
  const [evD, stD] = await Promise.all([
    fetch(`${API_BASE}/fixtures/events?fixture=${fixtureId}`, { headers: HDRS }).then(r => r.json()),
    fetch(`${API_BASE}/fixtures/statistics?fixture=${fixtureId}`, { headers: HDRS }).then(r => r.json()),
  ]);
  return {
    events: evD?.response || [],
    statistics: stD?.response || []
  };
}

// ── Squad (auto-updates with real roster) ────────────
export async function fetchSquad() {
  const res = await fetch(`${API_BASE}/players/squads?team=${CORINTHIANS_ID}`, { headers: HDRS });
  const data = await res.json();
  const players = data?.response?.[0]?.players || [];
  return players.map(p => ({
    id: p.id,
    num: p.number,
    name: p.name,
    pos: p.position,
    age: p.age,
    photo: p.photo
  }));
}

// ── Standings ─────────────────────────────────────────
export async function fetchStandings(leagueId, season = 2026) {
  const res = await fetch(`${API_BASE}/standings?league=${leagueId}&season=${season}`, { headers: HDRS });
  const data = await res.json();
  return data?.response?.[0]?.league?.standings?.[0] || [];
}

// ── News (NewsAPI) ────────────────────────────────────
export async function fetchNews() {
  const res = await fetch(
    `https://newsapi.org/v2/everything?q=Corinthians&language=pt&sortBy=publishedAt&pageSize=30&apiKey=${NEWS_API_KEY}`
  );
  const data = await res.json();
  return (data?.articles || []).map(a => ({
    title: a.title,
    url: a.url,
    source: a.source?.name || "Notícia",
    time: new Date(a.publishedAt).toLocaleString("pt-BR", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" }),
    publishedAt: a.publishedAt
  })).filter(a => !a.title?.includes("[Removed]"));
}
