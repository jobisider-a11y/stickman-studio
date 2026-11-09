// props/machines.js: Langley's Aerodrome (tandem wings) and the 1903 Wright Flyer (biplane), side/3-4 views, nose to +x.
import { E, rr, seg, circle, ring, poly, glow, alpha, shade, mix, lerp } from '/engine/core.js';

const fabric = '#e8dcc0', wood = '#5a4030';
// o: { t, broken (0..1 break-apart), rim, facing, pitch }
export function aerodrome(g, x, y, s = 1, o = {}) {
  const { t = 0, broken = 0, rim = '#f2c070', facing = 1, pitch = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(-pitch * facing); g.scale(facing * s, s);
  const part = (dx, dy, rot, fn) => { g.save(); g.translate(dx * broken, dy * broken); g.rotate(rot * broken); fn(); g.restore(); };
  const wing = (x0, sc) => {                                               // a dihedral pair seen in 3/4: far half up-back, near half down-front
    poly(g, [[x0 - 60 * sc, -6], [x0 + 70 * sc, -6], [x0 + 20 * sc, -170 * sc], [x0 - 110 * sc, -170 * sc]], alpha(shade(fabric, -0.25), 0.92));
    seg(g, [[x0 + 70 * sc, -6], [x0 + 20 * sc, -170 * sc]], 3, alpha(rim, 0.7));
    poly(g, [[x0 - 60 * sc, 6], [x0 + 70 * sc, 6], [x0 + 120 * sc, 150 * sc], [x0 - 10 * sc, 150 * sc]], alpha(fabric, 0.95));
    seg(g, [[x0 + 70 * sc, 6], [x0 + 120 * sc, 150 * sc]], 4, alpha(rim, 0.8));
    for (let k = 1; k < 4; k++) seg(g, [[x0 - 60 * sc + k * 32 * sc, 6], [x0 - 10 * sc + k * 32 * sc, 150 * sc]], 1.5, alpha(wood, 0.5));
  };
  part(-120, 260, -0.9, () => wing(-150, 1));                              // rear wings
  part(40, 320, 0.7, () => { seg(g, [[-300, 0], [220, 0]], 12, wood); seg(g, [[-300, -4], [220, -4]], 3, alpha(rim, 0.6)); rr(g, -60, -28, 90, 50, 10); g.fillStyle = shade(wood, -0.2); g.fill();
    for (const px of [-30, 10]) { g.save(); g.translate(px, 20); g.scale(1, Math.abs(Math.sin(t * 30)) + 0.1); g.beginPath(); g.ellipse(0, 0, 6, 60, 0, 0, 7); g.fillStyle = alpha('#d8c8a0', 0.5); g.fill(); g.restore(); }
    poly(g, [[-300, 0], [-360, -50], [-370, 0], [-360, 50]], alpha(fabric, 0.9)); });             // cruciform tail
  part(160, 220, 1.1, () => wing(120, 1.05));                              // front wings
  g.restore();
}
export function wrightFlyer(g, x, y, s = 1, o = {}) {
  const { t = 0, rim = '#f2c070', facing = 1, pitch = 0, pilot = null } = o;
  g.save(); g.translate(x, y); g.rotate(-pitch * facing); g.scale(facing * s, s);
  const wingL = (yy) => { rr(g, -220, yy - 7, 440, 14, 7); g.fillStyle = fabric; g.fill(); seg(g, [[-220, yy - 7], [220, yy - 7]], 3, alpha(rim, 0.8)); };
  for (const sx of [-180, -110, -40, 40, 110, 180]) seg(g, [[sx, -70], [sx, 0]], 3, wood);              // struts
  seg(g, [[-180, -70], [-110, 0]], 1, alpha(wood, 0.6)); seg(g, [[110, -70], [180, 0]], 1, alpha(wood, 0.6));
  wingL(-70);
  seg(g, [[200, -30], [330, -30]], 3, wood); seg(g, [[200, 0], [330, -20]], 3, wood);                  // canard booms
  rr(g, 300, -54, 110, 10, 5); g.fillStyle = fabric; g.fill(); rr(g, 300, -24, 110, 10, 5); g.fill();   // elevator
  seg(g, [[-200, -35], [-320, -35]], 3, wood); rr(g, -350, -90, 18, 100, 6); g.fillStyle = fabric; g.fill(); rr(g, -330, -90, 18, 100, 6); g.fill(); // twin rudders
  for (const px of [-150, -60]) { g.save(); g.translate(px, -35); g.scale(Math.abs(Math.sin(t * 40 + px)) * 0.4 + 0.08, 1); g.beginPath(); g.ellipse(0, 0, 40, 46, 0, 0, 7); g.fillStyle = alpha('#d8c8a0', 0.45); g.fill(); g.restore(); }
  if (pilot) pilot(g);                                                                                  // e.g. a prone figure on the lower wing
  wingL(0);
  seg(g, [[-60, 8], [-60, 24], [60, 24], [60, 8]], 4, wood);                                            // skids
  g.restore();
}
export function newspaper(g, x, y, w, h, o = {}) {
  const { head = 'WILL MAN FLY?', sub = '', rot = 0, a = 1 } = o;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot);
  rr(g, -w / 2, -h / 2, w, h, 6); g.fillStyle = '#efe4c8'; g.fill(); g.strokeStyle = '#8a7a5a'; g.lineWidth = 2; g.stroke();
  g.fillStyle = '#2a2018'; g.fillRect(-w / 2 + 24, -h / 2 + 24, w - 48, 4); g.fillRect(-w / 2 + 24, -h / 2 + 110, w - 48, 3);
  g.font = `900 ${Math.round(w * 0.085)}px "Playfair Display"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(head, 0, -h / 2 + 70);
  if (sub) { g.font = `italic 700 ${Math.round(w * 0.045)}px "Playfair Display"`; g.fillText(sub, 0, -h / 2 + 150); }
  for (let c = 0; c < 3; c++) for (let i = 0; i < 14; i++) { const cx = -w / 2 + 30 + c * (w - 60) / 3; g.fillStyle = 'rgba(40,32,24,.35)'; g.fillRect(cx, -h / 2 + 190 + i * 22, (w - 60) / 3 - 20 - (i % 4 === 3 ? 60 : 0), 8); }
  g.restore();
}
