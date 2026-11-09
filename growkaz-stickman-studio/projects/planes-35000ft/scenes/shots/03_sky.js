// shots/03_sky.js: exterior sky shots
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, rng, shake, wordTime, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, walkPose, breathe } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { sky, nearClouds, cloudDeck, everest, deckY } from '../sets/sky.js';
import { airliner } from '../props/plane.js';
import { PAX } from '../cast.js';

const WARN = '#ff5a4f';
const body = (M) => mix(M.wall, M.ambient, 0.5);
const wt = (w, info, fb) => (wordTime(w, info.shot.start - 0.1) ?? info.shot.start + fb) - info.shot.start;
const plane = (g, t, M, x, y, s, o = {}) => airliner(g, x, y, s, { t, body: body(M), rim: M.rim, win: M.practical, ...o });
function airDots(g, t, n, color, speed, seed = 2, a = 0.6) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = ((r() * E.W * 1.4 - t * speed * (0.6 + r() * 0.8)) % (E.W * 1.4) + E.W * 1.4) % (E.W * 1.4) - E.W * 0.2, y = r() * E.H; circle(g, x, y, 2 + r() * 3, alpha(color, a)); } }
function label(g, str, t, t0, y = E.H * 0.16, color) { const p = ease.outBack(prog(t, t0, t0 + 0.4)); if (p <= 0) return; g.save(); g.translate(E.W / 2, y); g.scale(p, p); text(g, str, 0, 0, { size: V(72, 76), color: color || S().ui.gold, glow: 22, glowColor: alpha(color || S().ui.accent, 0.6), spacing: 3 }); g.restore(); }

