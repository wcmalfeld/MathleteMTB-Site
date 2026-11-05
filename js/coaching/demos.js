// Interactive physics demos for lesson pages. A lesson's physics block can
// name one with "demo": "com-balance" | "braking-transfer" | "corner-grip" | "jump-arc".
// Each is a deliberately simple model: they show the direction and size of
// an effect, not exact numbers for a real bike and rider. Every demo says so.
// The models themselves (the functions exported below) are unit-tested.

const G = 9.81;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const r1 = x => Math.round(x * 10) / 10;
const deg = r => r * 180 / Math.PI;
const rad = d => d * Math.PI / 180;

// ---------- models ----------

// Share of weight on the front tyre. Bike on a slope of slopeDeg (positive =
// pointing downhill), rider's centre of mass comHeight above the ground and
// comX along the bike from the rear contact patch, wheelbase in metres.
export function frontShare({ comX, comHeight = 1.05, wheelbase = 1.2, slopeDeg = 0 }) {
  const xg = comX + comHeight * Math.tan(rad(slopeDeg));
  return xg / wheelbase;
}

// Braking: load on each wheel when slowing at decelG (in g).
export function brakingLoads({ decelG, comX = 0.65, comHeight = 1.05, wheelbase = 1.2 }) {
  const front = (comX + comHeight * decelG) / wheelbase;
  return { front, rear: 1 - front, endoAtG: (wheelbase - comX) / comHeight };
}

// Cornering: what a turn asks of the tyres. speedKmh, radius in metres,
// bermDeg = banking of the turn. Returns lean angle and the friction needed.
export function cornerNeeds({ speedKmh, radius, bermDeg = 0 }) {
  const v = speedKmh / 3.6;
  const a = v * v / radius;             // sideways acceleration needed
  const ratio = a / G;
  const t = Math.tan(rad(bermDeg));
  const muNeeded = Math.max(0, (ratio - t) / (1 + ratio * t));
  return { accelG: ratio, leanDeg: deg(Math.atan(ratio)), muNeeded };
}

// Jump: a point-mass flight off a lip onto a tabletop.
// speedKmh at the lip, lipDeg, deck length, landing slope and length.
export function jumpFlight({ speedKmh, lipDeg, deck = 3, landingDeg = 28, landingLength = 4 }) {
  const v = speedKmh / 3.6;
  const a = rad(lipDeg);
  const vx = v * Math.cos(a), vy = v * Math.sin(a);
  const k = G / (2 * vx * vx);
  const ta = Math.tan(a), tb = Math.tan(rad(landingDeg));
  const y = x => x * ta - k * x * x;
  const peak = { x: vx * vy / G, y: vy * vy / (2 * G) };
  const flatLand = 2 * ta / (2 * k);    // where it comes back to lip height
  let where, x;
  if (flatLand <= deck) { where = 'deck'; x = flatLand; }
  else {
    x = ((ta + tb) + Math.sqrt(Math.max(0, (ta + tb) ** 2 - 4 * k * deck * tb))) / (2 * k);  // where the path meets the landing slope
    where = x <= deck + landingLength ? (x <= deck + 0.6 ? 'knuckle' : 'landing') : 'overshoot';
    if (where === 'overshoot') {
      const yEnd = -landingLength * tb;
      const disc = ta * ta - 4 * k * yEnd;
      x = (ta + Math.sqrt(Math.max(0, disc))) / (2 * k);
    }
  }
  const slope = ta - 2 * k * x;                   // flight path slope at touchdown
  const pathDeg = -deg(Math.atan(slope));        // degrees below horizontal
  const groundDeg = where === 'landing' || where === 'knuckle' ? landingDeg : 0;
  return { peak, x, y: y(x), where, pathDeg, groundDeg, mismatchDeg: Math.abs(pathDeg - groundDeg), vx, vy, y_at: y };
}

