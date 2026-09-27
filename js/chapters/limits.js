// Chapter 5: myths and limits.
// Myth: "things naturally slow down" and "heavy things are harder to keep moving on ice".
//   A crate is pushed from rest to 2 m/s in 1 s, then let go. It slides until friction stops it:
//   distance v² ÷ (2 μ g), the same for any mass. Keeping it moving at a steady speed takes only the
//   friction force μ m g; getting it going takes m a on top. μ: wooden crate on a concrete floor
//   about 0.4; a sledge on steel runners on ice about 0.02 (typical tabulated values); in deep space
//   there is nothing to rub against, μ = 0, and it never stops (Newton's first law).
// Equivalence: gravitational mass (how hard gravity pulls) and inertial mass (how hard it is to
//   accelerate) have always been found equal, so everything falls alike. Tests measure the Eötvös
//   ratio η = difference in acceleration ÷ average acceleration. Values plotted (best limit reached):
//   Newton's pendulums (Principia, 1687) about 1e-3; Bessel 1832 about 2e-5; Eötvös 1889/90 5e-8
//   (Eötvös, Pekár & Fekete runs 1906–08, published 1922, about 3e-9); Roll, Krotkov & Dicke 1964
//   about 1e-11; Braginsky & Panov 1971 about 1e-12; Eöt-Wash group (Schlamminger et al. 2008)
//   about 2e-13; MICROSCOPE 2017 about 1e-14 and final 2022 (PRL 129, 121102) η(Ti, Pt) =
//   [−1.5 ± 2.3 (stat) ± 1.5 (syst)] × 10⁻¹⁵. The satellite orbited at about 710 km, where
//   g ≈ 7.9 m/s².
//   The "pretend" slider lets you exaggerate η to see how two test masses would drift apart.
import { THREE, M, box, sphere, torus } from '../kit.js';
import {
  G, TAU, board, panelBg, axes, title, dot, line, tag, COL, ticks, fitNarrow, inReel, focusView,
  force, makePerson, disc, fmt, clamp,
} from '../inertia.js';

const EX = 60;
const MU = { floor: 0.4, ice: 0.02, space: 0 };
const SURF = { floor: 'concrete floor', ice: 'ice', space: 'deep space' };
const V0 = 2, TPUSH = 1;
const G_ORB = 7.9;
const ETA = [
  [1687, 1e-3, 'Newton, pendulums'], [1832, 2e-5, 'Bessel'], [1890, 5e-8, 'Eötvös'], [1922, 3e-9, 'Eötvös, Pekár, Fekete'],
  [1964, 1e-11, 'Roll, Krotkov, Dicke'], [1971, 1e-12, 'Braginsky, Panov'], [2008, 2e-13, 'Eöt-Wash'], [2017, 1.3e-14, 'MICROSCOPE'], [2022, 2.7e-15, 'MICROSCOPE final'],
];
const VIEWS = {
  myth: { pos: [1.2, 2.2, 6.4], target: [1.2, 1.0, 0] },
  equiv: { pos: [EX + 2.9, 1.4, 9.2], target: [EX + 2.9, 0.75, 0] },
};
const REEL = { myth: { pos: [0.6, 2.2, 5.2], target: [0.6, 2.2, 0] } };

// Crate motion: pushed for TPUSH s at a steady acceleration, then sliding. Returns {x, v}.
function crateAt(mu, t) {
  const a = V0 / TPUSH;
  if (t <= TPUSH) return { x: 0.5 * a * t * t, v: a * t, pushed: true };
  const x1 = 0.5 * a * TPUSH * TPUSH, d = mu * G, tt = t - TPUSH;
  if (d === 0) return { x: x1 + V0 * tt, v: V0 };
  const ts = Math.min(tt, V0 / d);
  return { x: x1 + V0 * ts - 0.5 * d * ts * ts, v: V0 - d * ts };
}

