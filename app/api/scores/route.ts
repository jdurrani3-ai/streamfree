import { NextResponse } from 'next/server';

const cache: Record<string, { data: unknown; ts: number }> = {};
const TTL = 2 * 60 * 1000;

const SPORTS = [
  { key: 'nfl', sport: 'football', league: 'nfl', label: 'NFL', emoji: '🏈' },
  { key: 'nba', sport: 'basketball', league: 'nba', label: 'NBA', emoji: '🏀' },
  { key: 'mlb', sport: 'baseball', league: 'mlb', label: 'MLB', emoji: '⚾' },
  { key: 'nhl', sport: 'hockey', league: 'nhl', label: 'NHL', emoji: '🏒' },
  { key: 'mls', sport: 'soccer', league: 'usa.1', label: 'MLS', emoji: '⚽' },
  { key: 'ncaaf', sport: 'football', league: 'college-football', label: 'NCAAF', emoji: '🏈' },
  { key: 'ncaab', sport: 'basketball', league: 'mens-college-basketball', label: 'NCAAB', emoji: '🏀' },
];

async function fetchScores(sport: string, league: string) {
  const cached = cache[league];
  if (cached && Date.now() - cached.ts < TTL) return cached.data;
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/${sport}/${league}/scoreboard`;
    const res = await fetch(url);
    const data = await res.json();
    const events = (data.events || []).map((e: any) => {
      const comp = e.competitions?.[0];
      const home = comp?.competitors?.find((t: any) => t.homeAway === 'home');
      const away = comp?.competitors?.find((t: any) => t.homeAway === 'away');
      const status = comp?.status?.type;
      return {
        id: e.id,
        name: e.name,
        homeTeam: home?.team?.displayName || '',
        homeScore: home?.score || '0',
        homeLogo: home?.team?.logo || '',
        awayTeam: away?.team?.displayName || '',
        awayScore: away?.score || '0',
        awayLogo: away?.team?.logo || '',
        status: status?.description || '',
        isLive: status?.state === 'in',
        isFinal: status?.state === 'post',
        clock: comp?.status?.displayClock || '',
        period: comp?.status?.period || 0,
      };
    });
    cache[league] = { data: events, ts: Date.now() };
    return events;
  } catch (err) {
    console.error(`Scores error for ${league}:`, err);
    return [];
  }
}

export async function GET() {
  const results = await Promise.all(
    SPORTS.map(async (s) => ({
      ...s,
      games: await fetchScores(s.sport, s.league),
    }))
  );
  return NextResponse.json(results);
}
