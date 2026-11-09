// shots/06_misc.js: bill, coffin corner, atmosphere cross-section, twist, runway, end screen
import { E, V, S, registerShot, mood, layer, blurLayer, veil, backdrop, ease, prog, clamp, lerp, rng, shake, wordTime, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { cloudDeck } from '../sets/sky.js';
import { airliner } from '../props/plane.js';
import { PAX, PILOT } from '../cast.js';

const WARN = '#ff5a4f';
const wt = (w, info, fb) => (wordTime(w, info.shot.start - 0.1) ?? info.shot.start + fb) - info.shot.start;

registerShot('s21', { draw(g, t, info) {                  // the airline's bill unrolls
  const M = mood('void'), ui = S().ui, cam = { z: 1.05, y: lerp(-100, 220, ease.inOut(t / info.dur)) };
  layer(g, cam, 0.3, (g) => { backdrop(g, M.sky); glow(g, E.W / 2, E.H * 0.3, 900, ui.accent, 0.12); });
  const tb = wt('bills', info, 2.3), len = lerp(80, E.H * 1.5, ease.out(prog(t, 0, 2.4))), w = V(520, 600), x = E.W / 2 - w / 2, y0 = E.H * 0.08;
  layer(g, cam, 1, (g) => {
    rr(g, x - 30, y0 - 40, w + 60, 50, 25); g.fillStyle = shade(M.wall, 0.3); g.fill();
    g.fillStyle = '#d4e6ec'; g.fillRect(x, y0, w, len); for (let zz = 0; zz < w; zz += 20) poly(g, [[x + zz, y0 + len], [x + zz + 10, y0 + len + 12], [x + zz + 20, y0 + len]], '#d4e6ec');
    text(g, 'AIRLINE COSTS', E.W / 2, y0 + 60, { size: 40, color: '#0b1a24', font: FONTS.ui, weight: 900, spacing: 3 });
    const rows = ['CREW', 'AIRCRAFT', 'FUEL', 'MAINTENANCE', 'AIRPORT FEES', 'OTHER']; rows.forEach((s, i) => { const yy = y0 + 150 + i * 90; if (yy > y0 + len - 30) return; const hl = s === 'FUEL' && t > tb - 0.2;
      if (hl) { rr(g, x + 16, yy - 34, w - 32, 68, 12); g.fillStyle = alpha(ui.accent, 0.35 * ease.out(prog(t, tb - 0.2, tb + 0.2))); g.fill(); }
      text(g, s, x + 40, yy, { size: hl ? 42 : 32, color: hl ? '#06222e' : '#33505e', font: FONTS.ui, weight: 900, align: 'left' }); seg(g, [[x + w - 200, yy], [x + w - 40, yy]], hl ? 14 : 8, hl ? '#06222e' : '#a8bcc6'); });
  });
  FX.dust(g, t, { count: 20, color: '#e8fbff', a: 0.2 });
} });
registerShot('s30', { draw(g, t, info) {                  // COFFIN CORNER
  const [sx, sy] = shake(t, 10 * (1 - prog(t, 0, 0.6)), 30);
  g.save(); g.translate(sx, sy); backdrop(g, ['#05080c', '#140608']);
  const gap = lerp(260, 26, ease.out(prog(t, 0, 0.8))), cx = E.W / 2, cy = E.H * 0.62;
  g.fillStyle = alpha(WARN, 0.25); g.fillRect(0, cy - 60, cx - gap / 2, 120); g.fillRect(cx + gap / 2, cy - 60, E.W, 120);
  seg(g, [[cx - gap / 2, cy - 90], [cx - gap / 2, cy + 90]], 6, WARN); seg(g, [[cx + gap / 2, cy - 90], [cx + gap / 2, cy + 90]], 6, WARN); glow(g, cx, cy, 260, WARN, 0.5 + 0.2 * Math.sin(t * 12));
  const a = ease.outBack(prog(t, 0.05, 0.35)); g.translate(cx, E.H * 0.36); g.scale(0.7 + 0.3 * a, 0.7 + 0.3 * a);
  text(g, 'COFFIN CORNER', 0, 0, { size: V(120, 96), color: WARN, glow: 34, glowColor: alpha(WARN, 0.8), spacing: 4, alpha: clamp(a) });
  g.restore();
} });
function atmos(g, t, cam, o = {}) {
  const M = mood('storm'), N = mood('night'), ty = E.H * 0.36, gy = E.H * 1.0;
  layer(g, cam, 0.3, (g) => {
    backdrop(g, N.sky); FX.stars(g, t, { count: 120, area: [-E.W, -E.H, E.W * 3, ty + E.H] });
    g.fillStyle = linGrad(g, 0, ty, 0, gy, [alpha(M.sky[2], 0.35), alpha(M.sky[1], 0.7), M.sky[0]]); g.fillRect(-E.W, ty, E.W * 3, gy);
    cloudDeck(g, E.H * 0.66, shade(M.wall, -0.1), M.rim, 5, t, { n: 40, size: 0.9, lit: 0.3, drift: 12 });
    for (let i = 0; i < 4; i++) { const x = E.W * (0.12 + i * 0.25), h = 160 + (i % 2) * 120; for (let j = 0; j < 5; j++) circle(g, x + Math.sin(j * 2) * 30, E.H * 0.66 - j * h / 5, 110 - j * 12, mix(shade(M.wall, -0.05), M.rim, j * 0.04)); }
    g.save(); g.beginPath(); g.rect(-E.W, E.H * 0.72, E.W * 3, E.H); g.clip(); FX.rain(g, t, { count: 140 }); g.restore();
    if (((t * 1.9) % 1) < 0.1) glow(g, E.W * 0.6, E.H * 0.7, 300, '#dfe8ff', 0.5);
    g.fillStyle = shade(N.dark, -0.3); g.beginPath(); g.ellipse(E.W / 2, gy + E.H * 2.9, E.W * 2.4, E.H * 3, 0, 0, 7); g.fill();
    seg(g, [[-E.W, ty], [E.W * 2, ty]], o.line ? 5 : 1, alpha(S().ui.accent, o.line ? 0.9 : 0.25)); if (o.line) glow(g, E.W / 2, ty, 900, S().ui.accent, 0.12 * o.line);
  });
  return { ty };
}
registerShot('s33', { draw(g, t, info) {
  const cam = { z: 1.05 - 0.03 * ease.inOut(t / info.dur) }; const { ty } = atmos(g, t, cam);
  const tt = wt('troposphere', info, 3.3); UI.callout(g, t, { at: [E.W * 0.5, E.H * 0.55], to: [E.W * 0.62, E.H * 0.46], str: 'TROPOSPHERE', start: tt - 0.2, color: S().ui.gold });
  UI.callout(g, t, { at: [E.W * 0.2, E.H * 0.7], to: [E.W * 0.3, E.H * 0.5], str: 'WEATHER', start: 0.6 });
} });
registerShot('s34', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.03 * ease.inOut(t / info.dur) }, tc = wt('ceiling', info, 0.3), line = ease.out(prog(t, tc, tc + 0.5));
  const { ty } = atmos(g, t, cam, { line });
  if (line > 0) text(g, 'TROPOPAUSE', E.W * 0.82, ty - 40, { size: V(40, 44), color: S().ui.accent, font: FONTS.ui, weight: 900, spacing: 3, alpha: line });
  const t36 = wt('thirty', info, 1.4); UI.dimension(g, t, { x1: E.W * 0.12, y1: E.H * 0.97, x2: E.W * 0.12, y2: ty, str: '~36,000 FT', start: t36 - 0.3 });
  const ml = wt('mid', info, 3.0); if (t > ml) text(g, 'MID-LATITUDES', E.W * 0.24, E.H * 0.9, { size: 26, color: alpha(S().ui.cream, 0.7), font: FONTS.ui, weight: 900, spacing: 3, align: 'left', alpha: clamp((t - ml) * 3) });
} });
registerShot('s46', { draw(g, t, info) {                  // the twist: 35,000 isn't magic
  backdrop(g, ['#03070b', '#071822']); const ui = S().ui, tm = wt('magic', info, 2.8), cx = E.W / 2, cy = E.H * 0.48;
  const z = 1 + 0.03 * t; g.save(); g.translate(cx, cy); g.scale(z, z);
  text(g, '35,000 FT', 0, 0, { size: V(170, 130), color: ui.gold, glow: 30, glowColor: alpha(ui.accent, 0.6), spacing: 4, alpha: 1 - 0.4 * clamp((t - tm) * 2) });
  const p = ease.out(prog(t, tm, tm + 0.25)); if (p > 0) { seg(g, [[-V(460, 360), V(60, 50)], [lerp(-V(460, 360), V(460, 360), p), lerp(V(60, 50), -V(60, 50), p)]], 14, WARN); glow(g, 0, 0, 500, WARN, 0.2 * p); }
  g.restore();
  UI.bigLine(g, t, { str: 'NOT A MAGIC NUMBER', dur: info.dur + 1, y: E.H * 0.78, size: V(52, 50), color: ui.cream });
} });
registerShot('s48', { draw(g, t, info) {                  // runway: 100+ tons of fuel
  const k = ease.inOut(t / info.dur), M = mood('dusk'), cam = { z: 1.05 + 0.05 * k, x: -30 * k }, GY = E.H * V(0.7, 0.62), ui = S().ui;
  layer(g, cam, 0.1, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, GY, M.sky); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H); FX.sun(g, E.W * 0.78, GY - 30, 60, '#ffffff', M.key, 6); });
  layer(g, cam, 0.3, (g) => FX.skyline(g, { x: -E.W, y: GY, w: E.W * 3, minH: 30, maxH: 120, color: shade(M.dark, 0.1), windowColor: alpha(M.practical, 0.6), lit: 0.3, seed: 6 }));
  layer(g, cam, 0.7, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, E.H * 1.4, [shade(M.floor, 0.1), shade(M.dark, -0.3)]); g.fillRect(-E.W, GY, E.W * 3, E.H);
    poly(g, [[E.W * 0.47, GY], [E.W * 0.53, GY], [E.W * 1.3, E.H * 1.3], [-E.W * 0.3, E.H * 1.3]], shade(M.dark, -0.15));
    for (let i = 0; i < 12; i++) { const u = (i / 12) ** 2, y = lerp(GY + 4, E.H * 1.2, u); for (const sgn of [-1, 1]) { const x = E.W / 2 + sgn * lerp(E.W * 0.03, E.W * 0.8, u); circle(g, x, y, 2 + u * 8, M.practical); glow(g, x, y, 16 + u * 50, M.practical, 0.5); } }
    for (let i = 0; i < 8; i++) { const u = ((i / 8 + t * 0.05) % 1) ** 2, y = lerp(GY + 4, E.H * 1.2, u); seg(g, [[E.W / 2, y], [E.W / 2, y + 4 + u * 40]], 2 + u * 10, alpha('#ffffff', 0.6)); }
  });
  layer(g, cam, 1, (g) => { const s = V(0.75, 0.55), x = E.W * 0.32, y = GY + V(70, 90) - 92 * s; airliner(g, x, y, s, { t, body: mix(M.wall, M.ambient, 0.5), rim: M.rim, win: M.practical });
    for (const wx of [-20, 60, 380]) { seg(g, [[x + wx * s, y + 40 * s], [x + wx * s, y + 92 * s]], 6 * s, '#0b141c'); circle(g, x + wx * s, y + 92 * s, 16 * s, '#0b141c'); } });
  const th = wt('hundred', info, 2.4), v = Math.round(lerp(0, 100, ease.out(prog(t, th - 1.2, th + 0.4))));
  UI.readout(g, { label: 'FUEL', value: (v >= 100 ? '100+' : v) + ' TONS', x: V(120, 90), y: V(130, 220), a: ease.out(prog(t, 0.2, 0.6)) });
} });
registerShot('s56', { draw(g, t, info) {
  const M = mood('dusk'); UI.endScreen(g, t, { question: "What's the longest flight you've ever taken?", cast: [PAX, PILOT], moodColors: [shade(M.dark, -0.3), M.dark, M.wall], rim: M.rim });
} });
