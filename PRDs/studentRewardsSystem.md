# Mathlete MTB — Student Gamification & Rewards System

**Project:** Mathlete MTB  
**Feature:** Trail XP, Daily Streaks, Levels, Achievements & Rewards  
**Primary users:** Students  
**Secondary users:** Teachers and organization administrators  
**Development:** Integrate directly into the existing Mathlete MTB website.

---

# 1. Project Overview

## Objective

Build a comprehensive student engagement and rewards system that incentivizes students to consistently use Mathlete MTB to practice mathematics, complete lessons, solve problems, and improve their mathematical abilities.

The system should combine:

- A Duolingo-inspired daily streak system.
- An experience points (XP) system.
- Progressive rider levels.
- Achievement badges.
- Unlockable rewards and profile customization.
- Daily practice goals.
- Personal learning progress.

The goal is to make practicing mathematics feel rewarding, motivating, and fun.

Every meaningful learning activity should contribute to a student's sense of progression.

Students should have a reason to return to Mathlete MTB every day, whether that means completing a lesson, solving a few practice problems, revisiting a difficult concept, or exploring a new MTB learning lab.

## Core philosophy

**Reward consistency. Celebrate improvement. Make learning an adventure.**

This system should reward students for actually learning mathematics, not simply clicking buttons or spending time on the website.

It should encourage:

1. Consistent daily practice.
2. Completing lessons.
3. Correctly solving mathematical problems.
4. Revisiting previously learned concepts.
5. Improving mathematical understanding.
6. Exploring different courses, units, and activities.

The experience should be positive and encouraging. Students should never lose previously earned XP, levels, or achievements because they miss a day.

---

# 2. The Five Core Components

The entire system should be built around five connected components.

## A. Daily Streaks

Students maintain a streak by reaching their daily mathematics practice goal.

Display a flame icon and the number of consecutive days the student has achieved their daily goal.

## B. Trail XP

Students earn experience points for completing lessons, solving problems, completing MTB labs, and other eligible learning activities.

## C. Rider Levels

Students advance through mountain biking-themed levels as they accumulate XP.

## D. Achievements & Badges

Students unlock achievements for hitting milestones, maintaining streaks, solving problems, completing lessons, and demonstrating progress.

## E. Trail Rewards

Students unlock MTB-themed profile customizations, titles, badges, and other visual rewards as they advance.

These five systems should work together while maintaining separate responsibilities.

---

# 3. Trail XP — The Point System

Create a points system called:

**TRAIL XP**

Trail XP represents a student's lifetime mathematical learning experience.

Every eligible learning activity should award XP automatically.

Display XP prominently throughout the student experience.

## Initial XP reward structure

| Student activity | XP reward |
|---|---:|
| Solve an easy practice problem correctly | 5 XP |
| Solve a standard practice problem correctly | 7 XP |
| Solve a challenging practice problem correctly | 10 XP |
| Complete a full lesson | 20 XP |
| Complete an interactive MTB lab | 10 XP |
| Complete an assessment | 5 XP |
| Reach daily practice goal | 5 XP bonus |

These values should be configurable through the reward system rather than hardcoded throughout the application.

### Practice problem rewards

Students earn XP when they successfully solve a practice problem.

Important rules:

- Award XP when the problem is answered correctly.
- Use the problem's unique ID to prevent duplicate XP farming.
- A problem should only award its first-solve XP once per student.
- Repeated attempts at an already solved problem should not generate additional first-solve XP.
- New problems and unique problem variants can generate new XP.
- Do not deduct XP for incorrect answers.
- Do not penalize students for using hints.
- Display positive feedback when students get an answer wrong, encouraging them to learn and try again.

Difficulty should determine the XP value.

Easy: 5 XP  
Standard: 7 XP  
Challenge: 10 XP

Difficulty should be assigned by the content or problem definition, not selected by students simply to earn more points.

### Lesson completion rewards

Completing a lesson awards 20 XP.

A lesson should only award XP once per student.

Lesson completion should require meaningful engagement with the required learning components, such as completing the designated activity and submitting the lesson's exit ticket or required assessment.

Do not allow students to earn lesson-completion XP simply by opening a lesson and immediately clicking a completion button.

Teachers or curriculum administrators should be able to configure completion requirements for individual lessons.

### MTB lab rewards

Completing a unique Mathlete MTB interactive lab awards 10 XP.

Examples:

