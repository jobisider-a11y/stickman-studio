// templates.js: data-driven shots. Any shot in story/shots.json with params.tpl is drawn by a template here, so
// new shots are JSON, not code. Coordinates in params are FRACTIONS of the frame (0..1). Timing "at" is seconds from
// the shot start, or a word (string) = the moment that word is spoken. Shared extras on every template:
//   cam: {z:[a,b], x:[a,b], y:[a,b]}  camera move over the shot      clock: "5:15 AM" time-of-day card
//   ov:  [overlay, ...]  (label | readout | counter | badge | check | callout | bigLine | title | dim | flash | veil | qmark)
import { E, V, S, registerShot, mood, layer, blurLayer, veil, backdrop, ease, prog, clamp, lerp, rng, shake, wordTime, talkAmount, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { sky as skySet, nearClouds, cloudDeck } from './sets/sky.js';
import { cabin as cabinSet, winX, seat, outsideView } from './sets/cabin.js';
import { cockpit as cockpitSet, cockpitGround, pilotX, pilotSeat } from './sets/cockpit.js';
import { ramp as rampSet, rampGY } from './sets/ramp.js';
import { airliner, planeIcon } from './props/plane.js';
import { WHO } from './cast.js';
import { recorder } from './props/recorder.js';
import { newspaper } from './props/machines.js';

const WARN = '#ff5a4f';
export const col = (c) => !c ? S().ui.gold : c === 'warn' ? WARN : (S().ui[c] || c);
export const at = (v, info, fb = 0.3) => v == null ? fb : typeof v === 'number' ? v : ((wordTime(v, info.shot.start - 0.15) ?? info.shot.start + fb) - info.shot.start);
const X = (f) => f * E.W, Y = (f) => f * E.H;
const camAt = (c = {}, t, dur) => { const k = ease.inOut(clamp(t / dur)); const v = (a, d) => Array.isArray(a) ? lerp(a[0], a[1], k) : (a ?? d); return { z: v(c.z, 1), x: v(c.x, 0), y: v(c.y, 0), r: v(c.r, 0) }; };
function arrow(g, x1, y1, x2, y2, w, color, p = 1) { if (p <= 0) return; const ex = lerp(x1, x2, p), ey = lerp(y1, y2, p), a = Math.atan2(y2 - y1, x2 - x1); seg(g, [[x1, y1], [ex, ey]], w, color); poly(g, [[ex + Math.cos(a) * w * 2, ey + Math.sin(a) * w * 2], [ex + Math.cos(a + 2.4) * w * 2.6, ey + Math.sin(a + 2.4) * w * 2.6], [ex + Math.cos(a - 2.4) * w * 2.6, ey + Math.sin(a - 2.4) * w * 2.6]], color); }
const lbl = (g, s, x, y, o = {}) => text(g, s, x, y, { size: o.size || 44, color: o.color || S().ui.text, font: o.font || FONTS.ui, weight: 900, spacing: o.spacing ?? 3, align: o.align || 'center', alpha: o.a ?? 1, glow: o.glow || 0, glowColor: alpha(o.color || S().ui.gold, 0.6) });

// ---------------- icons (blueprint line art) ----------------
export function icon(g, name, x, y, r, c) {
  g.save(); g.translate(x, y); g.strokeStyle = c; g.fillStyle = c; g.lineWidth = Math.max(3, r * 0.08); g.lineCap = 'round'; g.lineJoin = 'round';
  const L = (pts) => seg(g, pts.map(([a, b]) => [a * r, b * r]), Math.max(3, r * 0.08), c);
  switch (name) {
    case 'plane': planeIcon(g, 0, 0, r / 36, c, -Math.PI / 4); break;
    case 'people': for (const dx of [-0.45, 0, 0.45]) { circle(g, dx * r, -0.3 * r, 0.18 * r, c); g.beginPath(); g.arc(dx * r, 0.35 * r, 0.3 * r, Math.PI, 0); g.fill(); } break;
    case 'storm': for (const [dx, dy, rr2] of [[-0.3, 0, 0.32], [0.1, -0.2, 0.4], [0.42, 0.05, 0.28]]) circle(g, dx * r, dy * r, rr2 * r, c); poly(g, [[0, 0.25 * r], [-0.2 * r, 0.7 * r], [0, 0.65 * r], [-0.12 * r, 1 * r], [0.25 * r, 0.5 * r], [0.05 * r, 0.55 * r], [0.15 * r, 0.25 * r]], S().ui.gold); break;
    case 'bolt': poly(g, [[0.1 * r, -r], [-0.5 * r, 0.1 * r], [-0.05 * r, 0.1 * r], [-0.2 * r, r], [0.5 * r, -0.15 * r], [0.05 * r, -0.15 * r]], c); break;
    case 'clock': ring(g, 0, 0, 0.8 * r, Math.max(3, r * 0.08), c); L([[0, 0], [0, -0.55]]); L([[0, 0], [0.4, 0.15]]); break;
    case 'wasp': g.beginPath(); g.ellipse(0.25 * r, 0, 0.45 * r, 0.22 * r, 0, 0, 7); g.fill(); circle(g, -0.3 * r, 0, 0.18 * r, c); for (let i = 0; i < 3; i++) seg(g, [[(0.05 + i * 0.18) * r, -0.2 * r], [(0.05 + i * 0.18) * r, 0.2 * r]], 3, S().ui.bpBg); g.beginPath(); g.ellipse(-0.05 * r, -0.4 * r, 0.3 * r, 0.14 * r, -0.4, 0, 7); g.globalAlpha *= 0.6; g.fill(); break;
    case 'book': g.strokeRect(-0.7 * r, -0.5 * r, 1.4 * r, r); L([[0, -0.5], [0, 0.5]]); for (let i = 0; i < 3; i++) { L([[-0.55, -0.25 + i * 0.25], [-0.15, -0.25 + i * 0.25]]); L([[0.15, -0.25 + i * 0.25], [0.55, -0.25 + i * 0.25]]); } break;
    case 'fuel': rr(g, -0.45 * r, -0.7 * r, 0.7 * r, 1.4 * r, 0.1 * r); g.stroke(); rr(g, -0.35 * r, -0.1 * r, 0.5 * r, 0.7 * r, 0.06 * r); g.fill(); L([[0.25, -0.4], [0.55, -0.4], [0.55, 0.4]]); break;
    case 'weight': rr(g, -0.6 * r, -0.2 * r, 1.2 * r, 0.8 * r, 0.15 * r); g.fill(); ring(g, 0, -0.45 * r, 0.25 * r, Math.max(3, r * 0.08), c); break;
    case 'oven': g.strokeRect(-0.7 * r, -0.6 * r, 1.4 * r, 1.2 * r); g.strokeRect(-0.5 * r, -0.25 * r, r, 0.65 * r); for (let i = 0; i < 3; i++) circle(g, (-0.4 + i * 0.4) * r, -0.45 * r, 0.06 * r, c); break;
    case 'micro': g.strokeRect(-0.8 * r, -0.5 * r, 1.6 * r, r); g.strokeRect(-0.65 * r, -0.35 * r, 0.9 * r, 0.7 * r); for (let i = 0; i < 3; i++) circle(g, 0.5 * r, (-0.25 + i * 0.25) * r, 0.06 * r, c); break;
    case 'snow': for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; L([[-Math.cos(a) * 0.7, -Math.sin(a) * 0.7], [Math.cos(a) * 0.7, Math.sin(a) * 0.7]]); } break;
    case 'flame': g.beginPath(); g.moveTo(0, -0.8 * r); g.quadraticCurveTo(0.6 * r, -0.1 * r, 0.35 * r, 0.5 * r); g.quadraticCurveTo(0, 0.8 * r, -0.35 * r, 0.5 * r); g.quadraticCurveTo(-0.6 * r, -0.1 * r, 0, -0.8 * r); g.fill(); break;
    case 'wrench': L([[-0.6, 0.6], [0.25, -0.25]]); ring(g, 0.4 * r, -0.4 * r, 0.25 * r, Math.max(3, r * 0.08), c); break;
    case 'meal': rr(g, -0.8 * r, -0.4 * r, 1.6 * r, 0.8 * r, 0.1 * r); g.stroke(); rr(g, -0.65 * r, -0.25 * r, 0.6 * r, 0.5 * r, 0.06 * r); g.stroke(); circle(g, 0.35 * r, 0, 0.22 * r, c); break;
    case 'check': L([[-0.5, 0], [-0.15, 0.4], [0.55, -0.45]]); break;
    case 'cross': L([[-0.45, -0.45], [0.45, 0.45]]); L([[0.45, -0.45], [-0.45, 0.45]]); break;
    case 'tire': ring(g, 0, 0, 0.8 * r, 0.3 * r, c); circle(g, 0, 0, 0.2 * r, c); break;
    case 'gauge': g.beginPath(); g.arc(0, 0.2 * r, 0.8 * r, Math.PI, 0); g.stroke(); L([[0, 0.2], [0.45, -0.35]]); break;
    case 'ship': poly(g, [[-0.9 * r, 0.1 * r], [0.9 * r, 0.1 * r], [0.6 * r, 0.5 * r], [-0.6 * r, 0.5 * r]], c); L([[0, 0.1], [0, -0.9]]); poly(g, [[0.05 * r, -0.85 * r], [0.7 * r, 0], [0.05 * r, 0]], c); poly(g, [[-0.05 * r, -0.7 * r], [-0.6 * r, 0], [-0.05 * r, 0]], c); break;
    case 'wind': for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-0.8 * r, (-0.4 + i * 0.4) * r); g.lineTo(0.3 * r, (-0.4 + i * 0.4) * r); g.arc(0.3 * r, (-0.55 + i * 0.4) * r, 0.15 * r, Math.PI / 2, -Math.PI / 2, true); g.stroke(); } break;
    case 'seat': rr(g, -0.5 * r, -0.9 * r, 0.35 * r, 1.4 * r, 0.12 * r); g.fill(); rr(g, -0.5 * r, 0.25 * r, r, 0.3 * r, 0.1 * r); g.fill(); break;
    case 'bulb': circle(g, 0, -0.2 * r, 0.55 * r, c); rr(g, -0.25 * r, 0.35 * r, 0.5 * r, 0.35 * r, 0.08 * r); g.fill(); break;
    case 'lock': rr(g, -0.55 * r, -0.1 * r, 1.1 * r, 0.85 * r, 0.12 * r); g.fill(); g.beginPath(); g.arc(0, -0.1 * r, 0.35 * r, Math.PI, 0); g.stroke(); break;
    case 'globe': ring(g, 0, 0, 0.8 * r, Math.max(3, r * 0.08), c); g.beginPath(); g.ellipse(0, 0, 0.35 * r, 0.8 * r, 0, 0, 7); g.stroke(); L([[-0.8, 0], [0.8, 0]]); break;
    default: circle(g, 0, 0, 0.5 * r, c);
  }
  g.restore();
}

