import { NextResponse } from 'next/server';

export const revalidate = 86400; // cache entire route response for 24h at the edge

type TMDBMovie = {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
  vote_average: number;
};

type TMDBVideo = {
  type: string;
  site: string;
  key: string;
};

function recencyScore(releaseDate: string): number {
  if (!releaseDate) return 0;
  const daysSince = (Date.now() - new Date(releaseDate).getTime()) / 86400000;
  return Math.max(0, 1 - daysSince / 180); // 1.0 = today, 0 = 180+ days ago
}

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json({ movies: [], refreshedAt: null });

  try {
    // Fetch popular + now_playing in parallel
    const [popularRes, nowPlayingRes] = await Promise.all([
      fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`),
      fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`),
    ]);

    const [popularData, nowPlayingData] = await Promise.all([
      popularRes.json(),
      nowPlayingRes.json(),
    ]);

    // Merge + dedupe by id
    const seen = new Set<number>();
    const combined: TMDBMovie[] = [];

    for (const movie of [
      ...(popularData.results || []).slice(0, 10),
      ...(nowPlayingData.results || []).slice(0, 10),
    ]) {
      if (!seen.has(movie.id)) {
        seen.add(movie.id);
        combined.push(movie);
      }
    }

    // Composite sort: 60% rating, 40% recency
    combined.sort((a, b) => {
      const scoreA = (a.vote_average / 10) * 0.6 + recencyScore(a.release_date) * 0.4;
      const scoreB = (b.vote_average / 10) * 0.6 + recencyScore(b.release_date) * 0.4;
      return scoreB - scoreA;
    });

    // Fetch top 14 (buffer for missing trailers), video calls in parallel
    const top14 = combined.slice(0, 14);

    const withTrailers = await Promise.all(
      top14.map(async (movie) => {
        try {
          const vRes = await fetch(
            `https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${apiKey}&language=en-US`
          );
          const vData = await vRes.json();
          const trailer = (vData.results || []).find(
            (v: TMDBVideo) => v.type === 'Trailer' && v.site === 'YouTube'
          );
          if (!trailer) return null;
          return {
            id: movie.id,
            title: movie.title,
            poster: movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : null,
            year: movie.release_date?.slice(0, 4) ?? null,
            rating: Math.round(movie.vote_average * 10) / 10,
            youtubeKey: trailer.key,
            isNew: recencyScore(movie.release_date) > 0.85, // released within ~54 days
          };
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json({
      movies: withTrailers.filter(Boolean).slice(0, 12),
      refreshedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ movies: [], refreshedAt: null });
  }
}