// Chapter 4: measuring mass.
// Scales: a pan balance compares an object with known masses, so gravity cancels: it reads the
//   same on Earth (g = 9.81 m/s²) and on the Moon (1.62 m/s², NASA Moon fact sheet). A spring scale
//   measures the force m g and is marked in kg for Earth, so on the Moon it reads m × 1.62 ÷ 9.81,
//   about a sixth. On the ISS everything is in free fall together (gravity there is still about
//   8.7 m/s², 90% of the surface value), so neither scale reads anything: no weight is felt.
//   The hanging scale's spring is 327 N/m, so 10 kg stretches it 30 cm on Earth.
// Wobble chair (an inertial balance): Skylab's Body Mass Measurement Device (experiment M172,
//   1973), built by William Thornton's team. A chair on springs with k = 606 N/m; the empty chair
//   swung with a period of 0.848 s (NASA/Smithsonian figures, see Springer Microgravity Sci.
//   Technol. 2019). T = 2π √((m + m0) ÷ k) with the chair's own m0 = k T0² ÷ 4π² ≈ 11.0 kg. Skylab's
//   calibrations reached about 0.1%. Gravity plays no part: only inertia sets the period.
// SLAMMD (Space Linear Acceleration Mass Measurement Device, on the ISS since Expedition 11, 2005):
//   two springs on cams pull the crew member's guide arm with a known, steady force; an optical
//   sensor times the motion, so m = F ÷ a. Range 95–240 lb (43–109 kg), accurate to about 0.5 lb
//   (0.2 kg) (NASA Human Research Facility). The real force is not published in the sources we
//   found; 40 N here is an illustrative figure. a = 2 d ÷ t² over a 0.3 m run.
import { THREE, M, box, beam, torus, spring } from '../kit.js';
import {
  G, G_MOON, TAU, board, panelBg, axes, title, dot, line, tag, COL, ticks, fitNarrow, inReel, focusView,
  force, makePerson, disc, fmt, clamp, canvasTexture,
} from '../inertia.js';

const WX = 40, SX = 80;
const PLACES = { earth: { g: G, name: 'Earth' }, moon: { g: G_MOON, name: 'the Moon' }, iss: { g: 0, name: 'the ISS' } };
const K_SPR = 327;                         // N/m, hanging kitchen scale
const BMMD = { k: 606, T0: 0.848 };
const M0 = (BMMD.k * BMMD.T0 ** 2) / (TAU * TAU);
const periodOf = (m) => TAU * Math.sqrt((m + M0) / BMMD.k);
const SL = { F: 40, d: 0.3 };
const VIEWS = {
  scales: { pos: [0.5, 1.75, 4.6], target: [0.5, 1.25, 0] },
  wobble: { pos: [WX + 0.75, 1.85, 4.9], target: [WX + 0.75, 1.25, 0] },
  slammd: { pos: [SX + 0.55, 1.8, 4.6], target: [SX + 0.55, 1.1, 0] },
};
const REEL = { wobble: { pos: [WX, 1.6, 3.4], target: [WX, 1.75, 0] } };

