// Thumbnail: the orange recorder glowing on the dark sea floor, lit by a robot sub; "IT'S NOT BLACK."
import { E, registerShot, backdrop, glow, alpha, text, rr, seg, poly, circle, linGrad, rng, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { recorder } from '../props/recorder.js';

registerShot('thumb', { draw(g) {
  const t = 1;
  backdrop(g, ['#031018', '#020a10', '#000305']);
  const r = rng(11); for (let i = 0; i < 140; i++) circle(g, r() * E.W, r() * E.H, 1.5 + r() * 2.5, alpha('#cfe8f0', 0.35));
  // robot sub with searchlight
  const sx = E.W * 0.86, sy = E.H * 0.2;
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, sx, sy, E.W * 0.62, E.H * 0.8, ['rgba(255,244,210,.35)', 'rgba(255,244,210,0)']); g.beginPath(); g.moveTo(sx - 70, sy + 20); g.lineTo(E.W * 0.38, E.H * 0.95); g.lineTo(E.W * 0.86, E.H * 1.0); g.closePath(); g.fill(); g.restore();
  rr(g, sx - 120, sy - 30, 260, 60, 30); g.fillStyle = '#e8c23a'; g.fill(); poly(g, [[sx + 140, sy], [sx + 190, sy - 40], [sx + 190, sy + 40]], '#c8a020'); glow(g, sx - 120, sy, 160, '#fff4d0', 0.9); circle(g, sx - 118, sy, 14, '#ffffff');
  // sea floor
  const FY = E.H * 0.8; g.fillStyle = linGrad(g, 0, FY - 40, 0, E.H, ['#20343a', '#0a1214']); g.beginPath(); g.moveTo(0, E.H); for (let x = 0; x <= E.W; x += 30) g.lineTo(x, FY + Math.sin(x / 210) * 24 + Math.sin(x / 67) * 8); g.lineTo(E.W, E.H); g.fill();
  // the recorder, glowing
  glow(g, E.W * 0.6, FY - 30, 520, '#ff8a1f', 0.35); glow(g, E.W * 0.6, FY - 30, 260, '#ffd090', 0.35);
  recorder(g, E.W * 0.6, FY - 50, 1.9, { rot: 0.12, burnt: 0.15, ping: 1 });
  FX.rings(g, E.W * 0.6 + 330, FY - 120, 0.3, { count: 3, r0: 30, r1: 360, speed: 0.6, color: '#9af2ff', a: 0.55, w: 4 });
  // headline
  text(g, 'THE BLACK BOX', 70, 120, { size: 92, color: '#ffffff', font: FONTS.title, weight: 700, align: 'left', stroke: 18, strokeColor: 'rgba(0,0,0,.9)', spacing: 4 });
  text(g, "ISN'T BLACK.", 60, 290, { size: 210, color: '#ff8a1f', font: FONTS.title, weight: 700, align: 'left', stroke: 26, strokeColor: 'rgba(0,0,0,.95)', glow: 30, glowColor: 'rgba(255,140,30,.5)', spacing: 4 });
  // depth tag
  rr(g, 72, 400, 520, 92, 20); g.fillStyle = 'rgba(8,24,34,.92)'; g.fill(); g.strokeStyle = '#3de0ff'; g.lineWidth = 4; g.stroke();
  seg(g, [[112, 422], [112, 470]], 6, '#3de0ff'); poly(g, [[98, 456], [126, 456], [112, 476]], '#3de0ff');
  text(g, '3,900 M DOWN', 150, 448, { size: 54, color: '#ffffff', font: FONTS.ui, weight: 900, align: 'left' });
} });
