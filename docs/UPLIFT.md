# Uplift: the Ultimate Bike Park Operations Challenge

This is the Algebra 1 lab for Systems of Equations, built from [PRDs/Algebra1/UPLIFT.md](../PRDs/Algebra1/UPLIFT.md).

- **Address:** `/learning-lab/uplift/`, tracking id `uplift` (the PRD's proposed route).
- **Curriculum:**
  - It covers all four topics (Graphing Systems, Substitution, Elimination, Applications of Systems) and all 12 of their skills.
  - Its home topic is Graphing Systems.
  - Each topic page opens its own stage, for example "Opens at: Stage 3: Stock the Workshop".
- **Time:** 40–55 minutes. **Level:** beginner to advanced.

## Checking the PRD

Every example in section 29 is recomputed by the lab's systems engine (`logic/systems.js`, exact fractions) and tested in `scripts/test-uplift.mjs`. All of them are right:

| PRD item | Result |
|---|---|
| C = 8r + 12, C = 4r + 36 | one solution, (6, 60) |
| y = 6x + 20, y = 6x + 30 | no solution |
| y = 8(x + 2), y = 8x + 16 | infinitely many |
| x + y = 18, 60x + 90y = 1260 | (12, 6), verified in both |
| x + y = 20, 50x + 80y = 1240 | (12, 8) |
| 2x + 3y = 310, 4x + 3y = 470 | (80, 50) |
| 3x + 2y = 260, 2x + 3y = 240 | (60, 40), via × 3 and × −2 |
| Mixture x + y = 10, 0.9x + 0.5y = 7 | (5, 5): 10 yd³, 7 yd³ clay, 70% clay, 30% sand |
| D = 300 + 120t, D = 160t | t = 7.5 days, D = 1,200 ft |
| 12 + 8r = 36 + 4r | r = 6, $60 |

No corrections were needed.

**How the engine works:**
- It decides one, none or infinitely many solutions from the equations' structure: the determinant, then whether the rows are proportional. It never treats a failed solve as "no solution".
- Every final answer is checked in both original equations.
- Graph intersections are calculated first; the graph only draws them.
- Nothing typed by a student is evaluated with `eval`.

**Disclaimers:**
- Every price, quantity and rate is labelled as a fictional instructional scenario.
- The 70/30 soil blend is described as one published pump-track project's specification, not a universal recipe.
- The stockpiles and the volume model are labelled simplified, needing professional assessment in real life.
- Crew rates are hypothetical, and the lab points to IMBA's broad ranges of real output.

check-site enforces all of these.

**Real places:** the three destinations are named for regions (Tasmania, the Swiss Alps, British Columbia). The PRD's real parks and operators are inspiration only and aren't named in the lab, so no fictional price reads as a real one.

## The experience

| Part | What happens |
|---|---|
| Operations HQ (board) | The student chooses a destination (rainforest, alpine or gravity park). It changes the scenery only. Below it are an opening-day progress bar and four department cards: Uplift Operations, Rental Fleet, Workshop and Trail Construction. Three cards use the photos in `assets/photos/Alg1_SystemsofEquations/`. Each card fills in with its solved numbers when its stage badge is earned. |
| 1 The Uplift Showdown (graphing) | Write both shuttle plans. A prediction leads to graphing each line, placing the intersection and solving 8r + 12 = 4r + 36. The **live pricing graph** has a rides slider, the cheaper plan highlighted and a break-even dashboard, and the plans can be edited to see parallel or identical lines. Then the **solution classifier** (one, none, infinite), a written answer on why the intersection solves the system, the strategy challenge with new values, and practice. |
| 2 Build the Rental Fleet (substitution) | A prediction leads to the **fleet builder**: a bike rack with both conditions checked live. Then writing both equations, isolating x, choosing the correct substitution (the no-brackets trap), solving, and verifying both equations. Then (10, 8) is shown to satisfy only one equation, and a fractional fleet (7.5 bikes) has to be handled. The **substitution workbench** lets students pick which variable to isolate and step through the working. Then choosing what to substitute, including negative and fractional cases, the 20-bike challenge, and practice. |
| 3 Stock the Workshop (elimination) | Invoices and workshop stock fill in as the prices are found. Matching 3y terms are subtracted (with the sign-error trap), then both invoices are verified. Mismatched coefficients come next: scaling every term (with the one-side trap), then the **coefficient scaler**, which shows when a variable cancels and when 0 = 10 means no solution. Then method choice on four systems, with no single method required, a written answer, and practice. |
| 4 Run the Mountain (applications) | The **dirt mixing station** shows the volume, clay, sand and percentage, and whether both equations hold. The mixture is solved, plus a 75% berm mix. The **crew progress simulator** (prediction first) has progress bars and lines that meet at 7.5 days. A rider problem tests miles versus hours. Then the break-even challenge (higher fee/lower rate, the same rate, the same model) and the operations method challenge: choose the unknowns, write the system, choose a method, solve and check. Plus practice. |
| Mountain Operations Certification | 10 questions: 3 graphing, 2 substitution, 2 elimination, 3 applications. There are 4 rounds with new values, covering every solution type and a mixture, rate, break-even and fleet problem. The pass mark is **8 of 10**. A short written answer is saved for the tutor. |
| Opening Day Command Center | All four departments with their verification in both equations, plus a shuttle-plan recommendation from the expected rides. Each department is approved once its stage is done. When all four are approved, **THE MOUNTAIN IS OPEN.** appears, with the four badges and the certification. |
| Report | Accuracy for each of the four topics, plus equation setup, verification and method-selection lines, and departments approved. The buttons are Revisit a department, Retry certification and View opening day dashboard. |

The badges are Uplift Strategist, Fleet Manager, Workshop Commander and Mountain Operations Director. Passing the certification gives the title Certified Bike Park Operations Director.

## Shared changes

- **`slope-lab/components/figures.js`:** `gridSvg` takes `lines: [{ pts, cls, label }]` to draw several lines at once, such as a system's two lines under the point plotter. Existing figures are unchanged.
- **`dream-line-project/components/shared.js`:** `reportBlocks` takes an optional `revisitLabel`. It defaults to "Revisit a stage".

## Setting it up

Re-run these in the Supabase SQL Editor:
1. `supabase/curriculum.sql`, which registers the lab's questions against the 12 skills.
2. `supabase/catalog.sql`
3. `supabase/rewards.sql`, which adds the reward activity and the `uplift.final` assessment.

## Files and tests

```
learning-lab/uplift/
  index.html, main.js       the page and its site connection (id "uplift")
  uplift.js                 config, the four stage pages, certification, command center
  logic/systems.js          the engine: solve and classify, verify, substitution and elimination steps, mixture, rate, break-even
  logic/park.js             the fictional park: plans, fleet, invoices, stockpiles, crews, destinations, departments, notes
  logic/questions.js        every question, practice sets, certification rounds
  logic/workbench.js        Math Workbench content
  components/labs.js        pricing graph, classifier, fleet builder, substitution workbench, invoices, scaler, mixing station, crew simulator, HQ, command center
  components/visuals.js     destination scenes, workshop, bikes, opening art
  styles/uplift.css         scoped under .upl
```

```
node scripts/test-uplift.mjs   # PRD sections 29 and 30, engine, every question, curriculum (54)
node scripts/check-site.mjs    # disclaimers, structural classification, photos, stage links on all four topic pages
```

The real-Chrome run-through passed **52/52**. It covered:
- the destination choice and the photos
- the prediction gates
- every misconception trap tried
- the pricing graph (parallel and identical plans)
- the classifier
- the fleet builder
- the substitution workbench steps and checks
- the scaler (cancelling and 0 = 10)
- the mixing station
- the crew simulator
- progress after a reload
- passing at 8 of 10
- approving all four departments to open the mountain
- the report and tutor mode
- phone width on every page

After the shared changes, Frame the Line (49), Map the Line (39), Unit 1 (57), Unit 2 (46) and the 10-lab smoke test were re-run, along with their unit suites. All pass.
