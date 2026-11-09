// shots/01_short.js: The Truth About Turbulence (9:16). Subjects in the middle third; captions sit at ~79% height.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, backdrop, ease, prog, clamp, lerp, rng, shake, wordTime, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { cabin, winX, seat } from '../sets/cabin.js';
import { sky, nearClouds } from '../sets/sky.js';
import { airliner } from '../props/plane.js';
import { PAX, PILOT, EXTRA, EXTRA2 } from '../cast.js';

const WARN = '#ff5a4f';
const wt = (w, info, fb) => (wordTime(w, info.shot.start - 0.1) ?? info.shot.start + fb) - info.shot.start;
const lbl = (g, s, x, y, o = {}) => text(g, s, x, y, { size: o.size || 44, color: o.color || UI.bpStroke(), font: FONTS.ui, weight: 900, spacing: 3, align: o.align || 'center', alpha: o.a ?? 1, glow: o.glow || 0, glowColor: alpha(o.color || UI.bpStroke(), 0.6) });
const body = (M) => mix(M.wall, M.ambient, 0.5);
function arrow(g, x1, y1, x2, y2, w, color, p = 1) { if (p <= 0) return; const ex = lerp(x1, x2, p), ey = lerp(y1, y2, p), a = Math.atan2(y2 - y1, x2 - x1); seg(g, [[x1, y1], [ex, ey]], w, color); poly(g, [[ex + Math.cos(a) * w * 2, ey + Math.sin(a) * w * 2], [ex + Math.cos(a + 2.4) * w * 2.6, ey + Math.sin(a + 2.4) * w * 2.6], [ex + Math.cos(a - 2.4) * w * 2.6, ey + Math.sin(a - 2.4) * w * 2.6]], color); }

// --- cabin: PAX at the window (k=0), neighbours behind/in front
function cabinRow(g, t, cam, o = {}) {
  const r = cabin(g, t, cam, o.cabin || {}); const { GY, M, OM } = r, s = o.s ?? 1.6, seatC = shade(M.wall, -0.55), rim = { color: OM.rim, dir: [0.2, -1], w: 4 };
  layer(g, cam, 1, (g) => {
    for (const k of o.rows || [-1, 0, 1]) {
      const x = winX(k); seat(g, x, GY, s, seatC);
      if (k === 0) drawFigure(g, { x, y: GY, s, facing: 1, outfit: PAX, pose: o.paxPose || breathe(POSES.sit, t), expr: o.paxExpr || 'neutral', look: o.paxLook, rim, shadow: false, blink: (t % 3.1) > 3.0 });
      else if (o.extras !== false) drawFigure(g, { x, y: GY - (o.float && k === o.float ? o.floatY || 0 : 0), s, facing: 1, outfit: k % 2 ? EXTRA2 : EXTRA, pose: o.float && k === o.float ? o.floatPose : breathe(POSES.sit, t, 1, k + 5), expr: o.float && k === o.float ? 'shocked' : (o.extraExpr || 'neutral'), rim, shadow: false, rot: o.float && k === o.float ? o.floatRot : 0 });
      o.extra?.(g, x, GY, s, k);
    }
  });
  return r;
}
const faceBg = (g, t, cam = { z: 1.8, x: 0, y: -100 }) => { blurLayer(g, 14, (g) => cabin(g, t, cam)); veil(g, '#03080c', 0.35); };
const face = (g, t, outfit, expr, o = {}) => bigFace(g, E.W / 2 + (o.dx || 0), E.H * 0.47, 330 * (1 + 0.03 * t), { outfit, expr, look: o.look || [0, 0], rimColor: mood('dusk').rim, rimSide: o.side ?? -1, blink: (t % 2.6) > 2.5, tilt: o.tilt });

