import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

// NullRig walkthrough: the NullRig v1.0 panel interface, driven by a scripted cursor,
// next to a Premiere-style Program Monitor and timeline with four video clips.
const PANEL_HTML: string = "<!DOCTYPE html>\n\n<html>\n<head>\n  <meta charset=\"utf-8\" />\n  <style>.vrow input{background:#1a1a1a;color:#d6d6d6;border:1px solid #3a3a3a;border-radius:3px;padding:2px 4px;font-size:11px}html{scrollbar-width:none}::-webkit-scrollbar{display:none}body{--uxp-host-background-color:#232323;font-family:-apple-system,'Segoe UI','Inter',sans-serif}\n    :root {\n      --bg: var(--uxp-host-background-color, #232323);\n      --fg: var(--uxp-host-text-color, #d6d6d6);\n      --muted: #8c8c8c;\n      --line: #3a3a3a;\n      --field: #1a1a1a;\n      --accent: #5ccd74;\n      --ok: #59c26b;\n      --err: #ff6b6b;\n    }\n    html, body { height: 100%; overflow: hidden; }\n    body { background: var(--bg); color: var(--fg); font-size: 11px; margin: 0; padding: 0; font-family: sans-serif; }\n    .scroller { height: 100%; overflow-y: auto; overflow-x: hidden; }\n    .wrap { padding: 10px 12px 4px 12px; }\n    .head { display: flex; flex-direction: row; align-items: center; margin-bottom: 10px; }\n    .count { flex: 1; font-size: 12px; }\n    select { background: var(--field); color: var(--fg); border: 1px solid var(--line); border-radius: 3px; padding: 2px 4px; font-size: 10px; }\n    .s { display: flex; flex-direction: row; align-items: center; margin-bottom: 9px; }\n    .s label { width: 58px; color: var(--muted); }\n    .track { flex: 1; position: relative; height: 18px; margin: 0 8px 0 2px; cursor: ew-resize; }\n    .track .rail { position: absolute; left: 0; right: 0; top: 8px; height: 2px; background: #4a4a4a; }\n    .track .fill { position: absolute; top: 8px; height: 2px; background: var(--accent); }\n    .track .zero { position: absolute; top: 5px; width: 1px; height: 8px; background: #6a6a6a; }\n    .track .thumb { position: absolute; top: 3px; width: 12px; height: 12px; margin-left: -6px; border-radius: 6px; background: #e6e6e6; }\n    .scrub { cursor: ew-resize; }\n    .s input[type=number] { width: 50px; background: var(--field); color: var(--fg); border: 1px solid var(--line); border-radius: 3px; padding: 2px 4px; font-size: 11px; }\n    .s .r { width: 18px; margin-left: 4px; color: var(--muted); cursor: pointer; text-align: center; }\n    .uni { display: flex; flex-direction: row; align-items: center; margin: -4px 0 9px 76px; color: var(--muted); font-size: 10px; }\n    .hidden { display: none; }\n    .btns { display: flex; flex-direction: row; margin-top: 4px; }\n    button { flex: 1; background: #3b3b3b; color: var(--fg); border: 1px solid #4a4a4a; border-radius: 3px; padding: 6px 8px; font-size: 11px; cursor: pointer; margin-right: 6px; }\n    button:last-child { margin-right: 0; }\n    button.primary { background: var(--accent); border-color: var(--accent); color: #0e0f11; font-weight: 600; }\n    .hint { color: var(--muted); font-size: 10px; line-height: 14px; margin-top: 8px; }\n    .arrhead { padding: 6px 12px 2px 12px; border-top: 1px solid var(--line); margin-top: 8px; }\n    .arrhead a { color: var(--fg); cursor: pointer; font-size: 12px; display: inline-flex; align-items: center; gap: 6px; }\n    .arrhead .arw { font-size: 18px; line-height: 18px; width: 16px; text-align: center; color: var(--accent); }\n    .arr { padding: 2px 12px 4px 12px; }\n    .sub { color: var(--muted); font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin: 8px 0 5px 0; display: flex; flex-direction: row; align-items: center; }\n    .sub select { margin-left: 8px; text-transform: none; letter-spacing: 0; }\n    .iconrow { display: flex; flex-direction: row; align-items: center; margin-bottom: 5px; }\n    .iconrow button { flex: 1; padding: 5px 2px; margin-right: 4px; font-size: 12px; }\n    .iconrow button:last-child { margin-right: 0; }\n    .iconrow select { flex: 1; margin-right: 6px; }\n    .iconrow .lbl { color: var(--muted); font-size: 10px; margin-right: 4px; }\n    .iconrow input[type=number] { width: 38px; background: var(--field); color: var(--fg); border: 1px solid var(--line); border-radius: 3px; padding: 2px 4px; font-size: 11px; margin-right: 4px; }\n    .ck { color: var(--muted); font-size: 10px; margin-right: 6px; display: flex; flex-direction: row; align-items: center; }\n    .tiny { color: var(--muted); font-size: 10px; }\n    .stopw { width: 20px; margin-right: 2px; color: #8a8a8a; cursor: pointer; font-size: 14px; text-align: center; }\n    .stopw.on { color: var(--accent); }\n    .stopw.idle { color: transparent; cursor: default; }\n    .anchorrow { display: flex; flex-direction: row; align-items: center; margin: 2px 0 10px 0; }\n    .alabel { width: 76px; color: var(--muted); }\n    .agrid { display: flex; flex-direction: column; margin-right: 12px; }\n    .arow { display: flex; flex-direction: row; }\n    .adot { width: 8px; height: 8px; margin: 1px; border: 1px solid #6a6a6a; border-radius: 2px; cursor: pointer; }\n    .adot.on { background: #e8584d; border-color: #e8584d; }\n    .amap { position: relative; width: 160px; height: 90px; margin-left: auto; background: #151515; border: 1px solid var(--line); border-radius: 3px; overflow: hidden; cursor: crosshair; }\n    .amap div { position: absolute; }\n    .amap .mframe { border: 1px solid #5a5a5a; }\n    .amap .mclip { border: 1px solid #9a9a9a; background: rgba(255, 255, 255, 0.06); }\n    .amap .mh { height: 1px; background: #3d8bff; }\n    .amap .mv { width: 1px; background: #3d8bff; }\n    .amap .mdot { width: 7px; height: 7px; border-radius: 4px; background: #3d8bff; border: 1px solid #fff; }\n    .showanc { margin-left: auto; }\n    .anchorrow .lbl { color: var(--muted); font-size: 10px; margin-right: 4px; }\n    .anchorrow input[type=number] { width: 54px; background: var(--field); color: var(--fg); border: 1px solid var(--line); border-radius: 3px; padding: 2px 4px; font-size: 11px; margin-right: 8px; }\n    .vel { margin: 6px 0 4px 0; padding: 6px 0 2px 0; border-top: 1px solid var(--line); }\n    .vhead { color: var(--muted); font-size: 10px; margin-bottom: 4px; }\n    .vrow { display: flex; flex-direction: row; align-items: center; margin-bottom: 4px; }\n    .vl { width: 62px; color: var(--muted); font-size: 10px; }\n    .vt { color: var(--muted); font-size: 10px; margin: 0 4px 0 6px; }\n    .vu { color: #6e6e6e; font-size: 10px; margin-left: 3px; width: 28px; }\n    .vrow input, .blurrow input[type=number] { width: 62px; }\n    .vrow input:disabled { opacity: 0.35; }\n    .blurrow { align-items: center; }\n    .gtab.anim:after { content: \" \u25cf\"; color: #e8584d; }\n    .animrow { display: flex; flex-direction: row; align-items: center; margin: 2px 0 8px 0; }\n    .ck2 { display: flex; flex-direction: row; align-items: center; margin-right: 8px; font-size: 11px; }\n    .animbox { border: 1px solid var(--line); border-radius: 4px; padding: 6px 8px; margin-bottom: 8px; }\n    .sqb { flex: 0 0 30px !important; width: 30px; }\n    .gtabs { display: flex; flex-direction: row; flex-wrap: wrap; margin: 4px 0 4px 0; }\n    .gtab { color: var(--muted); font-size: 10px; padding: 2px 6px; margin: 0 2px 2px 0; border: 1px solid var(--line); border-radius: 9px; cursor: pointer; }\n    .gtab.on { color: #fff; border-color: #e8584d; background: rgba(232, 88, 77, 0.25); }\n    .graph { position: relative; height: 130px; background: #161616; border: 1px solid var(--line); border-radius: 3px; overflow: hidden; cursor: default; }\n    .gdot { position: absolute; width: 2px; height: 2px; margin: -1px 0 0 -1px; background: #4fb3ff; }\n    .gline { position: absolute; width: 2px; height: 2px; margin: -1px 0 0 -1px; background: #aaaaaa; }\n    .gzero { position: absolute; left: 0; right: 0; height: 1px; background: #2e2e2e; }\n    .gph { position: absolute; top: 0; bottom: 0; width: 1px; background: #3b82f6; }\n    .gkey { position: absolute; width: 14px; height: 14px; margin: -8px 0 0 -7px; color: #cfcfcf; font-size: 12px; line-height: 14px; text-align: center; cursor: pointer; }\n    .gkey.sel { color: var(--accent); }\n    .ghandle { position: absolute; width: 8px; height: 8px; margin: -4px 0 0 -4px; border-radius: 4px; background: #f5d547; cursor: pointer; }\n    .gempty { color: var(--muted); font-size: 10px; padding: 50px 10px 0 10px; text-align: center; }\n    .ginfo { margin: 3px 0 4px 0; min-height: 13px; }\n    .interp { display: flex; flex-direction: row; margin-bottom: 4px; }\n    .interp button { flex: 1; padding: 4px 2px; margin-right: 3px; font-size: 10px; }\n    .interp button:last-child { margin-right: 0; }\n    .keyrow { display: flex; flex-direction: row; align-items: center; padding: 2px 0; }\n    .keyrow a { flex: 1; color: var(--fg); cursor: pointer; font-family: monospace; }\n    .keyrow a.del { flex: 0; width: 18px; color: var(--muted); text-align: center; }\n    .status { padding: 7px 12px; border-top: 1px solid var(--line); color: var(--muted); font-size: 10px; min-height: 14px; margin-top: 8px; }\n    .status.ok { color: var(--ok); }\n    .status.err { color: var(--err); }\n    .foot { display: flex; flex-direction: row; padding: 0 12px 8px 12px; color: #5e5e5e; font-size: 9px; }\n    .foot span { flex: 1; }\n    .foot .brand { color: var(--accent); font-weight: normal; }\n    .adv { border-top: 1px solid var(--line); padding: 8px 12px; }\n    .adv .row { display: flex; flex-direction: row; align-items: center; margin-bottom: 6px; }\n    .adv .row label { width: 80px; color: var(--muted); }\n    .adv select { flex: 1; }\n    textarea { width: 100%; height: 160px; background: var(--field); color: var(--fg); border: 1px solid var(--line); font-family: monospace; font-size: 10px; }\n  </style>\n</head>\n<body>\n <div class=\"scroller\" id=\"scroller\">\n  <div class=\"wrap\">\n    <div class=\"head\">\n      <div class=\"count\" id=\"count\">Select clips in the timeline</div>\n      <button id=\"btnSelGroup\" class=\"hidden\" title=\"Select every clip of this NullRig group\">Select group</button>\n    </div>\n\n    <div id=\"uniformRows\">\n      <div class=\"s\"><div class=\"stopw idle\" id=\"sw_scale\" title=\"Animate this value (stopwatch)\">\u23f1</div><label id=\"scale_l\" class=\"scrub\">Scale</label><div class=\"track\" id=\"scale\"></div><input type=\"number\" id=\"scale_n\" value=\"100\" /><div class=\"r\" data-reset=\"scale\" title=\"Reset\">\u21ba</div></div>\n    </div>\n    <div id=\"splitRows\" class=\"hidden\">\n      <div class=\"s\"><div class=\"stopw idle\" id=\"sw_sw\" title=\"Animate this value (stopwatch)\">\u23f1</div><label id=\"sw_l\" class=\"scrub\">Width</label><div class=\"track\" id=\"sw\"></div><input type=\"number\" id=\"sw_n\" value=\"100\" /><div class=\"r\" data-reset=\"sw\" title=\"Reset\">\u21ba</div></div>\n      <div class=\"s\"><div class=\"stopw idle\" id=\"sw_sh\" title=\"Animate this value (stopwatch)\">\u23f1</div><label id=\"sh_l\" class=\"scrub\">Height</label><div class=\"track\" id=\"sh\"></div><input type=\"number\" id=\"sh_n\" value=\"100\" /><div class=\"r\" data-reset=\"sh\" title=\"Reset\">\u21ba</div></div>\n    </div>\n    <div class=\"uni\"><input type=\"checkbox\" id=\"uniform\" checked /><label for=\"uniform\">Uniform scale</label></div>\n\n    <div class=\"s\"><div class=\"stopw idle\" id=\"sw_x\" title=\"Animate this value (stopwatch)\">\u23f1</div><label id=\"x_l\" class=\"scrub\">Position X</label><div class=\"track\" id=\"x\"></div><input type=\"number\" id=\"x_n\" value=\"0\" /><div class=\"r\" data-reset=\"x\" title=\"Reset\">\u21ba</div></div>\n    <div class=\"s\"><div class=\"stopw idle\" id=\"sw_y\" title=\"Animate this value (stopwatch)\">\u23f1</div><label id=\"y_l\" class=\"scrub\">Position Y</label><div class=\"track\" id=\"y\"></div><input type=\"number\" id=\"y_n\" value=\"0\" /><div class=\"r\" data-reset=\"y\" title=\"Reset\">\u21ba</div></div>\n\n    <div class=\"s\"><div class=\"stopw idle\" id=\"sw_rot\" title=\"Animate this value (stopwatch)\">\u23f1</div><label id=\"rot_l\" class=\"scrub\">Rotation</label><div class=\"track\" id=\"rot\"></div><input type=\"number\" id=\"rot_n\" value=\"0\" /><div class=\"r\" data-reset=\"rot\" title=\"Reset\">\u21ba</div></div>\n    <div class=\"s\"><div class=\"stopw idle\" id=\"sw_op\" title=\"Animate this value (stopwatch)\">\u23f1</div><label id=\"op_l\" class=\"scrub\">Opacity</label><div class=\"track\" id=\"op\"></div><input type=\"number\" id=\"op_n\" value=\"100\" /><div class=\"r\" data-reset=\"op\" title=\"Reset\">\u21ba</div></div>\n\n    <div class=\"anchorrow\">\n      <span class=\"alabel\" title=\"The point the group scales and rotates around\">Anchor</span>\n      <div class=\"agrid\">\n        <div class=\"arow\"><div class=\"adot\" id=\"an_tl\"></div><div class=\"adot\" id=\"an_tc\"></div><div class=\"adot\" id=\"an_tr\"></div></div>\n        <div class=\"arow\"><div class=\"adot\" id=\"an_ml\"></div><div class=\"adot on\" id=\"an_c\"></div><div class=\"adot\" id=\"an_mr\"></div></div>\n        <div class=\"arow\"><div class=\"adot\" id=\"an_bl\"></div><div class=\"adot\" id=\"an_bc\"></div><div class=\"adot\" id=\"an_br\"></div></div>\n      </div>\n      <span class=\"lbl\">X</span><input type=\"number\" id=\"anchorX\" value=\"0\" title=\"Pixels from the group's center\" />\n      <span class=\"lbl\">Y</span><input type=\"number\" id=\"anchorY\" value=\"0\" title=\"Pixels from the group's center\" />\n    </div>\n\n    <div class=\"animrow\">\n      <label class=\"ck2\"><input type=\"checkbox\" id=\"animate\" />Animate</label>\n      <span class=\"tiny\">group keyframes \u2014 each clip's own animation is kept underneath</span>\n    </div>\n    <div class=\"animbox hidden\" id=\"animBox\">\n      <div class=\"iconrow\">\n        <button class=\"sqb\" id=\"gPrev\" title=\"Previous key\">\u25c0</button>\n        <button class=\"primary\" id=\"btnKey\" title=\"Add a key at the playhead to every animated value\">\u25c6 Key at playhead</button>\n        <button class=\"sqb\" id=\"gNext\" title=\"Next key\">\u25b6</button>\n        <button class=\"sqb\" id=\"gDel\" title=\"Delete selected key\">\u2715</button>\n      </div>\n      <div class=\"gtabs\">\n        <a class=\"gtab on\" data-gprop=\"x\">Pos X</a><a class=\"gtab\" data-gprop=\"y\">Pos Y</a>\n        <a class=\"gtab\" data-gprop=\"scale\">Scale</a><a class=\"gtab hidden\" data-gprop=\"kx\">Width</a><a class=\"gtab hidden\" data-gprop=\"ky\">Height</a>\n        <a class=\"gtab\" data-gprop=\"rot\">Rotation</a><a class=\"gtab\" data-gprop=\"op\">Opacity</a>\n      </div>\n      <div class=\"graph\" id=\"graph\"></div>\n      <div class=\"tiny ginfo\" id=\"graphInfo\"></div>\n      <div class=\"interp\">\n        <button data-interp=\"linear\" title=\"Linear\">Linear</button>\n        <button data-interp=\"bezier\" title=\"Bezier: free handles\">Bezier</button>\n        <button data-interp=\"auto\" title=\"Auto Bezier: smooth, automatic\">Auto</button>\n        <button data-interp=\"cont\" title=\"Continuous Bezier: linked handles\">Cont.</button>\n      </div>\n      <div class=\"interp\">\n        <button data-interp=\"hold\" title=\"Hold: jump to the next key\">Hold</button>\n        <button data-interp=\"easeIn\" title=\"Ease In\">Ease In</button>\n        <button data-interp=\"easeOut\" title=\"Ease Out\">Ease Out</button>\n        <button data-interp=\"ease\" title=\"Ease In + Ease Out\">Easy Ease</button>\n      </div>\n      <div class=\"vel\" id=\"velBox\">\n        <div class=\"vhead\">Keyframe velocity <span class=\"tiny\" id=\"velKey\">\u2014 click a \u25c6 key</span></div>\n        <div class=\"vrow\"><span class=\"vl\">Incoming</span><span class=\"vt\">Speed</span><input type=\"text\" id=\"vInSpeed\" /><span class=\"vu\" id=\"vInUnit\">px/s</span><span class=\"vt\">Influence</span><input type=\"text\" id=\"vInInf\" /><span class=\"vu\">%</span></div>\n        <div class=\"vrow\"><span class=\"vl\">Outgoing</span><span class=\"vt\">Speed</span><input type=\"text\" id=\"vOutSpeed\" /><span class=\"vu\" id=\"vOutUnit\">px/s</span><span class=\"vt\">Influence</span><input type=\"text\" id=\"vOutInf\" /><span class=\"vu\">%</span></div>\n      </div>\n      <div class=\"iconrow\">\n        <label class=\"ck\"><input type=\"checkbox\" id=\"gAll\" checked />Apply to all properties</label>\n        <span class=\"lbl\">New keys</span>\n        <select id=\"animDefault\"><option value=\"linear\">Linear</option><option value=\"ease\" selected>Easy Ease</option><option value=\"auto\">Auto Bezier</option></select>\n      </div>\n      <div class=\"tiny\">Click \u23f1 next to a value to start animating it \u2014 like Premiere's stopwatch. Then move the playhead and change the value to add keys. Drag a \u25c6 to retime it (Shift = time only, Alt = value only); click a \u25c6 to see its handles.</div>\n    </div>\n\n    <div class=\"btns\">\n      <button id=\"btnReset\">Reset</button>\n      <button class=\"primary\" id=\"btnDone\">Done</button>\n    </div>\n    <div class=\"hint\">Drag a slider, or drag a label like Premiere's blue numbers (hold Alt for fine control). The selected clips move together, live, in their own Motion \u2014 no extra effects. Each clip's own animation is kept underneath the group move. Select the same clips later and everything comes back. <b>Reset</b> puts the clips back as they were.</div>\n  </div>\n\n  <div class=\"arrhead\"><a id=\"arrToggle\"><span class=\"arw\" id=\"arrArrow\">\u25b8</span>Arrange</a></div>\n  <div class=\"arr hidden\" id=\"arrange\">\n    <div class=\"sub\">Grid</div>\n    <div class=\"iconrow\">\n      <select id=\"gridCols\" title=\"Columns\">\n        <option value=\"0\" selected>Auto columns</option><option value=\"1\">1 column</option><option value=\"2\">2 columns</option>\n        <option value=\"3\">3 columns</option><option value=\"4\">4 columns</option><option value=\"5\">5 columns</option><option value=\"6\">6 columns</option>\n      </select>\n      <span class=\"lbl\">Gap</span><input type=\"number\" id=\"gridGap\" value=\"20\" /><span class=\"lbl\">px</span>\n      <button class=\"primary\" id=\"btnGrid\">Make grid</button>\n    </div>\n\n    <div class=\"sub\">Copy properties</div>\n    <div class=\"iconrow\">\n      <button id=\"btnCopy\">Copy</button>\n      <label class=\"ck\"><input type=\"checkbox\" id=\"cpPos\" checked />Pos</label>\n      <label class=\"ck\"><input type=\"checkbox\" id=\"cpScale\" checked />Scale</label>\n      <label class=\"ck\"><input type=\"checkbox\" id=\"cpRot\" checked />Rot</label>\n      <label class=\"ck\"><input type=\"checkbox\" id=\"cpOp\" />Opac</label>\n      <button class=\"primary\" id=\"btnPaste\">Paste</button>\n    </div>\n    <div class=\"tiny\" id=\"pasteInfo\">Copy one clip, select others, Paste just the ticked properties.</div>\n  </div>\n\n  <div class=\"status\" id=\"status\">Ready.</div>\n  <div class=\"foot\"><span id=\"advToggle\" title=\"Double-click for troubleshooting\"><span class=\"brand\">NullRig</span> v1.0 \u00b7 \u00a9 2026 Edgar Febus</span></div>\n\n  <div class=\"adv hidden\" id=\"adv\">\n    <div class=\"btns\"><button id=\"btnKeyTest\">Keyframe test</button><button id=\"btnDiag\">Inspect clips</button><button id=\"btnCopyDiag\">Copy</button></div>\n    <textarea id=\"diagOut\" readonly></textarea>\n  </div>\n\n </div>\n</body>\n</html>\n"
const G: any = typeof window !== "undefined" ? window : {}
const FORCE: number = typeof G.__NR_FORCE === "number" ? G.__NR_FORCE : -1
const VW = 1280, VH = 720
const HX = 24, HY = 24, HW = 816, HH = 672
const PX = 856, PY = 24, PW = 400, PH = 672
// program monitor (16:9) and timeline geometry, stage px
const MX = HX + 88, MY = HY + 50, MW = 640, MH = 360
const TLX = HX, TLY = HY + 436, TLW = HW, TLH = HH - 436
const TRK_X = TLX + 96, TRK_W = TLW - 96 - 16, RULER_Y = TLY + 34, TRK_Y = TLY + 60, TRK_H = 34
const PXS = 130 // timeline px per second
const CLIP_DUR = 4
const SANS = '"Inter", system-ui, -apple-system, sans-serif'
const MONO = '"JetBrains Mono", ui-monospace, monospace'
const C = { bg: "#0E0F11", win: "#1D1E21", chrome: "#26272B", line: "#2E3036", text: "#E8E8E6", muted: "#9A9EA6", green: "#5CCD74", clip: "#7B78D9", clipSel: "#9C99F0" }
const TOTAL = 32000
const TRAVEL = 600

