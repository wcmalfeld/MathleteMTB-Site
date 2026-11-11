# PRD: Mathlete MTB – Student Progress & Personalized Tutoring System

**Target development environment:** Claude Code – Claude Fable 5.2  
**Product:** Mathlete MTB  
**Website:** mathletemtb.com  
**Project type:** Feature expansion of an existing application  
**Priority:** High  
**Primary objective:** Turn Mathlete MTB into a personalized learning platform that connects independent student practice, educational games, academic progress tracking, and one-on-one tutoring.

---

# 1. Product Vision

## 1.1 Overview

Expand the existing Mathlete MTB website to support persistent student accounts, automatic academic progress tracking, saved incorrect answers, personalized practice, and tutor-facing student management tools.

Currently, Mathlete MTB provides educational games and interactive learning experiences built around mountain biking, mathematics, and physics.

The next evolution is to make those experiences part of a continuous, personalized learning system.

A student should be able to:

1. Create an account and access their personal Mathlete profile.
2. Play educational games throughout the week.
3. Have all questions, answers, attempts, mistakes, and relevant performance data automatically saved.
4. Review previous mistakes and practice concepts they struggled with.
5. Track their academic progress over time.
6. Receive personalized assignments and learning recommendations.

A tutor should be able to:

1. Access all of their assigned students.
2. See each student's academic performance and practice history.
3. Review specific questions that students answered incorrectly.
4. Identify recurring academic weaknesses and knowledge gaps.
5. Prepare personalized tutoring sessions using actual student performance data.
6. Create custom assignments and practice activities.
7. Record observations and track student improvement over time.

Eventually, parents should also have the ability to receive progress reports demonstrating the value and results of their child's learning experience.

## 1.2 Core Product Philosophy

Mathlete MTB should not feel like traditional school software.

The student experience should feel like an extension of the mountain biking games and challenges they already enjoy.

The tutor experience should feel like a professional learning management system that makes it easier to deliver personalized instruction.

The product should connect three things:

- **Practice:** What students do independently throughout the week.
- **Progress:** What Mathlete learns about their academic abilities.
- **Coaching:** How tutors use this information to provide individualized instruction.

The central product loop:

Student practices → Performance is recorded → Knowledge gaps are identified → Personalized practice is assigned → Tutor reviews progress → Student improves.

This cycle should continuously repeat.

## 1.3 Important Development Instruction

This is an expansion of an existing website.

Before writing or modifying code:

1. Inspect the entire existing codebase.
2. Understand the framework, architecture, database, authentication system, hosting environment, and existing integrations.
3. Identify how educational games currently handle questions, answers, correct/incorrect feedback, and game progression.
4. Identify the existing user interface conventions, component library, design system, and responsive layouts.
5. Identify whether student accounts, authentication, or database functionality already exist.
6. Determine the cleanest way to integrate this functionality into the existing architecture.

**Do not rebuild the existing website. Do not replace working games. Do not introduce a new framework or database simply to implement these features.**

Reuse existing functionality wherever possible.

Create a concise architecture assessment and implementation plan before making significant modifications. Then proceed with implementation in logical phases.

If an existing feature already satisfies a requirement, extend or reuse it instead of creating a duplicate.

---

# 2. User Roles and Permissions

The platform will support three primary user roles initially, with an administrator role where needed.

## 2.1 Student

Students should be able to:

- Access their own personal accounts.
- Play all games they are authorized to access.
- View their academic progress.
- View their practice history.
- Review previously incorrect questions.
- Complete recommended practice.
- View tutor-assigned homework.
- Submit reflections about challenging concepts.
- View their goals and completed assignments.

Students must never be able to access another student's private information.

## 2.2 Tutor

Tutors should have a separate dashboard.

They should be able to:

- View students assigned to them.
- Access individual student profiles.
- Review all student performance data.
- View incorrect answers and previous attempts.
- View skill-level performance.
- Add private instructional observations.
- Create and assign practice activities.
- Create weekly learning goals.
- Prepare and document tutoring sessions.
- Mark problems as reviewed or mastered when appropriate.
- Generate student progress summaries.

Tutors should only access students assigned to them.

## 2.3 Parent

Parent functionality can be developed as a later phase.

Parents should eventually be able to:

- View their child's progress.
- See practice activity and participation.
- Receive periodic progress reports.
- View completed assignments and upcoming learning objectives.

Parents should not automatically have access to private tutor observations.

## 2.4 Administrator

Administrators should be able to:

- Create and manage tutor accounts.
- Manage student accounts.
- Assign students to tutors.
- Manage available games and educational content.
- Review system activity when necessary.
- Manage skill categories and academic tags.
- Configure platform-wide settings.

## 2.5 Security and permissions