- Jump Lab.
- Trail Slope Explorer.
- Suspension Setup Studio.
- Bicycle Geometry Lab.
- Velocity and Vector Lab.

A lab should have a defined completion event.

Simply launching or viewing a lab should not award XP.

### Assessment completion rewards

Completing a designated assessment awards 5 XP.

The completion bonus should reward completing the assessment, not require a perfect score.

Correctly answered problems within the assessment can also award their normal problem-solving XP, subject to the unique-problem rules.

### Daily goal bonus

Once a student reaches their daily XP goal, award an additional 5 XP bonus.

This is a once-per-day reward.

The bonus XP contributes to lifetime XP and level progression but does not count toward the daily goal that triggered it.

This prevents circular reward calculations.

---

# 4. Daily Streak System

This is one of the most important features.

Build a Duolingo-inspired daily streak system, adapted for mathematics education and Mathlete MTB's visual identity.

## How it works

A student has a daily practice goal.

Once the student earns enough qualifying XP to meet that goal, their day counts toward their streak.

The streak increases with consecutive successful practice days.

Example:

Monday: Daily goal completed → 1-day streak  
Tuesday: Daily goal completed → 2-day streak  
Wednesday: Daily goal completed → 3-day streak  
Thursday: Daily goal completed → 4-day streak  
Friday: Daily goal completed → 5-day streak

If the student misses a day without streak protection, their streak resets the next time they return and complete their daily goal.

Previously earned XP and achievements are never lost.

## Daily practice goals

Give students three possible daily goals.

| Goal | Required qualifying XP | Description |
|---|---:|---|
| Casual Ride | 10 XP | A little math every day |
| Regular Ride | 20 XP | A consistent daily practice habit |
| Big Ride | 30 XP | A more intensive daily challenge |

**Default setting: Regular Ride — 20 XP.**

Students can select their goal during onboarding or from their student profile.

Allow students to change their goal, with changes taking effect the following local calendar day. Limit changes to once every seven days.

Organizations should be able to set the default goal and determine whether students can change it.

Importantly, only qualifying learning XP counts toward the daily goal:

- Correctly solving practice problems.
- Completing lessons.
- Completing interactive MTB labs.

Do not count:

- Logging into the website.
- Opening or viewing lessons.
- Opening an interactive tool without completing it.
- Achievement rewards.
- Level-up bonuses.
- The daily goal bonus itself.

This ensures students must actually engage with mathematics to maintain their streak.

## Streak display

Place a flame icon and current streak count in a prominent location in the student interface.

Suggested placement:

- Student dashboard.
- Navigation/header.
- Student profile.
- Reward and achievement page.

The streak should be visible without being distracting.

Example:

**🔥 7 DAY STREAK**

You're building a great habit!

## Streak calendar

Create a visual weekly activity calendar.

Display the seven days of the week and indicate which days the student successfully reached their daily goal.

Use:

- Completed day: highlighted checkmark.
- Current day: active highlight with progress indicator.
- Future day: inactive.
- Protected day: shield indicator.
- Missed day: neutral missed-day indicator.

Include a more detailed monthly calendar on the rewards/profile page.

Students should be able to visually see their consistency over time.

## Daily goal progress

Display a progress bar throughout the day.

Example:

**Today's Goal: Regular Ride**

15 / 20 XP earned

75% complete.

Only 5 XP remaining to protect your streak!

Update this automatically whenever eligible XP is earned.

When the student reaches their goal:

- Celebrate completion.
- Animate the streak flame subtly.
- Display a successful daily goal message.
- Award the 5 XP daily bonus.
- Update the streak calendar.
- Display the next day's goal status.

---

# 5. Streak Protection — Trail Shields

A good streak system should encourage consistency without making students feel terrible when they miss a day.

Implement a feature called:

**TRAIL SHIELDS**

Trail Shields protect a student's streak if they miss one day.

### Shield mechanics

- New students receive one introductory shield.
- Students can hold a maximum of two shields.
- Award one additional shield at each seven-day streak milestone.
- Do not exceed the two-shield inventory limit.
- If the student misses exactly one day and subsequently returns to complete their daily goal, automatically consume one available shield to protect that missed day.
- A shield protects only one missed day.
- Two consecutive missed days cannot be protected by a single shield.
- Shield usage should be visible in the streak calendar.

Students should never purchase streak protection with real money.

No XP should be deducted when using a shield.

This feature should be automatic; students should not have to remember to manually activate protection.

### Important streak rules