// ---- script times (ms)
const T = {
  sel0: 1000, sel1: 2200,
  arr: 3300, grid: 4300,
  sc0: 7000, sc1: 8200,
  x0: 8900, x1: 9900,
  anim: 11000, key1: 12400,
  ph0: 13200, ph1: 14000,
  xk0: 14800, xk1: 15800,
  ksel: 17000, ease: 17900, inf: 19000,
  prev: 22000, play0: 22600, play1: 25200, play2: 25600, play3: 28200,
}
const SC_END = 72, X_A = -260, X_B = 260, KEY_B = 2 // seconds

const CAPS: [number, number, string, string][] = [
  [0, 3000, "Select your video clips", "Real footage, not just graphics. No nesting, no trip to After Effects."],
  [3000, 6600, "Make a grid", "Fit the clips into the frame in one click, in timeline order."],
  [6600, 10800, "Move them like one layer", "Scale and position the whole group, live. Every clip stays a real clip on the timeline."],
  [10800, 16600, "Animate the group like a null", "A stopwatch for each value, like Premiere’s. One set of keys moves every clip."],
  [16600, 22000, "Shape the curve", "Premiere’s interpolation types, plus AE-style keyframe velocity: speed and influence."],
  [22000, 28600, "Play it back", "The group eases across the frame while every clip keeps playing."],
  [28600, 32000, "NullRig for Premiere Pro", "Free · Move a group of clips like one layer."],
]
const CAM_WIDE = [
  [0, 1, 640, 360], [900, 1, 640, 360], [1500, 1.45, 430, 540], [2700, 1.45, 430, 540],
  [3300, 1.12, 690, 300], [10600, 1.12, 690, 300], [11300, 1.55, 1050, 300], [12700, 1.55, 1050, 300],
  [13300, 1.05, 650, 380], [14300, 1.05, 650, 380], [14800, 1.55, 1050, 300], [16300, 1.55, 1050, 300], [16900, 1.55, 1050, 470], [21600, 1.55, 1050, 470],
  [22400, 1.3, 432, 300], [28200, 1.3, 432, 300], [29000, 1, 640, 360], [32000, 1, 640, 360],
]
const CAM_NARROW = [
  [0, 1, 640, 360], [900, 1, 640, 360], [1500, 2.3, 400, 540], [2700, 2.3, 400, 540],
  [3300, 3, 1056, 400], [4400, 3, 1056, 400], [4800, 2.2, 432, 250], [6600, 2.2, 432, 250],
  [7000, 3, 1056, 150], [10000, 3, 1056, 150], [10300, 2.2, 432, 250], [10800, 2.2, 432, 250],
  [11300, 3, 1056, 260], [12700, 3, 1056, 260], [13200, 2.1, 432, 440], [14400, 2.1, 432, 440],
  [14800, 3, 1056, 250], [16300, 3, 1056, 250], [16900, 3, 1056, 470], [21600, 3, 1056, 470],
  [22300, 2.2, 432, 250], [28200, 2.2, 432, 250], [29000, 1, 640, 360], [32000, 1, 640, 360],
]

