// Chapter 1: inertia and mass as a live experiment.
// Carts: two lab dynamics trolleys (1 kg each, plus 1 kg brass blocks) on a low-friction track. The same
//   steady force F pulls each one (think of a force sensor held at a constant reading). Newton's
//   second law gives a = F ÷ m, so mass is measured by how little a given force changes the motion:
//   m = F ÷ a. Friction on a good air track or dynamics track is small and is ignored here. The run
//   stops when the quicker cart has gone 1.6 m and is shown slowed down to about 3 s.
//   Weight = m g with g = 9.81 m/s² (standard gravity 9.80665, rounded).
// Quick pull: the coin-on-a-card trick and the tablecloth trick are the same physics. The card or
//   cloth is yanked at a steady speed v. While it slides under the coin or plate, kinetic friction
//   pushes the object along at a = μ g (never faster than the cloth itself). The cloth is gone after
//   its trailing edge has slipped the distance d under the object. Then the plate slides on the bare
//   table (μ about 0.3, stopping in v² ÷ 2 μ g), or the coin drops 10 cm into the glass.
//   μ coin on card about 0.25, μ plate on smooth cloth about 0.2: typical dry-friction values for
//   paper and smooth fabric, rounded (e.g. Engineering ToolBox friction tables). The object's mass
//   cancels: friction and inertia both grow with it. If the pull is slow, the object catches up
//   with the cloth before it has slipped d, and simply rides along.
import { THREE, M, box } from '../kit.js';
import {
  G, CART_KG, board, panelBg, axes, title, dot, line, tag, COL, ticks, fitNarrow, inReel, focusView,
  force, makeCart, makeGlass, disc, fmt, clamp, sphere,
} from '../inertia.js';

const CX = 50, TX = 100;                         // coin scene and tablecloth scene along X
const COIN_S = 6;                                // the coin scene is drawn 6 times life size
const TRACK = 1.6;                               // metres the quicker cart travels
const PULL = {
  coin: { mu: 0.25, d: 0.045, name: 'coin on a card', slow: 30 },
  cloth: { mu: 0.2, d: 0.35, muT: 0.3, name: 'plate on a tablecloth', slow: 8 },
};
const TABLE = { x0: -0.6, x1: 0.6, y: 0.75 }, PLATE_X = -0.2, GLASS_R = 0.035, COIN_R = 0.012, DROP = 0.1;
const VIEWS = {
  carts: { pos: [1.75, 1.6, 4.9], target: [1.75, 0.62, 0] },
  coin: { pos: [CX + 0.4, 1.2, 2.7], target: [CX + 0.4, 0.62, 0] },
  cloth: { pos: [TX + 0.55, 1.9, 3.6], target: [TX + 0.55, 0.85, 0] },
};
const REEL = {
  carts: { pos: [1.0, 1.35, 1.6], target: [1.0, 1.1, 0] },
  cloth: { pos: [TX + 0.2, 1.6, 1.9], target: [TX + 0.2, 1.5, 0] },
};

