import { NextResponse } from 'next/server';

export const revalidate = 86400;

const CHANNELS = [
  { handle: 'ESLCS', name: 'ESL Counter-Strike', short: 'ESL', type: 'Esports', url: 'https://www.youtube.com/@ESLCS/live' },
  { handle: 'VALORANTesports', name: 'VALORANT Esports', short: 'VCT', type: 'Esports', url: 'https://www.youtube.com/@VALORANTesports/live' },
  { handle: 'riotgames', name: 'Riot Games', short: 'RIOT', type: 'Official', url: 'https://www.youtube.com/@riotgames/live' },
  { handle: 'Nintendo', name: 'Nintendo', short: 'NIN', type: 'Official', url: 'https://www.youtube.com/@Nintendo/live' },
  { handle: 'Xbox', name: 'Xbox', short: 'XBX', type: 'Official', url: 'https://www.youtube.com/@Xbox/live' },
  { handle: 'PlayStation', name: 'PlayStation', short: 'PS', type: 'Official', url: 'https://www.youtube.com/@PlayStation/live' },
  { handle: 'TypicalGamer', name: 'Typical Gamer', short: 'TG', type: 'Streamer', url: 'https://www.youtube.com/@TypicalGamer/live' },
  { handle: 'shroud', name: 'Shroud', short: 'SHR', type: 'Streamer', url: 'https://www.youtube.com/@shroud/live' },
  { handle: 'MrBeastGaming', name: 'MrBeast Gaming', short: 'MRB', type: 'Streamer', url: 'https://www.youtube.com/@MrBeastGaming/live' },
  { handle: 'PGLesports', name: 'PGL Esports', short: 'PGL', type: 'Esports', url: 'https://www.youtube.com/@PGLesports/live' },
];

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return NextResponse.json(CHANNELS.map(ch => ({ ...ch, thumbnail: null })));
  try {
    const results = await Promise.all(
      CHANNELS.map(async (ch) => {
        try {
          const res = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=snippet&forHandle=${ch.handle}&key=${apiKey}`
          );
          const data = await res.json();
          const item = data.items?.[0];
          const thumbnail = item?.snippet?.thumbnails?.high?.url || item?.snippet?.thumbnails?.default?.url || null;
          return { ...ch, thumbnail };
        } catch {
          return { ...ch, thumbnail: null };
        }
      })
    );
    return NextResponse.json(results);
  } catch {
    return NextResponse.json(CHANNELS.map(ch => ({ ...ch, thumbnail: null })));
  }
}
