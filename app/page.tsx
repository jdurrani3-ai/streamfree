'use client';

import { useState, useEffect } from 'react';

interface YouTubeMovie {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  year: number;
  durationMinutes: number | null;
  rating: string | null;
  youtubeUrl: string;
}

interface FreeMovie {
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

interface GridMovie {
  gridId: string;
  type: 'youtube' | 'tubi' | 'pluto';
  title: string;
  thumbnail: string | null;
  year: number | null;
  runtimeMinutes: number | null;
  rating: string | null;
  description: string | null;
  watchUrl: string;
  youtubeId?: string;
  channel?: string;
  isFallback?: boolean;
}

interface PickResult {
  id: string;
  title: string;
  reason: string;
  rating: string | null;
  duration: string | null;
  thumbnail: string;
  youtubeUrl: string;
}

type DurationFilter = 'any' | 'under90' | '90to120' | 'over120';

const FEATURED = [
  { id: 'FlOra-dwLzg', title: 'Wrath of Man', description: 'A mysterious new security guard for a cash truck company reveals a dangerous hidden agenda.', rating: 'R', duration: '1h 59m' },
  { id: 'BqluXcZ9RyU', title: 'Honest Thief', description: 'A bank robber tries to go straight for the woman he loves but is double-crossed by two corrupt FBI agents.', rating: 'PG-13', duration: '1h 39m' },
  { id: 'SebuC1iyhug', title: 'First Blood', description: 'A Vietnam vet drifts into a small town and is pushed too far by a psychotic sheriff.', rating: 'R', duration: '1h 33m' },
  { id: 'AaJyi4z4JHw', title: 'London Has Fallen', description: 'A secret service agent uncovers a plot to assassinate the world leaders gathered in London.', rating: 'R', duration: '1h 39m' },
  { id: 'nzn1m-hbPYw', title: 'Bumblebee', description: 'On the run in 1987, Bumblebee finds refuge in a small beach town where a young woman discovers his secret.', rating: 'PG-13', duration: '1h 54m' },
  { id: 'K4zHXPQApic', title: 'The Chronicles of Riddick', description: 'A fugitive warrior battles a ruthless civilization that has conquered the galaxy.', rating: 'PG-13', duration: '1h 59m' },
  { id: 'naG_MI5dsbo', title: 'Payback', description: 'Left for dead after a heist, a man returns to the criminal underworld seeking the money stolen from him.', rating: 'R', duration: '1h 40m' },
  { id: 'kgIjLBjyvNM', title: 'Death Wish', description: 'A mild-mannered doctor becomes a vigilante after his wife and daughter are brutally attacked.', rating: 'R', duration: '1h 47m' },
  { id: '6-JkDTqFLEQ', title: 'Hellboy II: The Golden Army', description: 'A ruthless prince awakens an unstoppable army of ancient creatures and wages war against humanity.', rating: 'PG-13', duration: '2h' },
  { id: 'gNK-Yr8ktgM', title: 'The Spy Next Door', description: 'A spy must babysit his neighbor\'s kids after they accidentally blow his cover.', rating: 'PG', duration: '1h 34m' },
];

const FREE_MOVIES_CATALOG = [
  { id: 'FlOra-dwLzg', title: 'Wrath of Man', genre: 'action thriller revenge', rating: 'R', duration: '1h 59m' },
  { id: 'BqluXcZ9RyU', title: 'Honest Thief', genre: 'action romance crime', rating: 'PG-13', duration: '1h 39m' },
  { id: 'SebuC1iyhug', title: 'First Blood', genre: 'action drama intense', rating: 'R', duration: '1h 33m' },
  { id: 'AaJyi4z4JHw', title: 'London Has Fallen', genre: 'action thriller political', rating: 'R', duration: '1h 39m' },
  { id: 'nzn1m-hbPYw', title: 'Bumblebee', genre: 'sci-fi family adventure', rating: 'PG-13', duration: '1h 54m' },
  { id: 'K4zHXPQApic', title: 'The Chronicles of Riddick', genre: 'sci-fi action epic', rating: 'PG-13', duration: '1h 59m' },
  { id: 'naG_MI5dsbo', title: 'Payback', genre: 'crime action dark revenge', rating: 'R', duration: '1h 40m' },
  { id: 'kgIjLBjyvNM', title: 'Death Wish', genre: 'action crime vigilante', rating: 'R', duration: '1h 47m' },
  { id: '6-JkDTqFLEQ', title: 'Hellboy II: The Golden Army', genre: 'fantasy action dark', rating: 'PG-13', duration: '2h' },
  { id: 'gNK-Yr8ktgM', title: 'The Spy Next Door', genre: 'comedy action family', rating: 'PG', duration: '1h 34m' },
];

const GENRES = [
  { name: 'Action', emoji: '💥', query: 'action' },
  { name: 'Comedy', emoji: '😂', query: 'comedy' },
  { name: 'Drama', emoji: '🎭', query: 'drama' },
  { name: 'Horror', emoji: '👻', query: 'horror' },
  { name: 'Thriller', emoji: '🔪', query: 'thriller' },
  { name: 'Sci-Fi', emoji: '🚀', query: 'science fiction' },
  { name: 'Romance', emoji: '❤️', query: 'romance' },
  { name: 'Documentary', emoji: '🎥', query: 'documentary' },
  { name: 'Animation', emoji: '✨', query: 'animated' },
  { name: 'Crime', emoji: '🕵️', query: 'crime' },
  { name: 'Family', emoji: '👨‍👩‍👧', query: 'family' },
  { name: 'Kids', emoji: '🧒', query: 'kids children movie' },
  { name: 'Western', emoji: '🤠', query: 'western cowboy' },
  { name: 'Bollywood/Music', emoji: '🎵', query: 'bollywood music hindi' },
  { name: 'International', emoji: '🌍', query: 'foreign film subtitles' },
];

const DURATION_FILTERS = [
  { key: 'any' as DurationFilter, label: 'Any Length' },
  { key: 'under90' as DurationFilter, label: 'Under 90 min' },
  { key: '90to120' as DurationFilter, label: '90–120 min' },
  { key: 'over120' as DurationFilter, label: '2+ hours' },
];

const CHANNELS = [
  { name: 'Paramount+', short: 'P+', color: 'bg-blue-600', url: 'https://www.paramountplus.com' },
  { name: 'Showtime', short: 'SHO', color: 'bg-red-600', url: 'https://www.showtime.com' },
  { name: 'Starz', short: 'STARZ', color: 'bg-zinc-700', url: 'https://www.starz.com' },
  { name: 'AMC+', short: 'AMC+', color: 'bg-red-900', url: 'https://www.amcplus.com' },
  { name: 'MGM+', short: 'MGM+', color: 'bg-blue-900', url: 'https://www.mgmplus.com' },
  { name: 'Peacock', short: '🦚', color: 'bg-purple-700', url: 'https://www.peacocktv.com' },
  { name: 'BritBox', short: 'BB', color: 'bg-blue-700', url: 'https://www.britbox.com' },
  { name: 'Apple TV+', short: 'TV+', color: 'bg-zinc-800', url: 'https://tv.apple.com' },
  { name: 'Shudder', short: 'SHD', color: 'bg-green-900', url: 'https://www.shudder.com' },
  { name: 'ViX', short: 'ViX', color: 'bg-orange-500', url: 'https://www.vix.com' },
  { name: 'Acorn TV', short: 'ACN', color: 'bg-green-700', url: 'https://acorn.tv' },
  { name: 'Criterion', short: 'CC', color: 'bg-stone-800', url: 'https://www.criterionchannel.com' },
];

const RATING_COLORS: Record<string, string> = {
  'G': 'bg-green-600', 'PG': 'bg-blue-600', 'PG-13': 'bg-yellow-600',
  'R': 'bg-red-600', 'NC-17': 'bg-red-800',
  'TV-G': 'bg-green-600', 'TV-PG': 'bg-blue-600', 'TV-14': 'bg-yellow-600', 'TV-MA': 'bg-red-600',
};

const PROVIDER_BADGE: Record<string, { bg: string; label: string }> = {
  youtube: { bg: 'bg-red-600', label: 'YouTube' },
  tubi: { bg: 'bg-orange-500', label: 'Tubi' },
  pluto: { bg: 'bg-blue-500', label: 'Pluto TV' },
};

function formatDuration(minutes: number | null): string {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function toGridMovies(ytMovies: YouTubeMovie[], freeMovies: FreeMovie[]): GridMovie[] {
  const yt: GridMovie[] = ytMovies.map(m => ({
    gridId: `yt-${m.id}`,
    type: 'youtube' as const,
    title: m.title,
    thumbnail: m.thumbnail,
    year: m.year,
    runtimeMinutes: m.durationMinutes,
    rating: m.rating,
    description: m.description,
    watchUrl: m.youtubeUrl,
    youtubeId: m.id,
    channel: m.channel,
    isFallback: false,
  }));
  const free: GridMovie[] = freeMovies.map(m => ({
    gridId: `free-${m.id}`,
    type: m.provider,
    title: m.title,
    thumbnail: m.posterUrl,
    year: m.year,
    runtimeMinutes: m.runtime,
    rating: null,
    description: m.description,
    watchUrl: m.watchUrl,
    isFallback: m.source === 'fallback',
  }));
  // Interleave: every 3 YouTube movies insert 1 free movie
  const result: GridMovie[] = [];
  let fi = 0;
  for (let i = 0; i < yt.length; i++) {
    result.push(yt[i]);
    if ((i + 1) % 3 === 0 && fi < free.length) {
      result.push(free[fi++]);
    }
  }
  while (fi < free.length) result.push(free[fi++]);
  return result;
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [ytMovies, setYtMovies] = useState<YouTubeMovie[]>([]);
  const [freeMovies, setFreeMovies] = useState<FreeMovie[]>([]);
  const [gridMovies, setGridMovies] = useState<GridMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeGenre, setActiveGenre] = useState('');
  const [error, setError] = useState('');
  const [searchedFor, setSearchedFor] = useState('');
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('any');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [pickResult, setPickResult] = useState<PickResult | null>(null);
  const [hasFreeMovies, setHasFreeMovies] = useState(false);
  const [isTextSearch, setIsTextSearch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % FEATURED.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (ytMovies.length || freeMovies.length) {
      setGridMovies(toGridMovies(ytMovies, freeMovies));
      setHasFreeMovies(freeMovies.length > 0);
    }
  }, [ytMovies, freeMovies]);