Implement all permissions at the backend/database level, not merely by hiding UI elements.

Use the existing authentication and authorization architecture.

Students must only access their own records. Tutors must only access records belonging to their assigned students. Parent access must be explicitly linked to the appropriate student.

Because the platform serves minors, use data minimization, secure access controls, and appropriate parent-consent workflows. Avoid exposing personal student information in public URLs, client-side logs, or unsecured API responses.

---

# 3. Student Account & Profile System

## 3.1 Student registration

Create a student account experience that integrates naturally with the existing website.

Users should be able to:

- Register.
- Log in.
- Log out.
- Reset passwords.
- Maintain a persistent profile across visits and devices.

Reuse the existing authentication system if available.

Avoid creating duplicate authentication systems.

## 3.2 Student profile

Every student should have a persistent profile containing:

**Basic information**
- Student name.
- Account ID.
- Account creation date.
- Assigned tutor or tutors.
- Grade level (optional).
- Academic level or starting baseline.
- Profile image or avatar if supported by the existing design.

**Learning information**
- Games played.
- Questions attempted.
- Questions answered correctly.
- Questions answered incorrectly.
- Total practice sessions.
- First-attempt accuracy.
- Hint usage.
- Skill-level performance.
- Outstanding review problems.
- Completed assignments.
- Learning goals.
- Tutor observations.

Every record should be associated with the correct student account.

## 3.3 Student navigation

Add a clear student account navigation experience.

Recommended sections:

1. **Dashboard:** Overview of current performance and recommended next steps.
2. **Play:** Existing educational games.
3. **My Progress:** Academic progress and practice history.
4. **Review My Mistakes:** Saved incorrect questions.
5. **Assignments:** Tutor-assigned activities and independent practice.
6. **My Goals:** Current objectives and completed goals.

Integrate these sections without disrupting the existing public website navigation.

---

# 4. Central Progress Tracking Engine

This is the most important technical component of the project.

The system must capture academic performance consistently across all educational games.

Do not build separate tracking systems for individual games.

Build a centralized progress-tracking system that every existing and future educational game can use.

## 4.1 Question and skill identification

Every question should have a stable identifier.

Every question should also have one or more associated academic skill tags.

Examples:

| Question | Skill tags |
|---|---|
| Calculate a jump trajectory | Geometry, trigonometry |
| Convert suspension settings | Ratios, fractions |
| Calculate downhill speed | Speed, velocity |
| Determine force on a bike | Physics, Newton's laws |
| Calculate ramp angles | Geometry, algebra |

Create a centralized skill taxonomy.

Initial categories should include:

- Arithmetic.
- Fractions.
- Decimals.
- Ratios and proportions.
- Percentages.
- Pre-algebra.
- Algebra.
- Geometry.
- Trigonometry.
- Statistics.
- Physics.
- Speed and velocity.
- Forces and motion.
- Other topics as required by existing games.

Allow questions to have multiple skill tags.

Do not hardcode academic categories into individual game dashboards.

Skill tags must be reusable across different games.

## 4.2 Question attempt tracking

Whenever a student submits an answer, the game should communicate the result to the centralized progress engine.

Record every attempt, whether correct or incorrect.

Recommended attempt record:

```json
{
  "student_id": "student_123",
  "game_id": "jump_lab",
  "question_id": "jump_001",
  "skill_tags": [
    "geometry",
    "trigonometry"
  ],
  "question_snapshot": {},
  "student_answer": "24",
  "correct_answer": "26",
  "is_correct": false,
  "attempt_number": 1,
  "hints_used": 0,
  "time_to_answer_seconds": 18,
  "game_session_id": "session_456",
  "created_at": "2026-11-10T18:30:00Z"
}
```

Adapt field names to the existing database architecture.

The example is illustrative, not a requirement to use these exact identifiers.

### Required tracking fields

- Student ID.
- Game ID.
- Stable question ID.
- Associated skill IDs.
- Student's submitted answer.
- Correctness.
- Correct answer or validation reference.
- Attempt number.
- Hints used.
- Timestamp.
- Game session ID.
- Relevant question metadata.
- Time to answer, when reliably measurable.

For dynamically generated questions, save a snapshot of the question, its parameters, answer choices, correct answer, and explanation.

This is essential: tutors must be able to view the actual question the student answered, even if the game later generates a different version.

## 4.3 Immutable attempt history

Never overwrite an original incorrect attempt when a student retries.

Each attempt should become a separate historical event.

For example:

Question 1:
- Attempt 1: Incorrect.
- Attempt 2: Incorrect.
- Attempt 3: Correct.

The system must preserve all three attempts.

This makes it possible to identify students who immediately understand a concept after feedback versus those who continue struggling.

Use unique identifiers and appropriate error handling to avoid accidentally recording duplicate submissions.

