// shots/01_story.js: The Flying Machine That Lost to Two Bike Mechanics (9:16, Retro Print)
import { E, V, S, registerShot, mood, layer, blurLayer, veil, backdrop, ease, prog, clamp, lerp, rng, shake, wordTime, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { river, houseboat, WL, dunes, DUNE, museum } from '../sets/places.js';
import { aerodrome, wrightFlyer, newspaper } from '../props/machines.js';
import { LANGLEY, ORVILLE, WILBUR, MANLY, CROWD } from '../cast.js';

const wt = (w, info, fb) => (wordTime(w, info.shot.start - 0.1) ?? info.shot.start + fb) - info.shot.start;
const lbl = (g, s, x, y, o = {}) => text(g, s, x, y, { size: o.size || 46, color: o.color || S().ui.text, font: o.font || FONTS.ui, weight: 900, spacing: o.spacing ?? 3, align: o.align || 'center', alpha: o.a ?? 1, glow: o.glow || 0, glowColor: alpha(o.color || S().ui.gold, 0.6), italic: o.italic });
const card = (g, t) => { const M = mood('dusk'); backdrop(g, [shade(M.dark, -0.2), M.dark, shade(M.wall, -0.1)]); glow(g, E.W / 2, E.H * 0.4, E.W, S().ui.gold, 0.08); for (let i = 0; i < 6; i++) seg(g, [[0, E.H * (0.1 + i * 0.13)], [E.W, E.H * (0.1 + i * 0.13)]], 1, alpha(S().ui.text, 0.06)); FX.dust(g, t, { count: 20, color: '#f2e4c0', a: 0.25 }); };
const faceBgRiver = (g, t) => { blurLayer(g, 14, (g) => river(g, t, { z: 1.6, y: -120 }, { crowd: false })); veil(g, '#120c08', 0.35); };
const face = (g, t, outfit, expr, o = {}) => bigFace(g, E.W / 2 + (o.dx || 0), E.H * 0.47, (o.r || 330) * (1 + 0.03 * t), { outfit, expr, look: o.look || [0, 0], rimColor: mood('dusk').rim, rimSide: o.side ?? -1, blink: (t % 2.6) > 2.5, tilt: o.tilt });
const boatScene = (g, t, cam, o = {}) => { const r = river(g, t, cam, o); let lp; layer(g, cam, 0.7, (g) => { lp = houseboat(g, E.W / 2 + 20, r.wl + 40, 1.0, r.M); if (o.machine !== false) aerodrome(g, lp[0] + 40, lp[1] - 40, 0.7, { t, rim: r.M.rim, pitch: 0.09 }); }); return { ...r, lp }; };

registerShot('w01', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur); river(g, t, { z: 1.1 - 0.05 * k }, { crowd: false }); veil(g, '#120c08', 0.35);
  const a = ease.out(prog(t, 0.1, 0.6)); lbl(g, 'DECEMBER 8', E.W / 2, E.H * 0.3, { size: 96, color: S().ui.cream, a, font: FONTS.title, spacing: 6, glow: 16 }); lbl(g, '1903', E.W / 2, E.H * 0.38, { size: 150, color: S().ui.gold, a: ease.out(prog(t, 1.2, 1.6)), font: FONTS.title, glow: 22, spacing: 10 });
  lbl(g, 'WASHINGTON, D.C.', E.W / 2, E.H * 0.45, { size: 40, a: ease.out(prog(t, 1.6, 2.0)), spacing: 8 });
} });
registerShot('w02', { draw(g, t, info) { const k = ease.inOut(t / info.dur); river(g, t, { z: 1.0 + 0.06 * k, x: -40 * k }); lbl(g, 'THE POTOMAC RIVER', E.W / 2, E.H * 0.14, { a: ease.out(prog(t, 0.6, 1.0)), size: 44, spacing: 6 }); } });
registerShot('w03', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 + 0.12 * k, y: -60 * k }; const { lp, M } = boatScene(g, t, cam);
  const tc = wt('catapult', info, 2.6); layer(g, cam, 0.7, (g) => UI.callout(g, t, { at: [lp[0] - 120, lp[1] + 30], to: [lp[0] - 330, lp[1] - 260], str: 'CATAPULT', start: tc - 0.2, color: S().ui.gold }));
  lbl(g, 'THE AERODROME', E.W / 2, E.H * 0.14, { a: ease.out(prog(t, 0.6, 1.0)), size: 50, color: S().ui.gold, glow: 10 });
} });
registerShot('w04', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.5 + 0.06 * k, y: 260, x: -120 };
  const { M } = boatScene(g, t, cam, { crowd: false });
  layer(g, cam, 1, (g) => { const by = E.H * 0.82; g.fillStyle = shade(M.dark, -0.2); g.fillRect(-E.W, by, E.W * 3, E.H); drawFigure(g, { x: E.W / 2 - 120, y: by, s: 1.7, facing: 1, outfit: LANGLEY, pose: breathe(posesAt(t, [[0, POSES.stand], [0.8, POSES.crossArms]]), t), expr: 'determined', look: [1, -0.3], rim: { color: M.rim, dir: [1, -0.6], w: 5 } }); });
  const tl = wt('langley', info, 1.2); lbl(g, 'SAMUEL LANGLEY', E.W / 2, E.H * 0.13, { color: S().ui.gold, a: ease.out(prog(t, tl, tl + 0.3)), size: 58, glow: 12 }); lbl(g, 'HEAD OF THE SMITHSONIAN', E.W / 2, E.H * 0.18, { a: ease.out(prog(t, tl + 0.5, tl + 0.9)), size: 34 });
} });
registerShot('w05', { draw(g, t, info) {
  card(g, t); const ui = S().ui, tf = wt('fifty', info, 1.4), v = Math.round(lerp(0, 50000, ease.out(prog(t, tf - 0.8, tf + 0.6))) / 100) * 100;
  lbl(g, 'U.S. ARMY GRANT', E.W / 2, E.H * 0.24, { size: 48, spacing: 6, a: ease.out(prog(t, 0.2, 0.6)) });
  text(g, '$' + v.toLocaleString('en-US'), E.W / 2, E.H * 0.36, { size: 170, color: ui.gold, font: FONTS.ui, weight: 900, glow: 22, glowColor: alpha(ui.gold, 0.5) });
  const r = rng(2); for (let i = 0; i < 12; i++) { const p = prog(t, 0.3 + i * 0.15, 1.2 + i * 0.15); if (p <= 0) continue; const x = E.W * 0.15 + r() * E.W * 0.7, y = lerp(-60, E.H * 0.55 + r() * 60, ease.in(Math.min(1, p))); circle(g, x, y, 26, ui.gold); ring(g, x, y, 26, 4, shade(ui.gold, -0.3)); }
} });
registerShot('w06', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur); boatScene(g, t, { z: 1.08 + 0.04 * k }, { cheer: true });
  const p = ease.out(prog(t, 0.2, 0.9)); newspaper(g, E.W / 2, E.H * 0.3, 680 * (0.4 + 0.6 * p), 700 * (0.4 + 0.6 * p), { head: 'WILL MAN FLY?', sub: 'All eyes on the Potomac', rot: (1 - p) * 6 - 0.06, a: clamp(p * 2) });
} });
registerShot('w07', { draw(g, t, info) {
  const M = mood('dusk'), launch = ease.in(prog(t, 0.25, 1.4)), cam = { z: 1.8, x: 120 + launch * 500, y: -160 - launch * 200 };
  river(g, t, cam, { crowd: false }); layer(g, cam, 0.7, (g) => { const lp = houseboat(g, E.W / 2 + 20, WL() + 40, 1.0, M); aerodrome(g, lp[0] + 40 + launch * 700, lp[1] - 30 - launch * 120, 0.55, { t, rim: M.rim, pitch: 0.09 }); });
  if (t > 0.25) FX.speedLines(g, t, { count: 50, a: 0.3 * (1 - prog(t, 0.25, 1.2)) });
} });
registerShot('w08', { draw(g, t, info) {                    // snaps apart and plunges
  const M = mood('dusk'), ts = wt('snaps', info, 0.5), tp = wt('plunges', info, 1.6), br = ease.out(prog(t, ts, ts + 1.6)), fall = ease.in(prog(t, ts + 0.2, tp + 0.9)), [sx, sy] = t > ts ? shake(t, 8 * (1 - prog(t, ts, ts + 1)), 20) : [0, 0];
  const cam = { z: 1.2, x: 100 + sx, y: -40 + sy };
  river(g, t, cam, { crowd: false }); layer(g, cam, 0.7, (g) => { houseboat(g, E.W / 2 - 300, WL() + 40, 1.0, M); aerodrome(g, E.W / 2 + 160, lerp(WL() - 260, WL() + 30, fall), 0.6, { t, rim: M.rim, broken: br, pitch: -0.5 * fall });
    const ss = prog(t, tp + 0.7, tp + 2.0); if (ss > 0 && ss < 1) { for (let i = 0; i < 18; i++) { const a = -Math.PI / 2 + (i - 9) * 0.12, d = 400 * ss; circle(g, E.W / 2 + 160 + Math.cos(a) * d * 0.7, WL() + 30 + Math.sin(a) * d + 300 * ss * ss, 12 * (1 - ss), alpha('#e8eef0', 0.9)); } FX.rings(g, E.W / 2 + 160, WL() + 40, ss, { count: 3, r0: 40, r1: 400, color: '#e8eef0', a: 0.5 * (1 - ss) }); } });
} });
registerShot('w09', { draw(g, t, info) {
  faceBgRiver(g, t); face(g, t, MANLY, t < 1.4 ? 'surprised' : 'worried', { look: [0.2, -0.3] });
  const r = rng(6); for (let i = 0; i < 16; i++) { const x = E.W / 2 + (r() - 0.5) * 600, y = E.H * 0.3 + ((r() * 600 + t * 260) % 700); circle(g, x, y, 6 + r() * 6, alpha('#cfe4ff', 0.7)); }
  FX.snow(g, t, { count: 40, color: '#ffffff', speed: 50 });
} });
registerShot('w10', { draw(g, t, info) {
  card(g, t); const ui = S().ui;
  [['OCT 7', 0.6], ['DEC 8', 1.2]].forEach(([s, t0], i) => { const y = E.H * (0.24 + i * 0.16), a = ease.out(prog(t, t0 - 0.3, t0)); lbl(g, s + ', 1903', E.W * 0.4, y, { size: 64, color: ui.cream, a, font: FONTS.title }); const p = ease.outBack(prog(t, t0, t0 + 0.25)); if (p > 0) { g.save(); g.translate(E.W * 0.8, y); g.scale(p, p); seg(g, [[-50, -50], [50, 50]], 18, ui.accent); seg(g, [[50, -50], [-50, 50]], 18, ui.accent); g.restore(); } });
  lbl(g, 'CRASH #1 · CRASH #2', E.W / 2, E.H * 0.6, { a: ease.out(prog(t, 1.6, 2.0)), size: 40, color: ui.accent });
} });
registerShot('w11', { draw(g, t, info) {
  card(g, t); const p = ease.out(prog(t, 0, 0.7));
  newspaper(g, E.W / 2, E.H * 0.38, 820, 860 * (0.4 + 0.6 * p), { head: 'FLYING MACHINES', sub: 'which do not fly', rot: (1 - p) * -5 + 0.03, a: clamp(p * 2) });
  lbl(g, 'NEWSPAPER EDITORIAL · OCT 1903', E.W / 2, E.H * 0.1, { size: 32, a: ease.out(prog(t, 0.8, 1.2)), spacing: 4 });
} });
registerShot('w12', { draw(g, t, info) {
  card(g, t); const ui = S().ui, tt = wt('ten', info, 0.9), v = t < tt ? Math.round(lerp(1, 1000000, ease.in(prog(t, 0, tt)))) : Math.round(lerp(1000000, 10000000, ease.out(prog(t, tt, tt + 0.8))));
  lbl(g, 'TIME UNTIL HUMANS FLY?', E.W / 2, E.H * 0.2, { size: 44, spacing: 4 });
  text(g, v.toLocaleString('en-US'), E.W / 2, E.H * 0.34, { size: 128, color: ui.gold, font: FONTS.ui, weight: 900, glow: 18, glowColor: alpha(ui.gold, 0.5) });
  lbl(g, 'YEARS', E.W / 2, E.H * 0.43, { size: 80, color: ui.cream, font: FONTS.title, spacing: 10 });
  lbl(g, '(1 TO 10 MILLION, THE PAPER SAID)', E.W / 2, E.H * 0.52, { size: 30, a: ease.out(prog(t, tt + 0.6, tt + 1)), color: ui.sub });
} });
registerShot('w13', { draw(g, t, info) {
  card(g, t); const ui = S().ui, d = Math.min(17, 8 + Math.floor(clamp(t / 1.2) * 9)), cx = E.W / 2, cy = E.H * 0.34;
  rr(g, cx - 220, cy - 240, 440, 460, 30); g.fillStyle = '#efe4c8'; g.fill(); rr(g, cx - 220, cy - 240, 440, 110, 30); g.fillStyle = ui.accent; g.fill(); g.fillRect(cx - 220, cy - 160, 440, 30);
  text(g, 'DEC 1903', cx, cy - 185, { size: 52, color: '#fff4dc', font: FONTS.ui, weight: 900, spacing: 4 }); text(g, String(d), cx, cy + 50, { size: 230, color: '#2a2018', font: FONTS.ui, weight: 900 });
  const a = ease.outBack(prog(t, 1.2, 1.5)); if (a > 0) lbl(g, 'JUST 9 DAYS LATER', cx, E.H * 0.6, { size: 60, color: ui.gold, a: clamp(a), glow: 14, font: FONTS.title });
} });
const prone = (M) => (g) => { g.save(); g.translate(0, -12); drawFigure(g, { x: 20, y: 0, s: 0.42, facing: 1, outfit: ORVILLE, pose: POSES.stand, rot: Math.PI / 2, expr: 'determined', rim: { color: M.rim, dir: [0, -1] }, shadow: false }); g.restore(); };
registerShot('w14', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.02 + 0.08 * k, x: 30 * k }; const { gy, M } = dunes(g, t, cam);
  layer(g, cam, 0.8, (g) => { wrightFlyer(g, E.W / 2 + 40, gy + 30, 1.3, { t, rim: M.rim, pilot: prone(M) }); drawFigure(g, { x: E.W / 2 - 380, y: gy + 70, s: 1.0, facing: 1, outfit: WILBUR, pose: breathe(POSES.stand, t), expr: 'determined', rim: { color: M.rim, dir: [-0.6, -1] } }); });
  const tk = wt('kitty', info, 1.4); lbl(g, 'KITTY HAWK, N.C.', E.W / 2, E.H * 0.13, { color: S().ui.gold, a: ease.out(prog(t, tk - 0.2, tk + 0.2)), size: 56, glow: 12, font: FONTS.title }); lbl(g, 'DECEMBER 17, 1903', E.W / 2, E.H * 0.18, { a: ease.out(prog(t, 0.4, 0.8)), size: 36, spacing: 5 });
} });
registerShot('w15', { draw(g, t, info) {
  const cam = { z: 1.15, x: 60 * t }, { gy, M } = dunes(g, t, cam), lift = ease.inOut(prog(t, 0.6, 2.4)), x = E.W / 2 - 200 + t * 140;
  layer(g, cam, 0.8, (g) => { wrightFlyer(g, x, gy + 30 - lift * 300, 1.3, { t, rim: M.rim, pitch: 0.05 * lift, pilot: prone(M) }); const wx = x - 360 + t * 40, ph = t * 2 * Math.PI * 1.6; drawFigure(g, { x: wx, y: gy + 70, s: 1.0, facing: 1, outfit: WILBUR, pose: walkPose(ph, { run: true }), expr: 'joy', rim: { color: M.rim, dir: [-0.6, -1] } }); });
  const tw = wt('twelve', info, 1.8), v = Math.min(12, Math.floor(clamp((t - (tw - 0.6)) / 1.0) * 12)); if (t > tw - 0.6) UI.readout(g, { label: 'FLIGHT', value: v + ' SEC', x: E.W / 2, y: E.H * 0.16, align: 'center', size: 80 });
} });
registerShot('w16', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.35 + 0.05 * k, y: 120 }, { gy, M } = dunes(g, t, cam, { rail: false });
  layer(g, cam, 1, (g) => { const rim = { color: M.rim, dir: [-0.6, -1], w: 5 }; drawFigure(g, { x: E.W / 2 - 160, y: gy + 80, s: 1.7, facing: 1, outfit: ORVILLE, pose: breathe(POSES.relaxed, t), expr: 'smile', rim }); drawFigure(g, { x: E.W / 2 + 160, y: gy + 80, s: 1.7, facing: -1, outfit: WILBUR, pose: breathe(POSES.crossArms, t, 1, 3), expr: 'smirk', rim }); });
  const to = wt('orville', info, 0.1), tw = wt('wilbur', info, 0.7); lbl(g, 'ORVILLE', E.W / 2 - 230, E.H * 0.2, { color: '#3fb950', a: ease.out(prog(t, to, to + 0.3)), size: 54, font: FONTS.title }); lbl(g, 'WILBUR', E.W / 2 + 230, E.H * 0.2, { color: '#6a9ad5', a: ease.out(prog(t, tw, tw + 0.3)), size: 54, font: FONTS.title });
} });
registerShot('w17', { draw(g, t, info) {
  card(g, t); const ui = S().ui, x0 = E.W * 0.1, w = E.W * 0.8;
  const row = (y, name, val, frac, col, t0) => { lbl(g, name, x0, y - 70, { align: 'left', size: 52, color: col, font: FONTS.title }); rr(g, x0, y - 30, w, 60, 30); g.fillStyle = alpha(col, 0.15); g.fill(); rr(g, x0, y - 30, Math.max(60, w * frac * ease.out(prog(t, t0, t0 + 0.7))), 60, 30); g.fillStyle = col; g.fill(); lbl(g, val, x0 + w, y + 70, { align: 'right', size: 60, color: col, a: ease.out(prog(t, t0 + 0.4, t0 + 0.8)) }); };
  row(E.H * 0.24, 'LANGLEY', '$50,000', 1, ui.accent, 0.3); const tt = wt('thousand', info, 3.2); row(E.H * 0.46, 'THE WRIGHTS', '< $1,000', 0.02, ui.gold, tt - 0.5);
  lbl(g, 'NO GOVERNMENT MONEY', E.W / 2, E.H * 0.64, { size: 40, a: ease.out(prog(t, 0.1, 0.5)), spacing: 4 });
} });
registerShot('w18', { draw(g, t, info) { card(g, t); UI.bigLine(g, t, { str: 'BUT...', dur: info.dur + 0.3, y: E.H * 0.4, size: 160 }); } });
registerShot('w19', { draw(g, t, info) {                     // 1914: the rebuilt Aerodrome hops off a lake
  const M = mood('golden'), k = ease.inOut(t / info.dur), cam = { z: 1.1 }, wl = E.H * 0.62;
  layer(g, cam, 0.1, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, wl, M.sky); g.fillRect(-E.W, -E.H, E.W * 3, wl + E.H); FX.hills(g, { y: wl - 30, amp: 60, color: shade(M.floor, 0.2), seed: 2 }); });
  layer(g, cam, 0.5, (g) => { g.fillStyle = linGrad(g, 0, wl, 0, E.H, [mix(M.sky[1], M.wall, 0.4), shade(M.dark, -0.1)]); g.fillRect(-E.W, wl, E.W * 3, E.H); for (let i = 0; i < 8; i++) seg(g, [[E.W * 0.3 - i * 20, wl + 30 + i * 26], [E.W * 0.7 + i * 20, wl + 30 + i * 26]], 3, alpha(M.key, 0.25)); });
  const hop = Math.max(0, Math.sin(clamp((t - 1.2) / 2.2) * Math.PI)) * 120, x = E.W * 0.3 + t * 90;
  layer(g, cam, 0.8, (g) => { aerodrome(g, x, wl - 90 - hop, 0.85, { t, rim: M.rim, pitch: 0.05 }); rr(g, x - 200, wl - 10 - hop, 400, 30, 15); g.fillStyle = '#3a2a20'; g.fill(); if (hop < 10) for (let i = 0; i < 6; i++) seg(g, [[x - 160 - i * 40, wl + 10], [x - 200 - i * 40, wl + 10]], 3, alpha('#ffffff', 0.5)); });
  UI.badge(g, { str: '1914', x: E.W - 80, y: E.H * 0.12, size: 80 }); const tm = wt('modified', info, 1.8); lbl(g, 'MODIFIED', E.W / 2, E.H * 0.2, { color: S().ui.accent, a: ease.out(prog(t, tm, tm + 0.3)), size: 56, font: FONTS.title });
} });
registerShot('w20', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.1 + 0.08 * k, y: -40 }, { gy, M } = museum(g, t, cam);
  layer(g, cam, 0.8, (g) => aerodrome(g, E.W / 2, gy - 300, 0.8, { t: 0, rim: M.rim, pitch: 0.05 }));
  const tc = wt('claimed', info, 1.0), a = ease.outBack(prog(t, tc, tc + 0.4)); if (a > 0) { g.save(); g.translate(E.W / 2, E.H * 0.18); g.scale(a, a); rr(g, -230, -70, 460, 140, 20); g.fillStyle = '#efe4c8'; g.fill(); text(g, 'FIRST?', 0, 4, { size: 96, color: '#2a2018', font: FONTS.serif, weight: 900, italic: true }); g.restore(); glow(g, E.W / 2, E.H * 0.18, 400, S().ui.gold, 0.2 * clamp(a)); }
} });
registerShot('w21', { draw(g, t, info) { const [sx, sy] = shake(t, 8 * (1 - prog(t, 0.4, 1.2)) * (t > 0.4), 24); g.save(); g.translate(sx, sy); blurLayer(g, 14, (g) => dunes(g, t, { z: 1.6, y: -200 })); veil(g, '#120c08', 0.35); face(g, t, ORVILLE, 'angry', { look: [0.3, 0], side: 1 }); g.restore(); } });
registerShot('w22', { draw(g, t, info) {                     // crate ships to London
  card(g, t); const ui = S().ui, A = [E.W * 0.15, E.H * 0.46], B = [E.W * 0.85, E.H * 0.26], C = [E.W * 0.5, E.H * 0.12];
  lbl(g, 'USA', A[0], A[1] + 60, { size: 40 }); const tl = wt('london', info, 2.3); lbl(g, 'LONDON', B[0], B[1] + 60, { size: 44, color: ui.gold, a: ease.out(prog(t, tl - 0.2, tl + 0.2)) }); circle(g, A[0], A[1], 12, ui.text); circle(g, B[0], B[1], 12, ui.gold);
  g.setLineDash([12, 12]); g.strokeStyle = alpha(ui.text, 0.5); g.lineWidth = 4; g.beginPath(); g.moveTo(...A); g.quadraticCurveTo(...C, ...B); g.stroke(); g.setLineDash([]);
  const u = ease.inOut(prog(t, 0.2, 2.4)), px = (1 - u) ** 2 * A[0] + 2 * (1 - u) * u * C[0] + u * u * B[0], py = (1 - u) ** 2 * A[1] + 2 * (1 - u) * u * C[1] + u * u * B[1];
  rr(g, px - 50, py - 40, 100, 70, 6); g.fillStyle = '#8a6a44'; g.fill(); seg(g, [[px - 50, py - 40], [px + 50, py + 30]], 4, '#5a4030'); seg(g, [[px + 50, py - 40], [px - 50, py + 30]], 4, '#5a4030');
  lbl(g, '1928', E.W / 2, E.H * 0.6, { size: 70, color: ui.cream, font: FONTS.title, a: ease.out(prog(t, 0.4, 0.8)) }); lbl(g, 'THE ORIGINAL 1903 FLYER', E.W / 2, E.H * 0.66, { size: 36, a: ease.out(prog(t, 0.8, 1.2)) });
} });
registerShot('w23', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.15 - 0.08 * k, y: -40 }, { gy, M } = museum(g, t, cam), ty = wt('nineteen', info, 1.7), yr = Math.round(lerp(1928, 1948, ease.inOut(prog(t, 0.2, ty + 0.9))));
  layer(g, cam, 0.8, (g) => wrightFlyer(g, E.W / 2, gy - 220, 1.4, { t: 0, rim: M.rim }));
  text(g, String(yr), E.W / 2, E.H * 0.17, { size: 170, color: S().ui.gold, font: FONTS.title, weight: 700, glow: 20, glowColor: alpha(S().ui.gold, 0.5) }); lbl(g, 'HOME AT LAST', E.W / 2, E.H * 0.24, { size: 44, color: S().ui.cream, a: ease.out(prog(t, ty + 1.0, ty + 1.4)), spacing: 6 });
} });
registerShot('w24', { draw(g, t, info) {
  card(g, t); const M = mood('dusk'), rim = { color: M.rim, dir: [0, -1], w: 5 }, gy = E.H * 0.6;
  seg(g, [[E.W / 2, E.H * 0.12], [E.W / 2, E.H * 0.68]], 3, alpha(S().ui.text, 0.3));
  drawFigure(g, { x: E.W * 0.25, y: gy, s: 1.6, facing: 1, outfit: LANGLEY, pose: breathe(POSES.crossArms, t), expr: 'smirk', rim }); lbl(g, '$50,000', E.W * 0.25, E.H * 0.2, { size: 56, color: S().ui.accent });
  drawFigure(g, { x: E.W * 0.66, y: gy, s: 1.6, facing: -1, outfit: ORVILLE, pose: breathe(POSES.relaxed, t, 1, 2), expr: 'smile', rim }); drawFigure(g, { x: E.W * 0.84, y: gy, s: 1.6, facing: -1, outfit: WILBUR, pose: breathe(POSES.stand, t, 1, 4), expr: 'smile', rim }); lbl(g, '< $1,000', E.W * 0.75, E.H * 0.2, { size: 56, color: S().ui.gold });
  const p = ease.outBack(prog(t, 0.3, 0.7)); if (p > 0) text(g, '?', E.W / 2, E.H * 0.3, { size: 200 * p, color: S().ui.cream, glow: 20, glowColor: alpha(S().ui.gold, 0.6) });
} });
registerShot('w25', { draw(g, t, info) {
  card(g, t); const ui = S().ui, a = ease.out(prog(t, 0.1, 0.5)); text(g, 'FOLLOW', E.W / 2, E.H * 0.26, { size: 130, color: ui.cream, glow: 22, glowColor: alpha(ui.gold, 0.6), spacing: 6, alpha: a }); text(g, 'FOR MORE AVIATION HISTORY', E.W / 2, E.H * 0.33, { size: 46, color: ui.gold, spacing: 3, alpha: a });
  const p = ease.outBack(prog(t, 0.4, 0.8)); g.save(); g.translate(E.W / 2, E.H * 0.42); g.scale(p, p); rr(g, -190, -48, 380, 96, 48); g.fillStyle = ui.accent; g.fill(); text(g, '+ FOLLOW', 0, 2, { size: 48, color: '#fff4dc', font: FONTS.ui, weight: 900, spacing: 3 }); g.restore();
  wrightFlyer(g, lerp(-300, E.W + 300, t / info.dur), E.H * 0.1, 0.4, { t, rim: mood('dusk').rim });
  [LANGLEY, ORVILLE, WILBUR].forEach((of, i) => { const k = ease.out(prog(t, 0.3 + i * 0.1, 0.7 + i * 0.1)); drawFigure(g, { x: E.W / 2 + (i - 1) * 220, y: E.H * 0.72 + (1 - k) * 40, s: 1.5, facing: 1, outfit: of, pose: i ? POSES.wave : POSES.crossArms, expr: 'smile', alpha: k, rim: { color: mood('dusk').rim, dir: [0, 1] } }); });
} });
