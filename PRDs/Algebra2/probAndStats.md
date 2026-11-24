# PRD: MATHLETE MTB — ALGEBRA 2
# THE ENDURO RACE INTELLIGENCE LAB: PROBABILITY & STATISTICS

**Product:** Mathlete MTB  
**Feature:** Enduro Race Intelligence Lab  
**Course:** Algebra 2  
**Unit:** Probability and Statistics  
**Activity Type:** Interactive Learning Lab / Race Simulation / Statistical Analysis  
**Target Audience:** High-school Algebra 2 students, particularly mountain bikers  
**Estimated Completion:** 30–35 minutes  
**Priority:** First flagship lesson for the Probability and Statistics unit

---

# 1. PRODUCT VISION

## The Big Idea

Build an interactive enduro race analytics experience where students learn probability and statistics by analyzing simulated mountain bike race data.

The student becomes a performance analyst for a fictional enduro racing team.

Their job is to investigate four different areas:

1. Race-day probability: What are the chances of different race outcomes, and how do conditions relate to performance?
2. Rider performance: How consistent are the riders, and how do their results compare with the entire field?
3. Statistical inference: What can we learn about a larger population from a smaller sample?
4. Race strategy experiments: Can we use experimental data to determine whether one approach produces better results than another?

The experience should feel like a professional mountain bike race analytics workstation.

Students should see race results, graphs, dashboards, probability tables, histograms, normal distributions, and interactive simulations.

The student should not simply calculate probabilities from disconnected textbook questions.

They should feel like they are analyzing the performance of an actual racing team.

## Core Educational Philosophy

Probability helps us reason about what might happen.

Statistics helps us understand what has happened.

Statistical inference helps us use the information we have to draw conclusions about a much larger population.

Mountain bike racing provides an excellent context for all three.

The goal is to help students understand that data is only useful when we know how to interpret it.

**The central principle: Don't just look at the numbers. Understand what they tell you, what they don't tell you, and how confidently you can make decisions from them.**

## Data Integrity Requirements

All numerical race datasets and experiments in this initial lesson are simulated educational examples.

Clearly label them as simulated data.

Do not represent fictional race statistics as actual professional race results.

Do not use the analysis to make safety recommendations about riding, weather, equipment, or trail conditions.

In particular, observational associations must not be presented as proof of causation.

---

# 2. CURRICULUM ALIGNMENT

Place this activity within:

Classes → Algebra 2 → Probability and Statistics → Enduro Race Intelligence Lab.

Use the existing Mathlete MTB curriculum hierarchy and skill identifiers.

## Primary Mathematical Skills

### Probability

1. Understanding sample spaces.
2. Identifying mutually exclusive events.
3. Identifying events that are not mutually exclusive.
4. Understanding intersections and unions.
5. Understanding complements.
6. Applying the addition rule.
7. Applying the multiplication rule.
8. Calculating conditional probability.
9. Understanding independent and dependent events.
10. Constructing tree diagrams.
11. Constructing two-way frequency tables.
12. Calculating joint, marginal, and conditional relative frequencies.
13. Using experimental probability.
14. Comparing theoretical and experimental probability.

### Statistics and Normal Distributions

15. Understanding populations and samples.
16. Calculating and interpreting the mean.
17. Calculating and interpreting the median.
18. Understanding range and standard deviation.
19. Describing the center, shape, and spread of distributions.
20. Understanding histograms and box plots.
21. Understanding normal distributions.
22. Applying the empirical rule.
23. Calculating z-scores.
24. Identifying percentiles.
25. Comparing performances using standardized scores.
26. Understanding when a normal model is appropriate.

### Statistical Inference

27. Distinguishing populations and samples.
28. Understanding random sampling.
29. Distinguishing surveys, experiments, and observational studies.
30. Understanding sampling variability.
31. Understanding sampling distributions.
32. Calculating standard errors.
33. Estimating population proportions and means.
34. Understanding margin of error.
35. Understanding the effect of sample size.
36. Comparing experimental treatments.
37. Using simulations to evaluate statistical significance.
38. Evaluating claims based on data.

## Learning Objectives

By completing the lesson, students should be able to:

- Calculate probabilities using real-world scenarios.
- Understand the difference between conditional and unconditional probability.
- Identify whether events are independent.
- Interpret two-way frequency tables.
- Calculate mean, median, range, and standard deviation.
- Describe the shape and spread of datasets.
- Understand normal distributions and the empirical rule.
- Use z-scores to compare individual performances.
- Interpret percentiles correctly.
- Explain the difference between populations and samples.
- Understand how random sampling affects statistical estimates.
- Calculate and interpret standard errors.
- Understand margin of error.
- Explain why increasing sample size generally improves estimate precision.
- Distinguish surveys, experiments, and observational studies.
- Compare two treatments using randomized experimental data.
- Use simulations to evaluate whether observed differences are statistically significant.
- Communicate evidence-based conclusions.

## Standards Alignment

Use these standards as the primary foundation:

### Probability

- HSS.CP.A.1: Sample spaces, unions, intersections, and complements.
- HSS.CP.A.2: Independent events.
- HSS.CP.A.3: Conditional probability.
- HSS.CP.A.4: Two-way frequency tables.
- HSS.CP.A.5: Interpreting conditional probability and independence.
- HSS.CP.B.6: Conditional probability.
- HSS.CP.B.7: Addition rule.
- HSS.CP.B.8: Multiplication rule extension.
- HSS.CP.B.9: Permutations and combinations extension.

### Statistical Inference

- HSS.IC.A.1: Statistical inference using random samples.
- HSS.IC.A.2: Evaluating probability models through simulation.
- HSS.IC.B.3: Comparing surveys, experiments, and observational studies.
- HSS.IC.B.4: Estimating population means and proportions.
- HSS.IC.B.5: Comparing experimental treatments.
- HSS.IC.B.6: Evaluating statistical reports.

