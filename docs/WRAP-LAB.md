# Wrap Lab: the Custom MTB Frame Protection Studio

This is the Algebra 1 lab for Polynomials and Factoring, built from [PRDs/Algebra1/WRAP_LAB.md](../PRDs/Algebra1/WRAP_LAB.md).

- **Address:** `/learning-lab/wrap-lab/`, tracking id `wrap-lab` (the PRD's proposed route).
- **Curriculum:**
  - It covers all four topics (Adding and Subtracting Polynomials, Multiplying Polynomials, Factoring Expressions, Factoring Quadratics) and all 12 of their skills.
  - Its home topic is Adding and Subtracting Polynomials.
  - Each topic page opens its own stage.
- **Time:** 40–55 minutes. **Level:** beginner to advanced.

## Checking the PRD

Every example in section 29 is recomputed by the kit's exact polynomial engine and tested in `scripts/test-wrap-lab.mjs`. All of them are right:

| PRD item | Result |
|---|---|
| (3x² + 4x + 2) + (2x² + 5x + 1) | 5x² + 9x + 3 |
| (8x² + 7x + 5) − (3x² + 2x + 1) | 5x² + 5x + 4 |
| (6x² + 5x + 2) − (2x² − 3x + 4) | 4x² + 8x − 2 |
| 3x(2x + 5), (x + 3)(x + 4), (x + 4)² | 6x² + 15x, x² + 7x + 12, x² + 8x + 16 |
| (x + 5)(x − 5), (2x + 1)(x + 3), (x + 2)(x² + 3x + 4) | x² − 25, 2x² + 7x + 3, x³ + 5x² + 10x + 8 |
| 12x + 18, 6x² + 9x | 6(2x + 3), 3x(2x + 3) |
| 3x + 6 + 2xy + 4y, x² + 5x + 3x + 15 | (x + 2)(3 + 2y), (x + 3)(x + 5) |
| x² + 7x + 12, x² + 5x + 6, x² − x − 12, x² − 7x + 12 | (x + 3)(x + 4), (x + 2)(x + 3), (x − 4)(x + 3), (x − 3)(x − 4) |
| 2x² + 7x + 3, x² + 10x + 25, x² − 6x + 9 | (2x + 1)(x + 3), (x + 5)², (x − 3)² |
| x² − 25, 4x² − 25 | (x + 5)(x − 5), (2x + 5)(2x − 5) |

The extra workshop examples are also right: (2x + 5)(x + 3), (3x + 2)(x + 3), (4x + 3)(x + 2) and 4x²(3x + 2). No corrections were needed.

**How factoring is handled:**
- Every factored answer in the bank is tested by multiplying it back to its expression.
- Quadratics are factored by the kit's integer factor-pair search, which reports "doesn't factor over the integers" (sums of squares, x² + 3x + 5…) rather than guessing.

**Disclaimers:**
- TrailSkin Studio is labelled fictional.
- Panel areas are labelled simplified rectangular models in abstract design units: not a curved frame's real surface, a real protection template or a cutting file.
- The cut-out picture needs x > 5, but the identity holds for every x.
- The PRD's real protection-film companies are inspiration only and aren't named in the lab.
- The bikes are original drawings.

check-site enforces all of these.

## The experience

| Part | What happens |
|---|---|
| Design studio (board) | Choose a downhill, enduro or dirt-jump frame, then tap any of six protection zones (top tube, down tube, seat tube, seatstays, chainstays, fork lowers) to cover it. Pick a palette (4), finish (gloss/matte), pattern (stripes, topographic, geometric, number plate) and a team or rider name, all drawn live on the frame. The **material board** lists each zone's panel-area polynomial and the combined film (engine sum). Stage ticks appear as badges are earned. |
| 1 Design the Protection Kit (adding and subtracting) | The **panel card sorter** (tap a card, then a bin; 3/x goes in "not a polynomial"), then classifying by degree and terms. The **algebra tile organizer** lays out both panels, flips the subtracted panel's tiles and groups like tiles. Then remaining material and the **negative distributor**, where you tap each term to apply the minus (flipping only the first is flagged). Then a mixed kit job, a written answer, and practice. |
| 2 Expand the Graphics (multiplying) | A prediction leads to the **binomial area model**: sliders for both sides and presets for (x + 3)(x + 4), (x + 4)², (x + 5)(x − 5) and (2x + 1)(x + 3). Its four regions are labelled, and it notes when the middle term doubles or cancels. Then monomial × polynomial, binomials, the square of a sum, the **cut-out square** (difference of squares, rearranged into an (x + b) by (x − b) rectangle) and the **multiplication grid** for longer polynomials. Then an error-correction and missing-product challenge, and practice. |
| 3 Optimize the Cut Sheets (factoring expressions) | The **GCF grouping board**: try a common factor and see the identical groups, plus whether it's the greatest. Then harder GCFs, the **grouping board** (factor each group, look for the common binomial, multiply back, and see when the brackets don't match), a grouping workshop, checking by multiplying back, and practice. |
| 4 Reverse Engineer the Panel (factoring quadratics) | Recover a panel's dimensions. The **factor pair finder** lists the pairs and their sums, and has a "No pair works" option for primes. Then leading coefficients (a × c, splitting the middle term) and the **quadratic factor builder**, where tiles arrange into a rectangle whose sides are the factors, or show that no whole-number rectangle exists. Then perfect squares, differences of squares (a sum of squares doesn't factor), a mixed challenge including a prime trinomial, and practice. |
| Custom Frame Designer Certification | 12 questions (3 add/subtract, 3 multiply, 2 factoring expressions, 4 quadratics) over 4 rounds. The pass mark is **10 of 12**. Each round has one "doesn't factor" item whose distractors are checked not to work. A short written answer is saved for the tutor. |
| Custom MTB Armor Blueprint | "‹KIT› — BLUEPRINT" shows the bike in your design, the coverage, each panel's area and the total, a window subtracted, the expanded panels, the optimized material, the recovered panel, a material summary at x = 4 design units, the badges and the certification. |