// Simulate a quick pull in real seconds. Returns samples [t, xObject, yDrop, xCloth] and the result.
export function quickPull(kind, v) {
  const P = PULL[kind], a = P.mu * G, dt = 0.0005;
  let t = 0, x = 0, vx = 0, xc = 0, y = 0, vy = 0, on = true, slid = 0, carried = false, tOff = null, vOff = 0;
  const pts = [[0, 0, 0, 0]];
  // How far the hand pulls the card or cloth: a short way if the object is riding along, far
  // enough to clear the card from the glass or the cloth from the table if it has slipped out.
  const ride = kind === 'coin' ? 0.06 : 0.6, full = kind === 'coin' ? 0.3 : 1.2;
  for (let i = 0; i < 40000; i++) {
    t += dt;
    const pushLen = on ? ride : full;
    if (xc < pushLen) xc += v * dt;
    const cv = xc < pushLen ? v : 0;
    if (on) {
      if (vx < cv) vx = Math.min(cv, vx + a * dt); else vx = cv;
      x += vx * dt;
      if (xc - x >= P.d) { on = false; tOff = t; vOff = vx; }
      else if (xc >= pushLen) { carried = true; }
    } else if (kind === 'coin') {
      if (y > -DROP) { vy += G * dt; y -= vy * dt; x += vx * dt; } else y = -DROP;
    } else {
      const over = x + PLATE_X > TABLE.x1;
      if (over) { vy += G * dt; y -= vy * dt; x += vx * dt; }
      else if (vx > 0) { vx = Math.max(0, vx - P.muT * G * dt); x += vx * dt; }
    }
    if (i % 10 === 0) pts.push([t, x, y, xc]);
    const still = !on && (kind === 'coin' ? y <= -DROP : (vx <= 0 || y < -0.8));
    if ((still && t > 0.05 && xc >= full) || carried) break;
  }
  pts.push([t, x, y, xc]);
  const fell = kind === 'cloth' ? x + PLATE_X > TABLE.x1 : Math.abs(x) > GLASS_R - COIN_R;
  return { pts, T: t, x, carried, tOff, vOff, fell, slip: tOff === null ? null : P.d };
}
const sampleAt = (run, t) => { let best = run.pts[0]; for (const p of run.pts) { if (p[0] > t) break; best = p; } return best; };

