# Berm Lab (Mathlete MTB)

Built from `PRDs/bermLab.md`: phases 1–5, plus the student-progress part of
phase 6. It sits at `learning-lab/berm-lab/`, in The Lab → **Engineering Lab**,
where it takes over the "Berm Lab" placeholder (catalog id `berm-lab`, now
available). On the Lab home page it's featured second, after Jump Lab. It's
public (no account needed), and signed-in students' answers are saved to their
account.

It's built like [Carve Lab](CARVE-LAB.md) and shares its patterns: a
standalone module, the same question, help, graph and challenge machinery,
and a root class of `.blab`.

## What's in it

| Section | What students do |
|---|---|
| **Simulator** | Five controls: riding line 3–12 m with Tight 4 / Middle 6 / Wide 8 quick picks, speed 5–35 km/h (also shown in m/s, mph optional), berm angle 0–45°, rider + bike mass 35–120 kg, and an illustrative available grip of 0.2–0.8. Each control has live "what just changed" feedback. **Top-down view:** the 180° corner with all three lines and the selected one highlighted, entry, apex and exit, the centre and radius, velocity, acceleration and net force, and "Ride all three lines together" (three riders race from the entry). **Cross-section view:** the bank angle, the lean angle, and the normal force, friction (up or down the berm), gravity and net force. Every vector has a hover explanation. The traction indicator reads within, approaching or exceeds the modeled grip; when it's exceeded the line turns dashed and the lab explains why. It never shows a crash. |
| **Analysis** | Grip needed vs. available (with a meter), radius, acceleration (and g), net force, lean, matched speed (or "flat corner: none"), and normal and friction forces. **Four graphs:** acceleration vs. speed (½v, 2v and 3v marked), grip vs. berm angle (the matched angle and the available-grip line), grip vs. radius, and force vs. mass. Each has a reveal-the-equation panel, and clicking or pressing Enter sets that value. **Line comparison:** predict first, then reveal Tight, Middle and Wide side by side. **Saved experiments.** |
| **Challenge Arena** | The PRD's six challenges: Pick Your Line, Speed Is Squared, Find the Berm Sweet Spot, Flat Corner vs. Berm, Does Weight Matter?, and The Perfect Berm. Each runs prediction → experiment → maths → explanation → takeaway. |
| **The Model** | The equations, 15 explanations (including why "centrifugal force" isn't a real outward force), the model's limits, and a note that it isn't riding advice. |

## The maths

Everything comes from `logic/physics.js`, which works in SI units internally
and in radians for angles:

- a = v²/r
- F = mv²/r
- θ = arctan(v²/rg)
- q = v²/(rg)
- N = mg(cos β + q sin β)
- f = mg(sin β − q cos β)
- μ = |f|/N
- matched speed = √(rg tan β), with no matched speed on a flat corner
- distance πr, time πr/v

The tests confirm the force balance holds everywhere on the controls. They
also confirm the identity μ = |tan(β − θ)|: the grip demand is zero exactly
when the berm angle equals the lean angle. Challenge 6 uses that identity to
find a whole window of good designs.

## Setup (once)

In the Supabase **SQL Editor**, re-run these, in this order:

1. `supabase/progress.sql` registers the 19 `berm-lab:*` question kinds.
2. `supabase/catalog.sql` flips `berm-lab` from coming soon to available.

Until then the lab works fully, but signed-in answers aren't saved.

## Tests

- `node scripts/test-berm-lab.mjs` runs 67 checks: the PRD examples, the force
  balance, flat corners, units, bad input, geometry, every challenge answer,
  answer checking and progress.
- `node scripts/check-site.mjs` covers scoping, independence, that the
  question kinds match `progress.sql`, and the listings.
- A real-Chrome run-through passed 50/50 before release.

## Not built (yet)

- **AI Math Coach:** the site has no AI service; the lab works fully without
  one.
- **Saved experiments across devices:** they're kept in one browser.
- **Assigning challenges and a tutor review of saved setups:** these come with
  classes and assignments.
- **The PRD's future modules:** Flat Corner Lab, Berm Builder, line
  optimization and Pump the Berm. Each would be a separate model.