### Normal Distributions

- HSS.ID.A.1: Histograms and other statistical representations.
- HSS.ID.A.2: Center and spread of distributions.
- HSS.ID.A.4: Normal distributions and standard deviation.
- HSS.ID.B.5: Two-way frequency tables.

Follow the actual Algebra 2 curriculum sequence when assigning individual skills.

---

# 3. OVERALL EXPERIENCE DESIGN

## Theme

# THE ENDURO RACE INTELLIGENCE LAB

Opening screen:

"Welcome to the Enduro Race Intelligence Lab.

You've just joined the performance analytics crew for a mountain bike enduro team.

The team has a big race coming up, and there are a lot of questions that need answers.

How likely is a rider to hit their target time?

How consistent are the team's performances?

How does the team compare with other riders?

Can we use a sample of riders to understand the preferences of the entire event?

And most importantly, how do we know whether a strategy actually works?

Your job is to investigate the numbers and make the call."

### Opening Visual

Display a sophisticated racing analytics environment.

Visual elements:
- Mountain bike enduro race scene.
- Rider crossing a finish line.
- Race timing scoreboard.
- GPS computer.
- Performance charts.
- Rider comparison dashboard.
- Statistical data displays.

Use a combination of mountain biking photography and original interactive data visualizations.

Primary button:

**ENTER THE ANALYTICS LAB**

## Mission Dashboard

Display four primary stations:

1. Race-Day Probability.
2. Who's Actually Fast?
3. The Rider Sample Lab.
4. The Race Strategy Experiment.

Unlock the final challenge after all four are completed.

Each mission should display:
- Description.
- Mathematical skills.
- Progress.
- Completion status.

Allow students to revisit earlier missions.

---

# 4. MISSION 1 — RACE-DAY PROBABILITY

**Mathematical Focus:** Sample spaces, mutually exclusive events, non-mutually exclusive events, addition and multiplication rules, conditional probability, independence, and two-way tables.

**Estimated Completion:** 6–7 minutes.

## The Scenario

"Your team has analyzed 200 simulated enduro stage attempts.

You want to understand whether riders are more likely to hit their target split time under different course conditions.

The data has been organized by:
- Course condition.
- Whether the rider achieved their target time.

Your job is to understand what the data tells you."

## The Dataset

Create the following fictional race dataset:

| Course condition | Hit target time | Missed target time | Total |
|---|---:|---:|---:|
| Dry | 84 | 36 | 120 |
| Wet | 40 | 40 | 80 |
| **Total** | **124** | **76** | **200** |

All observations are simulated.

## Learning Module A — Understanding Sample Spaces

Explain:

"A sample space is the set of all possible outcomes of an experiment."

For this example, randomly select one of the 200 simulated race attempts.

Define:

Event A:
The rider hit their target time.

Event B:
The course was dry.

The possible outcomes can be organized using the two-way table.

Explain:
- A and B means the rider hit their target time AND the course was dry.
- A or B means the rider hit their target time OR the course was dry, including cases where both happen.
- Not A means the rider missed their target time.

### Interactive Component: Race Outcome Explorer

Display the two-way table.

Allow students to select individual cells.

When they select a cell:
- Highlight the corresponding race observations.
- Display the number of outcomes.
- Display the probability.
- Explain the meaning in context.

Allow students to toggle between:
- Counts.
- Joint relative frequencies.
- Marginal relative frequencies.
- Conditional relative frequencies.

## Learning Module B — Mutually Exclusive Events

Explain that mutually exclusive events cannot happen at the same time.

Example:

A race attempt cannot be classified as both dry and wet under the dataset's mutually exclusive classification.

Therefore:

\[
P(\text{Dry and Wet})=0
\]

Because every attempt is classified as either dry or wet:

\[
P(\text{Dry or Wet})=1
\]

Introduce the complement:

\[
P(\text{Wet})=1-P(\text{Dry})
\]

\[
P(\text{Wet})=1-0.60=0.40
\]

### Challenge

Give the student a set of event classifications.

Ask them to identify which combinations are mutually exclusive.

## Learning Module C — Non-Mutually Exclusive Events

Return to:

- Event A: Rider hits target time.
- Event B: Course is dry.

These events can happen together.

The addition rule is:

\[
P(A\text{ or }B)=P(A)+P(B)-P(A\text{ and }B)
\]

Calculate:

\[
P(A)=\frac{124}{200}=0.62
\]

\[
P(B)=\frac{120}{200}=0.60
\]

\[
P(A\text{ and }B)=\frac{84}{200}=0.42
\]

Therefore:

\[
P(A\text{ or }B)=0.62+0.60-0.42
\]

\[
\boxed{P(A\text{ or }B)=0.80}
\]

Interpretation:

There is an 80% relative frequency of selecting an attempt that either met its target time or occurred in dry conditions, including attempts satisfying both.

## Learning Module D — Conditional Probability

Introduce:

"What is the probability of a rider hitting their target time GIVEN that the course was dry?"

The denominator changes because we are considering only dry-course attempts.

\[
P(A|B)=\frac{P(A\text{ and }B)}{P(B)}
\]

\[
P(A|B)=\frac{84}{120}
\]

\[
\boxed{P(A|B)=0.70}
\]

Now compare wet conditions:

\[
P(A|\text{Wet})=\frac{40}{80}
\]

\[
\boxed{P(A|\text{Wet})=0.50}
\]

Students should understand that the condition after the vertical bar defines the restricted sample space.

### Interactive Component: Conditional Probability Filter

Allow students to filter the dataset:

- All attempts.
- Dry attempts only.
- Wet attempts only.
- Attempts that hit target.
- Attempts that missed target.

Display how the probability changes when the population of possible outcomes is restricted.

Show a live formula.

## Learning Module E — Independence

Explain:

Two events are independent when knowing that one event occurred does not change the probability of the other event.