const clamp = (x: number) => Math.max(0, Math.min(1, x))
const eio = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2 }
const eout = (x: number) => 1 - Math.pow(1 - clamp(x), 4)
const seg = (t: number, a: number, b: number, e = eio) => e((t - a) / (b - a))
const lerp = (a: number, b: number, p: number) => a + (b - a) * p
function track(keys: number[][], t: number) {
  if (t <= keys[0][0]) return keys[0].slice(1)
  for (let i = 1; i < keys.length; i++) if (t <= keys[i][0]) {
    const a = keys[i - 1], b = keys[i], p = eio((t - a[0]) / Math.max(1, b[0] - a[0]))
    return a.slice(1).map((v, j) => lerp(v, b[j + 1], p))
  }
  return keys[keys.length - 1].slice(1)
}
const fmt = (ms: number) => { const v = Math.max(0, Math.floor(ms / 1000)); return Math.floor(v / 60) + ":" + String(v % 60).padStart(2, "0") }
const tc = (s: number) => { const f = Math.floor(s * 30 + 1e-6); return "00:00:" + String(Math.floor(f / 30)).padStart(2, "0") + ":" + String(f % 30).padStart(2, "0") }
const abs = (x: number, y: number, s: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", left: x, top: y, ...s })

// ---- curve state: cubic bezier in normalized (time, value) between key 1 and key 2
function curveAt(t: number) {
  // [p1x, p1y, p2x, p2y]
  const lin = [1 / 3, 1 / 3, 2 / 3, 2 / 3], ease = [1 / 3, 0, 2 / 3, 1], inf = [1 / 3, 0, 0.25, 1]
  if (t < T.ease) return lin
  if (t < T.inf + 350) { const p = seg(t, T.ease, T.ease + 420); return lin.map((v, i) => lerp(v, ease[i], p)) }
  const p = seg(t, T.inf + 350, T.inf + 750); return ease.map((v, i) => lerp(v, inf[i], p))
}
function bez(p: number[], u: number) {
  const a = 1 - u
  return [3 * a * a * u * p[0] + 3 * a * u * u * p[2] + u * u * u, 3 * a * a * u * p[1] + 3 * a * u * u * p[3] + u * u * u]
}
function curveValue(p: number[], x: number) { // value (0..1) at normalized time x
  if (x <= 0) return 0
  if (x >= 1) return 1
  let lo = 0, hi = 1
  for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (bez(p, m)[0] < x) lo = m; else hi = m }
  return bez(p, (lo + hi) / 2)[1]
}

