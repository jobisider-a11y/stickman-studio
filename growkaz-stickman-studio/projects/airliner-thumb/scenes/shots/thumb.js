// YouTube thumbnail: lightning strikes the airliner at night, shocked passenger, giant "24 HOURS".
import { E, registerShot, mood, layer, veil, glow, alpha, text, rr, seg, poly, FONTS, linGrad, circle } from '/engine/core.js';
import { bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { sky, nearClouds } from '../sets/sky.js';
import { airliner } from '../props/plane.js';
import { PAX } from '../cast.js';

registerShot('thumb', { draw(g) {
  const t = 1.0, M = mood('storm'), cam = { z: 1 };
  sky(g, t, cam, { mood: 'storm', deckY: E.H * 0.78 });
  const px = E.W * 0.38, py = E.H * 0.64, s = 1.0;
  glow(g, px + 380 * s, py - 20, 900, '#bcd8ff', 0.55);                                   // strike glow
  FX.lightning(g, { x1: px + 330 * s, y1: -40, x2: px + 450 * s, y2: py - 10, seed: 11, w: 9, branches: 4, jag: 90 });
  airliner(g, px, py, s, { t, body: '#4a6276', rim: '#9af2ff', win: '#ffe7a0', pitch: 0.06, contrail: 0.7 });
  glow(g, px + 455 * s, py + 5, 160, '#ffffff', 0.9);                                       // impact point on the nose
  nearClouds(g, t, cam, M, E.H * 1.02);
  FX.rain(g, t, { count: 220 });
  veil(g, '#000000', 0.12);
  // shocked passenger, bottom right
  bigFace(g, E.W * 0.83, E.H * 0.72, 240, { outfit: PAX, expr: 'shocked', look: [-0.6, -0.5], rimColor: '#9af2ff', rimSide: -1 });
  // headline
  g.fillStyle = linGrad(g, 0, 0, 0, E.H * 0.42, ['rgba(0,0,0,.55)', 'rgba(0,0,0,0)']); g.fillRect(0, 0, E.W, E.H * 0.42);
  text(g, 'ONE PLANE.', 70, 120, { size: 96, color: '#ffffff', font: FONTS.title, weight: 700, align: 'left', stroke: 18, strokeColor: 'rgba(0,0,0,.9)', spacing: 4 });
  text(g, '24 HOURS', 60, 290, { size: 230, color: '#ffd400', font: FONTS.title, weight: 700, align: 'left', stroke: 26, strokeColor: 'rgba(0,0,0,.95)', glow: 30, glowColor: 'rgba(255,200,0,.45)', spacing: 6 });
  // clock tag
  rr(g, 72, 400, 330, 92, 20); g.fillStyle = 'rgba(8,24,34,.92)'; g.fill(); g.strokeStyle = '#3de0ff'; g.lineWidth = 4; g.stroke();
  circle(g, 122, 446, 26, '#3de0ff'); seg(g, [[122, 446], [122, 428]], 5, '#082230'); seg(g, [[122, 446], [136, 452]], 5, '#082230');
  text(g, '4:45 AM', 270, 448, { size: 58, color: '#ffffff', font: FONTS.ui, weight: 900 });
} });
