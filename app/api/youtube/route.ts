import { NextRequest, NextResponse } from 'next/server';

function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return hours * 60 + minutes + Math.round(seconds / 60);
}

function cleanTitle(title: string): string {
  return title.split(/[|\-–]/)[0].trim().replace(/\s*\(.*?\)\s*/g, '').trim();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const apiKey = process.env.YOUTUBE_API_KEY;
  const omdbKey = process.env.OMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 });
  }

  const searchQuery = `${query} full movie free`;

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', searchQuery);
    url.searchParams.set('type', 'video');
    url.searchParams.set('videoType', 'movie');
    url.searchParams.set('videoDuration', 'long');
    url.searchParams.set('maxResults', '20');
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'YouTube API error' }, { status: response.status });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = data.items || [];
    const videoIds = items.map((item: any) => item.id.videoId).filter(Boolean).join(',');

    // Fetch durations
    let durationsMap: Record<string, number> = {};
    if (videoIds) {
      const detailsUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
      detailsUrl.searchParams.set('part', 'contentDetails');
      detailsUrl.searchParams.set('id', videoIds);
      detailsUrl.searchParams.set('key', apiKey);
      const detailsResponse = await fetch(detailsUrl.toString());
      const detailsData = await detailsResponse.json();
      if (detailsResponse.ok && detailsData.items) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        detailsData.items.forEach((item: any) => {
          durationsMap[item.id] = parseDuration(item.contentDetails?.duration || '');
        });
      }
    }

    // Fetch OMDB ratings in parallel
    let ratingsMap: Record<string, string> = {};
    if (omdbKey && items.length > 0) {
      const ratingPromises = items.map(async (item: any) => {
        const title = cleanTitle(item.snippet.title);
        try {
          const res = await fetch(
            `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${omdbKey}`
          );
          const omdb = await res.json();
          return { id: item.id.videoId, rating: omdb.Rated || null };
        } catch {
          return { id: item.id.videoId, rating: null };
        }
      });
      const ratings = await Promise.all(ratingPromises);
      ratings.forEach(({ id, rating }) => {
        if (rating && rating !== 'N/A') ratingsMap[id] = rating;
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const movies = items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      channel: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      year: new Date(item.snippet.publishedAt).getFullYear(),
      durationMinutes: durationsMap[item.id.videoId] || null,
      rating: ratingsMap[item.id.videoId] || null,
      youtubeUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    return NextResponse.json({ movies });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}