registerShot('t01', { draw(g, t, info) {                 // the drop
  const [sx, sy] = shake(t, 22 * Math.exp(-t * 1.2) + 4, 16), drop = -60 * Math.exp(-t * 3) * (t > 0.05);
  cabinRow(g, t, { z: 1.55, x: sx, y: 150 + sy + drop }, { paxExpr: t > 0.3 ? 'shocked' : 'surprised', paxPose: { ...POSES.sit, eF: [18, -112], hF: [44, -80], eB: [-14, -110], hB: [-40, -80] }, extraExpr: 'scared', paxLook: [0, -0.5] });
  FX.speedLines(g, t, { count: 30, a: 0.12 * Math.exp(-t) });
} });
registerShot('t02', { draw(g, t, info) {                 // drinks jump
  const M = mood('interiorCool'), [sx, sy] = shake(t, 10, 18);
  blurLayer(g, 14, (g) => cabin(g, t, { z: 1.9, x: 100, y: 200 })); veil(g, '#03080c', 0.35);
  g.save(); g.translate(sx, sy);
  const ty = E.H * 0.56; rr(g, E.W * 0.08, ty, E.W * 0.84, 40, 12); g.fillStyle = shade(M.wall, -0.5); g.fill(); seg(g, [[E.W * 0.08, ty + 2], [E.W * 0.92, ty + 2]], 3, alpha(mood('dusk').rim, 0.6));
  const j = ease.out(prog(t, 0.05, 0.35)) - ease.in(prog(t, 0.6, 1.1)), cx = E.W / 2, cy = ty - 10 - 260 * j, rot = -0.4 * j;
  g.save(); g.translate(cx, cy); g.rotate(rot); rr(g, -60, -150, 120, 150, 14); g.fillStyle = 'rgba(220,240,255,.35)'; g.fill(); g.strokeStyle = '#e8fbff'; g.lineWidth = 5; g.stroke(); rr(g, -54, -80, 108, 76, 10); g.fillStyle = '#c9783a'; g.fill(); g.restore();
  const r = rng(3); for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 2, d = 80 + r() * 160 * j; circle(g, cx + Math.cos(a) * d, cy - 120 + Math.sin(a) * d * 0.7, 6 + r() * 8, alpha('#c9783a', 0.9 * j)); }
  g.restore();
} });
registerShot('t03', { draw(g, t, info) { const [sx, sy] = shake(t, 10, 14); g.save(); g.translate(sx, sy); faceBg(g, t); face(g, t, PAX, 'shocked', { look: [0, 0.3] }); g.restore(); } });
registerShot('t04', { draw(g, t, info) {                 // title
  const k = ease.inOut(t / info.dur), cam = { z: 1.05 - 0.04 * k };
  const { DY, M } = sky(g, t, cam, { mood: 'golden', sunX: 0, sunY: 60 });
  layer(g, cam, 0.9, (g) => airliner(g, E.W * 0.25 + t * 70, E.H * 0.6 + Math.sin(t * 9) * 8, 0.4, { t, body: body(M), rim: M.rim, win: M.practical, pitch: Math.sin(t * 7) * 0.03 }));
  veil(g, '#020a10', 0.25);
  UI.titleCard(g, t, { lines: ['THE TRUTH ABOUT', 'TURBULENCE'], dur: info.dur + 0.4, y: E.H * 0.3 });
} });
registerShot('t05', { draw(g, t, info) {                 // air at different speeds
  UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold;
  const rows = [[0.22, 1.0], [0.3, 0.45], [0.38, 1.6], [0.46, 0.7], [0.54, 1.25]];
  rows.forEach(([u, v], i) => { const y = E.H * u; g.strokeStyle = alpha(c, 0.7); g.lineWidth = 4; g.setLineDash([50, 30]); g.lineDashOffset = -t * 500 * v; g.beginPath(); for (let x = -40; x <= E.W + 40; x += 20) { const yy = y + Math.sin(x / 120 + t * 2 * v + i) * 14; x === -40 ? g.moveTo(x, yy) : g.lineTo(x, yy); } g.stroke(); g.setLineDash([]); arrow(g, E.W * 0.06, y - 40, E.W * 0.06 + 140 * v, y - 40, 5, gold, ease.out(prog(t, 0.2 + i * 0.12, 0.6 + i * 0.12))); });
  const ts = wt('speeds', info, 2.0); lbl(g, 'DIFFERENT SPEEDS', E.W / 2, E.H * 0.12, { color: gold, a: ease.out(prog(t, ts - 0.3, ts + 0.1)), glow: 12, size: 52 });
  const bump = Math.sin(t * 9) * 26 + Math.sin(t * 23) * 8; airliner(g, E.W / 2, E.H * 0.66 + bump, 0.6, { t, body: '#0f2a3a', rim: c, win: gold, lights: false, pitch: Math.sin(t * 7) * 0.06 });
} });
registerShot('t06', { draw(g, t, info) {                 // boat on choppy water
  const M = mood('dusk'), WL = E.H * 0.58, cam = { z: 1.1 + 0.04 * t };
  layer(g, cam, 0.15, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, WL, M.sky); g.fillRect(-E.W, -E.H, E.W * 3, WL + E.H); FX.sun(g, E.W * 0.7, WL - 80, 60, '#ffffff', M.key, 5); });
  const wave = (x, k) => WL + Math.sin(x / 90 + t * 3 + k) * 26 + Math.sin(x / 37 - t * 4 + k) * 10;
  layer(g, cam, 0.6, (g) => { for (let k = 0; k < 4; k++) { g.fillStyle = shade(M.wall, -0.1 - k * 0.12); g.beginPath(); g.moveTo(-E.W, E.H * 2); for (let x = -E.W; x <= E.W * 2; x += 16) g.lineTo(x, wave(x, k) + k * 70); g.lineTo(E.W * 2, E.H * 2); g.fill(); if (k === 0) { g.strokeStyle = alpha(M.rim, 0.5); g.lineWidth = 3; g.beginPath(); for (let x = -E.W; x <= E.W * 2; x += 16) x === -E.W ? g.moveTo(x, wave(x, 0)) : g.lineTo(x, wave(x, 0)); g.stroke(); } } });
  const bx = E.W / 2, by = wave(bx, 0), tilt = Math.atan2(wave(bx + 40, 0) - wave(bx - 40, 0), 80);
  layer(g, cam, 0.6, (g) => { g.save(); g.translate(bx, by - 10); g.rotate(tilt); poly(g, [[-160, -40], [160, -40], [110, 30], [-120, 30]], '#0b141c'); seg(g, [[-160, -42], [160, -42]], 5, M.rim); seg(g, [[0, -40], [0, -300]], 8, '#0b141c'); poly(g, [[8, -290], [140, -70], [8, -70]], mix(M.practical, M.wall, 0.3)); g.restore();
    for (let k = 1; k < 4; k++) { g.fillStyle = shade(M.wall, -0.1 - k * 0.12); g.beginPath(); g.moveTo(-E.W, E.H * 2); for (let x = -E.W; x <= E.W * 2; x += 16) g.lineTo(x, wave(x, k) + k * 70); g.lineTo(E.W * 2, E.H * 2); g.fill(); } });
  FX.dust(g, t, { count: 20, color: '#ffffff', a: 0.25 });
} });
function icon(g, kind, x, y, c) {
  if (kind === 0) { circle(g, x, y - 10, 30, c); for (let i = 0; i < 3; i++) { g.strokeStyle = c; g.lineWidth = 5; g.beginPath(); for (let k = 0; k <= 10; k++) { const yy = y + 60 - k * 9; g.lineTo(x - 50 + i * 50 + Math.sin(k) * 6, yy + 40); } g.stroke(); } }
  else if (kind === 1) { poly(g, [[x - 80, y + 50], [x - 20, y - 50], [x + 10, y], [x + 30, y - 30], [x + 80, y + 50]], c); }
  else if (kind === 2) { for (const [dx, dy, r] of [[-30, 0, 34], [10, -18, 42], [45, 4, 30]]) circle(g, x + dx, y + dy, r, c); poly(g, [[x, y + 30], [x - 22, y + 74], [x - 2, y + 70], [x - 16, y + 104], [x + 24, y + 56], [x + 4, y + 60], [x + 16, y + 30]], S().ui.accent); }
  else { for (let i = 0; i < 3; i++) { g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); for (let k = 0; k <= 20; k++) { const xx = x - 80 + k * 8; g.lineTo(xx, y - 30 + i * 30 + Math.sin(k / 3) * 10); } g.stroke(); } poly(g, [[x + 96, y], [x + 76, y - 14], [x + 76, y + 14]], c); }
}
registerShot('t07', { draw(g, t, info) {                 // causes stack up
  UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold;
  const items = [['heat', 'RISING HEAT', 0.2], ['mountains', 'MOUNTAINS', 0.9], ['storms', 'STORMS', 1.6], ['jet', 'JET STREAMS', 2.7]];
  items.forEach(([w, s, fb], i) => { const t0 = wt(w, info, fb), p = ease.outBack(prog(t, t0 - 0.15, t0 + 0.25)); if (p <= 0) return; const y = E.H * (0.16 + i * 0.14);
    g.save(); g.translate(E.W * 0.3, y); g.scale(p, p); ring(g, 0, 0, 100, 4, c); icon(g, i, 0, 0, c); g.restore(); lbl(g, s, E.W * 0.47, y, { align: 'left', a: clamp(p), color: i === items.length - 1 ? gold : c, size: 48 }); });
  const tu = wt('stir', info, 3.8), a = ease.out(prog(t, tu, tu + 0.3)); if (a > 0) { const [sx, sy] = shake(t, 6, 20); g.save(); g.translate(sx, sy); lbl(g, '= TURBULENCE', E.W / 2, E.H * 0.73, { color: gold, a, size: 60, glow: 16 }); g.restore(); }
} });
registerShot('t09', { draw(g, t, info) { gMeter(g, t, info, false); } });
registerShot('t10', { draw(g, t, info) { gMeter(g, t, info, true); } });
function gMeter(g, t, info, margin) {
  UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, x = E.W * 0.5, y0 = E.H * 0.7, h = E.H * 0.5, gy = (v) => y0 - (v / 4) * h, w = 220;
  rr(g, x - w / 2, gy(4), w, h, 24); g.strokeStyle = c; g.lineWidth = 4; g.stroke();
  for (let v = 0; v <= 4; v += 0.5) { seg(g, [[x - w / 2 - 30, gy(v)], [x - w / 2 - 10, gy(v)]], 3, c); if (v % 1 === 0) text(g, v + ' G', x - w / 2 - 44, gy(v), { size: 34, color: alpha(c, 0.8), font: FONTS.ui, weight: 900, align: 'right' }); }
  const tg = margin ? -1 : wt('two', info, 1.7), fill = margin ? 2.5 : 2.5 * ease.inOut(prog(t, tg - 0.6, tg + 1.4));
  const fh = gy(0) - gy(fill) - 10; if (fh > 4) { rr(g, x - w / 2 + 10, gy(fill), w - 20, fh, Math.min(16, fh / 2)); g.fillStyle = alpha(c, 0.7); g.fill(); } glow(g, x, gy(fill), 160, c, 0.4);
  text(g, fill.toFixed(1) + ' G', x + w / 2 + 40, gy(fill), { size: 64, color: gold, font: FONTS.ui, weight: 900, align: 'left', glow: 14, glowColor: alpha(gold, 0.5) });
  if (!margin) { const tgv = wt('gravity', info, 3.4); lbl(g, 'DESIGN LOAD', E.W / 2, E.H * 0.12, { a: ease.out(prog(t, 0.2, 0.6)), size: 48 }); lbl(g, '× GRAVITY', E.W / 2, E.H * 0.17, { color: gold, a: ease.out(prog(t, tgv, tgv + 0.3)), size: 40 }); }
  else {
    const tf = wt('fifty', info, 1.3), p = ease.outBack(prog(t, tf - 0.1, tf + 0.4)), top = 3.75;
    if (p > 0) { g.save(); g.globalAlpha *= clamp(p); rr(g, x - w / 2 + 10, gy(top) + (1 - p) * -200, w - 20, gy(2.5) - gy(top) - 6, 16); g.fillStyle = alpha(S().ui.accent, 0.8); g.fill(); g.restore(); text(g, '+50%', x, gy(3.12), { size: 56, color: '#06222e', font: FONTS.ui, weight: 900, alpha: clamp(p) }); }
    const tm = wt('margin', info, 2.4), a = ease.out(prog(t, tm, tm + 0.4)); lbl(g, 'SAFETY MARGIN', E.W / 2, E.H * 0.12, { color: S().ui.accent, a, size: 48, glow: 12 });
    if (a > 0) text(g, '= 3.75 G', x + w / 2 + 40, gy(top), { size: 64, color: S().ui.accent, font: FONTS.ui, weight: 900, align: 'left', alpha: a, glow: 14, glowColor: alpha(S().ui.accent, 0.5) });
  }
}
// hangar wing-bend test (front view of a wide-body)
function hangar(g, t, cam, bend, o = {}) {
  const M = mood('interiorCool'), GY = E.H * 0.7, CX = E.W / 2;
  layer(g, cam, 0.4, (g) => { backdrop(g, [shade(M.dark, -0.3), M.wall, shade(M.wall, -0.2)]); for (let i = -3; i <= 3; i++) { const x = CX + i * 260; seg(g, [[x, 0], [x, GY]], 10, shade(M.dark, -0.2)); FX.lightCone(g, x, E.H * 0.06, { len: 900, spread: 0.5, a: 0.08, color: M.practical }); circle(g, x, E.H * 0.06, 12, M.practical); }
    g.fillStyle = linGrad(g, 0, GY, 0, E.H, [shade(M.floor, 0.1), shade(M.dark, -0.3)]); g.fillRect(-E.W, GY, E.W * 3, E.H); FX.floorLines(g, GY, E.H, 'rgba(0,0,0,.25)', 0.07); });
  layer(g, cam, 0.8, (g) => {
    const fy = GY - 230, span = 1000, rim = M.rim, bc = mix(M.wall, M.ambient, 0.5);
    for (const sgn of [-1, 1]) { g.strokeStyle = shade(bc, 0.2); g.lineWidth = 34; g.lineCap = 'round'; g.beginPath(); g.moveTo(CX, fy + 20); g.quadraticCurveTo(CX + sgn * span * 0.25, fy + 20 - bend * 0.1, CX + sgn * span / 2, fy + 20 - bend); g.stroke(); g.strokeStyle = alpha(rim, 0.7); g.lineWidth = 4; g.beginPath(); g.moveTo(CX, fy + 4); g.quadraticCurveTo(CX + sgn * span * 0.25, fy + 4 - bend * 0.1, CX + sgn * span / 2, fy + 4 - bend); g.stroke();
      const ex = CX + sgn * 230, ey = fy + 60 - bend * 0.02; circle(g, ex, ey, 52, shade(bc, -0.2)); ring(g, ex, ey, 52, 4, alpha(rim, 0.6)); circle(g, ex, ey, 30, shade(bc, -0.6));
      if (o.broken && sgn > 0) { /* drawn snapped below */ } }
    circle(g, CX, fy, 130, bc); ring(g, CX, fy, 130, 5, alpha(rim, 0.7)); poly(g, [[CX - 60, fy - 40], [CX + 60, fy - 40], [CX + 40, fy - 70], [CX - 40, fy - 70]], shade(bc, -0.6));
    seg(g, [[CX, fy - 130], [CX, fy - 330]], 26, bc); seg(g, [[CX - 20, fy - 300], [CX + 20, fy - 300]], 30, bc);
    for (const sgn of [-1, 1]) { const tx = CX + sgn * span * 0.43, ty = fy + 20 - bend * 0.82; seg(g, [[tx, ty], [tx, E.H * 0.04]], 4, alpha(M.practical, 0.6)); rr(g, tx - 30, ty - 20, 60, 40, 8); g.fillStyle = '#f2d24a'; g.fill(); }
    for (const sgn of [-1, 1]) drawFigure(g, { x: CX + sgn * 330, y: GY, s: 0.9, facing: -sgn, outfit: EXTRA, pose: o.cheer ? POSES.handsOnHead : POSES.point, expr: 'awe', rim: { color: rim, dir: [0, -1] } });
  });
  return { M, GY, CX };
}
registerShot('t11', { draw(g, t, info) { const k = ease.inOut(t / info.dur); hangar(g, t, { z: 0.95 + 0.05 * k, y: 80 }, lerp(0, 260, ease.inOut(prog(t, 0.6, info.dur)))); lbl(g, 'WING TEST', E.W / 2, E.H * 0.12, { a: ease.out(prog(t, 0.3, 0.7)), size: 52, color: S().ui.gold }); } });
registerShot('t12', { draw(g, t, info) {
  const ts = wt('snapped', info, 2.95), t7 = wt('seven', info, 1.1), [sx, sy] = t > ts ? shake(t, 18 * Math.exp(-(t - ts) * 3), 30) : [0, 0];
  const bend = lerp(260, 420, ease.inOut(prog(t, 0, ts))), cam = { z: 0.98 + 0.04 * t / info.dur, x: sx, y: 80 + sy };
  const { GY, CX } = hangar(g, t, cam, t > ts ? 340 : bend, { cheer: t > ts });
  layer(g, cam, 0.8, (g) => UI.dimension(g, t, { x1: CX + 400, y1: GY - 210, x2: CX + 400, y2: GY - 210 - bend, str: '7 M', start: t7 - 0.2 }));
  if (t > ts) { const a = 1 - prog(t, ts, ts + 0.6); veil(g, '#ffffff', 0.7 * a); const p = ease.outBack(prog(t, ts, ts + 0.25)); g.save(); g.translate(E.W / 2, E.H * 0.2); g.scale(p, p); text(g, 'SNAP!', 0, 0, { size: 130, color: WARN, glow: 30, glowColor: alpha(WARN, 0.8), spacing: 4 }); g.restore(); }
} });
registerShot('t13', { draw(g, t, info) {
  UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, x0 = E.W * 0.12, w = E.W * 0.76;
  const row = (y, s, frac, col, t0) => { lbl(g, s, x0, y - 60, { align: 'left', color: col, size: 46 }); rr(g, x0, y - 30, w, 60, 30); g.fillStyle = alpha(col, 0.12); g.fill(); rr(g, x0, y - 30, Math.max(60, w * frac * ease.out(prog(t, t0, t0 + 0.6))), 60, 30); g.fillStyle = col; g.fill(); };
  row(E.H * 0.3, 'NORMAL TURBULENCE', 0.12, c, 0.3); row(E.H * 0.46, 'WHAT WINGS SURVIVE', 1.0, gold, 0.9);
  const tb = wt('beyond', info, 0.7); lbl(g, 'FAR BEYOND', E.W / 2, E.H * 0.62, { color: S().ui.accent, a: ease.out(prog(t, tb, tb + 0.3)), size: 64, glow: 16 });
} });
registerShot('t14', { draw(g, t, info) { faceBg(g, t); face(g, t, PAX, 'thinking', { look: [0.4, -0.5], tilt: -0.06 }); const p = ease.outBack(prog(t, 0.2, 0.6)); if (p > 0) text(g, '?', E.W * 0.82, E.H * 0.24, { size: 240 * p, color: S().ui.accent, glow: 30, glowColor: alpha(S().ui.accent, 0.7) }); } });
registerShot('t15', { draw(g, t, info) { const [sx, sy] = shake(t, 14 * (1 - prog(t, 0, 0.5)), 30); backdrop(g, ['#03070b', '#071822']); g.save(); g.translate(sx, sy); const p = ease.outBack(prog(t, 0, 0.2)); g.translate(E.W / 2, E.H * 0.45); g.scale(0.6 + 0.4 * p, 0.6 + 0.4 * p); text(g, 'PEOPLE.', 0, 0, { size: 170, color: WARN, glow: 30, glowColor: alpha(WARN, 0.7), spacing: 4 }); g.restore(); } });
registerShot('t16', { draw(g, t, info) {                 // FREEZE: unbuckled neighbour floats, PAX buckled
  const cam = { z: 1.15 + 0.01 * t, y: 120, r: -0.02 + 0.006 * t }, float = ease.out(prog(t, 0, 0.6));
  cabinRow(g, 0.3, cam, { rows: [-1, 0, 1], float: 1, floatY: 150 * float + 10 * Math.sin(t * 1.4), floatRot: -0.25 * float, floatPose: POSES.fall, paxExpr: 'surprised', paxLook: [1, -0.4],
    extra: (g, x, GY, s, k) => { if (k === 0) { seg(g, [[x - 10 * s, GY - 90 * s], [x + 30 * s, GY - 78 * s]], 9, S().ui.accent); rr(g, x + 2 * s, GY - 92 * s, 18 * s, 14 * s, 4); g.fillStyle = '#c8d4dc'; g.fill(); } } });
  FX.drops(g, t, { count: 40, color: '#d8e4ff', rMax: 8, drift: 2 });
  g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(80,140,255,.35)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  const tsb = wt('seatbelt', info, 2.7); lbl(g, 'NO SEATBELT', winX(1), E.H * 0.24, { color: WARN, a: ease.out(prog(t, 0.5, 0.9)), size: 44 }); lbl(g, 'BUCKLED', winX(0) - 40, E.H * 0.62, { color: S().ui.accent, a: ease.out(prog(t, tsb, tsb + 0.3)), size: 44 });
} });
function beltSign(g, cx, cy, on, s = 1) {
  rr(g, cx - 170 * s, cy - 80 * s, 340 * s, 160 * s, 24 * s); g.fillStyle = '#0a1218'; g.fill(); ring(g, cx, cy, 0, 0, '#000');
  const col = on ? '#e8fbff' : '#34444e'; if (on) glow(g, cx, cy, 300 * s, '#9af2ff', 0.5);
  circle(g, cx - 40 * s, cy - 40 * s, 14 * s, col); seg(g, [[cx - 40 * s, cy - 22 * s], [cx - 40 * s, cy + 30 * s], [cx, cy + 30 * s], [cx + 10 * s, cy + 60 * s]], 12 * s, col);
  seg(g, [[cx - 70 * s, cy + 6 * s], [cx + 50 * s, cy + 6 * s]], 8 * s, col); rr(g, cx - 8 * s, cy - 6 * s, 24 * s, 24 * s, 4 * s); g.fillStyle = col; g.fill();
  circle(g, cx + 100 * s, cy, 34 * s, on ? '#e8fbff' : '#34444e'); seg(g, [[cx + 84 * s, cy + 16 * s], [cx + 116 * s, cy - 16 * s]], 8 * s, '#0a1218');
}
registerShot('t17', { draw(g, t, info) {
  blurLayer(g, 12, (g) => cabin(g, t, { z: 1.6, y: -260 })); veil(g, '#03080c', 0.35);
  const td = wt('dings', info, 1.8), on = t > td - 0.05; beltSign(g, E.W / 2, E.H * 0.38, on, 1.3);
  if (on) FX.rings(g, E.W / 2, E.H * 0.38, t - td, { count: 3, r0: 200, r1: 520, speed: 1.2, color: '#9af2ff', a: 0.4 });
} });
registerShot('t18', { draw(g, t, info) {                 // buckle click
  blurLayer(g, 14, (g) => cabin(g, t, { z: 2, y: 260 })); veil(g, '#03080c', 0.35);
  const k = ease.out(prog(t, 0, 0.22)), cy = E.H * 0.45, ui = S().ui;
  seg(g, [[-100, cy + 40], [lerp(E.W * 0.2, E.W * 0.44, k), cy]], 70, '#2a4656'); rr(g, lerp(E.W * 0.2, E.W * 0.44, k) - 10, cy - 60, 150, 120, 16); g.fillStyle = '#c8d4dc'; g.fill();
  seg(g, [[E.W + 100, cy + 40], [E.W * 0.62, cy]], 70, '#2a4656'); rr(g, E.W * 0.52, cy - 70, 180, 140, 20); g.fillStyle = '#9fb0ba'; g.fill(); rr(g, E.W * 0.56, cy - 30, 100, 60, 10); g.fillStyle = '#5a6a74'; g.fill();
  if (t > 0.22) { FX.rings(g, E.W * 0.52, cy, t - 0.22, { count: 2, r0: 60, r1: 320, speed: 1.6, color: ui.accent, a: 0.6 * (1 - prog(t, 0.22, 0.85)) }); lbl(g, 'CLICK', E.W / 2, E.H * 0.3, { color: ui.accent, a: 1 - prog(t, 0.6, 0.85), size: 70, glow: 16 }); }
} });
registerShot('t19', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.08 + 0.04 * k };
  const { DY, M } = sky(g, t, cam, { mood: 'golden', sunX: -250, sunY: 80 });
  layer(g, cam, 1, (g) => airliner(g, E.W * 0.42 + t * 60, E.H * 0.42 + Math.sin(t * 8) * 10, 0.55, { t, body: body(M), rim: M.rim, win: M.practical, pitch: Math.sin(t * 6) * 0.025 }));
  nearClouds(g, t, cam, M, E.H * 0.8);
  FX.lensStreak(g, E.W / 2 - 250, DY - 80, E.W * 1.6, '#e8fbff', 0.2);
} });
registerShot('t20', { draw(g, t, info) { faceBg(g, t); face(g, t, PAX, t > 0.4 ? 'smirk' : 'smile', { look: [-0.2, 0] }); } });
registerShot('t21', { draw(g, t, info) {
  const M = mood('dusk'), ui = S().ui; backdrop(g, [shade(M.dark, -0.3), M.dark, M.wall]); glow(g, E.W / 2, E.H * 0.75, E.W, M.rim, 0.15);
  const a = ease.out(prog(t, 0.1, 0.5)); text(g, 'FOLLOW', E.W / 2, E.H * 0.26, { size: 130, color: ui.cream, glow: 26, glowColor: alpha(ui.accent, 0.7), spacing: 6, alpha: a }); text(g, 'FOR MORE', E.W / 2, E.H * 0.34, { size: 76, color: ui.accent, spacing: 6, alpha: a });
  const p = ease.outBack(prog(t, 0.5, 0.9)); g.save(); g.translate(E.W / 2, E.H * 0.44); g.scale(p, p); rr(g, -190, -48, 380, 96, 48); g.fillStyle = ui.accent; g.fill(); text(g, '+ FOLLOW', 0, 2, { size: 48, color: '#06222e', font: FONTS.ui, weight: 900, spacing: 3 }); g.restore();
  airliner(g, lerp(-300, E.W + 300, prog(t, 0, info.dur)), E.H * 0.1, 0.18, { t, body: body(M), rim: M.rim, win: M.practical, contrail: 0.8 });
  [PAX, PILOT].forEach((of, i) => { const k = ease.out(prog(t, 0.3 + i * 0.1, 0.7 + i * 0.1)); drawFigure(g, { x: E.W / 2 + (i - 0.5) * 220, y: E.H * 0.72 + (1 - k) * 40, s: 1.6, facing: 1, outfit: of, pose: i ? POSES.wave : POSES.cheer, expr: 'smile', alpha: k, rim: { color: M.rim, dir: [0, 1] } }); });
} });
