// shots/05_blueprint.js: blueprint explainers
import { E, V, S, registerShot, ease, prog, clamp, lerp, rng, wordTime, seg, circle, ring, rr, poly, glow, alpha, mix, text, FONTS } from '/engine/core.js';
import * as UI from '/engine/ui2d.js';
import { planeIcon, airliner } from '../props/plane.js';

export const wt = (w, info, fb) => (wordTime(w, info.shot.start - 0.1) ?? info.shot.start + fb) - info.shot.start;
// a box of drifting air molecules
export function airBox(g, t, x, y, w, h, n, color, seed = 1) {
  const r = rng(seed); rr(g, x, y, w, h, 18); g.strokeStyle = alpha(color, 0.6); g.lineWidth = 3; g.stroke();
  g.save(); rr(g, x, y, w, h, 18); g.clip();
  for (let i = 0; i < n; i++) { const px = x + ((r() * w + Math.sin(t * (0.6 + r()) + i) * 14) % w), py = y + ((r() * h + Math.cos(t * (0.5 + r()) + i * 2) * 14) % h); circle(g, px, py, 7, alpha(color, 0.9)); }
  g.restore();
}

// s18: SEA LEVEL vs 35,000 FT density
registerShot('s18', { draw(g, t, info) {
  UI.blueprint(g); const c = UI.bpStroke(), ui = S().ui;
  const tThird = wt('third', info, 2.6), bw = V(560, 760), bh = V(460, 420);
  const x1 = E.W / 2 - bw - V(80, -bw / 2), x2 = E.W / 2 + V(80, -bw / 2), y1 = E.H * V(0.24, 0.12), y2 = E.H * V(0.24, 0.56);
  const a1 = ease.out(prog(t, 0, 0.4)), a2 = ease.out(prog(t, 0.6, 1.0));
  g.save(); g.globalAlpha *= a1; airBox(g, t, x1, y1, bw, bh, 120, c, 3); text(g, 'SEA LEVEL', x1 + bw / 2, y1 + bh + 56, { size: V(40, 44), color: c, font: FONTS.ui, weight: 900, spacing: 3 }); g.restore();
  g.save(); g.globalAlpha *= a2; airBox(g, t, x2, y2, bw, bh, 38, ui.gold, 9); text(g, '35,000 FT', x2 + bw / 2, y2 + bh + 56, { size: V(40, 44), color: ui.gold, font: FONTS.ui, weight: 900, spacing: 3 }); g.restore();
  const p = ease.outBack(prog(t, tThird - 0.1, tThird + 0.35));
  if (p > 0) { g.save(); g.translate(x2 + bw / 2, y2 + bh / 2); g.scale(p, p); circle(g, 0, 0, 120, alpha(S().ui.bpBg, 0.85)); ring(g, 0, 0, 120, 5, ui.gold); glow(g, 0, 0, 240, ui.gold, 0.3); text(g, '≈ 1/3', 0, 0, { size: 84, color: ui.gold, font: FONTS.ui, weight: 900, glow: 18, glowColor: alpha(ui.gold, 0.6) }); g.restore();
    text(g, 'AIR DENSITY', E.W / 2, E.H * V(0.1, 0.06), { size: V(34, 38), color: alpha(c, 0.8), font: FONTS.ui, weight: 900, spacing: 6, alpha: clamp(t / 0.5) }); }
} });

const WARN = '#ff5a4f';
const lbl = (g, s, x, y, o = {}) => text(g, s, x, y, { size: V(36, 40), color: o.color || UI.bpStroke(), font: FONTS.ui, weight: 900, spacing: 3, align: o.align || 'center', alpha: o.a ?? 1, glow: o.glow || 0, glowColor: alpha(o.color || UI.bpStroke(), 0.6) });
function arrow(g, x1, y1, x2, y2, w, color, p = 1) { if (p <= 0) return; const ex = lerp(x1, x2, p), ey = lerp(y1, y2, p), a = Math.atan2(y2 - y1, x2 - x1); seg(g, [[x1, y1], [ex, ey]], w, color); poly(g, [[ex + Math.cos(a) * w * 2, ey + Math.sin(a) * w * 2], [ex + Math.cos(a + 2.4) * w * 2.6, ey + Math.sin(a + 2.4) * w * 2.6], [ex + Math.cos(a - 2.4) * w * 2.6, ey + Math.sin(a - 2.4) * w * 2.6]], color); }
// side-view airliner outline in blueprint colours
const bpPlane = (g, t, x, y, s, o = {}) => airliner(g, x, y, s, { t, body: '#0f2a3a', rim: UI.bpStroke(), win: S().ui.gold, lights: false, ...o });