// ---------------- overlays ----------------
function overlays(g, t, info, list = []) {
  for (const o of list) {
    const a0 = at(o.at, info, 0.3), a1 = o.until != null ? at(o.until, info, info.dur) : info.dur + 1;
    const out = 1 - prog(t, a1 - 0.25, a1), pin = ease.out(prog(t, a0, a0 + 0.35)), A = Math.min(pin, out);
    if (A <= 0 && o.k !== 'flash') continue;
    const c = col(o.color), x = X(o.x ?? 0.5), y = Y(o.y ?? 0.15);
    switch (o.k) {
      case 'label': { const p = ease.outBack(prog(t, a0, a0 + 0.35)); g.save(); g.translate(x, y); g.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p); lbl(g, o.text, 0, 0, { size: o.size || 56, color: c, a: A, glow: 14, font: o.font === 'title' ? FONTS.title : FONTS.ui, align: o.align }); g.restore(); if (o.sub) lbl(g, o.sub, x, y + (o.size || 56) * 0.9, { size: (o.size || 56) * 0.55, color: col('text'), a: A, align: o.align }); break; }
      case 'readout': UI.readout(g, { label: o.label, value: o.value, x, y, align: o.align || 'center', color: c, size: o.size || 54, a: A }); break;
      case 'counter': { const v = lerp(o.from_ ?? o.from ?? 0, o.to, ease.out(prog(t, a0, a0 + (o.over ?? 1.2)))); const s = (o.prefix || '') + (o.dec ? v.toFixed(o.dec) : o.plain ? String(Math.round(v)) : Math.round(v).toLocaleString('en-US')) + (o.suffix || ''); text(g, s, x, y, { size: o.size || 120, color: c, font: FONTS.ui, weight: 900, alpha: A, glow: 18, glowColor: alpha(c, 0.5) }); if (o.label) lbl(g, o.label, x, y + (o.size || 120) * 0.7, { size: (o.size || 120) * 0.32, a: A }); break; }
      case 'badge': UI.badge(g, { str: o.text, a: A, size: o.size || 46, color: c, x: o.x != null ? x : undefined, y: o.y != null ? y : undefined }); break;
      case 'bigLine': UI.bigLine(g, Math.max(0, t - a0 + 0.01), { str: o.text, dur: (a1 > info.dur ? info.dur - a0 + 0.5 : a1 - a0), y, size: o.size || 84, color: c }); break;
      case 'title': UI.titleCard(g, Math.max(0, t - a0), { lines: o.lines, sub: o.sub, dur: info.dur - a0 + 0.3, y }); break;
      case 'callout': UI.callout(g, t, { at: [X(o.from[0]), Y(o.from[1])], to: [X(o.to[0]), Y(o.to[1])], str: o.text, start: a0, color: c }); break;
      case 'dim': UI.dimension(g, t, { x1: X(o.p1[0]), y1: Y(o.p1[1]), x2: X(o.p2[0]), y2: Y(o.p2[1]), str: o.text, start: a0, color: c }); break;
      case 'check': (o.items || []).forEach(([w, s], i) => { const ti = at(w, info, 0.4 + i * 0.6), p = ease.outBack(prog(t, ti - 0.1, ti + 0.25)); if (p <= 0) return; const yy = y + i * (o.gap || 64); g.save(); g.globalAlpha *= clamp(p) * out; rr(g, x - 30, yy - 24, 48, 48, 10); g.fillStyle = alpha(S().ui.card, 0.9); g.fill(); icon(g, 'check', x - 6, yy, 22, c); lbl(g, s, x + 40, yy, { size: o.size || 40, align: 'left', color: col('cream') }); g.restore(); }); break;
      case 'qmark': { const p = ease.outBack(prog(t, a0, a0 + 0.4)); if (p > 0) text(g, o.text || '?', x, y, { size: (o.size || 220) * p, color: c, glow: 30, glowColor: alpha(c, 0.7), alpha: out }); break; }
      case 'timer': { const secs = Math.max(0, (o.from_ ?? o.from ?? 1500) - (o.rate ?? 60) * Math.max(0, t - a0)), mm = Math.floor(secs / 60), ss = Math.floor(secs % 60); rr(g, x - 190, y - 70, 380, 140, 30); g.fillStyle = alpha(S().ui.card, 0.92 * A); g.fill(); text(g, String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0'), x, y + 4, { size: o.size || 100, color: c, font: FONTS.ui, weight: 900, alpha: A, glow: 14, glowColor: alpha(c, 0.5) }); break; }
      case 'mark': { const p2 = ease.outBack(prog(t, a0, a0 + 0.35)); circle(g, x, y, 7, '#1a1008'); if (p2 > 0) { ring(g, x, y, 40 * p2, 4, c); glow(g, x, y, 90, c, 0.3 * clamp(p2)); } if (o.text) lbl(g, o.text, x, y - 70, { size: 36, color: c, a: A }); break; }
      case 'veil': veil(g, o.color || '#02080c', (o.a ?? 0.35) * A, o.op || 'source-over'); break;
      case 'flash': { const f = 1 - prog(t, a0, a0 + (o.over ?? 0.4)); if (t >= a0 && f > 0) veil(g, o.color || '#ffffff', 0.85 * f); break; }
      case 'icon': { const p = ease.outBack(prog(t, a0, a0 + 0.35)); g.save(); g.translate(x, y); g.scale(p, p); icon(g, o.name, 0, 0, o.r || 60, c); g.restore(); if (o.text) lbl(g, o.text, x, y + (o.r || 60) * 1.5, { size: o.size || 34, color: c, a: A }); break; }
    }
  }
}
function clockCard(g, t, s) {
  const p = ease.outBack(prog(t, 0.05, 0.4)), ui = S().ui; g.save(); g.translate(V(70, 60), V(60, 120)); g.scale(p, p);
  rr(g, 0, 0, 250, 74, 16); g.fillStyle = alpha(ui.card, 0.92); g.fill(); g.strokeStyle = ui.cardLine; g.lineWidth = 2; g.stroke(); icon(g, 'clock', 40, 37, 22, ui.accent);
  text(g, s, 150, 39, { size: 40, color: ui.cream, font: FONTS.ui, weight: 900, align: 'center' }); g.restore();
}

// ---------------- templates ----------------
const T = {};
const faceOf = (w) => WHO[w] || WHO.EXTRA;
const exprAt = (e, t) => Array.isArray(e) ? e.reduce((v, [tt, ex]) => (t >= tt ? ex : v), e[0][1]) : (e || 'neutral');
const bg = (g, t, kind, p) => {
  if (kind === 'cockpit') cockpitSet(g, t, { z: 1.5, x: 120, y: -150 }, { warn: p.warn });
  else if (kind === 'ramp') rampSet(g, t, { z: 1.6, x: 260, y: -160 }, { mood: p.mood || 'night' });
  else if (kind === 'sky') skySet(g, t, { z: 1.4 }, { mood: p.mood || 'dusk' });
  else if (kind === 'dark') backdrop(g, ['#03070b', '#071822']);
  else if (kind === 'lab') T.lab(g, t, { shot: { start: 0 }, dur: 1 }, { ...p, figs: [] }, { z: 1.5, x: -200, y: -120 });
  else if (kind === 'sea') T.sea(g, t, { shot: { start: 0 }, dur: 1 }, { mood: p.seaMood || 'dusk' }, { z: 1.3, x: 0, y: 0 });
  else cabinSet(g, t, { z: 1.7, x: 200, y: -160 }, { outside: p.outside || 'dusk' });
};
T.ramp = (g, t, info, p, cam) => {
  const R = (v, fb) => (typeof v === 'string' ? at(v, info, fb) : v);
  if (!p._res) { p._res = { ...p, veh: (p.veh || []).map((v) => ({ ...v, at: R(v.at, 0), sprayAt: R(v.sprayAt, 0.5), lift: v.lift && v.lift.map((x) => R(x, 0)) })), figs: (p.figs || []).map((f) => ({ ...f, a: R(f.a, 0), b: R(f.b, 3) })), spool: p.spool && p.spool.map((x) => R(x, 0)), plane: p.plane && { ...p.plane, a: R(p.plane.a, 0), b: R(p.plane.b, 3) } }; }
  rampSet(g, t, cam, p._res); FX.dust(g, t, { count: 20, color: '#e8fbff', a: 0.15 }); };
T.sky = (g, t, info, p, cam) => {
  const { DY, M } = skySet(g, t, cam, { mood: p.mood || 'dusk', everest: p.everest, deckY: p.deckY != null ? Y(p.deckY) : undefined, sunX: p.sunX, sunY: p.sunY, stars: p.stars });
  if (p.dots) { const r = rng(3); for (let i = 0; i < p.dots; i++) { const x = ((r() * E.W * 1.4 - t * (p.dotSpeed ?? 300)) % (E.W * 1.4) + E.W * 1.4) % (E.W * 1.4) - 100; circle(g, x, r() * E.H, 3, alpha(M.rim, 0.4)); } }
  const pl = p.plane; if (pl) { const k = ease.inOut(clamp(t / info.dur)), [sx, sy] = pl.shake ? shake(t, pl.shake, 14) : [0, 0];
    layer(g, cam, pl.depth ?? 1, (g) => airliner(g, X(lerp(pl.x ?? 0.4, pl.x1 ?? pl.x ?? 0.4, k)) + sx, Y(lerp(pl.y ?? 0.4, pl.y1 ?? pl.y ?? 0.4, k)) + sy + Math.sin(t * 1.3) * (pl.bob ?? 5), pl.s ?? 0.5, { t, body: mix(M.wall, M.ambient, 0.5), rim: M.rim, win: M.practical, pitch: pl.pitch ?? 0, contrail: pl.contrail ?? 0, facing: pl.facing ?? 1 })); }
  if (p.birds) { const r = rng(5); for (let i = 0; i < p.birds; i++) { const bx = ((r() * E.W * 1.5 - t * (120 + r() * 80)) % (E.W * 1.5) + E.W * 1.5) % (E.W * 1.5) - 100, by = Y(p.birdY ?? 0.5) + (r() - 0.5) * Y(p.birdSpread ?? 0.3), sz = (p.birdSize ?? 14) * (0.6 + r()), fl = Math.sin(t * 10 + i) * 0.6; seg(g, [[bx - sz, by - sz * fl], [bx, by], [bx + sz, by - sz * fl]], Math.max(2, sz * 0.25), '#0b141c'); } }
  if (p.strike != null && pl) { const ts = at(p.strike, info, 0.5), k = t - ts; if (k > 0 && k < 0.5) { const k2 = ease.inOut(clamp(t / info.dur)), px = X(lerp(pl.x ?? 0.4, pl.x1 ?? pl.x ?? 0.4, k2)), py = Y(lerp(pl.y ?? 0.4, pl.y1 ?? pl.y ?? 0.4, k2)), s2 = pl.s ?? 0.5; veil(g, '#e8f0ff', 0.6 * (1 - k * 2)); FX.lightning(g, { x1: px + 400 * s2, y1: -50, x2: px + 460 * s2, y2: py, seed: 7, w: 5 }); glow(g, px, py, 500 * s2, '#dfe8ff', 0.8 * (1 - k * 2)); } }
  if (p.storm) { if (((t * 1.7) % 1) < 0.1) { veil(g, '#dfe8ff', 0.2); FX.lightning(g, { x1: X(0.75), y1: 0, x2: X(0.68), y2: Y(0.8), seed: Math.floor(t * 1.7) + 3 }); } FX.rain(g, t, { count: p.storm === 'heavy' ? 260 : 120 }); }
  if (p.near !== false) nearClouds(g, t, cam, M);
  if (p.speed) FX.speedLines(g, t, { count: 40, a: 0.12 });
};
T.cabin = (g, t, info, p, cam) => {
  const r = cabinSet(g, t, cam, { outside: p.outside || 'dusk', mood: p.mood }); const { GY, M, OM } = r, s = p.s ?? 1.25, rim = { color: OM.rim, dir: [0.2, -1], w: 4 };
  layer(g, cam, 1, (g) => (p.rows || [-2, -1, 0, 1, 2]).forEach((k, i) => { const x = winX(k) + V(10, 0); seat(g, x, GY, s, shade(M.wall, -0.55)); if (p.empty) return;
    const who = k === 0 && p.pax !== false ? 'PAX' : (k % 2 ? 'EXTRA2' : 'EXTRA'); drawFigure(g, { x, y: GY, s, facing: 1, outfit: WHO[who], pose: breathe(POSES[k === 0 ? p.paxPose || 'sit' : 'sit'], t, 1, i), expr: k === 0 ? exprAt(p.paxExpr, t) : (p.extraExpr || 'neutral'), look: k === 0 ? p.paxLook : null, rim, shadow: false, blink: (t % (3 + i * 0.2)) > 2.9 + i * 0.2 }); }));
  if (p.stand) layer(g, cam, 1.15, (g) => p.stand.forEach((f, i) => drawFigure(g, { x: winX(f.k ?? 0) + V(f.dx ?? 90, 0), y: GY + V(70, 60), s: s * 1.05, facing: f.facing ?? -1, outfit: WHO[f.who] || WHO.EXTRA, pose: breathe(POSES[f.pose || 'stand'] || POSES.stand, t, 1, i + 9), expr: exprAt(f.expr, t), prop: f.prop, look: f.look, rim })));
  if (p.fg !== false) blurLayer(g, 12, (g) => { for (const k of [-2, 0, 2]) seat(g, winX(k) + 120, E.H + V(380, 300), V(2.6, 2.4), shade(M.dark, -0.4)); }, cam, 1.7);
  FX.dust(g, t, { count: 24, color: '#dfe8ff', a: 0.2 });
};
T.cockpit = (g, t, info, p, cam) => {
  const r = cockpitSet(g, t, cam, { warn: p.warn, outside: p.outside || 'golden', mood: p.mood }); const { GY, M, OM } = r, s = p.s ?? V(1.5, 1.6), x = pilotX();
  const talk = p.talk ? talkAmount(info.globalT, info.shot.start + at(p.talk[0], info, 0), info.shot.start + at(p.talk[1], info, 2)) : 0;
  layer(g, cam, 1, (g) => { pilotSeat(g, x, GY, s, M); drawFigure(g, { x, y: GY, s, facing: 1, outfit: WHO.PILOT, pose: breathe(p.pose ? { ...POSES.sit, ...p.pose } : POSES.sit, t), expr: exprAt(p.expr || 'neutral', t), talk, look: p.look || [1, -0.1], rim: { color: p.warn ? WARN : OM.rim, dir: [1, -0.4], w: 4 }, shadow: false, blink: (t % 3.4) > 3.3 }); });
  FX.dust(g, t, { count: 24, color: '#e8fbff', a: 0.18 });
};
T.face = (g, t, info, p) => {
  const [sx, sy] = p.shake ? shake(t, p.shake, 16) : [0, 0]; g.save(); g.translate(sx, sy);
  blurLayer(g, 14, (g) => bg(g, t, p.bg || 'cabin', p)); veil(g, '#03080c', 0.35); const M = mood(p.rimMood || 'dusk');
  if (p.glow) glow(g, X(p.glow[0]), Y(p.glow[1]), 700, col(p.glow[2] || 'accent'), 0.25 + 0.08 * Math.sin(t * 5));
  bigFace(g, E.W / 2 + V(p.dx ?? 140, 0), E.H * V(0.62, 0.47), V(310, 330) * (1 + 0.03 * t), { outfit: faceOf(p.who || 'PAX'), expr: exprAt(p.expr, t), look: p.look || [0, 0], rimColor: p.rim === 'warn' ? WARN : M.rim, rimSide: p.side ?? -1, blink: (t % 2.7) > 2.6, tilt: p.tilt, talk: p.talk ? talkAmount(info.globalT, info.shot.start + at(p.talk[0], info, 0), info.shot.start + at(p.talk[1], info, 2)) : 0 });
  g.restore();
};
T.card = (g, t, info, p, cam) => { if (p.bg && p.bg.startsWith('sky')) { skySet(g, t, cam, { mood: p.bg.split(':')[1] || 'dusk', sunX: 0, sunY: 60 }); veil(g, '#020a10', 0.35); } else { backdrop(g, ['#03070b', '#071822']); glow(g, E.W / 2, E.H * 0.45, E.W * 0.7, S().ui.accent, 0.08); FX.dust(g, t, { count: 20, color: '#e8fbff', a: 0.2 }); } };
// blueprint: p.items = [{k:'text'|'icon'|'arrow'|'plane'|'bar'|'gauge'|'line'|'ring'|'x'|'box'|'dots'|'dash'|'path', ...}]
T.bp = (g, t, info, p) => {
  UI.blueprint(g); const c0 = UI.bpStroke();
  for (const it of p.items || []) {
    const a0 = at(it.at, info, 0), A = ease.out(prog(t, a0, a0 + 0.4)), c = it.color ? col(it.color) : c0; if (A <= 0) continue;
    const x = X(it.x ?? 0.5), y = Y(it.y ?? 0.5); g.save(); g.globalAlpha *= A;
    switch (it.k) {
      case 'text': lbl(g, it.s, x, y, { size: it.size || 44, color: c, align: it.align, glow: it.glow ? 12 : 0, font: it.font === 'title' ? FONTS.title : FONTS.ui }); break;
      case 'icon': { const pp = ease.outBack(prog(t, a0, a0 + 0.35)); g.save(); g.translate(x, y); g.scale(pp, pp); if (it.ring !== false) ring(g, 0, 0, (it.r || 60) * 1.45, 4, alpha(c, 0.6)); icon(g, it.name, 0, 0, it.r || 60, c); g.restore(); if (it.label) lbl(g, it.label, x, y + (it.r || 60) * 1.45 + 40, { size: it.size || 34, color: c }); break; }
      case 'arrow': arrow(g, X(it.x1), Y(it.y1), X(it.x2), Y(it.y2), it.w || 8, c, ease.out(prog(t, a0, a0 + (it.over ?? 0.5)))); break;
      case 'line': { if (it.dashed) g.setLineDash([14, 12]); seg(g, it.pts.map(([a, b]) => [X(a), Y(b)]), it.w || 3, c); g.setLineDash([]); break; }
      case 'plane': { const k = ease.inOut(prog(t, a0, a0 + (it.over ?? info.dur))), [sx, sy] = it.wobble ? [0, Math.sin(t * 9) * it.wobble] : [0, 0]; airliner(g, X(lerp(it.x, it.x1 ?? it.x, k)) + sx, Y(lerp(it.y, it.y1 ?? it.y, k)) + sy, it.s ?? 0.35, { t, body: '#0f2a3a', rim: c0, win: S().ui.gold, lights: false, pitch: it.pitch ?? 0, facing: it.facing ?? 1 }); break; }
      case 'picon': { const k = ease.inOut(prog(t, a0, a0 + (it.over ?? 2))); planeIcon(g, X(lerp(it.x, it.x1 ?? it.x, k)), Y(lerp(it.y, it.y1 ?? it.y, k)), it.s ?? 1.2, c, it.rot ?? 0); break; }
      case 'bar': { const w = X(it.w ?? 0.6), h = it.h ?? 56, f = lerp(it.f0 ?? 0, it.f ?? 1, ease.out(prog(t, a0, a0 + (it.over ?? 0.7)))); rr(g, x, y - h / 2, w, h, h / 2); g.fillStyle = alpha(c, 0.14); g.fill(); rr(g, x, y - h / 2, Math.max(h, w * f), h, h / 2); g.fillStyle = c; g.fill(); if (it.label) lbl(g, it.label, x, y - h, { size: it.size || 38, color: c, align: 'left' }); if (it.value) lbl(g, it.value, x + w, y - h, { size: it.size || 38, color: c, align: 'right' }); break; }
      case 'gauge': { const R = it.r || 160, a00 = Math.PI * 0.8, a11 = Math.PI * 2.2; g.strokeStyle = alpha(c, 0.5); g.lineWidth = 6; g.beginPath(); g.arc(x, y, R, a00, a11); g.stroke(); for (let i = 0; i <= 10; i++) { const a = lerp(a00, a11, i / 10); seg(g, [[x + Math.cos(a) * R * 0.82, y + Math.sin(a) * R * 0.82], [x + Math.cos(a) * R * 0.95, y + Math.sin(a) * R * 0.95]], 3, c); }
        const v = it.wild && t > at(it.wild, info, 1) ? 0.5 + Math.sin(t * 7) * 0.35 + Math.sin(t * 17) * 0.1 : lerp(it.v0 ?? 0.2, it.v ?? 0.7, ease.inOut(prog(t, a0, a0 + (it.over ?? 1.2)))), an = lerp(a00, a11, clamp(v)); seg(g, [[x, y], [x + Math.cos(an) * R * 0.78, y + Math.sin(an) * R * 0.78]], 7, it.needle ? col(it.needle) : S().ui.gold); circle(g, x, y, 14, c); if (it.label) lbl(g, it.label, x, y + R * 0.5, { size: 30, color: c }); break; }
      case 'ring': ring(g, x, y, it.r || 80, it.w || 4, c); break;
      case 'x': { const pp = ease.outBack(prog(t, a0, a0 + 0.3)); g.save(); g.translate(x, y); g.scale(pp, pp); icon(g, 'cross', 0, 0, it.r || 60, it.color ? c : WARN); g.restore(); break; }
      case 'tick': { const pp = ease.outBack(prog(t, a0, a0 + 0.3)); g.save(); g.translate(x, y); g.scale(pp, pp); icon(g, 'check', 0, 0, it.r || 60, it.color ? c : S().ui.good); g.restore(); break; }
      case 'box': { rr(g, x, y, X(it.w), Y(it.h), 16); g.strokeStyle = c; g.lineWidth = 4; g.stroke(); if (it.fill) { g.fillStyle = alpha(c, it.fill); g.fill(); } if (it.label) lbl(g, it.label, x + X(it.w) / 2, y + Y(it.h) / 2, { size: it.size || 38, color: it.labelColor ? col(it.labelColor) : c }); break; }
      case 'dots': { const r = rng(it.seed || 2); for (let i = 0; i < (it.n || 60); i++) { const px = X(it.x) + ((r() * X(it.w) - t * (it.speed || 0)) % X(it.w) + X(it.w)) % X(it.w), py = Y(it.y) + r() * Y(it.h) + Math.sin(t * 2 + i) * 6; circle(g, px, py, it.size || 5, alpha(c, 0.7)); } break; }
      case 'path': { const k = ease.inOut(prog(t, a0, a0 + (it.over ?? 2))), pts = it.pts.map(([a, b]) => [X(a), Y(b)]); g.save(); if (it.dashed) g.setLineDash([16, 12]); g.strokeStyle = c; g.lineWidth = it.w || 5; g.beginPath(); const n = pts.length - 1, f = k * n, m = Math.min(n - 1, Math.floor(f)), u = f - m; g.moveTo(...pts[0]); for (let i = 1; i <= m; i++) g.lineTo(...pts[i]); const hd = [lerp(pts[m][0], pts[m + 1][0], u), lerp(pts[m][1], pts[m + 1][1], u)]; g.lineTo(...hd); g.stroke(); g.restore(); if (it.head) { const nx = pts[Math.min(n, m + 1)]; planeIcon(g, hd[0], hd[1], it.head, c, Math.atan2(nx[1] - pts[m][1], nx[0] - pts[m][0])); } break; }
      case 'dominoes': { const n = it.labels.length, gap = X(it.w ?? 0.7) / n; it.labels.forEach((lb, i) => { const ti = a0 + i * (it.step ?? 0.45), f = ease.in(prog(t, ti, ti + 0.35)) * (i === n - 1 && it.last === false ? 0 : 1), bx = x - X(it.w ?? 0.7) / 2 + i * gap + gap / 2, by = y;
          g.save(); g.translate(bx + 30, by); g.rotate(f * 1.2); rr(g, -60, -220, 60, 220, 10); g.fillStyle = i === 0 ? WARN : alpha(c, 0.25); g.fill(); g.strokeStyle = i === 0 ? WARN : c; g.lineWidth = 3; g.stroke(); g.restore(); lbl(g, lb, bx, by + 50, { size: 30, color: i === 0 ? WARN : c }); }); break; }
      case 'airfoil': { const W2 = X(it.w ?? 0.4), ice = it.ice != null ? ease.out(prog(t, at(it.ice, info, 1), at(it.ice, info, 1) + 1)) : 0; g.save(); g.translate(x, y); g.rotate(0.1);
          g.beginPath(); g.moveTo(-W2 / 2, 0); g.bezierCurveTo(-W2 / 2, -70, -W2 * 0.1, -90, W2 / 2, 6); g.bezierCurveTo(W2 * 0.1, 30, -W2 / 2, 40, -W2 / 2, 0); g.fillStyle = alpha(c, 0.15); g.fill(); g.strokeStyle = c; g.lineWidth = 4; g.stroke();
          if (ice > 0) { const r = rng(4); for (let i = 0; i < 26; i++) { const u = i / 25, xx = lerp(-W2 / 2, W2 * 0.1, u), yy = -55 * Math.sin(u * Math.PI * 0.9) - 22; poly(g, [[xx, yy], [xx + 6 + r() * 10, yy - (8 + r() * 18) * ice], [xx + 14, yy]], alpha('#e8fbff', 0.9)); } } g.restore();
          for (let j = -4; j <= 4; j++) { if (!j) continue; const y0 = y + j * 44; g.strokeStyle = alpha(ice > 0.5 && j < 0 ? WARN : c, 0.6); g.lineWidth = 3; g.setLineDash([24, 16]); g.lineDashOffset = -t * 300; g.beginPath(); for (let xx = x - X(0.45); xx <= x + X(0.45); xx += 16) { const d = (xx - x) / (W2 * 0.7), bump = j < 0 ? -Math.exp(-d * d) * 36 : Math.exp(-d * d) * 14, wob = ice > 0.5 && j < 0 && xx > x ? Math.sin(xx / 18 + t * 9) * 16 * ice : 0; xx === x - X(0.45) ? g.moveTo(xx, y0 + bump + wob) : g.lineTo(xx, y0 + bump + wob); } g.stroke(); g.setLineDash([]); }
          const L = 260 * (1 - 0.55 * ice); arrow(g, x, y - 80, x, y - 80 - L, 12, S().ui.gold, A); lbl(g, 'LIFT', x + 60, y - 80 - L, { size: 40, color: S().ui.gold, align: 'left' }); break; }
      case 'recorder': { const m0 = it.moveAt != null ? at(it.moveAt, info, a0) : a0, k = ease.inOut(prog(t, m0, m0 + (it.over ?? 1))); recorder(g, X(lerp(it.x, it.x1 ?? it.x, k)), Y(lerp(it.y, it.y1 ?? it.y, k)), it.s ?? 1, { label: it.label, burnt: it.burnt || 0, ping: it.ping ? 0.5 + 0.5 * Math.sin(t * 6) : 0, rot: it.rot || 0 }); if (it.tag) lbl(g, it.tag, X(lerp(it.x, it.x1 ?? it.x, k)), Y(lerp(it.y, it.y1 ?? it.y, k)) + 130 * (it.s ?? 1), { size: it.size || 40, color: it.tagColor ? col(it.tagColor) : S().ui.gold }); break; }
      case 'ticker': { const rows = it.rows || 8, r = rng(it.seed || 3), names = it.names || ['SPEED', 'ALT', 'PITCH', 'ROLL', 'ENG1', 'ENG2', 'FLAPS', 'HDG']; for (let i = 0; i < rows; i++) { const yy = y + i * 46 - ((t * 60) % 46); const vals = names.map((n, j) => { const v = Math.abs(Math.sin(i * 1.7 + j * 2.3 + Math.floor(t * 4 + i))) * (j < 2 ? 900 : 99); return n + ' ' + v.toFixed(j === 2 || j === 3 ? 1 : 0); }); lbl(g, vals.join('   '), x, yy, { size: 26, color: alpha(c, 1 - Math.abs(i - rows / 2) / rows), spacing: 1 }); } break; }
      case 'paper': { const p2 = ease.out(prog(t, a0, a0 + 0.7)); newspaper(g, x, y, X(it.w ?? 0.35) * (0.5 + 0.5 * p2), Y(it.h ?? 0.75) * (0.5 + 0.5 * p2), { head: it.head, sub: it.sub, rot: (1 - p2) * 4 + (it.rot ?? -0.04), a: clamp(p2 * 2) }); break; }
      case 'mow': { const x0 = X(it.x ?? 0.1), y0 = Y(it.y ?? 0.15), w2 = X(it.w ?? 0.8), h2 = Y(it.h ?? 0.7), n = it.n || 10, sw = w2 / n, prog2 = clamp((t - a0) / (it.over ?? 8)) * n, r = rng(3);
          rr(g, x0, y0, w2, h2, 10); g.strokeStyle = alpha(c, 0.5); g.lineWidth = 3; g.stroke();
          for (let i = 0; i < n; i++) { const f = clamp(prog2 - i); if (f <= 0) break; const up = i % 2, sx = x0 + i * sw, hh = h2 * f; g.save(); g.beginPath(); g.rect(sx, up ? y0 + h2 - hh : y0, sw, hh); g.clip(); for (let k2 = 0; k2 < 40; k2++) { const yy = y0 + (k2 / 40) * h2; g.fillStyle = alpha(c, 0.15 + 0.25 * Math.abs(Math.sin(i * 1.3 + k2 * 0.7))); g.fillRect(sx, yy, sw, h2 / 40 + 1); } g.restore(); if (f < 1) planeIcon(g, sx + sw / 2, up ? y0 + h2 - hh : y0 + hh, 0.8, S().ui.gold, up ? -Math.PI / 2 : Math.PI / 2); }
          if (it.found != null && t > at(it.found, info, 3)) { const fx = x0 + w2 * 0.63, fy = y0 + h2 * 0.55, pp = ease.outBack(prog(t, at(it.found, info, 3), at(it.found, info, 3) + 0.4)); const r3 = rng(7); for (let i = 0; i < 18; i++) circle(g, fx + (r3() - 0.5) * 120, fy + (r3() - 0.5) * 80, 4, '#ff8a1f'); ring(g, fx, fy, 110 * pp, 5, WARN); } break; }
      case 'binary': { const rows = it.rows || 8, r = rng(it.seed || 5); for (let i = 0; i < rows; i++) { let str = ''; for (let j = 0; j < (it.cols || 48); j++) str += (Math.sin(i * 7.1 + j * 3.3 + Math.floor(t * 6)) > 0 ? '1' : '0'); lbl(g, str, x, y + i * 42, { size: 28, color: alpha(c, 0.4 + 0.6 * ((i + Math.floor(t * 4)) % 3 === 0)), spacing: 4 }); } break; }
      case 'wave': { const w2 = X(it.w ?? 0.8), x0 = x - w2 / 2, gp = clamp((t - a0) / (it.over ?? 2)); g.strokeStyle = c; g.lineWidth = 4; g.beginPath(); for (let xx = 0; xx <= w2 * gp; xx += 6) { const amp = (it.amp ?? 60) * (0.3 + 0.7 * Math.abs(Math.sin(xx / 90 + t))) * Math.abs(Math.sin(xx / 13 + t * 8)); g.lineTo(x0 + xx, y + (xx % 12 < 6 ? -amp : amp)); } g.stroke(); break; }
      case 'oval': { g.save(); g.setLineDash([16, 12]); g.lineDashOffset = -t * 60; g.strokeStyle = c; g.lineWidth = 4; g.beginPath(); g.ellipse(x, y, X(it.rx), Y(it.ry), 0, 0, 7); g.stroke(); g.restore(); if (it.plane) { const a = t * (it.speed || 0.8); planeIcon(g, x + Math.cos(a) * X(it.rx), y + Math.sin(a) * Y(it.ry), 1, S().ui.gold, a + Math.PI / 2); } break; }
    }
    g.restore();
  }
};
// runway: takeoff roll / rotation / climb-out, or landing. p: {mood, roll:at, lift:at, land:at, x, s, night, snow, rain}
T.runway = (g, t, info, p, cam) => {
  const M = mood(p.mood || 'golden'), GY = E.H * 0.74, s = p.s ?? 0.75, nt = p.mood === 'night' || p.mood === 'storm';
  const tr = p.roll != null ? at(p.roll, info, 0) : 1e9, V = p.v ?? 2400, T0 = 2.5, dt = Math.max(0, t - tr), dist = (p.land != null ? V * 0.6 * t : 0) + (dt < T0 ? V * dt * dt / (2 * T0) : V * (T0 / 2 + dt - T0));
  let alt = 0, pitch = 0;
  if (p.lift != null) { const tl = at(p.lift, info, 1); pitch = 0.16 * ease.out(prog(t, tl, tl + 0.8)); alt = Y(p.climb ?? 0.45) * ease.in(prog(t, tl + 0.3, tl + (p.climbT ?? 4))); }
  if (p.land != null) { const td = at(p.land, info, 1); alt = Y(0.3) * (1 - ease.out(prog(t, 0, td))); pitch = 0.06 * (1 - prog(t, td, td + 0.6)); }
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); if (nt) FX.stars(g, t, { count: 100, area: [-E.W, -E.H, E.W * 3, E.H] }); else FX.sun(g, X(0.82), GY - 120, 55, '#fff4dc', M.key, 6); });
  layer(g, cam, 0.3, (g) => { const off = -(dist * 0.05) % (E.W * 2); FX.skyline(g, { x: off - E.W, y: GY - 10, w: E.W * 5, minH: 15, maxH: 70, color: shade(M.dark, 0.08), windowColor: alpha(M.practical, 0.4), lit: 0.2, seed: 9 }); });
  layer(g, cam, 0.7, (g) => { g.fillStyle = linGrad(g, 0, GY, 0, E.H * 1.3, [shade(M.grass || M.floor, -0.3), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3, E.H); rr(g, -E.W, GY + 20, E.W * 3, 90, 4); g.fillStyle = shade(M.dark, 0.1); g.fill();
    for (let i = 0; i < 30; i++) { const x = ((i * 220 - dist) % (220 * 30) + 220 * 30) % (220 * 30) - 400; rr(g, x, GY + 60, 110, 8, 3); g.fillStyle = alpha('#ffffff', 0.7); g.fill(); circle(g, x + 40, GY + 18, 5, M.practical); glow(g, x + 40, GY + 18, 26, M.practical, nt ? 0.7 : 0.35); circle(g, x + 90, GY + 116, 6, M.practical); glow(g, x + 90, GY + 116, 30, M.practical, nt ? 0.7 : 0.35); } });
  const x = X(p.x ?? 0.45), cy = GY + 30 - 150 * s - alt;
  layer(g, cam, 1, (g) => { if (alt < 30) for (const gx of [380, -40, -90]) { const wx = x + gx * s; seg(g, [[wx, cy + 40 * s], [wx, cy + 135 * s]], 7 * s, '#0b141c'); circle(g, wx, cy + 134 * s, 17 * s, '#0b141c'); }
    airliner(g, x, cy, s, { t, body: mix(M.wall, M.ambient, 0.5), rim: M.rim, win: M.practical, pitch, contrail: 0 });
    if (p.reverse != null && t > at(p.reverse, info, 1.5)) for (let j = 0; j < 6; j++) { const u = ((t * 3 + j / 6) % 1); seg(g, [[x + 120 * s - u * 120, cy + 50 * s - 40 * u], [x + 60 * s - u * 120, cy + 50 * s - 70 * u]], 3, alpha('#e8fbff', 0.5 * (1 - u))); }
    if (dt > 0.5 && alt < 40) FX.speedLines(g, t, { cx: x, cy, count: 30, a: 0.1 * clamp(dt / 2) }); });
  if (p.rain) FX.rain(g, t, { count: 160 }); if (p.snow) FX.snow(g, t, { count: 140, color: '#ffffff', speed: 80 });
};
// top-down apron: p.veh=[{label, x,y, from:[x,y], at, w,h, color}], p.flow (passengers out at 'at'), p.plane {x,y,s}
T.topdown = (g, t, info, p, cam) => {
  const M = mood('day'), cz = cam.z; g.save(); g.translate(E.W / 2, E.H / 2); g.scale(cz, cz); g.translate(-E.W / 2 + cam.x, -E.H / 2 + cam.y);
  g.fillStyle = '#3a454c'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); for (let i = -10; i < 30; i++) seg(g, [[i * 160, -E.H], [i * 160 - 400, E.H * 2]], 2, 'rgba(0,0,0,.08)');
  g.fillStyle = '#5a6a74'; g.fillRect(-E.W, -E.H, E.W * 3, E.H + Y(0.12)); g.fillStyle = alpha(M.practical, 0.5); g.fillRect(-E.W, Y(0.1), E.W * 3, 12);
  seg(g, [[X(0.05), Y(0.62)], [X(0.95), Y(0.62)]], 6, alpha('#e8c23a', 0.7));
  const pp = p.plane || {}, px = X(pp.x ?? 0.5), py = Y(pp.y ?? 0.6), ps = pp.s ?? 8.5;
  g.save(); g.shadowColor = 'rgba(0,0,0,.4)'; g.shadowBlur = 30; g.shadowOffsetY = 20; planeIcon(g, px, py, ps, '#c8d4dc', 0); g.restore(); planeIcon(g, px, py, ps * 0.97, '#e8eef0', 0);
  const door = [px + 20 * ps, py - 5 * ps]; poly(g, [[door[0] - 30, Y(0.12)], [door[0] + 30, Y(0.12)], [door[0] + 20, door[1]], [door[0] - 20, door[1]]], '#7a8a94');
  if (p.flow != null) { const a0 = at(p.flow, info, 0.2); for (let i = 0; i < 24; i++) { const u = ((t - a0) * 0.5 + i / 24) % 1; if (t < a0) break; circle(g, door[0] + Math.sin(i * 7) * 8, lerp(door[1], Y(0.04), u), 9, i % 5 === 2 ? '#d64a33' : '#1a2630'); } }
  for (const v of p.veh || []) { const a0 = at(v.at, info, 0.2), k = ease.out(prog(t, a0, a0 + 1.2)); if (k <= 0) continue; const x = X(lerp(v.from?.[0] ?? v.x, v.x, k)), y = Y(lerp(v.from?.[1] ?? 1.2, v.y, k)), w = v.w ?? 150, h = v.h ?? 80, c = col(v.color || 'gold');
    g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 16; g.shadowOffsetY = 10; rr(g, x - w / 2, y - h / 2, w, h, 14); g.fillStyle = c; g.fill(); g.restore(); rr(g, x - w / 2 + 8, y - h / 2 + 8, w * 0.3, h - 16, 8); g.fillStyle = 'rgba(0,0,0,.25)'; g.fill();
    if (((t + x) % 0.9) < 0.2) glow(g, x, y - h / 2, 30, '#ffb020', 0.9); text(g, v.label, x + w * 0.12, y, { size: 24, color: '#0b141c', font: FONTS.ui, weight: 900 });
    if (k >= 1 && v.done != null && t > at(v.done, info, 2)) { circle(g, x + w / 2, y - h / 2, 22, S().ui.good); icon(g, 'check', x + w / 2, y - h / 2, 14, '#0b141c'); } }
  g.restore();
};
// weather radar screen: p.cells=[{x,y,r,at}], p.route, p.reroute (at), p.grow
T.radar = (g, t, info, p) => {
  backdrop(g, ['#020608', '#04100c']); const cx = E.W / 2, cy = E.H * 0.92, R = E.H * 0.85, gr = '#3fdc6a';
  g.save(); g.beginPath(); g.arc(cx, cy, R, Math.PI, 0); g.closePath(); g.clip(); g.fillStyle = '#031208'; g.fillRect(0, 0, E.W, E.H);
  for (const c of p.cells || []) { const a0 = at(c.at, info, 0), k = ease.out(prog(t, a0, a0 + (c.over ?? 3))) * (p.growAll ? 1 : 1); if (k <= 0) continue; const x = X(c.x), y = Y(c.y), r = c.r * E.H * (0.4 + 0.6 * k);
    for (const [f, cc] of [[1, '#2fb84f'], [0.68, '#e8d23a'], [0.38, '#e8402e']]) { g.fillStyle = alpha(cc, 0.75); g.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, rr2 = r * f * (1 + 0.18 * Math.sin(a * 3 + c.x * 10 + t * 0.3)); i ? g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2 * 0.8) : g.moveTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2 * 0.8); } g.fill(); } }
  for (let i = 1; i <= 4; i++) { g.strokeStyle = alpha(gr, 0.35); g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, R * i / 4, Math.PI, 0); g.stroke(); }
  const sw = Math.PI + ((t * 0.9) % 1) * Math.PI; g.fillStyle = alpha(gr, 0.12); g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, sw - 0.35, sw); g.closePath(); g.fill(); seg(g, [[cx, cy], [cx + Math.cos(sw) * R, cy + Math.sin(sw) * R]], 3, alpha(gr, 0.8));
  g.setLineDash([16, 12]); seg(g, [[cx, cy - 40], [cx, cy - R]], 4, alpha('#e8fbff', p.reroute != null && t > at(p.reroute, info, 2) ? 0.25 : 0.8)); g.setLineDash([]);
  if (p.reroute != null) { const k = ease.inOut(prog(t, at(p.reroute, info, 2), at(p.reroute, info, 2) + 1.5)); if (k > 0) { g.strokeStyle = S().ui.accent; g.lineWidth = 6; g.setLineDash([18, 12]); g.beginPath(); g.moveTo(cx, cy - 40); g.bezierCurveTo(cx - E.W * 0.32 * k, cy - R * 0.35, cx - E.W * 0.32 * k, cy - R * 0.7, cx, cy - R); g.stroke(); g.setLineDash([]); } }
  g.restore(); planeIcon(g, cx, cy - 40, 1.6, '#e8fbff', -Math.PI / 2); g.strokeStyle = alpha(gr, 0.6); g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, R, Math.PI, 0); g.stroke();
  text(g, 'WX', X(0.06), Y(0.08), { size: 36, color: gr, font: FONTS.ui, weight: 900, align: 'left' });
};
// ocean surface: p {mood, debris, ship:{x}, planes:n, storm}
T.sea = (g, t, info, p, cam) => {
  const M = mood(p.mood || 'dusk'), WL = Y(p.wl ?? 0.55), nt = p.mood === 'night' || p.mood === 'storm';
  layer(g, cam, 0.1, (g) => { backdrop(g, M.sky); if (nt) FX.stars(g, t, { count: 80, area: [-E.W, -E.H, E.W * 3, WL + E.H] }); else FX.sun(g, X(0.75), WL - 80, 50, '#fff4dc', M.key, 6); if (p.storm) { FX.clouds(g, { y: WL - 500, h: 300, color: shade(M.dark, 0.2), a: 0.6, seed: 6 }); if (((t * 1.3) % 1) < 0.08) FX.lightning(g, { x1: X(0.7), y1: 0, x2: X(0.66), y2: WL, seed: Math.floor(t * 1.3) }); } });
  const wave = (x, k) => WL + k * 60 + Math.sin(x / 140 + t * 1.6 + k) * 10 + Math.sin(x / 47 - t * 2.2 + k) * 4;
  layer(g, cam, 0.5, (g) => { for (let k = 0; k < 5; k++) { g.fillStyle = shade(M.wall, -0.15 - k * 0.1); g.beginPath(); g.moveTo(-E.W, E.H * 2); for (let x = -E.W; x <= E.W * 2; x += 20) g.lineTo(x, wave(x, k)); g.lineTo(E.W * 2, E.H * 2); g.fill(); if (k === 0) { g.strokeStyle = alpha(M.rim, 0.4); g.lineWidth = 2; g.beginPath(); for (let x = -E.W; x <= E.W * 2; x += 20) x === -E.W ? g.moveTo(x, wave(x, 0)) : g.lineTo(x, wave(x, 0)); g.stroke(); } }
    if (p.debris) { const r = rng(9); for (let i = 0; i < p.debris; i++) { const x = r() * E.W, k = 1 + Math.floor(r() * 3), y = wave(x, k) - 6; g.save(); g.translate(x, y); g.rotate(Math.sin(t + i) * 0.2); rr(g, -20 - r() * 30, -8, 40 + r() * 60, 14, 4); g.fillStyle = r() > 0.8 ? '#ff7a1a' : '#c8d4dc'; g.fill(); g.restore(); } }
    if (p.ship) { const sx = X(p.ship.x ?? 0.6) + t * 10, sy = wave(sx, 1); poly(g, [[sx - 160, sy - 50], [sx + 160, sy - 50], [sx + 120, sy + 6], [sx - 130, sy + 6]], '#1a2630'); rr(g, sx - 60, sy - 110, 120, 60, 6); g.fillStyle = '#c8d4dc'; g.fill(); seg(g, [[sx + 140, sy - 50], [sx + 260, sy + 40]], 3, alpha('#e8fbff', 0.6)); }
    if (p.tow) { const sx = X(p.ship?.x ?? 0.6) + t * 10, sy = wave(sx, 1), hx = sx - 420, hy = E.H * 0.95; seg(g, [[sx - 150, sy - 10], [sx - 300, sy + 120], [hx, hy]], 3, alpha('#e8c23a', 0.8)); rr(g, hx - 50, hy - 14, 100, 28, 12); g.fillStyle = '#e8c23a'; g.fill(); FX.rings(g, hx, hy, t, { count: 3, r0: 20, r1: 260, speed: 0.8, color: '#9af2ff', a: 0.4 }); } });
  for (let i = 0; i < (p.planes || 0); i++) { const px = ((t * 120 + i * 700) % (E.W + 600)) - 300; airliner(g, px, Y(0.25 + i * 0.08), 0.18, { t, body: shade(M.wall, 0.1), rim: M.rim, win: M.practical }); }
  if (p.rain) FX.rain(g, t, { count: 160 });
};
// deep ocean: p {from, to (depth m), floor:bool, boxes:[{x,y,s,burnt}], auv:{x,x1,y,a,b, sonar}, rov:{x,y,lift:at}, debris}
T.deep = (g, t, info, p, cam) => {
  const k = ease.inOut(clamp(t / info.dur)), d = lerp(p.from ?? 0, p.to ?? p.from ?? 3900, k), dark = clamp(d / 1500);
  backdrop(g, [mix('#1e5a78', '#020608', dark), mix('#0c3a52', '#010305', dark), mix('#06202e', '#000203', dark)]);
  if (dark < 0.6) FX.godRays(g, X(0.5), -200, { count: 9, angle: Math.PI / 2, spread: 0.9, len: E.H * 1.4, a: 0.08 * (1 - dark), t, color: '#9ad8f0' });
  const r = rng(11); for (let i = 0; i < 90; i++) { const x = r() * E.W + Math.sin(t * 0.3 + i) * 10, y = ((r() * E.H - t * (10 + r() * 20)) % E.H + E.H) % E.H; circle(g, x, y, 1.5 + r() * 2, alpha('#cfe8f0', 0.35)); }
  const cz = cam.z; g.save(); g.translate(E.W / 2, E.H / 2); g.scale(cz, cz); g.translate(-E.W / 2 + cam.x, -E.H / 2 + cam.y);
  const lightOn = p.rov || p.auv || p.lamp; if (lightOn && dark > 0.5) { /* scene lit only by vehicle lights */ }
  if (p.floor) { const FY = Y(p.floorY ?? 0.78), AM = p.floorAmp ?? 1; g.fillStyle = linGrad(g, 0, FY - 40, 0, E.H, ['#1a2a2e', '#0a1214']); g.beginPath(); g.moveTo(-E.W, E.H * 2); for (let x = -E.W; x <= E.W * 2; x += 30) g.lineTo(x, FY + (Math.sin(x / 210) * 24 + Math.sin(x / 67) * 8) * AM - (AM > 1 ? Math.max(0, Math.sin(x / 380 + 1)) * 60 * AM : 0)); g.lineTo(E.W * 2, E.H * 2); g.fill();
    if (p.debris) { const r2 = rng(4); for (let i = 0; i < p.debris; i++) { const x = r2() * E.W, y = FY + 10 + r2() * 80; g.save(); g.translate(x, y); g.rotate(r2() * 3); rr(g, -30, -6, 60 + r2() * 60, 12, 3); g.fillStyle = '#3a4a50'; g.fill(); g.restore(); } } }
  if (p.lamp) for (const b of p.boxes || []) glow(g, X(b.x), Y(b.y), 320 * (b.s ?? 0.6) / 0.6, '#9ad8f0', 0.28);
  for (const b of p.boxes || []) if (b.ping) FX.rings(g, X(b.x) + 160 * (b.s ?? 0.6), Y(b.y) - 30 * (b.s ?? 0.6), t, { count: 4, r0: 20, r1: 420, speed: 0.6, color: '#9af2ff', a: 0.5, w: 3 });
  for (const b of p.boxes || []) { const lift = b.lift != null ? ease.inOut(prog(t, at(b.lift, info, 1), at(b.lift, info, 1) + 3)) : 0; recorder(g, X(b.x), Y(b.y) - lift * Y(0.5), b.s ?? 0.6, { burnt: b.burnt ?? 0.3, ping: b.ping ? 0.5 + 0.5 * Math.sin(t * 6) : 0, rot: b.rot ?? 0.15 }); }
  if (p.auv) { const a = p.auv, u = ease.inOut(prog(t, at(a.a, info, 0), at(a.b, info, info.dur))), x = X(lerp(a.x ?? -0.1, a.x1 ?? 1.1, u)), y = Y(a.y ?? 0.45);
    if (a.sonar !== false) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, y, 0, Y(0.8), ['rgba(120,240,255,.25)', 'rgba(120,240,255,0)']); g.beginPath(); g.moveTo(x, y + 20); g.lineTo(x - 260, Y(0.82)); g.lineTo(x + 260, Y(0.82)); g.closePath(); g.fill(); g.restore(); }
    rr(g, x - 140, y - 24, 280, 48, 24); g.fillStyle = '#e8c23a'; g.fill(); poly(g, [[x - 140, y], [x - 190, y - 34], [x - 190, y + 34]], '#c8a020'); seg(g, [[x - 60, y - 24], [x - 60, y - 50]], 6, '#c8a020'); glow(g, x + 140, y, 140, '#e8fbff', 0.4); }
  if (p.rov) { const o = p.rov, x = X(o.x ?? 0.5), y = Y(o.y ?? 0.35), la = o.lift != null ? ease.inOut(prog(t, at(o.lift, info, 1), at(o.lift, info, 1) + 3)) : 0, yy = y - la * Y(0.5);
    seg(g, [[x, yy - 60], [x, -100]], 4, '#e8c23a'); rr(g, x - 130, yy - 60, 260, 110, 14); g.fillStyle = '#e8eef0'; g.fill(); rr(g, x - 130, yy - 60, 260, 30, 12); g.fillStyle = '#e8c23a'; g.fill();
    for (const lx of [-90, 90]) { circle(g, x + lx, yy + 40, 14, '#fff8e0'); FX.lightCone(g, x + lx, yy + 40, { angle: Math.PI / 2 + lx / 600, spread: 0.6, len: 500, a: 0.22, color: '#fff4d0' }); }
    seg(g, [[x + 40, yy + 50], [x + 80, yy + 110], [x + 60, yy + 150]], 10, '#8a9aa4'); }
  g.restore();
  if (p.depth !== false) UI.readout(g, { label: 'DEPTH', value: Math.round(d).toLocaleString('en-US') + ' M', x: X(0.86), y: Y(0.9), align: 'center', size: 50, color: S().ui.accent });
};
// research lab (1950s): back wall, window with dusk city, chalkboard, bench. p {mood, figs:[{who,x,pose,facing,expr,prop}], bench, proto, recorder, board}
T.lab = (g, t, info, p, cam) => {
  const M = mood(p.mood || 'interiorWarm'), GY = E.H * 0.82, CX = E.W / 2, s = p.s ?? 1.5;
  layer(g, cam, 0.4, (g) => { g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(M.dark, -0.1), M.wall, shade(M.wall, -0.2)]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    FX.windowFrame(g, { x: CX + 180, y: GY - 640, w: 520, h: 360, cols: 3, rows: 2, frame: shade(M.wall, -0.5), bar: 10 }, (g, x, y, w, h) => { g.fillStyle = linGrad(g, 0, y, 0, y + h, mood('dusk').sky); g.fillRect(x, y, w, h); FX.skyline(g, { x, y: y + h, w, maxH: h * 0.45, color: shade(M.dark, -0.1), windowColor: alpha(M.practical, 0.7), seed: 3 }); });
    rr(g, CX - 760, GY - 620, 640, 330, 8); g.fillStyle = '#1e3228'; g.fill(); g.strokeStyle = '#5a4030'; g.lineWidth = 12; g.stroke();
    g.save(); g.strokeStyle = alpha('#e8eef0', 0.7); g.lineWidth = 3; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(CX - 720, GY - 570 + i * 55); for (let k = 0; k < 14; k++) g.lineTo(CX - 720 + k * 36, GY - 570 + i * 55 + Math.sin(k * 1.7 + i) * 8); g.stroke(); } if (p.board) { rr(g, CX - 560, GY - 540, 200, 110, 10); g.stroke(); g.font = '700 26px Fredoka'; g.fillStyle = '#e8eef0'; g.fillText(p.board, CX - 540, GY - 470); } g.restore();
    g.fillStyle = linGrad(g, 0, GY, 0, E.H * 1.3, [shade(M.floor, 0.1), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3, E.H); FX.pool(g, CX, GY + 20, 520, 70, M.key, 0.2);
    glow(g, CX + 440, GY - 460, 420, M.key, 0.15); });
  layer(g, cam, 0.9, (g) => { if (p.bench !== false) { rr(g, CX - 160, GY - 150, 640, 26, 6); g.fillStyle = '#4a3428'; g.fill(); seg(g, [[CX - 130, GY - 124], [CX - 130, GY]], 10, '#3a2820'); seg(g, [[CX + 450, GY - 124], [CX + 450, GY]], 10, '#3a2820');
      if (p.proto) { rr(g, CX + 40, GY - 250, 200, 100, 10); g.fillStyle = '#5a6a74'; g.fill(); for (const dx of [80, 180]) { circle(g, CX + dx, GY - 200, 32, '#2a3a44'); circle(g, CX + dx, GY - 200, 8, '#c8d4dc'); } seg(g, [[CX + 80, GY - 232], [CX + 180, GY - 232]], 2, '#c8d4dc'); }
      if (p.recorder) recorder(g, CX + 160, GY - 200, 0.55, { rot: 0 }); } });
  layer(g, cam, 1, (g) => (p.figs || []).forEach((f, i) => drawFigure(g, { x: X(f.x), y: GY + (f.dy ?? 0), s: f.s ?? s, facing: f.facing ?? 1, outfit: WHO[f.who] || WHO.EXTRA, pose: breathe(POSES[f.pose || 'stand'] || POSES.stand, t, 1, i + 3), expr: exprAt(f.expr, t), look: f.look, prop: f.prop, rim: { color: M.rim, dir: [0.8, -0.6] } })));
  FX.dust(g, t, { count: 30, color: '#ffe2bd', a: 0.25 });
};
// test lab: p {test: impact|pierce|crush|fire|deep|fluids, n, name, hit (at)}
T.testlab = (g, t, info, p, cam) => {
  const M = mood('interiorCool'), GY = Y(0.8), cx = X(0.5), cy = Y(0.56), th = at(p.hit, info, 1.2), after = t > th, k = clamp((t - th) / 0.5);
  const [sx, sy] = after && (p.test === 'impact' || p.test === 'pierce') ? shake(t, 14 * (1 - prog(t, th, th + 0.8)), 30) : [0, 0];
  g.save(); g.translate(sx, sy); const cz = cam.z; g.translate(E.W / 2, E.H / 2); g.scale(cz, cz); g.translate(-E.W / 2 + cam.x, -E.H / 2 + cam.y);
  backdrop(g, [shade(M.dark, -0.3), shade(M.wall, -0.25), shade(M.dark, -0.2)]); for (let i = -2; i < 12; i++) { rr(g, i * 220, Y(0.08), 200, GY - Y(0.1), 6); g.fillStyle = alpha('#ffffff', 0.025); g.fill(); }
  FX.lightCone(g, cx, -20, { len: E.H, spread: 0.6, a: 0.12, color: '#e8fbff' });
  g.fillStyle = linGrad(g, 0, GY, 0, E.H, ['#1a2830', '#0a1014']); g.fillRect(-E.W, GY, E.W * 3, E.H); for (let x = -40; x < E.W + 40; x += 80) poly(g, [[x, GY], [x + 40, GY], [x + 10, GY + 24], [x - 30, GY + 24]], alpha('#e8c23a', 0.45));
  rr(g, X(0.04), Y(0.06), 420, 80, 12); g.fillStyle = 'rgba(8,24,34,.92)'; g.fill(); g.strokeStyle = '#e8c23a'; g.lineWidth = 3; g.stroke(); text(g, p.plate || ('TEST ' + (p.n || 1) + ': ' + (p.name || '')), X(0.04) + 210, Y(0.06) + 42, { size: 40, color: '#e8c23a', font: FONTS.ui, weight: 900 });
  let bx = cx, by = cy, rot = 0, burnt = 0;
  if (p.test === 'impact') { const u = ease.in(prog(t, th - 0.6, th)); bx = lerp(X(-0.15), X(0.74), u); rr(g, X(0.8), Y(0.12), 90, GY - Y(0.12), 6); g.fillStyle = '#4a5a64'; g.fill(); for (let i = 0; i < 8; i++) seg(g, [[X(0.8), Y(0.15) + i * 80], [X(0.8) + 90, Y(0.2) + i * 80]], 3, alpha('#000', 0.3));
    if (!after) FX.speedLines(g, t, { cx: bx, cy, count: 30, a: 0.25 }); else { glow(g, X(0.78), cy, 300, '#ffffff', 0.6 * (1 - k)); FX.rings(g, X(0.78), cy, t - th, { count: 3, r0: 40, r1: 400, speed: 1.6, color: '#ffffff', a: 0.6 * (1 - k) }); } rot = after ? -0.08 : 0; }
  if (p.test === 'pierce') { const u = ease.in(prog(t, th - 0.7, th)), py = lerp(-Y(0.4), cy - 240, u); rr(g, cx - 26, py - 600, 52, 600, 8); g.fillStyle = '#9aa8b0'; g.fill(); poly(g, [[cx - 26, py], [cx + 26, py], [cx, py + 60]], '#c8d4dc'); rr(g, cx - 60, py - 640, 120, 60, 8); g.fillStyle = '#5a6a74'; g.fill(); if (after) FX.rings(g, cx, cy - 60, t - th, { count: 2, r0: 30, r1: 260, speed: 1.6, color: '#ffffff', a: 0.6 * (1 - k) }); }
  if (p.test === 'crush') { const u = ease.inOut(prog(t, 0.3, th)), gap = lerp(Y(0.42), 150, u); rr(g, cx - 380, cy - gap - 120, 760, 120, 10); g.fillStyle = '#5a6a74'; g.fill(); rr(g, cx - 380, cy + gap - 20, 760, 120, 10); g.fillStyle = '#5a6a74'; g.fill(); seg(g, [[cx, cy - gap - 120], [cx, -100]], 60, '#3a4a54'); for (const dx of [-250, 250]) { const ay = cy - gap - 170; poly(g, [[cx + dx, ay + 40], [cx + dx - 26, ay], [cx + dx + 26, ay]], '#e8c23a'); } }
  if (p.test === 'fire') { const f = ease.out(prog(t, th - 0.3, th + 0.6)); glow(g, cx, cy, 600, '#ff7a20', 0.5 * f); burnt = 0.6 * f;
    for (let i = 0; i < 26; i++) { const fx = cx - 340 + i * 27, h = (140 + Math.sin(t * 9 + i * 1.7) * 60 + Math.sin(t * 23 + i) * 30) * f, fy = cy + 120; g.fillStyle = i % 3 ? alpha('#ff8a1f', 0.85) : alpha('#ffd040', 0.9); g.beginPath(); g.moveTo(fx - 22, fy); g.quadraticCurveTo(fx - 18, fy - h * 0.6, fx + Math.sin(t * 7 + i) * 14, fy - h); g.quadraticCurveTo(fx + 18, fy - h * 0.6, fx + 22, fy); g.fill(); } }
  if (p.test === 'deep') { rr(g, cx - 380, Y(0.16), 760, GY - Y(0.16), 30); g.fillStyle = alpha('#1e5a78', 0.55); g.fill(); g.strokeStyle = '#c8d4dc'; g.lineWidth = 8; g.stroke(); rr(g, cx - 400, Y(0.12), 800, 60, 14); g.fillStyle = '#5a6a74'; g.fill(); const r = rng(5); for (let i = 0; i < 30; i++) circle(g, cx - 340 + r() * 680, GY - ((t * 60 + r() * 600) % (GY - Y(0.2))), 4 + r() * 6, alpha('#cfe8f0', 0.5)); }
  if (p.test === 'fluids') { const cols = ['#c8a020', '#c84a8a', '#e8eef0'], names = ['JET FUEL', 'HYDRAULIC FLUID', 'EXTINGUISHER FOAM'], ws = (p.words || []).map((w2, i) => at(w2, info, 1 + i * 1.5)); let cur = -1; ws.forEach((w2, i) => { if (t > w2) cur = i; });
    for (let i = 0; i < 3; i++) { const tx = X(0.2 + i * 0.3); rr(g, tx - 200, Y(0.5), 400, GY - Y(0.5), 20); g.fillStyle = alpha(cols[i], 0.5); g.fill(); g.strokeStyle = '#c8d4dc'; g.lineWidth = 5; g.stroke(); text(g, names[i], tx, GY + 60, { size: 32, color: cols[i], font: FONTS.ui, weight: 900 }); }
    bx = cur >= 0 ? X(0.2 + cur * 0.3) : X(0.2); by = cur >= 0 ? Y(0.68) + Math.sin(t * 2) * 10 : Y(0.32); }
  recorder(g, bx, by, p.test === 'fluids' ? 0.75 : 1.1, { rot, burnt });
  if (p.test === 'deep') { rr(g, cx - 380, Y(0.16), 760, GY - Y(0.16), 30); g.fillStyle = alpha('#3a8ab0', 0.25); g.fill(); }
  if (after && p.ok) { const pp = ease.outBack(prog(t, at(p.ok, info, th + 1), at(p.ok, info, th + 1) + 0.3)); if (pp > 0) { g.save(); g.translate(X(0.86), Y(0.2)); g.scale(pp, pp); circle(g, 0, 0, 70, S().ui.good); icon(g, 'check', 0, 0, 44, '#0b141c'); g.restore(); } }
  g.restore();
};
// inserts: close-up objects. p.obj = pitot | tire | window | meal | tail
T.insert = (g, t, info, p, cam) => {
  blurLayer(g, 14, (g) => bg(g, t, p.bg || 'ramp', p)); veil(g, '#03080c', 0.3); const M = mood(p.mood || 'night'), ui = S().ui;
  g.save(); const z = cam.z; g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2 + cam.x, -E.H / 2 + cam.y);
  if (p.obj === 'pitot') {
    const nx = E.W * 0.08, ny = E.H * 0.52; g.fillStyle = linGrad(g, 0, ny - 260, 0, ny + 260, [shade(M.wall, 0.35), mix(M.wall, M.ambient, 0.5), shade(M.wall, -0.4)]); g.beginPath(); g.moveTo(nx, ny - 260); g.quadraticCurveTo(E.W * 1.2, ny - 300, E.W * 1.3, ny); g.quadraticCurveTo(E.W * 1.2, ny + 300, nx, ny + 260); g.closePath(); g.fill();
    seg(g, [[nx + 40, ny - 250], [E.W, ny - 280]], 6, alpha(M.rim, 0.7));
    for (const [px, py] of [[E.W * 0.42, ny - 40], [E.W * 0.56, ny + 60]]) { rr(g, px - 20, py - 20, 40, 40, 8); g.fillStyle = shade(M.wall, -0.5); g.fill(); seg(g, [[px, py], [px - 150, py]], 16, '#c8d4dc'); circle(g, px - 152, py, 9, '#1a2a34');
      if (p.covers) { rr(g, px - 175, py - 16, 70, 32, 8); g.fillStyle = '#e03a2e'; g.fill(); const fl = (u) => Math.sin(t * 6 + u * 4) * 18 * u; g.fillStyle = '#e03a2e'; g.beginPath(); g.moveTo(px - 140, py + 14); for (let u = 0; u <= 1; u += 0.05) g.lineTo(px - 140 + fl(u) * 0.3 - u * 20, py + 14 + u * 320); for (let u = 1; u >= 0; u -= 0.05) g.lineTo(px - 104 + fl(u) * 0.3 - u * 20, py + 14 + u * 320); g.fill(); g.save(); g.translate(px - 128, py + 180); g.rotate(Math.PI / 2 - 0.05); g.font = '900 20px Nunito'; g.fillStyle = '#fff'; g.textAlign = 'center'; g.fillText('REMOVE BEFORE FLIGHT', 0, 7); g.restore(); }
      else if (p.flow) for (let i = 0; i < 5; i++) { const u = ((t * 1.4 + i / 5) % 1); seg(g, [[px - 600 + u * 400, py - 30 + i * 15], [px - 520 + u * 400, py - 30 + i * 15]], 3, alpha('#e8fbff', 0.6 * (1 - u))); } }
  } else if (p.obj === 'tire') {
    const cx = E.W * 0.45, cy = E.H * 0.56, R = 300; circle(g, cx, cy, R, '#0d161e'); ring(g, cx, cy, R - 10, 6, alpha(M.rim, 0.5)); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2 + t * 0.2; seg(g, [[cx + Math.cos(a) * (R - 40), cy + Math.sin(a) * (R - 40)], [cx + Math.cos(a) * (R - 5), cy + Math.sin(a) * (R - 5)]], 8, '#1a2630'); }
    circle(g, cx, cy, R * 0.5, '#5a6a74'); circle(g, cx, cy, R * 0.18, '#2a3a44'); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; circle(g, cx + Math.cos(a) * R * 0.32, cy + Math.sin(a) * R * 0.32, 10, '#2a3a44'); }
    seg(g, [[cx, cy - R], [cx, -200]], 60, '#2a3a44');
    if (p.n2) { const a = ease.out(prog(t, at(p.n2, info, 0.3), at(p.n2, info, 0.3) + 0.4)); g.save(); g.globalAlpha *= a; for (let i = 0; i < 20; i++) { const an = i * 2.4 + t * 0.6, rr2 = R * 0.6 + (i % 5) * 18; text(g, 'N₂', cx + Math.cos(an) * rr2 * 0.55, cy + Math.sin(an) * rr2 * 0.55, { size: 30, color: alpha(ui.accent, 0.8), font: FONTS.ui, weight: 900 }); } g.restore(); }
  } else if (p.obj === 'window') {
    const cx = E.W * 0.5, cy = E.H * 0.5, w = 520, h = 680, OM = mood(p.outside || 'golden'); veil(g, '#0c1820', 0.4);
    rr(g, cx - w / 2 - 50, cy - h / 2 - 50, w + 100, h + 100, w / 2); g.fillStyle = shade(M.wall, 0.25); g.fill();
    g.save(); rr(g, cx - w / 2, cy - h / 2, w, h, w / 2.1); g.clip(); outsideView(g, cx - w / 2, cy - h / 2, w, h, t, OM, { sunX: 0.4 }); g.restore();
    rr(g, cx - w / 2, cy - h / 2, w, h, w / 2.1); g.strokeStyle = alpha('#ffffff', 0.25); g.lineWidth = 8; g.stroke();
    const hx = cx, hy = cy + h / 2 - 70; circle(g, hx, hy, 7, '#0b141c'); if (p.hole != null) { const k = ease.outBack(prog(t, at(p.hole, info, 1), at(p.hole, info, 1) + 0.4)); if (k > 0) { ring(g, hx, hy, 46 * k, 5, S().ui.accent); glow(g, hx, hy, 120, S().ui.accent, 0.3 * clamp(k)); } }
  } else if (p.obj === 'chips') {
    const cx = E.W * 0.5, cy = E.H * 0.55, k = p.puff != null ? ease.inOut(prog(t, at(p.puff, info, 0.5), at(p.puff, info, 0.5) + 1.6)) : 0, w = 360 + 60 * k, h = 480 + 80 * k, bulge = 40 + 110 * k;
    g.fillStyle = '#d64a33'; g.beginPath(); g.moveTo(cx - w / 2, cy - h / 2); g.lineTo(cx + w / 2, cy - h / 2); g.quadraticCurveTo(cx + w / 2 + bulge, cy, cx + w / 2, cy + h / 2); g.lineTo(cx - w / 2, cy + h / 2); g.quadraticCurveTo(cx - w / 2 - bulge, cy, cx - w / 2, cy - h / 2); g.fill();
    for (const yy of [cy - h / 2, cy + h / 2]) for (let x = cx - w / 2; x < cx + w / 2; x += 24) poly(g, [[x, yy], [x + 12, yy + (yy < cy ? -14 : 14)], [x + 24, yy]], '#b03a28');
    seg(g, [[cx - w / 2 + 30, cy - h / 2 + 40], [cx - w / 2 + 10 - bulge * 0.5, cy]], 10, alpha('#ffffff', 0.35)); circle(g, cx, cy, 110, '#f2c21a'); text(g, 'CHIPS', cx, cy, { size: 64, color: '#7a2a18', font: FONTS.title, weight: 700 });
  } else if (p.obj === 'meal') {
    const cx = E.W * 0.5, cy = E.H * 0.55; rr(g, cx - 420, cy - 200, 840, 400, 30); g.fillStyle = '#c8d4dc'; g.fill(); rr(g, cx - 380, cy - 160, 360, 230, 20); g.fillStyle = '#e8eef0'; g.fill(); rr(g, cx - 340, cy - 120, 280, 150, 16); g.fillStyle = '#c9783a'; g.fill(); circle(g, cx + 190, cy - 40, 120, '#e8eef0'); circle(g, cx + 190, cy - 40, 80, '#7ab05a'); rr(g, cx + 20, cy + 100, 380, 60, 14); g.fillStyle = '#e8eef0'; g.fill();
    for (let i = 0; i < 3; i++) { const yy = cy - 200 - ((t * 60 + i * 50) % 150); g.strokeStyle = alpha('#ffffff', 0.4); g.lineWidth = 6; g.beginPath(); g.moveTo(cx - 200 + i * 60, cy - 160); g.quadraticCurveTo(cx - 240 + i * 60, yy + 60, cx - 200 + i * 60, yy); g.stroke(); }
  }
  g.restore();
};

// ---------------- registration ----------------
for (const sh of E.shots || []) {
  const p = sh.params; if (!p || !p.tpl || !T[p.tpl]) continue;
  registerShot(sh.id, { draw(g, t, info) {
    const cam = camAt(p.cam, t, info.dur); T[p.tpl](g, t, info, p, cam);
    if (p.ov) overlays(g, t, info, p.ov); if (p.clock) clockCard(g, t, p.clock);
  } });
}