For independent events:

\[
P(A\text{ and }B)=P(A)P(B)
\]

In this dataset:

\[
P(A)=0.62
\]

\[
P(A|\text{Dry})=0.70
\]

Since:

\[
0.70\neq0.62
\]

The events are not independent in this simulated dataset.

Alternatively:

\[
P(A)P(B)=0.62(0.60)=0.372
\]

But:

\[
P(A\text{ and }B)=0.42
\]

These are not equal.

Explain that the variables are associated in this dataset.

**Important:** These are observational data. The association does not prove that dry conditions caused riders to hit their target times. Other factors may affect performance.

### Optional Independence Experiment

Create a small separate simulation using two independent random selections:

- Draw a random trail-feature card from a deck with three equally likely features: berm, jump, and rock garden.
- Independently draw a course-condition card from a separate deck with two equally likely conditions: dry and wet.

Ask:

"What is the probability of selecting a jump card AND a wet-condition card?"

\[
P(\text{Jump})=\frac13
\]

\[
P(\text{Wet})=\frac12
\]

\[
P(\text{Jump and Wet})=\frac13\times\frac12
\]

\[
\boxed{\frac16}
\]

Use this to demonstrate how independent events work in a uniform probability model.

---

# 5. MISSION 2 — WHO'S ACTUALLY FAST?

**Mathematical Focus:** Mean, median, range, standard deviation, normal distributions, empirical rule, z-scores, and percentiles.

**Estimated Completion:** 6–7 minutes.

## The Scenario

"The race team has collected timing data from two groups of riders.

Both groups appear to have the same average time.

But one group might be significantly more consistent than the other.

Your job is to analyze the distributions and figure out what the numbers actually tell you."

## Dataset A — Crew Alpha

Use the following 10 simulated segment times in seconds:

\[
172,174,176,178,180,180,182,184,186,188
\]

## Dataset B — Crew Bravo

\[
160,168,172,176,180,180,184,188,192,200
\]

Treat these as the complete 10-run datasets for this comparison.

## Learning Module A — Measures of Center

Introduce:

### Mean

The average value.

For both datasets:

\[
\text{Mean}=180\text{ seconds}
\]

### Median

The middle value in an ordered dataset.

For both datasets:

\[
\text{Median}=180\text{ seconds}
\]

Explain:

Both groups have the same mean and median.

But that doesn't mean they are equally consistent.

## Learning Module B — Measures of Spread

Introduce:
- Range.
- Interquartile range.
- Standard deviation.

For Crew Alpha:

\[
\text{Range}=188-172=16
\]

Population standard deviation:

\[
\sigma\approx4.90\text{ seconds}
\]

For Crew Bravo:

\[
\text{Range}=200-160=40
\]

Population standard deviation:

\[
\sigma\approx11.17\text{ seconds}
\]

For this example, treat the ten displayed runs as the entire dataset and use population standard deviation.

Explain:

Standard deviation measures how spread out the values are relative to the mean.

A lower standard deviation means the observations are more tightly clustered around the average.

Crew Alpha has more consistent times in this dataset.

Crew Bravo has more variability.

### Interactive Component: Rider Consistency Analyzer

Display:
- Two dot plots.
- Two histograms.
- Mean.
- Median.
- Range.
- Standard deviation.

Allow students to toggle between datasets.

Ask:

"Which group has the more consistent race times?"

Require students to support their answer with the standard deviation.

Then let them adjust values in a practice dataset and watch the spread change.

## Learning Module C — The Normal Distribution

Introduce the concept of a bell-shaped distribution.

Explain that many real-world measurements can sometimes be modeled using a normal distribution, but not every dataset follows a normal distribution.

For this lesson, create a separate hypothetical model for a specific, controlled enduro stage.

Let:

\[
T\sim N(180,12)
\]

Where:
- Mean race time: 180 seconds.
- Standard deviation: 12 seconds.

Explicitly define the notation as mean followed by standard deviation.

### Interactive Component: Race Performance Bell Curve

Display a bell curve with:
- Mean.
- One standard deviation above and below.
- Two standard deviations above and below.
- Three standard deviations above and below.

Show the empirical rule:

| Range | Approximate percentage |
|---|---:|
| Within 1 SD of the mean | 68% |
| Within 2 SD of the mean | 95% |
| Within 3 SD of the mean | 99.7% |

For this model:

68% of riders have modeled times between:

\[
168\text{ and }192\text{ seconds}
\]

95%:

\[
156\text{ and }204\text{ seconds}
\]

99.7%:

\[
144\text{ and }216\text{ seconds}
\]

Allow students to drag markers across the bell curve and highlight the corresponding areas.

## Learning Module D — Z-Scores

Introduce:

\[
\boxed{z=\frac{x-\mu}{\sigma}}
\]

Explain that a z-score tells us how many standard deviations a result is above or below the mean.

Example:

A rider finishes the modeled stage in 168 seconds.

\[
z=\frac{168-180}{12}
\]

\[
z=-1
\]

The rider is one standard deviation below the mean time.

Since lower times are faster, this is a strong performance.

The time is approximately at the 15.9th percentile of the time distribution, meaning approximately 84.1% of modeled riders have slower times.

Make sure students understand the distinction between a percentile in the time distribution and a performance ranking.

### Interactive Component: Rider Performance Percentile Calculator

Allow students to enter a race time.

Display:
- Time.
- Z-score.
- Position relative to the mean.
- Approximate time percentile.
- Percentage of modeled riders with slower times.

Use a normal distribution table or validated cumulative normal distribution function.

Include examples with:
- Positive z-scores.
- Negative z-scores.
- Zero z-score.

### Independent Challenge

Give the student a time of 204 seconds.

Ask:
1. Calculate the z-score.
2. Interpret its meaning.
3. Determine the approximate time percentile.
4. Explain how this performance compares with the mean.

Expected z-score:

