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

interface ScoreGame {
  id: string;
  name: string;
  homeTeam: string;
  homeScore: string;
  homeLogo: string;
  awayTeam: string;
  awayScore: string;
  awayLogo: string;
  status: string;
  isLive: boolean;
  isFinal: boolean;
  clock: string;
  period: number;
}

interface SportScores {
  key: string;
  label: string;
  emoji: string;
  games: ScoreGame[];
}

interface LiveVideo {
  id: string;
  provider: string;
  type: string;
  category: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  watchUrl: string;
  isLive: boolean;
  source: string;
  region: string;
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
  { name: 'Action', emoji: '💥', query: 'action', color: 'bg-red-700', thumb: 'WhQYVJSKUC4', count: '1,250' },
  { name: 'Animation', emoji: '🪄', query: 'animated', color: 'bg-orange-700', thumb: 'kq7kRmaL4PE', count: '320' },
  { name: 'Bollywood/Music', emoji: '🎶', query: 'bollywood music hindi', color: 'bg-rose-500', thumb: 'NgBoMJy386M', count: '480' },
  { name: 'Comedy', emoji: '😄', query: 'comedy', color: 'bg-yellow-700', thumb: 'smGU6U0e8S0', count: '892' },
  { name: 'Crime & Thriller', emoji: '🕵️', query: 'crime thriller detective', color: 'bg-zinc-700', thumb: 'oz7wymKGzOU', count: '1,140' },
  { name: 'Documentary', emoji: '🎥', query: 'documentary', color: 'bg-teal-800', thumb: 'c8aFcHFu8QM', count: '642' },
  { name: 'Drama', emoji: '🎭', query: 'drama', color: 'bg-purple-800', thumb: 'uYPbbksJxIg', count: '1,380' },
  { name: 'Family', emoji: '👨‍👩‍👧‍👦', query: 'family', color: 'bg-green-700', thumb: '7TavVZMewpY', count: '785' },
  { name: 'Horror', emoji: '👻', query: 'horror', color: 'bg-gray-800', thumb: 'WR7cc5t7tv8', count: '662' },
  { name: 'International', emoji: '🌍', query: 'foreign film english subtitles', color: 'bg-indigo-800', thumb: '5xH0HfJHsaY', count: '1,023' },
  { name: 'Kids', emoji: '🧸', query: 'kids children movie', color: 'bg-cyan-700', thumb: 'xlnPHQ3TLX8', count: '512' },
  { name: 'Romance', emoji: '💘', query: 'romance', color: 'bg-pink-700', thumb: '0pdqf4P9MB8', count: '856' },
  { name: 'Sci-Fi', emoji: '🚀', query: 'science fiction', color: 'bg-blue-800', thumb: 'Way9Dexny3w', count: '678' },
  { name: 'Western', emoji: '🤠', query: 'western cowboy', color: 'bg-amber-800', thumb: 'LoebZZ8K5N0', count: '430' },
];

const DURATION_FILTERS = [
  { key: 'any' as DurationFilter, label: 'Any Length' },
  { key: 'under90' as DurationFilter, label: 'Under 90 min' },
  { key: '90to120' as DurationFilter, label: '90–120 min' },
  { key: 'over120' as DurationFilter, label: '2+ hours' },
];

