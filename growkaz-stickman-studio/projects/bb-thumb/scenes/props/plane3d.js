// props/plane3d.js: low-poly airliner for three-kit scenes (nose to +x, ~4 m long)
export function plane3D(T, o = {}) {
  const { THREE } = T, g = new THREE.Group(), body = o.body || '#5a7a8a', lite = o.lite || '#b8d4de', win = o.win || '#e8fbff';
  const fus = T.cyl(0.22, 0.22, 3.4, body, 0, 0, 0, 14); fus.rotation.z = Math.PI / 2; g.add(fus);
  const nose = T.sphere(0.22, body, 1.7, 0, 0); nose.scale.set(1.6, 1, 1); g.add(nose);
  const tail = T.cone(0.22, 0.7, body, -2.0, 0.05, 0, 14); tail.rotation.z = Math.PI / 2; g.add(tail);
  const wing = T.box(0.9, 0.05, 3.6, lite, -0.1, -0.08, 0); wing.rotation.y = 0.0; g.add(wing);
  const fin = T.box(0.55, 0.8, 0.05, lite, -1.85, 0.45, 0); fin.rotation.z = -0.4; g.add(fin);
  const stab = T.box(0.4, 0.04, 1.3, lite, -1.95, 0.05, 0); g.add(stab);
  for (const z of [-0.9, 0.9]) { const e = T.cyl(0.11, 0.11, 0.55, body, 0.2, -0.22, z, 10); e.rotation.z = Math.PI / 2; g.add(e); }
  for (const z of [-0.215, 0.215]) g.add(T.box(2.6, 0.05, 0.02, T.basic(win), 0.1, 0.06, z));
  g.scale.setScalar(o.s || 1); return g;
}