registerShot('s07', { draw(g, t, info) {                  // altitude column 0..12 km
  UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, x0 = E.W * V(0.3, 0.25), y0 = E.H * 0.88, y1 = E.H * 0.1, km = (v) => lerp(y0, y1, v / 12);
  seg(g, [[x0, y0], [x0, y1]], 3, c); seg(g, [[x0 - 200, y0], [E.W * 0.9, y0]], 3, c);
  for (let v = 0; v <= 12; v += 2) { seg(g, [[x0 - 14, km(v)], [x0, km(v)]], 3, c); text(g, v + ' km', x0 - 26, km(v), { size: 26, color: alpha(c, 0.8), font: FONTS.ui, weight: 800, align: 'right' }); }
  const ev = 8.85, mx = x0 + V(330, 200); poly(g, [[mx - 220, y0], [mx, km(ev)], [mx + 240, y0]], alpha(c, 0.15)); seg(g, [[mx - 220, y0], [mx, km(ev)], [mx + 240, y0]], 3, c);
  g.setLineDash([8, 10]); seg(g, [[x0, km(ev)], [mx, km(ev)]], 2, alpha(c, 0.6)); g.setLineDash([]); lbl(g, 'EVEREST 8.8 km', mx, km(ev) - 34, { a: clamp(t / 0.5) });
  const tk = wt('kilometers', info, 0.9), p = ease.inOut(prog(t, 0, tk + 0.1)), alt = lerp(0, 10.5, p), py = km(alt);
  g.setLineDash([8, 10]); seg(g, [[x0, py], [E.W * 0.6, py]], 2, alpha(gold, 0.7)); g.setLineDash([]);
  bpPlane(g, t, E.W * 0.68, py, V(0.22, 0.18));
  const a = ease.out(prog(t, tk, tk + 0.4)); if (a > 0) { lbl(g, '10.5 km', E.W * 0.86, py - 40, { color: gold, a, glow: 14 }); lbl(g, '35,000 FT', E.W * 0.86, py + 20, { a }); }
} });
registerShot('s13', { draw(g, t, info) {                  // the balancing act
  UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, cx = E.W / 2, cy = E.H * 0.6, L = V(620, 420);
  const ang = Math.sin(t * 2.4) * 0.28 * Math.exp(-t * 0.9);
  poly(g, [[cx, cy], [cx - 60, cy + 110], [cx + 60, cy + 110]], alpha(c, 0.3)); seg(g, [[cx, cy], [cx - 60, cy + 110], [cx + 60, cy + 110], [cx, cy]], 3, c);
  const ex = Math.cos(ang) * L, ey = Math.sin(ang) * L; seg(g, [[cx - ex, cy - ey], [cx + ex, cy + ey]], 8, c);
  const box = (x, y, s, col) => { rr(g, x - 90, y - 140, 180, 140, 14); g.fillStyle = alpha(col, 0.15); g.fill(); g.strokeStyle = col; g.lineWidth = 3; g.stroke(); lbl(g, s, x, y - 70, { color: col }); };
  box(cx - ex, cy - ey, 'LOWER', c); box(cx + ex, cy + ey, 'HIGHER', c);
  lbl(g, 'THICK AIR', cx - ex, cy - ey + 44, { a: 0.8 }); lbl(g, 'THIN AIR', cx + ex, cy + ey + 44, { a: 0.8 });
  bpPlane(g, t, cx, cy - 90, V(0.22, 0.17));
  if (t > 1.2) { const a = ease.out(prog(t, 1.2, 1.6)); glow(g, cx, cy - 90, 260, gold, 0.25 * a); }
} });
registerShot('s17', { draw(g, t, info) {                  // near the ground: thick air pushes back
  UI.blueprint(g); const c = UI.bpStroke(), gy = E.H * 0.82, px = E.W * 0.38, py = E.H * 0.6, r = rng(4);
  seg(g, [[-50, gy], [E.W + 50, gy]], 4, c); lbl(g, 'GROUND', E.W * 0.1, gy + 40, { a: 0.7 });
  for (let i = 0; i < 260; i++) { const x = ((r() * E.W * 1.3 - t * 300) % (E.W * 1.3) + E.W * 1.3) % (E.W * 1.3) - 100, y = E.H * 0.08 + r() * (gy - E.H * 0.1); circle(g, x, y, 5, alpha(c, 0.55)); }
  bpPlane(g, t, px, py, V(0.42, 0.32));
  const tt = wt('thick', info, 1.0), tp = wt('pushes', info, 1.8);
  for (let i = 0; i < 4; i++) { const yy = py - 90 + i * 60, p = ease.out(prog(t, tp + i * 0.08, tp + 0.4 + i * 0.08)); arrow(g, E.W * 0.95, yy, px + 220, yy, 9, WARN, p); }
  lbl(g, 'THICK AIR', E.W * 0.78, E.H * 0.16, { color: S().ui.gold, a: ease.out(prog(t, tt, tt + 0.3)), glow: 12 }); lbl(g, 'DRAG', E.W * 0.82, py + 170, { color: WARN, a: ease.out(prog(t, tp + 0.3, tp + 0.6)) });
} });
registerShot('s23', { draw(g, t, info) {                  // the same air slows you down and holds you up
  UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, px = E.W * 0.5, py = E.H * 0.55, r = rng(8);
  for (let i = 0; i < 90; i++) { const x = ((r() * E.W - t * 200) % E.W + E.W) % E.W, y = r() * E.H; circle(g, x, y, 4, alpha(c, 0.35)); }
  bpPlane(g, t, px, py, V(0.45, 0.34));
  const ts = wt('slows', info, 1.1), th = wt('holds', info, 3.0);
  arrow(g, px - 240, py + 10, px - 520, py + 10, 10, WARN, ease.out(prog(t, ts, ts + 0.5))); lbl(g, 'DRAG', px - 420, py - 34, { color: WARN, a: ease.out(prog(t, ts + 0.2, ts + 0.6)) });
  arrow(g, px, py - 60, px, py - 300, 10, gold, ease.out(prog(t, th, th + 0.5))); lbl(g, 'LIFT', px + 80, py - 260, { color: gold, a: ease.out(prog(t, th + 0.2, th + 0.6)), align: 'left', glow: 12 });
  lbl(g, 'SAME AIR', E.W / 2, E.H * 0.12, { a: ease.out(prog(t, th + 0.4, th + 0.8)) });
} });
registerShot('s24', { draw(g, t, info) {                  // airfoil: air pushed down, lift up
  UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, cx = E.W / 2, cy = E.H * 0.52, W = V(700, 480);
  g.save(); g.translate(cx, cy); g.rotate(0.12);
  g.beginPath(); g.moveTo(-W / 2, 0); g.bezierCurveTo(-W / 2, -70, -W * 0.1, -90, W / 2, 6); g.bezierCurveTo(W * 0.1, 30, -W / 2, 40, -W / 2, 0); g.fillStyle = alpha(c, 0.15); g.fill(); g.strokeStyle = c; g.lineWidth = 4; g.stroke(); g.restore();
  const td = wt('downward', info, 1.7), bend = ease.inOut(prog(t, 0.2, td));
  for (let j = -4; j <= 4; j++) { if (j === 0) continue; const y0 = cy + j * 46; g.strokeStyle = alpha(c, 0.7); g.lineWidth = 3; g.setLineDash([26, 18]); g.lineDashOffset = -t * 300; g.beginPath(); for (let x = -100; x <= E.W + 100; x += 20) { const u = clamp((x - (cx + W * 0.3)) / 500), y = y0 + (j < 0 ? -Math.exp(-(((x - cx) / 300) ** 2)) * 40 : Math.exp(-(((x - cx) / 300) ** 2)) * 18) + u * 160 * bend; x === -100 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); g.setLineDash([]); }
  const tl = wt('lift', info, 0.6); arrow(g, cx, cy - 70, cx, cy - 330, 12, gold, ease.out(prog(t, tl, tl + 0.5))); lbl(g, 'LIFT', cx + 70, cy - 300, { color: gold, a: ease.out(prog(t, tl, tl + 0.5)), align: 'left', glow: 12 });
  for (let i = 0; i < 3; i++) arrow(g, cx + W * 0.55 + i * 90, cy + 80, cx + W * 0.55 + i * 90, cy + 220, 7, c, ease.out(prog(t, td + i * 0.1, td + 0.4 + i * 0.1)));
  lbl(g, 'AIR PUSHED DOWN', cx + W * 0.66, cy + 280, { a: ease.out(prog(t, td, td + 0.4)) });
} });
registerShot('s25', { draw(g, t, info) {                  // engine: air + fuel -> thrust
  UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, cx = E.W / 2, cy = E.H * 0.5, W = V(760, 520), H = V(240, 200);
  g.beginPath(); g.moveTo(cx - W / 2, cy - H / 2); g.lineTo(cx + W * 0.3, cy - H * 0.38); g.lineTo(cx + W / 2, cy - H * 0.2); g.lineTo(cx + W / 2, cy + H * 0.2); g.lineTo(cx + W * 0.3, cy + H * 0.38); g.lineTo(cx - W / 2, cy + H / 2); g.strokeStyle = c; g.lineWidth = 4; g.stroke();
  g.fillStyle = alpha(c, 0.08); g.fill();
  for (let i = 0; i < 9; i++) { const a = t * 12 + i * 0.7; seg(g, [[cx - W * 0.35, cy], [cx - W * 0.35 + Math.cos(a) * 10, cy + Math.sin(a) * H * 0.42]], 4, alpha(c, 0.7)); }
  const ta = wt('air', info, 0.6), tf = wt('fuel', info, 1.4);
  const r = rng(3); for (let i = 0; i < 40; i++) { const u = ((r() + t * 0.6) % 1), x = lerp(cx - W * 0.9, cx + W * 0.1, u), y = cy + (r() - 0.5) * H * 0.7 * (1 - u * 0.4); circle(g, x, y, 4, alpha(c, 0.7 * clamp((t - ta + 0.3) * 2))); }
  const fp = clamp((t - tf) * 2); if (fp > 0) { glow(g, cx + W * 0.15, cy, 160 * fp, '#ffb050', 0.6); for (let i = 0; i < 6; i++) circle(g, cx + W * 0.05 + i * 10, cy - 50 + ((t * 200 + i * 30) % 100), 5, alpha('#ffb050', fp)); }
  for (let i = 0; i < 3; i++) arrow(g, cx + W * 0.55, cy - 50 + i * 50, cx + W * 0.55 + 260, cy - 50 + i * 50, 7, gold, ease.out(prog(t, tf + 0.4 + i * 0.1, tf + 0.9 + i * 0.1)));
  lbl(g, 'AIR', cx - W * 0.75, cy - H * 0.7, { a: ease.out(prog(t, ta, ta + 0.4)) }); lbl(g, 'FUEL', cx + W * 0.1, cy - H * 0.75, { color: '#ffb050', a: fp }); lbl(g, 'THRUST', cx + W * 0.55 + 150, cy + H * 0.6, { color: gold, a: ease.out(prog(t, tf + 0.5, tf + 0.9)) });
} });
registerShot('s28', { draw(g, t, info) {                  // speed squeeze
  UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, x0 = E.W * 0.12, x1 = E.W * 0.88, y = E.H * 0.55;
  const tq = wt('squeezing', info, 2.2), p = ease.inOut(prog(t, 0.1, tq + 0.8));
  const mn = lerp(0.2, 0.62, p), mx = lerp(0.85, 0.68, p), X = (u) => lerp(x0, x1, u);
  seg(g, [[x0, y], [x1, y]], 3, c); lbl(g, 'SPEED →', x1 - 80, y + 60, { a: 0.7 });
  rr(g, X(mn), y - 80, X(mx) - X(mn), 160, 12); const gap = mx - mn; g.fillStyle = alpha(gap < 0.15 ? WARN : c, gap < 0.15 ? 0.35 : 0.15); g.fill();
  seg(g, [[X(mn), y - 120], [X(mn), y + 120]], 6, WARN); seg(g, [[X(mx), y - 120], [X(mx), y + 120]], 6, gold);
  lbl(g, 'TOO SLOW', X(mn) - 20, y - 160, { color: WARN, align: 'right' }); lbl(g, 'TOO FAST', X(mx) + 20, y - 160, { color: gold, align: 'left' });
  lbl(g, 'SAFE', (X(mn) + X(mx)) / 2, y, { a: clamp(gap * 6) });
  const alt = Math.round(lerp(30, 45, p)) * 1000; UI.readout(g, { label: 'ALTITUDE', value: alt.toLocaleString('en-US') + ' FT', x: E.W / 2, y: E.H * 0.18, align: 'center' });
} });
registerShot('s41', { draw(g, t, info) {                  // New York <-> London
  UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, A = [E.W * 0.16, E.H * 0.62], B = [E.W * 0.84, E.H * 0.5], C = [E.W * 0.5, E.H * 0.18];
  const q = (u) => [(1 - u) ** 2 * A[0] + 2 * (1 - u) * u * C[0] + u * u * B[0], (1 - u) ** 2 * A[1] + 2 * (1 - u) * u * C[1] + u * u * B[1]];
  g.strokeStyle = alpha(c, 0.5); g.lineWidth = 3; g.setLineDash([12, 12]); g.beginPath(); g.moveTo(...A); g.quadraticCurveTo(...C, ...B); g.stroke(); g.setLineDash([]);
  for (let i = 0; i < 8; i++) { const u = ((t * 0.25 + i / 8) % 1); const [x, y] = q(u); circle(g, x, y + 40, 4, alpha(c, 0.6)); }
  for (const [P, s] of [[A, 'NEW YORK'], [B, 'LONDON']]) { circle(g, P[0], P[1], 12, gold); glow(g, P[0], P[1], 60, gold, 0.4); lbl(g, s, P[0], P[1] + 50); }
  lbl(g, 'JET STREAM →', E.W / 2, E.H * 0.75, { a: 0.7 });
  const ue = ease.inOut(prog(t, 0.2, 2.4)), uw = ease.inOut(prog(t, 0.2, 3.4)) * 0.92;
  const pe = q(ue), pe2 = q(Math.min(1, ue + 0.01)); planeIcon(g, pe[0], pe[1], 1.3, gold, Math.atan2(pe2[1] - pe[1], pe2[0] - pe[0]));
  const pw = q(1 - uw), pw2 = q(Math.max(0, 1 - uw - 0.01)); planeIcon(g, pw[0], pw[1] + 30, 1.3, alpha(c, 0.9), Math.atan2(pw2[1] - pw[1], pw2[0] - pw[0]));
  const ts = wt('shorter', info, 3.6); UI.badge(g, { str: '≈ 1 HR SHORTER EASTBOUND', a: ease.out(prog(t, ts - 0.2, ts + 0.3)), size: V(40, 40) });
} });
function lanes(g, t, info, showWest) {
  UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, ys = { 370: 0.2, 360: 0.36, 350: 0.52, 340: 0.68, 330: 0.84 };
  const te = wt('thirty', info, 2.4);
  for (const [fl, u] of Object.entries(ys)) {
    const y = E.H * u, odd = (fl / 10) % 2 === 1, hl = (fl === '350' && (showWest || t > te - 0.3)) || (fl === '360' && showWest), col = hl ? (odd ? gold : S().ui.accent) : alpha(c, 0.35);
    seg(g, [[E.W * 0.2, y], [E.W * 0.95, y]], hl ? 5 : 2, col);
    text(g, 'FL' + fl, E.W * 0.17, y, { size: 40, color: col, font: FONTS.ui, weight: 900, align: 'right' });
    text(g, odd ? 'EAST →' : '← WEST', E.W * 0.04, y, { size: 30, color: alpha(col, hl ? 1 : 0.6), font: FONTS.ui, weight: 900, align: 'left' });
    if (odd || showWest) for (let i = 0; i < 3; i++) { const dir = odd ? 1 : -1, sp = 140, x = E.W * 0.2 + ((((t * sp * dir + i * 300) % (E.W * 0.75)) + E.W * 0.75) % (E.W * 0.75)); planeIcon(g, x, y - 26, 0.8, hl ? col : alpha(c, 0.45), dir > 0 ? 0 : Math.PI); }
  }
  const tod = wt('odd', info, 2.4); if (!showWest) lbl(g, 'ODD = EAST', E.W * 0.6, E.H * 0.08, { color: gold, a: ease.out(prog(t, tod, tod + 0.4)), glow: 12 });
  else { lbl(g, 'ODD = EAST', E.W * 0.4, E.H * 0.08, { color: gold }); const tv = wt('even', info, 1.0); lbl(g, 'EVEN = WEST', E.W * 0.74, E.H * 0.08, { color: S().ui.accent, a: ease.out(prog(t, tv, tv + 0.4)), glow: 12 }); }
}
registerShot('s43', { draw(g, t, info) { lanes(g, t, info, false); } });
registerShot('s44', { draw(g, t, info) { lanes(g, t, info, true); } });
registerShot('s47', { draw(g, t, info) {                  // a moving target
  UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, x0 = E.W * 0.3, y0 = E.H * 0.85, y1 = E.H * 0.15, al = (v) => lerp(y0, y1, (v - 28) / 14);
  seg(g, [[x0, y0], [x0, y1]], 3, c); for (let v = 30; v <= 40; v += 2) { seg(g, [[x0 - 14, al(v)], [x0, al(v)]], 3, c); text(g, v + ',000', x0 - 24, al(v), { size: 26, color: alpha(c, 0.8), font: FONTS.ui, weight: 800, align: 'right' }); }
  const v = 35 + Math.sin(t * 3) * 3.5, y = al(v), tx = E.W * 0.58;
  seg(g, [[x0, y], [tx - 90, y]], 2, alpha(gold, 0.5));
  ring(g, tx, y, 70, 5, gold); ring(g, tx, y, 30, 4, gold); for (const a of [0, 1, 2, 3]) { const an = a * Math.PI / 2; seg(g, [[tx + Math.cos(an) * 50, y + Math.sin(an) * 50], [tx + Math.cos(an) * 95, y + Math.sin(an) * 95]], 4, gold); } glow(g, tx, y, 160, gold, 0.25);
  lbl(g, 'BEST ALTITUDE', tx + 130, y, { color: gold, align: 'left' });
} });
registerShot('s49', { draw(g, t, info) {                  // too heavy for its best altitude
  UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, by = E.H * 0.24, px = E.W * 0.5, th = wt('heavy', info, 0.9);
  g.setLineDash([16, 14]); seg(g, [[E.W * 0.08, by], [E.W * 0.92, by]], 3, gold); g.setLineDash([]); lbl(g, 'BEST ALTITUDE', E.W * 0.2, by - 36, { color: gold, align: 'left' });
  const bob = Math.max(0, Math.sin(t * 2.2)) * 50, py = E.H * 0.6 - bob * (1 - prog(t, th, th + 0.5));
  bpPlane(g, t, px, py, V(0.42, 0.32));
  const a = ease.out(prog(t, th, th + 0.4)); arrow(g, px, py + 80, px, py + 260, 12, WARN, a); lbl(g, 'HEAVY', px + 60, py + 210, { color: WARN, align: 'left', a });
  for (let i = 0; i < 5; i++) { const yy = py - 80 - i * 50; seg(g, [[px - 40, yy], [px + 40, yy]], 3, alpha(WARN, 0.35 * a * (1 - i / 5))); }
} });
registerShot('s50', { draw(g, t, info) {                  // the step climb as fuel burns
  UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, x0 = E.W * 0.1, x1 = E.W * 0.78, y0 = E.H * 0.82, y1 = E.H * 0.16;
  seg(g, [[x0, y0], [x1, y0]], 3, c); seg(g, [[x0, y0], [x0, y1]], 3, c); lbl(g, 'TIME →', x1 - 60, y0 + 46, { a: 0.7 }); lbl(g, 'ALTITUDE', x0 + 10, y1 - 30, { align: 'left', a: 0.7 });
  const tl = wt('lower', info, 1.0), tc = wt('climbs', info, 3.8);
  const pts = [[0, 0], [0.12, 0.5], [0.35, 0.5], [0.38, 0.65], [0.6, 0.65], [0.63, 0.8], [0.85, 0.8], [0.88, 0.92], [1, 0.92]].map(([u, v]) => [lerp(x0, x1, u), lerp(y0, y1, v)]);
  const p = clamp(ease.inOut(prog(t, 0.2, tl + 0.4)) * 0.3 + ease.inOut(prog(t, tc - 0.8, info.dur - 0.2)) * 0.7);
  const n = pts.length - 1, f = p * n, k = Math.min(n - 1, Math.floor(f)), u = f - k; const head = [lerp(pts[k][0], pts[k + 1][0], u), lerp(pts[k][1], pts[k + 1][1], u)];
  g.strokeStyle = gold; g.lineWidth = 6; g.lineJoin = 'round'; g.beginPath(); g.moveTo(...pts[0]); for (let i = 1; i <= k; i++) g.lineTo(...pts[i]); g.lineTo(...head); g.stroke(); glow(g, head[0], head[1], 70, gold, 0.6);
  planeIcon(g, head[0], head[1] - 28, 1.1, gold, 0);
  lbl(g, 'START LOW', pts[2][0], pts[2][1] + 46, { a: ease.out(prog(t, tl, tl + 0.4)) });
  const fx = E.W * 0.88, fh = E.H * 0.56, fy = E.H * 0.2, fuel = 1 - p * 0.75;
  rr(g, fx - 40, fy, 80, fh, 14); g.strokeStyle = c; g.lineWidth = 3; g.stroke(); rr(g, fx - 32, fy + 8 + (fh - 16) * (1 - fuel), 64, (fh - 16) * fuel, 10); g.fillStyle = alpha('#ffb050', 0.8); g.fill();
  lbl(g, 'FUEL', fx, fy + fh + 40, { color: '#ffb050' });
} });
registerShot('s54', { draw(g, t, info) {                  // weight + winds + traffic -> FL350
  UI.blueprint(g); const c = UI.bpStroke(), gold = S().ui.gold, cx = E.W / 2, cy = E.H * 0.5;
  const items = [['weight', 'WEIGHT', [E.W * 0.18, E.H * 0.3]], ['winds', 'WINDS', [E.W * 0.18, E.H * 0.7]], ['traffic', 'TRAFFIC', [E.W * 0.82, E.H * 0.5]]];
  const tE = (w, i) => wt(w, info, 0.8 + i * 1.0);
  items.forEach(([w, s, [x, y]], i) => {
    const t0 = tE(w, i), a = ease.outBack(prog(t, t0 - 0.1, t0 + 0.3)); if (a <= 0) return;
    g.save(); g.translate(x, y); g.scale(a, a); ring(g, 0, 0, 80, 4, c); 
    if (i === 0) { rr(g, -34, -16, 68, 52, 12); g.fillStyle = c; g.fill(); ring(g, 0, -26, 18, 6, c); }
    else if (i === 1) { for (let j = 0; j < 3; j++) { g.strokeStyle = c; g.lineWidth = 5; g.beginPath(); g.moveTo(-40, -20 + j * 20); g.lineTo(20, -20 + j * 20); g.arc(20, -30 + j * 20, 10, Math.PI / 2, -Math.PI / 2, true); g.stroke(); } }
    else { planeIcon(g, -10, -14, 0.8, c, 0); planeIcon(g, 10, 18, 0.8, c, Math.PI); }
    g.restore(); lbl(g, s, x, y + 120, { a });
    const k = ease.inOut(prog(t, t0 + 0.2, t0 + 0.8)); if (k > 0) { g.setLineDash([10, 10]); seg(g, [[x, y], [lerp(x, cx, k * 0.75), lerp(y, cy, k * 0.75)]], 3, alpha(gold, 0.7)); g.setLineDash([]); }
  });
  const last = tE('traffic', 2) + 0.6, a = ease.outBack(prog(t, last, last + 0.4));
  if (a > 0) { g.save(); g.translate(cx, cy); g.scale(a, a); rr(g, -150, -60, 300, 120, 30); g.fillStyle = alpha(S().ui.bpBg, 0.9); g.fill(); g.strokeStyle = gold; g.lineWidth = 4; g.stroke(); text(g, 'FL350', 0, 0, { size: 70, color: gold, font: FONTS.ui, weight: 900, glow: 18, glowColor: alpha(gold, 0.6) }); g.restore(); glow(g, cx, cy, 320, gold, 0.2 * a); }
} });
