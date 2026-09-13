# Podcast Integration TODO

**Decision:** Add.  
**Status:** ✅ Core one-click podcast bank added 13 September 2026.
**Topic bank:** tabletop RPGs, dice mechanics, probability in games, RPG/game design, dungeon mastering.

## TODO
- [x] Use the shared 25-episode D&D/RPG Spotify bank for tabletop/game-design listening.
- [x] Add a collapsed bottom dock: **🎲 Listen to a different tabletop podcast**.
- [x] One tap selects/loads another episode; persist recent choices and avoid immediate repeats.
- [x] Use Spotify embed/deep links without assuming autoplay.
- [x] Shared tags cover RPG systems, DM advice, encounters and game design; a dedicated dice/probability sub-bank can be added later if needed.
- [x] Collapse automatically when standard HTML game audio/video begins.
- [x] Keep dice/game controls primary through the collapsed dock design.
- [x] Shared dock supplies mobile/a11y, reduced-motion and persistence behaviour; app-specific tests can be added later.

## Implementation
The Vite shell loads JoshHub's shared `dnd` catalogue through `podcast-dock-universal.js`.