\[
z=\frac{204-180}{12}=2
\]

The time is approximately at the 97.7th percentile of the time distribution.

This is a relatively slow modeled time because approximately 97.7% of the field has a time at or below 204 seconds.

---

# 6. MISSION 3 — THE RIDER SAMPLE LAB

**Mathematical Focus:** Population and samples, sampling methods, sample proportions, sampling distributions, standard error, and margin of error.

**Estimated Completion:** 6–7 minutes.

## The Scenario

"Your team wants to know which type of mountain bike trail is most popular among riders attending the Pine Ridge Enduro Festival.

But there are 1,000 registered riders.

Surveying everyone would take too long.

Instead, you decide to randomly survey a smaller group and use the results to estimate what the entire population thinks."

This introduces the fundamental relationship between samples and populations.

## Learning Module A — Population Versus Sample

Explain:

Population:
All 1,000 registered riders.

Sample:
The riders selected to complete the survey.

Survey question:

"Which type of trail would you most like to ride?"

Options:
- Flow trail.
- Technical trail.

For the simulator, create a synthetic population of 1,000 virtual riders:
- 600 prefer flow trails.
- 400 prefer technical trails.

The true proportion is 60% in the simulator's hidden population.

Explain that students will not initially know the population proportion when conducting the sample exercise.

This is a simulated population created specifically to demonstrate sampling variability.

## Learning Module B — Conduct a Random Sample

Set the sample size to 100 riders.

One example random sample produces:
- 62 flow-trail preferences.
- 38 technical-trail preferences.

Calculate:

\[
\hat p=\frac{62}{100}
\]

\[
\boxed{\hat p=0.62}
\]

Interpretation:

The sample estimates that 62% of the full event population prefers flow trails.

Ask:

"Can we conclude that exactly 62% of all 1,000 riders prefer flow trails?"

Answer: No.

A random sample is an estimate, and another sample could produce a different proportion.

## Interactive Component: Rider Survey Simulator

Build a realistic sampling dashboard.

Display:
- 1,000 virtual event riders.
- Two preference categories.
- Random sample selection.
- Sample size.
- Sample proportion.

Allow students to:
- Randomly select 25 riders.
- Randomly select 50 riders.
- Randomly select 100 riders.
- Randomly select 200 riders.
- Repeat the sample.

Show the results each time.

The student should see that different random samples produce different estimates.

## Learning Module C — Sampling Distributions

Explain:

"If we repeatedly take random samples of the same size and calculate each sample's proportion, the collection of those proportions forms a sampling distribution."

Run a simulation of 1,000 repeated samples.

Display:
- Histogram of sample proportions.
- Mean sample proportion.
- Standard deviation of sample proportions.
- Actual population proportion.

The sample proportions should generally cluster around the true simulated population proportion of 0.60.

Repeat the activity using different sample sizes.

Compare:

Sample size 25:

\[
SE=\sqrt{\frac{0.60(0.40)}{25}}
\]

\[
SE\approx0.098
\]

Sample size 100:

\[
SE=\sqrt{\frac{0.60(0.40)}{100}}
\]

\[
SE\approx0.049
\]

The standard error is approximately halved when the sample size increases from 25 to 100.

Explain that larger random samples generally produce more precise estimates.

The simulator should reinforce that larger samples reduce sampling variability but do not eliminate it.

## Learning Module D — Standard Error and Margin of Error

Introduce:

Standard error measures the typical variability of a sample statistic from one random sample to another.

For a sample proportion, use the estimated standard error:

\[
SE=\sqrt{\frac{\hat p(1-\hat p)}{n}}
\]

For the example sample:

\[
\hat p=0.62
\]

\[
n=100
\]

\[
SE=\sqrt{\frac{0.62(0.38)}{100}}
\]

\[
SE\approx0.0485
\]

For an approximate 95% margin of error, use:

\[
ME\approx1.96(SE)
\]

\[
ME\approx1.96(0.0485)
\]

\[
\boxed{ME\approx0.095}
\]

Therefore, the sample estimates 62% with an approximate margin of error of 9.5 percentage points.

Approximate interval:

\[
62\%\pm9.5\%
\]

\[
\boxed{52.5\%\text{ to }71.5\%}
\]

Explain that this interval is an approximate confidence interval under the stated random-sampling and normal-approximation assumptions.

The simulator should primarily teach margin of error using repeated sampling. The formula should supplement the visual simulation.

### Interactive Component: Margin of Error Explorer

Give the student a sample-size slider.

Show how the approximate margin of error changes when sample size increases.

Compare:
- Sample size 25.
- Sample size 50.
- Sample size 100.
- Sample size 200.

Display the corresponding sampling distributions and estimated intervals.

Ask:

"Which sample provides the most precise estimate?"

The student should identify the larger sample.

## Learning Module E — Sampling Bias

Introduce a deliberately flawed survey.

"Your team only asks riders who are riding the jump line which type of trail they prefer."

Explain why this might produce a biased result.

Introduce:
- Random sampling.
- Convenience sampling.
- Underrepresentation.
- Selection bias.
- Representative samples.

Create a comparison:

**Survey A:** Randomly selected from all 1,000 event registrants.

**Survey B:** Only asks riders who are currently at the jump line.

Ask which survey is more appropriate for estimating the preferences of the entire event population.

Expected answer: Survey A.

---

# 7. MISSION 4 — THE RACE STRATEGY EXPERIMENT

**Mathematical Focus:** Surveys, observational studies, randomized experiments, statistical comparisons, randomization simulations, and significance.

**Estimated Completion:** 6–7 minutes.

## The Scenario

"Your racing team wants to improve how riders prepare for a new enduro course.

The team is considering two different course-preview methods:

**Method A:** A traditional printed trail map.

**Method B:** An annotated video preview of the course.

You want to determine whether the video-preview method helps riders remember more trail features.

