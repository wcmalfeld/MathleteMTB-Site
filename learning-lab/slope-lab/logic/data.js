// Map the Line: the fictional, controlled datasets. Map coordinates are
// illustrative grid positions, not GPS coordinates; trail profiles and
// rider data are invented for teaching, not measurements of real trails or
// riders. Nothing in the lab uses a student's real location.

export const DATA_NOTE = 'Every map, trail profile and ride dataset in this lab is fictional and invented for teaching: map positions are grid coordinates, not real GPS locations, and the profiles and rider data aren’t measurements of real trails or riders. No real location data is used.';
export const GRADE_NOTE = 'These grades are classroom calculations, not professional trail-design standards. Real trails rarely keep one constant grade.';

// Stage 1: the mountain map. The origin is the main trailhead.
export const MAP = { x: [-6, 6], y: [-6, 6] };
export const FEATURES = [
  { id: 'trailhead', name: 'Main trailhead', x: 0, y: 0, icon: 'hub' },
  { id: 'jumps', name: 'Tabletop jump zone', x: 3, y: 2, icon: 'jump' },
  { id: 'overlook', name: 'Northern overlook', x: -4, y: 3, icon: 'view' },
  { id: 'pump', name: 'Pump track', x: -3, y: -2, icon: 'pump' },
  { id: 'workshop', name: 'Workshop', x: 4, y: -3, icon: 'shop' },
  { id: 'jumpline', name: 'Jump line', x: 2, y: 5, icon: 'jump' },
  { id: 'berms', name: 'Berm section', x: -5, y: 1, icon: 'berm' },
  { id: 'rocks', name: 'Rock garden', x: -2, y: -4, icon: 'rock' },
  { id: 'viewpoint', name: 'Viewpoint', x: -6, y: 5, icon: 'view' },
  { id: 'finish', name: 'Finish area', x: 5, y: -5, icon: 'flag' },
  { id: 'wash', name: 'Bike wash', x: 0, y: -3, icon: 'shop' },
  { id: 'skills', name: 'Skills area', x: 4, y: 0, icon: 'berm' }
];
export const featureById = Object.fromEntries(FEATURES.map(f => [f.id, f]));
// Stage 1, Activity 4: a map with different scales on each axis.
export const SCALE_MAP = { sx: 20, sy: 5, unit: 'm', x: [-6, 6], y: [-6, 6],
  features: [{ id: 'kicker', name: 'Kicker', ix: 3, iy: 2 }, { id: 'drop', name: 'Drop-in', ix: -2, iy: 4 }, { id: 'hut', name: 'Shelter', ix: 5, iy: -3 }] };
// Stage 1, Activity 5: place these on the unfinished map.
export const SCOUT_PLACE = [{ name: 'Lift station', x: -4, y: 4 }, { name: 'Wall ride', x: 5, y: 2 }, { name: 'Creek crossing', x: -3, y: -5 }, { name: 'Bike park café', x: 2, y: -4 }];

// Stage 2: GPS waypoints of a route, and the fictional elevation profile.
export const ROUTE = [{ name: 'Trailhead', x: 0, y: 0 }, { name: 'Berm', x: 2, y: 3 }, { name: 'Tabletop', x: 4, y: 5 }, { name: 'Rock garden', x: 6, y: 2 }, { name: 'Finish', x: 8, y: -1 }];
export const PROFILE = [[0, 1200], [100, 1205], [200, 1210], [300, 1215], [400, 1215], [500, 1210], [600, 1205]];
export const PROFILE_NAMES = ['Trail start', 'Climb 1', 'Climb 2', 'Highest point', 'Flat section end', 'Descent 1', 'Finish'];
// Where each profile point sits on the overhead map (for the linked views).
export const PROFILE_MAP = [[-5, -4], [-3, -2], [-2, 0], [0, 2], [2, 3], [4, 1], [5, -1]];
export const PATTERN_A = [[0, 1200], [100, 1205], [200, 1210], [300, 1215]];
export const PATTERN_B = [[0, 1200], [100, 1205], [200, 1211], [300, 1215]];
export const MISSING = { rows: [[0, 1180], [100, 1186], [200, null], [300, 1198], [400, 1204]], answer: 1192 };

// Stage 5: rider data.
export const SPEED_TABLE = [[0, 0], [1, 240], [2, 480], [3, 720], [4, 960]];
export const PUMP_TABLE = [[0, 0], [1, 160], [2, 380], [3, 530], [4, 790]];
export const UNEVEN = [[0, 1200], [100, 1205], [300, 1215], [400, 1220]];
// Stage 6: three riders.
export const RIDERS = { A: [[1, 200], [2, 400], [3, 600]], B: [[1, 240], [2, 480], [3, 720]], C: [[1, 180], [2, 390], [3, 630]] };
