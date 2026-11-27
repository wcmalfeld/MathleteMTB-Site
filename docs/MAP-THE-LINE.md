# Map the Line: the MTB Ride Data Lab

This is the Algebra 1 lab for Unit 3: Linear Relationships. It was built from [PRDs/Algebra1/linearRelationships.md](../PRDs/Algebra1/linearRelationships.md).

As the PRD asks, it **extends the Slope & Linear Relationships Lab** rather than competing with it:
- **Same address and id:** it lives at `/learning-lab/slope-lab/` with tracking id `slope-lab`, so course links, saved answers and rewards rows carry on.
- **Old shell replaced:** the old app (Learn, Explore and Practice pages) is gone.
- **Everything useful kept:**
  - the **original 32 questions** with their ids, diagrams and specialised checker
  - the **slope engine**
  - the **Trail Designer's ideas**, now in the rise-over-run visualizer and the trail profile designer

- **Curriculum:** it covers all six Unit 3 topics and all 19 of their skills. Its home topic is Slope and Rate of Change.
- **Topic links:** each topic page opens its own stage, for example "Opens at: Stage 1: Scout the Mountain".
- **Skills from the original bank:** those questions still count toward the slope-intercept and writing-equations skills they mapped to before.
- **Time:** 40–55 minutes. **Level:** beginner to advanced.

## Checking the PRD

Every value in section 30 was recomputed by the engine (`logic/linear.js`, exact fractions), and all of them are right:

| PRD item | Result |
|---|---|
| Quadrants | I, II, III, IV and the origin |
| Different scales | (60, 10) |
| Profile points | (0, 1200) … (600, 1205) |
| (0, 1200) → (300, 1215) | ±0.05 = ±5% |
| Flat section | 0 |
| Vertical line | undefined (never Infinity) |
| 12 m over 240 m / 120 m | 5% / 10% |
| Linear / nonlinear tables | 1200, 1205, 1210, 1215 linear; 1200, 1205, 1211, 1215 nonlinear |
| Distance each minute | 0, 240, 480 … linear and proportional; pump track nonlinear |
| d = 240t | k = 240 m/min, through the origin |
| e = 1200 + 0.05x | linear, intercept 1200, not proportional |
| Riders | A k = 200, B k = 240, C ratios 180, 195, 210 (not proportional) |

No corrections were needed.

Two small clarifications:
- **Doubling the run:** the PRD's Stage 3 prediction ("elevation increases by 10 m but horizontal distance doubles") is asked as "same 10 m rise, run doubles from 200 to 400 m", so the answer is unambiguous: the slope halves.
- **Highest point:** "At what distance does the highest point occur?" is answered as "from 300 m to 400 m", because the profile is flat at 1215 m.

All the data is labelled fictional, and no real location is used. Grades are classroom calculations, not design standards. Undefined slope is never presented as a rideable trail. check-site enforces all of these.

## The experience

| Stage | What happens |
|---|---|
| 1 Scout the Mountain | A **mountain map** with a coordinate grid, the trailhead at the origin. Students tap features, or move a waypoint with sliders. Then quadrants, a point on an axis (no quadrant), the GPS finder (with reversed-order traps), a **map with 20 m and 5 m scales** (with count-instead-of-scale and same-scale traps), and a placement challenge on the grid. There is practice too. |
| 2 Plot Your Line | **Plot the GPS readings**: click to snap to the grid, or type them. Build the elevation profile on different scales; climb, flat and descent are labelled. A **linked map and profile** view: select a waypoint in either and both highlight. Then read the graph (click a point), describe patterns, and find a missing waypoint. |
| 3 Measure the Grade | Rise, run, slope and grade, uphill and downhill (signed vs "5% downhill"). A prediction (same rise, double the run) leads to the **rise-over-run visualizer**: drag point B or use the sliders, with live rise, run, slope, grade and angle, and an undefined vertical case. It carries the Trail Designer's challenges. Then slope from points, tables, graphs and words, the connector challenge, and run vs along-trail distance. Practice, plus the **original 24-question practice bank** at three levels (optional). |
| 4 Read the Terrain | Positive, negative, zero and undefined slope. Classify steep and shallow profiles. Negative slope isn't negative elevation, and not all downhills have the same slope. A short written explanation, with a sample response. |
| 5 Analyze Rider Data | Constant rate of change, first differences and y = 1200 + 0.05x. Four tables (linear or not), plus an **unequally spaced** one. Words, tables, graphs and equations in both directions. The **trail profile designer**: change one section and linearity breaks. Practice, plus the **original 8-question transfer challenge** (optional; still the `slope-lab.transfer` assessment). |
| 6 Find Your Flow | The **ride data dashboard**: speed and time sliders, and a head start that turns proportional into linear-not-proportional. Then d = 240t and k from a table, which graphs pass through the origin, linear vs proportional side by side, writing d = 180t and d = 210t, and the flow challenge with riders A, B and C. There is practice too. |
| Ultimate Ride Analysis Challenge | Five tasks (14 questions): map a network across all four quadrants; plot and read an elevation profile; positive, negative, zero and undefined slopes; a linear table, its rate and its equation; and classifying proportional, linear and nonlinear datasets. Students pass with **11 of 14**, across four networks. |
| Ride Data Report | The plotted map, the ordered-pair table, the profile, the slopes, the linear relationships, k, and the student's own interpretation (saved for the tutor). |
| Report | Accuracy and attempts for each of the six topics; answers done independently vs with help; misconceptions; review items; badges; and how many of the original bank's questions are done. |

