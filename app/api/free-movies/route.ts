import { NextRequest, NextResponse } from 'next/server';

interface NormalizedMovie {
  id: string;
  provider: 'tubi' | 'pluto';
  title: string;
  year: number | null;
  runtime: number | null;
  posterUrl: string | null;
  description: string | null;
  watchUrl: string;
  source: 'watchmode' | 'fallback';
  region: 'US';
}

const movieCache: Record<string, { data: NormalizedMovie[]; ts: number }> = {};
let sourceIdCache: { tubi: number | null; pluto: number | null; ts: number } | null = null;
const TTL = 6 * 60 * 60 * 1000;

const FALLBACK: NormalizedMovie[] = [
  { id: 'fb-tubi-1', provider: 'tubi', title: 'The Last Boy Scout', year: 1991, runtime: 105, posterUrl: null, description: 'A retired Secret Service agent teams up with a faded football star to investigate a murder.', watchUrl: 'https://tubitv.com/home', source: 'fallback', region: 'US' },
  { id: 'fb-tubi-2', provider: 'tubi', title: 'Cliffhanger', year: 1993, runtime: 112, posterUrl: null, description: 'A mountain climber attempts to retrieve $100 million in lost treasury bills from the Rocky Mountains.', watchUrl: 'https://tubitv.com/home', source: 'fallback', region: 'US' },
  { id: 'fb-pluto-1', provider: 'pluto', title: 'Platoon', year: 1986, runtime: 120, posterUrl: null, description: 'A young soldier in Vietnam faces a moral crisis when confronted with the horrors of war.', watchUrl: 'https://pluto.tv/en/on-demand/movies', source: 'fallback', region: 'US' },
];


const GENRE_MAP: Record<string, number> = {
  'Action': 1, 'Comedy': 4, 'Drama': 7, 'Horror': 11, 'Thriller': 17,
  'Sci-Fi': 15, 'Romance': 14, 'Documentary': 6, 'Animation': 3,
  'Crime': 5, 'Family': 8, 'Kids': 8, 'Western': 19,
  'Bollywood/Music': 12, 'International': 6,
};

async function getSourceIds(apiKey: string): Promise<{ tubi: number; pluto: number }> {
  if (sourceIdCache && Date.now() - sourceIdCache.ts < TTL) {
    return { tubi: sourceIdCache.tubi ?? 296, pluto: sourceIdCache.pluto ?? 391 };
  }
  try {
    const res = await fetch(`https://api.watchmode.com/v1/sources/?apiKey=${apiKey}&regions=US`);
    const sources = await res.json();
    let tubiId = 296;
    let plutoId = 391;
    if (Array.isArray(sources)) {
      for (const s of sources) {
        const name = (s.name || '').toLowerCase();
        if (name.includes('tubi')) tubiId = s.id;
        if (name.includes('pluto')) plutoId = s.id;
      }
    }
    sourceIdCache = { tubi: tubiId, pluto: plutoId, ts: Date.now() };
    return { tubi: tubiId, pluto: plutoId };
  } catch {
    return { tubi: 296, pluto: 391 };
  }
}