- Streaks are based on local calendar days, not rolling 24-hour windows.
- Use the student's configured IANA timezone.
- Use server-authoritative timestamps.
- Handle daylight saving changes correctly.
- A missed day should not prematurely display a broken streak before the local day has ended.
- Streak protection should apply only when the student returns and completes their goal.
- Preserve the student's longest-ever streak even when their current streak resets.

---

# 6. Rider Levels — Progression System

Give students a sense of long-term progression through mountain biking-themed rider levels.

As students accumulate Trail XP, they advance through increasingly prestigious ranks.

The level system should be visible on their student dashboard and profile.

## Initial level structure

| Level | Rider title | Lifetime XP required |
|---|---|---:|
| 1 | New Rider | 0 |
| 2 | Trail Scout | 100 |
| 3 | Trail Rider | 250 |
| 4 | Trail Explorer | 500 |
| 5 | Trail Shredder | 850 |
| 6 | Trail Adventurer | 1,300 |
| 7 | Trail Pro | 1,900 |
| 8 | Trail Champion | 2,600 |
| 9 | Trail Legend | 3,500 |
| 10 | Mathlete Legend | 4,600 |

These are initial balancing values and should be stored in a configurable level progression table.

### Level progression display

Show the student's:

- Current level.
- Rider title.
- Current lifetime XP.
- XP needed to reach the next level.
- Progress bar toward the next level.

Example:

**LEVEL 4 — TRAIL EXPLORER**

485 / 500 XP

15 XP to Level 5!

### Level-up celebrations

When a student advances a level:

- Display a celebration animation.
- Show their new level and title.
- Reveal the newly unlocked reward.
- Update their profile.
- Display a message congratulating them.

Keep the experience exciting without making the interface overly distracting.

Levels should never decrease.

---

# 7. Achievement System — Badges

Create a dedicated achievement system that recognizes milestones and meaningful accomplishments.

Achievements should be permanent and displayed on the student's profile.

Use MTB-inspired names, icons, and descriptions.

## Initial achievement categories

### A. Streak achievements

| Achievement | Requirement |
|---|---|
| First Lap | Complete your first daily streak day |
| Building Momentum | Reach a 3-day streak |
| Trail Regular | Reach a 7-day streak |
| Weekend Warrior | Reach a 14-day streak |
| Mountain Machine | Reach a 30-day streak |
| Trail Master | Reach a 60-day streak |
| Legendary Rider | Reach a 100-day streak |

### B. Problem-solving achievements

| Achievement | Requirement |
|---|---|
| First Climb | Solve your first problem |
| Problem Solver | Solve 25 problems |
| Mathlete | Solve 100 problems |
| Math Machine | Solve 250 problems |
| Mathematical Legend | Solve 500 problems |

### C. Lesson achievements

| Achievement | Requirement |
|---|---|
| First Lesson | Complete your first lesson |
| Getting After It | Complete 10 lessons |
| Curriculum Explorer | Complete 25 lessons |
| Dedicated Student | Complete 50 lessons |
| Academic Shredder | Complete 100 lessons |

### D. Exploration achievements

| Achievement | Requirement |
|---|---|
| Trail Explorer | Practice in three different units |
| Course Conqueror | Complete an entire curriculum unit |
| All-Mountain Rider | Complete lessons in three different courses |
| Lab Rat | Complete five interactive MTB labs |

### E. Persistence and improvement achievements

| Achievement | Requirement |
|---|---|
| Comeback Rider | Return to practice after seven inactive days |
| Never Give Up | Complete a challenging problem after previous unsuccessful attempts |
| Mastery Rider | Reach the designated mastery threshold for a skill |
| Consistency Champion | Reach your daily goal on five days in one week |

Achievement thresholds should be configurable.

Prevent duplicate badge awards.

### Badge presentation

Each badge should have:

- Name.
- Icon or illustration.
- Description.
- Achievement category.
- Unlock requirement.
- Unlock date.
- Locked/unlocked visual state.

Locked badges should be visible in the student's achievement collection, with their requirements displayed so students know what they are working toward.

Badges should provide recognition and cosmetic progression rather than large amounts of XP that could distort the learning economy.

---

# 8. Trail Rewards — Unlockable Customization

XP and levels should unlock visual rewards that allow students to personalize their Mathlete experience.

Create a simple reward inventory system.

Call this section:

**THE TRAIL GARAGE**

Students can view their unlocked rewards and select the cosmetic items they want displayed on their profile.

Possible rewards:

