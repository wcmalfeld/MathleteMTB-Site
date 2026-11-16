// The fixed lists tutors are described with. Tutors pick from these by id
// in content/tutors/tutors.mjs; the directory filters and the inquiry form
// are built from them (scripts/build-tutors.mjs).
//
// Adding an option here is safe. Renaming or removing an id that a tutor
// uses fails the build (it tells you which tutor to fix). The subject and
// tutor ids sent with an inquiry are only checked for their shape in the
// database (supabase/tutoring.sql), so changing these lists never needs SQL.
// LEVELS and FORMATS are checked exactly: if you add one, add it to the
// matching check in supabase/tutoring.sql too.

// `filter` groups subjects for the directory's subject filter, so
// "Algebra" finds tutors who teach Algebra 1 or Algebra 2.
export const SUBJECTS = [
  { id: 'algebra-1',    name: 'Algebra 1',           filter: 'algebra' },
  { id: 'algebra-2',    name: 'Algebra 2',           filter: 'algebra' },
  { id: 'geometry',     name: 'Geometry',            filter: 'geometry' },
  { id: 'precalculus',  name: 'Precalculus',         filter: 'precalculus' },
  { id: 'calculus',     name: 'Calculus',            filter: 'calculus' },
  { id: 'physics',      name: 'Physics',             filter: 'physics' },
  { id: 'sat-math',     name: 'SAT Math',            filter: 'sat-math' },
  { id: 'general-math', name: 'General Mathematics', filter: 'other' }
];

export const SUBJECT_FILTERS = [
  { id: 'algebra', name: 'Algebra' },
  { id: 'geometry', name: 'Geometry' },
  { id: 'precalculus', name: 'Precalculus' },
  { id: 'calculus', name: 'Calculus' },
  { id: 'physics', name: 'Physics' },
  { id: 'sat-math', name: 'SAT Math' },
  { id: 'other', name: 'Other' }
];

export const LEVELS = [
  { id: 'elementary',    name: 'Elementary' },
  { id: 'middle-school', name: 'Middle School' },
  { id: 'high-school',   name: 'High School' },
  { id: 'college',       name: 'College' }
];

export const FORMATS = [
  { id: 'virtual',   name: 'Virtual' },
  { id: 'in-person', name: 'In-person' }
];
