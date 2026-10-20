# Safe Zones — spec feed

© 2026 Edgar Febus. All rights reserved.

`specs-feed.json` is read by the Safe Zones panel (After Effects, Premiere Pro,
Illustrator, Photoshop) when it opens. When Meta or TikTok change their ad safe
zones, this file is updated and the panel offers the new specs with one click.

- `specsVersion` — date of the spec data (YYYY-MM-DD). Bump it on every change.
- `changes` — one line per change, newest last; shown in the panel's banner.
- `panel.latest` — newest panel version; older panels show an update notice.
- `specs` — margins as fractions of the frame (0–1). The panel rejects values
  outside safe ranges, so a typo can't break anyone's overlays.
