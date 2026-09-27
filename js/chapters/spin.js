// Chapter 3: spinning. For turning, inertia is the moment of inertia I = Σ m r²: the same mass
// is harder to spin up (or stop) the further it sits from the axis. Angular momentum L = I ω stays
// the same unless a twisting force (torque) acts.
// Skater: a 55 kg skater. Body (trunk, head, legs) as a 50 kg cylinder of radius 0.12 m,
//   I = ½ m r² = 0.36 kg·m². Each arm 2.5 kg (about 4.5% of body mass, Winter's anthropometric
//   tables), a uniform rod from the shoulder (0.17 m from the axis) to the fingertips (0.81 m):
//   I = m (r2³ − r1³) ÷ 3 (r2 − r1) ≈ 0.69 kg·m² each. Folded across the chest, each arm sits
//   0.05–0.2 m from the axis, about 0.04 kg·m². So I falls from about 1.7 to about 0.45 kg·m², and
//   ω rises nearly fourfold. Elite spins reach about 5 revolutions a second (the Guinness record
//   is 308 rpm, Natalia Kanounnikova, 2006). Kinetic energy ½ I ω² = L² ÷ 2I rises: the skater's
//   muscles do that work pulling the arms in. Shown 3 times slower.
// Bicycle wheel gyroscope: a 700c wheel (rim radius 0.31 m), 1.5 kg with its tyre, I ≈ 0.1 kg·m²
//   (measured road wheels are about 0.06–0.11 kg·m²). Hung by a string from one end of its axle,
//   d = 0.22 m from the hub. Gravity's torque τ = m g d turns the spin axis round instead of
//   toppling it: precession rate Ω = τ ÷ (I ω). This simple rule holds while Ω is much smaller than
//   ω; below about a third of that the wheel just flops down.
// Flywheel: a four-cylinder engine fires twice per revolution, so the crank torque pulses. Model
//   the surplus torque as A sin 2θ with A = 120 N·m at idle (an illustrative figure of the right
//   size for a 1.2–2 L petrol engine), so the energy swing is ΔE = A = 120 J per half turn.
//   ½ I ω² = ½ I ω0² + (A ÷ 2)(1 − cos 2θ). A car's flywheel, clutch and crank together are about
//   0.1–0.2 kg·m²; a steel disc 3 cm thick with I = 0.15 kg·m² has a radius of about 14 cm.
import { THREE, M, box, beam, torus } from '../kit.js';
import {
  G, TAU, board, panelBg, axes, title, dot, line, tag, COL, ticks, fitNarrow, inReel, focusView,
  force, makeSkater, makeWheel, disc, fmt, clamp, lerp,
} from '../inertia.js';

const WX = 40, FX = 80;
const SK = { mBody: 50, rBody: 0.12, mArm: 2.5, r1: 0.17, r2: 0.81, inArm: 0.044 };
const I_BODY = 0.5 * SK.mBody * SK.rBody ** 2;
const I_OUT = (SK.mArm * (SK.r2 ** 3 - SK.r1 ** 3)) / (3 * (SK.r2 - SK.r1));
export const iSkater = (k) => I_BODY + 2 * lerp(SK.inArm, I_OUT, k);
const WH = { m: 1.5, I: 0.1, d: 0.22, r: 0.34 };
const FW = { A: 120, rho: 7850, t: 0.03 };
const SLOW_SK = 3;
const VIEWS = {
  skater: { pos: [1.2, 2.0, 6.6], target: [1.2, 1.05, 0] },
  wheel: { pos: [WX + 0.6, 1.55, 3.3], target: [WX + 0.6, 0.95, 0] },
  fly: { pos: [FX + 0.45, 1.35, 3.0], target: [FX + 0.45, 0.82, 0] },
};
const REEL = { skater: { pos: [0, 1.6, 3.2], target: [0, 1.75, 0] } };

