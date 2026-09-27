// Chapter 2: riding. When a vehicle brakes, everything loose inside it carries on (inertia) until
// a force slows it down too. That force is F = m a, where a is the vehicle's deceleration.
// Bus: a city bus at 40 km/h brakes at a steady a. A standing passenger (60 kg) who holds nothing
//   can only lean against it with their feet: they tip once m a × h > m g × b, i.e. a > g b ÷ h,
//   with the centre of mass h ≈ 1.0 m up and the front of the feet b ≈ 0.13 m ahead of it:
//   about 1.3 m/s². That matches bus-comfort studies, which put the balance limit for standing
//   passengers around 1–1.5 m/s² (de Graaf & van Weperen, Human Factors, 1997).
//   Ordinary bus braking is 1–2 m/s²; an emergency stop can reach 4–6 m/s².
// Lorry: a crate on a flat bed. Friction can hold it back only up to a = μ g (the mass cancels).
//   μ about 0.3 for a wooden pallet on a steel bed, about 0.6 on an anti-slip rubber mat (typical
//   figures in the European load-securing guidelines, EN 12195-1). Rules require load restraint
//   for 0.8 g forwards (US FMCSA 49 CFR 393.102; EN 12195-1 also uses 0.8 g). An unstrapped crate
//   slides forward at (a − μ g) relative to the bed until it hits the headboard.
// Motorcycle: a 150 cc commuter (MotorcycleClear) with a 70 kg rider braking from 50 km/h. The
//   rider's arms, knees and the seat must supply m a to slow their body with the bike.
//   A good commuter bike with a front disc and ABS can brake at about 7–8 m/s² on dry tarmac.
import { THREE, M, box } from '../kit.js';
import {
  G, KMH, board, panelBg, axes, title, dot, line, tag, COL, ticks, fitNarrow, inReel, focusView,
  force, makePerson, makeBus, makeLorry, makeMoto, fmt, clamp,
} from '../inertia.js';

const LX = 60, MX = 120;
const H_COM = 1.0, B_FOOT = 0.13, A_TIP = (G * B_FOOT) / H_COM;          // ≈ 1.3 m/s²
const M_PAS = 60, M_RIDER = 70, V_BUS = 40 / KMH, V_LORRY = 50 / KMH, V_MOTO = 50 / KMH;
const MU = { steel: 0.3, mat: 0.6 };
const HEAD_GAP = 2.2, CRATE_X = -1.4;              // crate front to headboard, m; crate centre on the bed
const CRUISE = 1.2;                                // seconds of steady driving before braking
const VIEWS = {
  bus: { pos: [1.2, 4.6, 16.5], target: [1.2, 3.1, 0] },
  lorry: { pos: [LX + 1.2, 3.6, 13.5], target: [LX + 1.2, 2.3, 0] },
  moto: { pos: [MX + 0.6, 2.0, 6.0], target: [MX + 0.6, 1.45, 0] },
};
const REEL = {
  bus: { pos: [-0.5, 3.4, 9], target: [-0.5, 3.6, 0] },
  lorry: { pos: [LX, 3.2, 8.5], target: [LX, 3.3, 0] },
};

// A plain road that scrolls under a vehicle standing still on screen.
function makeStrip(len = 80) {
  const g = new THREE.Group();
  const road = box(len, 0.06, 6, M.matte(0x2b2f36)); road.position.y = -0.03; g.add(road);
  const dashes = new THREE.Group(); g.add(dashes);
  for (let x = -len / 2; x < len / 2; x += 6) { const d = box(3, 0.01, 0.16, M.matte(0xe8e2c8)); d.position.set(x, 0.005, 2.2); dashes.add(d); }
  g.scroll = (x) => { dashes.position.x = -(((x % 6) + 6) % 6); };
  return g;
}

// Braking run: cruise at v0 for CRUISE s, then decelerate at a to a stop. Returns {v, s} at t.
function brakeRun(v0, a, t) {
  if (t <= CRUISE) return { v: v0, s: v0 * t, tb: 0 };
  const tb = Math.min(t - CRUISE, v0 / a);
  return { v: v0 - a * tb, s: v0 * CRUISE + v0 * tb - 0.5 * a * tb * tb, tb };
}