// ---- the edit state as a pure function of t
function seqTime(t: number) {
  if (t < T.ph0) return 0
  if (t < T.ph1) return KEY_B * seg(t, T.ph0, T.ph1)
  if (t < T.prev) return KEY_B
  if (t < T.play0) return 0
  if (t < T.play1) return 2.6 * clamp((t - T.play0) / (T.play1 - T.play0))
  if (t < T.play2) return 2.6
  if (t < T.play3) return 2.6 * clamp((t - T.play2) / (T.play3 - T.play2))
  return 2.6
}
function state(t: number) {
  const st = seqTime(t)
  const selected = t >= T.sel1
  const grid = seg(t, T.grid, T.grid + 380, eout)
  const scale = t < T.sc0 ? 100 : lerp(100, SC_END, seg(t, T.sc0, T.sc1))
  let x = t < T.x0 ? 0 : lerp(0, X_A, seg(t, T.x0, T.x1))
  const keyed1 = t >= T.key1, keyed2 = t >= T.xk0
  const xB = t < T.xk1 ? lerp(X_A, X_B, seg(t, T.xk0, T.xk1)) : X_B
  if (keyed2) x = lerp(X_A, xB, curveValue(curveAt(t), st / KEY_B))
  return { st, selected, grid, scale, x, xB, keyed1, keyed2, anim: t >= T.anim, arrange: t >= T.arr }
}

