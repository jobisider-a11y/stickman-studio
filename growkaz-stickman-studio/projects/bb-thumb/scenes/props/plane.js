// props/plane.js: a side-view airliner silhouette (nose to +x). Colours come from the caller's mood.
import { E, rr, seg, circle, poly, glow, alpha, shade, linGrad } from '/engine/core.js';

export function fuselagePath(g) {
  g.beginPath(); g.moveTo(-460, -40); g.lineTo(320, -48); g.quadraticCurveTo(452, -44, 468, 8);
  g.quadraticCurveTo(452, 48, 320, 48); g.lineTo(-330, 48); g.quadraticCurveTo(-420, 40, -470, -10); g.closePath();
}
// o: { t, body, rim, win, facing, pitch (rad, nose up +), bank, lights, a, contrail }
export function airliner(g, x, y, s = 1, o = {}) {
  const { t = 0, body = '#262a3c', rim = '#ffd59a', win = '#ffd59a', facing = 1, pitch = 0, lights = true, a = 1, contrail = 0 } = o;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(-pitch * facing); g.scale(facing * s, s);
  if (contrail > 0) { for (const dy of [70, 96]) { g.fillStyle = linGrad(g, -260, 0, -2600, 0, [alpha('#ffffff', 0.35 * contrail), alpha('#ffffff', 0)]); g.fillRect(-2600, dy - 5, 2340, 10); } }
  const dark = shade(body, -0.3), lite = shade(body, 0.35), edge = alpha(rim, 0.8);
  poly(g, [[70, -14], [-30, -14], [-210, -96], [-172, -100]], dark); seg(g, [[70, -16], [-172, -100]], 3, alpha(rim, 0.45));   // far wing
  poly(g, [[-350, -6], [-470, -52], [-494, -46], [-420, 4]], dark);                                                       // far stabiliser
  poly(g, [[-280, -44], [-416, -224], [-474, -226], [-450, -30]], lite); seg(g, [[-284, -48], [-418, -222], [-472, -224]], 5, edge);  // tail fin
  g.fillStyle = linGrad(g, 0, -48, 0, 48, [lite, body, shade(body, -0.45)]); fuselagePath(g); g.fill();
  g.save(); fuselagePath(g); g.clip(); g.strokeStyle = edge; g.lineWidth = 8; g.beginPath(); g.moveTo(-460, -44); g.lineTo(320, -52); g.quadraticCurveTo(452, -48, 470, 4); g.stroke(); g.restore();
  for (let i = 0; i < 30; i++) { const wx = -330 + i * 21.5; rr(g, wx - 4, -20, 8, 13, 4); g.fillStyle = win; g.fill(); }
  glow(g, -20, -14, 360, win, 0.07);
  poly(g, [[392, -30], [436, -22], [446, -8], [394, -12]], shade(body, -0.6)); seg(g, [[398, -27], [432, -21]], 2, alpha(rim, 0.6));  // cockpit windows
  rr(g, 14, 22, 132, 48, 24); g.fillStyle = shade(body, -0.1); g.fill(); seg(g, [[24, 24], [134, 24]], 3, alpha(rim, 0.55));         // engine pod
  g.beginPath(); g.ellipse(144, 46, 9, 22, 0, 0, 7); g.fillStyle = shade(body, -0.65); g.fill();
  poly(g, [[130, 10], [-40, 10], [-290, 140], [-236, 150]], lite); seg(g, [[130, 8], [-236, 148]], 5, edge);                       // near wing
  poly(g, [[-356, 2], [-482, -20], [-504, -10], [-410, 18]], lite); seg(g, [[-356, 0], [-482, -20]], 3, edge);                     // near stabiliser
  if (lights) {
    if ((t % 1.3) < 0.12) { glow(g, 10, -54, 70, '#ff4040', 0.9); circle(g, 10, -52, 6, '#ff8080'); }
    if (((t + 0.6) % 1.6) < 0.08) { glow(g, -470, -10, 90, '#ffffff', 0.9); circle(g, -470, -10, 5, '#ffffff'); }
    glow(g, -266, 146, 40, '#4dff88', 0.6);
  }
  g.restore();
}
// tiny top-down plane icon for maps/diagrams, pointing +x
export function planeIcon(g, x, y, s = 1, color = '#ffd45a', rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  poly(g, [[34, 0], [26, -5], [-26, -4], [-34, -2], [-34, 2], [-26, 4], [26, 5]], color);
  poly(g, [[8, -4], [-8, -30], [-16, -30], [-6, -4]], color); poly(g, [[8, 4], [-8, 30], [-16, 30], [-6, 4]], color);
  poly(g, [[-24, -3], [-32, -12], [-36, -12], [-32, -2]], color); poly(g, [[-24, 3], [-32, 12], [-36, 12], [-32, 2]], color);
  g.restore();
}