// Rotation: with nothing to push against in the air, angular momentum stays
// the same. Pulling in (smaller moment of inertia) spins faster; extending
// spins slower. spin = rotation rate when fully extended (turns per second),
// tuck 0..1, airtime in seconds. Returns how many turns are completed.
export function spinTurns({ spin, tuck = 0, airtime }) {
  const inertia = 1 - 0.45 * clamp(tuck, 0, 1);   // tucked body: roughly half the inertia
  const rate = spin / inertia;
  return { rate, turns: rate * airtime };
}

// ---------- UI helpers ----------

function slider(id, label, min, max, step, value, unit) {
  return `<label class="demo-control" for="${id}"><span>${label}</span>
    <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}">
    <output for="${id}" data-unit="${unit}">${value}${unit}</output></label>`;
}

function frame(title, svg, controls, caveat) {
  return `<figure class="demo">
    <figcaption class="demo-title"><span class="kicker">Try it</span> ${title}</figcaption>
    <div class="demo-stage">${svg}</div>
    <div class="demo-controls">${controls}</div>
    <p class="demo-readout" aria-live="polite"></p>
    <p class="demo-caveat"><strong>Simplified model.</strong> ${caveat}</p>
  </figure>`;
}

function wire(root, update) {
  const inputs = [...root.querySelectorAll('input[type=range], select')];
  const run = () => {
    const v = {};
    for (const i of inputs) {
      v[i.id.split('-').pop()] = i.type === 'range' ? Number(i.value) : i.value;
      const out = root.querySelector(`output[for="${i.id}"]`);
      if (out) out.textContent = i.value + (out.dataset.unit || '');
    }
    update(v);
  };
  inputs.forEach(i => i.addEventListener('input', run));
  run();
}

let n = 0;
const uid = () => 'd' + (++n);

// ---------- demos ----------