// ---- footage: four procedurally drawn clips (a coastline, a city at night, a product shot, drone hills)
const CLIPS = [
  { name: "Coast_A012.mov" }, { name: "City_B004.mov" }, { name: "Studio_C021.mov" }, { name: "Hills_D007.mov" },
]
function drawScene(ctx: CanvasRenderingContext2D, i: number, w: number, h: number, ft: number) {
  ctx.save()
  if (i === 0) {
    let g = ctx.createLinearGradient(0, 0, 0, h * 0.55); g.addColorStop(0, "#2E7FA8"); g.addColorStop(1, "#F2C9A0"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h * 0.56)
    ctx.fillStyle = "#FFE7B8"; ctx.beginPath(); ctx.arc(w * 0.7, h * 0.43, h * 0.11, 0, 7); ctx.fill()
    g = ctx.createLinearGradient(0, h * 0.55, 0, h); g.addColorStop(0, "#2B6E8C"); g.addColorStop(1, "#123A4E"); ctx.fillStyle = g; ctx.fillRect(0, h * 0.55, w, h * 0.45)
    ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.lineWidth = Math.max(1, h * 0.012)
    for (let k = 0; k < 7; k++) { const y = h * (0.6 + k * 0.06), off = (ft * (20 + k * 9) + k * 37) % (w * 0.4); ctx.beginPath(); for (let xx = -w * 0.4 + off; xx < w; xx += w * 0.4) { ctx.moveTo(xx, y); ctx.quadraticCurveTo(xx + w * 0.1, y - h * 0.02, xx + w * 0.2, y) } ctx.stroke() }
    ctx.fillStyle = "#E9D7B0"; ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, h * 0.86); ctx.quadraticCurveTo(w * 0.3, h * (0.82 + 0.01 * Math.sin(ft * 2)), w * 0.55, h); ctx.fill()
  } else if (i === 1) {
    let g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#141A3A"); g.addColorStop(1, "#4A2A5E"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    const b = [[0.02, 0.45], [0.12, 0.3], [0.22, 0.5], [0.3, 0.22], [0.42, 0.4], [0.52, 0.28], [0.63, 0.48], [0.72, 0.18], [0.84, 0.36], [0.93, 0.5]]
    b.forEach(([bx, by], k) => {
      const x0 = bx * w, bw = w * 0.085, y0 = by * h
      ctx.fillStyle = "#0B0E20"; ctx.fillRect(x0, y0, bw, h * 0.82 - y0)
      for (let yy = y0 + h * 0.03; yy < h * 0.78; yy += h * 0.045) for (let xx = x0 + bw * 0.15; xx < x0 + bw * 0.85; xx += bw * 0.25) {
        const on = Math.sin(k * 13 + xx * 0.7 + yy * 1.3 + Math.floor(ft * 1.5 + k) * 2.1) > 0.35
        if (on) { ctx.fillStyle = "rgba(255,214,140,0.85)"; ctx.fillRect(xx, yy, bw * 0.12, h * 0.018) }
      }
    })
    ctx.fillStyle = "#0A0C18"; ctx.fillRect(0, h * 0.82, w, h * 0.18)
    for (let k = 0; k < 3; k++) { const xx = ((ft * (w * 0.35) * (k % 2 ? 1 : -1.2) + k * w * 0.37) % (w * 1.3) + w * 1.3) % (w * 1.3) - w * 0.15; const y = h * (0.86 + k * 0.04); const lg = ctx.createLinearGradient(xx - w * 0.15, 0, xx, 0); lg.addColorStop(0, "rgba(255,80,60,0)"); lg.addColorStop(1, k % 2 ? "rgba(255,240,200,0.9)" : "rgba(255,70,50,0.9)"); ctx.fillStyle = lg; ctx.fillRect(xx - w * 0.15, y, w * 0.15, h * 0.012) }
  } else if (i === 2) {
    const g = ctx.createRadialGradient(w * 0.5, h * 0.45, h * 0.05, w * 0.5, h * 0.5, w * 0.7); g.addColorStop(0, "#4A3B30"); g.addColorStop(1, "#141110"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.beginPath(); ctx.ellipse(w * 0.5, h * 0.86, w * 0.16, h * 0.04, 0, 0, 7); ctx.fill()
    const bx = w * 0.5 + Math.sin(ft * 0.8) * w * 0.01, bw = w * 0.13, top = h * 0.24
    const rr = (x: number, y: number, ww: number, hh: number, r: number) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + ww, y, x + ww, y + hh, r); ctx.arcTo(x + ww, y + hh, x, y + hh, r); ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + ww, y, r); ctx.closePath() }
    ctx.fillStyle = "#C88A3C"; rr(bx - bw / 2, top + h * 0.14, bw, h * 0.47, w * 0.02); ctx.fill()
    ctx.fillStyle = "#B37A33"; rr(bx - bw * 0.22, top, bw * 0.44, h * 0.16, w * 0.01); ctx.fill()
    ctx.fillStyle = "#EFE3CC"; ctx.fillRect(bx - bw / 2, top + h * 0.3, bw, h * 0.16)
    ctx.fillStyle = "#24382C"; ctx.font = "800 " + Math.round(h * 0.055) + "px Archivo, Inter, sans-serif"; ctx.textAlign = "center"; ctx.fillText("HALDEN", bx, top + h * 0.4)
    const sx = bx - bw / 2 + ((ft * 0.5) % 1.6) * bw * 1.4 - bw * 0.4
    ctx.save(); rr(bx - bw / 2, top + h * 0.14, bw, h * 0.47, w * 0.02); ctx.clip(); const hl = ctx.createLinearGradient(sx - bw * 0.2, 0, sx + bw * 0.2, 0); hl.addColorStop(0, "rgba(255,255,255,0)"); hl.addColorStop(0.5, "rgba(255,255,255,0.45)"); hl.addColorStop(1, "rgba(255,255,255,0)"); ctx.fillStyle = hl; ctx.fillRect(sx - bw * 0.2, 0, bw * 0.4, h); ctx.restore()
  } else {
    let g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#BFD9E6"); g.addColorStop(0.6, "#E8EEDD"); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    const layers = [["#9FB59A", 0.42, 6, 0.1], ["#6F9A6A", 0.55, 14, 0.12], ["#3F6E45", 0.68, 28, 0.1], ["#24472D", 0.82, 48, 0.08]] as any[]
    layers.forEach(([col, base, sp, amp], k) => {
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, h)
      for (let xx = 0; xx <= w + 4; xx += 4) { const ph = (xx + ft * sp * (w / 320)) / w; ctx.lineTo(xx, h * (base - amp * (0.5 + 0.5 * Math.sin(ph * 6.3 * (1 + k * 0.4) + k * 2)) * (0.6 + 0.4 * Math.sin(ph * 2.1 + k)))) }
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill()
    })
  }
  const v = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.65); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.35)"); ctx.fillStyle = v; ctx.fillRect(0, 0, w, h)
  ctx.restore()
}
// clip rects in frame coordinates (1920x1080)
function clipRects(s: any) {
  const gap = 20, cw = (1920 - gap * 3) / 2, ch = (1080 - gap * 3) / 2
  return [0, 1, 2, 3].map((i) => {
    const col = i % 2, row = Math.floor(i / 2)
    const cellX = gap + col * (cw + gap), cellY = gap + row * (ch + gap)
    const fh = Math.min(ch, cw * 9 / 16), fw = fh * 16 / 9
    const gx = cellX + (cw - fw) / 2, gy = cellY + (ch - fh) / 2
    let x = lerp(0, gx, s.grid), y = lerp(0, gy, s.grid), w = lerp(1920, fw, s.grid), h = lerp(1080, fh, s.grid)
    const S = s.scale / 100
    x = 960 + (x - 960) * S + s.x; y = 540 + (y - 540) * S; w *= S; h *= S
    return { x, y, w, h }
  })
}

// ---- panel driving
function panelApply(doc: Document, s: any, t: number) {
  const $ = (id: string) => doc.getElementById(id) as any
  if (!$("count")) return
  const set = (el: any, key: string, val: any) => { if (el && el[key] !== val) el[key] = val }
  set($("count"), "textContent", s.selected ? "4 clips selected" : "Select clips in the timeline")
  const track = (id: string, frac: number, zeroFrac: number, num: string) => {
    const el = $(id)
    if (!el.firstChild) el.innerHTML = '<div class="rail"></div><div class="zero"></div><div class="fill"></div><div class="thumb"></div>'
    const [, zero, fill, thumb] = el.children as any
    zero.style.left = zeroFrac * 100 + "%"
    fill.style.left = Math.min(zeroFrac, frac) * 100 + "%"; fill.style.width = Math.abs(frac - zeroFrac) * 100 + "%"
    thumb.style.left = frac * 100 + "%"
    set($(id + "_n"), "value", num)
  }
  const scFrac = s.scale <= 100 ? s.scale / 200 : 0.5 + (s.scale - 100) / 1800
  track("scale", scFrac, 0.5, String(Math.round(s.scale)))
  track("x", 0.5 + s.x / 3840, 0.5, String(Math.round(s.x)))
  track("y", 0.5, 0.5, "0")
  track("rot", 0.5, 0.5, "0")
  track("op", 1, 0, "100")
  // arrange
  const arr = $("arrange"); if (arr) arr.classList.toggle("hidden", !s.arrange)
  set($("arrArrow"), "textContent", s.arrange ? "▾" : "▸")
  // animate
  set($("animate"), "checked", s.anim)
  $("animBox").classList.toggle("hidden", !s.anim)
  ;["sw_scale", "sw_x", "sw_y", "sw_rot", "sw_op"].forEach((id) => { const el = $(id); el.classList.toggle("idle", !s.anim); el.classList.toggle("on", id === "sw_x" && s.keyed1) })
  const tabX = doc.querySelector('[data-gprop="x"]') as any; if (tabX) tabX.classList.toggle("anim", s.keyed1)
  // graph
  const graph = $("graph")
  const W = graph.clientWidth || 360, H = graph.clientHeight || 130
  const ksel = t >= T.ksel
  const p = curveAt(t)
  const easeIcons = t >= T.ease + 200
  const gx = (sec: number) => 14 + (sec / 3) * (W - 28)
  const gy = (v: number) => H - 14 - ((v + 320) / 640) * (H - 28)
  let html = '<div class="gzero" style="top:' + gy(0).toFixed(1) + 'px"></div>'
  if (!s.keyed1) html += '<div class="gempty">Click ⏱ next to a value to start animating it.</div>'
  else {
    if (!s.keyed2) {
      const vNow = s.x
      for (let k = 0; k <= 120; k++) { const sec = (k / 120) * 3; html += '<div class="gline" style="left:' + gx(sec).toFixed(1) + "px;top:" + gy(vNow).toFixed(1) + 'px"></div>' }
      html += '<div class="gkey" style="left:' + gx(0) + "px;top:" + gy(X_A) + 'px">◆</div>'
    } else {
      for (let k = 0; k <= 160; k++) { const u = k / 160; const [bxp, byp] = bez(p, u); html += '<div class="gline" style="left:' + gx(bxp * KEY_B).toFixed(1) + "px;top:" + gy(lerp(X_A, s.xB, byp)).toFixed(1) + 'px"></div>' }
      for (let k = 0; k <= 30; k++) { const sec = KEY_B + (k / 30) * (3 - KEY_B); html += '<div class="gline" style="left:' + gx(sec).toFixed(1) + "px;top:" + gy(s.xB).toFixed(1) + 'px"></div>' }
      const icon = easeIcons ? "⧗" : "◆"
      html += '<div class="gkey" style="left:' + gx(0) + "px;top:" + gy(X_A) + 'px">' + icon + "</div>"
      html += '<div class="gkey' + (ksel ? " sel" : "") + '" style="left:' + gx(KEY_B) + "px;top:" + gy(s.xB).toFixed(1) + 'px">' + icon + "</div>"
      if (ksel) {
        const hx = gx(p[2] * KEY_B), hy = gy(lerp(X_A, X_B, p[3]))
        const kx = gx(KEY_B), ky = gy(X_B)
        for (let k = 0; k <= 24; k++) { const u = k / 24; html += '<div class="gdot" style="left:' + lerp(hx, kx, u).toFixed(1) + "px;top:" + lerp(hy, ky, u).toFixed(1) + 'px;background:#f5d547;opacity:.55"></div>' }
        html += '<div class="ghandle" id="h2" style="left:' + hx.toFixed(1) + "px;top:" + hy.toFixed(1) + 'px"></div>'
      }
    }
    html += '<div class="gph" style="left:' + gx(Math.min(3, s.st)).toFixed(1) + 'px"></div>'
  }
  if (graph.__html !== html) { graph.innerHTML = html; graph.__html = html }
  set($("graphInfo"), "textContent", !s.keyed1 ? "" : ksel ? "Key 2 · " + tc(KEY_B) + " · Position X " + X_B : "Position X · " + (s.keyed2 ? "2 keys" : "1 key"))
  set($("velKey"), "textContent", ksel ? "— key 2" : "— click a ◆ key")
  const typed = t < T.inf + 200 ? "" : t < T.inf + 350 ? "7" : "75"
  const inInf = !ksel ? "" : t < T.ease + 200 ? "33.33" : t < T.inf ? "33.33" : typed
  set($("vInSpeed"), "value", ksel ? (t >= T.ease + 200 ? "0" : "260") : "")
  set($("vInInf"), "value", inInf)
  set($("vOutSpeed"), "value", ""); set($("vOutInf"), "value", "")
  const ib = doc.querySelector('[data-interp="ease"]') as any
  if (ib) ib.style.background = t >= T.ease && t < T.ease + 700 ? "#5ccd74" : ""
  if (ib) ib.style.color = t >= T.ease && t < T.ease + 700 ? "#0e0f11" : ""
  const gb = $("btnGrid"); if (gb) gb.style.filter = t >= T.grid && t < T.grid + 300 ? "brightness(1.25)" : ""
  set($("status"), "textContent", t < T.sel1 ? "Ready." : t < T.grid ? "4 clips selected." : t < T.sc0 ? "Grid: 2 × 2, gap 20 px." : !s.keyed1 ? "Group updated live: 4 clips." : !s.keyed2 ? "Position X: key at " + tc(0) + "." : t < T.ease ? "Position X: key at " + tc(KEY_B) + "." : t < T.inf + 350 ? "Easy Ease on key 2." : "Key 2: incoming influence 75%.")
  set($("status"), "className", "status ok")
}

