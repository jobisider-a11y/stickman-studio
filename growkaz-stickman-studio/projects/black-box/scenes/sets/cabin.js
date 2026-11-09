// sets/cabin.js: airliner cabin interior (side view). Oval windows glow with the outside sky; PAX sits in front of one.
import { E, V, mood, layer, rr, seg, circle, glow, alpha, shade, mix, linGrad } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { cloudDeck } from './sky.js';

export const cabinGround = () => E.H * V(0.86, 0.72);
export const winX = (k) => E.W / 2 + k * V(340, 300);
export const winY = () => cabinGround() - V(330, 340);
export function outsideView(g, x, y, w, h, t, M, o = {}) {
  g.fillStyle = linGrad(g, 0, y, 0, y + h, o.sky || M.sky); g.fillRect(x, y, w, h);
  if (o.sun !== false) { glow(g, x + w * (o.sunX ?? 0.35), y + h * 0.62, w * 1.4, M.key, 0.55); circle(g, x + w * (o.sunX ?? 0.35), y + h * 0.62, w * 0.12, '#fff4dc'); }
  g.save(); g.translate(x, y + h * 0.68); g.scale(w / 600, w / 600); cloudDeck(g, 0, mix(M.sky[0], M.wall, 0.55), M.key, 7, t, { n: 10, size: 0.8, lit: 0.6, drift: 30 }); g.restore();
  if (o.frost) { g.save(); g.globalAlpha = o.frost; for (let i = 0; i < 26; i++) { const a = i * 2.4, r0 = w * 0.55; seg(g, [[x + w / 2 + Math.cos(a) * r0, y + h / 2 + Math.sin(a) * r0 * 1.3], [x + w / 2 + Math.cos(a) * r0 * 0.62, y + h / 2 + Math.sin(a) * r0 * 0.8]], 2, '#e6f4ff'); } g.fillStyle = 'rgba(220,240,255,.18)'; g.fillRect(x, y, w, h); g.restore(); }
}
export function seat(g, x, GY, s, color, facing = 1) {
  g.save(); g.translate(x, GY); g.scale(facing * s, s);
  rr(g, -64, -230, 40, 230, 16); g.fillStyle = color; g.fill();                 // back
  rr(g, -66, -250, 44, 50, 14); g.fillStyle = shade(color, 0.12); g.fill();      // headrest
  rr(g, -60, -82, 110, 26, 12); g.fillStyle = shade(color, 0.08); g.fill();      // cushion
  seg(g, [[-10, -60], [-10, 0]], 8, shade(color, -0.3)); g.restore();
}
export function cabin(g, t, cam, o = {}) {
  const M = mood(o.mood || 'interiorCool'), OM = mood(o.outside || 'dusk'), GY = cabinGround(), CX = E.W / 2;
  const wall = shade(M.wall, -0.15), wy = winY(), ww = V(120, 130), wh = V(170, 185);
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, -E.H, 0, GY, [shade(M.dark, -0.2), wall, shade(wall, -0.25)]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H + 10);
    g.fillStyle = shade(M.dark, -0.1); rr(g, -E.W, wy - V(260, 300), E.W * 3, V(150, 170), 30); g.fill();                  // overhead bins
    g.fillStyle = alpha(M.practical, 0.5); g.fillRect(-E.W, wy - V(108, 128), E.W * 3, 4);
    for (let k = -6; k <= 6; k++) { seg(g, [[winX(k) - 150, wy - V(260, 300)], [winX(k) - 150, wy - V(112, 132)]], 3, alpha('#000', 0.4)); circle(g, winX(k) + 40, wy - V(90, 110), 5, alpha(M.practical, 0.7)); }
    for (let k = -6; k <= 6; k++) {
      const x = winX(k) - ww / 2;
      rr(g, x - 14, wy - 14, ww + 28, wh + 28, ww / 2); g.fillStyle = shade(wall, 0.18); g.fill();
      g.save(); rr(g, x, wy, ww, wh, ww / 2.2); g.clip(); outsideView(g, x, wy, ww, wh, t + k * 0.2, OM, { frost: o.frost && k === (o.frostK ?? 0) ? o.frost : 0, sunX: 0.35 + k * 0.03 }); g.restore();
      glow(g, winX(k), wy + wh / 2, ww * 2.2, OM.key, 0.22);
    }
    g.fillStyle = linGrad(g, 0, GY - 30, 0, GY + 400, [shade(M.floor, 0.05), shade(M.dark, -0.3)]); g.fillRect(-E.W, GY - 30, E.W * 3, E.H);
    for (let k = -6; k <= 6; k++) FX.pool(g, winX(k), GY - 10, 220, 30, OM.key, 0.12);
  });
  return { GY, CX, M, OM, wy, ww, wh };
}
