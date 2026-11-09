// shots/02_3d.js: t08 the plane is built for it (2D sky, steady through the bumps)
import { E, registerShot, layer, ease, wordTime, mix, rng, circle, alpha } from '/engine/core.js';
import * as UI from '/engine/ui2d.js';
import * as FX from '/engine/fx2d.js';
import { sky, nearClouds } from '../sets/sky.js';
import { airliner } from '../props/plane.js';
registerShot('t08', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur), cam = { z: 1.1 - 0.05 * k };
  const { DY, M } = sky(g, t, cam, { mood: 'dusk', sunX: 200, sunY: 120 });
  const r = rng(5); for (let i = 0; i < 60; i++) { const x = ((r() * E.W * 1.4 - t * 500) % (E.W * 1.4) + E.W * 1.4) % (E.W * 1.4) - 100, y = E.H * (0.25 + r() * 0.35) + Math.sin(t * 6 + i) * 20; circle(g, x, y, 3, alpha(M.rim, 0.4)); }
  layer(g, cam, 1, (g) => airliner(g, E.W * 0.5, E.H * 0.45 + Math.sin(t * 5) * 6, 0.6, { t, body: mix(M.wall, M.ambient, 0.5), rim: M.rim, win: M.practical, pitch: Math.sin(t * 4) * 0.015, contrail: 0.8 }));
  nearClouds(g, t, cam, M, E.H * 0.82);
  const tb = (wordTime('built', info.shot.start) ?? info.shot.start + 1) - info.shot.start; UI.bigLine(g, Math.max(0, t - tb + 0.2), { str: 'BUILT FOR IT', dur: 3, y: E.H * 0.2, size: 80 });
} });
