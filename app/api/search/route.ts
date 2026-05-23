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
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: `Convert this movie search into a short YouTube search query.

User: "${query}"

Reply ONLY with this JSON, nothing else:
{"searchQuery": "2-4 word YouTube search terms"}

Rules: extract actors, genres, themes. No words like free, full movie, watch online.`
          }
        ]
      })
    });

    const data = await response.json();
    const content = data.content?.[0]?.text;
    if (!content) throw new Error('No AI response');

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ searchQuery: '' });
  }
}