# Feedproof — spec feeds

© 2026 Edgar Febus. All rights reserved.

`feedproof-feed.json` is read by the Feedproof panel (formerly Safe Zones) when it
opens. When Meta, TikTok or YouTube change their ad safe zones, this file is
updated and the panel offers the new specs with one click.

`specs-feed.json` is the same data without YouTube, kept for Safe Zones v1.1.x
panels (their strict check rejects platforms they don't know).

- `specsVersion` — date of the spec data (YYYY-MM-DD). Bump it on every change.
- `changes` — one line per change, newest last; shown in the panel's banner.
- `panel.latest` — newest panel version; older panels show an update notice.
- `specs` — margins as fractions of the frame (0–1). The panel rejects values
  outside safe ranges, so a typo can't break anyone's overlays.