## 4.4 Game integration interface

Create a reusable function, service, or API endpoint that all educational games can call.

Illustrative interface:

```javascript
recordQuestionAttempt({
  studentId,
  gameId,
  questionId,
  skillIds,
  questionSnapshot,
  studentAnswer,
  correctAnswer,
  isCorrect,
  attemptNumber,
  hintsUsed,
  timeToAnswer,
  gameSessionId
});
```

Implement this according to the existing technology stack.

Requirements:

- Must support all existing games.
- Must support future games without redesigning the tracking architecture.
- Must not block game functionality if progress tracking encounters a recoverable network problem.
- Must handle unauthenticated users according to existing game-access rules.
- Must not associate an attempt with the wrong student.
- Should support reliable retry behavior without duplicated attempts.

**Important:** Existing game functionality must remain intact.

If a student is not logged in and the existing website permits playing games without an account, preserve that experience. Explain that signing in allows progress to be saved. Do not silently remove anonymous access.

---

# 5. Incorrect Answer Review System

Create a dedicated Review My Mistakes section for every student.

This is one of the most important user-facing features.

## 5.1 Automatic review queue

Whenever an authenticated student answers a question incorrectly, automatically create or update the student's review record.

The review system should preserve the original question and related attempt history.

Avoid creating multiple identical active review records when a student repeatedly misses the same question.

One review record can reference multiple attempts.

However, separate questions testing the same skill should remain distinguishable.

## 5.2 Review item statuses

Each review item should support:

**Needs Review**
- The student has not yet demonstrated understanding.

**In Progress**
- The student has started reviewing the problem.

**Corrected**
- The student has successfully completed a subsequent review attempt.

**Mastered**
- The student has demonstrated consistent understanding across appropriately varied questions.

Status changes should preserve history.

Do not automatically classify a question as mastered after one correct retry.

Allow the tutor to review and adjust statuses where appropriate.

## 5.3 Review problem interface

The student should be able to:

1. Open a saved question.
2. Read the original problem.
3. See the relevant diagram or game context when available.
4. Attempt the question again.
5. Receive appropriate feedback.
6. View an explanation after attempting it.
7. See whether they have successfully corrected the mistake.

Allow students to practice similar questions, not just memorize the original answer.

Keep the original question accessible for reference.

## 5.4 Review filtering

Allow students and tutors to filter review items by:

- Game.
- Academic skill.
- Date.
- Status.
- Difficulty, if available.

Sort by priority and most recent activity.

## 5.5 Review prioritization

Initially, use straightforward rules.

Prioritize:

1. Questions answered incorrectly multiple times.
2. Problems involving skills with consistently low accuracy.
3. Questions the student has not revisited.
4. Recent incorrect answers.

Do not overcomplicate the first version with machine learning.

---

# 6. Student Dashboard

Build a student dashboard that makes progress understandable and encourages continued independent practice.

The interface should feel friendly, engaging, and connected to the existing Mathlete MTB visual identity.

Avoid making it feel like a conventional school gradebook.

## 6.1 Dashboard components

### Welcome area

Show the student's name and a personalized welcome message.

### Weekly statistics

Display:

- Challenges completed this week.
- Total questions attempted.
- First-attempt accuracy.
- Practice sessions completed.
- Problems waiting for review.
- Time spent practicing, when reliably tracked.

### Academic performance

Display a breakdown of academic skill performance.

Example:

| Skill | Recent accuracy | Status |
|---|---:|---|
| Geometry | 90% | Strong |
| Fractions | 65% | Improving |
| Algebra | 45% | Needs practice |
| Trigonometry | 55% | Needs practice |

Use simple progress bars, charts, and clear labels.

Do not imply that an accuracy percentage is equivalent to academic mastery.

Show sample sizes and indicate when there is insufficient data for a meaningful assessment.

### Recommended next steps

Display automatically generated recommendations such as:

- Review 3 saved algebra problems.
- Complete a Jump Lab challenge.
- Practice ratios and proportions.
- Finish an assignment from your tutor.

Recommendations should link directly to the appropriate activity.

### Recent activity

Show the student's latest practice sessions and challenges.

## 6.2 Student goals

Allow students and tutors to establish weekly learning goals.

Examples:

- Complete three independent practice sessions.
- Correct five previously missed questions.
- Improve understanding of fractions.
- Complete Jump Lab Level 3.

Allow the tutor to create and edit goals.

Students should be able to see progress toward each goal.

Avoid implementing a complicated gamification or progression-map system. Focus on clear, measurable learning objectives.

---

# 7. Tutor Dashboard

Create a separate tutor-facing dashboard.

This is a core feature, not an optional enhancement.

Tutors need to manage multiple students efficiently.

## 7.1 Tutor home screen

