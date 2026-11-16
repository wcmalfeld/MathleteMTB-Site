// THE MATHLETE TUTORING TEAM
//
// Every tutor card, profile page, directory filter and the inquiry form's
// tutor list are generated from this file. To add, edit, publish, feature
// or reorder a tutor, change it here and run
//     node scripts/build-tutors.mjs
// then  node scripts/check-site.mjs  and push. See docs/TUTORS.md.
//
// Fields (all required unless marked optional):
//   id, slug        lowercase-with-hyphens; the profile lives at tutors/<slug>/
//   name, title
//   image           photo path from the site root (put it in assets/tutors/);
//                   portrait, ideally 4:5 and at least 600px wide
//   imageAlt        what the photo shows, for people who can't see it
//   shortBio        2-3 sentences for the card and the top of the profile
//   biography       paragraphs (an array of strings)
//   teachingPhilosophy  paragraphs (an array of strings)
//   subjects        ids from SUBJECTS in content/tutors/taxonomy.mjs
//   academicLevels  ids from LEVELS
//   specialties     short phrases, written for this tutor
//   interests       short words or phrases
//   formats         ids from FORMATS ('virtual', 'in-person')
//   formatNote      optional: how sessions run, e.g. 'Zoom with a shared whiteboard'
//   location        optional: general area only for in-person (never an address)
//   availability    optional: general scheduling only (e.g. 'Weekday afternoons')
//   featured        true to show on the Private Tutoring page and first in the directory
//   published       false hides the tutor everywhere (their page is removed on the next build)
//   displayOrder    smaller numbers come first
//
// Write only what's true. No invented credentials, experience,
// testimonials or availability: leave optional fields out instead.
// Never put a tutor's personal email, phone number or address here.

export const TUTORS = [
  {
    id: 'will-malfeld',
    slug: 'will-malfeld',
    name: 'Will Malfeld',
    title: 'Founder & Mathematics and Physics Tutor',
    image: 'assets/tutors/will-malfeld.jpg',
    imageAlt: 'Will Malfeld laughing outdoors, in a white cap and a dark quilted jacket',
    shortBio: 'Will is a computer science graduate, educator, and lifelong mountain biker who believes the best learning happens when students can connect new ideas to things they already understand and care about.',
    biography: [
      'Will’s background combines software engineering, mathematics and physics education, mountain biking, and a passion for helping students approach problems from new perspectives.',
      'After earning his degree in computer science from the University of Colorado Boulder, Will worked as a software developer before spending multiple years teaching and mentoring students at World Class Academy, an international private academy for student-athletes.',
      'There, he taught mathematics and physics to students from around the world while helping them connect classroom concepts to their interests and experiences outside the classroom.',
      'Whether exploring the physics of a mountain bike jump, understanding the mathematics behind a trail, or working through a challenging algebra problem, Will enjoys finding ways to make abstract concepts tangible and engaging.',
      'His approach is centered on curiosity, problem-solving, and helping students build the confidence to figure things out independently.'
    ],
    teachingPhilosophy: [
      'Will believes students learn best when they understand why something works, not just which formula to memorize.',
      'Rather than relying exclusively on repetitive exercises, he looks for opportunities to connect academic concepts to real-world problems, student interests, and hands-on experiences.',
      'His goal is to help students become better problem-solvers, more independent learners, and more confident in their ability to tackle difficult challenges.'
    ],
    subjects: ['algebra-1', 'algebra-2', 'geometry', 'precalculus', 'calculus', 'physics', 'sat-math', 'general-math'],
    academicLevels: ['middle-school', 'high-school'],
    specialties: [
      'Interest-driven learning that connects math and physics to sports and the outdoors',
      'Real-world applications of mathematics and physics',
      'Rebuilding confidence for students who feel behind',
      'Helping students get ahead and explore advanced topics',
      'SAT and ACT math preparation'
    ],
    interests: ['Mountain biking', 'Skiing', 'Software development', 'Engineering', 'The outdoors', 'Building things'],
    formats: ['virtual'],
    formatNote: 'Sessions run on Zoom with a shared digital whiteboard.',
    featured: true,
    published: true,
    displayOrder: 1
  }
];