Rather than guessing, you design an experiment."

This is a fictional controlled educational experiment.

It does not make a claim that one particular preview method improves real-world racing performance.

## Define the Experiment

Recruit 40 riders.

Randomly assign:
- 20 riders to Method A.
- 20 riders to Method B.

Give each group the same amount of time to study the same fictional trail.

After the preview, ask each rider to identify 12 marked trail features on a blank course map.

The outcome variable is:

**Number of features correctly identified out of 12.**

## The Experimental Data

Method A — Printed Trail Map:

\[
10,5,6,9,8,5,4,10,8,6,
\]

\[
8,10,9,6,9,5,6,10,10,4
\]

Mean:

\[
\bar x_A=7.4
\]

Method B — Annotated Video Preview:

\[
9,11,10,8,10,10,11,12,9,9,
\]

\[
11,8,9,10,6,7,7,12,11,8
\]

Mean:

\[
\bar x_B=9.4
\]

Observed difference:

\[
9.4-7.4=2
\]

The video-preview group averaged two additional correctly identified trail features.

All scores are simulated.

## Learning Module A — Understand Study Design

Explain three types of statistical studies.

### Survey

Ask a group of riders questions about their preferences.

Example:

"Which course-preview method do you prefer?"

### Observational Study

Observe riders and record outcomes without assigning treatments.

Example:

Compare performance among riders who naturally chose different training methods.

Important limitation:

Observational relationships do not necessarily establish causation.

### Randomized Experiment

Assign riders to different treatments using randomization.

Example:

Randomly assign riders to the printed map or video preview method.

Explain why random assignment helps reduce systematic differences between treatment groups.

Ask students to classify different study scenarios.

## Learning Module B — Compare the Treatment Groups

Display:
- Group A scores.
- Group B scores.
- Two histograms.
- Group mean.
- Difference in means.

Ask:

"Which group performed better on average?"

The video-preview group has the higher average.

Then ask:

"Does this prove that the video method is better?"

Explain why the observed difference alone is insufficient.

Differences can occur due to random variation even if the treatments have no true effect.

## Learning Module C — Randomization Simulation

Introduce the null hypothesis:

There is no difference between the two preview methods in the population of interest.

Under this hypothesis, the observed scores are exchangeable between the groups because assignment was random.

Build a randomization test.

### Interactive Component: The Treatment Shuffle Simulator

Take all 40 observed scores.

Repeatedly:
1. Randomly shuffle the 40 scores.
2. Assign 20 shuffled scores to Group A.
3. Assign the remaining 20 to Group B.
4. Calculate the difference in group means.
5. Record the result.

Repeat this process 50,000 times using a deterministic random seed for reproducibility.

Display a histogram of simulated differences.

Highlight the observed difference of 2.0 features.

The two-sided randomization p-value is the proportion of simulated differences whose absolute values are at least 2.0.

For the supplied dataset, a reference simulation with 50,000 shuffles gives a p-value of approximately 0.0033.

Claude must calculate the simulation result rather than hardcode the displayed p-value.

## Learning Module D — Interpret Statistical Significance

Introduce a conventional significance threshold:

\[
\alpha=0.05
\]

The simulated p-value is approximately:

\[
0.0033<0.05
\]

Explain:

Under the no-difference model, a difference at least as extreme as the observed two-feature gap would be unusual in this randomization simulation.

This provides evidence of a difference between the two methods in the simulated experiment.

Make the following distinctions explicit:

- A p-value is not the probability that the null hypothesis is true.
- Statistical significance does not automatically mean practical significance.
- Random assignment supports a causal interpretation for the experiment under its conditions.
- Generalizing to all riders requires an appropriate participant-selection process and additional evidence.

### Final Learning Question

"Can the team conclude that the annotated video preview produced higher feature-recognition scores in this experiment?"

Expected answer:

There is evidence of a difference favoring the video-preview group in the simulated randomized experiment.

The result does not guarantee the same outcome for every rider or every course.

---

# 8. FINAL MISSION — CHIEF RACE ANALYST

After completing the four missions, unlock:

# THE FINAL RACE INTELLIGENCE REPORT

"The enduro team has one final challenge.

You have analyzed race conditions, rider performance, event preferences, and experimental results.

Now you need to prepare a report that uses evidence to support your recommendations."

Build four independent challenges.

## Challenge A — Calculate Race Probability

Use the original two-way race table.

Ask students to calculate:

1. Probability that a randomly selected attempt hit its target time.
2. Probability that an attempt occurred in dry conditions.
3. Probability that an attempt hit its target time given dry conditions.
4. Probability that an attempt hit its target time given wet conditions.
5. Whether target achievement and dry conditions are independent.
6. Probability that an attempt either hit its target time or occurred in dry conditions.

Expected answers:

\[
P(\text{Target})=0.62
\]

\[
P(\text{Dry})=0.60
\]

\[
P(\text{Target}|\text{Dry})=0.70
\]

\[
P(\text{Target}|\text{Wet})=0.50
\]

The events are not independent in this dataset.

\[
P(\text{Target or Dry})=0.80
\]

Students must explain why the observed association does not establish causation.

## Challenge B — Analyze Rider Performance

Use the normal race-time model:

\[
T\sim N(180,12)
\]

Give the student a time of 162 seconds.

Ask them to:
1. Calculate the z-score.
2. Interpret the result.
3. Identify the approximate time percentile.
4. Explain what percentage of modeled riders have slower times.

Expected:

\[
z=\frac{162-180}{12}=-1.5
\]

Approximate time percentile: 6.7%.

Approximately 93.3% of modeled riders have slower times.

## Challenge C — Estimate the Event Population

A random sample of 100 riders includes 62 who prefer flow trails.

Ask students to:
1. Calculate the sample proportion.
2. Calculate estimated standard error.
3. Estimate the approximate 95% margin of error.
4. Interpret the result.
5. Explain how a larger sample would change the estimate's precision.