Display a list of assigned students.

For each student, show:

- Student name.
- Last active date.
- Practice activity this week.
- Number of problems attempted.
- Recent accuracy.
- Number of outstanding review items.
- Upcoming or recent tutoring sessions.

Allow tutors to quickly open each student's profile.

Include appropriate indicators for students who have not practiced recently or who have multiple unresolved review problems.

## 7.2 Individual student profile

Every student should have a detailed tutor-facing profile.

Organize it into the following tabs or sections:

**Overview**
- Weekly summary.
- Overall performance.
- Current learning goals.
- Recent activity.
- Important academic observations.
- Suggested session priorities.

**Practice History**
- Chronological activity.
- Game sessions.
- Questions attempted.
- Correct/incorrect answers.
- Hints used.
- Relevant timestamps.

**Review Problems**
- All saved incorrect problems.
- Original answers.
- Correct answers.
- Number of attempts.
- Associated academic skills.
- Review statuses.

**Academic Progress**
- Skill-level accuracy.
- First-attempt accuracy.
- Trends over time.
- Performance by game.
- Areas of strength and weakness.

**Assignments**
- Completed assignments.
- Outstanding assignments.
- Assigned games and questions.
- Assignment deadlines.

**Tutor Notes**
- Previous observations.
- Academic difficulties.
- Effective instructional approaches.
- Session notes.
- Important context for future lessons.

**Sessions**
- Previous tutoring sessions.
- Session summaries.
- Next session information when available.

## 7.3 Tutor review capabilities

Tutors must be able to:

- Open an incorrectly answered question.
- View every attempt.
- See the student's original answer.
- View the correct answer and explanation.
- Add an instructional note.
- Mark a problem as reviewed.
- Mark a problem corrected when the evidence supports it.
- Flag a problem for future attention.
- Assign additional practice.

Tutor actions should be recorded with timestamps and tutor IDs.

---

# 8. Automatic Tutor Session Preparation

This is a particularly important differentiating feature.

Before a tutoring session, Mathlete should generate a session preparation brief using the student's actual performance data.

The goal is to eliminate the time tutors spend manually reviewing previous work.

## 8.1 Session preparation report

Create an automatically generated summary containing:

**Activity since the previous session**
- Number of practice sessions.
- Questions attempted.
- First-attempt correct answers.
- Incorrect answers.
- Hints used.
- Assignments completed or outstanding.

**Areas needing attention**
- Academic skills with consistently low accuracy.
- Questions answered incorrectly multiple times.
- Recurring mistakes.
- Skills that have not been practiced recently.
- Incomplete tutor assignments.

**Suggested session priorities**
- Review selected incorrect problems.
- Explain an underlying academic concept.
- Work through new examples.
- Introduce a related challenge.
- Check retention of previously taught material.

## 8.2 Example session brief

Student: Noah

Session length: 45 minutes.

Performance since last session:
- 3 independent practice sessions.
- 12 questions attempted.
- 7 correct on the first attempt.
- 3 questions required hints.
- 2 recurring mistakes involving trigonometry.

Suggested session plan:

1. Review two incorrectly answered jump trajectory questions – 15 minutes.
2. Teach the underlying concepts involving sine and cosine – 15 minutes.
3. Complete three new jump trajectory challenges – 15 minutes.

Previous tutor observation:

"Noah understands the visual concept of jump angles but sometimes selects the wrong trigonometric function."

## 8.3 Implementation requirements

Start with deterministic logic and templates.

Do not make an AI integration a requirement for the first implementation.

The system should be able to generate a useful report directly from:

- Question attempt data.
- Skill-level statistics.
- Review queue.
- Tutor notes.
- Assignment history.
- Previous session information.

Allow tutors to edit the suggested session plan before using it.

Clearly distinguish system-generated suggestions from tutor-authored observations.

If AI assistance is added later, it must use the student's authorized data and clearly identify AI-generated recommendations.

---

# 9. Tutor Notes and Session Management

Tutors need a place to record what happens during individual sessions.

## 9.1 Session records

Allow tutors to create a tutoring session record for each meeting.

Fields:

- Student ID.
- Tutor ID.
- Date.
- Session duration.
- Concepts covered.
- Problems reviewed.
- Concepts understood.
- Concepts needing additional attention.
- Student engagement or reflection.
- Homework assigned.
- General notes.
- Recommended focus for the next session.

## 9.2 Tutor observations

Create a persistent instructional observations section.

Examples:

- Understands visual representations better than abstract equations.
- Struggles with translating word problems into mathematical expressions.
- Responds well to real-world examples involving riding.
- Demonstrates strong mental math but needs help showing work.
- Benefits from breaking complex problems into smaller steps.

These observations should be visible to the student's assigned tutors.

Allow tutors to edit and update observations.

