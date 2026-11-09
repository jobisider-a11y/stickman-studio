// shots/01_open.js: cold open (s01-s05)
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, wordTime, seg, circle, ring, rr, glow, alpha, shade, mix, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { sky, nearClouds } from '../sets/sky.js';
import { cabin, cabinGround, winX, winY, seat, outsideView } from '../sets/cabin.js';
import { airliner } from '../props/plane.js';
import { PAX, PILOT, EXTRA, EXTRA2 } from '../cast.js';

export const planeBody = (M) => mix(M.wall, M.ambient, 0.5);

// s01: establishing exterior, night above the clouds
registerShot('s01', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1 + 0.07 * k, x: -50 * k };
  const { DY, M } = sky(g, t, cam, { mood: 'night' });
  layer(g, cam, 1, (g) => airliner(g, E.W * 0.42 + t * 14, DY - V(250, 420) + Math.sin(t * 0.8) * 6, V(0.95, 0.7), { t, body: planeBody(M), rim: M.rim, win: M.practical, contrail: 0.8 }));
  nearClouds(g, t, cam, M);
  FX.dust(g, t, { count: 30, color: '#dfe8ff', a: 0.25 });
} });

// s04: bigFace PAX scared, under-a-minute countdown ring
registerShot('s04', { draw(g, t, info) {
  blurLayer(g, 14, (g) => cabin(g, t, { z: 1.7, x: -200, y: -160 })); veil(g, '#05070c', 0.4);
  const M = mood('dusk'), r = V(300, 330) * (1 + 0.03 * t), cx = E.W / 2 + V(160, 0), cy = E.H * V(0.62, 0.55);
  bigFace(g, cx, cy, r, { outfit: PAX, expr: t < 0.8 ? 'surprised' : 'shocked', look: [-0.5, -0.1], rimColor: M.rim, rimSide: -1, blink: (t % 2.7) > 2.6 });
  const tm = (wordTime('minute', info.shot.start) ?? info.shot.start + 0.9) - info.shot.start;
  const p = ease.out(prog(t, tm - 0.3, tm + 0.2)), ui = E.style.ui, rx = V(330, E.W / 2), ry = E.H * V(0.42, 0.2);
  if (p > 0) {
    g.save(); g.globalAlpha *= p;
    ring(g, rx, ry, 110, 10, alpha(ui.accent, 0.25));
    const frac = 1 - clamp((t - tm) / 3) * 0.8; g.strokeStyle = ui.accent; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.arc(rx, ry, 110, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); g.stroke();
    glow(g, rx, ry, 200, ui.accent, 0.25);
    text(g, '< 1', rx, ry - 12, { size: 72, color: ui.cream, font: FONTS.ui, weight: 900 });
    text(g, 'MIN', rx, ry + 46, { size: 30, color: ui.accent, font: FONTS.ui, weight: 900, spacing: 3 });
    g.restore();
  }
} });
