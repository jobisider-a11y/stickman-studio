// sets/cockpit.js: cockpit side view. Windscreen (dawn sky) to the right, glowing instrument panel, pilot seat at left.
import { E, V, mood, layer, rr, seg, circle, poly, glow, alpha, shade, mix, linGrad } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { cloudDeck } from './sky.js';
import { seat } from './cabin.js';

export const cockpitGround = () => E.H * V(0.9, 0.74);
export const pilotX = () => E.W / 2 - V(330, 160);
export function cockpit(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), OM = mood(o.outside || 'golden'), GY = cockpitGround(), CX = E.W / 2, warn = o.warn || 0;
  const wx = CX - V(40, 120), wy = GY - V(720, 900), ww = V(1500, 900), wh = V(420, 380);
  layer(g, cam, 0.15, (g) => {                                      // outside through the windscreen
    g.fillStyle = linGrad(g, 0, wy, 0, wy + wh, OM.sky); g.fillRect(wx - 400, wy - 400, ww + 800, wh + 600);
    FX.sun(g, wx + ww * 0.55, wy + wh * 0.78, 60, '#ffffff', OM.key, 6);
    FX.godRays(g, wx + ww * 0.55, wy + wh * 0.78, { count: 9, angle: -Math.PI / 2, spread: Math.PI * 1.2, len: 1400, a: 0.05, t, color: OM.key });
    g.save(); g.translate(0, wy + wh * 0.8); cloudDeck(g, 0, mix(OM.sky[0], OM.wall, 0.5), OM.key, 4, t, { n: 30, size: 0.7, lit: 0.6, drift: 40 }); g.restore();
  });
  layer(g, cam, 0.6, (g) => {                                       // cabin shell with the windscreen cut-out
    const shell = shade(M.wall, -0.35);
    g.fillStyle = shell; g.beginPath(); g.rect(-E.W, -E.H, E.W * 3, E.H * 3);
    g.moveTo(wx, wy + wh); g.lineTo(wx + ww * 0.08, wy); g.lineTo(wx + ww * 0.62, wy - 20); g.lineTo(wx + ww, wy + wh * 0.4); g.lineTo(wx + ww, wy + wh); g.closePath(); g.fill('evenodd');
    seg(g, [[wx + ww * 0.36, wy - 10], [wx + ww * 0.36, wy + wh]], V(26, 20), shell);                                                       // window post
    seg(g, [[wx, wy + wh], [wx + ww * 0.08, wy], [wx + ww * 0.62, wy - 20], [wx + ww, wy + wh * 0.4]], 5, alpha(OM.rim, 0.5));
    for (let i = 0; i < 18; i++) circle(g, wx + 60 + i * 34, wy - 90 + (i % 3) * 20, 4, alpha(i % 5 ? M.practical : '#ff9a4a', 0.75));         // overhead panel lights
    g.fillStyle = linGrad(g, 0, wy + wh, 0, GY, [shade(M.dark, -0.2), shade(M.dark, 0.05)]); g.fillRect(wx - 200, wy + wh, ww + 600, GY - wy - wh);  // panel face
    rr(g, wx - 60, wy + wh - 20, ww + 500, 50, 20); g.fillStyle = shade(M.dark, -0.4); g.fill();                                          // glareshield
    seg(g, [[wx - 50, wy + wh - 18], [wx + ww + 400, wy + wh - 18]], 3, alpha(OM.rim, 0.5));
    const sc = [[0.12, 'pfd'], [0.3, 'nd'], [0.5, 'eng'], [0.7, 'nd']];
    for (const [u, kind] of sc) {
      const x = wx + ww * u, y = wy + wh + V(70, 60), w = V(170, 150), h = V(130, 120);
      FX.screen(g, { x, y, w, h, glowC: warn > 0 && kind === 'pfd' ? '#ff5a4f' : M.practical, a: 0.25 }, (g, x, y, w, h) => {
        if (kind === 'pfd') { g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#2a7ab0', '#2a7ab0', '#7a4a2a']); g.fillRect(x, y, w, h); seg(g, [[x, y + h / 2], [x + w, y + h / 2]], 2, '#fff'); seg(g, [[x + w / 2 - 30, y + h / 2], [x + w / 2 + 30, y + h / 2]], 4, '#ffd45a');
          if (warn > 0) { g.fillStyle = alpha('#ff5a4f', 0.4 * warn * (0.6 + 0.4 * Math.sin(t * 10))); g.fillRect(x, y, w, h); } }
        else if (kind === 'nd') { for (let r = 1; r <= 3; r++) { g.strokeStyle = alpha('#9af2ff', 0.6); g.lineWidth = 2; g.beginPath(); g.arc(x + w / 2, y + h, r * h / 3, Math.PI, 0); g.stroke(); } seg(g, [[x + w / 2, y + h], [x + w / 2 + 30, y + 20]], 3, '#ff5ad8'); }
        else { for (let i = 0; i < 4; i++) { g.strokeStyle = '#e8fbff'; g.lineWidth = 3; g.beginPath(); g.arc(x + 22 + i * (w - 44) / 3, y + h * 0.45, 16, Math.PI * 0.8, Math.PI * 0.8 + 2.2 + Math.sin(t + i) * 0.1); g.stroke(); } }
      });
      glow(g, x + w / 2, y + h / 2, w * 1.4, warn > 0 && kind === 'pfd' ? '#ff5a4f' : M.practical, 0.15);
    }
    g.fillStyle = linGrad(g, 0, GY - 20, 0, GY + 300, [shade(M.floor, -0.2), shade(M.dark, -0.4)]); g.fillRect(-E.W, GY - 20, E.W * 3, E.H);
  });
  return { GY, CX, M, OM, wx, wy, ww, wh };
}
export function pilotSeat(g, x, GY, s, M) { seat(g, x, GY, s, shade(M.dark, -0.2)); }