- Profile avatar styles.
- Helmet designs.
- Jersey colors.
- Mountain biking-themed profile backgrounds.
- Achievement frames.
- Rider titles.
- Special badge designs.

### Example level rewards

| Level | Unlockable reward |
|---|---|
| Trail Scout | Basic rider profile frame |
| Trail Rider | MTB helmet avatar |
| Trail Explorer | Trail map background |
| Trail Shredder | Custom jersey color |
| Trail Adventurer | Special rider title |
| Trail Pro | Premium profile frame |
| Trail Champion | Championship badge |
| Trail Legend | Legendary trail background |
| Mathlete Legend | Exclusive Mathlete profile theme |

For the MVP, focus on a limited selection of attractive visual rewards rather than building an enormous shop.

Rewards should unlock automatically as students advance.

Students should be able to equip previously unlocked items.

Do not create a paid shop, loot boxes, randomized rewards, or gambling-style mechanics.

Trail XP should represent permanent learning experience, not a currency that disappears when spent.

---

# 9. Student Rewards Dashboard

Create a dedicated student experience that brings all of these features together.

The dashboard should be visually appealing and immediately communicate student progress.

## Recommended layout

### Top section: Rider profile

Display:

- Profile avatar.
- Current rider title.
- Current level.
- Total XP.
- Progress toward next level.

### Streak section

Display prominently:

- Current streak.
- Flame icon.
- Daily goal progress.
- Weekly streak calendar.
- Available Trail Shields.
- Next streak milestone.

### XP section

Show:

- Lifetime XP.
- XP earned today.
- Recent XP transactions.
- Progress toward next level.

### Achievements section

Display:

- Recently unlocked badges.
- Progress toward locked achievements.
- A button to view all achievements.

### Trail Garage

Display:

- Current equipped profile items.
- Newly unlocked items.
- Available customizations.

### Learning progress

Connect the reward experience to the student's mathematics activity.

Display:

- Lessons completed.
- Problems solved correctly.
- MTB labs completed.
- Units explored.
- Courses in progress.

The dashboard should make students feel that their learning is building toward something.

---

# 10. Reward Feedback Throughout the Website

The rewards system should not exist exclusively on the dashboard.

Students should receive immediate feedback when they perform eligible learning activities.

## Practice problem feedback

When a student correctly solves a problem:

Display a subtle animation and reward notification.

Example:

**+5 XP!**

Nice work! You solved that problem.

Show an updated daily goal progress bar.

If the student reaches their daily goal, trigger the streak celebration.

If a problem is answered incorrectly, provide constructive feedback and another opportunity to learn. Do not show a negative XP notification.

## Lesson completion feedback

After completing a lesson:

Display:

**LESSON COMPLETED!**

+20 Trail XP

Show progress toward the next rider level.

## MTB lab completion feedback

After completing a Mathlete MTB lab:

Display:

**LAB COMPLETE!**

+10 Trail XP

Celebrate the fact that the student explored mathematics through a real-world application.

## Level-up feedback

Trigger a distinct celebration when a student advances a level.

Include their new rider title and unlocked reward.

## Achievement feedback

When a student unlocks a badge, display a notification with the badge artwork and achievement description.

All feedback should be fast, responsive, and non-blocking.

Do not interrupt students in the middle of an activity with oversized popups.

---

# 11. Integration With Existing Mathlete MTB Learning Tools

The rewards system must integrate with the existing Mathlete MTB site and all existing student learning tools.

Inspect the existing application and identify the different kinds of learning activities already implemented.

Potential XP-generating events include:

- Completing a lesson plan.
- Solving an Algebra problem.
- Completing a Geometry exercise.
- Finishing a quadratic functions activity.
- Completing a Jump Lab.
- Completing a suspension simulation.
- Solving practice questions.
- Completing assessments.
- Completing other qualifying learning activities.

Implement a centralized reward event system so that developers can award XP through a consistent interface.

Do not individually hardcode point calculations inside every learning tool.

For example, an activity should be able to report that a student successfully completed a unique problem or lab. The central rewards system should then determine the appropriate XP award, validate eligibility, update the student's progress, and handle streak calculations.

Every qualifying activity must have a stable, unique source ID.

The system should be extensible so future Mathlete tools can integrate into rewards without requiring major architectural changes.

---

# 12. Data Architecture and Backend Requirements

Before implementation, inspect the existing database, authentication, user profiles, organization access, and student learning activity models.

Reuse existing infrastructure wherever possible.

