// The riding curriculum: Mathlete MTB Advanced Performance Lesson Pack (v2).
// scripts/build-riding.mjs turns this into the hidden draft pages in riding/.
//
// EVERYTHING HERE IS A DRAFT. Nothing is approved, and the pages are not
// linked from the site, carry a draft banner and are kept out of search
// engines (noindex). A lesson can only be marked approved with a named
// reviewer and review date (check-site.mjs enforces this).
//
// Writing rules (from the pack, sections 1, 4 and 8):
// - Original Mathlete wording only; sources are linked, never copied.
// - No universal speeds, jump sizes, brake ratios, tyre pressures, click
//   counts or sag values.
// - Corrections, progressions and terrain choice belong to the reviewing
//   coach: drafts describe what to observe and list what the coach must
//   supply (`specialist`).
// - Trick lessons are outlines only. No technique, cues or progressions
//   until a specialist writes them.
//
// status: 'draft'   - full Mathlete draft, ready for editorial review
//         'specialist' - full draft, but technique/progression must be
//                     written by a specialist before editorial review
//         'outline' - structure only; needs authoring (and for tricks,
//                     a specialist author)
// risk:   1, 2 or 3 (pack section 8.1); riskNote explains a range.

export const PATHWAYS = [
  { id: 'foundations', name: 'Performance Foundations', intro: 'The movement skills elite riders keep refining: position, pressure and vision, taught as tools that change with the terrain rather than poses to hold.' },
  { id: 'downhill', name: 'Downhill Speed', intro: 'Corners, braking, line choice, steeps and rough ground: carrying speed with control on advanced and race terrain.' },
  { id: 'race', name: 'Race Craft', intro: 'Track walk, practice laps, timing, video, suspension testing and race-run execution: turning practice into a plan.' },
  { id: 'jump', name: 'Jump Craft', intro: 'Consistent, controlled airtime: reading features, choosing a response, landing and linking a line.' },
  { id: 'tricks', name: 'Trick Library', intro: 'Expert freestyle tricks. Theory, vocabulary and expert references only until a specialist coach authors each lesson.' }
];

export const RISK_CLASSES = {
  1: { name: 'Class 1: performance foundations', text: 'Theory, analysis and planning. Practice still depends on terrain and context.' },
  2: { name: 'Class 2: advanced riding skills', text: 'Needs the stated prerequisites, a controlled progression, suitable terrain and coaching guidance.' },
  3: { name: 'Class 3: high-consequence skills', text: 'Theory and expert references only. Any practical progression is authored and supervised in person by a verified specialist coach, in a suitable facility.' }
};

const TRICK_GAPS = [
  'Technique: coach-authored movement phases, cues and timing for this trick.',
  'Progression: coach-authored stages with consistency gates, feature selection and facility requirements.',
  'Corrections: a coach-approved correction for each common error.',
  'Readiness: the prerequisites and stop criteria the coach will check in person.'
];

