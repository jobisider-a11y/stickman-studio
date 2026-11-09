// sets/ramp.js: airport apron. Terminal + jet bridge on the left, the jet parked nose-left at the gate, vehicles, floodlights.
import { E, mood, layer, backdrop, rng, seg, circle, rr, poly, glow, alpha, shade, mix, linGrad, ease, prog, lerp } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { drawFigure, POSES, breathe, walkPose } from '/engine/rig2d.js';
import { airliner } from '../props/plane.js';
import { WHO } from '../cast.js';

export const rampGY = () => E.H * 0.8;
const night = (n) => n === 'night' || n === 'storm';
// plane on the ground: returns geometry used for vehicles/doors
export function parkedJet(g, t, M, px, s, o = {}) {
  const GY = rampGY(), cy = GY - 150 * s;
  for (const [gx, h] of [[-380, 102], [40, 98], [90, 98]]) { const x = px - gx * s; seg(g, [[x, cy + 40 * s], [x, GY - 16 * s]], 7 * s, '#0b141c'); circle(g, x, GY - 16 * s, 17 * s, '#0b141c'); circle(g, x, GY - 16 * s, 6 * s, '#3a4a54'); }
  airliner(g, px, cy, s, { t, facing: -1, body: mix(M.wall, M.ambient, 0.5), rim: M.rim, win: o.dark ? alpha(M.practical, 0.15) : M.practical, lights: !o.dark || ((t % 1.3) < 0.12) });
  if (o.reg) { g.save(); g.translate(px + 430 * s, cy - 150 * s); g.font = `900 ${Math.round(34 * s)}px Nunito`; g.textAlign = 'center'; g.fillStyle = alpha('#ffffff', 0.85); g.fillText(o.reg, 0, 0); g.restore(); }
  return { cy, door: [px - 330 * s, cy - 6 * s], cargo: [px - 120 * s, cy + 40 * s], nose: [px - 468 * s, cy], tail: [px + 440 * s, cy - 120 * s], wing: [px + 60 * s, cy + 60 * s] };
}
function beacon(g, x, y, t, k = 0) { if (((t + k * 0.37) % 0.9) < 0.18) { glow(g, x, y, 40, '#ffb020', 0.9); circle(g, x, y, 5, '#ffd080'); } else circle(g, x, y, 4, '#8a5a10'); }
export function vehicle(g, kind, x, GY, t, o = {}) {
  const ink = '#0d161e', lite = o.lite || '#c8d4dc';
  if (kind === 'fuel') { rr(g, x - 150, GY - 120, 230, 90, 40); g.fillStyle = lite; g.fill(); rr(g, x + 80, GY - 110, 80, 80, 10); g.fillStyle = '#3a6ea5'; g.fill(); rr(g, x + 120, GY - 102, 32, 30, 6); g.fillStyle = alpha('#cfe8ff', 0.6); g.fill(); text3(g, 'FUEL', x - 35, GY - 75); beacon(g, x + 120, GY - 116, t, 1); }
  else if (kind === 'catering') { const lift = o.lift || 0, by = GY - 150 - lift * (o.liftH || 110); for (let i = 0; i < 3; i++) seg(g, [[x - 90, by + 90 + i * 0 ], [x + 50, GY - 50]], 4, alpha(ink, 0.9)); seg(g, [[x + 50, by + 90], [x - 90, GY - 50]], 4, ink); rr(g, x - 120, by, 200, 90, 6); g.fillStyle = lite; g.fill(); text3(g, 'CATERING', x - 20, by + 46, 22); rr(g, x + 90, GY - 110, 80, 80, 10); g.fillStyle = '#5a6a74'; g.fill(); beacon(g, x + 130, GY - 116, t, 2); }
  else if (kind === 'tug') { rr(g, x - 90, GY - 60, 180, 40, 10); g.fillStyle = '#e8c23a'; g.fill(); rr(g, x - 30, GY - 100, 60, 40, 8); g.fillStyle = alpha('#cfe8ff', 0.4); g.fill(); seg(g, [[x - 90, GY - 30], [x - 170, GY - 30]], 6, ink); beacon(g, x, GY - 104, t, 3); }
  else if (kind === 'belt') { seg(g, [[x - 60, GY - 30], [x + 140, GY - 150]], 18, '#2a3a44'); for (let i = 0; i < 4; i++) { const u = ((t * 0.4 + i / 4) % 1); rr(g, lerp(x - 50, x + 120, u) - 16, lerp(GY - 50, GY - 160, u) - 20, 32, 24, 4); g.fillStyle = ['#d64a33', '#3a6ea5', '#f2c21a', '#3fb950'][i]; g.fill(); } rr(g, x - 110, GY - 70, 120, 40, 8); g.fillStyle = '#5a6a74'; g.fill(); beacon(g, x - 50, GY - 74, t, 4); }
  for (const wx of kind === 'tug' ? [x - 50, x + 50] : [x - 100, x + 30, x + 130]) circle(g, wx, GY - 16, 16, ink);
}
function text3(g, s, x, y, size = 26) { g.save(); g.font = `900 ${size}px Nunito`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(10,20,30,.7)'; g.fillText(s, x, y); g.restore(); }
// o: { mood, plane:{x,s}, dark, reg, veh:[{k,x,at,from,lift}], figs:[{who,x,x1,a,b,pose,facing,expr,s,prop}], walkers, lap }
export function ramp(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), GY = rampGY(), CX = E.W / 2, nt = night(o.mood || 'night');
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); if (nt) FX.stars(g, t, { count: 120, area: [-E.W, -E.H, E.W * 3, E.H * 1.2] }); else FX.sun(g, E.W * 0.86, GY - (o.sunY ?? 160), 55, '#fff4dc', M.key, 6); });
  layer(g, cam, 0.25, (g) => { const c = shade(M.dark, 0.08); FX.skyline(g, { x: -E.W, y: GY - 40, w: E.W * 3, minH: 20, maxH: 90, color: c, windowColor: alpha(M.practical, 0.4), lit: 0.2, seed: 7 });
    const tx = E.W * 0.8; rr(g, tx - 14, GY - 330, 28, 300, 4); g.fillStyle = c; g.fill(); rr(g, tx - 50, GY - 380, 100, 60, 10); g.fill(); rr(g, tx - 42, GY - 372, 84, 26, 4); g.fillStyle = alpha(M.practical, 0.7); g.fill(); });
  const p = o.plane || {}, s = p.s ?? 1.15, px = E.W * lerp(p.x ?? 0.62, p.x1 ?? p.x ?? 0.62, ease.inOut(prog(t, p.a ?? 0, p.b ?? 3)));
  let geo;
  layer(g, cam, 0.6, (g) => {
    const tw = E.W * 0.3, ty = GY - 440; g.fillStyle = shade(M.wall, -0.25); g.fillRect(-E.W, ty, E.W + tw, 460); g.fillStyle = shade(M.wall, -0.45); g.fillRect(-E.W, ty - 20, E.W + tw + 20, 24);
    g.fillStyle = linGrad(g, 0, ty + 60, 0, ty + 300, [alpha(M.practical, nt ? 0.75 : 0.45), alpha(M.practical, nt ? 0.4 : 0.2)]); g.fillRect(-E.W, ty + 60, E.W + tw - 30, 240);
    for (let x = -E.W; x < tw - 30; x += 90) seg(g, [[x, ty + 60], [x, ty + 300]], 6, shade(M.wall, -0.4));
    if (o.walkers) for (let i = 0; i < 6; i++) { const wx = ((i * 230 + t * 110) % (tw + 600)) - 600; drawFigure(g, { x: wx, y: ty + 300, s: 0.9, facing: 1, outfit: i === 2 ? WHO.PAX : (i % 2 ? WHO.EXTRA2 : WHO.EXTRA), pose: walkPose(t * 5.6 + i), expr: 'neutral', rim: { color: M.practical, dir: [0, -1] }, shadow: false }); }
    g.fillStyle = linGrad(g, 0, GY, 0, E.H * 1.3, [shade(M.floor, 0.05), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3, E.H);
    seg(g, [[E.W * 0.15, GY + 60], [E.W * 1.4, GY + 60]], 5, alpha('#e8c23a', 0.6)); seg(g, [[-E.W, GY + 200], [E.W * 2, GY + 200]], 3, alpha('#ffffff', 0.25));
    if (nt || o.mood === 'dusk') for (const lx of [E.W * 0.38, E.W * 1.05]) { FX.lampPost(g, lx, GY, 520, { light: M.practical }); FX.lightCone(g, lx + 30, GY - 530, { len: 700, spread: 0.7, a: 0.16, color: M.practical }); FX.pool(g, lx, GY + 20, 320, 50, M.practical, 0.25); }
    geo = parkedJet(g, t, M, px, s, { dark: o.dark, reg: o.reg });
    if (o.spool) o.spool.forEach((t0, i) => { const k = prog(t, t0, t0 + 1.5); if (k <= 0) return; const ex = px - 150 * s, ey = geo.cy + 46 * s; g.save(); g.translate(ex, ey); for (let j = 0; j < 6; j++) { const a = j / 6 * Math.PI * 2 + t * 30 * k; seg(g, [[0, 0], [Math.cos(a) * 3, Math.sin(a) * 20 * s]], 3, alpha('#e8fbff', 0.5 * k)); } g.restore(); for (let j = 0; j < 5; j++) { const u = ((t * 2 + j / 5) % 1); seg(g, [[ex + 140 * s + u * 300, ey - 10 + j * 5], [ex + 180 * s + u * 300, ey - 10 + j * 5]], 3, alpha('#e8fbff', 0.35 * k * (1 - u))); } glow(g, ex + 140 * s, ey, 90, '#ffb070', 0.35 * k); });
    if (o.noBridge) return;
    const bx = geo.door[0], by = geo.door[1]; poly(g, [[tw - 40, ty + 120], [bx + 30, by - 60], [bx + 30, by + 50], [tw - 40, ty + 230]], shade(M.wall, -0.15)); seg(g, [[bx + 30, by + 50], [bx + 30, GY]], 14, shade(M.dark, 0.1)); seg(g, [[tw - 40, ty + 120], [bx + 30, by - 60]], 3, alpha(M.rim, 0.5));
    if (o.lap) { g.save(); g.setLineDash([16, 14]); g.lineDashOffset = -t * 60; g.strokeStyle = alpha(E.style.ui.gold, 0.8); g.lineWidth = 4; g.beginPath(); g.ellipse(px, GY + 30, 560 * s, 70, 0, 0, 7); g.stroke(); g.restore(); }
  });
  layer(g, cam, 0.85, (g) => (o.veh || []).forEach((v) => { const k = ease.out(prog(t, v.at ?? 0, (v.at ?? 0) + 2)); vehicle(g, v.k, lerp(E.W * (v.from ?? 1.4), E.W * v.x, k), GY + (v.dy ?? 30), t, { lift: v.lift ? ease.inOut(prog(t, v.lift[0], v.lift[1])) : 0, liftH: v.liftH }); }));
  layer(g, cam, 1, (g) => (o.figs || []).forEach((f, i) => { const of = WHO[f.who] || WHO.EXTRA, s2 = f.s ?? 1.3, walking = f.x1 != null && t > (f.a ?? 0) && t < (f.b ?? 99);
    const u = f.x1 != null ? ease.inOut(prog(t, f.a ?? 0, f.b ?? 3)) : 0, x = E.W * lerp(f.x, f.x1 ?? f.x, u), fac = f.facing ?? (f.x1 != null ? Math.sign(f.x1 - f.x) || 1 : 1);
    drawFigure(g, { x, y: GY + (f.dy ?? 40), s: s2, facing: fac, outfit: of, pose: walking ? walkPose(t * 5.6 + i) : breathe(POSES[f.pose || 'stand'] || POSES.stand, t, 1, i), prop: f.prop, expr: f.expr || 'neutral', look: f.look, rim: { color: M.rim, dir: [-0.5, -1] } }); }));
  return { M, GY, geo, nt };
}