Create a centralized rewards data model.

Suggested conceptual entities:

### Student reward profile

Fields:

- user_id
- organization_id
- lifetime_xp
- current_level
- current_streak
- longest_streak
- daily_goal_xp
- timezone
- available_shields
- selected_profile_rewards
- created_at
- updated_at

### XP transaction ledger

Fields:

- transaction_id
- user_id
- organization_id
- event_type
- source_id
- xp_awarded
- qualifying_xp
- awarded_at
- idempotency_key
- metadata

The transaction ledger should be the authoritative record of all XP awards.

### Daily activity

Fields:

- user_id
- local_date
- qualifying_xp_earned
- bonus_xp_earned
- daily_goal_target
- goal_completed
- streak_status
- shield_used
- created_at
- updated_at

### Achievement definitions

Fields:

- achievement_id
- achievement_name
- description
- category
- unlock_requirement
- icon
- active_status

### Student achievements

Fields:

- user_id
- achievement_id
- unlocked_at

### Reward catalog

Fields:

- reward_id
- reward_name
- reward_type
- description
- unlock_level
- visual_asset
- active_status

### Student unlocked rewards

Fields:

- user_id
- reward_id
- unlocked_at
- equipped_status

These are conceptual requirements. Adapt names and relationships to the existing database architecture.

Use appropriate relationships, indexing, and organization-level access controls.

---

# 13. Anti-Abuse and Reward Integrity

This is critical.

Students should not be able to farm XP by repeatedly clicking buttons, refreshing pages, resetting activities, or submitting duplicate events.

Implement:

1. Server-side validation of qualifying learning events.
2. Unique transaction IDs and idempotency keys.
3. One-time first-solve XP per problem ID and student.
4. One-time lesson completion XP per lesson and student.
5. One-time lab completion XP per lab and student.
6. One-time assessment completion bonuses.
7. Server-authoritative streak calculation.
8. Server-authoritative XP totals and level progression.
9. Database transactions when awarding XP and updating streak state.
10. Protection against duplicate requests and race conditions.

Do not trust client-side XP values.

The backend should determine the XP award using the activity's configured rules.

A student should never be able to manually edit their XP, level, streak, or rewards through browser-side state.

Incorrect answers must not create qualifying XP.

However, do not make the system so restrictive that legitimate learning activities fail to award points.

---

# 14. Teacher and Organization Integration

The rewards experience should be compatible with Mathlete MTB's existing organization and student-access architecture.

For the initial release, students should experience the rewards system independently.

Prepare the architecture for future teacher capabilities, including:

- Viewing individual student XP.
- Viewing current and longest streaks.
- Tracking students' daily activity.
- Monitoring lesson completion.
- Seeing problems solved.
- Tracking classroom engagement.
- Configuring organization-wide daily practice goals.
- Disabling or adjusting optional rewards.

Future functionality could include collaborative classroom challenges, where students work toward a collective mathematics goal.

Avoid implementing competitive class rankings in the initial release.

The focus should remain on individual growth and positive learning habits.

---

# 15. Visual Design Requirements

The design should feel like Mathlete MTB, not a generic school dashboard.

Use the existing brand identity, colors, typography, and layout conventions.

The reward system should visually incorporate mountain biking themes.

Design direction:

- Attractive flame icon for streaks.
- MTB-themed level badges.
- Beautiful achievement artwork.
- Rider profile cards.
- Progress bars.
- Reward unlock animations.
- Trail maps or progression visuals where appropriate.
- Clear XP indicators.
- Attractive weekly and monthly calendar views.

Use consistent iconography and avoid unnecessary visual clutter.

The system should feel exciting to high school students without appearing childish.

Prioritize responsive design for desktop, tablet, and mobile.

All animations should respect reduced-motion accessibility settings.

Use accessible labels and color-independent indicators for streak status and progress.

---

# 16. Suggested Development Milestones

Implement the feature incrementally.

## Milestone 1 — Centralized XP Engine

Build the backend reward system.

Implement:

- Reward event processing.
- XP transaction ledger.
- Unique event validation.
- Configurable XP rewards.
- Student reward profiles.
- Lifetime XP calculations.

Test the system using existing practice problems and lesson completion events.

## Milestone 2 — Daily Streak System

Build:

- Daily practice goals.
- Streak calculations.
- Timezone handling.
- Weekly calendar.
- Daily progress bar.
- Trail Shields.
- Streak milestone recognition.

Test consecutive days, missed days, protected days, and timezone boundaries.

