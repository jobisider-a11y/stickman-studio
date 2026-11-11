// props/recorder.js: the orange flight recorder (CVR/FDR) with reflective stripes and the locator beacon.
import { rr, seg, circle, poly, glow, alpha, shade, text, FONTS } from '/engine/core.js';
export function recorder(g, x, y, s = 1, o = {}) {
  const { label = null, beacon = true, burnt = 0, ping = 0, rot = 0 } = o, base = '#ff7a1a';
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  rr(g, -120, -70, 240, 120, 14); g.fillStyle = shade(base, -0.35 * burnt - 0.15); g.fill();                  // body side
  rr(g, -120, -90, 240, 120, 14); g.fillStyle = shade(base, -0.5 * burnt); g.fill();                          // body front
  for (const yy of [-78, 6]) { g.fillStyle = alpha('#f4f8fa', 0.85 * (1 - burnt)); g.fillRect(-120, yy, 240, 10); } // reflective stripes
  rr(g, -100, -58, 200, 52, 8); g.fillStyle = alpha('#1a0c04', 0.35); g.fill();
  text(g, label || 'FLIGHT RECORDER', 0, -40, { size: 16, color: '#1a0c04', font: FONTS.ui, weight: 900 }); text(g, 'DO NOT OPEN', 0, -20, { size: 14, color: '#1a0c04', font: FONTS.ui, weight: 900 });
  if (burnt) { g.fillStyle = alpha('#1a1008', 0.55 * burnt); for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(-90 + i * 22, -40 + (i % 3) * 30, 26, 14, i, 0, 7); g.fill(); } }
  if (beacon) { rr(g, 120, -60, 70, 40, 16); g.fillStyle = '#c8d0d4'; g.fill(); seg(g, [[130, -40], [182, -40]], 3, '#7a868c'); if (ping > 0) glow(g, 190, -40, 60, '#9af2ff', 0.8 * ping); }
  g.restore();
}
