// shots/04_cockpit.js: cockpit shots (s05 s20 s27 s29 s36 s52)
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, wordTime, talkAmount, seg, circle, ring, rr, glow, alpha, shade, text, FONTS, S } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { cockpit, cockpitGround, pilotX, pilotSeat } from '../sets/cockpit.js';
import { PILOT } from '../cast.js';

const WARN = '#ff5a4f';
function pilotShot(g, t, cam, o = {}) {
  const r = cockpit(g, t, cam, o); const { GY, M, OM } = r, s = o.s ?? V(1.5, 1.6), x = pilotX();
  layer(g, cam, 1, (g) => {
    pilotSeat(g, x, GY, s, M);
    drawFigure(g, { x, y: GY, s, facing: 1, outfit: PILOT, pose: breathe(o.pose || POSES.sit, t), expr: o.expr || 'smile', talk: o.talk, look: o.look, rim: { color: o.warn ? WARN : OM.rim, dir: [1, -0.4], w: 4 }, shadow: false, blink: (t % 3.4) > 3.3 });
  });
  FX.dust(g, t, { count: 24, color: '#e8fbff', a: 0.18 });
  return r;
}
const faceBg = (g, t, o = {}) => { blurLayer(g, 14, (g) => cockpit(g, t, { z: 1.5, x: 120, y: -150 }, o)); veil(g, '#03080c', 0.35); };

registerShot('s05', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur); pilotShot(g, t, { z: 1.1 + 0.06 * k, x: -60 - 30 * k, y: 40 }, { expr: t > 1.6 ? 'smile' : 'neutral', look: [1, -0.2] });
} });
registerShot('s20', { draw(g, t, info) {                            // fuel-flow gauge insert
  faceBg(g, t); const M = mood('night'), ui = S().ui, cx = E.W / 2, cy = E.H * V(0.55, 0.5), R = V(230, 260);
  circle(g, cx, cy, R + 24, shade(M.dark, -0.4)); ring(g, cx, cy, R + 24, 4, alpha(mood('golden').rim, 0.6)); circle(g, cx, cy, R, '#0b161e');
  const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2;
  for (let i = 0; i <= 10; i++) { const a = lerp(a0, a1, i / 10); seg(g, [[cx + Math.cos(a) * R * 0.78, cy + Math.sin(a) * R * 0.78], [cx + Math.cos(a) * R * 0.92, cy + Math.sin(a) * R * 0.92]], i % 5 ? 3 : 6, alpha(ui.text, 0.8)); }
  g.strokeStyle = alpha(WARN, 0.8); g.lineWidth = 12; g.beginPath(); g.arc(cx, cy, R * 0.85, lerp(a0, a1, 0.8), a1); g.stroke();
  const v = lerp(0.85, 0.35, ease.inOut(prog(t, 0.3, 1.6))) + Math.sin(t * 9) * 0.006, a = lerp(a0, a1, v);
  seg(g, [[cx, cy], [cx + Math.cos(a) * R * 0.8, cy + Math.sin(a) * R * 0.8]], 8, ui.accent); circle(g, cx, cy, 18, ui.text);
  text(g, 'FUEL FLOW', cx, cy + R * 0.42, { size: V(32, 34), color: ui.text, font: FONTS.ui, weight: 900, spacing: 3 });
  UI.readout(g, { value: 'LESS FUEL', x: cx, y: cy - R - V(70, 90), align: 'center', color: ui.accent, a: ease.out(prog(t, 1.0, 1.4)) });
} });
registerShot('s27', { draw(g, t, info) {                            // pilot watches the speed tape
  const k = ease.inOut(t / info.dur); const r = pilotShot(g, t, { z: 1.45 + 0.08 * k, x: -120 + 40 * k, y: 110 }, { expr: t > 1.5 ? 'worried' : 'thinking', look: [1, 0.3], warn: clamp((t - 1.5) / 2) });
} });
registerShot('s29', { draw(g, t, info) {
  faceBg(g, t, { warn: 1 }); const r = V(300, 330) * (1 + 0.04 * t);
  glow(g, E.W * 0.85, E.H * 0.6, 700, WARN, 0.25 + 0.1 * Math.sin(t * 6));
  bigFace(g, E.W / 2 - V(120, 0), E.H * V(0.62, 0.55), r, { outfit: PILOT, expr: 'worried', look: [0.6, 0.1], rimColor: WARN, rimSide: 1, blink: (t % 2.4) > 2.3 });
} });
registerShot('s36', { draw(g, t, info) {
  faceBg(g, t); const OM = mood('golden'), r = V(300, 330) * (1 + 0.05 * t);
  bigFace(g, E.W / 2 - V(140, 0), E.H * V(0.62, 0.55), r, { outfit: PILOT, expr: 'thinking', look: [0.3, -0.2], rimColor: OM.rim, rimSide: 1, tilt: 0.05 });
  FX.lightning(g, { x1: E.W * 0.85, y1: 0, x2: E.W * 0.78, y2: E.H * 0.55, a: t > 0.4 && t < 0.55 ? 0.6 : 0, seed: 4 });
} });
registerShot('s52', { draw(g, t, info) {                            // "We're cruising at thirty-five thousand feet"
  const q0 = wordTime('were', info.shot.start) ?? info.shot.start + 1.4, q1 = (wordTime('feet', q0) ?? q0 + 1.8) + 0.4;
  const talk = talkAmount(info.globalT, q0, q1), k = ease.inOut(t / info.dur);
  const r = pilotShot(g, t, { z: 1.45 + 0.06 * k, x: -140, y: 110 }, { expr: 'smile', talk, pose: { ...POSES.sit, eF: [22, -132], hF: [26, -166] }, look: [1, 0] });
  if (talk > 0) { const hx = pilotX() + 10, hy = cockpitGround() - 180 * V(1.5, 1.6); layer(g, { z: 1.45 + 0.06 * k, x: -140, y: 110 }, 1, (g) => FX.rings(g, hx, hy, t, { count: 3, r0: 70, r1: 180, color: '#e8fbff', a: 0.35 })); }
  UI.readout(g, { label: 'CRUISING', value: 'FL350', x: E.W - V(380, 360), y: V(120, 200), a: ease.out(prog(t, q1 - info.shot.start - 0.6, q1 - info.shot.start - 0.2)) });
} });