## Milestone 3 — Student Dashboard

Implement the student rewards interface.

Display:

- Current streak.
- Daily goal.
- XP total.
- Rider level.
- Weekly calendar.
- Achievement previews.

Integrate this into the existing student dashboard.

## Milestone 4 — Levels and Achievements

Implement:

- XP-based rider progression.
- Level thresholds.
- Badge definitions.
- Achievement eligibility.
- Achievement unlock notifications.
- Student badge collection.

## Milestone 5 — Trail Garage

Implement the initial unlockable rewards catalog.

Build:

- Reward inventory.
- Automatically unlocked rewards.
- Equip and unequip functionality.
- Profile customization.

## Milestone 6 — Integrate Existing Learning Activities

Connect all relevant existing Mathlete MTB learning tools to the central reward engine.

Ensure practice problems, lesson completions, assessments, and MTB labs award points correctly.

## Milestone 7 — Quality Assurance

Test the entire system.

Verify:

- Students receive the correct XP.
- Duplicate activities do not award duplicate XP.
- Lessons award points only once.
- Streaks update correctly.
- Trail Shields work correctly.
- Daily goals reset at local midnight.
- Timezone changes do not corrupt historical streak records.
- Levels advance at the correct XP thresholds.
- Achievements unlock correctly.
- Rewards remain permanently unlocked.
- No previously earned XP is lost.
- The system works with existing authentication and organization access.
- The student interface works on desktop and mobile.

---

# 17. Success Metrics

The purpose of this feature is to increase meaningful mathematics practice.

Do not measure success exclusively by logins or time on the website.

Track:

- Daily active students.
- Weekly active students.
- Average practice days per student.
- Percentage of students completing their daily goal.
- Average number of correctly solved problems per student.
- Lessons completed per week.
- MTB labs completed.
- Seven-day streak retention.
- Thirty-day streak retention.
- Student return rate after periods of inactivity.
- Improvement in assessment performance and mastery, where existing assessment data supports it.

Compare engagement and learning outcomes before and after implementation.

The most important metric is whether students are practicing mathematics more consistently and making measurable academic progress.

---

# 18. Definition of Done

The feature is complete when:

1. Every student has a rewards profile.
2. Students automatically earn XP for eligible learning activities.
3. Correct practice problems award appropriate XP.
4. Completed lessons award XP.
5. Completed MTB labs award XP.
6. Students can select a daily practice goal.
7. A daily streak is maintained by reaching that goal.
8. Students can see their current streak and weekly activity calendar.
9. Trail Shields protect eligible missed days.
10. Students advance through rider levels as they earn XP.
11. Achievements unlock automatically.
12. Students can view their achievements.
13. Level-based rewards unlock.
14. Students can customize their reward profile.
15. The system prevents duplicate XP and fraudulent activity.
16. The entire experience integrates with existing Mathlete MTB functionality.
17. The experience works responsively across devices.

---

# 19. Important Implementation Instructions

Before modifying anything, inspect the existing Mathlete MTB application.

Understand:

- Current authentication.
- Student profiles.
- Teacher and organization structure.
- Existing lesson completion mechanisms.
- Existing practice problem components.
- Existing interactive MTB tools.
- Current database and backend.
- Current navigation and dashboard components.

Integrate rewards into the actual existing learning events.

Do not create a disconnected points system that simply looks attractive but does not reflect real student learning.

Do not rebuild existing features.

Do not assume that every activity uses the same completion mechanism. Build adaptable reward event integrations.

Keep XP calculations, streak logic, and reward definitions centralized.

Make reward values, level thresholds, streak milestones, and achievement requirements configurable.

Ensure that teacher-only and student-only information respects existing access controls.

Prioritize the core XP engine and streak functionality before spending significant time on decorative elements.

---

# FINAL PRODUCT VISION

We want Mathlete MTB to become more than a place where students complete math assignments.

We want it to become a place where students build a habit of practicing mathematics.

Every problem solved moves them forward.

Every lesson completed builds experience.

Every day of practice strengthens their streak.

Every achievement reminds them how far they've come.

Every new level gives them something to work toward.

**Make math practice feel like progressing through a mountain biking career.**

The student should open Mathlete MTB, see their progress, feel motivated to keep their streak alive, and be excited to earn their next reward.

The ultimate reward, however, is that they're becoming more confident and capable mathematicians along the way.

**Mathlete MTB: Ride. Learn. Progress. Repeat.**