Do not expose private tutor notes to student accounts or parent accounts unless specifically configured for a separate, student-visible or parent-visible note.

## 9.3 Session continuity

At the beginning of each session, the tutor should be able to see:

- What happened during the last session.
- What homework was assigned.
- Whether it was completed.
- What the student has practiced independently.
- What problems remain unresolved.
- What the tutor previously recommended.

This creates continuity between lessons.

---

# 10. Custom Tutor Assignments

Tutors should be able to give students work to complete independently between tutoring sessions.

## 10.1 Assignment creation

Create an assignment builder.

Tutors should be able to:

- Select a student.
- Give the assignment a title.
- Add instructions.
- Select one or more games.
- Select specific academic skills.
- Select specific saved review questions.
- Add due dates.
- Set a recommended duration.
- Add optional notes.

Initially, assignments can reference existing activities and questions.

Avoid building a complicated custom assessment builder unless existing functionality makes it easy.

## 10.2 Assignment experience

Students should have a dedicated Assignments page.

Each assignment should show:

- Title.
- Tutor instructions.
- Assigned activities.
- Due date.
- Completion status.
- Progress.

Statuses:

- Assigned.
- In Progress.
- Completed.
- Past Due.

Assignment completion should be calculated from actual activity data where possible.

## 10.3 Tutor-generated custom problems

Eventually, tutors should be able to save interesting questions into a shared or personal Problem Library.

The Problem Library should support:

- Saving existing game questions.
- Organizing questions by subject and skill.
- Adding instructional notes.
- Assigning selected questions to students.
- Reusing questions across students.

Prioritize building a reusable problem/question structure that supports this future functionality.

---

# 11. Student Reflection

Add a lightweight reflection feature.

After a game or assignment, give students the option to respond to a simple question.

Examples:

- What was the hardest part of this challenge?
- What did you learn?
- What would you like your tutor to explain?
- Did you understand how to solve the problem?

Support short text answers initially.

Make reflections optional.

Store the reflection alongside the relevant practice session or assignment and associate it with the student.

Tutors should be able to see reflections when reviewing a student's history.

Do not interrupt the gameplay experience with lengthy surveys.

---

# 12. Skill-Level Progress and Mastery Tracking

The platform needs a reliable way to measure academic improvement over time.

## 12.1 Performance metrics

Track the following independently:

**First-attempt accuracy**

Percentage of questions answered correctly on the first attempt.

**Eventual correctness**

Percentage of questions eventually answered correctly after retries.

**Question volume**

Number of unique questions attempted.

**Practice consistency**

Number of distinct practice sessions completed.

**Hint usage**

How frequently the student relies on hints.

**Skill-level performance**

Accuracy and progress across the academic skills associated with questions.

**Retention**

Whether the student can successfully answer similar questions in later sessions.

## 12.2 Skill performance calculations

Calculate skill performance using questions tagged with the corresponding skill.

A question associated with multiple skill tags can contribute to multiple relevant skill summaries, but it should not be counted twice within the same skill.

Display:

- Recent accuracy.
- Number of questions attempted.
- First-attempt accuracy.
- Previous-period comparison.
- Direction of improvement.

Use an appropriate time window, such as the previous 14 or 30 days.

Allow historical performance views.

Clearly label percentages as performance indicators, not standardized academic grades.

## 12.3 Mastery logic

Implement a transparent initial mastery system.

Suggested rules:

**Needs Practice**
- Repeated incorrect answers.
- Low accuracy across multiple attempts.
- Consistent difficulty with a skill.

**Developing**
- Some successful independent attempts.
- Improvement over recent sessions.
- Occasional need for hints or assistance.

**Strong**
- Consistently high first-attempt accuracy.
- Successful independent performance across multiple questions.

**Mastered**
- Demonstrated understanding across multiple distinct question variations.
- Successful performance across multiple practice sessions.
- No recent pattern of repeated errors.

Use configurable thresholds rather than hardcoding values throughout the application.

As an initial example, mastery might require at least five distinct questions across two or more sessions, with at least 80% first-attempt accuracy.

Treat this as a starting heuristic, not a scientifically validated measure of academic mastery.

If the student has insufficient attempts, show "Not enough data" instead of assigning a misleading status.

Tutors should be able to override a status with a recorded reason.

---

# 13. Personalized Practice Recommendations

Use collected student performance data to recommend appropriate activities.

Start with a rule-based recommendation engine.

Examples:

| Observed behavior | Recommendation |
|---|---|
| Repeated incorrect fraction answers | Recommend fraction practice |
| Correct algebra answers after hints | Recommend independent algebra questions |
| No recent geometry practice | Recommend geometry refresher |
| Repeated errors with one skill | Flag for tutor review |
| Consistently successful answers | Introduce more difficult challenges |
| Outstanding tutor assignment | Prioritize assigned work |