  const featured = FEATURED[featuredIndex];

  const filteredGrid = gridMovies.filter(m => {
    if (durationFilter === 'any') return true;
    if (!m.runtimeMinutes) return true;
    if (durationFilter === 'under90') return m.runtimeMinutes < 90;
    if (durationFilter === '90to120') return m.runtimeMinutes >= 90 && m.runtimeMinutes <= 120;
    if (durationFilter === 'over120') return m.runtimeMinutes > 120;
    return true;
  });

  const handleSubmit = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setYtMovies([]);
    setFreeMovies([]);
    setGridMovies([]);
    setPickResult(null);
    setSearchedFor(query);
    setDurationFilter('any');
    setExpandedId(null);
    setActiveGenre('');

    setIsTextSearch(true);
    try {
      const aiRes = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const aiData = await aiRes.json();

      if (aiData.intent === 'pick' && aiData.pick) {
        const movie = FREE_MOVIES_CATALOG.find(m => m.id === aiData.pick.id);
        setPickResult({
          id: aiData.pick.id,
          title: aiData.pick.title,
          reason: aiData.pick.reason,
          rating: movie?.rating || null,
          duration: movie?.duration || null,
          thumbnail: `https://i.ytimg.com/vi/${aiData.pick.id}/maxresdefault.jpg`,
          youtubeUrl: `https://www.youtube.com/watch?v=${aiData.pick.id}`,
        });
        setLoading(false);
      } else {
        const optimizedQuery = aiData.searchQuery || query;
        const [ytRes, freeRes] = await Promise.all([
          fetch(`/api/youtube?q=${encodeURIComponent(optimizedQuery)}`),
          fetch('/api/free-movies?provider=all'),
        ]);
        const ytData = await ytRes.json();
        const freeData = freeRes.ok ? await freeRes.json() : [];
        if (ytData.error) throw new Error(ytData.error);
        const uniqueYt = [...new Map((ytData.movies || []).map((m: YouTubeMovie) => [m.id, m])).values()] as YouTubeMovie[];
        setYtMovies(uniqueYt);
        setFreeMovies(Array.isArray(freeData) ? freeData : []);
        setLoading(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const fetchMovies = async (searchQuery: string, label: string) => {
    setLoading(true);
    setError('');
    setYtMovies([]);
    setFreeMovies([]);
    setGridMovies([]);
    setPickResult(null);
    setSearchedFor(label);
    setDurationFilter('any');
    setExpandedId(null);

    try {
      const [ytRes, freeRes] = await Promise.all([
        fetch(`/api/youtube?q=${encodeURIComponent(searchQuery)}`),
        fetch(`/api/free-movies?provider=all&genre=${encodeURIComponent(label)}`),
      ]);
      const ytData = await ytRes.json();
      const freeData = freeRes.ok ? await freeRes.json() : [];
      if (ytData.error) throw new Error(ytData.error);
      const uniqueYt = [...new Map((ytData.movies || []).map((m: YouTubeMovie) => [m.id, m])).values()] as YouTubeMovie[];
        setYtMovies(uniqueYt);
      setFreeMovies(Array.isArray(freeData) ? freeData : []);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenreClick = (genre: typeof GENRES[0]) => {
    setActiveGenre(genre.name);
    setQuery('');
    fetchMovies(genre.query, genre.name);
  };

  const handleReset = () => {
    setActiveGenre('');
    setYtMovies([]);
    setFreeMovies([]);
    setGridMovies([]);
    setPickResult(null);
    setSearchedFor('');
    setDurationFilter('any');
    setExpandedId(null);
    setQuery('');
    setError('');
    setHasFreeMovies(false);
    setIsTextSearch(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">StreamFree</span>
          </div>
          <p className="text-sm text-white/40">Free movies, powered by AI</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Hero Banner */}
        <div className="relative w-full h-[60vh] mb-12 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{ backgroundImage: `url(https://i.ytimg.com/vi/${featured.id}/maxresdefault.jpg)` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 max-w-lg">
            <span className={`text-white text-xs font-bold px-2 py-1 rounded mb-4 inline-block ${RATING_COLORS[featured.rating] || 'bg-gray-600'}`}>
              {featured.rating}
            </span>
            <h2 className="text-4xl font-bold mb-2 leading-tight">{featured.title}</h2>
            <p className="text-sm text-white/50 mb-3">{featured.duration} • Free on YouTube</p>
            <p className="text-sm text-white/70 mb-6 line-clamp-3">{featured.description}</p>
            <a href={`https://www.youtube.com/watch?v=${featured.id}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-all">
              ▶ Watch Free
            </a>
          </div>
          <div className="absolute bottom-8 right-8 flex gap-2 items-center">
            {FEATURED.map((_, i) => (
              <button key={i} onClick={() => setFeaturedIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === featuredIndex ? 'bg-white w-6' : 'bg-white/40 w-2'}`} />
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-12 max-w-2xl mx-auto">
          <p className="text-center text-white/40 text-sm mb-3">Search for a movie, describe a mood, or name an actor</p>
          <div className="flex gap-3">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder='"Tom Cruise action" or "something funny tonight"'
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-purple-500 transition-all" />
            <button onClick={handleSubmit} disabled={loading || !query.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-4 rounded-xl font-semibold transition-all">
              {loading ? '...' : '→'}
            </button>
          </div>
        </div>

        {/* AI Pick */}
        {pickResult && (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative rounded-2xl overflow-hidden border border-purple-500/40">
              <img src={pickResult.thumbnail} alt={pickResult.title} className="w-full aspect-video object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex items-end">
                <div className="p-6 w-full">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-purple-400 text-xs font-semibold">🎯 AI picked this for you</span>
                    {pickResult.rating && <span className={`text-white text-xs font-bold px-1.5 py-0.5 rounded ${RATING_COLORS[pickResult.rating] || 'bg-gray-600'}`}>{pickResult.rating}</span>}
                    {pickResult.duration && <span className="text-white/50 text-xs">{pickResult.duration}</span>}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{pickResult.title}</h3>
                  <p className="text-white/60 text-sm mb-4 italic">&quot;{pickResult.reason}&quot;</p>
                  <a href={pickResult.youtubeUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-all">
                    ▶ Watch Free
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Genre Browse */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white/60 mb-4">Browse by Genre</h2>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleReset}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${activeGenre || searchedFor ? 'border-white/40 bg-white/10 hover:bg-white/20 text-white/80' : 'border-white/10 bg-transparent text-white/20 cursor-default'}`}>
              <span className="text-sm font-medium">✕ Reset</span>
            </button>
            {GENRES.map(genre => (
              <button key={genre.name} onClick={() => handleGenreClick(genre)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${activeGenre === genre.name ? 'border-purple-500 bg-purple-500/20 text-purple-300' : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 text-white/70'}`}>
                <span>{genre.emoji}</span>
                <span className="text-sm font-medium">{genre.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Premium Channels */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-white/60 mb-4">Premium Channels</h2>
          <div className="flex gap-6 overflow-x-auto pb-3">
            {CHANNELS.map(channel => (
              <a key={channel.name} href={channel.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 min-w-[72px] group">
                <div className={`w-16 h-16 rounded-full ${channel.color} border-2 border-white/10 group-hover:border-purple-500 transition-all flex items-center justify-center`}>
                  <span className="text-white text-sm font-bold text-center leading-tight px-1">{channel.short}</span>
                </div>
                <span className="text-xs text-white/50 group-hover:text-white/80 text-center whitespace-nowrap">{channel.name}</span>
                <span className="text-xs text-green-400 group-hover:text-green-300">Try now</span>
              </a>
            ))}
          </div>
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white/50">Finding free movies across YouTube, Tubi &amp; Pluto TV...</p>
          </div>
        )}

        {error && <div className="text-center py-12 text-red-400">{error}</div>}

        {/* Unified Mixed Grid */}
        {!loading && filteredGrid.length > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-semibold">
                  Results for <span className="text-purple-400">&quot;{searchedFor}&quot;</span>
                  <span className="text-white/40 text-sm font-normal ml-3">{filteredGrid.length} movies</span>
                </h2>
                {hasFreeMovies && (
                  <span className="text-xs text-white/30 border border-white/10 px-2 py-1 rounded-full">
                    Tubi &amp; Pluto powered by Watchmode
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {DURATION_FILTERS.map(f => (
                  <button key={f.key} onClick={() => setDurationFilter(f.key)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${durationFilter === f.key ? 'border-purple-500 bg-purple-500/20 text-purple-300' : 'border-white/20 bg-white/5 hover:border-white/40 text-white/60'}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {(isTextSearch ? filteredGrid.filter(m => m.type === 'youtube') : filteredGrid).map(movie => {
                const badge = PROVIDER_BADGE[movie.type];
                const isYouTube = movie.type === 'youtube';
                return (
                  <div key={movie.gridId} className="group">
                    <a href={movie.watchUrl} target="_blank" rel="noopener noreferrer">
                      <div className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10 group-hover:border-purple-500/50 transition-all group-hover:scale-105"
                        onMouseEnter={() => isYouTube && setHoveredId(movie.gridId)}
                        onMouseLeave={() => setHoveredId(null)}>
                        {isYouTube && hoveredId === movie.gridId ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${movie.youtubeId}?autoplay=1&mute=1&start=60&end=75&controls=0&modestbranding=1&rel=0`}
                            className="w-full aspect-video" allow="autoplay; encrypted-media" />
                        ) : movie.thumbnail ? (
                          <img src={movie.thumbnail} alt={movie.title} className="w-full aspect-video object-cover" />
                        ) : (
                          <div className="w-full aspect-video bg-white/10 flex items-center justify-center">
                            <span className="text-4xl">🎬</span>
                          </div>
                        )}

                        {/* Provider badge */}
                        <div className="absolute top-2 left-2 flex gap-1">
                          <span className={`text-white text-xs font-bold px-1.5 py-0.5 rounded ${badge.bg}`}>
                            {badge.label}
                          </span>
                          {movie.watchUrl && movie.watchUrl.includes('/live-tv/') && <span className='text-white text-xs font-bold px-1.5 py-0.5 rounded bg-yellow-600 ml-1'>Live TV</span>}
                          {movie.rating && (
                            <span className={`text-white text-xs font-bold px-1.5 py-0.5 rounded ${RATING_COLORS[movie.rating] || 'bg-gray-600'}`}>
                              {movie.rating}
                            </span>
                          )}
                        </div>

                        {movie.runtimeMinutes && (
                          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                            {formatDuration(movie.runtimeMinutes)}
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <span className="text-sm font-medium">
                            {isYouTube ? '▶ Verify free on YouTube' : '▶ Opens on provider site'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 px-1">
                        <p className="text-sm font-medium text-white/90 line-clamp-2 group-hover:text-purple-300 transition-colors">{movie.title}</p>
                        <p className="text-xs text-white/40 mt-0.5">
                          {movie.channel ? `${movie.channel} • ` : ''}{movie.year || ''}
                          {movie.isFallback ? ' • Demo' : ''}
                        </p>
                      </div>
                    </a>
                    {movie.description && (
                      <div className="px-1 mt-1">
                        <p className={`text-xs text-white/30 ${expandedId === movie.gridId ? '' : 'line-clamp-2'}`}>
                          {movie.description}
                        </p>
                        <button onClick={() => setExpandedId(expandedId === movie.gridId ? null : movie.gridId)}
                          className="text-xs text-purple-400/60 hover:text-purple-400 mt-0.5 transition-colors">
                          {expandedId === movie.gridId ? '− less' : '+ more'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {isTextSearch && filteredGrid.filter(m => m.type !== 'youtube').length > 0 && (
              <div className="mt-8 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-semibold">
                    Also free on <span className="text-orange-400">Tubi</span> <span className="text-white/30">&amp;</span> <span className="text-blue-400">Pluto TV</span>
                  </h3>
                  <span className="text-xs text-white/30 border border-white/10 px-2 py-1 rounded-full">Popular picks — not search specific</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredGrid.filter(m => m.type !== 'youtube').map(movie => {
                    const badge = PROVIDER_BADGE[movie.type];
                    return (
                      <div key={movie.gridId} className="group">
                        <a href={movie.watchUrl} target="_blank" rel="noopener noreferrer">
                          <div className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10 group-hover:border-purple-500/50 transition-all group-hover:scale-105">
                            {movie.thumbnail ? (
                              <img src={movie.thumbnail} alt={movie.title} className="w-full aspect-video object-cover" />
                            ) : (
                              <div className="w-full aspect-video bg-white/10 flex items-center justify-center"><span className="text-4xl">🎬</span></div>
                            )}
                            <div className="absolute top-2 left-2">
                              <span className={`text-white text-xs font-bold px-1.5 py-0.5 rounded ${badge.bg}`}>{badge.label}</span>{movie.watchUrl && movie.watchUrl.includes('/live-tv/') && <span className='text-white text-xs font-bold px-1.5 py-0.5 rounded bg-yellow-600 ml-1'>Live TV</span>}
                            </div>
                            {movie.runtimeMinutes && (
                              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">{formatDuration(movie.runtimeMinutes)}</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                              <span className="text-sm font-medium">&#9658; Opens on provider site</span>
                            </div>
                          </div>
                          <div className="mt-2 px-1">
                            <p className="text-sm font-medium text-white/90 line-clamp-2 group-hover:text-purple-300 transition-colors">{movie.title}</p>
                            <p className="text-xs text-white/40 mt-0.5">{movie.year || ''}</p>
                          </div>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {!loading && gridMovies.length === 0 && !searchedFor && !pickResult && (
          <div className="text-center py-20 text-white/30">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-lg">Search above or pick a genre to get started</p>
          </div>
        )}

        {!loading && gridMovies.length === 0 && searchedFor && !pickResult && (
          <div className="text-center py-20 text-white/40">
            <p>No results found. Try a different search.</p>
          </div>
        )}
      </main>
    </div>
  );
}