async function fetchMoviesForProvider(apiKey: string, omdbKey: string | undefined, sourceId: number, provider: 'tubi' | 'pluto', genreId?: number): Promise<NormalizedMovie[]> {
  const cacheKey = genreId ? `${provider}-${genreId}` : provider;
  const cached = movieCache[cacheKey];
  if (cached && Date.now() - cached.ts < TTL) return cached.data;
  try {
    const listUrl = new URL('https://api.watchmode.com/v1/list-titles/');
    listUrl.searchParams.set('apiKey', apiKey);
    listUrl.searchParams.set('source_ids', String(sourceId));
    listUrl.searchParams.set('types', 'movie');
    listUrl.searchParams.set('regions', 'US');
    listUrl.searchParams.set('sort_by', 'popularity_desc');
    listUrl.searchParams.set('page', '1');
    if (genreId) listUrl.searchParams.set('genres', String(genreId));
    const listRes = await fetch(listUrl.toString());
    if (!listRes.ok) throw new Error(`List failed: ${listRes.status}`);
    const listData = await listRes.json();
    const titles = (listData.titles || []).slice(0, 12);
    if (!titles.length) throw new Error('No titles');

    const movies = await Promise.all(
      titles.map(async (t: { id: number; title: string; year: number; imdb_id?: string }) => {
        try {
          const [sourcesRes, omdbRes] = await Promise.all([
            fetch(`https://api.watchmode.com/v1/title/${t.id}/sources/?apiKey=${apiKey}&regions=US`),
            omdbKey
              ? fetch(t.imdb_id ? `https://www.omdbapi.com/?i=${t.imdb_id}&apikey=${omdbKey}` : `https://www.omdbapi.com/?t=${encodeURIComponent(t.title)}&y=${t.year || ''}&apikey=${omdbKey}`)
              : Promise.resolve(null),
          ]);
          const sources = await sourcesRes.json();
          const omdb = omdbRes ? await omdbRes.json() : null;
          const src = Array.isArray(sources)
            ? sources.find((s: { source_id: number; web_url?: string }) => s.source_id === sourceId && s.web_url)
            : null;
          if (!src) return null;
          let runtime: number | null = null;
          if (omdb?.Runtime && omdb.Runtime !== 'N/A') {
            const match = omdb.Runtime.match(/(\d+)/);
            if (match) runtime = parseInt(match[1]);
          }
          return {
            id: String(t.id),
            provider,
            title: omdb?.Title || t.title,
            year: omdb?.Year ? parseInt(omdb.Year) : (t.year || null),
            runtime,
            posterUrl: omdb?.Poster && omdb.Poster !== 'N/A' ? omdb.Poster : null,
            description: omdb?.Plot && omdb.Plot !== 'N/A' ? omdb.Plot : null,
            watchUrl: src.web_url,
            source: 'watchmode' as const,
            region: 'US' as const,
          };
        } catch { return null; }
      })
    );
    const filtered = movies.filter(Boolean) as NormalizedMovie[];
    console.log(`Watchmode+OMDB: ${filtered.length} movies for ${provider}`);
    movieCache[cacheKey] = { data: filtered, ts: Date.now() };
    return filtered;
  } catch (err) {
    console.error(`Error for ${provider}:`, err);
    return [];
  }
}

function getFallback(provider?: string): NormalizedMovie[] {
  if (!provider || provider === 'all') return FALLBACK;
  return FALLBACK.filter(m => m.provider === provider);
}

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get('provider') || 'all';
  const genre = request.nextUrl.searchParams.get('genre') || '';
  const apiKey = process.env.WATCHMODE_API_KEY;
  const omdbKey = process.env.OMDB_API_KEY;
  if (!apiKey) return NextResponse.json(getFallback(provider));
  try {
    const { tubi: tubiId, pluto: plutoId } = await getSourceIds(apiKey);
    const results: NormalizedMovie[] = [];
    const genreId = GENRE_MAP[genre] || undefined;
    if ((provider === 'tubi' || provider === 'all') && tubiId) {
      results.push(...await fetchMoviesForProvider(apiKey, omdbKey, tubiId, 'tubi', genreId));
    }
    if ((provider === 'pluto' || provider === 'all') && plutoId) {
      results.push(...await fetchMoviesForProvider(apiKey, omdbKey, plutoId, 'pluto', genreId));
    }
    if (!results.length) return NextResponse.json(getFallback(provider));
    const deduped = [...new Map(results.map(m => [m.id, m])).values()];
    return NextResponse.json(deduped);
  } catch (err) {
    console.error('free-movies error:', err);
    return NextResponse.json(getFallback(provider));
  }
}
