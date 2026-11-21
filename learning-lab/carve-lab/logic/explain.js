// Carve Lab: the explanation system (PRD 9). One entry per control and per
// calculated result. Each has the five parts the PRD asks for: a plain
// definition, the equation, a visual (drawn by components/visuals.js), the
// skiing connection, and an optional deeper explanation.

export const HELP = {
  sidecutRadius: {
    title: 'Sidecut radius',
    plain: 'The sides of a ski aren’t straight: the ski is wider at the tip and tail and narrower in the middle. That curved edge is part of a big circle, and the sidecut radius is that circle’s radius. A smaller sidecut radius means a deeper curve; a larger one means a shallower curve.',
    equation: 'Rsc (metres), printed on most skis, e.g. “R = 15 m”',
    visual: 'sidecut',
    ski: 'Slalom race skis have about 12–13 m of sidecut for quick, tight turns. Giant-slalom skis have 25–30 m for long, fast arcs. All-mountain skis sit in between.',
    deeper: 'How deep is the curve? Over a contact length L, the edge sits a distance d = Rsc − √(Rsc² − (L/2)²) in from a straight line (the sagitta of the circle). For a 15 m sidecut and 1.6 m of edge, that’s only about 21 mm: small, but enough to steer the whole turn.'
  },
  edgeAngle: {
    title: 'Edge angle',
    plain: 'The edge angle is how far the ski is tipped up onto its edge, measured between the snow surface and the ski’s base. 0° is flat on the snow; bigger angles mean the ski is tipped further.',
    equation: 'θ (degrees). The model uses cos θ: R = Rsc × cos θ',
    visual: 'edge',
    ski: 'Tipped further, a carving ski bends into a deeper arc against the snow, so it tracks a tighter circle. Racers get their hips close to the snow to reach big edge angles.',
    deeper: 'cos θ isn’t a straight-line function: from 0° to 20° it only drops from 1 to 0.94, but from 40° to 60° it drops from 0.77 to 0.5. That’s why the first few degrees of tipping barely change the turn, and the last few change it a lot. At 0° the model gives R = Rsc, but a flat ski doesn’t really carve at all: the model only makes sense once the ski is on edge.'
  },
  speed: {
    title: 'Speed',
    plain: 'How fast the skier is moving along the turn. The lab keeps it constant through the whole turn so you can see its effect clearly.',
    equation: 'v (m/s). 1 m/s = 3.6 km/h ≈ 2.24 mph',
    visual: 'speed',
    ski: '10 m/s (36 km/h) is a brisk recreational speed. Ski racers in giant slalom often go 15–20 m/s (55–70 km/h).',
    deeper: 'Speed is squared in a = v²/R. Doubling the speed on the same turn multiplies the acceleration (and the force needed) by 4. Real skiers speed up and slow down during a turn; holding v constant is part of the idealized model.'
  },
  skierMass: {
    title: 'Skier mass',
    plain: 'The amount of matter in the skier and their gear, in kilograms. (Weight is the force gravity puts on that mass.)',
    equation: 'm (kg)',
    visual: 'mass',
    ski: 'Two skiers on the same line at the same speed turn with the same acceleration, but the heavier one needs more force from their skis and the snow to do it.',
    deeper: 'Mass appears in F = ma but not in a = v²/R. So mass changes the force needed to turn, not the acceleration of the turn itself.'
  },
  turnRadius: {
    title: 'Turn radius',
    plain: 'The radius of the circle the skier’s path follows: the distance from the centre of the turn to the skier. A smaller radius is a tighter turn.',
    equation: 'R = Rsc × cos θ',
    visual: 'radius',
    ski: 'This is the idealized radius of a pure carve, where the ski’s edge slices a clean arc and doesn’t skid.',
    deeper: 'The model is a geometric approximation on a rigid surface. Real turn radius also depends on how much the ski flexes, how hard it’s loaded, how far it sinks into the snow, how strong the snow is, how the ski is built, and whether it skids. Treat R as a prediction to test, not an exact measurement.'
  },
  centripetalAcceleration: {
    title: 'Centripetal acceleration',
    plain: 'When something moves in a circle, its direction keeps changing, so its velocity keeps changing: it is accelerating, toward the centre of the circle. This happens even when the speed stays the same.',
    equation: 'a = v² / R   (m/s²)',
    visual: 'centripetal',
    ski: 'That inward acceleration is what you feel pulling you to the outside of a turn. The faster you go, or the tighter the turn, the bigger it is.',
    deeper: 'Why v²? Going faster means you cover more of the circle each second (one factor of v), AND your velocity is a bigger arrow that has to swing around (another factor of v). Dividing by R: a bigger circle turns you more gently.'
  },
  gForce: {
    title: 'Lateral g',
    plain: 'The centripetal acceleration compared with the acceleration of gravity (9.81 m/s²). “1 g” sideways is as much as gravity pulls you down.',
    equation: 'g = a ÷ 9.81',
    visual: 'centripetal',
    ski: 'World Cup racers can reach 2–3 g in the tightest part of a turn, which is why they train their legs so hard.',
    deeper: 'This lab’s top-down view only shows the inward part. On a real slope, gravity also pulls down the hill, and the skier leans so the snow pushes back on both.'
  },
  inwardForce: {
    title: 'Required inward force',
    plain: 'The net force, pointing toward the centre of the turn, needed to keep the skier on the curved path. No inward force, no turn: the skier would carry straight on.',
    equation: 'F = m × a = m v² / R   (newtons)',
    visual: 'force',
    ski: 'The snow supplies this force, through the ski’s edge. If the snow can’t push back hard enough, the ski skids out of the carve.',
    deeper: 'This is the idealized net inward force the turn demands, not a full model of the forces at the ski–snow contact. Those also include the skier’s weight, the snow pushing up on the ski, and friction.'
  },
  turnTime: {
    title: 'Turn distance and time',
    plain: 'A 180° turn is half a circle, so the distance along it is half the circumference. At a constant speed, time = distance ÷ speed.',
    equation: 'distance = πR,   time = πR / v',
    visual: 'distance',
    ski: 'Short-radius turns on slalom skis come quickly, about one a second. Big GS arcs take two seconds or more.',
    deeper: 'Doubling the radius doubles both the distance and (at the same speed) the time. Doubling the speed halves the time.'
  },
  model: {
    title: 'About this model',
    plain: 'Carve Lab uses an idealized model: a pure carved turn on a rigid surface, at a constant speed, with the turn radius set only by the ski’s sidecut and edge angle.',
    equation: 'R = Rsc cos θ,   a = v²/R,   F = ma',
    visual: 'radius',
    ski: 'Real skiing is messier: skis flex, snow compresses and breaks away, skiers speed up and slow down, and most turns include some skidding. Use the model to understand relationships, not as advice for real skiing.',
    deeper: 'This is how science works: start with a simple model that captures the main idea, test it, then add what it leaves out. The cosine model is a well-known first approximation for carving.'
  }
};
