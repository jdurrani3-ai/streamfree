import { NextRequest, NextResponse } from 'next/server';

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

const cache: Record<string, { data: LiveVideo[]; ts: number }> = {};
const TTL = 20 * 60 * 1000;

const QUERIES: Record<string, string> = {
  news: 'live news',
  sports: 'sports talk live OR live sports news OR sports commentary live',
};

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get('category') || 'news';
  if (!['news', 'sports'].includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  const cached = cache[category];
  if (cached && Date.now() - cached.ts < TTL) {
    return NextResponse.json(cached.data);
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API not configured' }, { status: 500 });
  }

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('q', QUERIES[category]);
    url.searchParams.set('type', 'video');
    url.searchParams.set('eventType', 'live');
    url.searchParams.set('regionCode', 'US');
    url.searchParams.set('relevanceLanguage', 'en');
    url.searchParams.set('safeSearch', 'moderate');
    url.searchParams.set('maxResults', '10');
    url.searchParams.set('key', apiKey);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (!res.ok) {
      console.error('YouTube Live API error:', data.error?.message);
      return NextResponse.json([], { status: 200 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const videos: LiveVideo[] = (data.items || []).map((item: any) => ({
      id: item.id.videoId,
      provider: 'youtube',
      type: 'live',
      category,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnailUrl:
        item.snippet.thumbnails?.high?.url ||
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url || '',
      watchUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      isLive: true,
      source: 'youtube',
      region: 'US',
    }));

    cache[category] = { data: videos, ts: Date.now() };
    return NextResponse.json(videos);
  } catch (err) {
    console.error('youtube-live error:', err);
    return NextResponse.json([]);
  }
}
