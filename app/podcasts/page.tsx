'use client';
import { useState, useEffect } from 'react';

type PodcastItem = {
  id: string; title: string; type: string;
  image: string | null; publisher: string | null;
  embedUrl: string; description: string | null;
  duration?: string | null; releaseDate?: string | null;
};

function formatDate(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PodcastsPage() {
  const [query, setQuery] = useState('');
  const [shows, setShows] = useState<PodcastItem[]>([]);
  const [episodes, setEpisodes] = useState<PodcastItem[]>([]);
  const [selected, setSelected] = useState<PodcastItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'shows' | 'episodes'>('shows');
  const [searched, setSearched] = useState(false);
  const [showTitle, setShowTitle] = useState<string | null>(null);

  useEffect(() => { doSearch('technology business true crime comedy', true); }, []);

  async function doSearch(q: string, isDefault = false) {
    if (!q.trim()) return;
    setLoading(true); setSearched(true); setShowTitle(null);
    setActiveTab('shows');
    try {
      const res = await fetch(`/api/podcast-search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setShows(data.shows || []);
      setEpisodes(data.episodes || []);
      if (isDefault) {
        const first = data.shows?.[0] || data.episodes?.[0];
        if (first) setSelected(first);
      }
    } catch { } finally { setLoading(false); }
  }

  async function loadShowEpisodes(show: PodcastItem) {
    setSelected(show);
    setActiveTab('episodes');
    setShowTitle(show.title);
    setLoading(true);
    try {
      const res = await fetch(`/api/podcast-search?showId=${show.id}`);
      const data = await res.json();
      setEpisodes(data.episodes || []);
      if (data.episodes?.[0]) setSelected(data.episodes[0]);
    } catch { } finally { setLoading(false); }
  }

  const items = activeTab === 'shows' ? shows : episodes;

  return (
    <div className="min-h-screen text-white" style={{background:'linear-gradient(135deg,#0d1117 0%,#0a0a0f 50%,#111318 100%)'}}>
      <header className="border-b border-white/10 px-6 py-4 sticky top-0 z-50 backdrop-blur-md bg-black/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="StreamFree" className="h-10 w-10 object-contain" />
            <span className="text-3xl font-bold"><span className="text-white">Stream</span><span className="bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">Free</span></span>
          </a>
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm font-semibold">🎙️ Podcasts</span>
            <a href="/" className="text-white/40 hover:text-white/70 text-sm transition-colors">← Back to Home</a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">🎙️ Podcasts</h1>
          <p className="text-white/40 text-sm">Full episodes, completely free. Powered by Spotify.</p>
        </div>

        <div className="relative max-w-2xl mb-8">
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch(query)}
            placeholder="Search podcasts, shows, topics..."
            className="w-full bg-white/5 border border-white/15 rounded-2xl px-5 py-4 text-white placeholder-white/30 text-sm focus:outline-none focus:border-green-500/50 pr-28" />
          <button onClick={() => doSearch(query)} disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all disabled:opacity-50">
            {loading ? '...' : 'Search'}
          </button>
        </div>

        {selected && (
          <div className="mb-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <iframe src={`${selected.embedUrl}?utm_source=generator&theme=0`}
                width="100%" height="152" frameBorder={0}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy" className="block" />
            </div>
            <p className="text-white/25 text-xs mt-2">Spotify controls playback. Some actions may open the Spotify app.</p>
          </div>
        )}

        {searched && (
          <>
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              <button onClick={() => setActiveTab('shows')}
                className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${activeTab === 'shows' ? 'border-green-500 bg-green-500/15 text-white' : 'border-white/15 bg-white/5 text-white/50 hover:border-white/30'}`}>
                🎙️ Shows
              </button>
              <button onClick={() => setActiveTab('episodes')}
                className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${activeTab === 'episodes' ? 'border-green-500 bg-green-500/15 text-white' : 'border-white/15 bg-white/5 text-white/50 hover:border-white/30'}`}>
                🎧 Episodes {showTitle && <span className="text-white/40 text-xs ml-1">— {showTitle}</span>}
              </button>
              {showTitle && (
                <button onClick={() => { setShowTitle(null); setActiveTab('shows'); }}
                  className="text-white/30 hover:text-white/60 text-xs transition-colors">
                  ✕ Clear show
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-white/40 text-sm">Loading...</p>
              </div>
            ) : items.length === 0 ? (
              <p className="text-white/30 text-sm py-8">No results. Try a different search.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {items.map(item => (
                  <div key={item.id}
                    onClick={() => item.type === 'show' ? loadShowEpisodes(item) : setSelected(item)}
                    className={`group cursor-pointer rounded-2xl border overflow-hidden transition-all ${selected?.id === item.id ? 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'border-white/10 hover:border-green-500/50'}`}>
                    <div className="aspect-square bg-zinc-900 relative overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-900 to-zinc-900 flex items-center justify-center">
                          <span className="text-4xl">🎙️</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                        <div className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                          {item.type === 'show' ? '▶ View Episodes' : '▶ Listen'}
                        </div>
                      </div>
                      {selected?.id === item.id && <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>}
                    </div>
                    <div className="p-3 bg-zinc-900/80">
                      <p className="text-white text-xs font-bold line-clamp-2 mb-1">{item.title}</p>
                      {item.publisher && <p className="text-white/40 text-xs truncate">{item.publisher}</p>}
                      <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                        <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded-full">
                          {item.type === 'show' ? 'Show' : 'Episode'}
                        </span>
                        {item.duration && <span className="text-xs text-white/30">{item.duration}</span>}
                      </div>
                      {item.releaseDate && (
                        <p className="text-white/25 text-xs mt-1">📅 {formatDate(item.releaseDate)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}