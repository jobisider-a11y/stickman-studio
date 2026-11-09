// shots/02_cabin.js: cabin shots
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, wordTime, seg, circle, ring, rr, glow, alpha, shade, mix, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { cabin, cabinGround, winX, winY, seat, outsideView } from '../sets/cabin.js';
import { PAX, EXTRA, EXTRA2 } from '../cast.js';

// seated row: PAX at window k=0, extras in other rows. o: {s, paxExpr, paxPose, paxLook, extras:true}
export function cabinRow(g, t, cam, o = {}) {
  const r = cabin(g, t, cam, o.cabin || {}); const { GY, M, OM } = r, s = o.s ?? V(1.25, 1.3), seatC = shade(M.wall, -0.55);
  const rim = { color: OM.rim, dir: [0.2, -1], w: 4 };
  layer(g, cam, 1, (g) => {
    const rows = o.rows || [-2, -1, 0, 1, 2];
    for (const k of rows) {
      const x = winX(k) + V(10, 0);
      seat(g, x, GY, s, seatC);
      if (k === 0) drawFigure(g, { x, y: GY, s, facing: 1, outfit: PAX, pose: breathe(o.paxPose || POSES.sit, t), expr: o.paxExpr || 'neutral', look: o.paxLook, rim, shadow: false, blink: (t % 3.1) > 3.0 });
      else if (o.extras !== false) drawFigure(g, { x, y: GY, s, facing: 1, outfit: k % 2 ? EXTRA2 : EXTRA, pose: breathe(k === -1 ? POSES.sitBack : POSES.sit, t, 1, k + 5), expr: k === 2 ? 'sleepy' : 'neutral', rim, shadow: false, blink: (t % (2.7 + k * 0.3)) > 2.6 + k * 0.3 });
    }
  });
  return r;
}
function fgSeats(g, cam, M) {
  blurLayer(g, 12, (g) => { for (const k of [-2, 0, 2]) seat(g, winX(k) + 120, E.H + V(380, 300), V(2.6, 2.4), shade(M.dark, -0.4)); }, cam, 1.7);
}

// s09: cabin wide, ceiling speaker announcing
registerShot('s09', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.02 + 0.05 * k, x: 40 - 80 * k };
  const { M, OM, wy } = cabinRow(g, t, cam, { paxExpr: t > 1.2 ? 'thinking' : 'neutral', paxLook: [0, -0.6] });
  layer(g, cam, 0.5, (g) => {
    const sx = winX(0) + 40, sy = wy - V(90, 110);
    glow(g, sx, sy, 60, M.practical, 0.6);
    FX.rings(g, sx, sy, t, { count: 3, r0: 20, r1: 150, speed: 1.1, color: '#e8f0ff', a: 0.45 });
  });
  UI.readout(g, { label: 'CRUISING', value: 'FL350', x: E.W - V(380, 360), y: V(120, 200), a: ease.out(prog(t, 0.6, 1.0)) });
  fgSeats(g, cam, M);
  FX.dust(g, t, { count: 30, color: '#dfe8ff', a: 0.22 });
} });