Expected:

\[
\hat p=0.62
\]

\[
SE\approx0.0485
\]

\[
ME\approx0.095
\]

Estimated interval:

\[
52.5\%\text{ to }71.5\%
\]

## Challenge D — Interpret the Experiment

Give students the two-preview-method experiment.

Ask them to:
1. Identify the treatment groups.
2. Identify the outcome variable.
3. Calculate the observed difference in means.
4. Explain why random assignment matters.
5. Interpret the simulated randomization p-value.
6. Write a short conclusion.

Expected difference:

\[
2.0\text{ correctly identified features}
\]

Reference simulated p-value:

Approximately 0.0033.

The experiment shows evidence of a difference favoring the annotated video-preview group under the specified study conditions.

## Final Completion Screen

Display:

# CHIEF RACE ANALYST

"You've successfully analyzed the probabilities behind race outcomes, compared rider performance, estimated population preferences, and evaluated an experiment.

You now know how to use statistics to make informed decisions instead of relying on guesses."

Show:
- Missions completed.
- Probability skills practiced.
- Statistical skills practiced.
- Inference skills practiced.
- Questions answered.
- Final challenge performance.
- Areas needing further practice.

Record student results through the existing Mathlete MTB progress system.

Do not automatically assign mastery based solely on completing the lesson.

---

# 9. OPTIONAL EXTENSION — THE PODIUM PROBABILITY CHALLENGE

Create an optional advanced section for students who finish early or want more probability practice.

Title:

**"Who's Making the Podium?"**

A fictional team has eight riders available for a three-person relay team.

Introduce combinations.

If selecting three riders without assigning an order:

\[
\binom{8}{3}=\frac{8!}{3!5!}
\]

\[
=56
\]

There are 56 possible three-rider teams.

Now introduce permutations.

If order matters and the three riders occupy first, second, and third positions:

\[
P(8,3)=\frac{8!}{5!}
\]

\[
=336
\]

There are 336 possible ordered selections.

Explain the difference between combinations and permutations.

Make clear that this is a uniform selection model, not a prediction of actual race results.

Provide an additional optional challenge in which students calculate the probability of a particular randomly selected team or podium order under the stated equal-likelihood assumptions.

---

# 10. VISUAL DESIGN AND USER EXPERIENCE

## Design Direction

The Enduro Race Intelligence Lab should feel like professional mountain bike race analytics software.

Think:
- Enduro race timing systems.
- Digital finish-line displays.
- Rider telemetry.
- Performance analytics dashboards.
- Statistical graphs.
- Race-result leaderboards.
- Data analysis workstations.

Use the established Mathlete MTB branding.

## Mission-Specific Visuals

### Race-Day Probability
- Enduro finish-line scene.
- Two-way frequency table.
- Probability dashboard.
- Conditional probability filters.
- Event diagrams.

### Who's Actually Fast?
- Race timing displays.
- Rider performance charts.
- Dot plots.
- Histograms.
- Normal distribution curves.
- Z-score markers.

### The Rider Sample Lab
- Event registration dashboard.
- Survey interface.
- Random sample selector.
- Sampling distribution histogram.
- Margin-of-error visualization.

### The Race Strategy Experiment
- Two rider groups.
- Trail preview visuals.
- Score comparison.
- Randomization simulator.
- Difference-in-means distribution.

### Final Mission
- Race analytics report.
- Summary statistics.
- Probability results.
- Statistical conclusions.
- Final certification.

## Mathematical Visualization Standards

Every graph should:
- Have clearly labeled axes.
- Display appropriate units.
- Accurately represent the underlying data.
- Distinguish simulated data from observed data.
- Include appropriate captions and explanations.

Use dynamic displays when students change parameters.

For example:
- Changing a race condition selection updates the conditional probability.
- Changing a rider's time updates the z-score.
- Changing sample size updates the sampling distribution.
- Running additional randomization trials updates the estimated p-value.

Do not include decorative interactions that do not support a learning objective.

## Responsive Design

Support:
- Desktop.
- Tablet.
- Mobile.

Ensure:
- Tables remain readable.
- Graphs remain usable.
- Sliders and filters are touch-accessible.
- Mathematical notation is legible.
- Randomization simulations provide useful visual feedback.
- Keyboard navigation is supported.

---

# 11. ASSESSMENT AND FEEDBACK ENGINE

Reuse the existing Mathlete MTB Lab Development Framework and question architecture.

Support:

- Multiple choice.
- Numerical answers.
- Probability calculations.
- Two-way table interpretation.
- Conditional probability.
- Graph interpretation.
- Z-score calculations.
- Percentile interpretation.
- Data summaries.
- Study-design classification.
- Written statistical conclusions.

## Progressive Hints

**Hint 1 — Concept**

Help the student identify the mathematical idea.

**Hint 2 — Method**

Show the formula, table, or statistical relationship to use.

**Hint 3 — Guided Step**

Show the next step without immediately revealing the full answer.

**Solution**

Show the complete reasoning and explain what the result means in the race scenario.

## Common Misconceptions to Track

### Probability
- Confusing conditional and unconditional probability.
- Incorrectly identifying the denominator in conditional probability.
- Forgetting to subtract the intersection in the addition rule.
- Assuming observational association proves causation.
- Confusing independence with mutual exclusivity.
- Misinterpreting a two-way table.

### Descriptive Statistics
- Confusing mean and median.
- Interpreting standard deviation as the average distance from the mean.
- Ignoring the shape of a distribution.
- Using mean and standard deviation when outliers make median and IQR more appropriate.

### Normal Distributions
- Incorrectly calculating z-scores.
- Confusing z-score direction.
- Confusing time percentile with rider performance ranking.
- Misapplying the empirical rule to non-normal data.

