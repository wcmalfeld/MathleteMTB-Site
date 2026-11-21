// Berm Lab: the explanation system (PRD 10). One entry per control, result
// and vector. Each has the five parts the PRD asks for: a plain definition,
// the equation, a visual (drawn by components/visuals.js), the mountain
// biking connection, and an optional deeper explanation.

export const HELP = {
  cornerRadius: {
    title: 'Riding line (corner radius)',
    plain: 'The radius of the circle your line follows through the corner, measured flat (horizontally) from the centre of the turn. A tight line hugs the inside with a small radius; a wide line swings around the outside with a big one.',
    equation: 'r (metres). Tight 4 m · Middle 6 m · Wide 8 m',
    visual: 'lines',
    ski: 'The same berm can be ridden many ways. Diving low and tight, or riding high and wide around the lip, changes the radius, and with it every number in the turn.',
    deeper: 'The lab treats each line as a circular arc with the same local bank angle. On a real berm the bank usually gets steeper as you ride higher, so a high wide line often gets more help from the berm, too.'
  },
  speedKmh: {
    title: 'Speed',
    plain: 'How fast you’re riding through the corner, held steady from entry to exit.',
    equation: 'v in km/h on the slider; the maths uses m/s: v (m/s) = v (km/h) ÷ 3.6',
    visual: 'speed',
    ski: '22 km/h is a quick trail pace through a flowy berm. Racers carry far more speed, and feel how much harder the corner pushes back.',
    deeper: 'Speed is squared in a = v²/r. Twice the speed needs four times the acceleration, and four times the inward force. Real riders brake and pump through corners; holding v constant is part of the idealized model.'
  },
  bermAngle: {
    title: 'Berm angle (banking)',
    plain: 'How steeply the berm is banked, measured from the horizontal. 0° is a flat corner; a bigger angle means the outside of the corner is built up higher.',
    equation: 'β (degrees)',
    visual: 'bank',
    ski: 'Trail builders bank berms so riders can carry speed. A well-matched berm feels like it holds you in the corner.',
    deeper: 'The ground always pushes perpendicular to its surface. Tilting the surface tilts that push toward the centre of the turn, so the berm itself supplies part of the inward force. There’s one angle, tan β = v²/(rg), where it supplies all of it.'
  },
  totalMass: {
    title: 'Rider + bike mass',
    plain: 'The combined mass of the rider, the bike and their gear, in kilograms.',
    equation: 'm (kg)',
    visual: 'mass',
    ski: 'A heavier rider and bike need more force to get around the same corner at the same speed, but not more acceleration, and in the model not a higher grip coefficient.',
    deeper: 'Mass is in F = ma, N and f, but cancels out of a = v²/r and of μ = |f|/N. That’s why the grip demand doesn’t change with mass in this model.'
  },
  availableGrip: {
    title: 'Available grip (model setting)',
    plain: 'An illustrative grip coefficient: how much sideways friction the model allows, as a fraction of the normal force. It is a model setting, not a measured tire specification.',
    equation: 'μ_available (no units), compared with μ_required',
    visual: 'grip',
    ski: 'Dry, tacky loam grips better than loose, dusty hardpack or wet roots. The slider stands in for all of that with one number.',
    deeper: 'The model compares two numbers: if μ_required ≤ μ_available, the line is within the model’s grip assumption. It is not a prediction of whether a real rider can make the turn, or of what is safe.'
  },
  centripetalAcceleration: {
    title: 'Centripetal acceleration',
    plain: 'When something moves in a circle its direction keeps changing, so its velocity keeps changing: it is accelerating, toward the centre of the circle. This is true even when the speed stays the same.',
    equation: 'a = v² ÷ r   (m/s²;  in g: a ÷ 9.81)',
    visual: 'centripetal',
    ski: 'This inward acceleration is why a rider needs an inward net force to get around a corner.',
    deeper: 'Why v²? Going faster you cover more of the circle each second, and your velocity is a bigger arrow that has to swing round. Dividing by r: a bigger circle turns you more gently.'
  },
  netInwardForce: {
    title: 'Required net inward force',
    plain: 'The total force toward the centre of the turn needed to keep rider and bike on the line. Without it, they would carry straight on.',
    equation: 'F = m × v² ÷ r   (newtons)',
    visual: 'force',
    ski: 'On a berm, the ground supplies this force in two ways: the tilted normal force, and friction at the tires.',
    deeper: 'This is the NET inward force. It isn’t the same as the sideways friction at the tires, because the berm’s normal force also pushes inward.'
  },
  leanAngle: {
    title: 'Lean angle',
    plain: 'How far the rider and bike, together, lean from vertical to balance through the turn.',
    equation: 'θ = arctan(v² ÷ (r g))',
    visual: 'lean',
    ski: 'Faster, or tighter, means more lean. Matching the berm angle to your lean is what makes a berm feel “locked in”.',
    deeper: 'This is a simplified balance model of the combined system. Real riders separate bike and body, shift their weight, and their tires deform; none of that is modeled here.'
  },
  matchedSpeed: {
    title: 'Matched speed',
    plain: 'The one speed at which this berm angle and radius need no sideways friction at all: the tilted normal force does the whole job.',
    equation: 'v = √(r × g × tan β)',
    visual: 'bank',
    ski: 'Ride slower than the matched speed and the model needs friction pointing up the berm; faster, and it needs friction pointing down it, toward the centre.',
    deeper: 'A flat corner (β = 0) has no matched speed: tan 0 = 0, so every turn on the flat relies entirely on tire-ground friction.'
  },
  normalForce: {
    title: 'Normal force (N)',
    plain: 'The push from the ground, always perpendicular (“normal”) to the surface.',
    equation: 'N = m g (cos β + q sin β),   q = v² ÷ (r g)',
    visual: 'bank',
    ski: 'On a berm the surface is tilted, so the normal force tilts toward the centre of the turn and helps you turn.',
    deeper: 'Its vertical part, N cos β, plus the vertical part of friction, holds up the weight. Its horizontal part, N sin β, points into the turn.'
  },
  frictionForce: {
    title: 'Friction force (f)',
    plain: 'The sideways grip between the tires and the ground, along the berm’s surface.',
    equation: 'f = m g (sin β − q cos β)   (+ up the berm, − down it)',
    visual: 'grip',
    ski: 'Slower than the matched speed, friction has to stop you sliding down the berm; faster, it has to pull you inward.',
    deeper: 'The sign tells you the direction. Its size, compared with N, is the grip demand.'
  },
  requiredGrip: {
    title: 'Grip demand (μ required)',
    plain: 'How much sideways friction the turn needs, as a fraction of the normal force. Lower is easier on the tires.',
    equation: 'μ = |f| ÷ N = |sin β − q cos β| ÷ (cos β + q sin β)   (flat: μ = v² ÷ (r g))',
    visual: 'grip',
    ski: 'Compare it with the available grip setting: within, approaching, or beyond the model’s limit.',
    deeper: 'A neat identity: μ_required = |tan(β − θ)|, where θ is the lean angle. The demand is zero when the berm angle equals the lean angle, and grows as they move apart.'
  },
  turnTime: {
    title: 'Distance and time through the corner',
    plain: 'The corner is modeled as half a circle, so the distance is half a circumference. At constant speed, time = distance ÷ speed.',
    equation: 'distance = π r,   time = π r ÷ v',
    visual: 'lines',
    ski: 'The tight line is shorter, so it’s quicker at the same speed, but it needs more grip. Choosing a line is a trade-off.',
    deeper: 'No braking, pedalling or pumping is modeled: the speed is the same from entry to exit.'
  },
  gravity: {
    title: 'Gravity (mg)',
    plain: 'The Earth pulling the rider and bike straight down. It has no sideways part, so it can’t turn you on its own.',
    equation: 'weight = m × g',
    visual: 'bank',
    ski: 'On a berm, gravity and the tilted normal force combine so their total points into the turn.',
    deeper: 'In the vertical direction everything balances (the model is in steady state): the upward parts of N and f equal mg.'
  },
  centrifugal: {
    title: 'Why do I feel pushed outward?',
    plain: 'There is no real outward “centrifugal” force acting on you from the ground’s point of view. Your body’s inertia wants to keep going straight; the bike and berm keep pulling you inward, so it feels like being pushed out.',
    equation: 'net force = m a, pointing IN',
    visual: 'centripetal',
    ski: 'That “pushed into the berm” feeling is the berm pushing on you, hard, to change your direction.',
    deeper: 'Centrifugal force only appears if you describe the motion from a frame that turns with the rider. This lab uses the ground’s frame, where the only acceleration is inward.'
  },
  model: {
    title: 'About this model',
    plain: 'Berm Lab uses a simplified steady-state banked turn: a circular line at constant speed, one bank angle, rider and bike treated as a single body.',
    equation: 'a = v²/r,  F = mv²/r,  θ = arctan(v²/rg),  μ = |f|/N',
    visual: 'bank',
    ski: 'Real cornering also depends on tire construction and pressure, soil and moisture, suspension, body position, bike-body separation, braking, changing berm shape and transient forces. The grip numbers are illustrative, not real tire data, and nothing here is riding or safety advice.',
    deeper: 'Science starts with a simple model that captures the main idea, then tests it and adds what it leaves out. This one captures how radius, speed and banking share out the forces in a corner.'
  }
};
