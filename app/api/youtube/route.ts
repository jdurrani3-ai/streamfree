import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const apiKey = process.env.YOUTUBE_API_KEY;

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
    const movies = (data.items || []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      channel: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      youtubeUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    }));

    return NextResponse.json({ movies });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}