### Statistical Inference
- Confusing sample and population.
- Treating a biased sample as representative.
- Confusing standard deviation with standard error.
- Assuming a larger sample eliminates uncertainty.
- Misinterpreting margin of error.
- Confusing surveys with experiments.
- Assuming a small p-value proves a hypothesis.
- Treating statistical significance as practical significance.

Give targeted feedback based on the actual misconception.

Allow students to retry without punishment.

---

# 12. STUDENT PROGRESS INTEGRATION

Reuse existing Mathlete MTB student progress infrastructure.

Track these skills:

### Probability
1. Sample spaces.
2. Mutually exclusive events.
3. Non-mutually exclusive events.
4. Addition rule.
5. Multiplication rule.
6. Conditional probability.
7. Independent events.
8. Dependent events.
9. Two-way tables.
10. Joint probabilities.
11. Marginal probabilities.
12. Conditional relative frequencies.

### Statistics
13. Mean.
14. Median.
15. Range.
16. Standard deviation.
17. Histograms.
18. Normal distribution.
19. Empirical rule.
20. Z-scores.
21. Percentiles.

### Statistical Inference
22. Population and sample.
23. Random sampling.
24. Sample proportion.
25. Sampling distributions.
26. Standard error.
27. Margin of error.
28. Surveys, experiments, and observational studies.
29. Randomized experiments.
30. Statistical significance.
31. Interpretation of statistical claims.

Record:
- Activity start.
- Mission progress.
- Number of attempts.
- Correct and incorrect answers.
- Hints used.
- Independent problem-solving results.
- Simulation attempts.
- Final assessment performance.
- Time spent.
- Activity completion.

Do not infer mastery from lesson completion alone.

Preserve sufficient attempt information for tutors to review student misconceptions.

---

# 13. MATHEMATICAL ENGINE AND TECHNICAL REQUIREMENTS

Build a reusable mathematical and statistical calculation layer.

All tables, graphs, probability displays, simulations, and assessments must derive from one authoritative data source per scenario.

## Probability Dataset

Use:

| Condition | Target met | Target missed | Total |
|---|---:|---:|---:|
| Dry | 84 | 36 | 120 |
| Wet | 40 | 40 | 80 |
| Total | 124 | 76 | 200 |

Expected values:

\[
P(A)=0.62
\]

\[
P(B)=0.60
\]

\[
P(A\cap B)=0.42
\]

\[
P(A\cup B)=0.80
\]

\[
P(A|B)=0.70
\]

\[
P(A|\text{Wet})=0.50
\]

## Descriptive Statistics

Crew Alpha:

\[
[172,174,176,178,180,180,182,184,186,188]
\]

Crew Bravo:

\[
[160,168,172,176,180,180,184,188,192,200]
\]

Both means:

\[
180
\]

Both medians:

\[
180
\]

Population standard deviations:
- Alpha: approximately 4.90 seconds.
- Bravo: approximately 11.17 seconds.

Use correct population-versus-sample standard deviation conventions.

## Normal Distribution

\[
T\sim N(180,12)
\]

Where:
- Mean = 180 seconds.
- Standard deviation = 12 seconds.

Implement:
- Normal density visualization.
- Cumulative normal probability.
- Z-score calculation.
- Percentile interpretation.
- Empirical rule ranges.

Use a validated normal cumulative distribution function or appropriate library.

## Sampling Simulation

Use a simulated population of 1,000 virtual riders:
- 600 flow preference.
- 400 technical preference.

Generate reproducible random samples using an appropriate seeded random generator.

Support:
- Multiple sample sizes.
- Repeated sampling.
- Sample proportions.
- Sample means where appropriate.
- Sampling distribution visualization.
- Standard error.
- Empirical margin of error.

## Randomized Experiment

Use the 40 simulated observations supplied in Mission 4.

Compute:
- Group means.
- Observed difference.
- Random group reassignment.
- Differences under the null model.
- Two-sided randomization p-value.

Use 50,000 seeded permutations for the initial reference simulation.

Do not hardcode the p-value.

## Input Validation and Testing

- Validate all probability results between zero and one.
- Validate table totals.
- Confirm sample sizes.
- Check standard deviation conventions.
- Ensure the normal model uses the correct mean and standard deviation.
- Verify z-score calculations.
- Ensure sample simulations use representative random sampling.
- Verify random assignment in experiments.
- Test the randomization simulation against the reference results.
- Clearly identify approximate calculations and simulated estimates.

The statistical engine must remain separate from the visual presentation and learning assessment layers.

---

# 14. TECHNICAL ARCHITECTURE

Suggested components:

**RaceIntelligenceDashboard**
- Opening screen.
- Mission navigation.
- Progress.

**ProbabilityRaceAnalyzer**
- Race dataset.
- Two-way frequency table.
- Probability calculation.
- Conditional filtering.
- Independence testing.

**EventProbabilityWorkbench**
- Sample spaces.
- Tree diagrams.
- Addition rule.
- Multiplication rule.
- Compound events.

**RiderConsistencyAnalyzer**
- Race timing datasets.
- Mean and median.
- Range and standard deviation.
- Dot plots and histograms.

**NormalDistributionExplorer**
- Bell curve.
- Empirical rule.
- Z-score.
- Percentile calculation.

**RiderSurveySimulator**
- Population.
- Random sampling.
- Sample sizes.
- Sample proportions.
- Sampling distributions.

**MarginOfErrorExplorer**
- Standard error.
- Sampling variability.
- Confidence interval.
- Sample size comparison.

**RaceStrategyExperiment**
- Treatment assignment.
- Group statistics.
- Difference in means.
- Randomization test.
- Statistical interpretation.

**ChallengeEngine**
- Questions.
- Hints.
- Feedback.
- Scoring.

**ProgressTracker**
- Student attempts.
- Skill associations.
- Completion.

These are suggested component boundaries.

Inspect the existing Mathlete MTB codebase before implementation.

