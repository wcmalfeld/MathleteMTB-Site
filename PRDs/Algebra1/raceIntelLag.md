# PRD: The Split Report — MTB Race Intelligence Lab
## Mathlete MTB | Algebra 1 | Data & Statistics

**Product:** Mathlete MTB  
**Course:** Algebra 1  
**Unit:** Data & Statistics  
**Module concept:** The Split Report — Race Intelligence Lab  
**Target audience:** Middle and high school students who are passionate about mountain biking  
**Implementation:** Claude Code  
**Existing lesson routes:**
- `/classes/algebra-1/data-representation/`
- `/classes/algebra-1/scatter-plots/`
- `/classes/algebra-1/correlation/`
- `/classes/algebra-1/lines-of-best-fit/`

---

# 1. Product Vision

Build a world-class, interactive Algebra 1 statistics experience that puts students inside the data room of a professional downhill mountain bike racing team.

The student is hired as a junior **Race Intelligence Analyst** for a fictional gravity racing team called **Northstar Gravity Racing**.

The team is preparing for an important downhill race weekend. The riders have been collecting practice times, the timing system has recorded their sector splits, and the coaching staff needs help understanding what the data actually says.

The team's performance director gives the student four assignments:

1. **Audit the consistency:** Compare riders' practice times and determine who is more consistent.
2. **Find the patterns:** Plot paired data to discover relationships between practice laps and sector times.
3. **Separate signal from noise:** Interpret correlation and determine what the data can—and cannot—tell us.
4. **Build the race forecast:** Create a line of best fit, predict sector times, and examine residuals to identify where riders performed differently than expected.

The student finishes by presenting a short, data-backed performance report to the team's director.

This should feel like working in a real downhill racing team's performance department, not completing four unrelated statistics worksheets.

## The central idea

**Professional racing isn't just about who crosses the finish line first. It's also about understanding the data behind every run.**

Students get to explore how analysts turn raw timing information into useful insights.

---

# 2. Why This Is an Authentic MTB Connection

This concept is inspired by the real data ecosystem surrounding professional downhill and enduro racing.

### Real-world racing and data

- The WHOOP UCI Mountain Bike World Series provides live race timing. Its event documentation describes timing transponders that must be fitted to riders' bikes. Official race documents also identify ChronoRace as a timing and results provider. This creates an authentic setting for students to explore how race results are collected and interpreted. 
- The independent project **Gravity Lab** takes public UCI downhill timing information and turns it into live sector updates, gap charts, rider comparisons, and race predictions. Its description explains that deeper post-race timing archives can contain more sector splits than viewers see during broadcasts. This is an excellent real-world example of the kind of analytical work students will simulate. 
- Crankworx publishes results and standings across disciplines including downhill, cross-country, slopestyle, dual slalom, and pump track. This gives students another recognizable example of how competitive MTB produces large amounts of performance data.
- Mountain-bike researchers have used GPS units and accelerometers to study velocity, rider load, and time spent completing different sections of enduro courses. Research into downhill racing has also examined how course type affects rider activity and performance.

**Research references for implementation and student career spotlights:**

