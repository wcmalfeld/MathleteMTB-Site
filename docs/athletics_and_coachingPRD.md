# Mathlete Product Architecture Amendment
## Separation of Academics and MTB Coaching

**Applies to:** Existing Mathlete MTB website and the Student Practice & Tutor Coaching PRD.

**Purpose:** Establish Academics and MTB Coaching as two independent product modules within the same Mathlete platform.

This amendment supersedes any conflicting instructions in the previous PRD concerning the organization, navigation, data models, or functionality of academic learning and MTB coaching.

---

# 1. Updated Product Vision

Mathlete consists of two distinct but complementary products.

## Product A: Mathlete Academics

Purpose: Help students become more confident learners and independent problem solvers through mathematics, physics, interactive learning tools, practice, and academic tutoring.

Core features:
- Courses and curriculum.
- Academic topic browser.
- Problem bank.
- Standard academic practice.
- MTB-themed educational games and simulations.
- Learning labs.
- Student academic progress.
- Saved academic problems.
- Academic tutoring.
- Tutor dashboards.
- Academic assignments and recommendations.

The MTB theme remains an important educational mechanism within this product.

For example, students might learn algebra through suspension calculations, geometry through trail design, or quadratic functions through simplified jump trajectories.

These are academic learning experiences, not MTB coaching features.

## Product B: Mathlete MTB Coaching

Purpose: Help young mountain bikers develop their riding abilities, establish meaningful goals, track athletic progression, and receive ongoing coaching and mentorship.

Core features:
- Rider profiles.
- Goal setting.
- Riding skill progression.
- Practice and training plans.
- Ride logs.
- Video uploads and coach feedback.
- Athlete reflections and check-ins.
- Coach assignments.
- Scheduled MTB coaching sessions.
- Coach notes and recommendations.

The MTB Coaching product should be centered on athlete development and personal growth, not schoolwork.

---

# 2. Application Navigation and Organization

Create two distinct primary destinations within the Mathlete website.

Recommended navigation:

MATHLETE
- Academics
- MTB Coaching
- Account / Profile

The landing experience should clearly introduce both products.

Students should be able to enter either section independently.

Do not require a student to complete academic onboarding before using MTB Coaching.

Do not require a student to establish an athlete profile before using Academics.

A student may use:
- Academics only.
- MTB Coaching only.
- Both products.

The two experiences should have distinct dashboards, navigation, terminology, and workflows.

Do not combine academic progress and athletic progress into one score or progress dashboard.

Maintain a consistent Mathlete brand and visual identity throughout the site.

## 2.1 Academics Navigation

Suggested structure:

- Academic Dashboard
- My Classes
- Practice
- Learning Labs
- Tutor Review
- Academic Progress

All functionality from the original Student Practice & Tutor Coaching PRD relating to academic instruction remains within this section.

## 2.2 MTB Coaching Navigation

Suggested structure:

- Coaching Dashboard
- My Riding Profile
- My Goals
- My Progression
- My Training
- My Coach

The MTB Coaching section must have its own student experience and coach dashboard.

---

# 3. Strict Product Separation

This is a fundamental architectural requirement.

Academics and MTB Coaching share user authentication, but they must maintain distinct domain-specific records.

## Shared infrastructure

Both products may use:
- Existing user accounts.
- Authentication.
- Student identity.
- Account settings.
- Notification services.
- Subscription infrastructure.
- File storage infrastructure.
- Common design components.
- Parent/guardian authorization infrastructure.

## Separate academic records

Academics owns:
- Courses.
- Curriculum units.
- Academic topics.
- Academic skills.
- Academic problem templates.
- Problem attempts.
- Academic practice sessions.
- Academic skill progress.
- Academic tutor assignments.
- Academic review queues.
- Academic tutoring sessions.
- Academic tutor notes.

## Separate MTB coaching records

MTB Coaching owns:
- Athlete profiles.
- Riding disciplines.
- Riding interests.
- Athlete goals.
- Goal milestones.
- MTB skills.
- Riding progression.
- Training assignments.
- Ride logs.
- Riding video uploads.
- Athlete reflections.
- MTB coach assignments.
- MTB coaching sessions.
- MTB coach notes.

