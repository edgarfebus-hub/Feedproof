# Feedproof — spec feeds

© 2026 Edgar Febus. All rights reserved.

Three files, one per panel generation:

- `feedproof-specs.json` — Feedproof v1.3+ (Meta, TikTok, YouTube, LinkedIn). These panels skip any
  platform they don't know, so new platforms can be added here safely.
- `feedproof-feed.json` — Feedproof v1.2.x. Same data **without LinkedIn** (those panels reject
  unknown platforms).
- `specs-feed.json` — Safe Zones v1.1.x. **Meta and TikTok only.**

When a platform changes its ad safe zones, update every file that carries that platform.

- `specsVersion` — date of the spec data (YYYY-MM-DD). Bump it on every change.
- `changes` — one line per change, newest last; shown in the panel's banner.
- `panel.latest` — newest panel version; older panels show an update notice.
- `specs` — margins as fractions of the frame (0–1). The panel rejects values
  outside safe ranges, so a typo can't break anyone's overlays.
