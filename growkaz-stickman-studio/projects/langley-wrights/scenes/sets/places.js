// sets/places.js: 1903 locations: the Potomac (dusk, icy), Kitty Hawk dunes (golden, windy), a museum hall (interiorWarm).
import { E, V, mood, layer, backdrop, rng, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { drawFigure, POSES, breathe } from '/engine/rig2d.js';
import { CROWD } from '../cast.js';

export const WL = () => E.H * 0.6;                 // river waterline
export function river(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), wl = WL(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, wl, M.sky); g.fillRect(-E.W, -E.H, E.W * 3, wl + E.H); FX.sun(g, CX + 260, wl - 120, 50, '#fff4dc', M.key, 6); });
  layer(g, cam, 0.25, (g) => { const c = shade(M.dark, 0.1), dx = CX - 330, dy = wl - 40;          // distant shore + Capitol dome silhouette
    g.fillStyle = c; g.fillRect(-E.W, dy, E.W * 3, 60); rr(g, dx - 110, dy - 60, 220, 60, 4); g.fill(); g.beginPath(); g.arc(dx, dy - 60, 60, Math.PI, 0); g.fill(); g.fillRect(dx - 6, dy - 150, 12, 40); circle(g, dx, dy - 152, 8, c);
    for (let i = 0; i < 18; i++) FX.tree(g, -400 + i * 120, dy + 10, 0.5 + (i % 3) * 0.12, c); });
  layer(g, cam, 0.5, (g) => { g.fillStyle = linGrad(g, 0, wl, 0, E.H * 1.5, [mix(M.sky[1], M.wall, 0.4), shade(M.dark, -0.2)]); g.fillRect(-E.W, wl, E.W * 3, E.H);
    const r = rng(4); for (let i = 0; i < 26; i++) { const x = -E.W + r() * E.W * 3 - t * 10, y = wl + 20 + r() * E.H * 0.35, w = 60 + r() * 140; poly(g, [[x, y], [x + w, y - 4], [x + w * 0.9, y + 12], [x + 10, y + 14]], alpha('#e8eef0', 0.55)); }
    for (let i = 0; i < 10; i++) seg(g, [[CX + 100 - i * 30, wl + 30 + i * 22], [CX + 240 + i * 30, wl + 30 + i * 22]], 3, alpha(M.key, 0.25 * (1 - i / 10))); });
  if (o.crowd !== false) layer(g, cam, 0.9, (g) => { const by = E.H * 0.82; g.fillStyle = shade(M.dark, -0.2); g.beginPath(); g.moveTo(-E.W, E.H * 2); g.lineTo(-E.W, by); g.quadraticCurveTo(CX, by - 40, E.W * 2, by + 10); g.lineTo(E.W * 2, E.H * 2); g.fill();
    for (let i = 0; i < 9; i++) drawFigure(g, { x: -60 + i * 150, y: by - 14 + Math.abs(i - 4) * 3, s: 0.85, facing: i % 2 ? 1 : -1, outfit: CROWD, pose: o.cheer ? (i % 2 ? POSES.cheer : POSES.wave) : breathe(POSES.stand, t, 1, i), expr: o.cheer ? 'happy' : 'neutral', rim: { color: M.rim, dir: [0.3, -1] } }); });
  FX.snow(g, t, { count: 50, color: '#ffffff', speed: 40 });
  return { M, wl, CX };
}
export function houseboat(g, x, y, s, M, o = {}) {           // y = waterline; returns the catapult launch point
  g.save(); g.translate(x, y); g.scale(s, s); const c = shade(M.dark, 0.05);
  poly(g, [[-260, -30], [260, -30], [230, 30], [-230, 30]], c); seg(g, [[-260, -30], [260, -30]], 4, alpha(M.rim, 0.6));
  rr(g, -200, -150, 400, 120, 6); g.fillStyle = shade(M.wall, -0.2); g.fill(); for (let i = 0; i < 5; i++) { rr(g, -170 + i * 76, -120, 40, 40, 4); g.fillStyle = alpha(M.practical, 0.75); g.fill(); }
  seg(g, [[-200, -150], [240, -190]], 10, shade(M.dark, 0.25)); seg(g, [[-200, -150], [-200, -260], [-120, -260]], 6, shade(M.dark, 0.25)); // catapult rail + tower
  g.restore(); return [x + 40 * s, y - 175 * s];
}
export const DUNE = () => E.H * 0.66;
export function dunes(g, t, cam, o = {}) {
  const M = mood(o.mood || 'golden'), gy = DUNE(), CX = E.W / 2;
  layer(g, cam, 0.1, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, gy, M.sky); g.fillRect(-E.W, -E.H, E.W * 3, gy + E.H); FX.sun(g, CX - 280, gy - 420, 60, '#fff4dc', M.key, 6); FX.clouds(g, { y: gy - 900, h: 300, color: '#fff4e0', a: 0.18, seed: 4 }); });
  layer(g, cam, 0.3, (g) => { g.fillStyle = mix(M.sky[1], '#6a8a90', 0.5); g.fillRect(-E.W, gy - 90, E.W * 3, 40); FX.hills(g, { y: gy - 60, amp: 50, color: shade(M.floor, 0.25), freq: 0.004, seed: 3 }); });
  layer(g, cam, 0.6, (g) => { FX.hills(g, { y: gy, amp: 30, color: shade(M.floor, 0.1), freq: 0.003, seed: 9 }); g.fillStyle = linGrad(g, 0, gy, 0, E.H * 1.4, [shade(M.floor, 0.05), shade(M.dark, -0.1)]); g.fillRect(-E.W, gy + 20, E.W * 3, E.H);
    for (let i = 0; i < 30; i++) { const y = gy + 40 + (i % 10) * 50, x = ((i * 160 + t * 300) % (E.W + 600)) - 300; seg(g, [[x, y], [x + 120, y]], 2, alpha('#f2e4c0', 0.25)); }
    if (o.rail !== false) { seg(g, [[CX - 400, gy + 60], [CX + 420, gy + 60]], 8, '#3a2a20'); seg(g, [[CX - 400, gy + 56], [CX + 420, gy + 56]], 2, alpha(M.rim, 0.6)); } });
  for (let i = 0; i < 20; i++) { const y = E.H * (0.2 + (i % 7) * 0.08), x = ((i * 233 + t * 900) % (E.W + 400)) - 200; seg(g, [[x, y], [x + 160, y]], 2, alpha('#ffffff', 0.18)); }
  return { M, gy, CX };
}
export function museum(g, t, cam, o = {}) {
  const M = mood('interiorWarm'), gy = E.H * 0.66, CX = E.W / 2;
  layer(g, cam, 0.4, (g) => { backdrop(g, [shade(M.dark, -0.2), M.wall, shade(M.wall, -0.15)]);
    for (let i = -3; i <= 3; i++) { const x = CX + i * 300; rr(g, x - 34, gy - 1100, 68, 1100, 8); g.fillStyle = shade(M.wall, 0.12); g.fill(); seg(g, [[x - 28, gy - 1100], [x - 28, gy]], 3, alpha(M.rim, 0.35)); }
    for (let i = -2; i <= 2; i++) FX.lightCone(g, CX + i * 260, E.H * 0.04, { len: 1100, spread: 0.35, a: 0.1, color: M.practical });
    g.fillStyle = linGrad(g, 0, gy, 0, E.H, [shade(M.floor, 0.15), shade(M.dark, -0.2)]); g.fillRect(-E.W, gy, E.W * 3, E.H); FX.floorLines(g, gy, E.H, 'rgba(0,0,0,.2)', 0.07); FX.pool(g, CX, gy + 30, 420, 70, M.key, 0.25);
    rr(g, CX - 200, gy - 30, 400, 40, 8); g.fillStyle = shade(M.dark, 0.1); g.fill(); });
  FX.dust(g, t, { count: 40 });
  return { M, gy, CX };
}