export default {
  id: 'spin',
  short: 'Spinning',
  title: 'Spinning things have inertia too',
  subtitle: 'A skater’s arms, a bicycle wheel on a string, and the heavy disc behind every car engine.',
  view: VIEWS.skater,
  learn: `<p>Spinning has its own kind of inertia, the <b>moment of inertia</b>, <b>I = Σ m r²</b>, in kg·m². It depends not just on the mass but on <b>how far it sits from the axis</b>: double the distance and the same mass is four times harder to spin up or stop. A spinning thing keeps its <b>angular momentum</b>, <b>L = I × ω</b>, unless something twists it.</p>
    <p>That is the <b>skater's trick</b>. Arms out, she turns slowly. Pull them in and her moment of inertia drops nearly four times, so her spin speeds up nearly four times, to about 5 turns a second. Nobody pushed her: L stayed the same while I shrank. (Her energy does go up. Her arm muscles pay for it, pulling against the spin.)</p>
    <p>A spinning <b>bicycle wheel</b> hung by one end of its axle doesn't fall. Gravity's twist turns the axle slowly sideways instead: <b>precession</b>, at a rate τ ÷ (I ω). The faster it spins, the slower and steadier it turns. It helps a moving bike a little, but the main reason a bike stays up is steering (see CycleClear and Chapter 5).</p>
    <p>A car engine only pushes in bursts: a four-cylinder fires twice every revolution. A heavy <b>flywheel</b> on the crankshaft soaks up each burst and gives it back between them, so the engine turns smoothly instead of jerking (CarClear). A <b>washing machine</b> drum has a big moment of inertia too, which is why it takes a while to spin up and why an unbalanced load makes it shake (WasherClear).</p>
    <p class="tip"><b>Try it:</b> spin the skater and pull her arms in. Hang the wheel and slow its spin until it flops. Then shrink the engine's flywheel at idle and watch the speed ripple.</p>`,
  terms: [
    { t: 'Moment of inertia (I)', d: 'Resistance to changes in spin: I = Σ m r², in kg·m². Mass far from the axis counts much more.' },
    { t: 'Angular velocity (ω)', d: 'How fast something turns, in radians per second. One revolution is 2π radians.' },
    { t: 'Angular momentum (L)', d: 'L = I ω. It stays the same unless a torque acts.' },
    { t: 'Torque', d: 'A twisting force: force × distance from the axis, in newton metres.' },
    { t: 'Precession', d: 'The slow turning of a spinning object’s axis when a torque tries to tip it.' },
    { t: 'Flywheel', d: 'A heavy wheel that stores spin energy and smooths out jerky pushes.' },
  ],
  defaults: { focus: 'skater', arms: 1, w0: 1.3, spin: 5, I: 0.15, rpm: 800 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'skater', label: 'Skater' }, { v: 'wheel', label: 'Wheel on a string' }, { v: 'fly', label: 'Engine flywheel' }] },
    { key: 'arms', type: 'range', label: 'Skater: arms', min: 0, max: 1, step: 0.01, ends: ['pulled in', 'stretched out'], fmt: (v) => `I = ${fmt(iSkater(v), 2)} kg·m²` },
    { key: 'w0', type: 'range', label: 'Skater: spin with arms out', min: 0.5, max: 2, step: 0.1, ends: ['slow', 'fast'], fmt: (v) => `${fmt(v)} turns per second` },
    { key: 'spin', type: 'range', label: 'Wheel: spin', min: 0, max: 10, step: 0.1, ends: ['still', '10 turns/s'], fmt: (v) => `${fmt(v)} turns/s, like riding at ${fmt(v * TAU * WH.r * 3.6, 0)} km/h` },
    { key: 'I', type: 'range', label: 'Engine: flywheel moment of inertia', min: 0.02, max: 0.3, step: 0.01, ends: ['light', 'heavy'], fmt: (v) => `${fmt(v, 2)} kg·m²` },
    { key: 'rpm', type: 'range', label: 'Engine: speed', min: 600, max: 3000, step: 50, ends: ['idle', '3,000 rpm'], fmt: (v) => `${fmt(v, 0)} rpm` },
  ],
  onChange(s, key) {
    if (key === 'arms' || key === 'w0') s.focus = 'skater';
    if (key === 'spin') s.focus = 'wheel';
    if (key === 'I' || key === 'rpm') s.focus = 'fly';
  },
  quiz: [
    { q: 'A skater spinning at 1 turn per second pulls her arms in, cutting her moment of inertia to a quarter. How fast does she spin now?', options: ['1 turn per second', '2 turns per second', '4 turns per second', '16 turns per second'], answer: 2, why: 'Angular momentum L = I ω stays the same. A quarter of the I means four times the ω.' },
    { q: 'Two wheels have the same mass. One has it all in the rim, the other near the hub. Which is harder to spin up?', options: ['The rim-heavy wheel', 'The hub-heavy wheel', 'They are the same', 'Whichever is bigger in diameter'], answer: 0, why: 'Moment of inertia is Σ m r²: mass far from the axis counts much more. That is why light rims make a bike feel quicker.' },
    { q: 'Why does a car engine have a heavy flywheel?', options: ['To make the car heavier and safer', 'To store energy between the cylinders’ power strokes so the crankshaft turns smoothly', 'To cool the engine', 'To stop the car rolling backwards'], answer: 1, why: 'Each cylinder pushes only in short bursts. The flywheel’s rotational inertia soaks up each burst and releases it, smoothing out the speed.' },
  ],
  reel: [
    { ms: 5800, caption: 'Pull the arms in and a skater spins nearly four times faster: L = I ω stays the same.', set: { focus: 'skater', w0: 1.3 }, anim: { arms: [1, 0] }, view: REEL.skater, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gS = new THREE.Group(), gW = new THREE.Group(), gF = new THREE.Group(); root.add(gS, gW, gF);
    gW.position.x = WX; gF.position.x = FX;

    // ------------------------------------------------ skater on ice
    const ice = disc(1.3, 0.02, M.plastic(0x9fc4dc, { roughness: 0.08, metalness: 0.2 }), 64); ice.position.y = 0.01; gS.add(ice);
    const skater = makeSkater(); gS.add(skater);
    const trail = torus(0.81, 0.008, M.glow(0xc49bff, { transparent: true, opacity: 0.5 }), 64); trail.rotation.x = Math.PI / 2; trail.position.y = 1.42; gS.add(trail);
    const lSk = stage.label('', [0, 0.05, 1.5], gS, 'hot');

    // ------------------------------------------------ bicycle wheel on a string
    const steel = M.metal(0x8c95a3);
    const base = box(0.6, 0.04, 0.6, M.matte(0x3a3f4b)); base.position.y = 0.02; gW.add(base);
    gW.add(beam([0, 0, 0], [0, 1.35, 0], 0.02, steel));
    const cord = beam([0, 1.35, 0], [0, 1.0, 0], 0.004, M.matte(0xf2f4f7)); gW.add(cord);
    const hub0 = new THREE.Group(); hub0.position.set(0, 1.0, 0); gW.add(hub0);           // precesses about y
    const tilt = new THREE.Group(); hub0.add(tilt);                                         // droops about z
    const axleG = new THREE.Group(); axleG.position.x = WH.d; axleG.rotation.y = Math.PI / 2; tilt.add(axleG);
    const wheel = makeWheel(); axleG.add(wheel);
    const tq = force(0xffb547, 0.015, 0.08), lw = force(0x7be08c, 0.015, 0.08); tilt.add(tq, lw);
    const lWh = stage.label('', [0.2, 0.08, 0.45], gW, 'hot');

    // ------------------------------------------------ engine and flywheel
    const block = box(0.5, 0.42, 0.36, M.metal(0x6b7280, { roughness: 0.5 })); block.position.set(-0.3, 0.6, 0); gF.add(block);
    const head = box(0.52, 0.12, 0.3, M.metal(0x9aa3b2, { roughness: 0.4 })); head.position.set(-0.3, 0.87, 0); gF.add(head);
    const crank = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 16), steel); crank.rotation.z = Math.PI / 2; crank.position.set(0.05, 0.5, 0); gF.add(crank);
    const flyG = new THREE.Group(); flyG.position.set(0.12, 0.5, 0); gF.add(flyG);
    const fly = disc(1, FW.t, M.metal(0xb9bec8, { roughness: 0.3 }), 64); fly.rotation.z = Math.PI / 2; flyG.add(fly);
    const ring = torus(1, 0.012, M.metal(0x8c95a3), 96); ring.rotation.y = Math.PI / 2; flyG.add(ring);
    const mark = box(0.03, 0.04, 0.02, M.glow(0xffb547)); flyG.add(mark);
    const floorF = box(1.4, 0.06, 0.8, M.matte(0x3a3f4b)); floorF.position.set(-0.1, 0.25, 0); gF.add(floorF);
    const lF = stage.label('', [0.12, 0.95, 0], gF, 'hot');

    // ------------------------------------------------ board
    let cur = {};
    const chart = board(root, 2.0, 2.06, 640, 660, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur.focus) return;
      if (cur.focus === 'skater') {
        const L = iSkater(1) * cur.w0 * TAU;
        title(g, 'Spin speed as the arms come in', 'L = I ω stays the same, so ω = L ÷ I');
        const pts = []; for (let k = 0; k <= 100; k++) { const I = iSkater(k / 100); pts.push([I, L / I / TAU]); }
        const yMax = ticks(0, L / iSkater(0) / TAU, 4);
        const A = axes(g, w, h, { x0: 100, y0: h - 100, y1: 84, xMin: 0.3, xMax: 1.9, yMax: yMax.hi, xTicks: [0.4, 0.8, 1.2, 1.6], yTicks: yMax.list, xFmt: (q) => q.toFixed(1), yFmt: (q) => q + '', xLabel: 'moment of inertia, kg·m²', yLabel: 'turns per second' });
        line(g, pts, A.X, A.Y, COL.soft, 5);
        const I = iSkater(cur.arms); dot(g, A.X(I), A.Y(L / I / TAU), COL.a, 11);
        tag(g, 'arms in', A.X(iSkater(0)) + 12, A.Y(L / iSkater(0) / TAU) + 6, COL.dim, '18px sans-serif');
        tag(g, 'arms out', A.X(iSkater(1)) - 80, A.Y(L / iSkater(1) / TAU) - 18, COL.dim, '18px sans-serif');
      } else if (cur.focus === 'wheel') {
        title(g, 'How fast the axle swings round', 'precession period = 2π I ω ÷ (m g d)');
        const tau = WH.m * G * WH.d;
        const A = axes(g, w, h, { x0: 100, y0: h - 100, y1: 84, xMax: 10, yMax: 15, xTicks: [0, 2, 4, 6, 8, 10], yTicks: [0, 5, 10, 15], xFmt: (q) => q + '', yFmt: (q) => q + ' s', xLabel: 'wheel spin, turns per second', yLabel: 'one swing round takes' });
        const pts = []; for (let k = 1; k <= 100; k++) { const n = k / 10, P = (TAU * WH.I * n * TAU) / tau; pts.push([n, Math.min(15, P)]); }
        const nMin = Math.sqrt(3 * tau / WH.I) / TAU;
        g.fillStyle = 'rgba(255,122,89,.2)'; g.fillRect(A.X(0), A.y1, A.X(nMin) - A.X(0), A.y0 - A.y1);
        tag(g, 'flops', A.X(0) + 8, A.y1 + 26, COL.warn, 'bold 18px sans-serif');
        line(g, pts.filter((p) => p[0] >= nMin), A.X, A.Y, COL.s, 5);
        if (cur.spin >= nMin) dot(g, A.X(cur.spin), A.Y(Math.min(15, (TAU * WH.I * cur.spin * TAU) / tau)), COL.a, 11);
      } else {
        const { I, rpm } = cur, w0 = (rpm / 60) * TAU;
        title(g, 'Engine speed through two turns', `four cylinders, two power strokes per turn, I = ${fmt(I, 2)} kg·m²`);
        const pts = []; let lo = 1e9, hi = 0;
        for (let k = 0; k <= 240; k++) { const th = (k / 240) * 2 * TAU, om = Math.sqrt(w0 * w0 + (FW.A / I) * (1 - Math.cos(2 * th))); const r = (om / TAU) * 60; pts.push([(th * 180) / Math.PI, r]); lo = Math.min(lo, r); hi = Math.max(hi, r); }
        const mean = (lo + hi) / 2, span = Math.max(rpm * 0.6, (hi - lo) * 1.3);
        const yl = ticks(mean - span / 2, mean + span / 2, 4);
        const A = axes(g, w, h, { x0: 110, y0: h - 100, y1: 84, xMax: 720, yMin: yl.lo, yMax: yl.hi, xTicks: [0, 180, 360, 540, 720], yTicks: yl.list, xFmt: (q) => q + '°', yFmt: (q) => fmt(q, 0), xLabel: 'crank angle', yLabel: 'rpm' });
        g.fillStyle = 'rgba(255,181,71,.15)'; g.fillRect(A.x0, A.Y(hi), A.x1 - A.x0, A.Y(lo) - A.Y(hi));
        line(g, pts, A.X, A.Y, COL.a, 5);
        dot(g, A.X(cur.th % 720), A.Y(cur.r), COL.s, 9);
        tag(g, `swing ${fmt(hi - lo, 0)} rpm (${fmt(((hi - lo) / mean) * 100, 0)}%)`, A.x0 + 12, A.y1 + 24, COL.a, 'bold 19px sans-serif');
      }
    }, [0, 0, 0]);
    const BOARD = { skater: [2.9, 1.25, -0.5, 1.15], wheel: [WX + 1.7, 1.0, -0.6, 0.72], fly: [FX + 1.55, 0.85, -0.5, 0.6] };

    const st = {};
    let ang = 0, prec = -0.9, th = 0, droop = 0, lastCk = '';
    return {
      update(dt, s) {
        dt = Math.max(0, dt);
        focusView(stage, st, s.focus, VIEWS);
        fitNarrow(stage, []);
        const f = s.focus;
        gS.visible = f === 'skater'; gW.visible = f === 'wheel'; gF.visible = f === 'fly';
        const reel = inReel(), B = BOARD[f];
        chart.mesh.position.set(...(reel && f === 'skater' ? [0, 3.2, -0.5] : B.slice(0, 3)));
        chart.mesh.scale.setScalar(reel && f === 'skater' ? 1.0 : B[3]);
        let ck = f;
        if (f === 'skater') {
          const I = iSkater(s.arms), L = iSkater(1) * s.w0 * TAU, om = L / I;
          ang += (om / SLOW_SK) * dt; skater.rotation.y = ang; skater.setArms(s.arms);
          trail.scale.setScalar(lerp(0.25, 1, s.arms)); trail.position.y = lerp(1.3, 1.42, s.arms);
          lSk.element.innerHTML = `<b>${fmt(om / TAU, 1)} turns/s</b> · shown ${SLOW_SK}× slower`;
          cur = { focus: f, arms: s.arms, w0: s.w0 };
          ck += `|${s.arms.toFixed(2)}|${s.w0}`;
        } else if (f === 'wheel') {
          const om = s.spin * TAU, tau = WH.m * G * WH.d, OM = om > 0.01 ? tau / (WH.I * om) : 99;
          const flops = OM > om / 3;
          droop = flops ? Math.min(1.35, droop + dt * 1.8) : Math.max(0, droop - dt * 1.8);
          if (!flops) prec += OM * dt;
          hub0.rotation.y = prec; tilt.rotation.z = -droop;
          wheel.rotation.z -= Math.min(om, 25) * dt;
          tq.aim([WH.d, 0, 0], [0, -1, 0], 0.35); lw.aim([WH.d + 0.05, 0, 0], [1, 0, 0], clamp(s.spin * 0.05, 0.02, 0.5));
          lWh.element.innerHTML = flops ? 'too slow: it flops down' : `swings round every <b>${fmt(TAU / OM, 1)} s</b>`;
          cur = { focus: f, spin: s.spin };
          ck += `|${s.spin}`;
        } else {
          const I = s.I, w0 = (s.rpm / 60) * TAU;
          const r = Math.pow((2 * I) / (FW.rho * Math.PI * FW.t), 0.25);
          fly.scale.set(r, 1, r); ring.scale.set(r, r, 1); mark.position.set(0.02, r - 0.03, 0);
          const om = Math.sqrt(w0 * w0 + (FW.A / I) * (1 - Math.cos(2 * th)));
          th += (om / 30) * dt;                                  // shown 30 times slower
          flyG.rotation.x = -th;
          const rpmNow = (om / TAU) * 60;
          lF.position.set(0.12, 0.62 + r + 0.08, 0);
          lF.element.innerHTML = `<b>${fmt(rpmNow, 0)} rpm</b> · shown 30× slower`;
          cur = { focus: f, I, rpm: s.rpm, th: ((th * 180) / Math.PI) % 720, r: rpmNow };
          ck += `|${I}|${s.rpm}|${Math.round(cur.th / 6)}`;
        }
        if (ck !== lastCk) { lastCk = ck; chart.redraw(); }
      },
      readout(s) {
        if (s.focus === 'skater') {
          const I = iSkater(s.arms), L = iSkater(1) * s.w0 * TAU, om = L / I;
          return `<div class="big">ω = L ÷ I = ${fmt(om / TAU, 2)} turns/s</div>
            <div class="row"><span>Moment of inertia, arms ${s.arms > 0.5 ? 'out' : 'in'}</span><b>${fmt(I, 2)} kg·m²</b></div>
            <div class="row"><span>Angular momentum L = I ω (fixed)</span><b>${fmt(L, 1)} kg·m²/s</b></div>
            <div class="row"><span>Spin</span><b>${fmt(om / TAU, 2)} turns/s = ${fmt((om / TAU) * 60, 0)} rpm</b></div>
            <div class="row"><span>Spin energy, ½ I ω²</span><b>${fmt(0.5 * I * om * om, 0)} J</b></div>`;
        }
        if (s.focus === 'wheel') {
          const om = s.spin * TAU, tau = WH.m * G * WH.d, L = WH.I * om, OM = om > 0.01 ? tau / L : Infinity;
          return `<div class="big">Ω = τ ÷ L = ${OM > om / 3 ? 'it falls' : fmt(OM, 2) + ' rad/s'}</div>
            <div class="row"><span>Gravity's twist, m g d</span><b>${fmt(tau, 2)} N·m</b></div>
            <div class="row"><span>Angular momentum, I ω</span><b>${fmt(L, 2)} kg·m²/s</b></div>
            <div class="row"><span>One swing round</span><b>${OM > om / 3 ? '·' : fmt(TAU / OM, 1) + ' s'}</b></div>
            <small>Wheel: 1.5 kg, I = 0.1 kg·m², hung 22 cm from the hub.</small>`;
        }
        const I = s.I, w0 = (s.rpm / 60) * TAU, wHi = Math.sqrt(w0 * w0 + (2 * FW.A) / I), mean = (w0 + wHi) / 2, sw = (wHi - w0) / mean;
        const r = Math.pow((2 * I) / (FW.rho * Math.PI * FW.t), 0.25);
        return `<div class="big">Speed swing ±${fmt((sw / 2) * 100, 1)}%</div>
          <div class="row"><span>Energy of each power pulse</span><b>about ${FW.A} J</b></div>
          <div class="row"><span>Flywheel store, ½ I ω²</span><b>${fmt((0.5 * I * mean * mean) / 1000, 1)} kJ</b></div>
          <div class="row"><span>Steel disc, 3 cm thick</span><b>${fmt(r * 200, 0)} cm across, ${fmt(FW.rho * Math.PI * r * r * FW.t, 1)} kg</b></div>
          <small>${sw > 0.3 ? 'Very rough: the engine would shake and could stall at idle.' : sw > 0.1 ? 'Noticeably lumpy.' : 'Smooth running.'} Faster engines need less flywheel.</small>`;
      },
    };
  },
};
