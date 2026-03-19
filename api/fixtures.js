export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { type } = req.query;
  const KEY = process.env.RAPIDAPI_KEY;
  const TEAM = 131;
  const HDRS = { "X-RapidAPI-Key": KEY, "X-RapidAPI-Host": "api-football-v1.p.rapidapi.com" };
  const BASE = "https://api-football-v1.p.rapidapi.com/v3";

  try {
    if (type === 'live') {
      const r = await fetch(`${BASE}/fixtures?team=${TEAM}&live=all`, { headers: HDRS });
      const d = await r.json();
      if (d.response?.length > 0) {
        const f = d.response[0];
        const [ev, st, ln] = await Promise.all([
          fetch(`${BASE}/fixtures/events?fixture=${f.fixture.id}`, { headers: HDRS }).then(x => x.json()),
          fetch(`${BASE}/fixtures/statistics?fixture=${f.fixture.id}`, { headers: HDRS }).then(x => x.json()),
          fetch(`${BASE}/fixtures/lineups?fixture=${f.fixture.id}`, { headers: HDRS }).then(x => x.json()),
        ]);
        return res.json({ type: 'live', fixture: f, events: ev.response, stats: st.response, lineups: ln.response });
      }
      const n = await fetch(`${BASE}/fixtures?team=${TEAM}&next=1`, { headers: HDRS });
      const nd = await n.json();
      if (nd.response?.length > 0) {
        const f = nd.response[0];
        const ln = await fetch(`${BASE}/fixtures/lineups?fixture=${f.fixture.id}`, { headers: HDRS }).then(x => x.json());
        return res.json({ type: 'next', fixture: f, lineups: ln.response });
      }
      return res.json({ type: 'none' });
    }
    if (type === 'upcoming') {
      const r = await fetch(`${BASE}/fixtures?team=${TEAM}&next=10`, { headers: HDRS });
      const d = await r.json();
      return res.json(d.response || []);
    }
    if (type === 'results') {
      const r = await fetch(`${BASE}/fixtures?team=${TEAM}&last=10`, { headers: HDRS });
      const d = await r.json();
      return res.json((d.response || []).reverse());
    }
    if (type === 'standings') {
      const r = await fetch(`${BASE}/standings?league=71&season=2026`, { headers: HDRS });
      const d = await r.json();
      return res.json(d.response?.[0]?.league?.standings?.[0] || []);
    }
    if (type === 'squad') {
      const r = await fetch(`${BASE}/players/squads?team=${TEAM}`, { headers: HDRS });
      const d = await r.json();
      return res.json(d.response?.[0]?.players || []);
    }
    res.status(400).json({ error: 'invalid type' });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