export default {
  id: 'idea',
  short: 'Hard to budge',
  title: 'Inertia: how hard it is to change motion',
  subtitle: 'Push two carts with the same force, flick a card from under a coin, and whip away a tablecloth.',
  view: VIEWS.carts,
  learn: `<p>Everything that has mass is <b>stubborn about its motion</b>. If it is still, it stays still. If it is moving, it keeps going at the same speed in the same straight line. That stubbornness is called <b>inertia</b>, and it is Newton's first law (NewtonClear).</p>
    <p><b>Mass</b> is the measure of inertia. Its SI unit is the <b>kilogram</b> (kg). Give two carts the <b>same push</b> and the one with twice the mass gains speed half as fast: <b>a = F ÷ m</b>. Turn that round and you have a way to measure mass without gravity at all: <b>m = F ÷ a</b>. A 2 kg cart pulled with 4 N speeds up at 2 m/s²; a 1 kg cart at 4 m/s².</p>
    <p>Mass is <b>not weight</b>. Weight is the pull of gravity on a mass, <b>W = m g</b>, in newtons: about 9.8 N for every kilogram on Earth, only 1.6 N on the Moon. Your mass, and your inertia, are the same everywhere (see Chapter 4).</p>
    <p>Inertia is behind two party tricks. Flick a card out from under a coin and the coin <b>drops into the glass</b>. Whip a smooth cloth off a table and the plates <b>stay put</b>. Friction does drag the object, but only for a split second, and its inertia means it hardly gets going. <b>Speed is the secret</b>, not the plate's weight: heavier plates feel more friction, but also have more inertia, and the two cancel.</p>
    <p class="tip"><b>Try it:</b> load one cart with more blocks and pull both with the same force. Then flick the card fast and slow, and pull the tablecloth at 1 m/s and at 3 m/s.</p>`,
  terms: [
    { t: 'Inertia', d: 'The tendency of every object to keep doing what it is doing: stay still, or keep moving in a straight line at a steady speed.' },
    { t: 'Mass', d: 'How much inertia an object has, in kilograms. It is measured by how little a given force changes its motion: m = F ÷ a.' },
    { t: 'Kilogram (kg)', d: 'The SI unit of mass. Since 2019 it has been defined through the Planck constant, not a metal cylinder.' },
    { t: 'Weight', d: 'The force of gravity on a mass: W = m g, in newtons. It changes from planet to planet; mass does not.' },
    { t: 'Friction', d: 'The grip between two surfaces. It is what slows things down, not some natural urge to stop.' },
  ],
  defaults: { focus: 'carts', F: 4, mA: 0, mB: 3, v: 3 },
  controls: [
    { key: 'focus', type: 'seg', label: 'Look at', options: [{ v: 'carts', label: 'Two carts' }, { v: 'coin', label: 'Coin and card' }, { v: 'cloth', label: 'Tablecloth' }] },
    { key: 'F', type: 'range', label: 'Carts: the same pull on each', min: 1, max: 10, step: 0.5, ends: ['1 N', '10 N'], fmt: (v) => `${fmt(v)} N` },
    { key: 'mA', type: 'range', label: 'Blue cart: extra blocks', min: 0, max: 8, step: 1, ends: ['none', '8 kg'], fmt: (v) => `${fmt(v + CART_KG)} kg in all` },
    { key: 'mB', type: 'range', label: 'Orange cart: extra blocks', min: 0, max: 8, step: 1, ends: ['none', '8 kg'], fmt: (v) => `${fmt(v + CART_KG)} kg in all` },
    { key: 'go', type: 'buttons', label: 'Carts', items: [{ label: '▶ Pull both again', act: (s, inst) => { s.focus = 'carts'; inst.go(); } }, { label: '1 kg vs 2 kg', act: (s, inst) => { Object.assign(s, { focus: 'carts', F: 4, mA: 0, mB: 1 }); inst.go(); } }] },
    { key: 'v', type: 'range', label: 'Card or cloth: pull speed', min: 0.2, max: 5, step: 0.1, ends: ['slow push', 'sharp yank'], fmt: (v) => `${fmt(v)} m/s` },
    { key: 'go2', type: 'buttons', label: 'Quick pull', items: [{ label: '▶ Pull', act: (s, inst) => { if (s.focus === 'carts') s.focus = 'cloth'; inst.go(); } }] },
  ],
  onChange(s, key) {
    if (['F', 'mA', 'mB'].includes(key)) s.focus = 'carts';
    if (key === 'v' && s.focus === 'carts') s.focus = 'cloth';
  },
  quiz: [
    { q: 'The same 6 N force pulls a 2 kg cart and a 3 kg cart. What are their accelerations?', options: ['Both 6 m/s²', '3 m/s² and 2 m/s²', '12 m/s² and 18 m/s²', '2 m/s² and 3 m/s²'], answer: 1, why: 'a = F ÷ m: 6 ÷ 2 = 3 m/s² and 6 ÷ 3 = 2 m/s². More mass, more inertia, less change in motion.' },
    { q: 'Why does the coin drop into the glass when you flick the card away fast?', options: ['Gravity pulls the coin harder than the card', 'The card is only under it for a split second, too short for friction to get the coin moving', 'Air pushes the coin down', 'The coin is magnetic'], answer: 1, why: 'Friction drags the coin for only a hundredth of a second or so. Its inertia means it hardly moves in that time, so it falls straight down.' },
    { q: 'An astronaut has a mass of 70 kg on Earth. What is her mass on the Moon?', options: ['About 12 kg', '70 kg', 'Zero', 'About 420 kg'], answer: 1, why: 'Mass does not change. Her weight drops from about 690 N to about 113 N, because the Moon’s gravity is weaker.' },
  ],
  reel: [
    { ms: 5600, caption: 'Same push, different mass: the heavier cart speeds up more slowly. a = F ÷ m.', set: { focus: 'carts', F: 4, mA: 0, mB: 3 }, act: (s, inst) => inst.go(), view: REEL.carts, spin: 0 },
    { ms: 5200, caption: 'Yank the cloth fast and the plate barely moves: inertia keeps it where it was.', set: { focus: 'cloth', v: 3 }, act: (s, inst) => inst.go(), view: REEL.cloth, spin: 0 },
  ],

  build({ stage }) {
    const root = new THREE.Group(); stage.root.add(root);
    const gC = new THREE.Group(), gK = new THREE.Group(), gT = new THREE.Group(); root.add(gC, gK, gT);
    gK.position.x = CX; gT.position.x = TX;

    // ------------------------------------------------ two carts on a track
    const track = box(2.4, 0.03, 0.95, M.matte(0x2b2f36)); track.position.set(0.95, 0.015, 0); gC.add(track);
    for (let x = 0; x <= 2.0001; x += 0.2) { const t = box(0.006, 0.004, 0.95, M.matte(x % 0.5 < 0.01 || x % 0.5 > 0.49 ? 0xe8e2c8 : 0x5a616e)); t.position.set(x, 0.032, 0); gC.add(t); }
    for (let x = 0; x <= 2.0001; x += 0.5) stage.label(`${x.toFixed(1)} m`, [x, 0.04, 0.6], gC, 'small');
    const carts = [makeCart(0x3b82f6), makeCart(0xff7a59)];
    const Z = [-0.24, 0.24];
    carts.forEach((c, i) => { c.position.set(0, 0.03, Z[i]); gC.add(c); });
    const pulls = [force(0xffb547, 0.018, 0.08), force(0xffb547, 0.018, 0.08)]; pulls.forEach((p) => gC.add(p));
    const cartL = [stage.label('', [0, 0.7, Z[0]], gC), stage.label('', [0, 0.7, Z[1]], gC)];
    const lF = stage.label('', [0, 0.4, 0], gC, 'hot');

    // ------------------------------------------------ coin, card and glass (6 times life size)
    const gk = new THREE.Group(); gk.scale.setScalar(COIN_S); gK.add(gk);
    const glass = makeGlass(GLASS_R, 0.1); gk.add(glass);
    const card = box(0.09, 0.0015, 0.06, M.plastic(0xf2f4f7)); gk.add(card);
    const cardStripe = box(0.07, 0.0005, 0.04, M.plastic(0xd8332f)); cardStripe.position.y = 0.001; card.add(cardStripe);
    const coin = disc(COIN_R, 0.002, M.metal(0xc9a24a, { roughness: 0.3 })); gk.add(coin);
    const pad = box(0.3, 0.01, 0.2, M.matte(0x2f4a6b)); pad.position.set(0.05, -0.005, 0); gk.add(pad);
    const lCoin = stage.label('', [0, 1.05, 0], gK, 'hot');
    const flick = force(0xffb547, 0.02, 0.1); gK.add(flick);

    // ------------------------------------------------ tablecloth
    const wood = M.matte(0x8a5a3a);
    const top = box(TABLE.x1 - TABLE.x0 + 0.1, 0.04, 0.8, wood); top.position.set(0, TABLE.y - 0.02, 0); gT.add(top);
    for (const x of [TABLE.x0 + 0.05, TABLE.x1 - 0.05]) for (const z of [-0.33, 0.33]) { const l = box(0.05, TABLE.y - 0.04, 0.05, wood); l.position.set(x, (TABLE.y - 0.04) / 2, z); gT.add(l); }
    const clothM = M.matte(0xe8e2c8);
    const clothTop = box(1.15, 0.004, 0.7, clothM); gT.add(clothTop);
    const clothHang = box(0.004, 0.35, 0.7, clothM); gT.add(clothHang);
    const plate = new THREE.Group(); gT.add(plate);
    const pl = disc(0.12, 0.012, M.plastic(0xf7f4ea, { roughness: 0.2 })); pl.position.y = 0.006; plate.add(pl);
    const rimP = disc(0.08, 0.014, M.plastic(0x3b82f6, { roughness: 0.2 })); rimP.position.y = 0.007; plate.add(rimP);
    const cup = makeGlass(0.035, 0.1); cup.position.set(0.19, 0, 0.18); plate.add(cup);
    const shards = []; for (let i = 0; i < 7; i++) { const sh = box(0.05, 0.006, 0.03, M.plastic(0xf7f4ea)); sh.visible = false; gT.add(sh); shards.push(sh); }
    const tug = force(0xffb547, 0.02, 0.1); gT.add(tug);
    const lCloth = stage.label('', [0, 1.35, 0], gT, 'hot');

    // ------------------------------------------------ the board
    let cur = {};
    const chart = board(root, 2.0, 2.06, 640, 660, (g, w, h) => {
      panelBg(g, w, h);
      if (!cur.focus) return;
      if (cur.focus === 'carts') {
        const { F, m, T, t } = cur, amax = F / Math.min(...m);
        title(g, 'Speed vs time, same pull', 'the lighter cart gains speed faster');
        const vy = ticks(0, amax * T, 4), tx = ticks(0, T, 4);
        const A = axes(g, w, h, { x0: 100, y0: 290, y1: 84, xMax: tx.hi, yMax: vy.hi, xTicks: tx.list, yTicks: vy.list, xFmt: (q) => q + ' s', yFmt: (q) => q + ' m/s' });
        ['#5b9bff', '#ff7a59'].forEach((col, i) => {
          const a = F / m[i]; line(g, [[0, 0], [T, a * T]], A.X, A.Y, 'rgba(255,255,255,.2)', 3, [8, 8]);
          line(g, [[0, 0], [t, a * t]], A.X, A.Y, col, 5); dot(g, A.X(t), A.Y(a * t), col, 8);
        });
        g.save(); g.translate(0, 330);
        title(g, 'a = F ÷ m', `for a pull of ${fmt(F)} N: double the mass, half the acceleration`);
        const ay = ticks(0, F / CART_KG, 4);
        const B = axes(g, w, h, { x0: 100, y0: 280, y1: 84, xMax: 9, yMax: ay.hi, xTicks: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], yTicks: ay.list, xFmt: (q) => q + '', yFmt: (q) => q + '', xLabel: 'mass, kg', yLabel: 'm/s²' });
        const pts = []; for (let k = 0; k <= 120; k++) { const mm = CART_KG + (k / 120) * 8; pts.push([mm, F / mm]); }
        line(g, pts, B.X, B.Y, COL.a, 4);
        ['#5b9bff', '#ff7a59'].forEach((col, i) => dot(g, B.X(m[i]), B.Y(F / m[i]), col, 10));
        g.restore();
      } else {
        const P = PULL[cur.focus];
        title(g, `How far the ${cur.focus === 'coin' ? 'coin' : 'plate'} moves`, 'against how fast you pull (any mass)');
        const vs = [], xs = [];
        for (let k = 0; k <= 96; k++) { const vv = 0.2 + (k / 96) * 4.8, r = quickPull(cur.focus, vv); vs.push(vv); xs.push(r.carried ? null : r.x * 100); }
        const yMax = cur.focus === 'coin' ? 10 : 40;
        const A = axes(g, w, h, { x0: 100, y0: h - 90, y1: 84, xMax: 5, yMax, xTicks: [0, 1, 2, 3, 4, 5], yTicks: ticks(0, yMax, 4).list, xFmt: (q) => q + ' m/s', yFmt: (q) => q + ' cm', xLabel: 'pull speed →' });
        const vMin = vs[xs.findIndex((q) => q !== null)];
        g.fillStyle = 'rgba(255,122,89,.22)'; g.fillRect(A.X(0), A.y1, A.X(vMin) - A.X(0), A.y0 - A.y1);
        tag(g, 'rides along', A.X(0) + 8, A.y1 + 26, COL.warn, 'bold 18px sans-serif');
        const good = cur.focus === 'coin' ? (GLASS_R - COIN_R) * 100 : (TABLE.x1 - PLATE_X) * 100;
        g.strokeStyle = 'rgba(123,224,140,.8)'; g.setLineDash([8, 6]); g.lineWidth = 2; g.beginPath(); g.moveTo(A.X(0), A.Y(Math.min(yMax, good))); g.lineTo(A.x1, A.Y(Math.min(yMax, good))); g.stroke(); g.setLineDash([]);
        tag(g, cur.focus === 'coin' ? 'still lands in the glass below this' : 'falls off the table above this', A.X(1.2), A.Y(Math.min(yMax, good)) - 8, COL.v, '17px sans-serif');
        const pts = vs.map((vv, k) => [vv, xs[k]]).filter((p) => p[1] !== null).map(([a, b]) => [a, Math.min(yMax, b)]);
        line(g, pts, A.X, A.Y, COL.s, 5);
        const r = quickPull(cur.focus, cur.v);
        if (!r.carried) dot(g, A.X(cur.v), A.Y(Math.min(yMax, r.x * 100)), COL.a, 10);
        else dot(g, A.X(cur.v), A.Y(0) - 6, COL.warn, 10);
        g.fillStyle = 'rgba(255,255,255,.6)'; g.font = '17px sans-serif';
        g.fillText(`μ ≈ ${P.mu}: friction can only speed it up at μ g = ${fmt(P.mu * G, 2)} m/s²`, 24, h - 22);
      }
    }, [0, 0, 0]);
    const BOARD = { carts: [3.3, 1.2, -0.6], coin: [CX + 1.35, 0.72, -0.4], cloth: [TX + 1.5, 1.25, -0.5] };

    const st = {};
    let t = 0, running = true, key = '', run = null, runKey = '', lastCk = '';
    const cartState = (s) => { const m = [s.mA + CART_KG, s.mB + CART_KG], a = m.map((mm) => s.F / mm); const T = Math.sqrt((2 * TRACK) / Math.max(...a)); return { m, a, T }; };
    const inst = {
      go() { t = 0; running = true; },
      update(dt, s) {
        dt = Math.max(0, dt);
        if (focusView(stage, st, s.focus, VIEWS) && !inReel()) inst.go();
        fitNarrow(stage, cartL.concat([lF]));
        gC.visible = s.focus === 'carts'; gK.visible = s.focus === 'coin'; gT.visible = s.focus === 'cloth';
        const reel = inReel();
        chart.mesh.position.set(...(reel ? (s.focus === 'carts' ? [1.0, 2.0, -0.4] : [TX + 0.2, 2.55, -0.5]) : BOARD[s.focus]));
        chart.mesh.scale.setScalar(reel ? (s.focus === 'carts' ? 0.62 : 0.85) : s.focus === 'coin' ? 0.5 : s.focus === 'carts' ? 0.78 : 0.6);
        const k = `${s.focus}|${s.F}|${s.mA}|${s.mB}|${s.v}`;
        if (k !== key) { if (key && !reel) inst.go(); key = k; }
        if (s.focus === 'carts') {
          const { m, a, T } = cartState(s), play = T / 3;
          if (running) { t += dt * play; if (t >= T) { t = T; running = false; } }
          carts.forEach((c, i) => {
            const x = 0.5 * a[i] * t * t, xPrev = c.position.x;
            c.position.x = x; c.roll(x - xPrev); c.setLoad(i ? s.mB : s.mA);
            pulls[i].aim([x + 0.27, 0.14, Z[i]], [1, 0, 0], 0.12 + s.F * 0.035);
            cartL[i].position.set(x, 0.62, Z[i]);
            cartL[i].element.innerHTML = `${fmt(m[i])} kg · <b>a = ${fmt(a[i])} m/s²</b>`;
          });
          lF.visible = false;
          cur = { focus: 'carts', F: s.F, m, T, t };
          const ck = `c|${k}|${t.toFixed(3)}`;
          if (ck !== lastCk) { lastCk = ck; chart.redraw(); }
          return;
        }
        const kind = s.focus, P = PULL[kind];
        if (runKey !== `${kind}|${s.v}`) { runKey = `${kind}|${s.v}`; run = quickPull(kind, s.v); }
        if (running) { t += dt / P.slow; if (t >= run.T + 0.02) { t = run.T + 0.02; running = false; } }
        const [, x, y, xc] = sampleAt(run, t);
        if (kind === 'coin') {
          const clear = Math.max(0, xc - 0.08) / Math.max(0.2, s.v);          // seconds since the card left the rim
          card.position.set(xc, 0.1 + 0.00075 - 0.5 * G * clear * clear, 0); card.visible = xc < 0.299;
          const onCard = run.tOff === null || t < run.tOff;
          const miss = !onCard && run.fell && y <= -DROP + 1e-4;
          coin.position.set(x, onCard ? 0.1 + 0.0025 : miss ? 0.1 + 0.004 : 0.1 + 0.0025 + y, 0);
          if (!onCard && !run.fell) coin.position.y = Math.max(0.012, coin.position.y);
          coin.rotation.z = miss ? 0.5 : 0;
          if (miss) coin.position.x = Math.sign(x) * GLASS_R;
          flick.aim([(xc + 0.047) * COIN_S, 0.6, 0], [1, 0, 0], t < run.T * 0.3 ? 0.35 : 0.01);
          lCoin.position.set(0, 0.02, 0.75);
          lCoin.element.innerHTML = run.carried ? 'too slow: the coin rides along' : t < run.T ? `shown ${P.slow}× slower` : run.fell ? 'it hits the rim' : 'plop: straight into the glass';
        } else {
          // The cloth lies from its trailing edge to the table's edge, then hangs down to the hand.
          const trail = TABLE.x0 + 0.05 + xc, wid = TABLE.x1 + 0.05 - trail;
          clothTop.visible = clothHang.visible = wid > 0.002;
          clothTop.scale.x = Math.max(0.001, wid / 1.15); clothTop.position.set(trail + wid / 2, TABLE.y + 0.002, 0);
          clothHang.position.set(TABLE.x1 + 0.052, TABLE.y - 0.17, 0);
          const edge = TABLE.x1 + 0.05;
          const px = PLATE_X + x;
          plate.position.set(px, TABLE.y + (clothTop.visible && run.tOff !== null && t < run.tOff ? 0.004 : 0.004) + y, 0);
          const smashed = y < -TABLE.y + 0.02;
          plate.visible = !smashed;
          shards.forEach((sh, i) => { sh.visible = smashed; if (smashed) sh.position.set(px + (i - 3) * 0.06, 0.004, ((i * 37) % 7 - 3) * 0.05); sh.rotation.y = i; });
          tug.aim([edge + 0.05, TABLE.y - 0.3, 0], [1, 0, 0], t < run.T ? 0.3 : 0.01);
          lCloth.position.set(0, 1.4, 0);
          lCloth.element.innerHTML = run.carried ? (smashed ? 'too slow: the plate rode off the edge' : 'too slow: the plate rides along') : t < run.T ? `shown ${P.slow}× slower` : `the plate moved ${fmt(run.x * 100)} cm`;
        }
        cur = { focus: kind, v: s.v };
        const ck = `${kind}|${s.v}`;
        if (ck !== lastCk) { lastCk = ck; chart.redraw(); }
      },
      readout(s) {
        if (s.focus === 'carts') {
          const { m, a } = cartState(s);
          return `<div class="big">a = F ÷ m</div>
            <div class="row"><span>Blue: ${fmt(s.F)} N ÷ ${fmt(m[0])} kg</span><b>${fmt(a[0], 2)} m/s²</b></div>
            <div class="row"><span>Orange: ${fmt(s.F)} N ÷ ${fmt(m[1])} kg</span><b>${fmt(a[1], 2)} m/s²</b></div>
            <div class="row"><span>Mass ratio · acceleration ratio</span><b>${fmt(m[1] / m[0], 2)} · ${fmt(a[0] / a[1], 2)}</b></div>
            <div class="row"><span>Their weights on Earth, m g</span><b>${fmt(m[0] * G)} N · ${fmt(m[1] * G)} N</b></div>`;
        }
        const r = run || quickPull(s.focus, s.v), P = PULL[s.focus];
        const obj = s.focus === 'coin' ? 'Coin' : 'Plate';
        if (r.carried) return `<div class="big">${obj} rides along</div>
          <div class="row"><span>Pull speed</span><b>${fmt(s.v)} m/s</b></div>
          <div class="row"><span>Friction can reach this speed in</span><b>${fmt((s.v / (P.mu * G)) * 1000, 0)} ms</b></div>
          <small>Too slow: friction gets the ${obj.toLowerCase()} up to the ${s.focus === 'coin' ? 'card' : 'cloth'}'s speed before it can slip out. Pull faster.</small>`;
        return `<div class="big">${obj} moves ${fmt(r.x * 100)} cm</div>
          <div class="row"><span>Pull speed</span><b>${fmt(s.v)} m/s</b></div>
          <div class="row"><span>Time with friction dragging it</span><b>${fmt(r.tOff * 1000, 0)} ms</b></div>
          <div class="row"><span>Speed it picks up, μ g t</span><b>${fmt(r.vOff * 100)} cm/s</b></div>
          <small>${s.focus === 'coin' ? (r.fell ? 'Just too much: it clips the rim of the glass.' : 'It drops into the glass.') : r.fell ? 'It slides off the table.' : 'The plate stays on the table.'} Its mass cancels out: the same for a light or a heavy ${obj.toLowerCase()}.</small>`;
      },
    };
    return inst;
  },
};