Never reuse the academic skill mastery model to represent riding progression.

Never store academic tutoring notes as MTB coaching notes or vice versa.

Never automatically translate an athlete's riding performance into academic performance.

Never combine the two products into a single overall performance score.

A student may use the same Mathlete account in both sections, but their progress records remain separate.

---

# 4. Academics Module

The existing Student Practice & Tutor Coaching PRD remains the authoritative specification for this module.

Preserve its requirements for:
- Curriculum browsing.
- Problem bank.
- Guided learning.
- Practice engine.
- Saved problems.
- Mistake analysis.
- Tutor review queue.
- Academic tutor scheduling.
- Tutoring session workspace.
- Academic progress tracking.
- MTB-themed educational learning labs.

Remove from the Academics implementation any features intended primarily for:
- Athlete goal setting.
- Riding development.
- Mountain bike training plans.
- Riding session logs.
- Athlete progression records.
- MTB coach communication.
- Athletic performance tracking.

Those features belong in MTB Coaching.

The academic platform should work independently of the MTB Coaching module.

---

# 5. MTB Coaching Module

Build MTB Coaching as an independent module with its own database models, student interface, and coach experience.

## 5.1 Athlete Profile

Create an athlete profile containing:

- Riding disciplines.
- Experience level.
- Favorite types of riding.
- Riding interests.
- Self-identified strengths.
- Areas of development.
- Personal riding aspirations.
- Relevant upcoming riding events.

Allow the athlete to update their profile over time.

Keep onboarding lightweight. Do not require students to complete a lengthy assessment before using the platform.

## 5.2 Goal-Setting System

Goal setting should be a central feature.

Support different goal types:

- Long-term riding aspirations.
- Quarterly goals.
- Monthly milestones.
- Weekly practice objectives.
- Individual session objectives.

Each goal should support:

- Goal title.
- Description.
- Goal category.
- Reason or personal motivation.
- Current ability or starting point.
- Desired outcome.
- Target date.
- Milestones.
- Next actions.
- Progress status.
- Athlete reflections.
- Coach feedback.

Example:

Long-term aspiration:
Become a confident freeride athlete.

Quarterly goal:
Learn to consistently land 360s.

Monthly milestone:
Develop controlled rotation and landing technique on an appropriate smaller feature.

Weekly objective:
Complete two focused practice sessions with the coach-approved progression.

Session objective:
Practice the assigned drills and record observations.

Allow athletes to create goals independently.

Allow coaches to help establish realistic goals, adjust milestones, and assign supporting activities.

Do not make the goal system unnecessarily rigid.

Students should retain ownership of their aspirations.

## 5.3 Riding Skill Library

Create a structured, extensible MTB skill library.

Initial categories:

**Jumping**
- Approach and speed control.
- Takeoff technique.
- Body positioning.
- Air awareness.
- Landing technique.
- Whips and tables.
- Spins and rotations.

**Cornering**
- Body positioning.
- Vision and line selection.
- Braking.
- Tire loading.
- Berm technique.
- Flat turns.

**Technical Riding**
- Line selection.
- Rock gardens.
- Drops.
- Steep terrain.
- Technical climbing.

**General Riding**
- Bike handling.
- Balance.
- Braking control.
- Terrain awareness.
- Riding confidence.

Each skill should support:
- Name.
- Description.
- Skill category.
- Coaching instructions.
- Prerequisites where appropriate.
- Progression suggestions.
- Video examples.
- Assigned practice activities.
- Coach observations.
- Athlete reflections.

Do not assume every rider follows the same progression sequence.

Coaches should be able to override suggested progressions.

## 5.4 Riding Progression Tracking

Students should be able to identify the skills they are currently developing.

Support statuses such as:
- Interested.
- Working On It.
- Developing.
- Consistent.
- Demonstrated.
- Revisiting.

Allow students to:
- Add skills to their development list.
- Connect skills to personal goals.
- Record practice attempts.
- Upload riding videos.
- Document breakthroughs.
- Reflect on challenges.
- Receive coach feedback.