export default {
  id: 'ride',
  short: 'Riding',
  title: 'When the bus brakes, you don’t',
  subtitle: 'Passengers lurch, loads slide and riders pitch forward. Inertia rides along with you.',
  view: VIEWS.bus,
  learn: `<p>When a bus brakes, the brakes slow the <b>bus</b>. Nothing has touched <b>you</b> yet, so your body carries on at 40 km/h. That is why you lurch forward: you are not thrown, the bus is slowing down <b>under</b> you. To slow down with it, something has to push you back with a force <b>F = m a</b>: your feet, your hand on the rail, or a seat.</p>
    <p>Standing with no hand-hold, your feet can only do so much. Lean more than your feet can support and you tip: that happens once the braking passes about <b>g × (foot length ÷ height of your middle)</b>, roughly <b>1.3 m/s²</b>. Normal bus braking is 1 to 2 m/s², so <b>hold on</b>. At 3 m/s² a 60 kg passenger needs 180 N from their grip, like holding up an 18 kg bag.</p>
    <p>A car's <b>seat belt</b> and <b>airbag</b> exist for the same reason: in a crash the car stops in a tenth of a second and you don't, unless the belt stops you with it (see CarClear and NewtonClear). A <b>motorcycle</b> rider has no belt at all. Braking hard, their arms, knees and seat must hold back the whole body, around 500 N for 70 kg at 7 m/s² (MotorcycleClear).</p>
    <p>Loads on a lorry are the same. <b>Friction</b> can hold a crate only while the braking is below <b>μ g</b>, whatever the crate weighs, because a heavier crate grips harder but also has more inertia. On a bare steel bed that is only about 3 m/s². Brake harder and the crate slides into the cab, so the rules say loads must be <b>strapped</b> to hold <b>0.8 g</b> forwards.</p>
    <p class="tip"><b>Try it:</b> brake the bus gently, then hard, and watch who stays on their feet. Brake the lorry with and without straps, and on a rubber mat. Then stop the motorcycle from 50 km/h.</p>`,
  terms: [
    { t: 'Deceleration', d: 'Slowing down: acceleration pointing backwards, in m/s².' },
    { t: 'Lurch', d: 'The forward stumble when a vehicle brakes. Your body is simply keeping its speed.' },
    { t: 'Load restraint', d: 'Straps, chains and blocks that give a load the force m a it needs to stop with the vehicle.' },
    { t: 'Coefficient of friction (μ)', d: 'How grippy two surfaces are. Friction can hold back at most μ × weight.' },
    { t: '0.8 g rule', d: 'Loads on trucks must be restrained against a forward deceleration of 0.8 g, about 7.8 m/s².' },
  ],
  defaults: { focus: 'bus', a: 3, strap: false, bed: 'steel', mass: 800 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'bus', label: 'City bus' }, { v: 'lorry', label: 'Lorry load' }, { v: 'moto', label: 'Motorcycle' }] },
    { key: 'a', type: 'range', label: 'How hard it brakes', min: 0.5, max: 8, step: 0.1, ends: ['gently', 'emergency'], fmt: (v) => `${fmt(v)} m/s² (${fmt(v / G, 2)} g)` },
    { key: 'go', type: 'buttons', label: 'Drive', items: [{ label: '▶ Drive and brake', act: (s, inst) => inst.go() }] },
    { key: 'strap', type: 'toggle', label: 'Lorry: strap the load down' },
    { key: 'bed', type: 'seg', label: 'Lorry: the crate sits on', options: [{ v: 'steel', label: 'Bare steel, μ 0.3' }, { v: 'mat', label: 'Rubber mat, μ 0.6' }] },
    { key: 'mass', type: 'range', label: 'Lorry: crate mass', min: 200, max: 3000, step: 50, ends: ['200 kg', '3 t'], fmt: (v) => `${fmt(v, 0)} kg` },
  ],
  onChange(s, key) { if (['strap', 'bed', 'mass'].includes(key)) s.focus = 'lorry'; },
  quiz: [
    { q: 'A bus brakes suddenly and a standing passenger lurches forward. What pushed them forward?', options: ['The brakes', 'Nothing: they kept moving while the bus slowed down', 'The air in the bus', 'Gravity'], answer: 1, why: 'No forward force acts on the passenger. By inertia they keep their speed while the bus slows under them.' },
    { q: 'A 60 kg passenger holds a rail while the bus brakes at 2 m/s². How much force must the rail give them?', options: ['30 N', '120 N', '600 N', '1,200 N'], answer: 1, why: 'F = m a = 60 × 2 = 120 N, about the pull you feel holding a 12 kg bag.' },
    { q: 'A crate sits unstrapped on a steel lorry bed (μ = 0.3). Above which braking does it slide, whatever its mass?', options: ['About 0.3 m/s²', 'About 3 m/s²', 'About 30 m/s²', 'It never slides if it is heavy enough'], answer: 1, why: 'Friction can supply at most μ m g, and stopping needs m a. The mass cancels: it slides when a > μ g = 0.3 × 9.81 ≈ 2.9 m/s².' },
  ],
  reel: [
    { ms: 5600, caption: 'The bus brakes, but nothing has touched you yet: you keep going and lurch forward.', set: { focus: 'bus', a: 3.5 }, act: (s, inst) => inst.go(), view: REEL.bus, spin: 0 },
    { ms: 5400, caption: 'Brake at 0.8 g and friction can’t hold an unstrapped crate: it slides into the cab.', set: { focus: 'lorry', a: 7.8, strap: false, bed: 'steel' }, act: (s, inst) => inst.go(), view: REEL.lorry, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gB = new THREE.Group(), gL = new THREE.Group(), gM = new THREE.Group(); root.add(gB, gL, gM);
    gL.position.x = LX; gM.position.x = MX;

    // ------------------------------------------------ bus
    const roadB = makeStrip(); gB.add(roadB);
    const bus = makeBus(); gB.add(bus);
    const holder = makePerson({ shirt: 0x3b6fd8 }), stand = makePerson({ shirt: 0xff7a59, pants: 0x3a3f4b }), sitter = makePerson({ shirt: 0x7be08c, pants: 0x2b3242, skin: 0x8d5a3b });
    holder.position.set(-1.5, bus.floorY, 0.35); stand.position.set(1.2, bus.floorY, 0.35);
    sitter.position.set(-2.62, bus.floorY + 0.51 - 0.92, -0.7);
    gB.add(holder, stand, sitter);
    const pB = force(0xffb547, 0.05, 0.25), gripB = force(0x7be08c, 0.05, 0.25); gB.add(pB, gripB);
    const lHold = stage.label('', [-1.5, 2.9, 0.4], gB), lStand = stage.label('', [1.2, 2.9, 0.4], gB, 'hot');

    // ------------------------------------------------ lorry
    const roadL = makeStrip(); gL.add(roadL);
    const lorry = makeLorry(); gL.add(lorry);
    const crate = new THREE.Group(); gL.add(crate);
    const cBox = box(1.2, 1.1, 1.8, M.matte(0xb88a55)); cBox.position.y = 0.55 + 0.07; crate.add(cBox);
    const pallet = box(1.25, 0.14, 1.9, M.matte(0x8a6a45)); pallet.position.y = 0.07; crate.add(pallet);
    for (const z of [-0.5, 0.5]) { const b = box(1.24, 0.08, 0.1, M.matte(0x7a5a38)); b.position.set(0, 0.9, z * 1.81); crate.add(b); }
    const mat = box(1.5, 0.02, 2.1, M.matte(0x1b1d22)); gL.add(mat);
    const straps = new THREE.Group(); gL.add(straps);
    const strapM = M.plastic(0xff7a59);
    for (const x of [-0.35, 0.35]) { const top = box(0.08, 0.02, 1.84, strapM); top.position.set(x, 1.33, 0); straps.add(top); for (const z of [-0.93, 0.93]) { const side = box(0.08, 1.24, 0.02, strapM); side.position.set(x, 0.72, z); straps.add(side); } }
    const pL = force(0xffb547, 0.06, 0.3), fL = force(0x7be08c, 0.06, 0.3); gL.add(pL, fL);
    const lCrate = stage.label('', [0, 3, 0], gL, 'hot');

    // ------------------------------------------------ motorcycle
    const roadM = makeStrip(40); gM.add(roadM);
    const moto = makeMoto(); gM.add(moto);
    const pM = force(0xffb547, 0.03, 0.15), gM2 = force(0x7be08c, 0.03, 0.15); gM.add(pM, gM2);
    const lMoto = stage.label('', [0, 2.3, 0], gM, 'hot');

    // ------------------------------------------------ the board: force needed vs braking
    let cur = { focus: 'bus', a: 3 };
    const chart = board(root, 2.0, 2.06, 640, 660, (g, w, h) => {
      panelBg(g, w, h);
      const f = cur.focus, a = cur.a;
      const m = f === 'bus' ? M_PAS : f === 'moto' ? M_RIDER : cur.mass;
      const lim = f === 'bus' ? m * A_TIP : f === 'lorry' ? MU[cur.bed] * m * G : null;
      const Fmax = m * 8, fy = ticks(0, Fmax, 4);
      const kN = Fmax > 5000;
      title(g, 'Force needed to stop it with you', `F = m a, for ${fmt(m, 0)} kg`);
      const A = axes(g, w, h, { x0: 110, y0: h - 150, y1: 84, xMax: 8, yMax: fy.hi, xTicks: [0, 2, 4, 6, 8], yTicks: fy.list, xFmt: (q) => q + '', yFmt: (q) => (kN ? fmt(q / 1000, 0) + ' kN' : q + ' N'), xLabel: 'braking, m/s²' });
      if (lim !== null) {
        g.fillStyle = 'rgba(123,224,140,.15)'; g.fillRect(A.x0, A.Y(lim), A.x1 - A.x0, A.y0 - A.Y(lim));
        g.strokeStyle = COL.v; g.lineWidth = 3; g.setLineDash([10, 6]); g.beginPath(); g.moveTo(A.x0, A.Y(lim)); g.lineTo(A.x1, A.Y(lim)); g.stroke(); g.setLineDash([]);
        tag(g, f === 'bus' ? 'feet alone can hold this much' : `friction can hold μ m g = ${fmt(lim / 1000, 1)} kN`, A.x0 + 10, A.Y(lim) - 10, COL.v, 'bold 18px sans-serif');
      }
      if (f === 'lorry') { g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(A.X(0.8 * G), A.y1); g.lineTo(A.X(0.8 * G), A.y0); g.stroke(); tag(g, '0.8 g rule', A.X(0.8 * G) - 100, A.y1 + 20, COL.dim, '17px sans-serif'); }
      line(g, [[0, 0], [8, m * 8]], A.X, A.Y, COL.a, 5);
      const need = m * a, over = lim !== null && need > lim;
      if (over) { g.strokeStyle = COL.warn; g.lineWidth = 6; g.beginPath(); g.moveTo(A.X(a), A.Y(lim)); g.lineTo(A.X(a), A.Y(need)); g.stroke(); }
      dot(g, A.X(a), A.Y(need), over ? COL.warn : COL.a, 11);
      g.font = '19px sans-serif'; g.fillStyle = 'rgba(255,255,255,.8)';
      const say = f === 'bus' ? (over ? `Above ${fmt(A_TIP)} m/s² you must hold on, or you tip.` : 'Gentle enough to stand without holding.')
        : f === 'lorry' ? (cur.strap ? `Straps must add ${fmt(Math.max(0, need - lim) / 1000, 1)} kN; rated for 0.8 g.` : over ? `Red: ${fmt((need - lim) / 1000, 1)} kN nobody provides. It slides.` : 'Friction is enough, for now. A bump can lighten it.')
          : `Arms, knees and seat must push back ${fmt(need, 0)} N.`;
      g.fillText(say, 24, h - 90);
      g.fillStyle = 'rgba(255,255,255,.55)'; g.font = '17px sans-serif';
      g.fillText(f === 'lorry' ? 'Heavier crate: more grip, but more inertia too.' : `That is like holding up ${fmt(need / G, 0)} kg.`, 24, h - 58);
    }, [0, 0, 0]);
    const BOARD = { bus: [5.4, 5.6, -1.6, 2.5], lorry: [LX + 5.3, 4.3, -1.4, 2.1], moto: [MX + 2.3, 1.55, -0.6, 0.85] };

    const st = {};
    let t = 0, running = true, key = '', lastCk = '';
    const inst = {
      go() { t = 0; running = true; },
      update(dt, s) {
        dt = Math.max(0, dt);
        if (focusView(stage, st, s.focus, VIEWS) && !inReel()) inst.go();
        const narrow = fitNarrow(stage, [lHold]);
        const f = s.focus;
        gB.visible = f === 'bus'; gL.visible = f === 'lorry'; gM.visible = f === 'moto';
        const reel = inReel(), B = BOARD[f];
        chart.mesh.position.set(...(reel ? (f === 'bus' ? [-0.5, 7.3, -1.6] : [LX, 6.8, -1.4]) : B.slice(0, 3)));
        chart.mesh.scale.setScalar(reel ? 2.2 : B[3]);
        chart.mesh.visible = reel || !narrow || f === 'moto';          // on a phone the readout already says it
        const k = `${f}|${s.a}|${s.strap}|${s.bed}|${s.mass}`;
        if (k !== key) { if (key && !reel) inst.go(); key = k; }
        const v0 = f === 'bus' ? V_BUS : f === 'lorry' ? V_LORRY : V_MOTO;
        const Tend = CRUISE + v0 / s.a + 1.5;
        if (running) { t += dt; if (t >= Tend) { t = Tend; running = false; } }
        const R = brakeRun(v0, s.a, t), braking = t > CRUISE && R.v > 0.01, aNow = braking ? s.a : 0;
        if (f === 'bus') {
          roadB.scroll(R.s); bus.roll(R.v * dt);
          // Holder: leans a little, grip arm up. Stander: leans until they tip, then stumbles.
          const lean = Math.atan(aNow / G);
          holder.pose({ arm: 2.75, lean: lean * 0.8 });
          const tips = s.a > A_TIP;
          const tb = braking ? R.tb : t > CRUISE ? v0 / s.a : 0;
          const slide = tips ? Math.min(2.2, 0.5 * (s.a - A_TIP) * tb * tb) : 0;
          stand.position.x = 1.2 + slide;
          stand.pose({ arm: braking && tips ? 1.3 : 0.15, lean: tips && braking ? 0.45 : lean * 0.8, stride: tips && braking ? Math.sin(t * 12) * 0.35 : 0 });
          sitter.pose({ arm: 1.0, lean: lean * 0.5, sit: Math.PI / 2 });
          pB.aim([1.2 + slide + 0.2, 1.65, 0.4], [1, 0, 0], aNow ? 0.8 : 0.01);
          gripB.aim([-1.5, 1.65, 0.4], [-1, 0, 0], aNow * 0.25);
          lHold.position.set(-1.5, 2.85, 0.4); lStand.position.set(1.2 + slide, 2.85, 0.4);
          lHold.element.innerHTML = aNow ? `hand on the rail: <b>${fmt(M_PAS * aNow, 0)} N</b>` : 'holding the rail';
          lStand.element.innerHTML = !braking ? (t > CRUISE && tips ? 'stumbled forward' : `${fmt(R.v * KMH, 0)} km/h`) : tips ? 'lurches forward!' : 'leans, stays up';
        } else if (f === 'lorry') {
          roadL.scroll(R.s); lorry.roll(R.v * dt);
          const mu = MU[s.bed], slides = !s.strap && s.a > mu * G;
          const tb = braking ? R.tb : t > CRUISE ? v0 / s.a : 0;
          const rel = slides ? Math.min(HEAD_GAP, 0.5 * (s.a - mu * G) * tb * tb) : 0;
          crate.position.set(CRATE_X + rel, lorry.bedY, 0);
          mat.visible = s.bed === 'mat'; mat.position.set(CRATE_X, lorry.bedY + 0.01, 0);
          straps.visible = s.strap; straps.position.set(CRATE_X, lorry.bedY, 0);
          pL.aim([CRATE_X + 0.7 + rel, lorry.bedY + 0.7, 0], [1, 0, 0], aNow ? 1.0 : 0.01);
          fL.aim([CRATE_X - 0.7 + rel, lorry.bedY + 0.2, 0], [-1, 0, 0], aNow ? Math.min(aNow, mu * G) * 0.2 + (s.strap ? Math.max(0, aNow - mu * G) * 0.2 : 0) : 0.01);
          const hit = rel >= HEAD_GAP - 1e-6;
          lCrate.position.set(CRATE_X + rel, 3.1, 0);
          lCrate.element.innerHTML = hit ? `slammed into the cab at ${fmt(Math.sqrt(2 * (s.a - mu * G) * HEAD_GAP) * KMH, 0)} km/h` : slides && braking ? 'the crate slides forward' : s.strap ? 'strapped: it stops with the lorry' : braking ? 'friction holds it' : `${fmt(R.v * KMH, 0)} km/h`;
        } else {
          roadM.scroll(R.s); moto.roll(R.v * dt);
          moto.rider.rotation.z = -(aNow / G) * 0.45;
          pM.aim([0.1, 1.45, 0.35], [1, 0, 0], aNow ? 0.5 : 0.01);
          gM2.aim([0.35, 1.2, 0.35], [-1, 0.3, 0], aNow * 0.06);
          lMoto.position.set(0, 0.05, 1.3);
          lMoto.element.innerHTML = braking ? `hold back <b>${fmt(M_RIDER * aNow, 0)} N</b>` : t > CRUISE ? `stopped in ${fmt((v0 * v0) / (2 * s.a))} m` : `${fmt(R.v * KMH, 0)} km/h`;
        }
        cur = { focus: f, a: s.a, strap: s.strap, bed: s.bed, mass: s.mass };
        if (k !== lastCk) { lastCk = k; chart.redraw(); }
      },
      readout(s) {
        const f = s.focus, a = s.a;
        if (f === 'bus') return `<div class="big">F = m a = ${fmt(M_PAS * a, 0)} N</div>
          <div class="row"><span>Bus braking from 40 km/h</span><b>${fmt(a)} m/s², stops in ${fmt((V_BUS * V_BUS) / (2 * a))} m</b></div>
          <div class="row"><span>Force to slow a 60 kg passenger</span><b>${fmt(M_PAS * a, 0)} N, ${fmt((a / G) * 100, 0)}% of their weight</b></div>
          <div class="row"><span>Most feet alone can take, g b ÷ h</span><b>${fmt(A_TIP)} m/s²</b></div>
          <small>${a > A_TIP ? 'Too hard to stand unaided: the orange passenger stumbles. Hold the rail.' : 'Gentle braking: a standing passenger can lean into it.'}</small>`;
        if (f === 'lorry') {
          const mu = MU[s.bed], hold = mu * s.mass * G, need = s.mass * a;
          return `<div class="big">${s.strap ? 'Strapped' : need > hold ? 'The load slides' : 'Friction holds it'}</div>
            <div class="row"><span>Needed to stop ${fmt(s.mass, 0)} kg, m a</span><b>${fmt(need / 1000, 2)} kN</b></div>
            <div class="row"><span>Friction can give, μ m g</span><b>${fmt(hold / 1000, 2)} kN (up to ${fmt(mu * G)} m/s²)</b></div>
            <div class="row"><span>Straps for the 0.8 g rule</span><b>${fmt(Math.max(0, s.mass * G * (0.8 - mu)) / 1000, 2)} kN</b></div>
            <small>Friction and inertia both grow with mass, so any crate slides above μ g.</small>`;
        }
        return `<div class="big">F = m a = ${fmt(M_RIDER * a, 0)} N</div>
          <div class="row"><span>Braking from 50 km/h</span><b>${fmt(a)} m/s², stops in ${fmt((V_MOTO * V_MOTO) / (2 * a))} m</b></div>
          <div class="row"><span>Force to slow a 70 kg rider</span><b>${fmt(M_RIDER * a, 0)} N</b></div>
          <div class="row"><span>Like holding up</span><b>${fmt(M_RIDER * a / G, 0)} kg</b></div>
          <small>No seat belt on a bike: arms, knees and footpegs do the job. In a crash, nothing does.</small>`;
      },
    };
    return inst;
  },
};
