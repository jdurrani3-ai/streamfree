import { NextResponse } from 'next/server';

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!id || !secret) throw new Error('Missing Spotify credentials');
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64'),
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken!;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const showId = searchParams.get('showId');

  try {
    const token = await getToken();
    const headers = { Authorization: `Bearer ${token}` };

    if (showId) {
      const res = await fetch(
        `https://api.spotify.com/v1/shows/${showId}/episodes?limit=20&market=US`,
        { headers }
      );
      const data = await res.json();
      const episodes = (data.items || []).filter(Boolean).map((e: any) => ({
        id: e.id, title: e.name, type: 'episode',
        image: e.images?.[0]?.url || null,
        publisher: null,
        embedUrl: `https://open.spotify.com/embed/episode/${e.id}`,
        description: e.description?.substring(0, 120) || null,
        duration: e.duration_ms ? Math.floor(e.duration_ms / 60000) + ' min' : null,
        releaseDate: e.release_date || null,
      }));
      return NextResponse.json({ shows: [], episodes });
    }

    const query = q || 'top podcasts';
    const [showsRes, epsRes] = await Promise.all([
      fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=show&limit=10&market=US`, { headers }),
      fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=episode&limit=10&market=US`, { headers }),
    ]);
    const [showsData, epsData] = await Promise.all([showsRes.json(), epsRes.json()]);

    const shows = (showsData.shows?.items || []).filter(Boolean).map((s: any) => ({
      id: s.id, title: s.name, type: 'show',
      image: s.images?.[0]?.url || null,
      publisher: s.publisher || null,
      embedUrl: `https://open.spotify.com/embed/show/${s.id}`,
      description: s.description?.substring(0, 120) || null,
      duration: null, releaseDate: null,
    }));

    const episodes = (epsData.episodes?.items || []).filter(Boolean).map((e: any) => ({
      id: e.id, title: e.name, type: 'episode',
      image: e.images?.[0]?.url || null,
      publisher: e.show?.name || null,
      embedUrl: `https://open.spotify.com/embed/episode/${e.id}`,
      description: e.description?.substring(0, 120) || null,
      duration: e.duration_ms ? Math.floor(e.duration_ms / 60000) + ' min' : null,
      releaseDate: e.release_date || null,
    }));

    return NextResponse.json({ shows, episodes });
  } catch {
    return NextResponse.json({ shows: [], episodes: [] }, { status: 500 });
  }
}