A skill should not automatically become demonstrated just because a student marks an activity complete.

Coach-confirmed progress should be distinguishable from self-reported progress.

## 5.5 Training and Practice Plans

Build a lightweight training planner.

Students should be able to see:
- Upcoming practice objectives.
- Coach-assigned activities.
- Weekly goals.
- Upcoming coaching sessions.
- Completed activities.

Coaches should be able to assign a practice activity and connect it to a specific riding goal or skill.

Students should be able to record:
- What they practiced.
- Which skills they focused on.
- What went well.
- What was difficult.
- What they want to work on next.

Do not attempt to build a complete GPS, heart-rate, or endurance-training platform in the initial release.

Prioritize intentional skill development and coaching feedback.

## 5.6 Ride Logs and Reflections

Create a simple ride/session log.

Each entry can include:
- Date.
- Location.
- Riding type.
- Skills practiced.
- Personal observations.
- Accomplishments.
- Challenges.
- Photos or video attachments.
- Next practice objective.

Add a short reflection prompt:

"What was one thing you improved today?"

"What challenged you?"

"What would you like to try next time?"

Avoid excessive journaling requirements.

## 5.7 Video-Based Coaching

Support optional riding video uploads.

Students should be able to:
- Upload a clip.
- Associate it with a riding skill or goal.
- Add a question or note for their coach.

Coaches should be able to:
- View submitted clips.
- Leave written feedback.
- Connect feedback to a specific skill.
- Recommend the next practice progression.
- Save the feedback to the athlete's coaching history.

If technical annotations or video markup are not supported in the initial release, build a basic feedback workflow first.

All video sharing must follow appropriate permissions and safeguards for minors.

## 5.8 Athlete Reflections and Development

Allow athletes to reflect on broader athletic development.

Potential areas:
- Confidence.
- Consistency.
- Persistence.
- Sportsmanship.
- Teamwork.
- Communication.
- Managing challenges.

These are personal development and athletic coaching topics.

Academic assignments and academic performance must remain in the Academics product.

---

# 6. MTB Coach Portal

Create a separate coach-facing experience.

The coach dashboard should display:

- Assigned athletes.
- Upcoming MTB coaching sessions.
- Athlete goals requiring review.
- Recently submitted riding videos.
- Pending athlete check-ins.
- Recent progression updates.

## Athlete Record

Each athlete record should include:

**Profile**
- Riding disciplines.
- Experience.
- Interests.
- Strengths.
- Development areas.

**Goals**
- Active goals.
- Milestones.
- Target dates.
- Progress.
- Athlete reflections.
- Coach feedback.

**Progression**
- Skills being developed.
- Practice history.
- Demonstrated skills.
- Riding video submissions.

**Training**
- Assigned activities.
- Weekly objectives.
- Ride logs.
- Completed practice activities.

**Coaching History**
- Past sessions.
- Coach notes.
- Athlete reflections.
- Recommendations.
- Future objectives.

## Coaching Session Workspace

Create an MTB-specific session workflow.

Before the session:
- Review athlete goals.
- Review submitted videos.
- View recent practice activities.
- Select session objectives.

During or after the session:
- Record coaching observations.
- Review goals.
- Update progression statuses.
- Assign practice activities.
- Create new milestones.
- Record next steps.

Keep this workflow independent of academic tutoring sessions.

---

# 7. Scheduling Architecture

The platform may reuse the same underlying booking integration, but all sessions must be explicitly typed.

Required session types:

- Academic Tutoring.
- MTB Coaching.

Each session must reference the correct type of participants, agenda, notes, and domain-specific records.

Academic tutoring sessions can contain:
- Academic problems.
- Courses.
- Skills.
- Tutor notes.

MTB coaching sessions can contain:
- Athlete goals.
- Riding skills.
- Video reviews.
- Training activities.
- Coach notes.

Do not display an academic review queue in an MTB coaching session.

Do not display riding progression records in an academic tutoring session.

---

# 8. Database and Module Boundaries