- [Gravity Lab — About and methodology](https://gravitylab.live/about)
- [UCI Mountain Bike World Series — Live timing](https://live.ucimtbworldseries.com/)
- [Crankworx — Results](https://www.crankworx.com/results/)
- [Physiological characteristics and performance in elite enduro mountain biking](https://jsc-journal.com/index.php/JSC/article/view/318)
- [GPS-Based Evaluation of Activity Profiles in Elite Downhill Mountain Biking](https://www.jsc-journal.com/index.php/JSC/article/view/31)

### Career connections

Include a small career spotlight throughout the module. Students should understand that these math skills connect to real opportunities in the mountain biking industry.

| Career | What they do | Math connection |
|---|---|---|
| Race Timing Technician | Works with race timing systems, transponders, split times, and results | Data collection, organization, quality checks |
| Team Performance Analyst | Helps riders and coaches understand performance data | Distributions, scatter plots, correlation, regression |
| Sports Scientist | Studies athlete performance using timing, GPS, movement, and physiological measurements | Statistics, relationships, comparisons |
| Cycling Data Developer | Builds dashboards and tools that make race information useful | Graphs, data modeling, prediction |
| Race Data Journalist / Broadcast Analyst | Turns timing information into race insights for viewers | Visualizations, trends, and interpretation |

The career examples should feel authentic, not like a generic list of STEM jobs. Use Gravity Lab as a particularly compelling example of how a person with an interest in downhill racing and software can build a useful data-analysis product.

---

# 3. Student Experience and Storyline

## Opening screen: Welcome to the Race Room

The student enters the Northstar Gravity Racing performance room.

Visual scene:
- Dark race-control environment.
- A large timing display with rider numbers and sector times.
- A leaderboard showing fictional riders.
- A screen displaying course sector information.
- A performance director's briefing on the right.
- Four mission cards representing the four activities.

The student receives this briefing:

> Welcome to Northstar Gravity Racing.
>
> We've got an important race weekend coming up, and we need someone who can make sense of the numbers.
>
> The riders have been putting in practice laps. We've collected their sector times, and now we need to know who's consistent, what patterns are emerging, and what we can reasonably predict for race day.
>
> You're our new Race Intelligence Analyst.
>
> Your job is to find the story hidden in the data.

The student should immediately understand the stakes: their analysis will help the team make better-informed decisions.

### Mission sequence

| Mission | Activity | Main skill |
|---|---|---|
| 01 | The Consistency Audit | Data displays, mean, median, range, IQR |
| 02 | The Pattern Scan | Scatter plots, direction, form, clusters, outliers |
| 03 | Signal or Noise? | Correlation coefficient and causation |
| 04 | Race-Day Forecast | Lines of best fit, predictions, residuals |

Each mission should unlock in sequence while still allowing the tutor or teacher to access individual lessons as appropriate.

---

# 4. Important Data Design Rules

All numerical datasets supplied in this PRD are **fictional instructional data** created for Mathlete MTB.

Do not present them as actual UCI, Crankworx, or professional athlete results.

The student can encounter real event references in career spotlights, but the lesson calculations should use deterministic datasets so that:
- Every answer is reproducible.
- Every graph is predictable.
- Tutors can refer to the same answer key.
- Assessment can be automatically graded.
- The lessons work without external APIs.

Use fictional rider names or anonymous rider labels. Do not use real athlete performance data without appropriate permission and attribution.

All times are measured in seconds. **Lower times mean faster runs.**

---

# 5. Activity 01 — The Consistency Audit

## Data Representation

**Route:** `/classes/algebra-1/data-representation/`

**Story:** The team's performance director has collected eight practice times from two riders on the same technical downhill sector.

The director asks:

> We have two riders putting down very different-looking practice times. Who is more consistent? Who is generally faster? And what is the best way to compare their performances?

The student must examine the distributions using dot plots, histograms, and box plots.

### Learning objectives

Students will:
- Choose an appropriate data display.
- Create dot plots, histograms, and box plots.
- Calculate mean and median.
- Calculate range and interquartile range.
- Compare the center and spread of two distributions.
- Explain why mean and median can tell different stories.

## Mission 1A: The Practice-Time Board

Display two fictional riders' practice times.

**Rider A — Apex**

| Run | Time (seconds) |
|---:|---:|
| 1 | 62 |
| 2 | 63 |
| 3 | 63 |
| 4 | 64 |
| 5 | 64 |
| 6 | 65 |
| 7 | 65 |
| 8 | 66 |

**Rider B — Breakaway**

| Run | Time (seconds) |
|---:|---:|
| 1 | 58 |
| 2 | 59 |
| 3 | 61 |
| 4 | 63 |
| 5 | 64 |
| 6 | 67 |
| 7 | 72 |
| 8 | 76 |

Present both datasets in an attractive race-timing interface.

The student can toggle between the riders or view both simultaneously.

### Interaction: Choose the right display

Before revealing the graphs, ask:

**What kind of graph would help you compare the individual practice times?**

Options:
- Dot plot
- Histogram
- Box plot

Give students feedback explaining what each type of display is useful for.

Then let them explore all three.

### Interactive dot plot

Build an interactive dot-plot activity.

Requirements:
- Horizontal axis displays time in seconds.
- Every practice run is represented by one dot.
- Multiple runs with the same time stack vertically.
- Students can toggle Rider A and Rider B.
- Selecting a dot reveals the value and run number.
- Include a comparison mode that shows both riders on the same scale.

Challenge question:

> Which rider has a tighter cluster of practice times?

Correct answer: Rider A.

Explain that Rider A's results are much more tightly grouped.

### Interactive histogram

Allow students to construct a histogram using draggable or selectable bins.

Use the following shared bin intervals for both riders:

| Time interval | Rider A | Rider B |
|---|---:|---:|
| 58–62 | 1 | 3 |
| 63–67 | 7 | 3 |
| 68–72 | 0 | 1 |
| 73–77 | 0 | 1 |

Requirements:
- Same bin boundaries for both riders.
- Students can choose bin width where appropriate.
- Show frequency on the vertical axis.
- Bars should update as the selected dataset changes.
- Provide clear visual feedback when a student chooses an invalid bin setup or miscounts a frequency.

Ask:

> Which rider has more practice runs grouped between 63 and 67 seconds?

Correct answer: Rider A, with 7 runs.

### Interactive box plots

Display side-by-side box plots.

Students should be able to:
- Identify minimum and maximum.
- Locate the median.
- Identify Q1 and Q3.
- Interpret the interquartile range.
- Compare the center and spread.

Use the following consistent quartile convention throughout the module: split an even-sized dataset into lower and upper halves and calculate the median of each half.

**Answer key**

| Statistic | Rider A | Rider B |
|---|---:|---:|
| Minimum | 62 | 58 |
| Q1 | 63 | 60 |
| Median | 64 | 63.5 |
| Q3 | 65 | 69.5 |
| Maximum | 66 | 76 |
| Mean | 64 | 65 |
| Range | 4 | 18 |
| IQR | 2 | 9.5 |

Show the calculations in the Math Workbench.

Rider A:
- Mean = 512 ÷ 8 = 64
- Median = (64 + 64) ÷ 2 = 64
- Range = 66 − 62 = 4
- IQR = 65 − 63 = 2

Rider B:
- Mean = 520 ÷ 8 = 65
- Median = (63 + 64) ÷ 2 = 63.5
- Range = 76 − 58 = 18
- Q1 = 60
- Q3 = 69.5
- IQR = 69.5 − 60 = 9.5

### Mission 1B: The Performance Decision

Now ask the student to interpret the results.

**Question 1:** Which rider has the lower median practice time?

Correct answer: Rider B.

**Question 2:** Which rider has the lower mean practice time?

Correct answer: Rider A.

**Question 3:** Which rider has the smaller range?

Correct answer: Rider A.

**Question 4:** Which rider appears more consistent?

Correct answer: Rider A.

**Question 5:** Why are the mean and median telling slightly different stories for Rider B?

Expected answer: Rider B has several much slower runs, which increase the mean. The median is less affected by those slower values.

### Important learning moment

This is the key takeaway:

A rider can have a faster typical run but still have a slower average because their performance is inconsistent.

The student should understand that a single statistic does not tell the entire story.

### Final mission task

Have the student complete a short performance recommendation:

> Rider ___ has the more consistent practice times because ___. Rider ___ has the lower median time, while ___. Based on the data, I would describe the difference between these riders as ___.

Award:

**Consistency Auditor**

---

# 6. Activity 02 — The Pattern Scan

## Scatter Plots

**Route:** `/classes/algebra-1/scatter-plots/`

**Story:** The team has moved beyond comparing practice times. Now the performance director wants to investigate whether the number of practice laps a rider completes is associated with their final sector time.

The director asks:

> Are riders who complete more practice laps generally recording faster sector times? Let's plot the data and see what patterns emerge.

### Learning objectives

Students will:
- Plot paired data.
- Label horizontal and vertical axes correctly.
- Describe positive, negative, and no association.
- Recognize linear and nonlinear patterns.
- Identify clusters and outliers.
- Explain why scatter plots should not have their points connected like a line graph.

## Mission 2A: Build the Scatter Plot

Introduce a new fictional dataset.

Each rider has:
- A recorded number of practice laps before their final timed run.
- A final timed sector result.

**Dataset: Northstar Gravity — Practice Laps vs. Final Sector Time**

| Rider | Practice laps (x) | Final sector time (y), seconds |
|---|---:|---:|
| Rider 1 | 1 | 78 |
| Rider 2 | 2 | 75 |
| Rider 3 | 3 | 76 |
| Rider 4 | 4 | 71 |
| Rider 5 | 5 | 70 |
| Rider 6 | 6 | 67 |
| Rider 7 | 7 | 68 |
| Rider 8 | 8 | 75 |
| Rider 9 | 9 | 65 |
| Rider 10 | 10 | 62 |

The student should not immediately see the completed graph.

### Interactive scatter plot builder

Create a graphing environment where students can plot the ten paired observations.

Requirements:
- X-axis: Number of practice laps.
- Y-axis: Final sector time (seconds).
- Grid with readable increments.
- Students can click/tap a coordinate to place a point.
- Show a confirmation when a point is correctly plotted.
- Allow incorrect points to be moved.
- Highlight the corresponding row in the data table when a graph point is selected.
- Display all points after the student completes the graph.

Provide a toggle to reveal the complete graph after the activity.

### Mission 2B: Read the Pattern

After completing the graph, ask:

**Question 1:** As the number of practice laps increases, what generally happens to sector times?

Correct answer: They tend to decrease.

**Question 2:** Is this a positive or negative association?

Correct answer: Negative.

**Question 3:** Does the pattern look approximately linear?

Correct answer: Yes. Most points follow a roughly straight downward trend.

**Question 4:** Which point looks unusual?

Correct answer: Rider 8, at (8, 75).

**Question 5:** What do you notice about the other nine points?

Expected answer: Most form a downward-sloping cluster. Riders with more practice laps generally have lower sector times.

### Mission 2C: Investigate the Outlier

Highlight Rider 8.

The point is noticeably above the main downward pattern.

The team asks:

> This rider completed eight practice laps, but their sector time was 75 seconds. That's quite different from what the other results might lead us to expect. What should we do?

Give students a few choices:
- Automatically delete the point.
- Ignore the point.
- Flag it and investigate the circumstances.

Correct answer: Flag and investigate the circumstances.

Explain that unusual data points may have legitimate reasons. We might need to inspect the timing record or understand the context, but we should never remove an observation simply because it doesn't fit the pattern we expected.

Possible contextual explanations can include:
- Different course conditions.
- Mechanical problems.
- Timing errors.
- Rider fatigue.
- A mistake during the run.

Do not tell the student that any particular explanation is true. They are possibilities to investigate, not facts about Rider 8.

### Interactive exploration

Allow students to:
- Hide and reveal the outlier.
- Change the point selection.
- Compare the full dataset with the nine-point cluster.
- Observe how the overall pattern changes.

The module should make it clear that identifying an outlier is different from proving that it is invalid.

### Final mission task

Have students write a brief description of the graph:

> The scatter plot shows a ___ association between practice laps and sector times. The pattern is approximately ___. One unusual point is ___, which should be investigated because ___.

Award:

**Pattern Hunter**

---

# 7. Activity 03 — Signal or Noise?

## Correlation

**Route:** `/classes/algebra-1/correlation/`

**Story:** The student has identified a negative relationship between practice laps and sector times. But the team's performance director has another question:

> How strong is this relationship? And can we actually say that completing more practice laps makes someone faster?

This is where the analyst must separate a statistical relationship from a causal explanation.

### Learning objectives

Students will:
- Describe correlation as positive, negative, or none.
- Distinguish strong and weak linear relationships.
- Interpret a correlation coefficient.
- Understand that correlation does not prove causation.
- Recognize potential confounding variables.
- Explain why unusual data points can influence correlation.

## Mission 3A: Understand Correlation

Start with an interactive correlation explorer.

Present six possible relationships:
1. Strong positive correlation.
2. Weak positive correlation.
3. Strong negative correlation.
4. Weak negative correlation.
5. No meaningful linear correlation.
6. A curved relationship that does not follow a straight-line pattern.

For each example:
- Display a scatter plot.
- Let students predict the direction.
- Let students predict whether it is strong or weak.
- Reveal the calculated correlation coefficient.
- Allow the student to compare their interpretation with the actual value.

The explorer should use generated datasets with valid calculated coefficients. Do not hardcode a coefficient that does not match the displayed points.

### Correlation concept

Explain visually:

- Positive correlation: as one variable increases, the other tends to increase.
- Negative correlation: as one variable increases, the other tends to decrease.
- No linear correlation: there is no clear straight-line relationship.
- Strong correlation: the points tend to follow a relatively clear linear pattern.
- Weak correlation: the points are more scattered.

Introduce the correlation coefficient, **r**, as a number between -1 and +1.

The closer its value is to +1 or -1, the stronger the linear relationship tends to be. Values closer to zero indicate a weaker linear association.

Do not present rigid universal cutoffs for weak, moderate, and strong correlation. Explain that these descriptions depend on the context and the data.

### Interactive control

Give students a draggable control that changes the strength and direction of a generated relationship.

As the points move:
- The value of r updates.
- The trend changes.
- A visual description updates.
- Students see the relationship between the appearance of the scatter plot and its coefficient.

Include a toggle for displaying or hiding the coefficient until the student makes a prediction.

## Mission 3B: Calculate and Interpret Northstar's Correlation

Return to the dataset from Activity 02.

The calculated Pearson correlation coefficient for all ten observations is approximately:

**r = -0.81**

Ask:

**Question 1:** Is the correlation positive or negative?

Correct answer: Negative.

**Question 2:** Is it strong or weak?

Expected answer: A fairly strong negative linear relationship.

**Question 3:** What does this suggest about practice laps and sector times?

Expected answer: In this dataset, riders with more practice laps tend to have lower sector times.

Emphasize that lower sector times mean faster performance.

### The outlier experiment

Now let the student temporarily hide Rider 8.

The correlation coefficient for the remaining nine points is approximately:

**r = -0.97**

Show both results:

| Dataset | Correlation coefficient |
|---|---:|
| All ten riders | -0.81 |
| Without Rider 8 | -0.97 |

Ask:

> Why did the correlation coefficient change?

Expected answer: Rider 8 is far from the main downward pattern, so that observation weakens the overall linear correlation.

Important: This is a sensitivity experiment, not permission to delete the observation. The complete dataset remains the official dataset unless there is evidence that a record is invalid.

## Mission 3C: Correlation Does Not Prove Causation

This is the most important conceptual part of the lesson.

Present the statement:

> Riders who complete more practice laps tend to have faster sector times. Therefore, completing more practice laps causes riders to become faster.

Ask:

**Can we conclude that the statement is true based on correlation alone?**

Correct answer: No.

Explain why.

The dataset is observational. It shows that two variables are associated, but it does not isolate the effect of practice laps.

Other variables might influence the relationship:
- A rider's existing skill level.
- Previous experience on similar terrain.
- Familiarity with the course.
- Weather and trail conditions.
- Fatigue.
- Mechanical issues.
- Equipment differences.

The data does not tell us exactly how much any of these factors influenced a rider's result.

### Interactive: What else could be happening?

Build a small scenario-based interaction.

Students are given possible explanations and decide whether each could be a factor that influences the observed relationship.

Examples:
- A more experienced rider might need fewer practice laps and still be fast.
- Weather might change the course between runs.
- Fatigue could influence a rider's later performance.
- Riders could have different levels of familiarity with the terrain.

Reward good explanations rather than requiring students to guess one definitive hidden cause.

### Headline Challenge

The team's marketing manager proposes this headline:

**"More Practice Laps Make You Faster!"**

Ask students to rewrite the headline using statistically responsible language.

Example of a strong answer:

> In this sample, riders with more practice laps tended to record faster sector times, but the data does not prove that additional practice laps caused the improvement.

The student should understand the difference between describing evidence and making a causal claim.

### Career spotlight: The Sports Scientist

Show a short career card explaining that sports scientists and performance analysts work with data such as:
- GPS tracking.
- Rider movement and acceleration.
- Performance times.
- Race-stage comparisons.
- Training and recovery measurements.

Link to the published enduro mountain biking research listed above.

The aim is to make students aware that the statistical skills they're practicing are actually used in sports performance research.

Award:

**Signal Detective**

---

# 8. Activity 04 — Race-Day Forecast

## Lines of Best Fit

**Route:** `/classes/algebra-1/lines-of-best-fit/`

**Story:** The team's performance director is preparing for the final race briefing.

The student now has to turn the observed relationship into a prediction model.

The director asks:

> Based on what we've learned, can we fit a line to the data and estimate a rider's sector time? More importantly, how accurate is that model?

### Learning objectives

Students will:
- Draw or calculate a line of best fit.
- Understand slope and intercept in a regression model.
- Interpret slope and intercept in the context of MTB performance.
- Make predictions.
- Calculate residuals.
- Use residuals to judge how well a model fits observed data.
- Recognize the limitations of predictions outside the observed data range.

## Mission 4A: Draw the Best-Fit Line

Return to the complete dataset:

| Practice laps (x) | Actual sector time (y) |
|---:|---:|
| 1 | 78 |
| 2 | 75 |
| 3 | 76 |
| 4 | 71 |
| 5 | 70 |
| 6 | 67 |
| 7 | 68 |
| 8 | 75 |
| 9 | 65 |
| 10 | 62 |

Show the completed scatter plot.

The student must first draw an approximate line of best fit.

### Interactive line-fitting tool

Build a graph with:
- Ten plotted observations.
- A draggable line.
- Adjustable slope and vertical position.
- An optional residual overlay.
- A toggle to reveal the least-squares regression line.

Students should be able to move their own line to better represent the overall trend.

Explain that a line of best fit should follow the general pattern of the points rather than passing through every observation.

Once students finish their attempt, reveal the calculated least-squares line.

### Regression equation

For the fictional Northstar dataset, the least-squares regression equation is:

**ŷ = 78.4 − 1.4x**

Use this as the reference model throughout the activity.

Where:
- x = number of practice laps.
- ŷ = predicted sector time in seconds.
- The slope is -1.4.
- The intercept is 78.4.

### Interpret the slope

Ask:

> What does the slope of -1.4 mean in this situation?

Correct interpretation:

The model predicts that for each additional practice lap, sector time is about 1.4 seconds lower on average within this dataset.

Be careful not to say that one more practice lap *causes* a rider to become 1.4 seconds faster. This is a statistical association, not proof of causation.

### Interpret the intercept

Ask:

> What does the intercept of 78.4 mean?

Correct interpretation:

The model predicts a sector time of 78.4 seconds for a rider with zero practice laps.

Discuss why this estimate should be treated cautiously because the observed dataset only includes riders with between one and ten practice laps.

## Mission 4B: Make a Prediction

Give the student a new scenario:

> A rider has completed six practice laps. What sector time does the model predict?

Substitute x = 6.

Predicted time:

**ŷ = 78.4 − 1.4(6) = 70 seconds**

Show the prediction on the graph.

Then reveal the actual observation:

The rider's actual time was 67 seconds.

This becomes the introduction to residuals.

## Mission 4C: Understand Residuals

Explain that a residual measures the difference between an observed result and the prediction from the line.

**Residual = Actual value − Predicted value**

Present the six-lap example:

| Measure | Time |
|---|---:|
| Predicted time | 70 seconds |
| Actual time | 67 seconds |
| Residual | -3 seconds |

Interpretation:

The rider was 3 seconds faster than the model predicted.

Because lower times are faster, a negative residual means the actual time was lower than predicted.

A positive residual means the actual time was higher—and therefore slower—than predicted.

### Full residual analysis

Let students inspect all ten observations.

Use the following answer key:

| Practice laps | Actual time | Predicted time | Residual |
|---:|---:|---:|---:|
| 1 | 78 | 77.0 | +1.0 |
| 2 | 75 | 75.6 | -0.6 |
| 3 | 76 | 74.2 | +1.8 |
| 4 | 71 | 72.8 | -1.8 |
| 5 | 70 | 71.4 | -1.4 |
| 6 | 67 | 70.0 | -3.0 |
| 7 | 68 | 68.6 | -0.6 |
| 8 | 75 | 67.2 | +7.8 |
| 9 | 65 | 65.8 | -0.8 |
| 10 | 62 | 64.4 | -2.4 |

### Interactive residual visualization

This is a key feature of the module.

On the scatter plot:
- Show the regression line.
- Draw a vertical line between every observed point and its predicted point.
- Make the residual distance visible.
- Highlight the selected rider's actual and predicted times.
- Explain positive and negative residuals when the student selects a point.

When the student selects Rider 8:
- Predicted time = 67.2 seconds.
- Actual time = 75 seconds.
- Residual = +7.8 seconds.

Ask:

> What does this tell us?

Expected answer:

Rider 8 was 7.8 seconds slower than the model predicted. This point has a relatively large residual and deserves further investigation.

Do not automatically label the rider's performance as a failure. The model cannot explain what happened.

## Mission 4D: The Forecast Challenge

Present three forecasting tasks.

**Challenge 1:**

A rider has completed six practice laps.

Correct prediction: 70 seconds.

**Challenge 2:**

A rider has completed eight practice laps.

Correct prediction: 67.2 seconds.

**Challenge 3:**

A rider is expected to complete eleven practice laps.

Model prediction: 63 seconds.

Then ask:

> Should we trust the eleven-lap prediction as much as predictions within our dataset?

Correct answer: No.

Explain extrapolation:

The model was built using data from one to ten practice laps. Predicting at eleven laps is outside the observed range. The pattern may not continue in the same way, so the prediction should be treated cautiously.

This should be visually reinforced by shading the observed x-range and marking predictions outside that range as extrapolations.

### Final mission: Prepare the Race Briefing

The student now submits a short report to the performance director.

Require the report to contain:

1. One statement about the consistency of Riders A and B.
2. One statement describing the relationship between practice laps and sector time.
3. An interpretation of the correlation coefficient.
4. The line-of-best-fit equation and what its slope means.
5. One prediction with a residual interpretation.
6. One limitation or caution about the model.

Example of a strong student report:

> Rider A was more consistent than Rider B because their interquartile range was smaller. In the second dataset, practice laps and sector time showed a fairly strong negative correlation of about -0.81. The regression model predicts a decrease of approximately 1.4 seconds for each additional practice lap in this sample, although this does not prove that practice causes faster times. For six practice laps, the model predicts 70 seconds, while the actual time was 67 seconds, giving a residual of -3 seconds. We should also investigate Rider 8's unusually large residual and be cautious about making predictions outside the observed range.

Award:

**Certified Race Intelligence Analyst**

---

# 9. The Final Experience: The Analyst's Report

After completing all four activities, unlock a final Race Intelligence Report.

This should feel like the student is delivering their work to the Northstar Gravity Racing performance director.

### Report layout

**NORTHSTAR GRAVITY RACING**

**RACE INTELLIGENCE REPORT**

Include:
- Consistency comparison.
- Mean and median comparison.
- Distribution spread comparison.
- Scatter plot.
- Correlation coefficient.
- Regression equation.
- Prediction and residual example.
- Student's written conclusions.

Use data and answers from the activities rather than asking the student to redo the calculations.

Allow the report to be viewed in a polished, printable format.

### Achievement

**Certified Race Intelligence Analyst**

A completion certificate should display:
- Student name, using the existing Mathlete account profile if available.
- Module title.
- Completion date.
- Four completed mission badges.
- Final assessment score, if supported by the current progress system.

Do not create an entirely separate certificate or account system. Reuse Mathlete's existing achievements and progress architecture.

---

# 10. Shared Learning Experience Requirements

The four activities should feel like parts of the same application.

Reuse Mathlete's existing educational interaction patterns and shared tools.

## Prediction-first learning

Before revealing a graph, statistic, or model, ask the student to predict what they expect to see.

Examples:
- Which rider will be more consistent?
- Will the scatter plot trend upward or downward?
- Does the dataset show a strong or weak relationship?
- Will a line of best fit predict every rider's time perfectly?

This keeps students actively engaged instead of passively reading explanations.

## Explore Mode

Give students freedom to experiment.

Examples:
- Add or remove a point from a dot plot.
- Adjust histogram bin widths.
- Toggle between riders.
- Move scatter plot points in a practice dataset.
- Change the strength or direction of a generated correlation.
- Drag a regression line.
- Select individual residuals.

All experimental datasets should be clearly labeled as simulations.

## Challenge Mode

Include questions that require interpretation, not just computation.

Examples:
- Two riders have the same mean but different IQRs. What does that tell you?
- Can a dataset have a lower median but a higher mean?
- What happens to correlation when an outlier is added?
- Can two variables be correlated without one causing the other?
- Why might a regression model be unreliable outside its observed range?

Provide a mix of multiple choice, numeric entry, graphing, and short written responses.

## Math Workbench

Use the existing Math Workbench throughout the module.

It should support:
- Addition and division for means.
- Sorting values.
- Finding medians.
- Finding quartiles.
- Calculating range and IQR.
- Plotting ordered pairs.
- Reading correlation coefficients.
- Substituting values into a regression equation.
- Calculating predicted values and residuals.

When displaying a calculation, show the student how the result was obtained.

Do not show only the final number.

## Progressive hints

Use a hint system that helps students work toward the answer.

For example, when calculating the median of an even-sized dataset:

1. Hint 1: First, put the values in numerical order.
2. Hint 2: There are eight values. Which two values are in the middle?
3. Hint 3: Add the two middle values and divide by two.

Hints should be specific to the task and reveal increasingly useful information.

## Tutor Mode

Tutor Mode should understand the statistics concepts in this unit.

It should be able to explain:
- What a box plot tells us.
- Why mean and median can differ.
- How to recognize positive and negative association.
- What the correlation coefficient represents.
- Why correlation does not prove causation.
- How the slope and intercept of a regression equation are interpreted.
- How to calculate and interpret residuals.

Use mountain biking examples when explaining a concept.

Never provide the answer to a graded question without first offering the student an opportunity to reason through it.

## Feedback

Feedback should explain the reasoning behind an answer.

For example:

Incorrect answer: "The rider with the higher IQR is more consistent."

Feedback:

> Take another look at what the interquartile range measures. It describes the spread of the middle 50% of the data. A smaller IQR means the middle half of the results are more tightly grouped, which indicates greater consistency.

Avoid generic responses such as "Try again" without an explanation.

## Progress and reporting

Integrate each activity with the existing Mathlete progress system.

Track:
- Activity completion.
- Correct answers.
- Hints used.
- Graphing tasks completed.
- Challenge-mode results.
- Final written report.

If the existing tutor or teacher dashboard supports lesson reporting, surface the student's performance there.

Do not create a parallel progress database or new authentication system.

---

# 11. Visual Design and Art Direction

## Overall aesthetic: Professional Downhill Race Control

This module needs its own strong identity.

It should feel inspired by the timing screens, telemetry dashboards, and race-control interfaces seen at major downhill events.

Avoid making it look like another generic classroom math application.

### Visual language

- Dark charcoal and graphite background.
- Bright race-inspired accent colors such as lime, electric yellow, and cyan.
- Large, highly legible timing numerals.
- Compact leaderboard-style data cards.
- Clean technical grid lines.
- Sector labels and timing indicators.
- Animated split-time transitions.
- Graphs that feel like real performance-analysis tools.

Keep the Mathlete MTB branding intact.

Do not reproduce UCI or Crankworx logos or imply that Mathlete is affiliated with those organizations.

### Main visual elements

**1. Race Room**

The opening mission hub. Display the performance director, team identity, race briefing, and mission progression.

**2. Timing Tower**

A leaderboard-inspired view of rider times and data.

**3. Data Analysis Screens**

Each statistical activity should use a graphing environment styled like a professional analyst's interface.

**4. Rider Performance Cards**

Show rider numbers, practice times, sector results, and statistical summaries.

**5. Analyst Report**

The student's final report should look like a concise professional team briefing.

### Imagery

Use appropriate licensed imagery or existing Mathlete assets if available:
- Downhill racing action.
- Start gates.
- Timing transponders.
- Race pits.
- Race officials monitoring timing.
- Riders crossing timing sectors.
- Professional performance-analysis environments.

Use imagery selectively. The interactive visualizations and datasets should be the centerpiece, not decorative stock photography.

### Motion and micro-interactions

- Race timing numbers animate when the student switches between riders.
- Points appear on scatter plots as the student plots them.
- Histogram bars grow to their frequency.
- Box plots animate when the dataset changes.
- Regression lines move smoothly when adjusted.
- Residual lines appear when a rider is selected.
- Achievement badges animate when a mission is completed.

Respect reduced-motion preferences.

Animations must never interfere with understanding a graph or reading its values.

---

# 12. Technical Implementation Requirements

**Important: Inspect the existing Mathlete MTB codebase before writing any code.**

Do not assume this is a greenfield project.

The current Mathlete platform already has educational tools, course structure, interactive labs, access controls, and shared components. The goal is to integrate this module into the existing experience.

### Before implementation

Claude Code must:

1. Inspect the existing Algebra 1 course structure.
2. Inspect the four supplied lesson routes.
3. Identify existing lab components, graphing tools, and Math Workbench functionality.
4. Identify existing authentication, organization access, and membership restrictions.
5. Identify how lesson progress is saved.
6. Identify existing tutor-mode, hint, and reporting functionality.
7. Identify the current visual design system and component conventions.

Then propose the smallest coherent implementation that extends the current application.

### Routes and navigation

Implement within the supplied routes:

- `/classes/algebra-1/data-representation/`
- `/classes/algebra-1/scatter-plots/`
- `/classes/algebra-1/correlation/`
- `/classes/algebra-1/lines-of-best-fit/`

Each route should load the appropriate activity within the shared Race Intelligence experience.

If the routes already contain partial lessons or working functionality, extend those implementations instead of replacing them.

Preserve:
- Current URLs.
- Course navigation.
- Authentication.
- Organization-specific access.
- Membership permissions.
- Saved progress.
- Existing working tools.
- Links from the Algebra 1 course page.

### Shared components

Follow the existing repository's architecture and naming conventions.

Possible conceptual components, only if they fit the existing architecture:

- `RaceIntelShell`
- `MissionBriefing`
- `RiderTimingCard`
- `DataTable`
- `DotPlot`
- `Histogram`
- `BoxPlot`
- `ScatterPlot`
- `CorrelationExplorer`
- `RegressionLineTool`
- `ResidualVisualizer`
- `AnalystReport`

Do not create duplicate components if equivalents already exist.

### Statistics engine

Use a deterministic and well-tested statistics implementation.

The calculation layer must correctly support:
- Mean.
- Median.
- Range.
- Quartiles.
- Interquartile range.
- Frequency distributions.
- Pearson correlation coefficient.
- Least-squares linear regression.
- Predicted values.
- Residuals.

Use a clearly documented quartile convention. For these datasets, use the median-of-halves method described above.

Round displayed values appropriately, but preserve full precision internally until the display or grading layer.

Avoid JavaScript `eval()` or other unsafe dynamic expression evaluation.

Keep the calculations separate from the presentation components so they can be unit-tested.

### Graphing requirements

The graphing environment is central to this module.

Use existing Mathlete graphing functionality wherever possible.

Do not build a new graphing application if the platform already has a suitable graph or charting system.

Graphing components must:
- Support accurate axes and scales.
- Display units.
- Support interactive point selection.
- Work with mouse, touch, and keyboard.
- Provide accessible alternative data tables.
- Display clear values on selection.
- Update immediately when the dataset changes.
- Support responsive layouts.

### Data model

Keep instructional datasets in deterministic, reusable configuration files or the existing lesson-data system.

Use clear field names and consistent units.

For example:

- `practiceLaps`
- `sectorTimeSeconds`
- `predictedTimeSeconds`
- `residualSeconds`

Do not make external API calls to UCI, ChronoRace, Crankworx, or other race timing services as part of the lesson's calculation engine.

The activities must work independently of live event timing.

### Responsive requirements

The entire module must work well on:
- Desktop.
- Laptop.
- Tablet.
- Mobile.

Graphing interactions must remain usable on smaller touchscreens.

For mobile:
- Stack data cards vertically.
- Allow graphs to resize.
- Keep axes readable.
- Use large touch targets.
- Avoid requiring precision dragging when an accessible alternative exists.
- Make tables scroll or reflow appropriately.

### Accessibility

Include:
- Keyboard navigation.
- High-contrast text.
- Colorblind-friendly graph distinctions.
- Non-color indicators for positive and negative residuals.
- Screen-reader descriptions of chart content.
- Alternative tables for visualizations.
- Clear labels and units.
- Reduced-motion support.

---

# 13. Quality Assurance and Test Cases

Claude Code must test the calculations, activities, and complete student journey before considering this work finished.

## Statistics calculation tests

Verify the following:

**Rider A**
- Mean: 64
- Median: 64
- Range: 4
- Q1: 63
- Q3: 65
- IQR: 2

**Rider B**
- Mean: 65
- Median: 63.5
- Range: 18
- Q1: 60
- Q3: 69.5
- IQR: 9.5

**Histogram frequencies**

| Bin | Rider A | Rider B |
|---|---:|---:|
| 58–62 | 1 | 3 |
| 63–67 | 7 | 3 |
| 68–72 | 0 | 1 |
| 73–77 | 0 | 1 |

**Scatter plot data**
- Ten correct paired points.
- Correct negative direction.
- Correct outlier at (8, 75).
- Correct interpretation of the main cluster.

**Correlation**
- Full dataset: approximately -0.81.
- Nine-point dataset excluding Rider 8: approximately -0.97.

**Regression**
- Slope: -1.4.
- Intercept: 78.4.
- Equation: ŷ = 78.4 − 1.4x.

**Prediction**
- At six practice laps: 70 seconds.
- At eight practice laps: 67.2 seconds.
- At eleven practice laps: 63 seconds, with extrapolation warning.

**Residuals**
- At six practice laps: -3 seconds.
- At eight practice laps: +7.8 seconds.

## Functional tests

Test that:

1. Dot plots correctly display repeated observations.
2. Histogram bars use the correct intervals and frequencies.
3. Box plots show correct five-number summaries.
4. The scatter plot correctly maps every paired observation.
5. Students can move or place points where required.
6. Correlation coefficients recalculate when data changes.
7. The outlier experiment updates the displayed coefficient.
8. Regression lines update when students change their line.
9. Predicted values are correct.
10. Residuals are calculated as actual minus predicted.
11. Predictions outside the observed x-range are flagged.
12. Progress is saved and restored correctly.
13. Tutors can access the appropriate lesson tools.
14. The module works on desktop and mobile.
15. No existing Mathlete routes or tools are broken.

## Educational QA

Have someone unfamiliar with the module complete all four activities.

Verify that students can independently explain:

- What mean and median represent.
- What range and IQR tell us.
- Why a box plot helps compare distributions.
- How to recognize positive and negative associations.
- What a correlation coefficient means.
- Why correlation does not prove causation.
- What slope and intercept mean in a regression equation.
- What a residual represents.
- Why predictions outside the data range require caution.

---

# 14. Acceptance Criteria

The module is ready for release when:

- All four existing lesson routes contain complete, interactive activities.
- All four activities share the Northstar Gravity Racing storyline.
- All datasets and calculations match the verified answer keys.
- Students can create and interpret all required data displays.
- Students can create and interpret scatter plots.
- Students can explain the direction and strength of correlation.
- Students understand the difference between correlation and causation.
- Students can work with a line of best fit and interpret slope and intercept.
- Students can make predictions and interpret residuals.
- The final analyst report consolidates the student's work.
- Existing Mathlete authentication, access, course navigation, and progress systems continue to function.
- The experience is responsive, accessible, and visually polished.
- All major interactions have been tested.

---

# 15. Non-Goals and Guardrails

Do not turn this into:
- A live UCI racing-results application.
- A full sports analytics platform.
- A GPS tracking application.
- A bike telemetry simulator.
- A professional athlete ranking system.
- A generic statistics worksheet with MTB images added afterward.

The purpose is to teach Algebra 1 statistics through an authentic MTB racing context.

Do not imply:
- That the fictional datasets represent actual athletes.
- That correlations establish training effects.
- That regression models can reliably predict real race results.
- That an unusual data point proves a rider made a mistake.
- That students are learning professional coaching or training prescriptions.

Keep the mathematics at an appropriate Algebra 1 level.

---

# 16. Build Sequence

Implement this in clear phases so that the experience remains cohesive.

### Phase 1 — Repository inspection and architecture

Inspect existing routes, shared components, Math Workbench, graphing tools, progress systems, and access controls.

Create a brief implementation plan that identifies what can be reused and what needs to be built.

### Phase 2 — Shared Race Intelligence experience

Create the shared layout, storyline, visual identity, mission progression, and reusable data-display components.

### Phase 3 — Activity implementation

Build the four activities in order:

1. The Consistency Audit.
2. The Pattern Scan.
3. Signal or Noise?
4. Race-Day Forecast.

### Phase 4 — Final report and progress integration

Create the analyst report, achievement, and integration with existing Mathlete progress and tutor reporting.

### Phase 5 — QA and polish

Verify calculations, graph interactions, mobile responsiveness, accessibility, and route integrity.

Test the full journey from the opening briefing through the final analyst report.

---

# Final Product Standard

I want this to be one of the best examples of what Mathlete MTB can do.

A student who loves downhill racing should finish this unit thinking:

**"I didn't realize statistics could be used to understand racing like that."**

They should walk away with a better understanding of data, but also a new appreciation for the analytical side of mountain biking.

The lesson should make them feel like they have stepped into a professional race team's performance department, learned how analysts think, and used real mathematical tools to uncover something interesting.

Build this as a cohesive, polished, interactive educational experience—not four static lessons.

**The student isn't just learning statistics. They're learning how to think like a Race Intelligence Analyst.**