export const LESSONS = [
  // ============================================================
  // PERFORMANCE FOUNDATIONS
  // ============================================================
  {
    id: 'DH-PERF-01',
    slug: 'dh-body-position',
    title: 'Advanced Body Position and Bike/Body Separation',
    pathway: 'foundations',
    release: 'A',
    status: 'draft',
    risk: 2,
    reviewer: 'Advanced downhill coach',
    sources: { primary: ['d08', 'd10'], comparison: ['a09', 'a02'] },
    outcome: 'The rider moves around a balanced, mobile position instead of holding one pose: the bike is free to move underneath them over compressions, roots, rocks, berms and steeps, while their mass stays calm, centred over the bike’s contact patches and ready for the next feature.',
    who: 'Riders already comfortable on advanced (black) terrain who want to be smoother and faster, and racers whose video shows them being pushed around by the bike.',
    prereqs: [
      'Rides advanced terrain in control at their current pace.',
      'Can stand, weight the pedals and move fore-aft on the bike without losing balance.',
      'Has a coach or experienced rider available to film and review.'
    ],
    why: 'Almost every other skill in this curriculum (cornering, braking, pumping, rough terrain, jumping) depends on how freely the rider can move. Elite riders are not in a “correct” position more often; they have more range, and they choose where to be for each piece of trail.',
    model: [
      { h: 'Position is a range, not a pose', p: 'A useful starting position is athletic and mobile: weight through the feet, joints bent with room to extend and compress in every direction. From there the rider moves forward, back, up, down and side to side as the trail asks. Universal cues like “always low” or “always back” fail because they remove that range.' },
      { h: 'Separating the bike from the body', p: 'Over a root or a compression the bike has to move: it rises, drops and pitches. If the rider is rigid, the whole system moves and the rider’s mass gets thrown around. If the arms and legs let the bike move underneath, the rider’s mass travels a smoother path and the tyres stay in contact with the ground.' },
      { h: 'Pressure, not just position', p: 'Where the rider’s weight goes through the bike decides which tyre has grip. Moving the hips forward or back changes how the load is shared between the wheels; driving through the feet or hands adds or removes pressure. The goal is to choose pressure on purpose, not to end up wherever the trail throws you.' },
      { h: 'Adapting to the terrain and the bike', p: 'Steep ground, flat corners, berms and jumps each ask for something different, and so do different bikes and setups. The same rider in good video will look different in each section, and that is the point.' }
    ],
    physics: {
      h: 'Centre of mass and base of support',
      p: 'The rider is most stable when their centre of mass sits over the base of support, the area between the tyres’ contact patches. On a slope, that base tilts with the ground but gravity still points straight down, so staying balanced means moving the hips relative to the bike. Bending the joints also lets the rider change height smoothly: the bike can travel a long way up and down while the rider’s centre of mass moves much less, which means smaller forces on the rider and more stable tyres.',
      note: 'A good Mathlete visual: trace the rider’s hip path and the bike’s path from the same video. The gap between the two lines is the bike/body separation.'
    },
    examples: [
      { id: 'd08', note: 'Watch how position changes from section to section, and how much the bike moves while the rider’s head and hips stay calm.' },
      { id: 'd10', note: 'Compare the myths it takes apart with common “always do this” cues.' }
    ],
    errors: [
      { pattern: 'Locked arms and legs: the bike and rider move as one block over bumps.', causes: 'Fear on the terrain, a position with no room left to absorb, fatigue, or speed beyond current skill.' },
      { pattern: 'Sitting far back on every descent, with a light, wandering front wheel.', causes: 'A learned “weight back” habit, steep-terrain nerves, or a bike setup that feels unstable.' },
      { pattern: 'Head and hips bouncing in time with the bike.', causes: 'Not enough separation; joints already fully bent or straight; too stiff a grip.' },
      { pattern: 'The same position everywhere, whatever the terrain.', causes: 'Position taught as a pose rather than a range; not looking ahead early enough to prepare.' }
    ],
    practice: {
      setting: 'A short, familiar, coach-selected section that the rider can ride well below race pace, with a mix of compressions and small obstacles.',
      focus: 'One thing per run: for example “let the bike rise into the hands” over a single root band. Keep speed constant so changes come from technique.',
      feedback: 'Film from the side at a fixed, safe spot. Compare the rider’s description of the run with the footage before the coach comments.',
      stop: ['The rider is tired and quality drops.', 'Conditions change (wet roots, braking bumps developing).', 'Attention moves to speed instead of the focus.']
    },
    rubric: [
      'Head and hips: how steady are they while the bike moves?',
      'Range: does the rider use their arms and legs, or run out of movement?',
      'Front-wheel pressure on the steep or braking sections.',
      'Does position change appropriately between sections?',
      'Repeatability across several runs, not one good one.'
    ],
    gates: [
      'Coach-observed: the rider adapts position to the terrain on a known section, run after run.',
      'The rider can explain why their position changed in each section of their own video.'
    ],
    next: ['pressure-pumping', 'dh-cornering', 'rough-terrain'],
    specialist: [
      'Confirm or rewrite the technical model against the d08 and d10 source text.',
      'Corrections for each common error.',
      'Choose example footage (licensed or embeddable) for each terrain type.'
    ]
  },
  {
    id: 'F-PUMP-01',
    slug: 'pressure-pumping',
    title: 'Pressure Control: Weighting, Unweighting and Pumping',
    pathway: 'foundations',
    release: 'A',
    status: 'draft',
    risk: 2,
    reviewer: 'Advanced coach',
    sources: { primary: ['d06', 'x03'], comparison: ['d09', 'a02', 'a05'] },
    outcome: 'The rider adds and removes pressure through the bike on purpose: pushing into the back sides of rollers, compressions and downslopes to gain speed, and going light over obstacles to keep it, so they can carry speed without pedalling.',
    who: 'Advanced riders who can ride a pump track or flowing trail and want to turn terrain into speed; downhill and enduro racers working on sections where pedalling isn’t possible.',
    prereqs: [
      'Solid bike/body separation (see Advanced Body Position).',
      'Can ride a pump track or rolling trail continuously in control.'
    ],
    why: 'Speed you don’t lose is speed you don’t need to make up. On many race sections there is no room to pedal, and pressure control is how fast riders make time anyway.',
    model: [
      { h: 'Weighting and unweighting', p: 'Pressing down through the feet and hands increases the force between tyres and ground; pulling the body up and letting the bike come up reduces it. Smooth surfaces and pump tracks are the place to learn the rhythm before applying it on trail.' },
      { h: 'Where pushing helps and where it hurts', p: 'Pushing the bike down into a downslope (the back side of a roller, rock or ledge) turns the slope into forward speed. Pushing into an upslope does the opposite. Pumping means timing pressure to the shape of the ground.' },
      { h: 'Going light over obstacles', p: 'Before roots or rocks, compressing into the ground and then going light, much like the start of a bunny hop, lets the bike skim over instead of crashing into them. Weight settles back onto the bike on smoother ground.' },
      { h: 'Coasting can beat pedalling', p: 'In tight gaps, off-camber sections and rough ground, pedalling risks pedal strikes and puts the body in a poor position to absorb. Coasting and pumping can be faster.' },
      { h: 'Linked corners', p: 'Between linked corners, pedalling disrupts weight and line into the second one. Staying light out of the first and loading the bike through the second, while picking the line, often carries more speed. A single well-timed pedal stroke as the bike comes upright can then carry speed out of a corner.' }
    ],
    physics: {
      h: 'How pumping adds energy',
      p: 'Pumping is the same physics as pumping a playground swing: the rider does work by extending and compressing at the right moments. Pushing down as the bike goes down the back of a roller adds to the forward force from the slope, so kinetic energy increases; going light up the front reduces the energy lost climbing it. Mathematically, the rider is doing work against the normal force, and the timing of that work relative to the slope decides whether it speeds them up or slows them down.',
      note: 'A good Mathlete visual: a roller profile with the force arrows, showing why the same push helps on the back side and hurts on the front.'
    },
    examples: [
      { id: 'd06', note: 'Pressure through bars and pedals to flow with terrain; why the pump track comes before the trail.' },
      { id: 'x03', note: 'Where coasting and pumping beat pedalling: tight gaps, off-camber, rough ground and linked corners.' },
      { id: 'd09', note: 'An elite rider working on a cornering habit that affects pressure and speed.' }
    ],
    errors: [
      { pattern: 'Pushing into the front (up) side of rollers.', causes: 'Timing too early; not looking far enough ahead to see the shape; too much speed for the spacing.' },
      { pattern: 'Pedalling in rough or tight sections and losing speed.', causes: 'Habit; not trusting that coasting is faster; pedal strikes.' },
      { pattern: 'Arms do all the pumping; legs stay stiff.', causes: 'Position too far forward; not enough leg range.' },
      { pattern: 'Pumping looks big but speed doesn’t increase.', causes: 'Movement is up-and-down rather than timed to the slope; effort without timing.' }
    ],
    practice: {
      setting: 'A pump track or a smooth rolling section, then a familiar trail section with clear downslopes. Coach-selected and low consequence.',
      focus: 'One feature at a time: for example, gain speed from a single back side without pedalling.',
      feedback: 'Compare exit speed or a short timed segment over several runs with no pedalling allowed; film from the side.',
      stop: ['Fatigue (pumping is tiring and timing degrades quickly).', 'The rider starts adding speed rather than refining timing.']
    },
    rubric: [
      'Timing: is pressure added on the back sides and removed on the faces?',
      'Leg and arm use: do both contribute?',
      'Speed carried through the section without pedalling.',
      'Smoothness of the hips’ path.',
      'Consistency over several runs.'
    ],
    gates: [
      'Coach-observed: the rider gains speed through a rhythm section without pedalling, consistently.',
      'The rider can pick out, on a trail they know, where pumping helps and where pedalling is worth it.'
    ],
    next: ['dh-cornering', 'rough-terrain', 'jump-response'],
    specialist: [
      'Confirm the weighting/unweighting points against the d06 source text.',
      'Corrections for each common error.',
      'Pump-track and trail drills to recommend at this level.'
    ]
  },
  {
    id: 'DH-PERF-05',
    slug: 'race-vision',
    title: 'Visual Focus and Reading the Trail at Race Speed',
    pathway: 'foundations',
    release: 'A',
    status: 'draft',
    risk: 2,
    riskNote: 'Class 2–3 depending on the terrain it is practised on.',
    reviewer: 'Race coach or advanced downhill coach',
    sources: { primary: ['x05'], comparison: ['d04', 'd05', 'd01', 'd13'] },
    outcome: 'The rider looks far enough ahead to make decisions early, using near references for control and far references for planning, so braking, line and body position are prepared before each feature arrives.',
    who: 'Fast riders whose video shows late decisions: braking or line changes right at the feature, or a head that drops to the front wheel in hard sections.',
    prereqs: ['Advanced Body Position.', 'Rides the practice terrain in control at current pace.'],
    why: 'At race speed the trail arrives faster than the rider can react to it. Seeing further ahead buys decision time, and decision time is what lets the rest of the technique happen smoothly.',
    model: [
      { h: 'Near and far', p: 'Riders use two kinds of visual information: what is close (for immediate control) and what is coming (for planning). Elite riders tend to spend more of their attention further ahead and trust their peripheral vision for the near trail.' },
      { h: 'Vision drives decisions', p: 'Where and when the rider looks decides when they can choose a line, set up a brake marker or prepare for a corner. Late vision shows up as late braking, abrupt line changes and missed exits.' },
      { h: 'Fixation', p: 'Staring at a hazard tends to pull the rider toward it. The skill is to register the hazard and move the eyes on to where the bike should go.' },
      { h: 'Exit references', p: 'Through corners and features, looking for the exit early lets the rider set up the entry to suit it.' }
    ],
    physics: {
      h: 'Decision time and distance',
      p: 'Distance covered = speed × time. Reaction and decision time doesn’t shrink when riders go faster, so the distance covered before they can respond grows with speed. As an illustration only: at 10 m/s, a third of a second of decision time is over 3 m of trail. Looking further ahead is how riders give themselves that distance back.',
      note: 'Illustration of the maths only, not a target speed. A good Mathlete visual: a slider for speed showing how far the bike travels during a fixed decision time.'
    },
    examples: [
      { id: 'x05', note: 'An elite rider working on looking further ahead (video: reviewer to watch and confirm).' },
      { id: 'd04', note: 'Line choice as a visual decision, using a pro’s lines as examples (video).' }
    ],
    errors: [
      { pattern: 'Head drops to the front wheel in rough sections.', causes: 'Speed or terrain beyond current comfort; habit; not trusting peripheral vision.' },
      { pattern: 'Braking or changing line right at the feature.', causes: 'Late vision; not knowing the section; too much speed for the sight lines.' },
      { pattern: 'Riding toward the obstacle the rider is worried about.', causes: 'Target fixation.' },
      { pattern: 'Exits wide from corners.', causes: 'Not looking for the exit early enough.' }
    ],
    practice: {
      setting: 'A familiar coach-selected section with clear sight lines, ridden below race pace first.',
      focus: 'Call out loud the next feature or exit before reaching it, or use helmet-camera footage to check where the rider looked.',
      feedback: 'Helmet or chest camera plus side footage; the rider describes where they looked, then compares with video.',
      stop: ['Focus on vision makes the rider ride stiffly or lose control of other basics.', 'Fatigue.']
    },
    rubric: [
      'Head position and steadiness in hard sections.',
      'Where are decisions made: early or at the feature?',
      'Exit lines in corners.',
      'Number of abrupt corrections per run.'
    ],
    gates: ['Coach-observed: decisions made earlier and fewer abrupt corrections on a known section, across several runs.'],
    next: ['line-choice', 'linking-sections', 'track-walk'],
    specialist: [
      'The lesson has no text-verified source: the reviewer must supply or confirm the technical basis (audit flag).',
      'Watch x05 and d04 and confirm or correct the technical model.',
      'Corrections for each common error.'
    ]
  },

  // ============================================================
  // DOWNHILL SPEED
  // ============================================================
  {
    id: 'DH-PERF-02',
    slug: 'dh-cornering',
    title: 'High-Speed Cornering and Pumping Through Turns',
    pathway: 'downhill',
    release: 'A',
    status: 'draft',
    risk: 2,
    riskNote: 'Pack range Class 2–3; the audit chose Class 2.',
    reviewer: 'Advanced downhill coach',
    sources: { primary: ['d09', 'd10'], comparison: ['x03', 'd05', 'a02', 'a09'] },
    outcome: 'The rider manages entry speed, vision, line, pressure and lean as one connected system, so they exit corners faster and set up for what comes next, in flat turns, berms, off-cambers and linked corners alike.',
    who: 'Advanced riders and racers who lose time in corners: braking too late or too much, sliding, running wide or sinking back.',
    prereqs: ['Advanced Body Position.', 'Pressure Control.', 'Brake to Go Faster is recommended alongside this lesson.'],
    why: 'Most trails are a series of corners joined by straights. Exit speed carries down the next straight, so small gains at the corner exit add up over a whole run. Even elite riders keep working on their cornering.',
    model: [
      { h: 'Corner types ask for different things', p: 'Flat turns depend on tyre grip from lean and pressure; berms let the rider push into a supporting wall; off-camber turns slope away and reduce grip; linked turns make one corner the setup for the next. A cue that works in a berm can fail in a flat turn.' },
      { h: 'Entry speed is set before the corner', p: 'Most corners are won or lost at the entry. Speed is best set before the turn, so the rider can release the brakes and let the tyres use their grip for turning.' },
      { h: 'Vision and line', p: 'Looking for the exit early lets the rider choose an entry that suits it. Wide-in, tight-out and early-apex lines trade entry speed against exit speed.' },
      { h: 'Pressure and lean', p: 'Pressure through the outside foot and the bars keeps the tyres loaded; leaning the bike more than the body keeps the rider’s mass over the contact patches. Where the corner shape allows, loading the bike through the turn and releasing on the exit can pump speed out of it.' },
      { h: 'Linked corners', p: 'Between linked corners, staying light out of the first and loading the second (rather than pedalling between them) protects weight and line into the corner that matters most.' }
    ],
    physics: {
      h: 'Centripetal force and lean angle',
      p: 'To follow a curve of radius r at speed v, the tyres must supply a sideways force of mv²/r. Grip, roughly the friction coefficient times the normal force, limits how much they can give. Double the speed and the force needed quadruples, which is why entry speed matters so much. For an idealised bike on flat ground, the balanced lean angle θ satisfies tan θ = v²/(rg). A berm tilts the ground and lets part of the normal force do the turning, which is why berms can be taken faster.',
      note: 'An idealised model: real tyres, berms and riders are messier. A good Mathlete visual: a slider for speed and radius showing the required force and lean angle.'
    },
    examples: [
      { id: 'd09', note: 'An elite rider and coach diagnosing a cornering habit that costs pressure and speed (page could not be opened: reviewer to check).' },
      { id: 'd10', note: 'Corner braking and flat versus bermed turns, including common myths.' },
      { id: 'x03', note: 'Linked corners and timing the first pedal stroke out of a corner.' }
    ],
    errors: [
      { pattern: 'Braking into the corner and through it.', causes: 'Entry speed too high; late vision; lack of trust in grip.' },
      { pattern: 'Front wheel washes out in flat turns.', causes: 'Too little front pressure, often from sinking back; too much lean or speed for the grip.' },
      { pattern: 'Exits wide.', causes: 'Late vision; early apex; too much entry speed.' },
      { pattern: 'Sinking back and sitting on the bike mid-corner.', causes: 'Fatigue; fear; position with no range left.' },
      { pattern: 'Over-slowing: safe but slow everywhere.', causes: 'Not knowing the available grip; braking at fixed habits rather than for the corner.' }
    ],
    disagreements: ['Pedal position in flat turns: sources differ (outside pedal down versus level pedals). The audit recorded this rather than merging it; the coach should decide what to teach and when.'],
    practice: {
      setting: 'A coach-selected set of corners the rider knows: ideally a flat turn, a berm and a pair of linked turns, at below race pace.',
      focus: 'Change one variable at a time: brake marker, entry line or where the rider looks. Keep the others the same.',
      feedback: 'Film from a safe spot that shows entry, apex and exit; time a short segment through the corner if possible.',
      stop: ['Conditions change (corner blowing out, braking bumps, wet).', 'The rider starts adding speed instead of testing the focus.', 'Fatigue.']
    },
    rubric: [
      'Where braking finishes relative to the turn-in.',
      'Front-wheel pressure and position mid-corner.',
      'Line: entry, apex and exit points.',
      'Exit speed (segment time if available).',
      'Consistency across several runs.'
    ],
    gates: ['Coach-observed: consistent entry, line and exit through a known set of corners, with braking finished before turn-in where the corner allows.'],
    next: ['brake-to-go-faster', 'linking-sections', 'low-grip-conditions'],
    specialist: [
      'Decide the flat-turn pedal-position guidance (sources disagree).',
      'Watch or read d09 (could not be opened) and confirm the cornering model.',
      'Corrections for each common error.'
    ]
  },
  {
    id: 'DH-PERF-03',
    slug: 'brake-to-go-faster',
    title: 'Brake to Go Faster: Braking Points and Traction Management',
    pathway: 'downhill',
    release: 'A',
    status: 'draft',
    risk: 2,
    riskNote: 'Pack range Class 2–3; the audit chose Class 2.',
    reviewer: 'Advanced downhill coach',
    sources: { primary: ['d03', 'd11'], comparison: ['d10', 'd07', 'x04', 'd05'] },
    outcome: 'The rider uses the brakes to control traction, speed and line, braking deliberately in the places where grip allows it and releasing where the tyres need their grip for turning, so they go faster overall.',
    who: 'Fast riders who drag the brakes, brake in corners or skid, and racers looking for time in braking zones.',
    prereqs: ['Advanced Body Position.', 'Can ride the practice terrain in control at current pace.'],
    why: 'Braking well is a speed skill. Riders who brake hard and briefly in the right places, then let the bike run, spend less time slow than riders who drag the brakes everywhere.',
    model: [
      { h: 'Brakes control grip as well as speed', p: 'Every tyre has a limited amount of grip, shared between braking, turning and accelerating. Braking hard while turning uses up grip the turn needs. Deliberate braking, before the corner or on the straightest, grippiest ground, saves grip for where it is needed.' },
      { h: 'Sometimes the answer isn’t more braking', p: 'If a rider is always on the brakes in a section, the better fix may be a different line or understanding where the traction is, rather than more brake.' },
      { h: 'Braking markers and release points', p: 'On a known section, riders choose where braking starts and where it stops. A coach can help mark these and check them on video. Markers change with conditions, so they are tools, not rules.' },
      { h: 'Front and rear brakes', p: 'Both brakes matter, and the balance changes with slope, surface, turn and suspension behaviour. Some coaches argue that riders often under-use the front brake on steep ground (see Technical Steeps). There is no universal ratio.' }
    ],
    physics: {
      h: 'The grip budget',
      p: 'A tyre’s grip can be pictured as a circle (the friction circle): the combined braking and cornering force can’t exceed about μN, the friction coefficient times the normal force. If braking uses most of it, little is left for turning. Braking also shifts load toward the front wheel, giving it more grip and the rear less, which is why rear-only braking skids easily.',
      note: 'A good Mathlete visual: a friction circle with a vector for braking and a vector for cornering; when their sum leaves the circle, the tyre slides.'
    },
    examples: [
      { id: 'd03', note: 'Braking deliberately to keep grip and control; line choice and traction instead of more braking (video).' },
      { id: 'd11', note: 'Front-brake use on steep ground (see Technical Steeps for context).' },
      { id: 'x04', note: 'A second coaching view on braking (video).' }
    ],
    errors: [
      { pattern: 'Dragging the brakes all the way down a section.', causes: 'Nerves; not knowing where the grip is; no planned markers.' },
      { pattern: 'Braking in the corner instead of before it.', causes: 'Late vision; entry speed too high.' },
      { pattern: 'Rear wheel skidding into corners.', causes: 'Over-reliance on the rear brake; braking too hard where grip is low.' },
      { pattern: 'Braking on roots, rocks or wet patches.', causes: 'Braking where the rider happens to be rather than where grip is best.' }
    ],
    practice: {
      setting: 'A known, coach-selected section with one or two clear braking zones, at below race pace.',
      focus: 'Brake once, deliberately, in the chosen zone, then release completely; compare with the rider’s usual braking.',
      feedback: 'Side footage of the braking zone and corner; segment timing if available.',
      stop: ['Conditions change (braking bumps, wet, loose).', 'The rider is braking later and harder rather than smarter.', 'Fatigue.']
    },
    rubric: [
      'Where braking starts and ends relative to the planned markers.',
      'Is the rider off the brakes before turn-in?',
      'Skids or loss of line.',
      'Time spent on the brakes per section (from video).',
      'Exit speed or segment time.'
    ],
    gates: ['Coach-observed: deliberate braking zones and releases on a known section, consistently, without loss of control.'],
    next: ['dh-cornering', 'steeps-rock-rolls', 'low-grip-conditions'],
    specialist: [
      'Watch d03 and x04 (video only) and confirm the braking model.',
      'Corrections for each common error.',
      'Whether and how to teach braking-marker selection at this level.'
    ]
  },
  {
    id: 'DH-PERF-04',
    slug: 'line-choice',
    title: 'Elite Line Choice: Fastest, Smoothest or Most Repeatable?',
    pathway: 'downhill',
    release: 'A',
    status: 'draft',
    risk: 2,
    riskNote: 'Pack range Class 2–3; the audit chose Class 2.',
    reviewer: 'Race coach or advanced downhill coach',
    sources: { primary: ['d04', 'd05'], comparison: ['d01', 'd02', 'd13'] },
    outcome: 'The rider compares lines through a section by entry and exit speed, surface, traction, risk and what comes next, and chooses deliberately between the fastest, the smoothest and the most repeatable.',
    who: 'Racers and fast riders who ride a section the same way every time, or who pick the line that looks fastest without knowing whether it is.',
    prereqs: ['Visual Focus and Reading the Trail.', 'Advanced Body Position.'],
    why: 'The shortest line isn’t always the fastest, and the fastest line isn’t always the smoothest or safest. A line that is fast once but goes wrong one time in three may lose a race.',
    model: [
      { h: 'Speed, smoothness and agility', p: 'Lines can be chosen for outright speed, for smoothness (less energy lost, less fatigue) or for agility (setting up the next feature). Good riders know which they are choosing and why.' },
      { h: 'Look at the whole section', p: 'A line is judged by its exit and by what it sets up downstream, not just by how it feels in the middle.' },
      { h: 'Conditions change the answer', p: 'The fastest line on dry ground may be poor when wet or blown out. Line choice is revisited as conditions change through a race weekend.' },
      { h: 'Line choice versus confidence', p: 'A rider may avoid a faster line because of confidence rather than speed. Tracking these separately helps the coach see which one is limiting.' }
    ],
    physics: {
      h: 'Comparing lines with data',
      p: 'Two lines can be compared like an experiment: time each over the same section, several times, and compare the average and the spread, not just the best run. A line with a slightly slower average but a much smaller spread can be the better race choice.',
      note: 'A good Mathlete visual: two dot plots of segment times for line A and line B, with means and ranges.'
    },
    examples: [
      { id: 'd04', note: 'Choosing lines for speed, smoothness and agility using a pro’s line choices; fastest is not always smoothest or safest (video).' },
      { id: 'd05', note: 'Line choice linked to vision, braking, pedalling and using terrain to pump (page could not be opened).' },
      { id: 'd01', note: 'Trackside line selection from a World Cup coach (video).' }
    ],
    errors: [
      { pattern: 'Always riding the same line regardless of conditions.', causes: 'Habit; not re-walking or re-checking the section.' },
      { pattern: 'Choosing the line that looks fastest, then losing time at its exit.', causes: 'Judging the middle of the section rather than the exit.' },
      { pattern: 'A fast line that goes wrong often.', causes: 'Choosing speed over repeatability; line beyond current skill.' }
    ],
    practice: {
      setting: 'A known section with two or more realistic lines, selected by the coach as suitable for the rider.',
      focus: 'Ride each line several times; record times and the rider’s confidence separately.',
      feedback: 'Annotated line map, segment times and side video of each line.',
      stop: ['A line feels beyond the rider’s current skill.', 'Conditions change.', 'Fatigue.']
    },
    rubric: [
      'Entry and exit speed for each line.',
      'Spread of times (consistency), not just the best.',
      'Errors or corrections per run on each line.',
      'Rider confidence rating (self-reported, kept separate from time).'
    ],
    gates: ['The rider can justify a line choice for a known section with timing, video and conditions, and the coach agrees with the reasoning.'],
    next: ['linking-sections', 'track-walk', 'practice-laps-analysis'],
    specialist: [
      'The lesson has no text-verified source: the reviewer must supply or confirm the technical basis (audit flag).',
      'Watch d04 and d01 and read d05 if it can be opened.'
    ]
  },
  {
    id: 'DH-PERF-06',
    slug: 'steeps-rock-rolls',
    title: 'Technical Steeps, Rock Rolls and Front-Brake Confidence',
    pathway: 'downhill',
    release: 'A',
    status: 'specialist',
    risk: 3,
    riskNote: 'Pack: Class 3 depending on terrain. The audit chose Class 3, so practice is coach-led and a verified specialist must review.',
    reviewer: 'Advanced downhill coach (verified specialist credited as reviewer)',
    sources: { primary: ['d11', 'd10'], comparison: ['d08', 'a02'] },
    outcome: 'The rider understands how steepness, surface, runout and traction change braking and body position on steeps and rock rolls, can describe the choices involved, and knows when to decline, walk or ask a coach.',
    who: 'Advanced riders and racers preparing for steep, technical terrain, working with a coach.',
    prereqs: ['Advanced Body Position.', 'Brake to Go Faster.', 'A coach to select terrain and lead practice.'],
    why: 'Steep, technical sections are where control matters most and where the consequences of losing it are highest. Understanding why braking and position change here makes coach-led practice far more productive.',
    model: [
      { h: 'Reading the steep', p: 'Before riding, the questions are: how steep, what surface, where is the grip, where does it flatten out (the runout), and what happens if the rider has to stop? These decide whether and how a section should be ridden.' },
      { h: 'Front brake in context', p: 'One coaching view argues that many riders over-rely on the rear brake on steep ground and under-use the front, which, used with control and the right body position, can give more stopping power. This is one perspective: it is not a universal rule or a brake ratio, and the coach decides how it applies.' },
      { h: 'Body position on steep ground', p: 'Steep terrain tilts the bike, but gravity still pulls straight down. Riders need to keep their mass balanced over the bike, which usually means moving back relative to the bike while staying mobile, not locking out behind the saddle.' },
      { h: 'Declining is a skill', p: 'Choosing to walk a section, or to come back with a coach, is part of riding steep terrain well.' }
    ],
    physics: {
      h: 'Forces on a slope',
      p: 'On a slope of angle θ, gravity’s component along the slope is g sin θ, so the steeper the slope, the more braking force is needed just to hold a speed. Braking also shifts load onto the front wheel, which is why the front tyre has more grip available on steep ground, and why the rear tyre locks easily.',
      note: 'A good Mathlete visual: a slope-angle slider showing the along-slope component of gravity and the load split between the wheels.'
    },
    examples: [
      { id: 'd11', note: 'A coach challenging rear-brake reliance on steeps and rock rolls; front-brake control and body position.' },
      { id: 'd10', note: 'Speed control on steeps and rock rolls among other myths.' }
    ],
    errors: [
      { pattern: 'Rear wheel locked and skidding down the steep.', causes: 'Over-reliance on the rear brake; braking where grip is lowest.' },
      { pattern: 'Locked out behind the saddle with straight arms.', causes: 'Fear; an outdated “weight right back” cue; no range left to absorb.' },
      { pattern: 'Committing without checking the runout.', causes: 'Not inspecting; social pressure.' }
    ],
    practice: {
      setting: 'COACH-LED ONLY. The coach selects the venue, starting with lower-consequence terrain; this lesson does not recommend terrain.',
      focus: 'Set by the coach.',
      feedback: 'Coach observation and video review.',
      stop: ['Any loss of control.', 'Conditions change.', 'The rider wants to stop, or the coach calls it.']
    },
    rubric: [
      'Inspection: does the rider check the steep and the runout first?',
      'Brake control: is there skidding?',
      'Position: mobile and balanced, or locked out?',
      'Does the rider decline when appropriate?'
    ],
    gates: ['Set by the coach in person. Watching this lesson does not mean a rider is ready for steep terrain.'],
    next: ['rough-terrain', 'low-grip-conditions'],
    specialist: [
      'Technique: coach-authored movement cues for front-brake control, body position and speed on steeps and rock rolls, with terrain-selection guidance.',
      'Progression: a coach-designed progression of practice terrain from lower to higher consequence.',
      'Corrections, including for relying on a skidding rear wheel.',
      'A verified specialist coach credited as reviewer (Class 3).'
    ]
  },
  {
    id: 'DH-PERF-07',
    slug: 'rough-terrain',
    title: 'Rough Terrain: Roots, Rocks, Braking Bumps and Repeated Impacts',
    pathway: 'downhill',
    release: 'A',
    status: 'draft',
    risk: 2,
    riskNote: 'Pack range Class 2–3; the audit chose Class 2.',
    reviewer: 'Advanced downhill coach, plus a suspension technician where setup is involved',
    sources: { primary: ['d08', 'x03'], comparison: ['d02', 'd11', 'd06', 'd12'] },
    outcome: 'The rider stays mobile through repeated impacts, keeping the bike tracking and the speed up, and decides on purpose whether to absorb an obstacle, pump it, jump it or take another line.',
    who: 'Fast riders who get knocked off line, lose speed or tire quickly in roots, rock gardens and braking bumps.',
    prereqs: ['Advanced Body Position.', 'Pressure Control.'],
    why: 'Rough sections punish stiffness. Riders who let the bike move and choose how to handle each obstacle carry more speed and finish runs less tired.',
    model: [
      { h: 'Absorb, pump, jump or avoid', p: 'Every obstacle offers choices: soak it up, push into its back side, go over it, or pick a line around it. Rough sections are a fast string of these decisions.' },
      { h: 'Going light over roots and rocks', p: 'Compressing into the ground just before roots or rocks and then going light lets the bike skim over them instead of slamming into them; weight settles back on smoother ground.' },
      { h: 'Don’t pedal through the chatter', p: 'Pedalling in rough ground puts the body in a poor position to absorb, so the rider ends up crashing through obstacles and losing speed and energy.' },
      { h: 'Brakes and rough ground', p: 'Braking on rough ground stiffens the suspension’s behaviour and the rider’s, and reduces grip. Braking before the rough section where possible keeps the bike free to move.' },
      { h: 'Rider or setup?', p: 'Deflection and harshness can come from technique, line, tyres or suspension. If setup seems to contribute, bring in a suspension technician (see Suspension Setup as a Test Process).' }
    ],
    physics: {
      h: 'Letting the bike move reduces the hit',
      p: 'An impact’s force depends on how quickly momentum changes: F = Δp / Δt. If the rider’s arms and legs let the bike rise and fall underneath them, the rider’s own mass changes direction over a longer time, so the force on the rider is smaller and the tyres stay in contact longer.',
      note: 'A good Mathlete visual: the same bump with a stiff rider and a mobile rider, plotting the vertical path of the hips.'
    },
    examples: [
      { id: 'd08', note: 'Movement and letting the bike move beneath the rider for grip, balance and absorption.' },
      { id: 'x03', note: 'Going light over roots and rocks, and why pedalling in rough ground costs speed.' },
      { id: 'd02', note: 'World Cup preparation linking rider feedback and suspension performance on rough tracks.' }
    ],
    errors: [
      { pattern: 'Bike deflects off line in roots or rocks.', causes: 'Stiff arms; braking on the roots; line choice; tyre or suspension setup.' },
      { pattern: 'Losing speed through a rock garden.', causes: 'Pedalling or braking in the rough; not going light over obstacles.' },
      { pattern: 'Arms and hands tire quickly on long rough sections.', causes: 'Gripping too hard; position too far forward; setup.' }
    ],
    practice: {
      setting: 'A coach-selected rough section the rider knows, at below race pace.',
      focus: 'One choice per run: for example, brake before the root band and stay off the brakes through it.',
      feedback: 'Side video and segment time; note any setup changes separately.',
      stop: ['Fatigue (rough sections tire riders quickly).', 'Deteriorating conditions.']
    },
    rubric: [
      'Bike tracking: does it stay on the chosen line?',
      'Hips: how steady relative to the bike?',
      'Braking: before or during the rough section?',
      'Exit speed or segment time.'
    ],
    gates: ['Coach-observed: consistent line and speed through a known rough section.'],
    next: ['suspension-testing', 'steeps-rock-rolls', 'linking-sections'],
    specialist: [
      'Confirm the movement points against d08.',
      'Corrections for each common error.',
      'Suspension-technician input where setup is involved.'
    ]
  },

  // ============================================================
  // RACE CRAFT
  // ============================================================
  {
    id: 'DH-PERF-10',
    slug: 'track-walk',
    title: 'Race Track Walk and Course Intelligence',
    pathway: 'race',
    release: 'A',
    status: 'draft',
    risk: 1,
    riskNote: 'The walk itself is Class 1 (on foot). Riding the track remains Class 2 or higher.',
    reviewer: 'Race coach',
    sources: { primary: ['d01', 'd02'], comparison: ['d05', 'd13'] },
    outcome: 'The rider walks a race track with a purpose: mapping features, line options, braking and decision zones, risk areas and conditions, and leaves with a first plan they expect to change after practice.',
    who: 'Competitive downhill and enduro riders, and anyone preparing for a race on an unfamiliar track.',
    prereqs: ['Elite Line Choice is recommended.'],
    why: 'The track walk is the first and cheapest practice run. Riders who walk with a plan arrive at practice knowing what to test.',
    model: [
      { h: 'What to look for', p: 'Major features; line options and where they split and rejoin; braking and decision zones; places to pass (where racing allows); high-risk spots; and conditions such as wet roots, loose corners and ruts.' },
      { h: 'Map it', p: 'Mark these on a simple track map or notes: section by section, with questions to answer in practice.' },
      { h: 'A plan, not the final line', p: 'The map is a starting plan. Practice laps will change it; the walk tells the rider what to test first.' },
      { h: 'Team input', p: 'Where riders have support, the coach, mechanic and suspension technician each notice different things on a walk. At the top level, the process runs from track walk to practice laps to final setup tweaks, with rider feedback at the centre.' }
    ],
    physics: {
      h: 'Mapping a track',
      p: 'A track map is a data model: a sequence of sections, each with features, line options, and estimated speed and risk. Splitting a run into sections is also how timing works (see Practice Laps). Gradients from a topographic map or GPS track show where the track is steep, as rise over run.',
      note: 'A good Mathlete visual: a track profile (elevation against distance) with sections and features marked.'
    },
    examples: [
      { id: 'd02', note: 'A World Cup preparation cycle: track walk, practice laps and final tweaks, with rider, mechanic and engineers.' },
      { id: 'd01', note: 'Trackside tips from a World Cup coach (video).' }
    ],
    errors: [
      { pattern: 'Walking without a plan, or only looking at the big features.', causes: 'Not knowing what to look for.' },
      { pattern: 'Treating the walk plan as final.', causes: 'Not leaving room to change after practice.' },
      { pattern: 'Not re-checking after weather or heavy practice changes the track.', causes: 'Assuming conditions stay the same.' }
    ],
    practice: {
      setting: 'On foot, on a race track or a local track treated as one.',
      focus: 'Produce a section map with features, lines, decision zones and questions.',
      feedback: 'Compare the walk plan with what actually happened in practice laps.',
      stop: ['Follow event rules for walking the track (some tracks restrict access).']
    },
    rubric: [
      'Does the map cover every section?',
      'Are line options and decision zones marked?',
      'Are questions for practice listed?',
      'How much did the plan change after practice, and why?'
    ],
    gates: ['The rider produces a usable track map and a list of practice questions.'],
    next: ['practice-laps-analysis', 'race-run-execution'],
    specialist: ['Watch d01 (video only) and confirm or add track-walk content.']
  },
  {
    id: 'DH-PERF-11',
    slug: 'practice-laps-analysis',
    title: 'Practice Laps, Section Splits and Video Analysis',
    pathway: 'race',
    release: 'A',
    status: 'draft',
    risk: 2,
    riskNote: 'Pack range Class 2–3; the audit chose Class 2.',
    reviewer: 'Race coach',
    sources: { primary: ['d01', 'd02', 'd13'], comparison: [] },
    outcome: 'The rider runs practice like an experiment: a baseline run, then one change at a time, judged with video, section splits and notes, rather than by feel or one fast lap.',
    who: 'Competitive riders, and any advanced rider who wants practice time to produce real improvement.',
    prereqs: ['Race Track Walk.', 'Access to a camera; timing equipment where available.'],
    why: 'Riders often feel fastest when they are not. Video and timing turn practice into evidence, and testing one change at a time shows what actually works.',
    model: [
      { h: 'Baseline first', p: 'Start with a normal run to compare against.' },
      { h: 'One change at a time', p: 'Change a line, a brake marker or a setup setting, but only one thing, so the result can be attributed to it.' },
      { h: 'Record everything', p: 'Conditions, tyre and suspension changes, fatigue, line changes and what the run was for. Without notes, results can’t be compared.' },
      { h: 'Feel versus evidence', p: 'Compare what the rider felt with video and splits. They often disagree, and that disagreement is useful.' },
      { h: 'Know the limits of the data', p: 'Phone GPS, action-camera timestamps and stopwatches are noisy. Small differences may not be real.' }
    ],
    physics: {
      h: 'Signal, noise and one fast run',
      p: 'Every run varies. To tell whether a change helped, compare several runs before and after: their averages and their spread. If the difference between averages is small compared with the spread, the change may not have made a real difference. One faster run is not proof.',
      note: 'A good Mathlete visual: split times before and after a change, with the noise band shown. This lesson connects directly to statistics.'
    },
    examples: [
      { id: 'd02', note: 'Practice laps and rider feedback feeding setup decisions at World Cup level.' },
      { id: 'd13', note: 'Structuring how riders learn new skills (page could not be opened).' },
      { id: 'd01', note: 'Trackside coaching from a World Cup coach (video).' }
    ],
    errors: [
      { pattern: 'Changing several things at once.', causes: 'Impatience; limited practice time.' },
      { pattern: 'Trusting one fast run.', causes: 'Not comparing averages and spread.' },
      { pattern: 'No notes, so results can’t be compared later.', causes: 'No system for recording.' }
    ],
    practice: {
      setting: 'A practice session on a known track or section, with a camera and timing if available.',
      focus: 'Baseline, one change, compare.',
      feedback: 'Lap log: date, track, conditions, setup, line notes, times and splits.',
      stop: ['Fatigue makes later runs incomparable.', 'Conditions change during the session.']
    },
    rubric: [
      'Was there a baseline?',
      'Was only one thing changed per test?',
      'Were conditions and setup recorded?',
      'Is the conclusion supported by more than one run?'
    ],
    gates: ['The rider runs a session with a baseline and one tested change, and reports a conclusion the coach agrees the data supports.'],
    next: ['suspension-testing', 'race-run-execution'],
    specialist: ['Watch d01 (video only) and read d13 if it can be opened.']
  },
  {
    id: 'DH-PERF-12',
    slug: 'suspension-testing',
    title: 'Suspension Setup as a Trackside Test Process',
    pathway: 'race',
    release: 'A',
    status: 'draft',
    risk: 1,
    riskNote: 'Equipment process (Class 1). A mechanic or suspension specialist must review.',
    reviewer: 'Suspension specialist or mechanic',
    sources: { primary: ['d12', 'd02'], comparison: [] },
    outcome: 'The rider tests suspension changes with a systematic observe → adjust → test → record process, can tell setup symptoms from technique and line problems, and gets settings from the manufacturer and a qualified technician rather than guessing.',
    who: 'Advanced riders and racers who adjust their own suspension, and athletes working with a mechanic.',
    prereqs: ['Practice Laps, Section Splits and Video Analysis.', 'Knows the bike’s adjusters and the manufacturer’s setup guide.'],
    why: 'Random adjustments make it impossible to know what helped. A test process finds a better setting faster, and stops riders from blaming setup for a technique problem, or the other way around.',
    model: [
      { h: 'Start from a recorded baseline', p: 'Write down every setting before changing anything, starting from the manufacturer’s recommendations.' },
      { h: 'Bracketing', p: 'Test one adjustment at a time, trying a setting on either side of the current one and comparing, rather than making guesses.' },
      { h: 'Test on the same section', p: 'Use the same section, conditions and riding intent, so the only thing that changes is the setting.' },
      { h: 'Symptom or technique?', p: 'Harshness, deflection or instability can come from setup, but also from line, braking or position. Video and a technician help tell them apart.' },
      { h: 'The rider-mechanic loop', p: 'At the top level, rider feedback, mechanics and engineers work together through practice to refine setup for race day.' }
    ],
    physics: {
      h: 'Springs and dampers',
      p: 'A suspension spring stores energy as it compresses (Hooke’s law, F = kx, for a coil); the damper turns motion into heat to control how fast the suspension moves. Changing one setting changes how the system responds to every bump. That is why changes are tested one at a time.',
      note: 'No settings, pressures or click counts are given here: these depend on the bike, rider, terrain and manufacturer. A good Mathlete visual: a mass-spring-damper simulation.'
    },
    examples: [
      { id: 'd12', note: 'A systematic approach to setting suspension instead of guessing (video).' },
      { id: 'd02', note: 'Rider feedback, mechanics and engineers refining setup through a World Cup build-up.' }
    ],
    errors: [
      { pattern: 'Changing several settings at once.', causes: 'Impatience; not recording settings.' },
      { pattern: 'Blaming setup for a technique or line problem (or the other way around).', causes: 'No video comparison; no technician input.' },
      { pattern: 'Settings copied from another rider.', causes: 'Assuming setups transfer between riders, bikes and tracks.' }
    ],
    practice: {
      setting: 'A short, repeatable test section; a mechanic or technician where possible.',
      focus: 'One adjustment, bracketed, tested on the same section.',
      feedback: 'Setup log with baseline, change, conditions, rider feedback and times.',
      stop: ['Anything feels unsafe: stop and have the bike checked by a mechanic.']
    },
    rubric: [
      'Baseline recorded?',
      'One change at a time?',
      'Same section and conditions?',
      'Conclusion supported by feedback and data?'
    ],
    gates: ['The rider completes a bracketed test of one setting with a recorded baseline, reviewed by a technician.'],
    next: ['race-run-execution', 'rough-terrain'],
    specialist: [
      'A suspension specialist or mechanic reviews the whole lesson.',
      'Watch d12 (video only) and confirm the bracketing method as described.'
    ]
  },
  {
    id: 'DH-PERF-13',
    slug: 'race-run-execution',
    title: 'Race Run Execution, Consistency and Pressure',
    pathway: 'race',
    release: 'A',
    status: 'draft',
    risk: 2,
    riskNote: 'Pack range Class 2–3; the audit chose Class 2.',
    reviewer: 'Race coach',
    sources: { primary: ['d01', 'd02'], comparison: ['d13', 'a02'] },
    outcome: 'The rider turns track knowledge into a race-run plan, separates practice goals from race goals, chooses where to commit and where to be conservative, and reviews the run afterwards with their coach.',
    who: 'Competitive downhill and enduro riders.',
    prereqs: ['Race Track Walk.', 'Practice Laps, Section Splits and Video Analysis.'],
    why: 'Race runs are scored on one attempt. Consistency and good decisions under pressure often matter more than the fastest possible line.',
    model: [
      { h: 'Practice laps and race runs have different jobs', p: 'Practice is for testing and learning; the race run is for executing the plan. Mixing the two leads to untested changes on race day.' },
      { h: 'The cost of an error', p: 'A small time gain from a risky line can be wiped out by one mistake. Riders decide in advance where to commit and where to ride conservatively.' },
      { h: 'Routines', p: 'A consistent warm-up and pre-run routine helps riders arrive at the start ready. This lesson stays at a general performance level; it isn’t sports psychology or medical advice.' },
      { h: 'Debrief', p: 'After the run, the rider reflects first and then reviews with the coach: what went to plan, what didn’t, and why.' }
    ],
    physics: {
      h: 'Expected time',
      p: 'Expected value helps compare lines: if a risky line saves a little time when it works but costs a lot when it doesn’t, multiply each outcome by its likelihood and add them up. A line that is slower but almost never goes wrong can have the better expected time.',
      note: 'A good Mathlete visual: an expected-value calculator for two lines, using the rider’s own practice data.'
    },
    examples: [
      { id: 'd02', note: 'Race-day execution as the end of a preparation process.' },
      { id: 'd01', note: 'World Cup trackside coaching (video).' }
    ],
    errors: [
      { pattern: 'Trying an untested line in the race run.', causes: 'Pressure; not separating practice and race goals.' },
      { pattern: 'Riding over the limit early and crashing or slowing later.', causes: 'No plan for where to commit.' },
      { pattern: 'No debrief, so the same mistakes repeat.', causes: 'No routine after the run.' }
    ],
    practice: {
      setting: 'Race simulations on a known track, under coach supervision.',
      focus: 'Execute a written plan; review against it.',
      feedback: 'Run plan, video, splits, rider reflection and coach debrief.',
      stop: ['Fatigue.', 'Conditions change.']
    },
    rubric: [
      'Did the rider follow the plan?',
      'Where were errors made and what did they cost?',
      'Consistency across simulated race runs.',
      'Quality of the rider’s reflection.'
    ],
    gates: ['The rider writes a run plan, executes it in a simulation and debriefs it with the coach.'],
    next: [],
    specialist: [
      'Watch d01 (video only).',
      'Keep sports-psychology content within the reviewing coach’s qualified scope.'
    ]
  },

  // ============================================================
  // OUTLINES: written as structure only in this pass
  // ============================================================
  {
    id: 'DH-PERF-08', slug: 'linking-sections', title: 'Linking Features and Maintaining Speed Across a Whole Section',
    pathway: 'downhill', release: 'B', status: 'outline', risk: 2, riskNote: 'Pack range Class 2–3; the audit chose Class 2.',
    reviewer: 'Race coach or advanced downhill coach',
    sources: { primary: ['a05'], comparison: ['d09', 'd04', 'd05'] },
    outcome: 'Treat a section as one connected sequence of entry, corner, compression, roller, braking zone and exit, and judge it by how one decision sets up the next.',
    coverage: ['A section as a sequence', 'How one decision changes the next feature', 'Isolated feature versus whole-section performance', 'Segment maps with decision points', 'Repeatable flow and controlled exits before timed attempts'],
    specialist: ['No text-verified source: the reviewer must supply or confirm the technical basis.', 'Watch or read a05, d09, d04 and d05.']
  },
  {
    id: 'DH-PERF-09', slug: 'low-grip-conditions', title: 'Wet, Loose and Low-Grip Conditions',
    pathway: 'downhill', release: 'B', status: 'outline', risk: 2, riskNote: 'Pack: Class 3 depending on conditions; the audit chose Class 2.',
    reviewer: 'Advanced downhill coach',
    sources: { primary: ['d10'], comparison: ['a09', 'd04', 'd08'] },
    outcome: 'Adapt braking, cornering and line choice when the surface changes, instead of forcing a familiar dry-weather line.',
    coverage: ['How surface changes traction, braking and cornering', 'Dry versus wet line options (coach-curated examples)', 'Adapting technique versus forcing a line', 'A “conditions changed: reassess” checklist'],
    specialist: ['Coach review of all practical content.', 'No tyre-pressure or speed advice.']
  },
  {
    id: 'A-JUMP-01', slug: 'jump-performance', title: 'Jump Performance: Consistency, Shape and Control',
    pathway: 'jump', release: 'B', status: 'outline', risk: 2, reviewer: 'Advanced air coach',
    sources: { primary: ['a08', 'x02'], comparison: ['a01', 'a05', 'a06', 'a09'] },
    outcome: 'Move from leaving the ground to a controlled, repeatable jump, and understand how feature shape, speed, trajectory and rider movement interact.',
    coverage: ['Jump vocabulary and feature geometry', 'Performance intents: boost, carry speed, absorb, scrub, style, clear a gap', 'Rider–bike relationship through approach, takeoff, flight and landing', 'Video from side, front and landing angles', 'Repeatability: one variable at a time under coach guidance', 'Casing, overshooting and loss of control'],
    physicsIdea: 'Projectile motion: the same takeoff speed and angle give the same flight, which is why consistency starts at the approach. Ties directly to Jump Lab and the MTB Physics Playground.',
    specialist: ['Watch or read a01 before review.', 'A coach-defined standard for “controlled and repeatable”.']
  },
  {
    id: 'A-JUMP-02', slug: 'jump-response', title: 'Pump, Boost, Absorb and Scrub: Choosing the Right Jump Response',
    pathway: 'jump', release: 'B', status: 'outline', risk: 2, reviewer: 'Advanced air coach',
    sources: { primary: ['a08', 'd06'], comparison: ['a06', 'a07', 'd09', 'a09'] },
    outcome: 'Choose between pumping, boosting, absorbing and staying low depending on the feature and what comes next.',
    coverage: ['Why expert riders don’t jump every feature', 'Feature shape and exit context', 'Pumping and pressure management', 'Jumping versus absorbing: goals and trade-offs', 'Scrub and low trajectories (coach-approved demonstrations only)', 'Intention versus actual trajectory on video'],
    specialist: ['Technique: coach-authored scrub technique and progression from approved demonstrations; no generalised high-speed prescriptions.']
  },
  {
    id: 'A-JUMP-03', slug: 'landing-flight-control', title: 'Landing Mechanics and Flight Control',
    pathway: 'jump', release: 'B', status: 'outline', risk: 2, riskNote: 'Class 3 if tied to high-consequence tricks.', reviewer: 'Advanced air coach',
    sources: { primary: ['a08'], comparison: ['t14', 'a01', 'a06', 'a07'] },
    outcome: 'Understand landing transitions, bike alignment and absorption, and treat the landing and the exit line as one movement.',
    coverage: ['Transition geometry and landing zones', 'Rider and bike alignment through contact', 'Absorption and mobility', 'Landing and exit as one movement', 'Diagnosing harsh, off-axis, nose-heavy or rear-heavy landings from video', 'When to stop, reset or ask a coach to inspect the feature'],
    specialist: ['Corrections for each landing error.']
  },
  {
    id: 'A-JUMP-04', slug: 'jump-lines', title: 'Reading Jump Features and Building a Jump Line',
    pathway: 'jump', release: 'B', status: 'outline', risk: 2, riskNote: 'Pack range Class 2–3 depending on the feature; the audit chose Class 2.', reviewer: 'Advanced air coach',
    sources: { primary: ['a05', 'x02'], comparison: ['a07', 'd04', 't13'] },
    outcome: 'Read a jump line as a sequence and understand how rhythm and speed change when features are linked.',
    coverage: ['Feature inspection and line mapping', 'Takeoff, landing and next approach as a chain', 'Rhythm, speed management and decision points', 'Building a line progression with a coach', 'Filming and reviewing a full line'],
    specialist: ['Watch or read a05 and d04 before review.']
  },

  // ============================================================
  // TRICK LIBRARY: outlines only; specialist authoring required
  // ============================================================
  { id: 'T-TRICK-01', slug: 'whip', title: 'Whip: Shape, Timing and Recovery', pathway: 'tricks', release: 'B', status: 'outline', risk: 2, riskNote: 'Pack range Class 2–3; the audit chose Class 2 (style on familiar jumps). Cannot publish until a specialist writes the technique.', reviewer: 'Freestyle coach',
    sources: { primary: ['t05', 't06'], comparison: ['a01', 'a05'] },
    outcome: 'Define a controlled whip, compare how two expert sources explain it, and build an error library.',
    coverage: ['A controlled whip versus an uncontrolled sideways movement', 'Compare the Söderström article with the Samson video', 'Takeoff context, controlling the shape, recovering alignment', 'Slow-motion front, side and rear examples', 'Error library: fish whip, insufficient recovery, inconsistent direction, off-axis landing'],
    specialist: [...TRICK_GAPS, 'Mistake corrections: fish whip, straight takeoff/forced whip, late recovery.'] },
  { id: 'T-TRICK-02', slug: 'tabletop', title: 'Tabletop: Style and Bike Rotation', pathway: 'tricks', release: 'B', status: 'outline', risk: 2, riskNote: 'Pack range Class 2–3; the audit chose Class 2.', reviewer: 'Freestyle coach',
    sources: { primary: ['t10'], comparison: ['t17', 'a01'] },
    outcome: 'Understand the tabletop as a controlled bike rotation in flight, and what separates a deliberate tabletop from a late or uncontrolled one.',
    coverage: ['Tabletop as controlled bike rotation', 'Multiple-angle expert demonstrations', 'Symmetry, timing and return to landing alignment'],
    specialist: [...TRICK_GAPS, 'No text-verified source.'] },
  { id: 'T-TRICK-03', slug: 'trick-180', title: '180: Spin, Fakie and Ride-Away Control', pathway: 'tricks', release: 'C', status: 'outline', risk: 3, reviewer: 'Freestyle coach (verified specialist)',
    sources: { primary: ['t11'], comparison: ['t17', 't03', 't04'] },
    outcome: 'Understand the aerial 180 as a half rotation, and how landing and riding away differ by feature.',
    coverage: ['The aerial 180 versus a low-speed pivot turn (separate lessons)', 'Rotational awareness, spotting and fakie/ride-away', 'Video comparison rubric'],
    specialist: [...TRICK_GAPS, 'No text-verified source.'] },
  { id: 'T-TRICK-04', slug: 'trick-360', title: '360: Rotation, Spotting and Landing Orientation', pathway: 'tricks', release: 'C', status: 'outline', risk: 3, reviewer: 'Freestyle coach (verified specialist)',
    sources: { primary: ['t04', 't03'], comparison: ['t11', 't02'] },
    outcome: 'Understand the 360’s components at a conceptual level and the questions a coach uses to diagnose it.',
    coverage: ['Compare Ray George, Tom Cardy and MTB Hopper perspectives', 'Concepts: feature choice, takeoff, rotation, visual orientation, landing alignment', '360 off a jump versus off a drop', 'Diagnostic questions: under- and over-rotation, off-axis takeoff, losing the spot'],
    physicsIdea: 'Angular momentum: once in the air, a rider’s rotation can only be adjusted by changing body shape, not started from nothing.',
    specialist: [...TRICK_GAPS] },
  { id: 'T-TRICK-05', slug: 'no-foot-can', title: 'No-Foot Can and Can-Can Variations', pathway: 'tricks', release: 'C', status: 'outline', risk: 3, reviewer: 'Freestyle coach (verified specialist)',
    sources: { primary: ['t12'], comparison: ['t17', 't02'] },
    outcome: 'Define the no-foot can and related leg variations, and the air awareness they demand.',
    coverage: ['Definitions and variations', 'Air awareness, foot return, bike stability', 'Named faults: uneven leg movement, late reconnection'],
    specialist: [...TRICK_GAPS, 'No text-verified source.'] },
  { id: 'T-TRICK-06', slug: 'no-hander', title: 'Tuck No-Hander and Suicide No-Hander', pathway: 'tricks', release: 'C', status: 'outline', risk: 3, reviewer: 'Freestyle coach (verified specialist)',
    sources: { primary: ['t09'], comparison: ['t17'] },
    outcome: 'Distinguish the two no-hander shapes, neither of which is a beginner trick.',
    coverage: ['The two variations', 'Release and reconnection at a conceptual level', 'Prerequisite prompt: familiarity jumping varied ramp types'],
    specialist: [...TRICK_GAPS, 'No text-verified source.'] },
  { id: 'T-TRICK-07', slug: 'barspin', title: 'Barspin: Rotation, Catch and Bike Setup', pathway: 'tricks', release: 'C', status: 'outline', risk: 3, reviewer: 'Freestyle coach (verified specialist) and a mechanic for setup',
    sources: { primary: ['t15'], comparison: ['t16', 't18'] },
    outcome: 'Define the barspin family and understand the bike-setup questions, reviewed separately by a mechanic.',
    coverage: ['Barspin, bus driver and related variations', 'Bike compatibility and brake-hose routing (mechanic-reviewed)', 'Common faults: missed catch, hose interference, loss of landing control'],
    specialist: ['Technique: coach-authored release, spin and catch phases from a specialist-reviewed video lesson; mechanic-reviewed setup section.', ...TRICK_GAPS.slice(1), 'No DIY brake or steering modifications without a competent mechanic.'] },
  { id: 'T-TRICK-08', slug: 'tailwhip', title: 'Tailwhip: Frame Rotation and Recovery', pathway: 'tricks', release: 'C', status: 'outline', risk: 3, reviewer: 'Freestyle coach (verified specialist)',
    sources: { primary: ['t08'], comparison: ['t19', 't02'] },
    outcome: 'Understand the tailwhip as a frame rotation around the steering axis and the coordinated demands it makes.',
    coverage: ['Definition', 'Frame rotation, rider stability, visual tracking, foot return', 'Common faults: incomplete rotation, missed catch, late recovery'],
    specialist: [...TRICK_GAPS, 'No text-verified source.'] },
  { id: 'T-TRICK-09', slug: 'superman', title: 'Superman and Superman Seat Grab', pathway: 'tricks', release: 'C', status: 'outline', risk: 3, reviewer: 'Freestyle coach (verified specialist)',
    sources: { primary: ['t02'], comparison: ['t17'] },
    outcome: 'Define the trick family and its high-level movement demands.',
    coverage: ['Superman versus seat-grab variation', 'Separation, extension, orientation and return at a conceptual level'],
    specialist: [...TRICK_GAPS, 'The main source is a paid course outline; nothing from inside the course is assumed.'] },
  { id: 'T-TRICK-10', slug: 'indian-air', title: 'Indian Air', pathway: 'tricks', release: 'C', status: 'outline', risk: 3, reviewer: 'Freestyle coach (verified specialist)',
    sources: { primary: ['t02'], comparison: ['t17'] },
    outcome: 'Define the Indian Air and how it differs from related Superman shapes.',
    coverage: ['Definition and related shapes', 'Body-bike separation and recovery at a conceptual level'],
    specialist: [...TRICK_GAPS, 'The main source is a paid course outline.'] },
  { id: 'T-TRICK-11', slug: 'backflip', title: 'Backflip: Expert Aerial Rotation', pathway: 'tricks', release: 'C', status: 'outline', risk: 3, reviewer: 'Expert aerial coach (verified specialist)',
    sources: { primary: ['t01'], comparison: ['t02'] },
    outcome: 'Theory only: what expert riders describe about the backflip’s phases, and the coach and facility pathway required before any attempt.',
    coverage: ['High-consequence warning: a written lesson cannot prepare a rider to attempt a backflip', 'Expert commentary and video breakdown', 'Physics visualisation of rotation', 'Coach and facility pathway: assessment, purpose-built environment, expert supervision, emergency plan, documented approval'],
    physicsIdea: 'Rotation and moment of inertia: tucking speeds rotation up, extending slows it. Theory only.',
    specialist: ['Technique: specialist-authored theory review of each phase. No unsupervised drills, dimensions, speeds or “try this next”.', 'Progression: coach and facility pathway only.', 'Corrections: coach-approved.'] },
  { id: 'T-TRICK-12', slug: 'frontflip', title: 'Frontflip: Expert Aerial Rotation', pathway: 'tricks', release: 'C', status: 'outline', risk: 3, reviewer: 'Expert aerial coach (verified specialist)',
    sources: { primary: ['t02'], comparison: [] },
    outcome: 'Theory only: how the frontflip’s demands differ from the backflip’s, with a specialist’s risk assessment.',
    coverage: ['Conceptual comparison with the backflip', 'Expert demonstration', 'Specialist risk assessment'],
    specialist: ['Technique: specialist risk assessment and theory content. No self-guided execution sequence or attempt prescription.', ...TRICK_GAPS.slice(1)] },
  { id: 'T-TRICK-13', slug: 'drop-360', title: '360 Off a Drop', pathway: 'tricks', release: 'C', status: 'outline', risk: 3, reviewer: 'Expert freeride coach (verified specialist)',
    sources: { primary: ['t02'], comparison: ['t03', 't04'] },
    outcome: 'Understand why a 360 off a drop is a different problem from a 360 off a shaped jump.',
    coverage: ['Drop versus jump: edge geometry, landing zone, control margins'],
    specialist: [...TRICK_GAPS] },
  { id: 'T-TRICK-14', slug: 'trick-combos', title: 'Trick Combinations and Slopestyle Run Composition', pathway: 'tricks', release: 'C', status: 'outline', risk: 3, reviewer: 'Expert specialist reviewer',
    sources: { primary: ['t02'], comparison: ['t17', 'a01'] },
    outcome: 'Organise tricks into a skill graph and understand slopestyle run composition at a planning level.',
    coverage: ['Trick families as a skill graph', 'Run composition: feature compatibility, consistency, amplitude, risk exposure', 'Training a trick in isolation versus a full run under pressure'],
    specialist: [...TRICK_GAPS, 'The Trick Library pathway needs a specialist to approve its stage order and set readiness gates.'] }
];
