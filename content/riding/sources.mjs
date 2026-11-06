// Source registry for the riding curriculum (content/riding/curriculum.mjs).
// IDs follow COACHING-CONTENT-AUDIT.md: the pack's A/T/D ids in lower case,
// plus x01-x08 found during the audit. Pack D14 is the same page as a09,
// and D16 the same course as a02, so each is recorded once.
//
// access: the pack's content labels (section 1).
// checked: what could actually be checked.
//   'text'   - the page text was read and supports the lessons citing it
//   'video'  - the technique is in an embedded video nobody has watched yet
//   'closed' - the page could not be opened
//   'outline'- a public course outline; the course itself was not seen
// readThisPass: true where the text was read again on 2026-11-05 while
//   writing these drafts (most sites blocked automated reading).
//
// None of these creators or organisations has endorsed Mathlete. They are
// linked as further learning only. Lessons never copy their words, images
// or video.

export const SOURCES = {
  a01: { title: 'Advanced Air: Jumps & Drops Coach Development', creator: 'GSMBC', url: 'https://www.gsmbc.pro/coachingadvancedair', access: 'public_coaching_framework', checked: 'closed' },
  a02: { title: 'Advanced Coach Course: FLOW (Level 2/3)', creator: 'GSMBC', url: 'https://gsmbc.arlo.co/w/ns/courses/5-advanced-coach-course-flow', access: 'public_coaching_framework', checked: 'outline' },
  a05: { title: 'The Progression Guide', creator: 'Highland Mountain Bike Park', url: 'https://highlandmountain.com/progressionguide/', access: 'public_free_instruction', checked: 'closed' },
  a06: { title: 'Make Jumping Easier: How To Bike, Episode 10', creator: 'Ben Cathro · Pinkbike', url: 'https://www.pinkbike.com/news/video-make-jumping-easier-with-these-techniques-how-to-bike-with-ben-cathro-episode-10.html', access: 'public_free_instruction', checked: 'video' },
  a07: { title: 'How to Stop Casing Jumps (How Not To Bike)', creator: 'Ben Cathro · Pinkbike', url: 'https://www.pinkbike.com/news/video-how-to-stop-casing-jumps-how-not-to-bike-with-ben-cathro.html', access: 'public_free_instruction', checked: 'closed' },
  a08: { title: 'How to jump on a mountain bike', creator: 'Andy Barlow (Dirt School) with Olly Wilkins · MBR', url: 'https://www.mbr.co.uk/videos/skills/how-to-jump-on-a-mountain-bike-1', access: 'public_free_instruction', checked: 'text' },
  a09: { title: 'Lee Likes Bikes: course topics', creator: 'Lee McCormack', url: 'https://www.llbmtb.com/what-to-expect/', access: 'public_reference_index', checked: 'closed' },
  t01: { title: 'How To Backflip Like A Pro', creator: 'Blake Samson with pro freeriders · GMBN', url: 'https://www.youtube.com/watch?v=HU4oIUrcqKc', access: 'expert_demonstration', checked: 'closed' },
  t02: { title: 'Slopestyle: Advanced Drops and Jumps', creator: 'Cam Zink · Outside Learn', url: 'https://learn.outsideonline.com/slopestyle-advanced-drops-and-jumps', access: 'public_outline_paid_lesson', checked: 'outline' },
  t03: { title: 'How to 360 with Ray George', creator: 'Ray George · MTB-MAG', url: 'https://www.mtb-mag.com/en/video-how-to-360-w-ray-george/', access: 'expert_demonstration', checked: 'video' },
  t04: { title: 'How to spin a full circle on your mountain bike', creator: 'Tom Cardy · BikeRadar', url: 'https://www.bikeradar.com/features/how-to-spin-a-full-circle-on-your-mountain-bike', access: 'public_free_instruction', checked: 'text' },
  t05: { title: 'How to whip like a pro', creator: 'Martin Söderström · Red Bull', url: 'https://www.redbull.com/int-en/how-to-whip-like-a-pro-with-martin-soderstrom-bike', access: 'public_free_instruction', checked: 'closed' },
  t06: { title: 'How To Whip A Mountain Bike', creator: 'Blake Samson · GMBN', url: 'https://www.youtube.com/watch?v=-bvI7fQWt8o', access: 'expert_demonstration', checked: 'closed' },
  t08: { title: 'How to Tailwhip a Mountain Bike?', creator: 'Tom Cardy · MTB Hopper', url: 'https://mtbhopper.com/blogs/skills/how-to-tailwhip-a-mountain-bike', access: 'expert_demonstration', checked: 'closed' },
  t09: { title: 'How to Suicide or Tuck No Hander on a Mountain Bike?', creator: 'Tom and Jack Cardy · MTB Hopper', url: 'https://mtbhopper.com/blogs/skills/how-to-suicide-or-tuck-no-hander-on-a-mountain-bike-or-ebike', access: 'expert_demonstration', checked: 'video' },
  t10: { title: 'How to TableTop on a Mountain Bike?', creator: 'Tom Cardy · MTB Hopper', url: 'https://mtbhopper.com/blogs/skills/how-to-tabletop-on-a-mountain-bike', access: 'expert_demonstration', checked: 'video' },
  t11: { title: 'How to do a 360 degree turn on a Mountain Bike?', creator: 'Tom Cardy · MTB Hopper', url: 'https://mtbhopper.com/blogs/skills/how-to-do-a-360', access: 'expert_demonstration', checked: 'video' },
  t12: { title: 'How to No foot can a Mountain Bike?', creator: 'Tom Cardy · MTB Hopper', url: 'https://mtbhopper.com/blogs/skills/how-to-no-foot-can-a-mountain-bike', access: 'expert_demonstration', checked: 'video' },
  t13: { title: 'Jump Progression Session with Rich Drew', creator: 'Rich Drew · MTB Hopper', url: 'https://mtbhopper.com/blogs/skills/mtb-hopper-jump-progression-session-with-rich-drew', access: 'public_free_instruction', checked: 'closed' },
  t14: { title: 'How to Land Smoother', creator: 'Kyle April · MTB Hopper', url: 'https://mtbhopper.com/blogs/skills/how-to-land-smoother-with-kyle-april', access: 'public_free_instruction', checked: 'closed' },
  t15: { title: 'How to Barspin / Improve Your Technique', creator: 'Max Fredriksson · YouTube', url: 'https://www.youtube.com/watch?v=TclRMx9Wudk', access: 'expert_demonstration', checked: 'closed' },
  t16: { title: 'Barspin / freecoaster setup and bike jibbing', creator: 'GMBN Tech', url: 'https://www.youtube.com/watch?v=jMcy6jAifRI', access: 'public_free_instruction', checked: 'closed' },
  t17: { title: 'Riding.Guide: techniques and tricks index', creator: 'Riding.Guide', url: 'https://riding.guide/index.htm', access: 'public_reference_index', checked: 'closed' },
  t18: { title: 'Riding.Guide: Barspin', creator: 'Riding.Guide', url: 'https://riding.guide/mountain-biking-tricks/barspin.htm', access: 'public_reference_index', checked: 'closed' },
  t19: { title: 'Riding.Guide: Tailwhip', creator: 'Riding.Guide', url: 'https://riding.guide/mountain-biking-tricks/tailwhip.htm', access: 'public_reference_index', checked: 'closed' },
  d01: { title: 'Pro Tips With Alan Milway', creator: 'Alan Milway · Crankbrothers', url: 'https://www.crankbrothers.com/blogs/stories/milway', access: 'public_free_instruction', checked: 'video' },
  d02: { title: 'The Setup: checking in with Jackson Goldstone ahead of the 2026 World Cup', creator: 'Rémi Gauvin and Jackson Goldstone · FOX Factory on Pinkbike', url: 'https://www.pinkbike.com/u/foxfactory/blog/video-the-setup-with-remi-gauvin-checking-in-with-jackson-goldstone-ahead-of-the-2026-world-cup.html', access: 'expert_demonstration', checked: 'text', readThisPass: true },
  d03: { title: 'How to Brake to Go Faster', creator: 'GMBN', url: 'https://www.youtube.com/watch?v=_7sezyuPsDE', access: 'public_free_instruction', checked: 'video' },
  d04: { title: 'How to Pick Better Lines on Mountain Bike Trails', creator: 'GMBN', url: 'https://www.youtube.com/watch?v=udrhMpAos3c', access: 'public_free_instruction', checked: 'video' },
  d05: { title: 'Brendan Fairclough’s Skills Secrets: Line Choice', creator: 'Brendan Fairclough · MBR', url: 'https://www.mbr.co.uk/videos/skills/brendan-faircloughs-skills-secrets-line-choice?pid=335250', access: 'expert_demonstration', checked: 'closed' },
  d06: { title: 'Brendan Fairclough’s Secrets of Better Riding: Weighting and Unweighting', creator: 'Brendan Fairclough · MBR', url: 'https://www.mbr.co.uk/videos/skills/brendan-faircloughs-secrets-of-better-riding-weighting-and-unweighting', access: 'expert_demonstration', checked: 'text' },
  d07: { title: 'Brendan Fairclough’s Secrets of Better Riding: Braking and Pedalling', creator: 'Brendan Fairclough · MBR', url: 'https://www.mbr.co.uk/videos/skills/brendan-faircloughs-secrets-of-better-riding-braking-and-pedalling', access: 'expert_demonstration', checked: 'closed' },
  d08: { title: 'Brendan Fairclough’s Secrets of Better Riding: Movement on the Bike', creator: 'Brendan Fairclough · MBR', url: 'https://www.mbr.co.uk/videos/skills/brendan-faircloughs-secrets-of-better-riding-movement-on-the-bike', access: 'expert_demonstration', checked: 'text' },
  d09: { title: 'Maintaining Speed & Pumping Through Corners: How To Bike S3 E1', creator: 'Ben Cathro with Aimi Kenyon · Pinkbike', url: 'https://www.pinkbike.com/news/video-maintaining-speed-and-pumping-through-corners-how-to-bike-season-3-episode-1.html', access: 'public_free_instruction', checked: 'closed' },
  d10: { title: 'ZEP’s How To: Mythbusters and How to Learn', creator: 'Paul Howard · ZEP Mountain Bike Camps on Pinkbike', url: 'https://www.pinkbike.com/news/zeps-how-to-mythbusters-and-how-to-learn-2015.html', access: 'public_free_instruction', checked: 'text' },
  d11: { title: 'ZEP Mythbusters: Front Brake Skills for Steeps and Rock Rolls', creator: 'Paul Howard · ZEP Mountain Bike Camps on Pinkbike', url: 'https://www.pinkbike.com/news/video-front-brake-skills-for-steeps-and-rock-rolls.html', access: 'public_free_instruction', checked: 'text' },
  d12: { title: 'Pro MTB Suspension Setup (Bracketing Properly): How To Bike S2 E2', creator: 'Ben Cathro · Pinkbike / Outside', url: 'https://www.pinkbike.com/news/video-pro-mtb-suspension-setup-bracketing-properly--how-to-bike-season-2-episode-2.html', access: 'public_free_instruction', checked: 'video' },
  d13: { title: 'Practical Guide to Learning New MTB Skills: How To Bike S2 E1', creator: 'Ben Cathro · Pinkbike / Outside', url: 'https://www.pinkbike.com/news/video-ben-cathros-practical-guide-to-learning-new-mountain-bike-skills-how-to-bike-season-2-episode-1.html', access: 'public_free_instruction', checked: 'closed' },
  d15: { title: 'International Trail Rating System (ITRS)', creator: 'IMBA Europe', url: 'https://www.imba-europe.org/knowledge-hub/international-trail-rating-system-itrs/', access: 'public_reference_index', checked: 'text' },
  x02: { title: 'The Art of Flight: tabletops and doubles', creator: 'Olly Wilkins · MBR', url: 'https://mbr.co.uk/?p=331444', access: 'public_free_instruction', checked: 'text' },
  x03: { title: 'How to ride faster… without pedalling', creator: 'Andy Barlow · MBR', url: 'https://www.mbr.co.uk/how-to-2/ride-faster-without-pedalling-353567', access: 'public_free_instruction', checked: 'text', readThisPass: true },
  x04: { title: 'Brake Like a Boss: How To Bike S2 E4', creator: 'Ben Cathro · Pinkbike', url: 'https://www.pinkbike.com/news/video-brake-like-a-boss-how-to-bike-season-2-episode-4.html', access: 'public_free_instruction', checked: 'video' },
  x05: { title: 'Improving Elite Riders’ Skills: Eyes Up to Go Fast: How To Bike S3 E3', creator: 'Ben Cathro with Thibault Laly · Pinkbike', url: 'https://www.pinkbike.com/u/pinkbikeoriginals/blog/improving-elite-riders-skills-eyes-up-to-go-fast--how-to-bike-s3-e3.html', access: 'public_free_instruction', checked: 'video' }
};

export const ACCESS_LABELS = {
  public_free_instruction: 'Free instruction',
  public_outline_paid_lesson: 'Paid course (outline only)',
  public_coaching_framework: 'Coach education framework',
  public_reference_index: 'Reference index',
  expert_demonstration: 'Expert demonstration'
};

export const CHECKED_LABELS = {
  text: 'Text reviewed',
  video: 'Video only: not yet watched',
  closed: 'Could not be opened',
  outline: 'Outline only'
};