const CHANNELS = [
  { name: 'Paramount+', short: 'P+', color: 'bg-blue-600', url: 'https://www.paramountplus.com', desc: 'Entertainment & Sports' },
  { name: 'Showtime', short: 'SHO', color: 'bg-red-600', url: 'https://www.showtime.com', desc: 'Premium Drama' },
  { name: 'Starz', short: 'STARZ', color: 'bg-zinc-700', url: 'https://www.starz.com', desc: 'Hit Movies & Series' },
  { name: 'AMC+', short: 'AMC+', color: 'bg-red-900', url: 'https://www.amcplus.com', desc: 'Award-Winning TV' },
  { name: 'MGM+', short: 'MGM+', color: 'bg-blue-900', url: 'https://www.mgmplus.com', desc: 'Blockbuster Movies' },
  { name: 'Peacock', short: '🦚', color: 'bg-purple-700', url: 'https://www.peacocktv.com', desc: 'NBCUniversal Content' },
  { name: 'BritBox', short: 'BB', color: 'bg-blue-700', url: 'https://www.britbox.com', desc: 'British TV & Films' },
  { name: 'Apple TV+', short: 'TV+', color: 'bg-zinc-800', url: 'https://tv.apple.com', desc: 'Apple Originals' },
  { name: 'Shudder', short: 'SHD', color: 'bg-green-900', url: 'https://www.shudder.com', desc: 'Horror & Thriller' },
  { name: 'ViX', short: 'ViX', color: 'bg-orange-500', url: 'https://www.vix.com', desc: 'Spanish Language' },
  { name: 'Acorn TV', short: 'ACN', color: 'bg-green-700', url: 'https://acorn.tv', desc: 'British & International' },
  { name: 'Criterion', short: 'CC', color: 'bg-stone-800', url: 'https://www.criterionchannel.com', desc: 'Classic Cinema' },
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
  const [liveOpen, setLiveOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('home');
  const decodeHtml = (str: string) => str.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,'<').replace(/&gt;/g,'>');
  const [liveVideos, setLiveVideos] = useState<LiveVideo[]>([]);
  const [scores, setScores] = useState<SportScores[]>([]);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [scoresError, setScoresError] = useState('');
  const [activeSport, setActiveSport] = useState('nba');
  const [liveTab, setLiveTab] = useState<'news' | 'sports' | 'scores'>('news');
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedIndex(prev => (prev + 1) % FEATURED.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (ytMovies.length || freeMovies.length) {
      setGridMovies(toGridMovies(ytMovies, freeMovies));
      setHasFreeMovies(freeMovies.length > 0);
    }
  }, [ytMovies, freeMovies]);
  useEffect(() => {
    handleLiveTab('news');
  }, []);

  const featured = FEATURED[featuredIndex];

  const filteredGrid = gridMovies.filter(m => {
    if (durationFilter === 'any') return true;
    if (!m.runtimeMinutes) return true;
    if (durationFilter === 'under90') return m.runtimeMinutes < 90;
    if (durationFilter === '90to120') return m.runtimeMinutes >= 90 && m.runtimeMinutes <= 120;
    if (durationFilter === 'over120') return m.runtimeMinutes > 120;
    return true;
  });

  const scrollToSection = (section: string) => {
    setActiveNav(section);
    if (section === 'home') window.scrollTo({ top: 0, behavior: 'smooth' });
    if (section === 'movies') document.getElementById('genre-section')?.scrollIntoView({ behavior: 'smooth' });
    if (section === 'live') {
      setLiveOpen(true);
      document.getElementById('live-section')?.scrollIntoView({ behavior: 'smooth' });
    }
    if (section === 'channels') document.getElementById('channels-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchScores = async () => {
    setScoresLoading(true);
    setScoresError('');
    try {
      const res = await fetch('/api/scores');
      const data = await res.json();
      setScores(Array.isArray(data) ? data : []);
    } catch {
      setScoresError('Scores temporarily unavailable. Please try again later.');
    } finally {
      setScoresLoading(false);
    }
  };

  const fetchLive = async (category: 'news' | 'sports') => {
    setLiveLoading(true);
    setLiveError('');
    try {
      const res = await fetch(`/api/youtube-live?category=${category}`);
      const data = await res.json();
      setLiveVideos(Array.isArray(data) ? data : []);
    } catch {
      setLiveError('Live results are temporarily unavailable. Please try again later.');
      setLiveVideos([]);
    } finally {
      setLiveLoading(false);
    }
  };

  const handleLiveTab = (tab: 'news' | 'sports' | 'scores') => {
    setLiveTab(tab);
    if (tab === 'scores') fetchScores();
    else fetchLive(tab);
  };

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
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
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
    <div className="min-h-screen text-white" style={{background: 'linear-gradient(135deg, #0d1117 0%, #0a0a0f 50%, #111318 100%)'}}>
      <header className="border-b border-white/10 px-6 py-4 sticky top-0 z-50 backdrop-blur-md bg-black/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('home')}>
              <img src="/logo.png" alt="StreamFree" className="h-10 w-10 object-contain" />
              <span className="text-3xl font-bold"><span className="text-white">Stream</span><span className="bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">Free</span></span>
            </div>
            <nav className="flex items-center gap-1">
              {['home','movies','live','channels'].map(tab => (
                <button key={tab} onClick={() => scrollToSection(tab)}
                  className={`px-4 py-2 text-sm font-medium capitalize transition-all relative cursor-pointer ${activeNav === tab ? 'text-white' : 'text-white/50 hover:text-white/80'}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeNav === tab && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full"></span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          <button onClick={() => document.getElementById('search-bar')?.focus()} className="text-white/50 hover:text-white transition-colors">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Hero Banner */}
        <div className="relative w-full h-[65vh] mb-12 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
            style={{ backgroundImage: `url(https://i.ytimg.com/vi/${featured.id}/maxresdefault.jpg)` }} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/98 via-black/75 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Left Content */}
          <div className="absolute bottom-0 left-0 p-10 max-w-xl">
            <span className="text-xs font-bold tracking-widest text-orange-400 uppercase mb-3 block">⭐ Featured</span>
            <h2 className="text-6xl font-black mb-4 leading-none tracking-tight">{featured.title}</h2>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`text-white text-xs font-bold px-2 py-1 rounded ${RATING_COLORS[featured.rating] || 'bg-gray-600'}`}>{featured.rating}</span>
              <span className="text-white/40 text-xs">•</span>
              <span className="text-white/60 text-xs bg-white/10 px-2 py-1 rounded">{featured.duration}</span>
              <span className="text-white/40 text-xs">•</span>
              <span className="text-white/60 text-xs bg-white/10 px-2 py-1 rounded">Free on YouTube</span>
            </div>
            <p className="text-sm text-white/65 mb-8 line-clamp-2 leading-relaxed">{featured.description}</p>
            <div className="flex gap-3">
              <a href={`https://www.youtube.com/watch?v=${featured.id}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-yellow-400 text-black px-7 py-3.5 rounded-xl font-bold hover:from-orange-500 hover:to-yellow-300 transition-all">
                ▶ Watch Free
              </a>

            </div>
          </div>

          {/* Right Poster Cards */}
          <div className="absolute right-8 top-0 bottom-0 hidden lg:flex items-center gap-4">
            <a href={`https://www.youtube.com/watch?v=${FEATURED[(featuredIndex + 2) % FEATURED.length].id}`} target="_blank" rel="noopener noreferrer" className="relative w-32 h-52 rounded-xl overflow-hidden opacity-65 border border-white/15 flex-shrink-0 hover:opacity-90 hover:border-orange-500/40 transition-all">
              <img src={`https://i.ytimg.com/vi/${FEATURED[(featuredIndex + 2) % FEATURED.length].id}/maxresdefault.jpg`} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                <p className="text-white text-xs font-bold line-clamp-2">{FEATURED[(featuredIndex + 2) % FEATURED.length].title}</p>
              </div>
            </a>
            <a href={`https://www.youtube.com/watch?v=${FEATURED[(featuredIndex + 1) % FEATURED.length].id}`} target="_blank" rel="noopener noreferrer" className="relative w-40 h-64 rounded-2xl overflow-hidden border-2 border-orange-500/50 shadow-[0_0_30px_rgba(234,88,12,0.25)] flex-shrink-0 hover:border-orange-400 hover:shadow-[0_0_40px_rgba(234,88,12,0.4)] transition-all">
              <img src={`https://i.ytimg.com/vi/${FEATURED[(featuredIndex + 1) % FEATURED.length].id}/maxresdefault.jpg`} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                <p className="text-white text-xs font-bold line-clamp-2">{FEATURED[(featuredIndex + 1) % FEATURED.length].title}</p>
              </div>
            </a>
          </div>

          {/* Slide Counter + Progress Bar */}
          <div className="absolute bottom-4 right-5 bg-black/60 border border-white/15 rounded-full px-3 py-1 flex items-center gap-1">
            <span className="text-white text-sm font-bold">{featuredIndex + 1}</span>
            <span className="text-white/30 text-xs">/</span>
            <span className="text-white/40 text-xs">{FEATURED.length}</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
            <div key={featuredIndex} className="h-full bg-gradient-to-r from-orange-500 to-yellow-400" style={{animation: 'progressFill 10s linear forwards'}} />
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-12 max-w-2xl mx-auto">
          <p className="text-center text-white/40 text-sm mb-3">Search for a movie, describe a mood, or name an actor</p>
          <div className="flex gap-3">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder='"Tom Cruise action" or "something funny tonight"'
              id="search-bar" className="flex-1 bg-white/5 border-2 border-orange-500/40 rounded-xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-orange-500 transition-all shadow-[0_0_30px_rgba(234,88,12,0.08)]" />
            <button onClick={handleSubmit} disabled={loading || !query.trim()}
              className="bg-gradient-to-r from-orange-600 to-yellow-400 hover:from-orange-500 hover:to-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-4 rounded-xl font-bold text-black transition-all">
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

        {/* Live Section */}
        <div id="live-section" className="mb-12">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1"><span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span><span className="text-xs font-bold text-red-400 tracking-widest uppercase">Live Now</span></div>
              <h2 className="text-3xl font-black text-white">Live TV &amp; Events</h2>
              <p className="text-white/40 text-sm mt-1">Watch breaking news, live sports, and must-see events happening right now.</p>
            </div>
            <button onClick={() => setLiveOpen(o => !o)} className="text-white/30 hover:text-white/60 transition-colors mt-2 text-sm">{liveOpen ? '▲' : '▼'}</button>
          </div>
          <div style={{display: liveOpen ? "block" : "none"}}>
          <div className="flex gap-2 mb-6 flex-wrap">
            <button onClick={() => handleLiveTab('news')} className={`px-5 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${liveTab === 'news' ? 'border-orange-500 bg-orange-500/15 text-white' : 'border-white/15 bg-white/5 text-white/50 hover:border-white/30 hover:text-white/80'}`}>📰 News</button>
            <button onClick={() => handleLiveTab('sports')} className={`px-5 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${liveTab === 'sports' ? 'border-orange-500 bg-orange-500/15 text-white' : 'border-white/15 bg-white/5 text-white/50 hover:border-white/30 hover:text-white/80'}`}>🏆 Sports</button>
            <button onClick={() => handleLiveTab('scores')} className={`px-5 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${liveTab === 'scores' ? 'border-orange-500 bg-orange-500/15 text-white' : 'border-white/15 bg-white/5 text-white/50 hover:border-white/30 hover:text-white/80'}`}>📊 Scores</button>
          </div>

          {liveTab !== 'scores' && liveLoading && (
            <div className="text-center py-8">
              <div className="inline-block w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {liveTab !== 'scores' && liveError && (
            <p className="text-white/40 text-sm py-4">{liveError}</p>
          )}

          {/* Scores Tab */}
          {liveTab === 'scores' && scoresLoading && (
            <div className="text-center py-8">
              <div className="inline-block w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          {liveTab === 'scores' && scoresError && (
            <p className="text-white/40 text-sm py-4">{scoresError}</p>
          )}
          {liveTab === 'scores' && !scoresLoading && scores.length > 0 && (
            <div>
              <div className="flex gap-2 mb-4 flex-wrap">
                {scores.map(s => (
                  <button key={s.key} onClick={() => setActiveSport(s.key)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${activeSport === s.key ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300' : 'border-white/20 bg-white/5 text-white/50 hover:border-white/40'}`}>
                    {s.emoji} {s.label} {s.games.length > 0 ? `(${s.games.length})` : ''}
                  </button>
                ))}
              </div>
              {scores.filter(s => s.key === activeSport).map(sport => (
                <div key={sport.key}>
                  {sport.games.length === 0 ? (
                    <p className="text-white/30 text-sm py-4">No games scheduled today for {sport.label}.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sport.games.map(game => (
                        <div key={game.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${game.isLive ? 'bg-red-600 animate-pulse' : game.isFinal ? 'bg-zinc-600' : 'bg-blue-700'}`}>
                              {game.isLive ? '● LIVE' : game.isFinal ? 'FINAL' : 'UPCOMING'}
                            </span>
                            {game.isLive && <span className="text-xs text-white/50">{game.clock} • Q{game.period}</span>}
                            {!game.isLive && !game.isFinal && <span className="text-xs text-white/50">{game.status}</span>}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2 flex-1">
                              {game.awayLogo && <img src={game.awayLogo} alt={game.awayTeam} className="w-8 h-8 object-contain" />}
                              <span className="text-sm font-medium text-white/90 truncate">{game.awayTeam}</span>
                            </div>
                            <span className="text-xl font-bold text-white mx-2">{game.awayScore}</span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 flex-1">
                              {game.homeLogo && <img src={game.homeLogo} alt={game.homeTeam} className="w-8 h-8 object-contain" />}
                              <span className="text-sm font-medium text-white/90 truncate">{game.homeTeam}</span>
                            </div>
                            <span className="text-xl font-bold text-white mx-2">{game.homeScore}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {liveTab === 'scores' && !scoresLoading && scores.length === 0 && !scoresError && (
            <p className="text-white/30 text-sm py-4">Click Scores to load live game data.</p>
          )}

          {liveTab !== 'scores' && !liveLoading && !liveError && liveVideos.length === 0 && (
            <p className="text-white/30 text-sm py-4">Click News or Sports to load live streams.</p>
          )}

          {liveTab !== 'scores' && !liveLoading && liveTab === 'news' && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white/60">Quick Switch</span>
                  <span className="text-xs text-white/30">Jump to another live channel</span>
                </div>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2" style={{scrollbarWidth:'none'}}>
                {[
                  { name: 'Al Jazeera', url: 'https://www.youtube.com/watch?v=gCNeDWCI0vo', color: 'bg-yellow-700' },
                  { name: 'Bloomberg', url: 'https://www.youtube.com/watch?v=iEpJwprxDdk', color: 'bg-blue-800' },
                  { name: 'DW News', url: 'https://www.youtube.com/watch?v=LuKwFajn37U', color: 'bg-zinc-600' },
                  { name: 'Yahoo Finance', url: 'https://www.youtube.com/watch?v=KQp-e_XQnDE', color: 'bg-purple-800' },
                  { name: 'NDTV', url: 'https://www.youtube.com/watch?v=uoK1dFpMo98', color: 'bg-orange-800' },
                  { name: 'Geo News', url: 'https://www.youtube.com/watch?v=_FwympjOSNE', color: 'bg-green-800' },
                  { name: 'Euronews', url: 'https://www.youtube.com/watch?v=pykpO5kQJ98', color: 'bg-blue-900' },
                  { name: 'Africa Live', url: 'https://www.youtube.com/watch?v=NQjabLGdP5g', color: 'bg-yellow-900' },
                  { name: 'TMZ', url: 'https://www.youtube.com/watch?v=G2kbkYtsbAA', color: 'bg-pink-800' },
                ].map(ch => (
                  <a key={ch.name} href={ch.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white/5 border border-white/10 hover:border-orange-500/40 rounded-xl px-4 py-2.5 flex-shrink-0 transition-all min-w-[150px]">
                    <div className={`w-8 h-8 rounded-lg ${ch.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {ch.name.slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0"></span>
                        <span className="text-white text-xs font-semibold">{ch.name}</span>
                      </div>
                      <span className="text-white/35 text-xs">Live Now</span>
                    </div>
                    <span className="text-white/25 ml-auto text-sm">›</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {liveTab !== 'scores' && !liveLoading && liveVideos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {liveVideos.map(video => {
                const initial = video.channelTitle?.[0]?.toUpperCase() || '?';
                const avatarColors = ['bg-red-700','bg-blue-700','bg-amber-700','bg-green-700','bg-purple-700','bg-teal-700','bg-pink-700'];
                const avatarColor = avatarColors[(video.channelTitle?.charCodeAt(0) || 0) % avatarColors.length];
                return (
                  <div key={video.id} className="group cursor-pointer" onClick={() => window.open(video.watchUrl, '_blank')}>
                    <div className="relative overflow-hidden rounded-2xl border border-white/10 group-hover:border-orange-500/40 transition-all">
                      <div className="relative w-full aspect-video">
                        {video.thumbnailUrl ? (
                          <>
                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded"><span className="w-1.5 h-1.5 bg-white rounded-full inline-block animate-pulse"></span>LIVE</div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-b from-zinc-800 to-zinc-900 flex items-center justify-center">
                            <span className="text-4xl opacity-60">📺</span>
                          </div>
                        )}

                      </div>
                      <div className="p-3 bg-zinc-900/90">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-white text-xs font-bold px-2 py-0.5 rounded-full bg-red-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-white rounded-full inline-block"></span>LIVE</span>
                            <span className={`text-white text-xs font-bold px-2 py-0.5 rounded-full ${liveTab === 'news' ? 'bg-blue-600' : 'bg-green-700'}`}>{liveTab === 'news' ? 'News' : 'Sports'}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-5 h-5 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>{initial}</div>
                            <p className="text-white/50 text-xs truncate">{video.channelTitle}</p>
                          </div>
                          <p className="text-white text-sm font-bold leading-snug line-clamp-2 mb-3">{decodeHtml(video.title)}</p>
                        </div>
                        <div className="bg-gradient-to-r from-orange-600 to-yellow-400 rounded-full py-1.5 text-center">
                          <span className="text-black text-xs font-bold">▶ Watch Live</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

          </div>

        {/* Genre Browse */}
        <div id="genre-section" className="mb-8">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-white">Browse by Genre</h2>
              <p className="text-white/40 text-sm mt-1">Find free movies by mood, category, or what you feel like watching.</p>
            </div>
            {activeGenre && (
              <button onClick={handleReset} className="text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors mt-1 flex items-center gap-1">
                ✕ Reset
              </button>
            )}
          </div>
          <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
            {GENRES.map(genre => (
              <button key={genre.name} onClick={() => handleGenreClick(genre)}
                className="cursor-pointer group flex flex-col">
                <div className={`relative h-24 rounded-xl overflow-hidden w-full transition-all ${activeGenre === genre.name ? 'ring-2 ring-orange-500 shadow-[0_0_20px_rgba(234,88,12,0.4)]' : 'hover:ring-2 hover:ring-orange-500/60'}`}>
                  <img src={`https://i.ytimg.com/vi/${genre.thumb}/maxresdefault.jpg`} alt={genre.name}
                    className="absolute inset-0 w-full h-full object-cover object-top" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                <div className="mt-2 text-center px-1">
                  <p className={`text-xs font-semibold leading-tight ${activeGenre === genre.name ? 'text-orange-400' : 'text-white/80'}`}>{genre.name}</p>
                  <p className="text-white/35 text-xs mt-0.5">{genre.count} titles</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        {/* Add-On Channels */}
        <div id="channels-section" className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white">Add-On Channels 🏆</h2>
          </div>
          <p className="text-white/40 text-sm mb-5">Premium channels. No cable required. Cancel anytime.</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-4">
            {CHANNELS.map(channel => (
              <div key={channel.name} className="bg-white/5 border border-white/10 hover:border-orange-500/40 rounded-2xl p-4 flex flex-col items-center gap-3 transition-all group">
                <div className={`w-14 h-14 rounded-xl ${channel.color} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-sm font-black text-center leading-tight px-1">{channel.short}</span>
                </div>
                <div className="text-center">
                  <p className="text-white text-xs font-bold">{channel.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{channel.desc}</p>
                </div>
                <a href={channel.url} target="_blank" rel="noopener noreferrer"
                  className="bg-transparent border border-orange-500/50 text-orange-400 hover:bg-orange-500/10 text-xs font-bold px-4 py-1.5 rounded-full transition-all w-full text-center">
                  Explore
                </a>
              </div>
            ))}
          </div>
        </div>

        <div id="results-section"></div>
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



        {!loading && gridMovies.length === 0 && searchedFor && !pickResult && (
          <div className="text-center py-20 text-white/40">
            <p>No results found. Try a different search.</p>
          </div>
        )}
      </main>
    </div>
  );
}
