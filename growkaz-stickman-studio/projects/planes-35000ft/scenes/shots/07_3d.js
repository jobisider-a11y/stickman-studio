// shots/07_3d.js: three.js shots (s26 chase over clouds, s39 jet-stream globe, s45 stacked lanes)
import { E, V, S, registerShot, mood, ease, prog, clamp, lerp, rng, wordTime, text, rr, glow, alpha, FONTS } from '/engine/core.js';
import * as UI from '/engine/ui2d.js';
import { plane3D } from '../props/plane3d.js';

const wt = (w, info, fb) => (wordTime(w, info.shot.start - 0.1) ?? info.shot.start + fb) - info.shot.start;
function cloudField(T, M, n, seed, spread = 80) {
  const { THREE } = T, g = new THREE.Group(), r = rng(seed), m = T.mat(M.fog, { flat: true }), geo = new THREE.IcosahedronGeometry(1, 1);
  for (let i = 0; i < n; i++) { const c = new THREE.Mesh(geo, m); const s = 2 + r() * 2.5; c.scale.set(s * 1.6, s * 0.45, s * 1.3); c.position.set((r() - 0.5) * spread * 2, -r() * 0.8, (r() - 0.5) * spread); g.add(c); }
  return g;
}
registerShot('s26', { kind: '3d',
  init(T) {
    const M = mood('dusk'), st = T.stage({ mood: 'dusk', fov: 38, fog: [20, 90], keyPos: [-20, 12, -10], keyIntensity: 2.6, ambient: 1.2 });
    const clouds = cloudField(T, M, 520, 4, 70); clouds.position.y = -8; st.add(clouds);
    const p = plane3D(T, { body: M.fog, lite: '#e6f8ff', win: M.practical }); st.add(p);
    return { stage: st, clouds, p };
  },
  draw(s, t, info, T) {
    const tf = wt('faster', info, 2.2), sp = 6 + 26 * ease.in(prog(t, tf - 1.2, info.dur));
    s.clouds.position.x = -((t * 6 + sp * t * 0.5) % 160) + 40; s.p.position.y = Math.sin(t * 1.3) * 0.08; s.p.rotation.x = Math.sin(t * 0.9) * 0.04;
    T.dolly(s.stage.camera, t, [[0, { pos: [-6, 2.8, 6.5], look: [0.8, -0.4, 0], fov: 38 }], [info.dur, { pos: [-3.8, 1.8, 4.8], look: [1, -0.3, 0], fov: 42 }]]);
  },
  overlay(g, t, info) {
    const ui = S().ui, tf = wt('faster', info, 2.2), p = ease.inOut(prog(t, tf - 1.0, info.dur - 0.3)), x = E.W * 0.08, y = E.H - V(140, 300), w = V(560, 700);
    text(g, 'SPEED', x, y - 46, { size: 30, color: ui.text, font: FONTS.ui, weight: 900, align: 'left', spacing: 3 });
    rr(g, x, y - 20, w, 40, 20); g.fillStyle = alpha(ui.text, 0.15); g.fill(); rr(g, x, y - 20, Math.max(40, w * (0.35 + 0.6 * p)), 40, 20); g.fillStyle = ui.accent; g.fill(); glow(g, x + w * (0.35 + 0.6 * p), y, 60, ui.accent, 0.5);
    if (t > tf) text(g, 'FASTER', x + w + 40, y, { size: 44, color: ui.accent, font: FONTS.ui, weight: 900, align: 'left', alpha: clamp((t - tf) * 3) });
  } });
