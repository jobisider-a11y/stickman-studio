// sets/sky.js: exterior above the clouds. sky(g, t, cam, {mood, deckY, stars, everest, haze})
import { E, V, mood, layer, backdrop, rng, circle, glow, alpha, shade, mix, linGrad, poly } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const deckY = () => E.H * V(0.74, 0.68);
export function cloudDeck(g, y, base, light, seed = 3, t = 0, o = {}) {
  const r = rng(seed), n = o.n || 60, x0 = -E.W * 1.2, span = E.W * 3.4, sz = o.size || 1;
  g.fillStyle = linGrad(g, 0, y, 0, y + E.H, [base, shade(base, -0.45)]); g.fillRect(-E.W * 2, y + 40 * sz, E.W * 5, E.H * 2);
  for (let i = 0; i < n; i++) {
    const x = x0 + (i / n) * span + (r() - 0.5) * 60 - t * (o.drift || 0), rr = (70 + r() * 90) * sz, yy = y + (r() - 0.3) * 50 * sz;
    circle(g, x, yy + rr * 0.35, rr, base);
    g.save(); g.beginPath(); g.arc(x, yy + rr * 0.35, rr, 0, 7); g.clip();
    g.fillStyle = linGrad(g, 0, yy - rr * 0.65, 0, yy + rr * 0.4, [alpha(light, o.lit ?? 0.55), alpha(light, 0)]); g.fillRect(x - rr, yy - rr, rr * 2, rr * 1.4); g.restore();
  }
}
export function everest(g, x, y, s, M) {
  const c = shade(M.dark, 0.15), lit = mix(M.key, '#ffffff', 0.4);
  poly(g, [[x - 760 * s, y], [x - 300 * s, y - 330 * s], [x - 120 * s, y - 420 * s], [x, y - 560 * s], [x + 140 * s, y - 380 * s], [x + 320 * s, y - 300 * s], [x + 820 * s, y]], c);
  poly(g, [[x, y - 560 * s], [x - 120 * s, y - 420 * s], [x - 60 * s, y - 430 * s], [x - 20 * s, y - 380 * s], [x + 30 * s, y - 470 * s], [x + 140 * s, y - 380 * s]], alpha(lit, 0.85));
  poly(g, [[x - 300 * s, y - 330 * s], [x - 120 * s, y - 420 * s], [x - 160 * s, y - 330 * s]], alpha(lit, 0.4));
}
export function sky(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), DY = o.deckY ?? deckY(), CX = E.W / 2, night = (o.mood === 'night' || o.mood === 'storm');
  layer(g, cam, 0.08, (g) => {
    backdrop(g, M.sky);
    if (o.stars ?? night) FX.stars(g, t, { count: 200, area: [-E.W, -E.H, E.W * 3, E.H * 1.4], color: '#ffffff' });
    if (night) FX.moon(g, CX + V(520, 260), E.H * V(0.2, 0.18), 40); else FX.sun(g, CX + (o.sunX ?? V(-420, -200)), DY - (o.sunY ?? 40), 70, '#fff4dc', M.key, 6);
    if (!night) FX.godRays(g, CX + (o.sunX ?? V(-420, -200)), DY - (o.sunY ?? 40), { count: 10, angle: -Math.PI / 2, spread: Math.PI * 1.3, len: 1800, a: 0.05, t, color: M.key });
  });
  layer(g, cam, 0.25, (g) => {
    if (o.everest) everest(g, CX + (o.everestX ?? V(260, 120)), DY + 30, o.everestS ?? V(0.9, 1.0), M);
    cloudDeck(g, DY - 50, mix(M.sky[0], M.dark, 0.5), night ? M.rim : M.key, 11, t, { n: 40, size: 0.7, lit: 0.35, drift: 6 });
    FX.fog(g, DY - 160, 200, M.fog, 0.18);
  });
  layer(g, cam, 0.5, (g) => cloudDeck(g, DY + 10, mix(M.sky[0], M.wall, 0.6), night ? M.rim : M.key, 5, t, { n: 46, size: 1.0, lit: 0.5, drift: 14 }));
  return { DY, CX, M };
}
// front cloud layer (call after the plane), soft and blurred
export function nearClouds(g, t, cam, M, y) {
  layer(g, cam, 1.5, (g) => cloudDeck(g, y ?? E.H * 0.98, mix(M.sky[0], M.wall, 0.4), M.key, 21, t, { n: 24, size: 1.6, lit: 0.3, drift: 60 }));
}