/**
 * NullRig walkthrough.
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight any
 * @framerIntrinsicWidth 1280
 * @framerIntrinsicHeight 720
 */
export default function NullRigDemo(props: { speed?: number; canvasTime?: number; style?: React.CSSProperties }) {
  const { speed = 1, canvasTime = 20, style } = props
  const rootRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const monRef = useRef<HTMLCanvasElement>(null)
  const thumbsRef = useRef<string[]>([])
  const pausedRef = useRef(false)
  const [size, setSize] = useState({ w: 1280, h: 720 })
  const [t, setT] = useState(0)
  const tRef = useRef(0)
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(true)
  const [paused, setPausedState] = useState(false)
  const [scrub, setScrub] = useState<number | null>(null)
  const [hover, setHover] = useState(false)
  const [touchUntil, setTouchUntil] = useState(0)
  const touchRef = useRef({ shown: false })
  const [thumbs, setThumbs] = useState<string[]>([])
  const isCanvas = RenderTarget.current() === RenderTarget.canvas
  const staticMode = isCanvas || FORCE >= 0
  const setPaused = (v: boolean) => { pausedRef.current = v; setPausedState(v) }
  const seek = (v: number) => { tRef.current = Math.max(0, Math.min(TOTAL - 50, v)); setT(tRef.current) }

  useEffect(() => {
    if (staticMode) { const v = FORCE >= 0 ? FORCE : Math.max(0, Math.min(TOTAL - 1, canvasTime * 1000)); tRef.current = v; setT(v) }
  }, [staticMode, canvasTime])
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches && !staticMode) { setPaused(true); seek(20000) }
  }, [])
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const measure = () => { const r = el.getBoundingClientRect(); if (r.width > 0 && r.height > 0) setSize({ w: r.width, h: r.height }) }
    measure()
    if (typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(measure); ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useEffect(() => {
    const el = rootRef.current
    if (!el || typeof IntersectionObserver === "undefined") return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  // timeline thumbnails
  useEffect(() => {
    if (typeof document === "undefined") return
    const make = () => {
      const out = CLIPS.map((_, i) => { const c = document.createElement("canvas"); c.width = 96; c.height = 54; const x = c.getContext("2d"); if (x) drawScene(x, i, 96, 54, 0.6); return c.toDataURL() })
      thumbsRef.current = out; setThumbs(out)
    }
    make()
    if ((document as any).fonts) (document as any).fonts.ready.then(make)
  }, [])
  // panel ready
  useEffect(() => {
    let alive = true, tries = 0
    const poll = () => {
      if (!alive) return
      const doc = frameRef.current && frameRef.current.contentDocument
      if (doc && doc.getElementById("graph")) { setReady(true); return }
      if (tries++ < 200) setTimeout(poll, 50)
    }
    poll()
    return () => { alive = false }
  }, [])
  // clock
  useEffect(() => {
    if (staticMode || !visible) return
    let raf = 0, last = performance.now()
    const tick = (now: number) => {
      const d = Math.min(64, now - last) * speed
      last = now
      if (!pausedRef.current && ready) { let nt = tRef.current + d; if (nt >= TOTAL) nt = 0; tRef.current = nt; setT(nt) }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [staticMode, visible, speed, ready])

  const s = state(t)
  // drive the panel and draw the monitor every frame
  useEffect(() => {
    const doc = frameRef.current && frameRef.current.contentDocument
    if (doc && ready) panelApply(doc, s, t)
    const cv = monRef.current
    if (!cv) return
    const ctx = cv.getContext("2d")
    if (!ctx) return
    const k = cv.width / 1920
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = "#000"; ctx.fillRect(0, 0, cv.width, cv.height)
    const rects = clipRects(s)
    for (let i = 0; i < 4; i++) {
      const r = rects[i]
      ctx.save(); ctx.beginPath(); ctx.rect(r.x * k, r.y * k, r.w * k, r.h * k); ctx.clip()
      ctx.translate(r.x * k, r.y * k)
      drawScene(ctx, i, r.w * k, r.h * k, s.st + i * 0.37)
      ctx.restore()
    }
  }, [t, ready])

  // ---- cursor path (stage coordinates), computed from the live DOM
  const doc = frameRef.current && frameRef.current.contentDocument
  const pel = (sel: string, fx = 0.5, fy = 0.5) => {
    const el = doc && (doc.querySelector(sel) as any)
    if (!el) return { x: PX + PW / 2, y: PY + 200 }
    const r = el.getBoundingClientRect()
    return { x: PX + r.left + r.width * fx, y: PY + r.top + r.height * fy }
  }
  const sliderPt = (id: string, frac: number) => { const a = pel("#" + id, 0, 0.5), b = pel("#" + id, 1, 0.5); return { x: lerp(a.x, b.x, frac), y: a.y } }
  const tlPt = (sec: number, trk: number) => ({ x: TRK_X + sec * PXS, y: TRK_Y + trk * TRK_H + TRK_H / 2 })
  const graphPt = (sec: number, v: number) => { const el = doc && (doc.getElementById("graph") as any); if (!el) return { x: 0, y: 0 }; const r = el.getBoundingClientRect(); const W = r.width, H = r.height; return { x: PX + r.left + 14 + (sec / 3) * (W - 28), y: PY + r.top + H - 14 - ((v + 320) / 640) * (H - 28) } }
  type A = { t: number; end?: number; from: () => { x: number; y: number }; to?: () => { x: number; y: number }; click?: boolean }
  const ACTS: A[] = [
    { t: T.sel0, end: T.sel1, from: () => tlPt(-0.25, -0.4), to: () => tlPt(1.6, 3.6) },
    { t: T.arr, from: () => pel("#arrToggle", 0.3) , click: true },
    { t: T.grid, from: () => pel("#btnGrid"), click: true },
    { t: T.sc0, end: T.sc1, from: () => sliderPt("scale", 0.5), to: () => sliderPt("scale", SC_END / 200) },
    { t: T.x0, end: T.x1, from: () => sliderPt("x", 0.5), to: () => sliderPt("x", 0.5 + X_A / 3840) },
    { t: T.anim, from: () => pel("#animate"), click: true },
    { t: T.key1, from: () => pel("#sw_x"), click: true },
    { t: T.ph0, end: T.ph1, from: () => ({ x: TRK_X, y: RULER_Y + 10 }), to: () => ({ x: TRK_X + KEY_B * PXS, y: RULER_Y + 10 }) },
    { t: T.xk0, end: T.xk1, from: () => sliderPt("x", 0.5 + X_A / 3840), to: () => sliderPt("x", 0.5 + X_B / 3840) },
    { t: T.ksel, from: () => graphPt(KEY_B, X_B), click: true },
    { t: T.ease, from: () => pel('[data-interp="ease"]'), click: true },
    { t: T.inf, from: () => pel("#vInInf", 0.4), click: true },
    { t: T.prev, from: () => pel("#gPrev"), click: true },
  ]
  let cur = { x: 560, y: 640 }, pressed = false
  const endPos = (a: A) => (a.to ? a.to() : a.from())
  for (let i = 0; i < ACTS.length; i++) {
    const a = ACTS[i], prevEnd = i ? endPos(ACTS[i - 1]) : { x: 560, y: 640 }
    const stopAt = a.end || a.t
    if (t < a.t - TRAVEL) { cur = prevEnd; break }
    if (t < a.t) { const st = a.from(); const p = eio((t - (a.t - TRAVEL)) / (TRAVEL - 60)); cur = { x: lerp(prevEnd.x, st.x, p), y: lerp(prevEnd.y, st.y, p) }; break }
    if (t <= stopAt + 60 && a.to) { const st = a.from(), en = a.to(); const p = eio((t - a.t) / Math.max(1, stopAt - a.t)); cur = { x: lerp(st.x, en.x, p), y: lerp(st.y, en.y, p) }; pressed = t <= stopAt; break }
    cur = endPos(a)
    if (a.click && t < a.t + 140) pressed = true
  }
  const ripples = ACTS.filter((a) => a.click && t >= a.t && t < a.t + 600).map((a) => ({ ...a.from(), dt: t - a.t }))
  // marquee rect while selecting
  const marquee = t >= T.sel0 && t <= T.sel1 ? (() => { const a = tlPt(-0.25, -0.4), b = cur; return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(b.x - a.x), h: Math.abs(b.y - a.y) } })() : null

  // ---- camera, caption, controls
  const W = size.w, H = size.h
  const narrow = W / H < 1.2
  const [z, fx, fy] = track(narrow ? CAM_NARROW : CAM_WIDE, t)
  const sc = Math.min(W / VW, H / VH) * z
  const capOff = narrow ? H * 0.1 : H * 0.045
  const tx = W / 2 - fx * sc, ty = H / 2 - fy * sc - capOff
  const cap = CAPS.find(([a, b]) => t >= a && t < b) || CAPS[CAPS.length - 1]
  const capOp = Math.min(seg(t, cap[0], cap[0] + 380, eout), 1 - seg(t, cap[1] - 260, cap[1]))
  const fade = staticMode ? 0 : Math.max(1 - seg(t, 0, 450), seg(t, TOTAL - 450, TOTAL), ready ? 0 : 1)
  const small = W < 520
  const showCtl = !staticMode && (paused || hover || scrub != null || Date.now() < touchUntil)
  const shownT = scrub != null ? scrub : t
  const capIdx = CAPS.findIndex(([a, b]) => shownT >= a && shownT < b)
  const togglePlay = () => setPaused(!pausedRef.current)
  const commitScrub = () => { if (scrub != null) { seek(scrub); setScrub(null) } }
  const jumpCap = (d: number) => { const i = Math.max(0, Math.min(CAPS.length - 1, (capIdx < 0 ? CAPS.length - 1 : capIdx) + d)); seek(CAPS[i][0] + (i === 0 ? 0 : 60)) }
  const phX = TRK_X + s.st * PXS

  return (
    <div ref={rootRef} role="group" aria-label="Animated walkthrough of NullRig for Premiere Pro"
      onPointerEnter={(e) => { if (e.pointerType === "mouse") setHover(true) }}
      onPointerLeave={(e) => { if (e.pointerType === "mouse") setHover(false) }}
      onPointerDown={(e) => { touchRef.current.shown = showCtl; if (e.pointerType !== "mouse") setTouchUntil(Date.now() + 3500) }}
      onClick={(e) => { if (staticMode) return; if ((e.nativeEvent as any).pointerType !== "mouse" && !touchRef.current.shown) return; togglePlay() }}
      style={{ ...style, position: "relative", width: "100%", height: "100%", overflow: "hidden", background: C.bg, borderRadius: 24, border: "1px solid #2E3137", boxSizing: "border-box", fontFamily: SANS, color: C.text }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 15%, rgba(92,205,116,0.09), transparent 45%), radial-gradient(circle at 15% 85%, rgba(123,120,217,0.08), transparent 45%)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: VW, height: VH, transformOrigin: "0 0", transform: "translate3d(" + tx.toFixed(2) + "px," + ty.toFixed(2) + "px,0) scale(" + sc.toFixed(4) + ")", willChange: "transform" }}>
        {/* host window */}
        <div style={abs(HX, HY, { width: HW, height: HH, borderRadius: 12, background: C.win, border: "1px solid " + C.line, boxShadow: "0 30px 80px rgba(0,0,0,0.6)", overflow: "hidden" })}>
          <div style={{ height: 34, background: C.chrome, borderBottom: "1px solid " + C.line, display: "flex", alignItems: "center", gap: 12, padding: "0 14px" }}>
            <div style={{ display: "flex", gap: 6 }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 9, height: 9, borderRadius: 9, background: "#44464C" }} />)}</div>
            <span style={{ fontSize: 11.5, color: "#C7C9CE" }}>Halden_Spring_Social</span>
            <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 9.5, color: C.muted }}>PROGRAM: SPRING_GRID</span>
          </div>
          <div style={{ position: "absolute", left: 0, top: 34, width: HW, height: 402, background: "#151618" }} />
        </div>
        <div style={abs(MX, MY, { width: MW, height: MH, background: "#000", boxShadow: "0 0 0 1px #3A3C42" })}>
          <canvas ref={monRef} width={1280} height={720} style={{ width: MW, height: MH, display: "block" }} />
        </div>
        <div style={abs(MX, MY + MH + 8, { width: MW, display: "flex", fontFamily: MONO, fontSize: 10, color: "#E8C15A" })}>
          <span>{tc(s.st)}</span><span style={{ marginLeft: "auto", color: C.muted }}>Fit · Full</span>
        </div>
        {/* timeline */}
        <div style={abs(TLX, TLY, { width: TLW, height: TLH, borderTop: "1px solid " + C.line, background: "#1A1B1E", borderRadius: "0 0 12px 12px", overflow: "hidden" })}>
          <div style={{ height: 34, display: "flex", alignItems: "center", padding: "0 14px", gap: 12, borderBottom: "1px solid " + C.line }}>
            <span style={{ fontFamily: MONO, fontSize: 13, color: "#E8C15A" }}>{tc(s.st)}</span>
            <span style={{ fontSize: 10.5, color: C.muted }}>Spring_Grid</span>
          </div>
        </div>
        <div style={abs(TRK_X, RULER_Y, { width: TRK_W, height: 22, borderBottom: "1px solid " + C.line })}>
          {[0, 1, 2, 3, 4, 5].map((sec) => <span key={sec} style={abs(sec * PXS, 0, { height: 22, borderLeft: "1px solid #3A3C42", paddingLeft: 4, fontFamily: MONO, fontSize: 9, color: C.muted, lineHeight: "22px" })}>{tc(sec)}</span>)}
        </div>
        {[3, 2, 1, 0].map((i, row) => (
          <React.Fragment key={i}>
            <div style={abs(TLX + 12, TRK_Y + row * TRK_H + 4, { width: 70, height: TRK_H - 8, borderRadius: 4, background: "#232428", border: "1px solid #2C2E33", fontFamily: MONO, fontSize: 10, color: "#C7C9CE", display: "flex", alignItems: "center", paddingLeft: 8, boxSizing: "border-box" })}>{"V" + (i + 1)}</div>
            <div style={abs(TRK_X, TRK_Y + row * TRK_H + 4, { width: CLIP_DUR * PXS, height: TRK_H - 8, borderRadius: 4, background: s.selected ? C.clipSel : C.clip, outline: s.selected ? "1.5px solid #fff" : "none", outlineOffset: -1, display: "flex", alignItems: "center", overflow: "hidden", boxSizing: "border-box" })}>
              {thumbs[i] && <img alt="" src={thumbs[i]} style={{ height: "100%", width: 46, objectFit: "cover", display: "block" }} />}
              <span style={{ marginLeft: 8, fontSize: 10.5, color: "#14132B", fontWeight: 600, whiteSpace: "nowrap" }}>{CLIPS[i].name}</span>
              {s.keyed1 && <span style={{ marginLeft: "auto", marginRight: 8, fontSize: 9, color: "#14132B", opacity: 0.7, fontFamily: MONO }}>fx</span>}
            </div>
          </React.Fragment>
        ))}
        <div style={abs(phX - 0.5, RULER_Y, { width: 1.5, height: 22 + 4 * TRK_H + 6, background: "#4D9BFF" })} />
        <div style={abs(phX - 5, RULER_Y, { width: 10, height: 9, background: "#4D9BFF", clipPath: "polygon(0 0,100% 0,100% 55%,50% 100%,0 55%)" })} />
        {marquee && <div style={abs(marquee.x, marquee.y, { width: marquee.w, height: marquee.h, border: "1px solid rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.08)" })} />}

        {/* the NullRig panel */}
        <div style={abs(PX, PY, { width: PW, height: PH, borderRadius: 12, overflow: "hidden", background: "#232323", border: "1px solid " + C.line, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" })}>
          <iframe ref={frameRef} srcDoc={PANEL_HTML} title="NullRig panel" tabIndex={-1} style={{ width: PW, height: PH, border: 0, display: "block", pointerEvents: "none", background: "#232323" }} />
        </div>

        {/* ripples + cursor */}
        {ripples.map((r, i) => { const d = 10 + (r.dt / 600) * 44; return <div key={i} style={abs(r.x - d / 2, r.y - d / 2, { width: d, height: d, borderRadius: d, border: "1.5px solid " + C.green, opacity: 1 - r.dt / 600, boxSizing: "border-box" })} /> })}
        {t > 700 && <div style={abs(cur.x - 5, cur.y - 3, { transform: pressed ? "scale(0.86)" : "none", transformOrigin: "5px 3px", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.7))", pointerEvents: "none" })}>
          <svg width="22" height="22" viewBox="0 0 28 28"><path d="M5.2 3.1L22.6 12.7C23.7 13.3 23.4 15 22.1 15.3L14.5 16.9L10.7 23.7C10.1 24.8 8.4 24.4 8.3 23.1L4.1 4.4C3.9 3.3 4.4 2.7 5.2 3.1Z" fill="#fff" stroke="#0D0E12" strokeWidth="1.8" strokeLinejoin="round" /></svg>
        </div>}
      </div>

      {/* caption */}
      <div style={{ position: "absolute", left: "50%", bottom: (small ? 12 : 18) + (showCtl ? (small ? 46 : 50) : 0), transition: "bottom 0.25s ease", width: Math.min(W - 24, 600), transform: "translateX(-50%) translateY(" + (1 - capOp) * 8 + "px)", opacity: capOp, display: "flex", alignItems: "center", gap: small ? 10 : 14, padding: small ? "10px 12px" : "12px 16px", borderRadius: 16, background: "rgba(18,19,22,0.9)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid #2E3137", boxShadow: "0 18px 45px rgba(0,0,0,0.6)", boxSizing: "border-box" }}>
        <span style={{ flexShrink: 0, width: small ? 30 : 36, height: small ? 30 : 36, borderRadius: 10, background: "rgba(92,205,116,0.12)", border: "1px solid rgba(92,205,116,0.45)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontSize: small ? 11 : 12, color: C.green }}>{String(CAPS.indexOf(cap) + 1).padStart(2, "0")}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: small ? 13 : 15, fontWeight: 600, lineHeight: 1.3 }}>{cap[2]}</div>
          <div style={{ fontSize: small ? 11.5 : 12.5, color: C.muted, lineHeight: 1.4, marginTop: 2 }}>{cap[3]}</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 2, width: (t / TOTAL) * 100 + "%", background: C.green, opacity: showCtl ? 0 : 0.8, transition: "opacity 0.2s" }} />
      <div style={{ position: "absolute", inset: 0, background: C.bg, opacity: fade, pointerEvents: "none" }} />

      {/* player controls */}
      {!staticMode && <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => { e.stopPropagation(); if (e.pointerType !== "mouse") setTouchUntil(Date.now() + 3500) }}
        style={{ position: "absolute", left: small ? 8 : 12, right: small ? 8 : 12, bottom: small ? 8 : 10, height: small ? 38 : 40, display: "flex", alignItems: "center", gap: small ? 4 : 8, padding: small ? "0 6px" : "0 10px", borderRadius: 12, background: "rgba(18,19,22,0.92)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid #2E3137", boxSizing: "border-box", opacity: showCtl ? 1 : 0, pointerEvents: showCtl ? "auto" : "none", transition: "opacity 0.2s", fontFamily: MONO, fontSize: 10.5, color: C.muted }}>
        {[
          { label: "Previous step", on: () => jumpCap(-1), icon: <path d="M3 2v10M12 2L5 7l7 5z" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /> },
          { label: paused ? "Play" : "Pause", on: togglePlay, icon: paused ? <path d="M4 2l8 5-8 5z" fill="currentColor" /> : <path d="M4 2h2v10H4zM9 2h2v10H9z" fill="currentColor" /> },
          { label: "Next step", on: () => jumpCap(1), icon: <path d="M11 2v10M2 2l7 5-7 5z" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /> },
        ].map((b) => <button key={b.label} type="button" aria-label={b.label} title={b.label} onClick={b.on}
          style={{ flexShrink: 0, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: 0, padding: 0, cursor: "pointer", background: b.on === togglePlay ? "rgba(92,205,116,0.16)" : "transparent", color: b.on === togglePlay ? C.green : "#D9DBDF" }}>
          <svg width="14" height="14" viewBox="0 0 14 14">{b.icon}</svg>
        </button>)}
        {!small && <span style={{ flexShrink: 0, minWidth: 30, textAlign: "right" }}>{fmt(shownT)}</span>}
        <div style={{ position: "relative", flex: 1, minWidth: 0, height: 28, display: "flex", alignItems: "center" }}>
          {CAPS.map(([a], i) => i > 0 && <span key={i} style={{ position: "absolute", left: "calc(" + (a / TOTAL) * 100 + "% - 1px)", top: 9, width: 2, height: 10, borderRadius: 1, background: i === capIdx ? C.green : "#4A4D55", pointerEvents: "none" }} />)}
          <input type="range" min={0} max={TOTAL} step={100} value={Math.round(shownT)} aria-label="Walkthrough position" aria-valuetext={fmt(shownT) + (capIdx >= 0 ? ", " + CAPS[capIdx][2] : "")}
            onChange={(e) => setScrub(+e.currentTarget.value)} onPointerUp={commitScrub} onKeyUp={commitScrub} onTouchEnd={commitScrub} onBlur={commitScrub}
            style={{ position: "relative", width: "100%", margin: 0, accentColor: C.green, cursor: "pointer", background: "transparent" }} />
        </div>
        <span style={{ flexShrink: 0, minWidth: small ? 0 : 30 }}>{small ? fmt(shownT) : fmt(TOTAL)}</span>
      </div>}
    </div>
  )
}

addPropertyControls(NullRigDemo, {
  speed: { type: ControlType.Number, title: "Speed", defaultValue: 1, min: 0.5, max: 2, step: 0.1 },
  canvasTime: { type: ControlType.Number, title: "Canvas Frame", defaultValue: 20, min: 0, max: 31.9, step: 0.1, unit: "s" },
})