registerShot('s39', { kind: '3d',
  init(T) {
    const { THREE } = T, M = mood('night'), st = T.stage({ mood: 'night', fov: 34, fog: false, keyPos: [-6, 4, 8], keyIntensity: 2.4, ambient: 0.9 });
    const tex = T.canvasTex(1024, 512, (g, w, h) => { g.fillStyle = '#0d2e44'; g.fillRect(0, 0, w, h); const r = rng(7); g.fillStyle = '#2a5a5a'; for (let i = 0; i < 26; i++) { const x = r() * w, y = h * (0.2 + r() * 0.6); g.beginPath(); g.ellipse(x, y, 30 + r() * 90, 20 + r() * 60, r() * 3, 0, 7); g.fill(); } g.strokeStyle = 'rgba(160,240,255,.18)'; g.lineWidth = 2; for (let i = 1; i < 12; i++) { g.beginPath(); g.moveTo(0, h * i / 12); g.lineTo(w, h * i / 12); g.stroke(); g.beginPath(); g.moveTo(w * i / 12, 0); g.lineTo(w * i / 12, h); g.stroke(); } });
    const globe = new THREE.Mesh(new THREE.SphereGeometry(3, 64, 48), T.mat('#ffffff', { map: tex, roughness: 0.8 })); st.add(globe);
    const atm = new THREE.Mesh(new THREE.SphereGeometry(3.12, 48, 32), T.basic(M.rim, { transparent: true, opacity: 0.12, side: THREE.BackSide })); st.add(atm);
    const streams = new THREE.Group();
    for (const [lat, ph, amp] of [[0.75, 0, 0.12], [-0.8, 1.3, 0.1]]) { const pts = []; for (let i = 0; i <= 200; i++) { const lon = (i / 200) * Math.PI * 2, la = lat + Math.sin(lon * 4 + ph) * amp, r = 3.25; pts.push(new THREE.Vector3(r * Math.cos(la) * Math.cos(lon), r * Math.sin(la), r * Math.cos(la) * Math.sin(lon))); }
      const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 300, 0.05, 8, true), T.basic('#7ff0ff', { transparent: true, opacity: 0.9 })); streams.add(tube);
      for (let k = 0; k < 10; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 8), T.basic('#e8fbff')); const i = k * 20, pa = pts[i], pb = pts[i + 2]; c.position.copy(pa); c.lookAt(pb); c.rotateX(Math.PI / 2); streams.add(c); } }
    st.add(streams);
    return { stage: st, globe, streams };
  },
  draw(s, t, info, T) { s.globe.rotation.y = -t * 0.05; s.streams.rotation.y = -t * 0.35; T.orbit(s.stage.camera, t, { target: [0, 0.4, 0], radius: 10.5, height: [3.2, 2.2], from: -0.3, to: 0.25, dur: info.dur }); },
  overlay(g, t, info) { const th = wt('hundred', info, 4.5); UI.readout(g, { label: 'JET STREAM', value: '100+ MPH', x: V(120, 90), y: E.H - V(150, 380), a: ease.out(prog(t, th - 0.2, th + 0.3)) }); },
});
registerShot('s45', { kind: '3d',
  init(T) {
    const { THREE } = T, M = mood('night'), st = T.stage({ mood: 'night', fov: 40, fog: [18, 60], keyPos: [-8, 10, 6], keyIntensity: 2, ambient: 1.1 });
    const lanes = [], planes = [];
    for (let i = 0; i < 4; i++) { const y = i * 1.6, east = i % 2 === 0;
      const sheet = new THREE.Mesh(new THREE.PlaneGeometry(60, 5), T.basic(east ? '#e8fbff' : '#3de0ff', { transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false })); sheet.rotation.x = -Math.PI / 2; sheet.position.y = y - 0.2; st.add(sheet); lanes.push(sheet);
      for (let k = 0; k < 7; k++) { const p = plane3D(T, { body: M.wall, lite: east ? '#e8fbff' : '#7ff0ff', win: M.practical, s: 0.45 }); p.rotation.y = east ? 0 : Math.PI; p.position.set(-30 + k * 9 + i * 2, y, (k % 2 - 0.5) * 1.6); p.userData = { east, x0: p.position.x }; st.add(p); planes.push(p); } }
    return { stage: st, planes };
  },
  draw(s, t, info, T) {
    for (const p of s.planes) { const v = p.userData.east ? 3 : -3; p.position.x = ((p.userData.x0 + v * t + 30) % 60 + 60) % 60 - 30; }
    T.orbit(s.stage.camera, t, { target: [0, 2.3, 0], radius: 15, height: [5.5, 3.5], from: -0.7, to: -0.25, dur: info.dur });
  },
} );
