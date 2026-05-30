import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return NextResponse.json([]);
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`);
    const data = await res.json();
    const movies = (data.results || []).slice(0, 12);
    const withTrailers = await Promise.all(
      movies.map(async (movie: { id: number; title: string; poster_path: string; release_date: string; vote_average: number }) => {
        try {
          const vRes = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?api_key=${apiKey}&language=en-US`);
          const vData = await vRes.json();
          const trailer = (vData.results || []).find((v: { type: string; site: string; key: string }) => v.type === 'Trailer' && v.site === 'YouTube');
          if (!trailer) return null;
          return {
            id: movie.id,
            title: movie.title,
            poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            year: movie.release_date ? movie.release_date.slice(0, 4) : null,
            rating: Math.round(movie.vote_average * 10) / 10,
            youtubeKey: trailer.key,
          };
        } catch { return null; }
      })
    );
    return NextResponse.json(withTrailers.filter(Boolean));
  } catch {
    return NextResponse.json([]);
  }
}
