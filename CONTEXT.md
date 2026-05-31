# StreamFree Dev Context
Last commit: aa5514a
Live: https://streamfree-six.vercel.app
Repo: github.com/jdurrani3-ai/streamfree

## APIs (keys in .env.local and Vercel env vars)
- YouTube, Anthropic, OMDB, Watchmode, TMDB

## Completed
- Phase 1: Nav bar
- Phase 2: Hero redesign
- Phase 3: Cinematic genre grid
- Phase 4: Live TV & Add-On Channels
- TMDB trailer section
- AI search bar removed (restore from commit 9e0dd07)
- Trailers: blended popular + now_playing, 24h cache, NEW badges, Updated Daily label
- Live Channels: 20 hardcoded channels across 5 categories (Gaming, Nature & Wildlife, Racing & Motors, Travel, Science & Space)
- Unified data/live-channels.ts — one line per channel going forward
- All thumbnails hardcoded — zero API dependency
- Sports bleed into Live Channels tab fixed
- Orphaned search icon removed from nav

## Pending
- AI Pick orphaned section cleanup
- TMDB expand (replace OMDB, trending)
- FilmRise YouTube channels
- Live Channels tab button visual enhancement (show category emojis as preview)

## Adding new channels (workflow)
1. Get: channel name + @handle/live URL + category
2. Run curl to get thumbnail URL
3. Add one line to data/live-channels.ts
4. git add -A && git commit && git push

## Terminal rules
- node terminal = npm run dev (server commands only)
- zsh terminal = everything else (git, curl, cat, node patch.js)