Recommendations should appear on the student dashboard.

Each recommendation should include:

- Reason for recommendation.
- Suggested activity.
- Relevant academic skill.
- Estimated time.
- Direct link to the activity.

Allow tutors to see the recommendations and optionally convert them into assignments.

Do not implement sophisticated AI-driven recommendations yet.

Build the underlying tracking and recommendation interfaces so AI can be added later.

---

# 14. Parent Progress Reporting

Implement this after the student and tutor experiences are functioning.

Parents should eventually receive simple, understandable progress summaries.

## 14.1 Weekly progress report

A report should include:

- Practice sessions completed.
- Questions attempted.
- Recent academic improvements.
- Skills being developed.
- Assignments completed.
- Areas currently being addressed.
- Upcoming learning objectives.
- Relevant tutor observations approved for parent visibility.

Example:

"Over the past week, Noah completed four independent practice sessions and attempted 28 math challenges. He showed improvement in jump geometry and is continuing to work on fractions and ratios. During our next sessions, we'll focus on applying these concepts to suspension calculations."

## 14.2 Reporting delivery

Initially, prioritize generating a report that tutors can review, edit, and share with parents.

Automated email delivery and parent accounts can be added later.

Do not automatically send private tutor notes.

---

# 15. Database and Data Architecture

Inspect the existing schema before designing new tables.

Extend existing entities and relationships wherever appropriate.

The following is a conceptual data model, not a requirement to create tables with these exact names.

## 15.1 Suggested entities

### Profiles / Users

Contains:
- User ID.
- Name.
- Email.
- Role.
- Account information.

### Student Tutor Relationships

Contains:
- Student ID.
- Tutor ID.
- Assignment status.
- Relationship creation date.

Must support multiple students per tutor and potentially multiple tutors per student.

### Skills

Contains:
- Skill ID.
- Skill name.
- Parent category, if applicable.
- Description.

### Questions

Contains:
- Question ID.
- Game ID.
- Question content.
- Question type.
- Difficulty.
- Correct answer or validation reference.
- Explanation.
- Associated metadata.

Support dynamically generated questions through stable question templates and stored question snapshots.

### Question Skill Relationships

Supports many-to-many relationships between questions and skills.

### Game Sessions

Contains:
- Session ID.
- Student ID.
- Game ID.
- Start time.
- End time.
- Completion status.
- Relevant session metrics.

### Question Attempts

Contains:
- Attempt ID.
- Student ID.
- Question ID or template ID.
- Game session ID.
- Answer submitted.
- Correctness.
- Attempt number.
- Hints used.
- Timestamp.
- Question snapshot.

Preserve historical records.

### Review Items

Contains:
- Review ID.
- Student ID.
- Question reference.
- Current status.
- First incorrect attempt.
- Latest attempt.
- Related attempt history.
- Tutor flags.
- Review metadata.

### Student Goals

Contains:
- Goal ID.
- Student ID.
- Created by.
- Description.
- Target.
- Due date.
- Progress.
- Completion status.

### Assignments

Contains:
- Assignment ID.
- Tutor ID.
- Student ID.
- Title.
- Instructions.
- Due date.
- Status.
- Assigned activities.

### Tutor Notes

Contains:
- Note ID.
- Tutor ID.
- Student ID.
- Related session if applicable.
- Note content.
- Visibility.
- Created and updated timestamps.

### Tutoring Sessions

Contains:
- Session ID.
- Tutor ID.
- Student ID.
- Date.
- Duration.
- Concepts covered.
- Session summary.
- Follow-up recommendations.

### Student Reflections

Contains:
- Reflection ID.
- Student ID.
- Related game session or assignment.
- Reflection content.
- Timestamp.

### Parent Relationships

For the future parent portal:

- Parent user ID.
- Student ID.
- Consent/authorization status.
- Relationship metadata.

## 15.2 Database considerations

- Use proper primary and foreign keys.
- Add indexes for student ID, question ID, game ID, and timestamps.
- Use appropriate uniqueness constraints.
- Preserve historical records.
- Implement safe database migrations.
- Ensure student data cannot leak between accounts.
- Use database-level access controls where supported.
- Avoid unnecessary duplication of calculated statistics.
- Make aggregation efficient as the number of students grows.

Do not blindly implement this schema if the existing database already has equivalent entities.

---

# 16. User Interface and Design Requirements

The existing Mathlete MTB brand and design language should be preserved.

The new features should feel native to the website.

## Design principles

