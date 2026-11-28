// Wrap Lab: the fictional studio. TrailSkin Studio is invented; every area
// expression is an abstract classroom model in design units, not a real
// protection template or a curved frame's true surface area. Pure; no DOM.

export const STUDIO = 'TrailSkin Studio';
export const MODEL_NOTE = 'TrailSkin Studio is fictional. Panel areas are simplified rectangular models in abstract design units: they don’t measure a real curved frame, and this isn’t a real protection template or cutting file.';
export const UNIT_NOTE = 'x is a variable design dimension in design units; the coefficients and constants keep each area in the same square design units.';
export const DOS_NOTE = 'The cut-out picture needs x > 5 so the small square fits inside; the algebra (x + 5)(x − 5) = x² − 25 works for every x.';

export const BIKES = [
  { id: 'dh', name: 'Downhill Race Bike', blurb: 'Long travel, a dual-crown fork, a big down tube and aggressive race graphics.' },
  { id: 'enduro', name: 'Enduro Bike', blurb: 'A full-suspension trail frame with a rocker link and modern geometry.' },
  { id: 'dj', name: 'Dirt Jump / Slopestyle', blurb: 'A compact hardtail with simple lines, bold colors and custom decals.' }
];
// Protection zones and their modeled panel areas (design units²).
export const ZONES = [
  { id: 'top', name: 'Top tube', area: '3x^2 + 4x + 2' },
  { id: 'down', name: 'Down tube', area: '2x^2 + 5x + 1' },
  { id: 'seat', name: 'Seat tube', area: 'x^2 + 3x + 2' },
  { id: 'stays', name: 'Seatstays', area: '2x^2 + x + 1' },
  { id: 'chain', name: 'Chainstays', area: 'x^2 + 2x + 3' },
  { id: 'fork', name: 'Fork lowers', area: '2x^2 + 2x + 2' }
];
export const PALETTES = [
  { id: 'ember', name: 'Ember', c: ['#E0632F', '#F2B35A', '#1E1E1E'] },
  { id: 'glacier', name: 'Glacier', c: ['#8EC5E0', '#ECEFE7', '#22344A'] },
  { id: 'moss', name: 'Moss', c: ['#6CC37A', '#2C5E3F', '#E8BC4E'] },
  { id: 'neon', name: 'Neon', c: ['#E84AB5', '#5AE0D2', '#16121E'] }
];
export const FINISHES = [{ id: 'gloss', name: 'Gloss' }, { id: 'matte', name: 'Matte' }];
export const PATTERNS = [{ id: 'stripes', name: 'Stripes' }, { id: 'topo', name: 'Topographic' }, { id: 'geo', name: 'Geometric' }, { id: 'plate', name: 'Number plate' }];
// The studio's stock and the batch it cuts (Stage 1).
export const STOCK = '8x^2 + 7x + 5', BATCH = '3x^2 + 2x + 1';