registerShot('s06', { draw(g, t, info) {                  // title card
  const k = ease.inOut(t / info.dur), cam = { z: 1.08 - 0.06 * k, y: -20 * k };
  const { DY, M } = sky(g, t, cam, { mood: 'golden', sunX: 0, sunY: 30 });
  layer(g, cam, 0.9, (g) => plane(g, t, M, E.W * 0.2 + t * 60, DY - V(120, 260), V(0.35, 0.3), { contrail: 0.7 }));
  veil(g, '#020a10', 0.25);
  UI.titleCard(g, t, { lines: ['WHY PLANES FLY AT', '35,000 FEET'], dur: info.dur, y: E.H * V(0.4, 0.36) });
} });
registerShot('s08', { draw(g, t, info) {                  // Everest + 1 mile
  const k = ease.inOut(t / info.dur), cam = { z: 1.04 + 0.05 * k, x: 20 * k };
  const { DY, M } = sky(g, t, cam, { mood: 'dusk', everest: true, everestX: V(-200, -80), everestS: V(0.75, 0.8), sunX: V(500, 200), sunY: 120 });
  const peakX = E.W / 2 - V(200, 80), peakY = DY + 30 - 560 * V(0.75, 0.8), py = peakY - V(200, 260);
  layer(g, cam, 0.25, (g) => {
    plane(g, t, M, E.W * 0.55 + t * 40, py, V(0.42, 0.3));
    UI.dimension(g, t, { x1: peakX + V(190, 120), y1: peakY, x2: peakX + V(190, 120), y2: py + 10, str: '+1 MILE', start: wt('more', info, 1.2) });
    UI.callout(g, t, { at: [peakX, peakY + 10], to: [peakX - V(260, 160), peakY + 140], str: 'EVEREST', start: wt('everest', info, 0.6) });
  });
  nearClouds(g, t, cam, M);
} });
registerShot('s11', { draw(g, t, info) {                  // lower: thick warm air
  const k = ease.inOut(t / info.dur), cam = { z: 1.06, y: 60 * k };
  const { DY, M } = sky(g, t, cam, { mood: 'golden', deckY: E.H * 0.55, sunX: V(500, 200), sunY: 140 });
  airDots(g, t, 260, M.fog, 120, 3, 0.45);
  layer(g, cam, 1, (g) => plane(g, t, M, E.W * 0.45, lerp(E.H * 0.3, E.H * 0.55, k), V(0.6, 0.45), { pitch: -0.08 }));
  FX.fog(g, E.H * 0.35, E.H * 0.7, M.fog, 0.35);
  label(g, 'LOWER?', t, 0.3);
} });
registerShot('s12', { draw(g, t, info) {                  // higher: empty, starry
  const k = ease.inOut(t / info.dur), cam = { z: 1.06, y: -80 * k };
  const { DY, M } = sky(g, t, cam, { mood: 'night', deckY: E.H * 1.0 });
  airDots(g, t, 30, M.rim, 60, 5, 0.4);
  layer(g, cam, 1, (g) => plane(g, t, M, E.W * 0.45, lerp(E.H * 0.65, E.H * 0.42, k), V(0.6, 0.45), { pitch: 0.12 }));
  label(g, 'HIGHER?', t, 0.3);
} });
registerShot('s15', { draw(g, t, info) {                  // chapter: thin air = cheap air
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 - 0.04 * k, x: -30 * k };
  const { M } = sky(g, t, cam, { mood: 'dusk', sunX: 0, sunY: 60 }); veil(g, '#020a10', 0.35);
  UI.bigLine(g, t, { str: 'THIN AIR = CHEAP AIR', dur: info.dur, y: E.H * 0.46 });
} });
registerShot('s16', { draw(g, t, info) {                  // wading through water
  const k = ease.inOut(t / info.dur), M = mood('dusk'), cam = { z: 1.15 + 0.05 * k, x: 20 * k, y: 40 }, WL = E.H * V(0.68, 0.6);
  layer(g, cam, 0.15, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, WL, M.sky); g.fillRect(-E.W, -E.H, E.W * 3, WL + E.H); FX.sun(g, E.W * 0.7, WL - 40, 60, '#ffffff', M.key, 5); });
  layer(g, cam, 0.4, (g) => { g.fillStyle = linGrad(g, 0, WL, 0, E.H * 1.4, [shade(M.wall, 0.1), shade(M.dark, -0.3)]); g.fillRect(-E.W, WL, E.W * 3, E.H); for (let i = 0; i < 14; i++) seg(g, [[E.W * 0.7 - 300 + i * 30 - (i % 3) * 60, WL + 20 + i * 18], [E.W * 0.7 - 260 + i * 30 + (i % 3) * 50, WL + 20 + i * 18]], 3, alpha(M.key, 0.3 * (1 - i / 14))); });
  const x = E.W * 0.42 + t * 25, s = V(1.9, 1.9), y = WL + 120 * s, ph = t * 2 * Math.PI * 0.45;
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x, y, s, facing: 1, outfit: PAX, pose: walkPose(ph), rot: 0.12, expr: 'determined', rim: { color: M.rim, dir: [0.8, -0.6], w: 4 }, shadow: false });
    g.fillStyle = alpha(shade(M.wall, -0.1), 0.88); g.fillRect(-E.W, WL + 30, E.W * 3, E.H);
    for (let i = 0; i < 4; i++) { const ph2 = (t * 0.8 + i / 4) % 1; g.strokeStyle = alpha(M.rim, 0.6 * (1 - ph2)); g.lineWidth = 3; g.beginPath(); g.ellipse(x + 30 * s, WL + 32, 40 + ph2 * 260, 8 + ph2 * 26, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke(); }
    for (let i = 0; i < 6; i++) { const xx = x + 260 + ((i * 90 - t * 160) % 520 + 520) % 520; seg(g, [[xx, WL + 60 + i * 12], [xx - 70, WL + 60 + i * 12]], 4, alpha(M.rim, 0.4)); poly(g, [[xx - 80, WL + 60 + i * 12], [xx - 64, WL + 52 + i * 12], [xx - 64, WL + 68 + i * 12]], alpha(M.rim, 0.4)); }
  });
  FX.dust(g, t, { count: 20, color: '#e8fbff', a: 0.2 });
} });
registerShot('s19', { draw(g, t, info) {                  // less drag
  const k = ease.inOut(t / info.dur), cam = { z: 1.1 + 0.04 * k };
  const { DY, M } = sky(g, t, cam, { mood: 'night' });
  airDots(g, t, 40, M.rim, 900, 7, 0.5);
  const px = E.W * 0.55, py = E.H * 0.42, ui = S().ui;
  layer(g, cam, 1, (g) => {
    plane(g, t, M, px, py, V(0.55, 0.4));
    const L = lerp(420, 120, ease.inOut(prog(t, 0.5, 2.0))), x0 = px - 480 * V(0.55, 0.4) - 30;
    seg(g, [[x0, py], [x0 - L, py]], 10, ui.accent); poly(g, [[x0 - L - 30, py], [x0 - L, py - 20], [x0 - L, py + 20]], ui.accent);
    text(g, 'DRAG', x0 - L / 2, py - 42, { size: 40, color: ui.accent, font: FONTS.ui, weight: 900, spacing: 3 });
  });
  FX.speedLines(g, t, { cx: px, cy: py, count: 40, a: 0.12 });
} });
registerShot('s22', { draw(g, t, info) {                  // climb forever?
  const k = ease.inOut(t / info.dur), cam = { z: 1.05, y: -160 * k };
  const { DY, M } = sky(g, t, cam, { mood: 'night' });
  layer(g, cam, 1, (g) => plane(g, t, M, E.W * 0.35 + t * 140, E.H * 0.7 - t * 160, V(0.55, 0.42), { pitch: 0.38 }));
  label(g, 'FOREVER?', t, 0.6, E.H * 0.2);
} });
registerShot('s31', { draw(g, t, info) {                  // the sweet spot
  const k = ease.inOut(t / info.dur), cam = { z: 1.04 + 0.04 * k };
  const { DY, M } = sky(g, t, cam, { mood: 'dusk', sunX: V(-600, -200), sunY: 60 });
  const by = E.H * 0.38, ui = S().ui, ts = wt('sweet', info, 1.4);
  layer(g, cam, 0.7, (g) => { g.fillStyle = linGrad(g, 0, by - 70, 0, by + 70, [alpha(ui.accent, 0), alpha(ui.accent, 0.22), alpha(ui.accent, 0)]); g.fillRect(-E.W, by - 70, E.W * 3, 140); seg(g, [[-E.W, by], [E.W * 2, by]], 2, alpha(ui.accent, 0.5)); });
  const yy = lerp(E.H * 0.62, by, ease.inOut(prog(t, 0, 1.6))), pitch = 0.12 * (1 - ease.inOut(prog(t, 0.8, 1.8)));
  layer(g, cam, 1, (g) => plane(g, t, M, E.W * 0.38 + t * 50, yy, V(0.45, 0.35), { pitch }));
  const p = ease.out(prog(t, ts, ts + 0.4)); if (p > 0) text(g, 'SWEET SPOT', E.W * 0.78, by - 100, { size: V(48, 52), color: ui.gold, font: FONTS.ui, weight: 900, spacing: 4, alpha: p, glow: 16, glowColor: alpha(ui.accent, 0.6) });
  nearClouds(g, t, cam, M);
} });
function stormDeck(g, t, cam, M, y, o = {}) {
  layer(g, cam, 0.5, (g) => {
    cloudDeck(g, y, shade(M.wall, -0.2), M.rim, 9, t, { n: 50, size: 1.1, lit: 0.25, drift: 10 });
    const fl = (Math.floor(t * 3.1) * 7) % 5; if (((t * 3.1) % 1) < 0.18) { glow(g, E.W * (0.2 + fl * 0.15), y + 120, 380, '#dfe8ff', 0.5); }
    g.save(); g.beginPath(); g.rect(-E.W, y + 80, E.W * 3, E.H); g.clip(); FX.rain(g, t, { count: 160 }); g.restore();
  });
}
registerShot('s35', { draw(g, t, info) {                  // above the storm
  const k = ease.inOut(t / info.dur), cam = { z: 1.04 + 0.05 * k, x: -40 * k };
  const M = mood('storm'), DY = E.H * 0.62;
  sky(g, t, cam, { mood: 'night', deckY: E.H * 1.3 });
  stormDeck(g, t, cam, M, DY);
  layer(g, cam, 1, (g) => plane(g, t, mood('night'), E.W * 0.4 + t * 30, E.H * 0.3, V(0.5, 0.38)));
  UI.callout(g, t, { at: [E.W * 0.2, DY + 60], to: [E.W * 0.1, E.H * 0.9], str: 'RAIN · CLOUD · CHAOS', start: wt('rain', info, 2.4) });
} });
registerShot('s37', { draw(g, t, info) {                  // thunderhead punches through; plane steers around
  const k = ease.inOut(t / info.dur), cam = { z: 1.02 + 0.05 * k };
  const M = mood('storm'), NM = mood('night'), DY = E.H * 0.7, cx = E.W * 0.58, grow = ease.out(prog(t, 0, 2.2));
  sky(g, t, cam, { mood: 'night', deckY: E.H * 1.3 });
  layer(g, cam, 0.45, (g) => {
    const top = lerp(DY, E.H * 0.08, grow);
    seg(g, [[-E.W, E.H * 0.34], [E.W * 2, E.H * 0.34]], 2, alpha(S().ui.accent, 0.5));
    for (let i = 0; i < 14; i++) { const u = i / 13, y = lerp(DY, top, u), r = lerp(260, 140, u) * (1 + 0.2 * Math.sin(i * 2.1)); circle(g, cx + Math.sin(i * 1.7) * 60, y, r, mix(shade(M.wall, -0.1), M.rim, u * 0.25)); }
    for (let i = 0; i < 9; i++) circle(g, cx - 320 + i * 85, top + 70 + Math.abs(i - 4) * 6, 90 - Math.abs(i - 4) * 6, mix(shade(M.wall, 0), M.rim, 0.22));
    if (((t * 2.3) % 1) < 0.12) FX.lightning(g, { x1: cx + 40, y1: top + 160, x2: cx - 30, y2: DY, seed: Math.floor(t * 2.3) });
  });
  stormDeck(g, t, cam, M, DY);
  const ts = wt('steer', info, 3.6), u = ease.inOut(prog(t, ts - 1.4, ts + 1.2));
  const ppx = lerp(E.W * 0.05, E.W * 1.05, u), ppy = E.H * 0.3 + Math.sin(u * Math.PI) * 0 - Math.sin(u * Math.PI) * 10;
  layer(g, cam, 0.8, (g) => { g.setLineDash([14, 14]); g.strokeStyle = alpha(S().ui.gold, 0.6); g.lineWidth = 4; g.beginPath(); g.moveTo(E.W * 0.05, E.H * 0.3); g.quadraticCurveTo(cx, E.H * 0.3 + V(-40, 0) - 0, E.W * 1.05, E.H * 0.3); g.stroke(); g.setLineDash([]); });
  layer(g, cam, 1, (g) => plane(g, t, NM, ppx, ppy, V(0.3, 0.25)));
} });
registerShot('s38', { draw(g, t, info) {                  // chapter: the wind
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 - 0.03 * k };
  const { M } = sky(g, t, cam, { mood: 'dusk', sunX: V(-500, -200) }); veil(g, '#020a10', 0.35);
  for (let i = 0; i < 16; i++) { const y = E.H * (0.15 + i * 0.05), x = ((t * 1400 + i * 260) % (E.W + 800)) - 400; seg(g, [[x, y], [x + 300 + (i % 3) * 80, y]], 3, alpha(S().ui.accent, 0.35)); }
  UI.bigLine(g, t, { str: 'THE WIND', dur: info.dur, y: E.H * 0.46 });
} });
registerShot('s40', { draw(g, t, info) {                  // riding the jet stream
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 + 0.04 * k };
  const { DY, M } = sky(g, t, cam, { mood: 'dusk', sunX: V(-500, -200) });
  const ui = S().ui, yb = E.H * 0.45, wave = (x) => yb + Math.sin(x / 300) * 40;
  layer(g, cam, 0.9, (g) => { for (let j = -2; j <= 2; j++) { g.strokeStyle = alpha(ui.accent, 0.25 + 0.1 * (2 - Math.abs(j))); g.lineWidth = 6; g.setLineDash([60, 40]); g.lineDashOffset = -t * 600; g.beginPath(); for (let x = -E.W; x <= E.W * 2; x += 20) { const y = wave(x) + j * 26; x === -E.W ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); } g.setLineDash([]); glow(g, E.W / 2, yb, 600, ui.accent, 0.12); });
  const px = E.W * 0.45;
  layer(g, cam, 1, (g) => plane(g, t, M, px, wave(px + t * 400) - 70, V(0.5, 0.38), { pitch: Math.cos((px + t * 400) / 300) * 0.06 }));
  FX.speedLines(g, t, { cx: px, cy: yb, count: 50, a: 0.15 });
  const te = wt('early', info, 1.3); UI.badge(g, { str: 'ARRIVE EARLY', a: ease.out(prog(t, te, te + 0.4)), size: V(40, 44) });
} });
registerShot('s42', { draw(g, t, info) {                  // traffic: blinking lights everywhere
  const k = ease.inOut(t / info.dur), cam = { z: 1.0 + 0.05 * k };
  const { M } = sky(g, t, cam, { mood: 'night', deckY: E.H * 0.85 });
  const r = rng(12);
  for (let i = 0; i < 26; i++) {
    const dir = r() > 0.5 ? 1 : -1, y = E.H * (0.12 + r() * 0.6), sp = 40 + r() * 90, x = ((r() * E.W + dir * t * sp) % E.W + E.W) % E.W, s = 0.06 + r() * 0.1;
    if (s > 0.12) airliner(g, x, y, s, { t: t + i, body: shade(M.wall, -0.1), rim: M.rim, win: M.practical, facing: dir, lights: true });
    else { circle(g, x, y, 2.5, alpha('#ffffff', 0.7)); if (((t + i * 0.37) % 1.2) < 0.1) glow(g, x, y, 26, i % 2 ? '#ff4040' : '#ffffff', 0.9); }
  }
} });
registerShot('s55', { draw(g, t, info) {                  // final wide: above Everest at sunset, pull out
  const k = ease.inOut(t / info.dur), cam = { z: 1.15 - 0.15 * k, y: -30 * k };
  const { DY, M } = sky(g, t, cam, { mood: 'golden', everest: true, everestX: V(220, 100), everestS: V(0.8, 0.9), sunX: V(-420, -150), sunY: 70 });
  layer(g, cam, 0.6, (g) => plane(g, t, M, E.W * 0.28 + t * 30, DY - V(560, 760), V(0.3, 0.24), { contrail: 0.9 }));
  nearClouds(g, t, cam, M);
  FX.lensStreak(g, E.W / 2 - V(420, 150), DY - 70, E.W * 1.4, '#e8fbff', 0.2);
  FX.dust(g, t, { count: 20, color: '#ffffff', a: 0.2 });
} });
registerShot('s57', { draw(g, t, info) {                  // teaser: turbulence
  const tt = wt('turbulence', info, 3.6), [sx, sy] = shake(t, t > 1.0 ? 14 : 4, 18), cam = { z: 1.08, x: sx, y: sy };
  const M = mood('storm');
  sky(g, t, cam, { mood: 'storm', deckY: E.H * 0.8 });
  layer(g, cam, 0.3, (g) => { if (((t * 1.7) % 1) < 0.1) { veil(g, '#dfe8ff', 0.25); FX.lightning(g, { x1: E.W * 0.75, y1: 0, x2: E.W * 0.7, y2: E.H * 0.8, seed: Math.floor(t * 1.7) + 3 }); } });
  layer(g, cam, 1, (g) => plane(g, t, M, E.W * 0.45 + Math.sin(t * 7) * 6, E.H * 0.42 + Math.sin(t * 11) * 14, V(0.55, 0.42), { pitch: Math.sin(t * 5) * 0.06 }));
  FX.rain(g, t, { count: 260 });
  const a = ease.out(prog(t, tt, tt + 0.4)); if (a > 0) { veil(g, '#000', 0.4 * a); text(g, 'NEXT:', E.W / 2, E.H * 0.38, { size: V(44, 48), color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 6, alpha: a }); text(g, 'TURBULENCE', E.W / 2, E.H * 0.5, { size: V(110, 100), color: WARN, glow: 26, glowColor: alpha(WARN, 0.7), spacing: 4, alpha: a }); }
} });