First inspect the existing database and preserve compatible models.

The following is a logical model for the MTB Coaching domain.

## Athlete Management
- athlete_profiles
- athlete_disciplines
- athlete_preferences

## Goal Setting
- athlete_goals
- goal_milestones
- goal_actions
- goal_reflections

## Riding Progression
- mtb_skill_categories
- mtb_skills
- mtb_skill_prerequisites
- athlete_skill_states
- athlete_skill_attempts

## Training and Riding
- training_activities
- athlete_training_assignments
- athlete_training_completions
- ride_logs
- ride_log_skills

## Coaching
- coach_athlete_assignments
- mtb_coaching_sessions
- mtb_session_goals
- mtb_session_notes
- mtb_coach_feedback
- athlete_check_ins

## Media
- riding_video_submissions
- riding_video_feedback
- athlete_media_attachments

Keep these records separate from the academic database models.

Use clear domain namespaces, database permissions, and application service boundaries.

The application may share common UI components and infrastructure, but each module must own its business logic and records.

---

# 9. User Permissions and Safeguards

Support separate academic and MTB coaching assignments.

A person may be:
- A student.
- An athlete.
- An academic tutor.
- An MTB coach.
- Both a tutor and an MTB coach.

Do not assume access to one module grants access to the other.

A tutor assigned to a student in Academics should not automatically gain access to the student's MTB Coaching records.

An MTB coach should not automatically gain access to academic attempts, grades, or tutor notes.

Implement explicit assignments and role-based permissions for each module.

For minors:
- Use appropriate guardian permissions.
- Restrict video access.
- Protect private communications.
- Establish appropriate messaging safeguards.
- Minimize personal data collection.
- Maintain appropriate retention and deletion procedures.

---

# 10. Updated Implementation Roadmap

Do not build both products as one combined implementation.

Preserve their independence and develop them as separate feature streams.

## Phase 0: Architecture Audit

- Inspect the existing site.
- Map existing academic features.
- Map existing MTB coaching features.
- Identify overlapping infrastructure.
- Identify features currently mixed together.
- Determine which database models need separation.
- Produce a migration plan.
- Preserve existing user data and functionality.

## Phase 1: Product Separation

- Create the two primary navigation destinations.
- Separate Academics and MTB Coaching dashboards.
- Establish clear application routes.
- Separate domain services and data permissions.
- Preserve the existing visual identity.
- Verify users can access either module independently.

## Phase 2: Academics

Implement the original Student Practice & Tutor Coaching PRD.

Prioritize:
- Curriculum browser.
- Practice engine.
- Problem bank.
- Saved problems.
- Academic tutor review.
- Tutor sessions.
- MTB-themed educational labs.

## Phase 3: MTB Coaching

Implement the independent coaching system.

Prioritize:
- Athlete profiles.
- Goal setting.
- Goal milestones.
- Riding skill library.
- Progression tracking.
- Ride logs.
- Coach dashboard.
- Coaching session workflow.

## Phase 4: Expanded Coaching

Introduce:
- Video-based coaching.
- Athlete reflections.
- Regular check-ins.
- Custom practice assignments.
- More sophisticated goal progression.
- Additional coaching resources.

---

# 11. Acceptance Criteria

The separation is complete when:

- Academics and MTB Coaching have separate primary destinations.
- Students can use either module independently.
- Academic records remain isolated from riding records.
- Academic tutoring has its own workflow.
- MTB coaching has its own workflow.
- Academic tutors cannot automatically access MTB coaching information.
- MTB coaches cannot automatically access academic records.
- Both modules use the same Mathlete account.
- The existing MTB learning labs remain part of Academics.
- Athlete goals and riding progression exist only within MTB Coaching.
- Shared infrastructure does not create shared domain-specific business logic.

The ultimate objective is to build two valuable products under one brand.

**Academics helps students develop their minds and problem-solving abilities. MTB Coaching helps them develop as riders, athletes, and individuals.**

Both products should encourage curiosity, deliberate practice, confidence, self-reflection, and personal growth without confusing their respective goals.