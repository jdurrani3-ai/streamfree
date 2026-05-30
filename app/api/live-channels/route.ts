import { NextResponse } from 'next/server';
import { LIVE_CHANNELS } from '../../../data/live-channels';

export const revalidate = 86400;

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;

  const results = await Promise.all(
    LIVE_CHANNELS.map(async (ch) => {
      if (ch.thumbnail) return ch;
      if (!apiKey) return { ...ch, thumbnail: null };
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${ch.handle}&key=${apiKey}`
        );
        const data = await res.json();
        const item = data.items?.[0];
        const thumbnail = item?.snippet?.thumbnails?.high?.url ||
                         item?.snippet?.thumbnails?.default?.url || null;
        return { ...ch, thumbnail };
      } catch {
        return { ...ch, thumbnail: null };
      }
    })
  );

  return NextResponse.json(results);
}