export default {
  id: 'weigh',
  short: 'Measuring mass',
  title: 'Weighing without weight',
  subtitle: 'A balance, a spring scale, a wobbling chair on Skylab and a spring-loaded arm on the ISS.',
  view: VIEWS.scales,
  learn: `<p>Most scales measure <b>weight</b>, the pull of gravity, and then quietly divide by Earth's g to show kilograms. A <b>spring scale</b> stretches in proportion to the force, so on the Moon, where gravity is a sixth as strong, a 6 kg bag of rice reads about <b>1 kg</b>. The rice hasn't changed.</p>
    <p>A <b>pan balance</b> is cleverer. It compares the bag with known masses. Gravity pulls both sides equally, so it cancels, and the balance reads 6 kg on Earth <b>and</b> on the Moon. But on the <b>International Space Station</b> it fails too: everything there is falling round the Earth together, so nothing presses on either pan.</p>
    <p>So how do astronauts track their mass? They use <b>inertia</b> instead of weight. Skylab's crews in 1973 sat in a chair on springs and let it <b>wobble</b>: a heavier person swings more slowly, with period <b>T = 2π √(m ÷ k)</b>. That is an <b>inertial balance</b>, and it works anywhere.</p>
    <p>On the ISS today, the <b>SLAMMD</b> uses Newton's second law directly. Springs pull the astronaut's arm-rest with a known, steady force, a sensor times how fast they speed up, and the computer works out <b>m = F ÷ a</b> to within about 0.2 kg.</p>
    <p class="tip"><b>Try it:</b> put the same bag on both scales, then fly them to the Moon and the ISS. Change the astronaut's mass on the wobble chair and watch the period. Then run SLAMMD and compare its answer with the true mass.</p>`,
  terms: [
    { t: 'Spring scale', d: 'Measures a force by how far a spring stretches. It really measures weight.' },
    { t: 'Pan balance', d: 'Compares an unknown mass with known masses. Gravity cancels, so it measures mass, as long as there is some gravity.' },
    { t: 'Inertial balance', d: 'A mass on springs that wobbles. The period T = 2π √(m ÷ k) depends only on mass, not gravity.' },
    { t: 'Free fall', d: 'Falling with nothing holding you up. Everything falls together, so nothing feels weight.' },
    { t: 'SLAMMD', d: 'The ISS’s mass-measuring device: known spring force, measured acceleration, m = F ÷ a.' },
  ],
  defaults: { focus: 'scales', place: 'earth', m: 6, ma: 70 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'scales', label: 'Two scales' }, { v: 'wobble', label: 'Wobble chair' }, { v: 'slammd', label: 'SLAMMD' }] },
    { key: 'place', type: 'seg', label: 'Scales: where', options: [{ v: 'earth', label: 'Earth' }, { v: 'moon', label: 'Moon' }, { v: 'iss', label: 'ISS' }] },
    { key: 'm', type: 'range', label: 'Scales: bag of rice', min: 1, max: 10, step: 1, ends: ['1 kg', '10 kg'], fmt: (v) => `${v} kg` },
    { key: 'ma', type: 'range', label: 'Astronaut’s mass', min: 45, max: 105, step: 1, ends: ['45 kg', '105 kg'], fmt: (v) => `${v} kg` },
    { key: 'go', type: 'buttons', label: 'SLAMMD', items: [{ label: '▶ Measure me', act: (s, inst) => { s.focus = 'slammd'; inst.go(); } }] },
  ],
  onChange(s, key) {
    if (key === 'place' || key === 'm') s.focus = 'scales';
    if (key === 'ma' && s.focus === 'scales') s.focus = 'wobble';
  },
  quiz: [
    { q: 'A 6 kg bag goes to the Moon, where gravity is about a sixth of Earth’s. What does a kitchen spring scale show?', options: ['6 kg', 'About 1 kg', '36 kg', 'Zero'], answer: 1, why: 'A spring scale measures the pull of gravity. On the Moon that pull is about a sixth, so it shows about 1 kg. The mass is still 6 kg.' },
    { q: 'Why can’t astronauts on the ISS use bathroom scales?', options: ['There is no gravity at all up there', 'They and the scales are falling around the Earth together, so nothing presses on the scales', 'The scales freeze', 'Their mass is zero in space'], answer: 1, why: 'Gravity at the ISS is still about 90% of the surface value, but everything is in free fall together, so no weight is felt or measured.' },
    { q: 'On a wobble chair, a heavier astronaut swings…', options: ['faster', 'more slowly', 'at the same rate', 'only on Earth'], answer: 1, why: 'More mass means more inertia, so the springs take longer to swing it back and forth: T = 2π √(m ÷ k).' },
  ],
  reel: [
    { ms: 5000, caption: 'On the Moon a spring scale reads a sixth. A balance still reads true: mass hasn’t changed.', set: { focus: 'scales', place: 'moon', m: 6 }, view: { pos: [0, 1.4, 3.3], target: [0, 1.5, 0] }, spin: 0 },
    { ms: 5400, caption: 'In orbit, astronauts weigh themselves by wobbling: a heavier body swings more slowly.', set: { focus: 'wobble', ma: 60 }, anim: { ma: [60, 100] }, view: REEL.wobble, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gS = new THREE.Group(), gW = new THREE.Group(), gL = new THREE.Group(); root.add(gS, gW, gL);
    gW.position.x = WX; gL.position.x = SX;
    const steel = M.metal(0xc9ced8), dark = M.matte(0x3a3f4b), brass = M.metal(0xc9a24a, { roughness: 0.35 });
    const rice = (h) => { const b = box(0.2, h, 0.14, M.matte(0xe8dcc0)); b.castShadow = true; return b; };

    // ------------------------------------------------ pan balance (left) and spring scale (right)
    const table = box(2.6, 0.05, 0.8, M.matte(0x8a5a3a)); table.position.set(0, 0.5, 0); gS.add(table);
    const post = beam([-0.7, 0.52, 0], [-0.7, 1.2, 0], 0.025, steel); gS.add(post);
    const beamG = new THREE.Group(); beamG.position.set(-0.7, 1.2, 0); gS.add(beamG);
    beamG.add(beam([-0.45, 0, 0], [0.45, 0, 0], 0.015, steel));
    const pointer = beam([0, 0, 0], [0, -0.3, 0], 0.006, M.glow(0xffb547)); beamG.add(pointer);
    const pans = [-0.45, 0.45].map((x) => {
      const p = new THREE.Group(); gS.add(p);
      const pan = disc(0.16, 0.012, steel); p.add(pan);
      for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU; p.add(beam([Math.cos(a) * 0.15, 0, Math.sin(a) * 0.15], [0, 0.35, 0], 0.003, steel)); }
      p.userData.x = x; return p;
    });
    const bagL = rice(0.1); pans[0].add(bagL);
    const weights = []; for (let i = 0; i < 10; i++) { const w = disc(0.05, 0.03, brass, 20); w.position.set(((i % 3) - 1) * 0.1, 0.02 + Math.floor(i / 3) * 0.032, 0); pans[1].add(w); weights.push(w); }
    const lBal = stage.label('', [-0.7, 1.55, 0], gS, 'hot');
    // Spring scale hanging from a gallows.
    gS.add(beam([0.9, 0.52, -0.2], [0.9, 1.85, -0.2], 0.02, steel), beam([0.9, 1.85, -0.2], [0.9, 1.85, 0], 0.02, steel));
    const scaleBody = box(0.12, 0.3, 0.06, M.plastic(0xf2f4f7)); scaleBody.position.set(0.9, 1.65, 0); gS.add(scaleBody);
    const sprG = new THREE.Group(); sprG.position.set(0.9, 1.5, 0); gS.add(sprG);
    // spring() builds along +X; turn it to hang straight down from the scale body.
    const spr = spring(0, 1, 0.04, 0.006, 12, steel); spr.geometry.rotateZ(-Math.PI / 2); sprG.add(spr);
    const hook = new THREE.Group(); gS.add(hook);
    hook.add(beam([0, 0, 0], [0, -0.06, 0], 0.005, steel));
    const bagR = rice(0.1); hook.add(bagR);
    const dialTex = canvasTexture(256, 96, (c, w, h, t = '') => { c.fillStyle = '#0d0f14'; c.fillRect(0, 0, w, h); c.fillStyle = '#7be08c'; c.font = 'bold 54px monospace'; c.fillText(t, (w - c.measureText(t).width) / 2, 68); });
    const dial = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.041), new THREE.MeshBasicMaterial({ map: dialTex.tex, toneMapped: false })); dial.position.set(0.9, 1.7, 0.031); gS.add(dial);
    const lSpr = stage.label('', [0.9, 2.05, 0], gS, 'hot');

    // ------------------------------------------------ Skylab wobble chair
    const frame = box(0.12, 1.3, 0.6, dark); frame.position.set(-0.9, 0.65, 0); gW.add(frame);
    const frame2 = frame.clone(); frame2.position.x = 0.9; gW.add(frame2);
    const rail = box(1.9, 0.05, 0.05, steel); rail.position.set(0, 0.9, -0.25); gW.add(rail);
    const chair = new THREE.Group(); gW.add(chair);
    const seat = box(0.45, 0.06, 0.45, M.plastic(0x2f5f9e)); seat.position.y = 0.8; chair.add(seat);
    const back = box(0.06, 0.6, 0.45, M.plastic(0x2f5f9e)); back.position.set(-0.22, 1.1, 0); chair.add(back);
    const astro = makePerson({ shirt: 0xf2f4f7, pants: 0x2f6fd8 }); astro.position.set(-0.08, 0.83 - 0.92, 0); astro.pose({ sit: Math.PI / 2, arm: 0.9 }); chair.add(astro);
    const sprL = new THREE.Group(), sprR = new THREE.Group(); gW.add(sprL, sprR);
    const mkS = () => spring(0, 1, 0.05, 0.008, 8, steel);
    const sL = mkS(), sR = mkS(); sprL.add(sL); sprR.add(sR);
    const lW = stage.label('', [0, 2.0, 0], gW, 'hot');

    // ------------------------------------------------ SLAMMD in an ISS module
    // A slice of the station: a back wall of equipment racks with a handrail.
    const wallM = M.plastic(0xe6e9ee, { roughness: 0.6 });
    for (let i = 0; i < 4; i++) { const r = box(0.78, 2.0, 0.1, wallM); r.position.set(-1.2 + i * 0.8, 1.0, -0.9); gL.add(r); const d = box(0.6, 0.3, 0.02, M.matte(0x9aa3b2)); d.position.set(-1.2 + i * 0.8, 1.3 - (i % 2) * 0.5, -0.84); gL.add(d); }
    gL.add(beam([-1.6, 1.7, -0.78], [1.6, 1.7, -0.78], 0.02, M.plastic(0xffb547)));
    const wallBox = box(0.3, 0.5, 0.5, M.plastic(0xc9ced8)); wallBox.position.set(-1.15, 0.55, 0); gL.add(wallBox);
    const track = box(1.4, 0.03, 0.08, steel); track.position.set(-0.3, 0.55, 0); gL.add(track);
    const arm = new THREE.Group(); gL.add(arm);
    arm.add(beam([0, 0, 0], [0, 0.4, 0], 0.03, steel));
    const pad = box(0.06, 0.5, 0.36, M.plastic(0x2f5f9e)); pad.position.set(-0.2, 0.7, 0); arm.add(pad);
    const seatS = box(0.36, 0.05, 0.36, M.plastic(0x2f5f9e)); seatS.position.set(0, 0.42, 0); arm.add(seatS);
    const astro2 = makePerson({ shirt: 0x3a3f4b, pants: 0x2f6fd8 }); astro2.position.set(-0.05, 0.45 - 0.92, 0); astro2.pose({ arm: 1.1, sit: Math.PI / 2 }); arm.add(astro2);
    const pullA = force(0xffb547, 0.03, 0.14); gL.add(pullA);
    const lSL = stage.label('', [0, 2.2, 0], gL, 'hot');

    // ------------------------------------------------ board
    let cur = {};
    const chart = board(root, 2.0, 2.06, 640, 660, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur.focus) return;
      if (cur.focus === 'scales') {
        title(g, `A ${cur.m} kg bag, three places`, 'what each scale shows');
        const A = axes(g, w, h, { x0: 90, y0: h - 110, y1: 84, xMax: 3, yMax: 10, xTicks: [], yTicks: [0, 2, 4, 6, 8, 10], yFmt: (q) => q + ' kg' });
        ['earth', 'moon', 'iss'].forEach((p, i) => {
          const gg = PLACES[p].g, bal = gg > 0 ? cur.m : 0, spr = (cur.m * gg) / G, x0 = A.X(i + 0.18), bw = (A.X(1) - A.X(0)) * 0.3;
          g.fillStyle = p === cur.place ? '#8ef0ff' : 'rgba(142,240,255,.4)'; g.fillRect(x0, A.Y(bal), bw, A.y0 - A.Y(bal));
          g.fillStyle = p === cur.place ? '#ffb547' : 'rgba(255,181,71,.4)'; g.fillRect(x0 + bw + 6, A.Y(spr), bw, A.y0 - A.Y(spr));
          g.fillStyle = 'rgba(255,255,255,.8)'; g.font = 'bold 19px sans-serif'; const n = PLACES[p].name.replace('the ', ''); g.fillText(n, x0 + bw - g.measureText(n).width / 2, A.y0 + 30);
          if (gg === 0) { g.fillStyle = COL.warn; g.font = '17px sans-serif'; g.fillText('both 0', x0 + 10, A.y0 - 12); }
        });
        tag(g, '■ balance', 30, h - 40, COL.s, 'bold 19px sans-serif'); tag(g, '■ spring scale', 180, h - 40, COL.a, 'bold 19px sans-serif');
        tag(g, `true mass: ${cur.m} kg everywhere`, 360, h - 40, 'rgba(255,255,255,.7)', '18px sans-serif');
      } else if (cur.focus === 'wobble') {
        title(g, 'Period of the wobble chair', 'T = 2π √((m + chair) ÷ k), Skylab: k = 606 N/m');
        const A = axes(g, w, h, { x0: 100, y0: h - 100, y1: 84, xMin: 0, xMax: 120, yMax: 3, xTicks: [0, 20, 40, 60, 80, 100, 120], yTicks: [0, 1, 2, 3], xFmt: (q) => q + '', yFmt: (q) => q + ' s', xLabel: 'astronaut mass, kg' });
        const pts = []; for (let m = 0; m <= 120; m += 2) pts.push([m, periodOf(m)]);
        line(g, pts, A.X, A.Y, COL.s, 5);
        dot(g, A.X(cur.ma), A.Y(periodOf(cur.ma)), COL.a, 11);
        tag(g, 'empty chair: 0.848 s', A.X(0) + 12, A.Y(BMMD.T0) + 30, COL.dim, '17px sans-serif');
      } else {
        title(g, 'SLAMMD: the arm’s run', 'distance vs time; a = 2 d ÷ t², then m = F ÷ a');
        const tMax = Math.sqrt((2 * SL.d * 110) / SL.F);
        const A = axes(g, w, h, { x0: 100, y0: h - 100, y1: 84, xMax: 2, yMax: 0.3, xTicks: [0, 0.5, 1, 1.5, 2], yTicks: [0, 0.1, 0.2, 0.3], xFmt: (q) => q + ' s', yFmt: (q) => q * 100 + ' cm', xLabel: 'time' });
        for (const m of [50, 100]) { const a = SL.F / m, pts = []; for (let k = 0; k <= 60; k++) { const t = (k / 60) * Math.sqrt((2 * SL.d) / a); pts.push([t, 0.5 * a * t * t]); } line(g, pts, A.X, A.Y, 'rgba(255,255,255,.25)', 3, [8, 8]); const tt = Math.sqrt((2 * SL.d) / a); tag(g, `${m} kg`, A.X(tt) - 30, A.Y(0.3) - 8, COL.dim, '17px sans-serif'); }
        const a = SL.F / cur.ma, T = Math.sqrt((2 * SL.d) / a), pts = [];
        for (let k = 0; k <= 60; k++) { const t = (k / 60) * Math.min(cur.t, T); pts.push([t, 0.5 * a * t * t]); }
        line(g, pts, A.X, A.Y, COL.a, 5); const tn = Math.min(cur.t, T); dot(g, A.X(tn), A.Y(0.5 * a * tn * tn), COL.a, 10);
        void tMax;
      }
    }, [0, 0, 0]);
    const BOARD = { scales: [2.05, 1.25, -0.5, 0.82], wobble: [WX + 2.1, 1.2, -0.6, 0.85], slammd: [SX + 1.95, 1.25, -0.6, 0.8] };

    const st = {};
    let tW = 0, t = 0, running = false, lastCk = '', tilt = 0;
    const inst = {
      go() { t = 0; running = true; },
      update(dt, s) {
        dt = Math.max(0, dt);
        if (focusView(stage, st, s.focus, VIEWS) && s.focus === 'slammd' && !inReel()) inst.go();
        fitNarrow(stage, []);
        const f = s.focus, reel = inReel();
        gS.visible = f === 'scales'; gW.visible = f === 'wobble'; gL.visible = f === 'slammd';
        const B = BOARD[f];
        chart.mesh.position.set(...(reel ? (f === 'scales' ? [0, 2.85, -0.5] : [WX, 3.2, -0.6]) : B.slice(0, 3)));
        chart.mesh.scale.setScalar(reel ? 0.95 : B[3]);
        let ck = f;
        if (f === 'scales') {
          const P = PLACES[s.place], gg = P.g, iss = gg === 0;
          stage.floor.visible = !iss;
          // Balance: level on Earth and Moon; on the ISS it drifts, nothing pressing on the pans.
          tW += dt; tilt = iss ? Math.sin(tW * 0.7) * 0.12 : 0;
          beamG.rotation.z = tilt;
          pans.forEach((p, i) => { const x = p.userData.x; p.position.set(-0.7 + x * Math.cos(tilt), 1.2 + x * Math.sin(tilt) - 0.35, 0); });
          const h = 0.05 + s.m * 0.012; bagL.scale.y = h / 0.1; bagL.position.y = 0.006 + h / 2 + (iss ? 0.04 + Math.sin(tW) * 0.02 : 0);
          weights.forEach((wgt, i) => { wgt.visible = i < s.m; wgt.position.y = 0.02 + Math.floor(i / 3) * 0.032 + (iss ? 0.03 + Math.sin(tW + i) * 0.015 : 0); });
          // Spring scale: stretch x = m g ÷ k.
          const x = (s.m * gg) / K_SPR;
          sprG.scale.y = 0.05 + x * 0.9; sprG.position.y = 1.5;
          const hookY = 1.5 - (0.05 + x * 0.9);
          hook.position.set(0.9, hookY - (iss ? 0.02 : 0), 0);
          bagR.scale.y = h / 0.1; bagR.position.y = -0.06 - h / 2;
          const read = (s.m * gg) / G;
          dialTex.redraw(`${read.toFixed(1)} kg`);
          lBal.element.innerHTML = iss ? 'balance: nothing to compare' : `balance: <b>${s.m} kg</b>`;
          lSpr.element.innerHTML = `spring: <b>${fmt(read)} kg</b>`;
          lSpr.position.set(0.9, 1.98, 0);
          cur = { focus: f, m: s.m, place: s.place };
          ck += `|${s.m}|${s.place}`;
        } else if (f === 'wobble') {
          stage.floor.visible = true;
          const T = periodOf(s.ma); tW += dt;
          const xo = 0.12 * Math.sin((TAU * tW) / T);
          chair.position.x = xo;
          sprL.position.set(-0.84, 0.8, 0); sprL.scale.x = 0.615 + xo;
          sprR.position.set(0.84, 0.8, 0); sprR.rotation.y = Math.PI; sprR.scale.x = 0.615 - xo;
          astro.scale.setScalar(0.78 + (s.ma - 70) * 0.003);
          lW.element.innerHTML = `period <b>${fmt(T, 3)} s</b> → ${fmt(s.ma, 0)} kg`;
          cur = { focus: f, ma: s.ma }; ck += `|${s.ma}`;
        } else {
          stage.floor.visible = false;
          const a = SL.F / s.ma, T = Math.sqrt((2 * SL.d) / a);
          if (running) { t += dt; if (t > T + 0.8) { t = T + 0.8; running = false; } }
          const tn = Math.min(t, T), x = 0.5 * a * tn * tn;
          arm.position.set(-0.8 + x, 0.55, 0);
          astro2.scale.setScalar(0.85 + (s.ma - 70) * 0.003);
          pullA.aim([-0.8 + x + 0.3, 0.62, 0.25], [1, 0, 0], tn < T ? 0.35 : 0.01);
          lSL.position.set(-0.8 + x, 0.3, 0.5);
          lSL.element.innerHTML = t >= T ? `measured <b>${fmt(SL.F / ((2 * SL.d) / (T * T)), 1)} kg</b>` : `a = ${fmt(a, 3)} m/s²`;
          cur = { focus: f, ma: s.ma, t }; ck += `|${s.ma}|${t.toFixed(2)}`;
        }
        if (ck !== lastCk) { lastCk = ck; chart.redraw(); }
      },
      dispose() { stage.floor.visible = true; },
      readout(s) {
        if (s.focus === 'scales') {
          const P = PLACES[s.place], w = s.m * P.g;
          return `<div class="big">Mass ${s.m} kg · weight ${fmt(w)} N</div>
            <div class="row"><span>Gravity on ${P.name}</span><b>${P.g ? fmt(P.g, 2) + ' m/s²' : 'free fall: 0 felt'}</b></div>
            <div class="row"><span>Balance (compares masses)</span><b>${P.g ? s.m + ' kg' : 'nothing'}</b></div>
            <div class="row"><span>Spring scale (measures m g)</span><b>${fmt((s.m * P.g) / G)} kg</b></div>
            <div class="row"><span>Spring stretch, m g ÷ k</span><b>${fmt(((s.m * P.g) / K_SPR) * 100)} cm</b></div>`;
        }
        if (s.focus === 'wobble') {
          const T = periodOf(s.ma);
          return `<div class="big">m = k T² ÷ 4π² − chair</div>
            <div class="row"><span>Measured period</span><b>${fmt(T, 3)} s</b></div>
            <div class="row"><span>k T² ÷ 4π²</span><b>${fmt(s.ma + M0, 1)} kg</b></div>
            <div class="row"><span>Minus the chair's own ${fmt(M0, 1)} kg</span><b>${fmt(s.ma, 1)} kg</b></div>
            <small>Skylab, 1973: k = 606 N/m, empty chair 0.848 s. Works the same on Earth, the Moon or in orbit.</small>`;
        }
        const a = SL.F / s.ma, T = Math.sqrt((2 * SL.d) / a);
        return `<div class="big">m = F ÷ a = ${fmt(SL.F / a, 1)} kg</div>
          <div class="row"><span>Known spring pull (illustrative)</span><b>${SL.F} N</b></div>
          <div class="row"><span>Time for the 30 cm run</span><b>${fmt(T, 3)} s</b></div>
          <div class="row"><span>Acceleration, 2 d ÷ t²</span><b>${fmt(a, 3)} m/s²</b></div>
          <small>The real SLAMMD reads 43–109 kg to about 0.2 kg.</small>`;
      },
    };
    return inst;
  },
};