The badges are Trail Scout, GPS Mapper, Grade Analyst, Terrain Reader, Ride Data Analyst and Flow Master.

The workbench, prediction-first steps, tutor panel and report blocks are the shared Algebra 1 ones from The Dream Line labs, so all of Algebra 1 has **one tutor interface**. The page loads Unit 1's `dream-line.css` for them.

## Progress continuity

- **Same storage slot:** the old lab saved to the same browser key the shell uses (`mathlete-slope-lab:v1:<student>`).
- **Migration:** on first load, `migrate()` renames old upper-case records (F3) to lower case (f3), so they count here.
- **Server records:** the server already stored lower-case ids (`slope-lab:f3`), so account history lines up too.
- **Snapshots:** `main.js` keeps the original bank's detailed answer snapshots for "Review My Mistakes".

## Kit change

`ask.js` now takes `q.figure`: an element, or a function that returns one, shown under the prompt, such as a table, graph or map. It's used for every question that has a figure, including the practice sets.

## Setting it up

Re-run these in the Supabase SQL Editor:
1. `supabase/curriculum.sql`, which registers the new question kinds.
2. `supabase/catalog.sql`
3. `supabase/rewards.sql`, which adds the Ultimate Ride Analysis Challenge as an assessment. The transfer assessment is unchanged.

## Files and tests

```
learning-lab/slope-lab/
  index.html, main.js         the page and its site connection (id "slope-lab")
  map-the-line.js             config, the six stage pages, the Ride Data Report, migration
  logic/linear.js             quadrants, scales, exact slope, linear and proportional tests
  logic/data.js               the fictional map, profile and ride datasets
  logic/questions.js          every question, practice sets, challenge rounds, the original bank's ids and ideas
  logic/workbench.js          Math Workbench content
  logic/slope.js, validate.js the original engine and checker (kept)
  content/questions.js        the original 32 questions (kept)
  components/figures.js       coordinate grid (axes through the origin, per-axis scales), profiles, tables
  components/labs.js          plotter (graded), map explorer, linked views, visualizer, designer, dashboard
  components/legacy.js        the original bank, graded by the original checker
  components/visuals.js       map art and the opening scene
  styles/map-the-line.css     scoped under .mtl
```

```
node scripts/test-map-the-line.mjs   # PRD tables, misconceptions, every question, migration, curriculum (44)
node scripts/test-slope-lab.mjs      # the original engine, checker and 32 questions (161)
node scripts/check-site.mjs          # one lab not two, data disclaimers, stage links on all six topic pages
```

The real-Chrome run-through passed **39/39**. It covered:
- migrating old answers
- the map explorer
- traps for axis points, scales and swapped coordinates
- snapping clicks and typing points
- the profile scale trap
- the linked views and clicking a point to read it
- the visualizer's challenges and its undefined case
- the original bank's checker and old ids, including the T5 graphing question
- the designer, the dashboard and the stage badges
- passing at 11 of 14
- the Ride Data Report and the report
- tutor mode
- phone width on every page

After the kit change, the Unit 1 (57) and Unit 2 (46) run-throughs and the 10-lab smoke test were re-run, and all pass.