The badges are Pattern Designer, Graphics Expansion Specialist, Cut Sheet Optimizer and Master Pattern Engineer. Passing the certification gives the title Certified MTB Frame Designer.

The report adds counts of sign-distribution, multiplication, GCF and factoring slips, from the misconception codes the shell records.

## Kit changes

- **`lesson-kit/factor.js` (new), polynomials and factoring:**
  - `classify` gives degree, term count and names, and refuses 3/x and x⁻².
  - `polyText` gives standard form for one or several letters.
  - `gcfOf` finds the greatest common factor.
  - `factorQuadratic` does the integer ac-method search, takes out the common factor first, and returns null when there's no integer factorization.
  - `quadText` writes the factored form.
  - `checkFactored` grades factored answers:
    - Factors in any order are accepted.
    - An expanded form or half-finished grouping is sent back.
    - A common factor left inside a bracket is flagged (`incomplete-gcf`), and so is a factor that still factors (`not-fully-factored`).
    - A wrong answer is multiplied back: "your factors give …". Middle-term and sign slips get their own messages.
- **`lesson-kit/ask.js`:** new question type `factored`. Expansions use the existing `expression` type with `form: 'simplified'`.

## Setting it up

Re-run these in the Supabase SQL Editor:
1. `supabase/curriculum.sql`
2. `supabase/catalog.sql`
3. `supabase/rewards.sql`, which adds the reward activity and the `wrap-lab.final` assessment.

## Files and tests

```
learning-lab/wrap-lab/
  index.html, main.js       the page and its site connection (id "wrap-lab")
  wrap.js                   config, the four stage pages, certification, blueprint
  logic/studio.js           the fictional studio: bikes, zones and their areas, palettes, notes
  logic/questions.js        every question, practice sets, certification rounds
  logic/workbench.js        Math Workbench content
  components/labs.js        sorter, tile organizer, negative distributor, area model, grid, cut-out square, GCF board, grouping board, pair finder, tile builder, studio, blueprint
  components/visuals.js     three original frames with six selectable zones, film patterns, opening art
  styles/wrap.css           scoped under .wrp
```

```
node scripts/test-wrap-lab.mjs   # PRD sections 29 and 30, factoring engine, every question multiplies back, visual models, curriculum (43)
node scripts/check-site.mjs      # disclaimers, factoring checks, no eval, stage links on all four topic pages
```

The real-Chrome run-through passed **45/45**. It covered:
- choosing a bike, covering zones and the combined film
- the palette and rider name
- the sorter, the tile organizer and the negative distributor
- the area-model presets and the cut-out square
- the multiplication grid
- the GCF and grouping boards (including no common binomial)
- the pair finder (including "no pair works")
- the tile builder (rectangle and prime)
- every misconception trap tried, including expanded and half-finished answers being sent back and multiply-back feedback
- every badge, and the design kept after a reload
- passing at 10 of 12
- the blueprint, the report's slip counts and buttons, and tutor mode
- phone width on every page

After the kit change, every lab's unit tests and the Project Evolve (49), Uplift (52), Frame the Line (49), Map the Line (39), Unit 1 (57), Unit 2 (46) and 10-lab browser runs all pass.