1. Keep the visual personality of Mathlete MTB.
2. Preserve the existing mountain biking-inspired identity.
3. Make the student interface engaging without making it childish.
4. Make tutor interfaces efficient and information-rich.
5. Favor simple visualizations over dense tables whenever appropriate.
6. Ensure the website works on desktop, tablet, and mobile.
7. Keep navigation intuitive.
8. Avoid unnecessary animations and visual clutter.
9. Provide clear loading, empty, and error states.
10. Ensure accessible contrast, keyboard navigation, and readable typography.

## Student experience

Prioritize:

- Clear next steps.
- Engaging game access.
- Easy review of previous mistakes.
- Visual progress indicators.
- Positive reinforcement.
- Minimal administrative friction.

## Tutor experience

Prioritize:

- Fast access to student information.
- Easy identification of learning gaps.
- Detailed question review.
- Session preparation.
- Efficient note-taking.
- Assignment creation.

The tutor dashboard should feel like a practical professional tool.

Do not create a separate, disconnected website for tutors unless the existing architecture requires separate routing or role-based layouts.

---

# 17. Technical and Functional Requirements

## 17.1 General

- All student progress must persist across sessions.
- Data should refresh appropriately after new attempts.
- Use server-side authorization for all private operations.
- Handle failed database writes gracefully.
- Provide useful error messages.
- Prevent duplicate attempt submissions.
- Support responsive layouts.
- Follow existing application conventions.
- Use reusable components.
- Maintain clean separation between game logic and progress tracking.

## 17.2 Performance

- Avoid fetching every historical attempt when displaying a dashboard.
- Use efficient database queries and aggregated statistics.
- Paginate large practice histories.
- Avoid unnecessarily re-rendering existing games.
- Cache or precompute suitable summaries where helpful.
- Ensure tracking does not noticeably slow down gameplay.

## 17.3 Data integrity

- Each attempt must belong to exactly one student.
- Each review item must reference the correct question and attempt history.
- Each assignment must belong to an authorized tutor-student relationship.
- Each private tutor note must have an appropriate visibility setting.
- Deleting or deactivating an account must not accidentally expose or orphan sensitive student records.

## 17.4 Analytics correctness

Avoid misleading statistics.

For example:
- Do not count multiple retries as multiple unique questions.
- Do not count a question as mastered because of one correct answer.
- Do not calculate practice time from unreliable page-open timestamps.
- Distinguish first-attempt accuracy from eventual correctness.
- Indicate when there is insufficient data.
- Ensure reporting periods are calculated using a consistent timezone.

---

# 18. Development Roadmap

Implement the project in phases.

Complete and test each phase before introducing unnecessary complexity.

## Phase 0: Existing Application Audit

Tasks:

1. Inspect all existing source code and project documentation.
2. Identify the application's framework and architecture.
3. Inspect database tables, authentication, and authorization.
4. Identify every existing educational game.
5. Identify how each game handles question generation and evaluation.
6. Review the existing visual system and reusable components.
7. Identify what functionality can be reused.
8. Document potential integration risks.

Deliverable:

A short technical assessment and implementation plan.

## Phase 1: Accounts and Tracking Infrastructure

Priority: Critical.

Implement:

- Persistent student accounts.
- Role-based access.
- Student-tutor relationships.
- Centralized skill taxonomy.
- Stable question identifiers.
- Question attempt tracking.
- Game session tracking.
- Reusable game integration service.
- Database migrations.
- Secure backend access controls.

Integrate one existing game as a proof of concept.

Verify that an authenticated student's attempts are saved and associated with the correct account.

Then extend the integration to all remaining games.

## Phase 2: Student Experience

Implement:

- Student dashboard.
- Weekly statistics.
- Academic skill performance.
- Practice history.
- Review My Mistakes page.
- Saved question review.
- Student goals.
- Basic practice recommendations.

Verify that all data persists after logging out and logging back in.

## Phase 3: Tutor Dashboard

Implement:

- Tutor accounts.
- Assigned student list.
- Individual student profiles.
- Practice history.
- Review problem management.
- Skill-level performance analytics.
- Tutor notes.
- Tutoring session records.

Verify strict tutor-student permissions.

## Phase 4: Tutoring Workflow

Implement:

- Automatic session briefs.
- Suggested session agendas.
- Tutor-editable lesson plans.
- Assignment builder.
- Student assignment interface.
- Assignment completion tracking.
- Student reflection functionality.

## Phase 5: Enhanced Reporting and Intelligence

Implement:

- Improved mastery tracking.
- More advanced recommendations.
- Weekly progress reports.
- Parent-facing reporting.
- Optional parent account functionality.
- Future AI-assisted learning insights.

Do not allow Phase 5 work to delay the delivery of the core tracking and tutoring system.

---

# 19. Acceptance Criteria and Testing

The implementation is not complete until the following workflows work end to end.

## Student account tests