// close window view: big oval window, PAX head in profile at right
export function windowClose(g, t, info, o = {}) {
  const M = mood('interiorCool'), OM = mood(o.outside || 'night'), cam = { z: 1 + 0.05 * ease.inOut(t / info.dur), x: -20 * t };
  const ww = V(380, 460), wh = V(540, 640), x = E.W * V(0.36, 0.5) - ww / 2, y = E.H * 0.5 - wh / 2;
  layer(g, cam, 0.6, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, E.H * 2, [shade(M.dark, -0.3), shade(M.wall, -0.1), shade(M.dark, -0.3)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    rr(g, x - 40, y - 40, ww + 80, wh + 80, ww / 2 + 30); g.fillStyle = shade(M.wall, 0.15); g.fill();
    g.save(); rr(g, x, y, ww, wh, ww / 2.1); g.clip(); outsideView(g, x, y, ww, wh, t, OM, { frost: o.frost ? o.frost(t) : 0, sunX: o.sunX ?? 0.4, sky: o.sky }); g.restore();
    rr(g, x, y, ww, wh, ww / 2.1); g.strokeStyle = shade(M.wall, -0.3); g.lineWidth = 10; g.stroke();
    glow(g, x + ww / 2, y + wh / 2, ww * 1.6, OM.key, 0.2);
  });
  layer(g, cam, 1, (g) => drawFigure(g, { x: E.W * V(0.68, 0.76), y: E.H + V(250, 260), s: V(3.8, 3.2), facing: -1, outfit: PAX, pose: breathe(POSES.sit, t), expr: o.expr ? o.expr(t) : 'awe', look: [-1, -0.1], rim: { color: OM.rim, dir: [-1, -0.3], w: 5 }, shadow: false, blink: (t % 3.2) > 3.1 }));
  return { OM, x, y, ww, wh };
}
registerShot('s02', { draw(g, t, info) {
  const tf = (wordTime('fifty', info.shot.start) ?? info.shot.start + 1.6) - info.shot.start;
  windowClose(g, t, info, { outside: 'night', frost: (t) => clamp(t / info.dur) * 0.9, expr: (t) => t > tf ? 'surprised' : 'awe' });
  const ui = S().ui, v = Math.round(lerp(-20, -55, ease.out(prog(t, tf - 0.8, tf + 0.1))));
  UI.readout(g, { label: 'OUTSIDE', value: '−' + Math.abs(v) + '°C', x: V(120, 90), y: E.H - V(150, 380), color: ui.accent, a: ease.out(prog(t, 0.3, 0.7)) });
  FX.snow(g, t, { count: 30, color: '#e8fbff', speed: 20 });
} });
registerShot('s03', { draw(g, t, info) {                          // oxygen mask drops
  blurLayer(g, 12, (g) => cabin(g, t, { z: 1.6, x: 0, y: 140 })); veil(g, '#03080c', 0.4);
  const ui = S().ui, px = E.W / 2, py = V(70, 200), drop = ease.out(prog(t, 0.2, 0.8)), swing = Math.sin((t - 0.8) * 4) * 0.25 * Math.exp(-Math.max(0, t - 0.8) * 0.8) * (t > 0.8);
  rr(g, px - 160, py - 30, 320, 40, 10); g.fillStyle = '#0a1218'; g.fill(); rr(g, px - 150, py - 20, 300, 26, 8); g.fillStyle = '#16242e'; g.fill();
  const L = lerp(20, V(380, 520), drop), mx = px + Math.sin(swing) * L, my = py + Math.cos(swing) * L;
  seg(g, [[px, py], [mx, my - 40]], 5, alpha('#e8fbff', 0.8));
  g.save(); g.translate(mx, my); g.rotate(-swing); rr(g, -60, -50, 120, 100, 40); g.fillStyle = '#f2d24a'; g.fill(); rr(g, -60, -50, 120, 30, 15); g.fillStyle = 'rgba(255,255,255,.35)'; g.fill(); seg(g, [[-60, 0], [-110, -40]], 4, '#e8fbff'); seg(g, [[60, 0], [110, -40]], 4, '#e8fbff'); g.restore();
  glow(g, mx, my, 220, '#f2d24a', 0.2);
  const to = (wordTime('oxygen', info.shot.start) ?? info.shot.start + 1.4) - info.shot.start;
  UI.readout(g, { label: 'OXYGEN', value: 'TOO THIN', x: V(130, 90), y: E.H - V(150, 380), color: ui.accent, a: ease.out(prog(t, to, to + 0.4)) });
  FX.dust(g, t, { count: 18, color: '#e8fbff', a: 0.3 });
} });
registerShot('s10', { draw(g, t, info) {
  blurLayer(g, 14, (g) => cabin(g, t, { z: 1.7, x: 200, y: -160 })); veil(g, '#03080c', 0.35);
  const OM = mood('dusk'), r = V(300, 330) * (1 + 0.04 * t), cx = E.W / 2 - V(120, 0);
  bigFace(g, cx, E.H * V(0.62, 0.55), r, { outfit: PAX, expr: 'confused', look: [0.4, -0.5], rimColor: OM.rim, rimSide: 1, tilt: -0.06 });
  const p = ease.outBack(prog(t, 0.2, 0.6)); if (p > 0) text(g, '?', cx + r * 1.35, E.H * V(0.32, 0.25), { size: 220 * p, color: S().ui.accent, glow: 30, glowColor: alpha(S().ui.accent, 0.7) });
} });
registerShot('s14', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.55 + 0.07 * k, x: 30 - 50 * k, y: V(170, 0) };
  const { M } = cabinRow(g, t, cam, { rows: [-1, 0, 1], cabin: { outside: 'golden' }, paxPose: posesAt(t, [[0, POSES.sit], [1.2, POSES.sitBack]]), paxExpr: t > 1.4 ? 'smirk' : 'thinking', paxLook: [0.2, -0.3] });
  fgSeats(g, cam, M);
} });
registerShot('s32', { draw(g, t, info) {
  const tb = (wordTime('bonus', info.shot.start) ?? info.shot.start + 1.2) - info.shot.start;
  windowClose(g, t, info, { outside: 'golden', sunX: lerp(0.3, 0.45, t / info.dur), expr: (t) => t > tb - 0.3 ? 'happy' : 'awe' });
  FX.lensStreak(g, E.W * 0.36, E.H * 0.6, E.W, '#e8fbff', 0.25);
} });
registerShot('s51', { draw(g, t, info) {                          // altitude ticking up on the seatback screen
  const k = ease.inOut(t / info.dur), cam = { z: 1.45 + 0.06 * k, x: winX(0.5) - E.W / 2 - 40 * k, y: V(150, 0) };
  const { M } = cabinRow(g, t, cam, { rows: [0, 1], paxExpr: t > 1.2 ? 'awe' : 'surprised', paxLook: [1, 0] });
  const alt = Math.round(lerp(34000, 38000, ease.inOut(prog(t, 0.4, info.dur - 0.4))) / 100) * 100, ui = S().ui;
  rr(g, E.W - V(560, 520), V(80, 160), V(460, 440), V(170, 180), 20); g.fillStyle = ui.card; g.fill(); g.strokeStyle = ui.cardLine; g.lineWidth = 2; g.stroke();
  text(g, 'ALTITUDE', E.W - V(330, 300), V(125, 205), { size: V(24, 26), color: ui.sub, font: FONTS.ui, weight: 900, spacing: 3 });
  text(g, alt.toLocaleString('en-US') + ' FT', E.W - V(330, 300), V(190, 270), { size: V(58, 60), color: ui.accent, font: FONTS.ui, weight: 900, glow: 14, glowColor: alpha(ui.accent, 0.5) });
  for (let i = 0; i < 3; i++) { const yy = V(230, 310) - ((t * 60 + i * 40) % 120); FX.sparkle(g, E.W - V(120, 100), yy, 8, ui.accent, 0.6); }
  fgSeats(g, cam, M);
} });
registerShot('s53', { draw(g, t, info) {
  blurLayer(g, 14, (g) => cabin(g, t, { z: 1.7, x: -200, y: -160 }, { outside: 'golden' }), null); veil(g, '#03080c', 0.3);
  const OM = mood('golden'), r = V(300, 330) * (1 + 0.03 * t);
  bigFace(g, E.W / 2 + V(140, 0), E.H * V(0.62, 0.55), r, { outfit: PAX, expr: t > 0.5 ? 'smirk' : 'smile', look: [-0.3, 0], rimColor: OM.rim, rimSide: -1, blink: (t % 2.2) > 2.1 });
} });
