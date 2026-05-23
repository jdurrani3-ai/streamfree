import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });

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
        messages: [
          {
            role: 'user',
            content: `Analyze this movie request and respond with JSON only.

User query: "${query}"

Rules:
- intent = "pick" if the user describes a mood, feeling, or vague preference (e.g. "something funny", "I want a thriller tonight", "light and easy")
- intent = "search" if the user mentions a specific actor, title, genre, era, or detailed preference
- searchQuery = 2-4 optimized YouTube search words (no "free", "full movie", "watch online")
- If intent is "pick", also include a pick object from this catalog:
  [{"id":"FlOra-dwLzg","title":"Wrath of Man","genre":"action thriller"},{"id":"BqluXcZ9RyU","title":"Honest Thief","genre":"action romance"},{"id":"SebuC1iyhug","title":"First Blood","genre":"action drama"},{"id":"nzn1m-hbPYw","title":"Bumblebee","genre":"sci-fi family"},{"id":"K4zHXPQApic","title":"The Chronicles of Riddick","genre":"sci-fi action"},{"id":"naG_MI5dsbo","title":"Payback","genre":"crime action"},{"id":"gNK-Yr8ktgM","title":"The Spy Next Door","genre":"comedy family"},{"id":"mAVs05GzChs","title":"Evolution","genre":"sci-fi comedy"},{"id":"EMvIgNcej-w","title":"Blitz","genre":"crime thriller"},{"id":"dygYCbG-jNk","title":"A-X-L","genre":"sci-fi family"}]

Reply ONLY with JSON:
{
  "intent": "search" or "pick",
  "searchQuery": "youtube search terms",
  "pick": { "id": "...", "title": "...", "reason": "one sentence why this matches their mood" }
}
(include "pick" field only when intent is "pick")`
          }
        ]
      })
    });

    const data = await response.json();
    const content = data.content?.[0]?.text;
    if (!content) throw new Error('No AI response');

    const parsed = JSON.parse(content.trim());
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ searchQuery: '', intent: 'search' });
  }
}