- A student can register.
- A student can log in and log out.
- A student can access their own dashboard.
- Student data persists across devices and sessions.
- One student cannot view another student's records.

## Game tracking tests

- An incorrect answer is recorded.
- A correct answer is recorded.
- Multiple attempts are preserved.
- The original question can be retrieved.
- The correct academic skill tags are associated with the attempt.
- Attempt records are associated with the correct student.
- Tracking errors do not break the underlying game.
- Anonymous gameplay, if supported by the existing website, remains functional.

## Review system tests

- Incorrect answers automatically appear in the review queue.
- Repeated attempts are associated with the same relevant review item.
- Original attempts remain preserved.
- Students can reopen and retry saved questions.
- Review statuses update appropriately.
- Tutors can review and flag problems.

## Student dashboard tests

- Weekly statistics calculate correctly.
- First-attempt accuracy is accurate.
- Question counts distinguish unique questions from attempts.
- Skill performance updates after new practice.
- Recommended activities link to the correct games.
- Insufficient data is clearly indicated.

## Tutor dashboard tests

- Tutors can see only assigned students.
- Tutors can open detailed student profiles.
- Tutors can review individual question attempts.
- Tutors can view academic performance.
- Tutors can create and edit notes.
- Tutors can document tutoring sessions.
- Tutors can assign practice activities.

## Tutoring workflow tests

- A session brief is generated from actual student activity.
- Previous session notes are accessible.
- New practice data appears in subsequent session reports.
- Tutors can edit suggested lesson plans.
- Students can see assigned activities.
- Assignment completion is recorded.
- Student reflections are visible to authorized tutors.

## Security tests

- Students cannot access another student's data by manipulating IDs or API requests.
- Tutors cannot access students who are not assigned to them.
- Parent access is restricted to authorized children.
- Private tutor notes are not accidentally exposed.
- Unauthorized users cannot modify attempts, assignments, or progress statistics.

## Regression tests

All existing Mathlete MTB educational games must continue working as before.

The website's existing public pages, game experiences, navigation, responsive behavior, and design should not regress.

---

# 20. Implementation Instructions for Claude

Follow these instructions throughout development.

### A. Inspect before modifying

Do not begin by generating a new application.

Understand the existing codebase first.

Do not assume a particular framework, database, authentication provider, or component library.

### B. Prioritize reusable architecture

Create shared services and reusable components.

The progress tracking system should be independent of any individual game.

Future educational games should be able to integrate with it using a consistent interface.

### C. Avoid unnecessary dependencies

Reuse existing packages and infrastructure.

Only introduce new dependencies when they provide meaningful value.

Avoid unnecessary external AI services or paid APIs for the first implementation.

### D. Protect existing functionality

Do not casually modify existing games to accommodate new dashboards.

Make the smallest changes necessary to capture and persist question performance.

Test existing experiences after each integration.

### E. Build in logical increments

Complete database and tracking infrastructure first.

Then build student functionality.

Then build tutor functionality.

Then build more advanced recommendations and reporting.

Keep the application functional at every stage.

### F. Do not use fake production data

Mock data may be used during UI development.

However, all final features must use actual authenticated student data.

Do not ship dashboards that merely display hardcoded performance statistics.

### G. Document the implementation

Create or update appropriate project documentation describing:

- New database entities.
- Database migrations.
- Authentication and permissions.
- Question attempt tracking interface.
- How new games integrate with the tracking system.
- How to add or modify academic skill tags.
- How tutoring assignments work.
- How mastery and performance calculations work.

### H. Maintain development quality

- Use clear naming conventions.
- Handle edge cases.
- Add appropriate error handling.
- Write tests for core data operations.
- Avoid unnecessary code duplication.
- Maintain existing application conventions.
- Verify responsive behavior.

---

# 21. Definition of Success

The feature expansion is successful when the following experience is possible:

A student creates a Mathlete MTB account.

They log in throughout the week and play multiple educational games.

Every question they answer is automatically recorded.

When they answer a question incorrectly, it is saved in their personal review queue.

They can revisit those questions, practice similar problems, and see their progress.

Their academic performance is organized by skill, allowing them to identify their strengths and weaknesses.

Their tutor can log in, select the student, and immediately understand what they have been working on.

Before a one-on-one session, the tutor sees a personalized report explaining which problems the student struggled with, which concepts have improved, and what should be prioritized.

The tutor can then review the exact problems, teach the necessary concepts, document the session, and assign targeted practice.

The student continues practicing between lessons, and the entire cycle repeats.

Eventually, parents can see tangible evidence of their child's progress.

**The ultimate goal is to make every independent practice session more valuable and every tutoring session more personalized.**

Mathlete MTB should know what a student has been learning, where they are struggling, what they are improving at, and what they should work on next.

That is the foundation of a genuinely personalized educational experience.