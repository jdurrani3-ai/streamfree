# StreamFree Dev Context
Last commit: 7c1b197
Live: https://streamfree-six.vercel.app
Repo: github.com/jdurrani3-ai/streamfree

## APIs (keys in .env.local and Vercel env vars)
- YouTube, Anthropic, OMDB, Watchmode, TMDB
- SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET (rotate credentials — shared in chat)

## Completed
- Phase 1: Nav bar
- Phase 2: Hero redesign
- Phase 3: Cinematic genre grid
- Phase 4: Live TV & Add-On Channels
- TMDB trailer section
- AI search bar removed (restore from commit 9e0dd07)
- Trailers: blended popular + now_playing, 24h cache, NEW badges, Updated Daily label
- Live Channels: 20 hardcoded channels across 5 categories
- Unified data/live-channels.ts — one line per channel going forward
- All thumbnails hardcoded — zero API dependency
- Sports bleed into Live Channels tab fixed
- Orphaned search icon removed from nav
- Scrolling ticker banner — orange gradient, above nav
- Recently Added panel — deep links, 30-day expiry, pulsing dot
- Nav: Channels renamed to Add-On Channels
- Podcasts page (/podcasts) — Spotify search, shared iframe player, show drill-down, air dates

## Pending
- AI Pick orphaned section cleanup
- TMDB expand (replace OMDB, trending)
- FilmRise YouTube channels
- Live Channels tab button visual enhancement
- Rotate Spotify credentials (CLIENT_ID + CLIENT_SECRET exposed in chat)

## Workflows
- Add channel: name + @handle/live + category → I get thumbnail URL → one line in data/live-channels.ts
- Add to Recently Added: "Add to Recently Added: [title] | [desc] | [type] | [sectionId]"
- Update ticker: "Update banner text to: [message]"

## Terminal rules
- node terminal = npm run dev (start/stop only)
- zsh terminal = everything else