export default {
  id: 'limits',
  short: 'Myths and limits',
  title: 'Myths, and two kinds of mass that agree',
  subtitle: 'Why things stop, why ice isn’t hard work, and the most precise coincidence in physics.',
  view: VIEWS.myth,
  learn: `<p><b>Myth: things naturally slow down.</b> Aristotle thought so, and everyday life agrees: stop pedalling and a bike rolls to a halt. But the bike isn't "running out of motion". <b>Friction</b> and air are pushing it back. Take them away and nothing slows it at all. A space probe coasts for decades: Voyager 1, launched in 1977, is still travelling at about 17 km/s.</p>
    <p><b>Myth: heavy things are harder to keep moving on ice.</b> On ice, keeping a sledge going takes almost no force at all, heavy or light, because friction is tiny. What's hard is <b>starting</b> and <b>stopping</b> it: that's inertia, <b>m a</b>. A heavy sledge slides just as far as a light one, because friction and inertia both grow with mass.</p>
    <p><b>Two kinds of mass.</b> Mass appears twice in physics: <b>inertial mass</b> (how hard to accelerate, F = m a) and <b>gravitational mass</b> (how hard gravity pulls, W = m g). Nothing says they must be equal, yet every test finds they are. That's why a hammer and a feather fall together on the Moon. Loránd Eötvös checked it with a torsion balance to a few parts in a billion around 1900; the <b>MICROSCOPE</b> satellite (2016–2018) got to about <b>1 part in 10¹⁵</b>. Einstein took it as a principle, the <b>equivalence principle</b>, and built general relativity on it.</p>
    <p><b>"Mass grows at high speed"?</b> Old books say an object's "relativistic mass" rises towards light speed. Physicists today mostly don't use that idea. Mass means the <b>rest mass</b>, which never changes; what grows is the <b>energy</b> and <b>momentum</b> it takes to go faster, without limit, which is why nothing with mass reaches light speed.</p>
    <p class="tip"><b>Try it:</b> push the crate on the floor, on ice and in space, and change its mass. Then pretend inertial and gravitational mass differ, and watch MICROSCOPE's two test masses drift apart.</p>`,
  terms: [
    { t: 'Friction', d: 'The force that makes sliding things stop. Without it, a moving thing keeps going.' },
    { t: 'Inertial mass', d: 'Mass as resistance to acceleration: m = F ÷ a.' },
    { t: 'Gravitational mass', d: 'Mass as the thing gravity pulls on: W = m g.' },
    { t: 'Equivalence principle', d: 'Inertial and gravitational mass are the same, so all things fall alike. Tested to about 1 part in 10¹⁵.' },
    { t: 'Eötvös ratio (η)', d: 'The fractional difference in how fast two materials fall. Zero if the equivalence principle holds.' },
    { t: 'Rest mass', d: 'The mass an object has when still. It is the same at any speed; energy and momentum are what grow.' },
  ],
  defaults: { focus: 'myth', surf: 'floor', mass: 50, eta: 0 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'myth', label: 'Push a crate' }, { v: 'equiv', label: 'Two kinds of mass' }] },
    { key: 'surf', type: 'seg', label: 'Crate: slide it on', options: [{ v: 'floor', label: 'Floor' }, { v: 'ice', label: 'Ice' }, { v: 'space', label: 'Space' }] },
    { key: 'mass', type: 'range', label: 'Crate: mass', min: 10, max: 200, step: 5, ends: ['10 kg', '200 kg'], fmt: (v) => `${v} kg` },
    { key: 'go', type: 'buttons', label: 'Crate', items: [{ label: '▶ Push and let go', act: (s, inst) => { s.focus = 'myth'; inst.go(); } }] },
    { key: 'eta', type: 'range', label: 'Pretend the masses differ by (η)', min: 0, max: 0.05, step: 0.001, ends: ['0: as measured', '5%'], fmt: (v) => (v ? `${fmt(v * 100)}%` : 'none, as nature says') },
  ],
  onChange(s, key) {
    if (key === 'surf' || key === 'mass') s.focus = 'myth';
    if (key === 'eta') s.focus = 'equiv';
  },
  quiz: [
    { q: 'A puck slides across a table and stops. Why?', options: ['Moving things naturally slow down', 'Friction pushes against its motion', 'It runs out of force', 'Gravity pulls it backwards'], answer: 1, why: 'Nothing is needed to keep something moving. Friction is a real backwards force; without it the puck would glide on for ever.' },
    { q: 'A 20 kg and a 200 kg sledge are pushed to the same speed on ice and let go. Which slides further?', options: ['The 20 kg one', 'The 200 kg one', 'They slide the same distance', 'The heavy one never stops'], answer: 2, why: 'Friction is μ m g and inertia is m, so the slowing, μ g, is the same for both. The heavy one just took more force to get going.' },
    { q: 'What did the MICROSCOPE satellite test?', options: ['Whether mass grows with speed', 'Whether inertial and gravitational mass are equal, so different materials fall alike', 'How much the ISS weighs', 'The speed of light'], answer: 1, why: 'It compared titanium and platinum falling round the Earth and found no difference to about 1 part in 10¹⁵.' },
  ],
  reel: [
    { ms: 5400, caption: 'Things don’t naturally slow down. Friction stops them: on ice a push lasts, in space for ever.', set: { focus: 'myth', surf: 'ice', mass: 50 }, act: (s, inst) => inst.go(), view: REEL.myth, spin: 0 },
    { ms: 5200, caption: 'Inertial mass and gravitational mass agree to 1 part in 10¹⁵. So everything falls alike.', set: { focus: 'equiv', eta: 0 }, view: { pos: [EX + 1.4, 2.4, 8], target: [EX + 1.4, 2.6, 0] }, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gM = new THREE.Group(), gE = new THREE.Group(); root.add(gM, gE);
    gE.position.x = EX;

    // ------------------------------------------------ the crate on a scrolling surface
    const world = new THREE.Group(); gM.add(world);
    const surfM = { floor: M.matte(0x7b7f88), ice: M.plastic(0xdff3ff, { roughness: 0.05, metalness: 0.1 }), space: M.matte(0x0b0d14) };
    const ground = box(400, 0.06, 4, surfM.floor); ground.position.set(150, -0.03, 0); world.add(ground);
    const marks = [];
    for (let x = 0; x <= 300; x += 1) { const m = box(0.03, 0.005, x % 5 ? 0.3 : 0.9, M.matte(0xe8e2c8)); m.position.set(x, 0.005, 1.4); world.add(m); if (x % 5 === 0 && x <= 60) { const l = stage.label(`${x} m`, [x, 0.02, 1.8], world, 'small'); marks.push(l); } }
    const stars = new THREE.Group(); world.add(stars);
    for (let i = 0; i < 300; i++) { const st = sphere(0.02 + (i % 3) * 0.01, M.glow(0xffffff), 6); st.position.set(((i * 97) % 400) - 50, 0.5 + ((i * 53) % 60) / 10, -4 - ((i * 31) % 40) / 10); stars.add(st); }
    const crate = new THREE.Group(); gM.add(crate);
    const cb = box(0.8, 0.8, 0.8, M.matte(0xb88a55)); cb.position.y = 0.4; crate.add(cb);
    for (const y of [0.1, 0.7]) { const b = box(0.82, 0.08, 0.82, M.matte(0x8a6a45)); b.position.y = y; crate.add(b); }
    const runners = new THREE.Group(); crate.add(runners);
    for (const z of [-0.3, 0.3]) { const r = box(1.0, 0.04, 0.05, M.metal(0xc9ced8)); r.position.set(0, -0.02, z); runners.add(r); }
    const pusher = makePerson({ shirt: 0x3b6fd8 }); world.add(pusher);
    const fPush = force(0xffb547, 0.04, 0.2), fFric = force(0xff7a59, 0.04, 0.2); gM.add(fPush, fFric);
    const lC = stage.label('', [0, 1.4, 0], gM, 'hot');

    // ------------------------------------------------ MICROSCOPE: two test masses falling round the Earth
    const earth = sphere(1.3, M.plastic(0x2f6fd8, { roughness: 0.6 }), 48); earth.position.set(0, 0, 0); gE.add(earth);
    const land = new THREE.Mesh(new THREE.SphereGeometry(1.31, 32, 16, 0.2, 0.9, 0.7, 0.8), M.matte(0x3f8a4f)); gE.add(land);
    const land2 = new THREE.Mesh(new THREE.SphereGeometry(1.31, 32, 16, 1.5, 0.6, 1.4, 0.7), M.matte(0x3f8a4f)); gE.add(land2);
    const orbitR = 2.0;
    const orbit = torus(orbitR, 0.01, M.glow(0x8ef0ff, { transparent: true, opacity: 0.5 }), 128); gE.add(orbit);
    const sat = new THREE.Group(); gE.add(sat);
    const body = box(0.22, 0.22, 0.22, M.metal(0xc9a24a, { roughness: 0.4 })); sat.add(body);
    const panel = box(0.02, 0.6, 0.2, M.plastic(0x1d3b6e)); panel.position.x = 0; panel.rotation.z = 0; sat.add(panel); panel.position.z = -0.2;
    // Big cutaway of the instrument: platinum cylinder inside a titanium one, drawn beside the Earth.
    const inst3 = new THREE.Group(); inst3.position.set(3.6, 0.3, 0); gE.add(inst3);
    const tiM = M.metal(0xb9bec8, { roughness: 0.35, transparent: true, opacity: 0.55 }), ptM = M.metal(0xe6e9ee, { roughness: 0.2 });
    const ti = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 1.4, 48, 1, true), tiM); ti.material.side = THREE.DoubleSide; inst3.add(ti);
    const pt = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.9, 40), ptM); inst3.add(pt);
    const lTi = stage.label('titanium', [0.7, 0.75, 0], inst3, 'small'), lPt = stage.label('platinum', [0, -0.65, 0.3], inst3, 'small');
    const link = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0)]), new THREE.LineBasicMaterial({ color: 0x8ef0ff, transparent: true, opacity: 0.5 })); gE.add(link);
    const lE = stage.label('', [3.6, 1.45, 0], gE, 'hot');

    // ------------------------------------------------ board
    let cur = {};
    const chart = board(root, 2.0, 2.06, 640, 660, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur.focus) return;
      if (cur.focus === 'myth') {
        title(g, 'Speed after the push', 'solid: this surface · dashed: the others · any mass');
        const T = 12;
        const A = axes(g, w, h, { x0: 100, y0: h - 110, y1: 84, xMax: T, yMax: 2.5, xTicks: [0, 3, 6, 9, 12], yTicks: [0, 0.5, 1, 1.5, 2, 2.5], xFmt: (q) => q + ' s', yFmt: (q) => q + ' m/s', xLabel: 'time' });
        for (const k of ['floor', 'ice', 'space']) {
          const pts = []; for (let i = 0; i <= 200; i++) { const t = (i / 200) * T; pts.push([t, crateAt(MU[k], t).v]); }
          const on = k === cur.surf;
          line(g, pts, A.X, A.Y, on ? COL.v : 'rgba(255,255,255,.3)', on ? 5 : 3, on ? null : [8, 8]);
          const lab = k === 'floor' ? 'floor: stops in 0.5 s' : k === 'ice' ? 'ice: 10 s' : 'space: never';
          tag(g, lab, A.X(k === 'floor' ? 1.7 : k === 'ice' ? 6.5 : 8.5), A.Y(k === 'floor' ? 0.35 : k === 'ice' ? 1.2 : 2.0) - 10, on ? COL.v : COL.dim, '18px sans-serif');
        }
        const t = Math.min(cur.t, T); dot(g, A.X(t), A.Y(crateAt(MU[cur.surf], t).v), COL.a, 10);
        g.fillStyle = 'rgba(255,255,255,.7)'; g.font = '18px sans-serif';
        g.fillText('Nothing "wears out" the motion: only friction takes it away.', 24, h - 40);
      } else {
        title(g, 'How closely inertial = gravitational mass', 'best test of the day: η, the difference in how things fall');
        const A = axes(g, w, h, { x0: 110, y0: h - 90, y1: 84, xMin: 1650, xMax: 2040, yMin: -16, yMax: -2, xTicks: [1700, 1800, 1900, 2000], yTicks: [-15, -12, -9, -6, -3], xFmt: (q) => q + '', yFmt: (q) => '10' + String(q).replace('-', '⁻').replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]), xLabel: 'year' });
        const pts = ETA.map(([y, v]) => [y, Math.log10(v)]);
        line(g, pts, A.X, A.Y, COL.s, 4);
        ETA.forEach(([y, v, n], i) => { dot(g, A.X(y), A.Y(Math.log10(v)), i === ETA.length - 1 ? COL.a : COL.s, 8); if ([0, 2, 4, 8].includes(i)) tag(g, n, A.X(y) + (i === 8 ? -210 : 12), A.Y(Math.log10(v)) + (i === 8 ? 28 : -8), COL.dim, '17px sans-serif', w); });
        if (cur.eta > 0) { g.strokeStyle = COL.warn; g.lineWidth = 3; g.setLineDash([10, 6]); g.beginPath(); g.moveTo(A.x0, A.Y(Math.log10(cur.eta))); g.lineTo(A.x1, A.Y(Math.log10(cur.eta))); g.stroke(); g.setLineDash([]); tag(g, 'your pretend η: ruled out long ago', A.x0 + 10, A.Y(Math.log10(cur.eta)) - 10, COL.warn, 'bold 18px sans-serif'); }
      }
    }, [0, 0, 0]);
    const BOARD = { myth: [3.55, 1.4, -0.8, 1.0], equiv: [EX + 6.3, 1.1, -1.0, 1.35] };

    const st = {};
    let t = 0, running = true, key = '', lastCk = '', th = 0, drift = 0;
    const inst = {
      go() { t = 0; running = true; },
      update(dt, s) {
        dt = Math.max(0, dt);
        if (focusView(stage, st, s.focus, VIEWS) && !inReel()) inst.go();
        fitNarrow(stage, [lTi, lPt]);
        const f = s.focus, reel = inReel();
        gM.visible = f === 'myth'; gE.visible = f === 'equiv';
        stage.floor.visible = f === 'myth' ? s.surf !== 'space' : false;
        const B = BOARD[f];
        chart.mesh.position.set(...(reel ? (f === 'myth' ? [0.6, 4.3, -0.8] : [EX + 1.4, 6.6, -1.2]) : B.slice(0, 3)));
        chart.mesh.scale.setScalar(reel ? (f === 'myth' ? 1.1 : 1.6) : B[3]);
        let ck = f;
        if (f === 'myth') {
          const k = `${s.surf}|${s.mass}`;
          if (k !== key) { if (key && !reel) inst.go(); key = k; }
          if (running) { t += dt; if (t > 14) running = false; }
          const mu = MU[s.surf], C = crateAt(mu, t);
          ground.material = surfM[s.surf]; stars.visible = s.surf === 'space'; ground.visible = s.surf !== 'space';
          marks.forEach((l) => { l.visible = s.surf !== 'space'; });
          runners.visible = s.surf === 'ice';
          const sc = Math.cbrt(s.mass / 50); cb.scale.setScalar(sc); cb.position.y = 0.4 * sc;
          world.position.x = -C.x;
          crate.position.set(0, 0, 0);
          pusher.position.set(Math.min(C.x, 1) - 0.8 - 0.45 * (sc - 1), 0, 0);
          pusher.pose({ arm: C.pushed ? 1.4 : 0.2, lean: C.pushed ? 0.3 : 0, stride: C.pushed ? Math.sin(t * 10) * 0.3 : 0 });
          const fr = mu * s.mass * G;
          fPush.aim([-0.45 * sc - 0.3, 0.45 * sc, 0.45], [1, 0, 0], C.pushed ? 0.3 + (s.mass * (V0 / TPUSH) + fr) * 0.0015 : 0.01);
          fFric.aim([0.4 * sc, 0.1, 0.5], [-1, 0, 0], C.v > 0.001 && mu > 0 ? 0.2 + fr * 0.002 : 0.01);
          lC.position.set(0, 0.8 * sc + 0.5, 0);
          lC.element.innerHTML = C.pushed ? 'pushing: m a + friction' : C.v > 0.001 ? `<b>${fmt(C.v, 2)} m/s</b>, nobody pushing` : 'stopped by friction';
          cur = { focus: f, surf: s.surf, t }; ck += `|${s.surf}|${t.toFixed(1)}`;
        } else {
          th += dt * 0.35;
          const x = orbitR * Math.cos(th), y = orbitR * Math.sin(th);
          sat.position.set(x, y, 0); sat.rotation.z = th;
          link.geometry.setFromPoints([new THREE.Vector3(x, y, 0), new THREE.Vector3(3.6 - 0.62, 0.3, 0)]);
          // If η were not zero, the platinum would fall a little faster: it drifts towards the Earth.
          drift = s.eta > 0 ? Math.min(0.3, drift + dt * s.eta * 3) : Math.max(0, drift - dt * 0.2);
          const dirX = -Math.cos(th), dirY = -Math.sin(th);
          pt.position.set(dirX * drift, dirY * drift, 0);
          lE.element.innerHTML = s.eta > 0 ? `pretend η = ${fmt(s.eta * 100)}%: the platinum drifts off-centre` : 'they fall together: η < 3 × 10⁻¹⁵';
          cur = { focus: f, eta: s.eta }; ck += `|${s.eta}`;
        }
        if (ck !== lastCk) { lastCk = ck; chart.redraw(); }
      },
      dispose() { stage.floor.visible = true; },
      readout(s) {
        if (s.focus === 'myth') {
          const mu = MU[s.surf], fr = mu * s.mass * G, dist = mu ? (V0 * V0) / (2 * mu * G) : Infinity;
          return `<div class="big">${mu ? `Slides ${fmt(dist, dist < 10 ? 2 : 1)} m, then stops` : 'Never stops'}</div>
            <div class="row"><span>Force to get it to 2 m/s in 1 s</span><b>${fmt(s.mass * 2 + fr, 0)} N</b></div>
            <div class="row"><span>Force to keep it moving, μ m g</span><b>${fmt(fr, 0)} N</b></div>
            <div class="row"><span>Friction on ${SURF[s.surf]}, μ</span><b>${mu}</b></div>
            <small>Change the mass: the forces change, the sliding distance v² ÷ 2 μ g does not.</small>`;
        }
        const da = s.eta * G_ORB;
        return `<div class="big">η(Ti, Pt) = (−1.5 ± 2.7) × 10⁻¹⁵</div>
          <div class="row"><span>MICROSCOPE, 2016–2018, final result 2022</span><b>no difference found</b></div>
          <div class="row"><span>Gravity at 710 km</span><b>about ${G_ORB} m/s²</b></div>
          <div class="row"><span>Your pretend difference in fall</span><b>${s.eta ? fmt(da * 1000, 0) + ' mm/s²' : '0'}</b></div>
          <small>Like weighing a 100,000 tonne ship and noticing an eyelash: that is 1 part in 10¹⁵.</small>`;
      },
    };
    return inst;
  },
};