const DEMOS = {
  'com-balance'(el) {
    const id = uid();
    el.innerHTML = frame('Centre of mass and balance',
      `<svg viewBox="0 0 360 200" role="img" aria-labelledby="${id}-t"><title id="${id}-t">A bike on a slope with the rider's centre of mass marked</title>
        <g class="demo-ground-g"><line class="demo-ground" x1="-40" y1="150" x2="400" y2="150"/></g>
        <g class="demo-bike-g">
          <circle class="demo-wheel" cx="110" cy="122" r="28"/><circle class="demo-wheel" cx="250" cy="122" r="28"/>
          <path class="demo-frame" d="M110 122 L165 122 L205 82 L250 122 M165 122 L150 78 L205 82"/>
          <line class="demo-vline" x1="0" y1="0" x2="0" y2="0"/>
          <circle class="demo-com" r="9" cx="0" cy="0"/>
        </g>
        <text class="demo-label" x="12" y="24"></text>
      </svg>`,
      slider(id + '-hips', 'Hips back (minus = forward)', -20, 60, 1, 0, ' cm') + slider(id + '-slope', 'Slope (downhill)', 0, 30, 1, 0, '°'),
      'Treats rider and bike as one point. Real bikes add suspension, tyre shape and your arms and legs.');
    wire(el, ({ hips, slope }) => {
      const wb = 1.2, base = 0.55;
      const comX = base - hips / 100;
      const share = frontShare({ comX, wheelbase: wb, slopeDeg: slope });
      const svg = el.querySelector('svg');
      svg.querySelector('.demo-bike-g').setAttribute('transform', `rotate(${slope} 180 150)`);
      svg.querySelector('.demo-ground-g').setAttribute('transform', `rotate(${slope} 180 150)`);
      const cx = 110 + (comX / wb) * 140, cy = 150 - 1.05 * 80;
      const com = svg.querySelector('.demo-com');
      com.setAttribute('cx', cx); com.setAttribute('cy', cy);
      // Gravity line drawn straight down in screen space (un-rotate it).
      const line = svg.querySelector('.demo-vline');
      const len = 90, t = rad(slope);
      line.setAttribute('x1', cx); line.setAttribute('y1', cy);
      line.setAttribute('x2', cx + len * Math.sin(t)); line.setAttribute('y2', cy + len * Math.cos(t));
      let text, label;
      if (share <= 0) { text = 'Your weight line is behind the rear tyre: the front wheel lifts. This is the manual balance zone, or a loop-out if you go further.'; label = 'Front wheel lifts'; }
      else if (share >= 1) { text = 'Your weight line is in front of the front tyre: you would pitch forward. Move your hips back.'; label = 'Pitching forward'; }
      else { const f = Math.round(share * 100); text = `Front tyre carries about ${f}% of the weight, rear about ${100 - f}%.` + (slope >= 15 && share > 0.6 ? ' On a slope this steep, moving your hips back keeps the load balanced.' : ''); label = `Front ${f}% · Rear ${100 - f}%`; }
      svg.querySelector('.demo-label').textContent = label;
      el.querySelector('.demo-readout').textContent = text;
    });
  },

  'braking-transfer'(el) {
    const id = uid();
    el.innerHTML = frame('Braking moves weight forward',
      `<svg viewBox="0 0 360 170" role="img" aria-labelledby="${id}-t"><title id="${id}-t">Bars showing how much load each tyre carries while braking</title>
        <text class="demo-label" x="20" y="34">Rear</text><rect class="demo-bar-bg" x="80" y="20" width="240" height="22"/><rect class="demo-bar demo-bar--rear" x="80" y="20" width="0" height="22"/>
        <text class="demo-label" x="20" y="84">Front</text><rect class="demo-bar-bg" x="80" y="70" width="240" height="22"/><rect class="demo-bar demo-bar--front" x="80" y="70" width="0" height="22"/>
        <text class="demo-label demo-label--big" x="20" y="140"></text>
      </svg>`,
      slider(id + '-brake', 'Braking', 0, 1, 0.05, 0.3, ' g') + slider(id + '-hips', 'Hips back', 0, 30, 1, 0, ' cm'),
      'Ignores suspension dive and assumes the tyres have enough grip. Real maximum braking is usually limited by grip first.');
    wire(el, ({ brake, hips }) => {
      const comX = 0.65 - hips / 100, h = 1.05 - hips / 300;
      const { front, rear, endoAtG } = brakingLoads({ decelG: brake, comX, comHeight: h });
      const svg = el.querySelector('svg');
      svg.querySelector('.demo-bar--rear').setAttribute('width', 240 * clamp(rear, 0, 1));
      svg.querySelector('.demo-bar--front').setAttribute('width', 240 * clamp(front, 0, 1));
      const lifts = rear <= 0;
      svg.querySelector('.demo-label--big').textContent = lifts ? 'Rear wheel lifts' : `Front ${Math.round(front * 100)}% · Rear ${Math.round(rear * 100)}%`;
      el.querySelector('.demo-readout').textContent = lifts
        ? `At ${brake} g the rear tyre has no load left and the bike would tip forward. With these hips it tips at about ${r1(endoAtG)} g.`
        : `Braking at ${brake} g puts about ${Math.round(front * 100)}% of the load on the front tyre, so the rear skids easily and the front does most of the stopping. Moving your hips back raises the limit to about ${r1(endoAtG)} g.`;
    });
  },

  'corner-grip'(el) {
    const id = uid();
    const surfaces = [['0.9', 'Dry hardpack'], ['0.6', 'Dusty / loose over hard'], ['0.35', 'Damp dirt'], ['0.2', 'Wet roots']];
    el.innerHTML = frame('How much grip a corner needs',
      `<svg viewBox="0 0 360 150" role="img" aria-labelledby="${id}-t"><title id="${id}-t">Grip needed compared with grip available</title>
        <text class="demo-label" x="20" y="34">Needed</text><rect class="demo-bar-bg" x="100" y="20" width="230" height="22"/><rect class="demo-bar demo-bar--need" x="100" y="20" width="0" height="22"/>
        <text class="demo-label" x="20" y="84">Available</text><rect class="demo-bar-bg" x="100" y="70" width="230" height="22"/><rect class="demo-bar demo-bar--have" x="100" y="70" width="0" height="22"/>
        <text class="demo-label demo-label--big" x="20" y="132"></text>
      </svg>`,
      slider(id + '-speed', 'Speed', 5, 45, 1, 20, ' km/h') + slider(id + '-radius', 'Turn radius', 3, 30, 1, 8, ' m') +
      slider(id + '-berm', 'Berm angle', 0, 40, 1, 0, '°') +
      `<label class="demo-control" for="${id}-surface"><span>Surface</span><select id="${id}-surface">${surfaces.map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select></label>`,
      'Grip values are rough illustrations, not measurements; real grip depends on tyres, pressure and how you load the bike.');
    wire(el, ({ speed, radius, berm, surface }) => {
      const mu = Number(surface);
      const { leanDeg, muNeeded } = cornerNeeds({ speedKmh: speed, radius, bermDeg: berm });
      const svg = el.querySelector('svg');
      svg.querySelector('.demo-bar--need').setAttribute('width', 230 * clamp(muNeeded, 0, 1.2) / 1.2);
      svg.querySelector('.demo-bar--have').setAttribute('width', 230 * mu / 1.2);
      const ok = muNeeded <= mu;
      svg.querySelector('.demo-label--big').textContent = ok ? `Holds · lean about ${Math.round(leanDeg)}°` : 'Tyres slide';
      el.querySelector('.demo-readout').textContent = (ok
        ? `This corner needs about ${Math.round(muNeeded / mu * 100)}% of the grip available, with the bike leaned about ${Math.round(leanDeg)}°.`
        : `This corner needs more grip than the surface has: slow down before the turn, or use a wider line.`) +
        (berm > 0 ? ' The berm is doing part of the work by pushing you round.' : ' Try adding a berm, or doubling the speed: the grip needed goes up four times.');
    });
  },

  'jump-arc'(el) {
    const id = uid();
    el.innerHTML = frame('Speed, lip angle and where you land',
      `<svg viewBox="0 0 360 190" role="img" aria-labelledby="${id}-t"><title id="${id}-t">A rider's flight path over a tabletop jump</title>
        <path class="demo-jump"/><path class="demo-arc"/><circle class="demo-com" r="6"/>
        <text class="demo-label demo-label--big" x="12" y="24"></text>
      </svg>`,
      slider(id + '-speed', 'Speed at the lip', 10, 40, 1, 22, ' km/h') + slider(id + '-lip', 'Lip angle', 15, 45, 1, 30, '°'),
      'A single point with no air resistance, no pumping or popping off the lip and no rotation. Real jumps vary a lot: build speed up gradually.');
    const deck = 3, landingDeg = 28, landingLength = 4, s = 26, ox = 70, oy = 90;
    const X = x => ox + x * s, Y = y => oy - y * s;
    wire(el, ({ speed, lip }) => {
      const f = jumpFlight({ speedKmh: speed, lipDeg: lip, deck, landingDeg, landingLength });
      const svg = el.querySelector('svg');
      const tb = Math.tan(rad(landingDeg)), lipLen = 1.4, ta = Math.tan(rad(lip));
      const lipX0 = -lipLen, lipY0 = -lipLen * ta;
      const endY = -landingLength * tb;
      svg.querySelector('.demo-jump').setAttribute('d',
        `M0 ${Y(lipY0)} L${X(lipX0)} ${Y(lipY0)} Q${X(-0.4)} ${Y(lipY0)} ${X(0)} ${Y(0)} L${X(deck)} ${Y(0)} L${X(deck + landingLength)} ${Y(endY)} L360 ${Y(endY)} L360 190 L0 190 Z`);
      const pts = [];
      for (let i = 0; i <= 40; i++) { const x = f.x * i / 40; pts.push(`${X(x).toFixed(1)} ${Y(f.y_at(x)).toFixed(1)}`); }
      svg.querySelector('.demo-arc').setAttribute('d', 'M' + pts.join(' L'));
      const com = svg.querySelector('.demo-com');
      com.setAttribute('cx', X(f.x)); com.setAttribute('cy', Y(f.y_at(f.x)));
      const msg = {
        deck: ['Cased onto the deck', 'Not enough speed to clear the deck: the landing is flat, so the impact is hard. On a tabletop that\'s survivable, which is why we learn on them.'],
        knuckle: ['Just over the knuckle', 'Landing right at the top of the landing: rideable, but a little more speed would land you on the smoother slope.'],
        landing: ['On the landing', `A good match: the flight path meets the landing within about ${Math.round(f.mismatchDeg)}° of the slope, so most of the fall turns into forward speed.`],
        overshoot: ['Overshot to flat', 'Too much speed: you fly past the landing to flat ground, the hardest possible impact. Slow down.']
      }[f.where];
      svg.querySelector('.demo-label--big').textContent = msg[0];
      el.querySelector('.demo-readout').textContent = `${msg[1]} Peak height about ${r1(f.peak.y)} m above the lip.`;
    });
  }
  ,
  'rotation'(el) {
    const id = uid();
    el.innerHTML = frame('Tucking and extending change how fast you spin',
      `<svg viewBox="0 0 360 200" role="img" aria-labelledby="${id}-t"><title id="${id}-t">How far a rider rotates during a jump</title>
        <circle class="demo-track" cx="180" cy="104" r="70"/>
        <path class="demo-sweep"/>
        <g class="demo-body"><line class="demo-frame" x1="180" y1="104" x2="180" y2="50"/><circle class="demo-com" cx="180" cy="104" r="7"/></g>
        <text class="demo-label demo-label--big" x="12" y="24"></text>
      </svg>`,
      slider(id + '-spin', 'Spin started at takeoff (relative)', 1, 10, 1, 4, '') +
      slider(id + '-tuck', 'Body shape: extended → tucked', 0, 100, 5, 0, '%') +
      slider(id + '-air', 'Time in the air', 4, 16, 1, 9, ' tenths of a second'),
      'Treats the rider and bike as one body that only changes shape. It shows a principle, conservation of angular momentum, and is not a guide to the speed, airtime or input for any trick.');
    wire(el, ({ spin, tuck, air }) => {
      const { turns } = spinTurns({ spin: spin * 0.1, tuck: tuck / 100, airtime: air / 10 });
      const frac = Math.min(turns, 1.5);
      const svg = el.querySelector('svg');
      const a = frac * 2 * Math.PI, r = 70, cx = 180, cy = 104;
      const end = [cx + r * Math.sin(Math.min(a, 2 * Math.PI - 1e-3)), cy - r * Math.cos(Math.min(a, 2 * Math.PI - 1e-3))];
      svg.querySelector('.demo-sweep').setAttribute('d', `M${cx} ${cy - r} A${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${end[0].toFixed(1)} ${end[1].toFixed(1)}`);
      svg.querySelector('.demo-body').setAttribute('transform', `rotate(${(frac * 360) % 360} ${cx} ${cy})`);
      const t = Math.round(turns * 100) / 100;
      svg.querySelector('.demo-label--big').textContent = `${t} of a full turn`;
      el.querySelector('.demo-readout').textContent = `With this spin, shape and airtime the body completes about ${t} of a turn. ` +
        (tuck > 0 ? 'Tucking in makes the same spin turn faster; ' : 'Try tucking in: the same spin turns faster; ') +
        'extending slows it down. That is why riders can adjust rotation in the air, and why under- and over-rotation are both possible.';
    });
  }
};

export const DEMO_IDS = Object.keys(DEMOS);

export function mountDemos(root) {
  root.querySelectorAll('[data-demo]').forEach(el => {
    const fn = DEMOS[el.dataset.demo];
    if (fn && !el.dataset.mounted) { el.dataset.mounted = '1'; fn(el); }
  });
}