Reuse existing graphs, tables, controls, mathematical displays, question engines, and student progress infrastructure wherever possible.

Do not duplicate existing functionality.

---

# 15. RESEARCH AND EDUCATIONAL REFERENCES

Use these sources to guide the instructional sequence and mathematical implementation.

## Algebra 2 Curriculum

1. Fishtank Learning — Probability and Statistical Inference:
https://www.fishtanklearning.org/curriculum/math/algebra-2/probability-and-statistical-inference/

This should be the primary reference for the lesson progression.

Particularly relevant topics:
- Conditional probability.
- Independent events.
- Two-way frequency tables.
- Normal distributions.
- Z-scores.
- Statistical inference.
- Sampling.
- Margin of error.
- Experimental comparisons.

## Official Standards

2. Common Core — Conditional Probability and Rules of Probability:
https://www.thecorestandards.org/Math/Content/HSS/CP/

3. Common Core — Making Inferences and Justifying Conclusions:
https://www.thecorestandards.org/Math/Content/HSS/IC/

4. Common Core — Statistics and Probability:
https://www.thecorestandards.org/Math/Content/HSS/

## Statistical Instruction

5. OpenStax — Standard Normal Distribution:
https://openstax.org/books/introductory-statistics-2e/pages/6-1-the-standard-normal-distribution

6. OpenStax — Sampling Distributions and Population Proportions:
https://openstax.org/books/introductory-statistics-2e/pages/8-3-a-population-proportion

7. OpenStax — Measures of the Spread of Data:
https://openstax.org/books/introductory-statistics/pages/2-7-measures-of-the-spread-of-the-data

8. Khan Academy — Probability and Statistics:
https://www.khanacademy.org/math/statistics-probability

## Mountain Biking Visual and Scenario References

9. Canadian Enduro League:
https://canadianenduro.com/seriesinfo

10. Pinkbike — Privateer Pits and Race Preparation:
https://www.pinkbike.com/news/interviews-inside-the-privateer-pits-fort-william-world-cup-dh-2024.html

11. Mountain Bike Race Timing and Performance:
https://hayesbicycle.com/es/blogs/reynolds-news/3-podiums-weekend-for-pivot-factory-racing

Use these materials for authentic race context, visual inspiration, and mathematical concepts.

All Mathlete MTB datasets, exercises, instructional explanations, and simulations should be original.

Do not reproduce third-party educational content.

---

# 16. IMPLEMENTATION PRIORITIES

Before development:

1. Read docs/LAB_DEVELOPMENT_FRAMEWORK.md.
2. Audit the existing Algebra 2 course and curriculum hierarchy.
3. Review the Race-Day Workshop.
4. Review the Ride Systems Lab.
5. Review the Trail Dynamics Lab.
6. Identify existing charting, histogram, table, graphing, and assessment components.
7. Confirm student progress tracking.
8. Confirm routing and curriculum identifiers.

Implement in the following sequence:

**Phase 1:** Enduro Race Intelligence Lab introduction and dashboard.

**Phase 2:** Race-Day Probability, including sample spaces, conditional probability, two-way tables, and independence.

**Phase 3:** Who's Actually Fast?, including descriptive statistics, histograms, normal distributions, empirical rule, and z-scores.

**Phase 4:** The Rider Sample Lab, including random sampling, sample proportions, sampling distributions, standard errors, and margin of error.

**Phase 5:** The Race Strategy Experiment, including random assignment, treatment comparisons, and randomization simulations.

**Phase 6:** Final Chief Race Analyst assessment.

**Phase 7:** Optional Podium Probability Challenge.

**Phase 8:** Student progress integration, responsive design, accessibility, and testing.

Implement a complete end-to-end learning experience.

Do not stop after creating visual mockups or static graphs.

All interactive controls must produce mathematically meaningful changes.

---

# 17. ACCEPTANCE CRITERIA

- [ ] Activity appears in Algebra 2 → Probability and Statistics.
- [ ] Opening Race Intelligence dashboard works.
- [ ] All four mission stations are accessible.
- [ ] Probability table is accurate.
- [ ] Mutually exclusive events are explained.
- [ ] Addition and multiplication rules work.
- [ ] Conditional probability filters work.
- [ ] Independence is evaluated correctly.
- [ ] Rider consistency datasets display correctly.
- [ ] Mean, median, range, and standard deviation are accurate.
- [ ] Histograms and dot plots represent the data correctly.
- [ ] Normal distribution simulator works.
- [ ] Empirical rule works.
- [ ] Z-score and percentile calculations work.
- [ ] Survey simulator generates valid random samples.
- [ ] Sample-size comparison works.
- [ ] Sampling distributions display correctly.
- [ ] Standard error and margin of error are calculated correctly.
- [ ] Survey, observational study, and experiment are distinguished.
- [ ] Randomized experiment is implemented.
- [ ] Treatment comparison works.
- [ ] Randomization simulation works.
- [ ] Statistical significance is interpreted correctly.
- [ ] Final assessment evaluates all primary skills.
- [ ] Feedback and hints work.
- [ ] Student progress integrates with existing Mathlete MTB infrastructure.
- [ ] Desktop, tablet, and mobile layouts work.
- [ ] Keyboard accessibility is supported.
- [ ] Existing Featured Tools and other Classes remain functional.

---

# FINAL PRODUCT PRINCIPLE

The Enduro Race Intelligence Lab should teach students that data is only useful when we know how to interpret it.

The student starts by analyzing the probability of different race outcomes.

They move into comparing race performances and understanding normal distributions.

They then learn how to use small samples to estimate larger populations.

Finally, they design and analyze a randomized experiment to determine whether one race-preparation method produces better results than another.

They should finish thinking:

"I can use mathematics to analyze race data, understand uncertainty, and make better decisions based on evidence rather than guesses."

**Build an experience that makes statistics feel like professional mountain bike race analysis.**

That's the Mathlete MTB difference.