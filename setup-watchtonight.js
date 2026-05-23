const fs = require('fs');
const path = require('path');

const content = `import { NextRequest, NextResponse } from 'next/server';

const FREE_MOVIES = [
  { id: 'FlOra-dwLzg', title: 'Wrath of Man', genre: 'action thriller revenge', rating: 'R', duration: '1h 59m' },
  { id: 'BqluXcZ9RyU', title: 'Honest Thief', genre: 'action romance crime', rating: 'PG-13', duration: '1h 39m' },
  { id: 'SebuC1iyhug', title: 'First Blood', genre: 'action drama intense', rating: 'R', duration: '1h 33m' },
  { id: 'AaJyi4z4JHw', title: 'London Has Fallen', genre: 'action thriller political', rating: 'R', duration: '1h 39m' },
  { id: 'nzn1m-hbPYw', title: 'Bumblebee', genre: 'sci-fi family adventure fun', rating: 'PG-13', duration: '1h 54m' },
  { id: 'K4zHXPQApic', title: 'The Chronicles of Riddick', genre: 'sci-fi action epic', rating: 'PG-13', duration: '1h 59m' },
  { id: 'naG_MI5dsbo', title: 'Payback', genre: 'crime action dark revenge', rating: 'R', duration: '1h 40m' },
  { id: 'kgIjLBjyvNM', title: 'Death Wish', genre: 'action crime vigilante intense', rating: 'R', duration: '1h 47m' },
  { id: '6-JkDTqFLEQ', title: 'Hellboy II: The Golden Army', genre: 'fantasy action dark humor', rating: 'PG-13', duration: '2h' },
  { id: 'gNK-Yr8ktgM', title: 'The Spy Next Door', genre: 'comedy action family light fun', rating: 'PG', duration: '1h 34m' },
  { id: 'EMvIgNcej-w', title: 'Blitz', genre: 'crime thriller dark gritty', rating: 'R', duration: '1h 37m' },
  { id: 'mAVs05GzChs', title: 'Evolution', genre: 'sci-fi comedy light fun', rating: 'PG-13', duration: '1h 41m' },
  { id: 'fzfMsnqD-yM', title: 'Survivor', genre: 'action thriller suspense', rating: 'PG-13', duration: '1h 36m' },
  { id: 'dygYCbG-jNk', title: 'A-X-L', genre: 'sci-fi family adventure heartwarming', rating: 'PG', duration: '1h 38m' },
];

export async function POST(request: NextRequest) {
  try {
    const { mood } = await request.json();
    if (!mood) return NextResponse.json({ error: 'Mood required' }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'API key not configured' }, { status: 500 });

    const movieList = FREE_MOVIES.map(m =>
      \`- ID:\${m.id} | \${m.title} | \${m.genre} | \${m.rating} | \${m.duration}\`
    ).join('\\n');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: \`You are a movie recommendation expert. A person wants to watch a free movie right now.

Their mood: "\${mood}"

Available free movies:
\${movieList}

Pick the ONE movie that best matches their mood. Reply ONLY with this JSON, nothing else:
{
  "id": "the_youtube_video_id",
  "title": "Movie Title",
  "reason": "One punchy sentence explaining why this is the perfect pick for their mood"
}\`
        }]
      })
    });

    const data = await response.json();
    const content = data.content?.[0]?.text;
    if (!content) throw new Error('No AI response');

    const picked = JSON.parse(content.trim());
    const movie = FREE_MOVIES.find(m => m.id === picked.id);

    return NextResponse.json({
      id: picked.id,
      title: picked.title,
      reason: picked.reason,
      rating: movie?.rating || null,
      duration: movie?.duration || null,
      thumbnail: \`https://i.ytimg.com/vi/\${picked.id}/maxresdefault.jpg\`,
      youtubeUrl: \`https://www.youtube.com/watch?v=\${picked.id}\`,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to pick a movie' }, { status: 500 });
  }
}
`;

const targetPath = path.join(process.cwd(), 'app', 'api', 'watchtonight', 'route.ts');
fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, content, 'utf8');
console.log('✅ watchtonight/route.ts written successfully!');
