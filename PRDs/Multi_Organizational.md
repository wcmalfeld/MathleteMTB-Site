# MATHLETE: Multi-Organization Platform
## Master Architecture and Implementation PRDs

**Product:** Mathlete  
**Project:** Institutional Licensing and Organization Management  
**Primary Customer:** Schools, specialist sports academies, and educational organizations  
**First Pilot Organization:** World Class Academy  
**Implementation:** Claude Code  
**Document Type:** Master implementation specification  
**Status:** Ready for repository audit

---

# MASTER PRODUCT VISION

## 1. Overview

Transform Mathlete from a standalone educational website into a multi-organization subscription software platform.

Mathlete will provide one centralized educational software platform that multiple schools and organizations can license.

Each organization should receive its own private workspace with:
- Organization administrator accounts.
- Instructor and tutor accounts.
- Student accounts.
- Student enrollment management.
- Access to licensed learning resources.
- Organization-specific customization.
- Class and group management.
- Student progress visibility.
- Subscription and licensing management.

The underlying Mathlete application, educational content, and learning infrastructure will be shared across organizations.

Organizations should configure their own experience without receiving separate copies of the application.

## 2. Core Business Model

Mathlete owns and operates the platform.

Organizations purchase licenses that grant access to defined Mathlete products and learning resources.

The organization controls its own users and learning environment within the permissions of its subscription.

Mathlete controls:
- Platform-wide content.
- Available products and features.
- Subscription plans.
- Organizational licensing.
- Platform administration.
- Global product development.

Organizations control:
- Their members.
- Their instructors.
- Their student enrollment.
- Their classes and cohorts.
- Available resources within their licensed plan.
- Their learning environment configuration.
- Their organization-specific settings.

Students and instructors access Mathlete through individual accounts.

Do not use shared school-wide usernames or passwords.

## 3. Product Scope

This project primarily concerns the institutional licensing of Mathlete Academics.

Mathlete has two separate product domains:

1. Academics.
2. MTB Coaching.

They may share account infrastructure and organization licensing infrastructure, but their domain-specific records and business logic must remain separate.

An organization may license Academics independently of MTB Coaching.

Do not automatically grant access to MTB Coaching because an organization licenses Academics.

Do not combine academic progress, tutor notes, athlete profiles, and riding progression records.

Keep the licensing architecture extensible so additional Mathlete products can be included in future subscription plans.

## 4. Architecture Principles

The entire implementation must follow these principles.

### A. One platform, multiple organizations

Do not create independent installations of Mathlete for each school.

Use a shared application with isolated organization data.

### B. Individual user identities

Each person has one account identity.

An individual may belong to more than one organization, with separate membership roles and permissions in each.

### C. Organization-level data isolation

One organization must never access another organization's private student records, instructor records, assignments, or administrative information without explicit authorization.

### D. Shared educational content

Learning labs, problem banks, curriculum resources, and application components should be reusable across organizations.

An organization enables access to resources rather than receiving a copied version of them.

### E. Configurable organizational experiences

Organizations may customize approved settings, resources, courses, and presentation options without changing the underlying Mathlete software.

### F. Subscription-controlled access

Organization access must be governed by a valid license, available student seats, enabled resources, and user permissions.

Never rely exclusively on hiding frontend links to protect paid features.

Authorization must be enforced on the server and, where appropriate, at the database level.

### G. Incremental implementation

Build the platform in the specific PRDs below.

Do not implement everything in one large development pass.

Preserve existing functionality and database records.

---

# PRD 0 — EXISTING APPLICATION AUDIT AND ARCHITECTURE PLAN

**Priority:** P0  
**Dependencies:** None  
**Implementation type:** Inspection and planning only

## Objective

Understand the current Mathlete application and create a technically grounded implementation plan for converting it into a multi-organization subscription platform.

Do not change application functionality during this phase.

## Required Inspection

Inspect:

1. Application framework and structure.
2. Current routing and navigation.
3. Authentication and user management.
4. Database architecture.
5. Existing student and instructor records.
6. Existing learning labs and academic resources.
7. Existing saved-problem and progress-tracking systems.
8. Existing tutor functionality.
9. Existing file storage and upload mechanisms.
10. Existing subscription, payment, or billing integrations, if any.
11. Existing deployment and environment configuration.
12. Existing security and access-control implementation.

## Architecture Assessment

Identify:
- Which components can be reused.
- Which database models should be extended.
- Which current models need organization ownership.
- Which features currently assume all users belong to one global Mathlete environment.
- Where access-control vulnerabilities could occur.
- Whether the current authentication system supports multiple organization memberships.
- How existing student learning history should be migrated and associated with organizations.

## Required Deliverables

Return a report containing:

1. Current application architecture.
2. Existing data model.
3. Current authentication and permission model.
4. Existing reusable functionality.
5. Missing functionality.
6. Proposed multi-tenant architecture.
7. Proposed database changes.
8. Proposed authorization approach.
9. Data migration and backward compatibility plan.
10. Recommended implementation order for PRDs 1–5.
11. Technical risks and recommendations.

## Critical Requirements

Do not assume a technology stack that is not present.

Do not introduce a new backend or database simply because it appears convenient.

Do not replace existing authentication.

Do not delete or overwrite existing student records.

Do not begin implementing the remaining PRDs automatically.

Present the audit and implementation plan for review before proceeding.

---

# PRD 1 — MULTI-ORGANIZATION FOUNDATION

**Priority:** P0  
**Dependencies:** PRD 0  
**Objective:** Establish the underlying architecture that allows multiple educational organizations to use Mathlete independently.

## 1.1 Organization Entity

Introduce an organization model.

Each organization represents an institution purchasing access to Mathlete.

Required fields:

- Organization ID.
- Organization name.
- Organization slug.
- Organization type.
- Status.
- Logo reference.
- Created date.
- Updated date.
- Primary contact reference, where applicable.

Organization types should initially support:

- School.
- Sports Academy.
- Tutoring Organization.
- Educational Organization.
- Other.

Organization statuses:

- Pending.
- Active.
- Suspended.
- Archived.

An organization slug should be unique and suitable for organization-specific URLs.

Example:

World Class Academy might have the organization slug:

`world-class-academy`

Support a future organization-specific route structure without requiring individual deployments.

Do not assume that every organization needs its own domain or subdomain.

## 1.2 Organization Membership

Create a reusable model connecting individual Mathlete accounts to organizations.

A user must not be permanently tied to only one organization.

A user may belong to multiple organizations.

Each membership must contain:

- Membership ID.
- Organization ID.
- User ID.
- Organization-specific role.
- Membership status.
- Date joined.
- Date updated.

Enforce a unique user/organization membership relationship.

Membership statuses:

- Invited.
- Active.
- Suspended.
- Removed.

The same user may be:
- An instructor at Organization A.
- A student at Organization B.
- An administrator at Organization C.

Roles and access must be evaluated within the selected organization context.

## 1.3 Organization Context

Implement a secure organization-context mechanism.

When a user signs in:

1. Retrieve the organizations the user belongs to.
2. Determine their authorized memberships.
3. Allow selection of an organization if more than one exists.
4. Load the correct organization workspace.
5. Enforce organization permissions on all relevant requests.

Do not trust an organization ID or organization slug sent by a client without validating membership and authorization.

The organization context must be established and verified server-side.

Provide an organization switcher for users belonging to multiple organizations.

## 1.4 Tenant Data Isolation

Every organization-owned record must be associated with an organization ID or another securely enforced organization ownership relationship.

Examples:
- Student memberships.
- Instructor assignments.
- Classes.
- Organizational settings.
- Student academic activity records performed within an organization.
- Organization-specific resource configuration.
- Tutoring sessions.

Shared global Mathlete content should remain separate from organization-owned records.

For example:

The Jump Lab's global educational content is shared.

A student's attempts within WCA are WCA-scoped records.

Another organization's student should not be able to retrieve those records.

If the existing database supports PostgreSQL row-level security, consider using it as an additional security layer.

Always enforce authorization at the application/service layer as well.

## 1.5 Existing Data Migration

Inspect existing users and learning records.

Create a migration strategy that preserves existing data.

Do not arbitrarily assign all existing users to WCA or another organization.

For records created before organizational support, determine whether they belong to:
- An existing organization.
- A direct individual account.
- An administrative/demo environment.

If ownership cannot be determined reliably, preserve the records and flag them for manual mapping.

## 1.6 Organization Status and Access

Organization status must affect access.

An organization marked Suspended must not continue receiving unrestricted access through an active frontend session.

Define behavior for:
- Active organizations.
- Pending organizations.
- Suspended organizations.
- Archived organizations.

Archived organizations should not appear in regular user organization selection.

Preserve historical data.

Do not hard-delete organizations with active or historical student records.

## 1.7 Security Acceptance Criteria

- [ ] An organization can be created.
- [ ] Two organizations can exist independently.
- [ ] A user can belong to multiple organizations.
- [ ] Roles are organization-specific.
- [ ] Users cannot query another organization's private records.
- [ ] Organization context is verified server-side.
- [ ] Existing user records remain intact.
- [ ] Organization suspension changes access appropriately.
- [ ] Tenant isolation is covered by automated tests.

---

# PRD 2 — USER MANAGEMENT AND ORGANIZATION ONBOARDING

**Priority:** P0  
**Dependencies:** PRD 1  
**Objective:** Give organizations the ability to manage their instructors and students independently.

## 2.1 Organization Roles

Implement the following roles.

### Platform Super Admin

Managed by Mathlete.

Can:
- Create and manage organizations.
- Assign organization administrators.
- Manage global subscription plans.
- Manage platform resource entitlements.
- Suspend organizations.
- View organization-level usage and licensing information.
- Manage global content access.
- Troubleshoot organization accounts.

Super Admin privileges must be controlled server-side and must not be assignable by organization administrators.

### Organization Owner

Can:
- Manage the organization.
- Manage organization administrators.
- Manage members.
- Configure resources within licensed entitlements.
- View organization-level usage.
- Manage subscription and billing, where authorized.
- Manage organization settings.

### Organization Administrator

Can:
- Invite instructors.
- Invite students.
- Manage active members.
- Organize classes and cohorts.
- Configure available learning resources.
- Manage organization-level settings.
- View organization-level student activity within appropriate permissions.

Billing access may be restricted to the Organization Owner.

### Instructor / Tutor

Can:
- View assigned students.
- Manage assigned classes.
- Assign learning activities.
- Review student progress for assigned students.
- Access permitted student academic histories.

Cannot:
- Manage the organization subscription.
- Change organization-wide licensing.
- Access unassigned student records without authorization.
- Change platform-wide content.

### Student

Can:
- Access authorized learning resources.
- View personal academic progress.
- Complete learning activities.
- View assigned activities.
- Participate in classes they belong to.

Cannot:
- Manage organization members.
- Change subscriptions.
- Access other students' records.

Parent/guardian roles are out of scope for the initial release.

## 2.2 Organization Dashboard

Create an organization administrative dashboard.

Display:

- Organization name.
- Active student count.
- Active instructor count.
- Available student seats.
- Available resource count.
- Subscription status.
- Organization administrators.
- Recent organizational activity.

Primary navigation:

- Overview.
- Members.
- Classes.
- Learning Resources.
- Settings.
- Subscription.

Only show Subscription to authorized users.

## 2.3 Invitations

Allow authorized organization administrators to invite individuals.

Invitation flow:

1. Administrator selects Invite Member.
2. Administrator enters email address.
3. Administrator selects role.
4. System validates available permissions and seat availability.
5. System creates a secure invitation.
6. Invitee receives an invitation.
7. Invitee creates an account or signs into an existing account.
8. Invitee accepts the organization invitation.
9. Organization membership becomes active.

Support existing Mathlete users joining a new organization without creating duplicate user accounts.

Invitation records must include:

- Invitation ID.
- Organization ID.
- Invited email.
- Assigned role.
- Invited by.
- Token hash.
- Expiration date.
- Invitation status.
- Accepted date.

Invitation tokens must be secure, single-use, and expire.

Do not store raw invitation tokens unnecessarily.

## 2.4 Student Enrollment

Provide two enrollment methods initially:

**Individual invitation**

Administrators invite students individually.

**Bulk CSV invitation**

Allow administrators to upload a CSV containing:
- Student first name.
- Student last name.
- Email address, where available.
- Requested role.

Provide a preview before importing.

Validate:
- Duplicate email addresses.
- Existing memberships.
- Invalid email formats.
- Available seats.
- Missing required fields.

Show successful and failed records individually.

Do not allow bulk imports to bypass licensing limits.

Do not require students to share an email with other students.

If the current authentication provider supports alternative age-appropriate account identifiers, consider them without introducing shared credentials.

## 2.5 Membership Management

Administrators should be able to:

- View members.
- Filter by role.
- Search by name or email.
- View membership status.
- Change permitted roles.
- Suspend membership.
- Remove membership.

When membership is removed:
- Revoke organizational access.
- Release an associated student seat.
- Preserve historical academic records.
- Preserve audit history.

Do not automatically delete a student's global user account.

## 2.6 Organization Onboarding Wizard

Create a straightforward initial setup flow.

Step 1: Create organization.

Step 2: Set organization details.

Step 3: Assign owner.

Step 4: Configure available resources.

Step 5: Invite instructors.

Step 6: Invite students.

Step 7: Complete setup.

Allow the organization to return to the dashboard before all steps are complete.

## 2.7 Acceptance Criteria

- [ ] Admin can create and manage organization invitations.
- [ ] Existing users can join organizations.
- [ ] New users can create accounts through invitations.
- [ ] Bulk student invitations work.
- [ ] Organization roles are enforced.
- [ ] Members can be suspended or removed.
- [ ] Student seats are accounted for.
- [ ] Historical records are preserved after removal.
- [ ] Users can switch between authorized organizations.

---

# PRD 3 — RESOURCE CATALOG, LICENSING ENTITLEMENTS AND ORGANIZATION CUSTOMIZATION

**Priority:** P0  
**Dependencies:** PRDs 1 and 2  
**Objective:** Allow organizations to configure which Mathlete learning resources their students can access.

## 3.1 Global Resource Catalog

Create a centralized Mathlete resource catalog.

Resources are owned and managed globally by Mathlete.

Organizations do not receive copies of the underlying content.

Each resource should include:

- Resource ID.
- Resource name.
- Resource slug.
- Description.
- Resource type.
- Subject.
- Course, where applicable.
- Learning objectives.
- Associated skills.
- Associated sport/context.
- Thumbnail.
- Availability status.
- Version.

Initial supported resource types:

- Learning Lab.
- Course.
- Learning Module.
- Sport Learning Environment.
- Platform Feature.

Example catalog:

| Resource | Type |
|---|---|
| Slope & Linear Relationships | Learning Module |
| Trail Builder | Learning Lab |
| Jump Lab | Learning Lab |
| Suspension Setup Studio | Learning Lab |
| Ride Data Lab | Learning Lab |
| Algebra I | Course |
| Physics | Course |
| Ski Physics | Sport Learning Environment |

Resource records should support future expansion.

## 3.2 Resource Relationships

A resource may depend on another resource or academic concept.

For example:

- Jump Lab teaches quadratic functions.
- Quadratic Functions belongs to Algebra II.
- Algebra II belongs to Mathematics.
- MTB is the contextual learning environment.

Do not duplicate resources simply because multiple organizations use them.

## 3.3 Subscription Entitlement Versus Organization Configuration

These are two separate things.

**Subscription entitlement** determines what an organization has purchased.

**Organization configuration** determines which of its purchased resources it chooses to enable.

Example:

WCA's subscription includes:
- Trail Builder.
- Jump Lab.
- Suspension Setup Studio.
- Academic Practice Engine.

WCA may choose to disable Suspension Setup Studio temporarily.

An administrator must never be able to enable a resource that is not included in the organization's license.

The effective access rule should require:

1. User has an active membership in the organization.
2. Organization is active.
3. Organization subscription or authorized license is active.
4. Resource is included in the organization's licensed entitlements.
5. Organization has enabled the resource.
6. User's role permits access.

Enforce this on the server.

A hidden frontend link is not sufficient access control.

## 3.4 Organization Resource Settings

Create a Learning Resources configuration page.

Show resources available to the organization and allow authorized administrators to enable or disable them.

Example:

WCA Resources:
- Trail Builder: Enabled.
- Jump Lab: Enabled.
- Suspension Setup Studio: Enabled.
- Ride Data Lab: Disabled.
- Ski Physics: Not included in plan.

Display clear states:

- Included and enabled.
- Included but disabled.
- Not included in subscription.
- Temporarily unavailable.

Allow organization administrators to configure resource defaults.

## 3.5 Course and Curriculum Configuration

Allow administrators to configure available academic courses.

Support:
- Enabling courses.
- Hiding courses.
- Organizing units.
- Selecting recommended topics.
- Creating curated resource collections.

Do not allow organizations to modify the global Mathlete curriculum itself in V1.

Organization-specific curriculum sequencing may be supported through mappings and configuration.

## 3.6 Sports Context Customization

Organizations should be able to enable available sport contexts.

Initial examples:
- Mountain Biking.
- Skiing.
- Surfing.
- Climbing.

Do not create independent applications for these sports.

Treat them as globally managed learning environments.

Organizations can choose which contexts students see, subject to licensing.

Allow later class-specific or student-specific preferences.

## 3.7 Organization Branding

Support modest organization-level branding.

Allow:
- Organization display name.
- Logo.
- Primary accent color.
- Welcome message.

Maintain Mathlete branding.

Do not implement full white-label licensing or custom domains in V1.

Validate logo dimensions and file types.

Ensure color choices maintain readable contrast.

## 3.8 Organization Dashboard Preview

Provide an administrator preview of what students will see.

Display:
- Organization branding.
- Enabled resources.
- Available courses.
- Organization welcome message.

This helps administrators verify configuration before students begin using the platform.

## 3.9 Configuration Boundaries

Organizations may configure approved settings, but cannot:
- Modify global Mathlete source content.
- Modify global question answers.
- Access unpublished resources.
- Enable unlicensed features.
- Change global subscription plans.
- Change another organization's configuration.

## 3.10 Acceptance Criteria

- [ ] Global resource catalog exists.
- [ ] Resources can be classified.
- [ ] Plans or licenses can grant resource entitlements.
- [ ] Administrators can enable and disable included resources.
- [ ] Unlicensed resources remain inaccessible.
- [ ] Resource access is validated server-side.
- [ ] Organization branding works.
- [ ] Organizations can configure course visibility.
- [ ] One resource can be used by multiple organizations without duplicating content.
- [ ] Changes to one organization's settings cannot affect another organization's experience.

---

# PRD 4 — SUBSCRIPTIONS, LICENSING AND STUDENT SEAT MANAGEMENT

**Priority:** P0 for licensing logic; P1 for automated payment integration  
**Dependencies:** PRDs 1, 2 and 3  
**Objective:** Allow Mathlete to sell, activate, manage, and revoke organizational software licenses.

## 4.1 Subscription Plans

Create a configurable subscription plan model.

Do not hard-code individual pricing values throughout the application.

Plan fields should include:

- Plan ID.
- Name.
- Description.
- Billing interval.
- Included resources.
- Student seat limit.
- Optional instructor limit.
- Available features.
- Price.
- Currency.
- Status.
- Version or effective date.

Initial plan concepts:

**Organization Pilot**
- Limited student seats.
- Selected educational resources.
- Basic instructor access.
- Defined pilot duration.

**School**
- Larger student seat allowance.
- Expanded learning resource library.
- Multiple instructors.
- Organization configuration.
- Class management.

**Multi-Campus / Enterprise**
- Multiple organization workspaces.
- Centralized subscription management.
- Separate administrative environments.
- Expanded licensing and support.

Exact prices are to be configured by Mathlete administrators.

Do not invent or automatically assign pricing.

## 4.2 Organization Subscription

Each organization may have one or more subscription records depending on future product packaging.

A subscription should include:

- Subscription ID.
- Organization ID.
- Plan ID.
- Start date.
- End or renewal date.
- Billing interval.
- Status.
- Billing provider reference.
- Student seat allowance.
- Subscription metadata.
- Cancellation information.

Subscription statuses:

- Pending.
- Trialing.
- Active.
- Past Due.
- Suspended.
- Canceled.
- Expired.

Define clear transitions between states.

Maintain subscription history.

Do not overwrite historical subscription records when a plan changes.

## 4.3 Manual License Activation

This must work before online billing is integrated.

A Mathlete Super Admin should be able to:

1. Create an organization.
2. Select a plan.
3. Set a seat allowance.
4. Set a license start date.
5. Set a renewal or expiration date.
6. Activate the subscription manually.
7. Suspend or cancel the subscription.
8. View subscription history.

This is the primary initial licensing mechanism for the World Class Academy pilot.

Manual activation must create real subscription and entitlement records, not bypass the licensing system.

## 4.4 Student Seat Management

Initial licensing model:

Student seats are billable.

Instructor accounts are included in the organizational plan, subject to any defined fair-use or plan-specific staff limit.

Administrators should see:

- Licensed student seats.
- Active student memberships.
- Pending reserved invitations.
- Available seats.

Example:

WCA has 30 licensed student seats.

- 24 active students.
- 2 pending invitations with reserved seats.
- 4 seats available.

Implement seat validation transactionally to prevent concurrent invitations from exceeding the license limit.

An invited student should reserve a seat until the invitation expires, is revoked, or is accepted.

Removing or deactivating a student membership releases the seat.

Preserve their historical learning records.

Define a clear policy for seat changes and plan upgrades.

## 4.5 Subscription Enforcement

Organization access must be derived from subscription status and entitlements.

A valid license requires:
- Active organization.
- Active subscription or explicitly authorized license state.
- Current license period.
- Available student seat.
- Appropriate resource entitlement.
- Active organization membership.

Define any payment grace period as a configurable policy.

Do not hard-code indefinite access after expiration.

When access is suspended:
- Prevent new protected learning activities.
- Prevent unauthorized resource access.
- Preserve historical records.
- Allow organization administrators appropriate access to billing and renewal information.
- Display an understandable access status.

Do not delete learning records or organizational data when a subscription expires.

## 4.6 Billing Integration Architecture

Inspect the existing application to determine whether a billing provider is already used.

Implement a provider abstraction.

If Stripe is already configured or selected for the project, integrate it through a dedicated billing service.

Otherwise, build the internal subscription logic first and keep payment integration separate.

Do not require an active payment provider to activate a manually administered license.

A future automated billing integration should support:
- Checkout.
- Payment confirmation.
- Recurring subscription events.
- Plan changes.
- Seat quantity changes.
- Cancellation.
- Failed payments.
- Webhook verification.

Never treat a client-side payment success page as proof that a payment succeeded.

Only trusted, verified billing events may update subscription payment state.

## 4.7 Mathlete Subscription Administration

Create a platform-level subscription management screen.

Mathlete administrators should be able to:
- View all organizations.
- View plans.
- View active subscriptions.
- View license dates.
- View seat usage.
- Activate manual subscriptions.
- Suspend subscriptions.
- Change plan allocations.
- Review subscription history.

## 4.8 Acceptance Criteria

- [ ] Plans can be created and edited.
- [ ] Resources can be included in plans.
- [ ] Organizations can receive manually activated subscriptions.
- [ ] License start and end dates are respected.
- [ ] Student seats are limited.
- [ ] Pending invitations reserve seats.
- [ ] Seats are released appropriately.
- [ ] Subscription expiration affects protected access.
- [ ] Historical records remain available according to policy.
- [ ] Billing provider logic is separated from core authorization.
- [ ] All subscription state changes are auditable.

---

# PRD 5 — CLASSES, COHORTS, ASSIGNMENTS AND INSTRUCTOR TOOLS

**Priority:** P1  
**Dependencies:** PRDs 1, 2 and 3  
**Objective:** Make Mathlete useful as a day-to-day educational tool within schools.

## 5.1 Classes and Cohorts

Allow organizations to create groups.

Examples:
- Algebra I Group A.
- Algebra II.
- Physics.
- Grade 10 Mathematics.
- Individual Tutoring.

Each class should include:
- Class ID.
- Organization ID.
- Name.
- Description.
- Course association.
- Instructor assignments.
- Student memberships.
- Status.
- Created date.

A student can belong to multiple classes within the same organization.

Instructors may be assigned to multiple classes.

## 5.2 Class Administration

Organization administrators should be able to:
- Create classes.
- Edit classes.
- Assign instructors.
- Add and remove students.
- View class enrollment.
- Archive completed classes.

All class records must belong to the correct organization.

## 5.3 Learning Assignments

Instructors should be able to assign Mathlete resources.

An assignment may contain:
- Learning lab.
- Course topic.
- Practice activity.
- Specific problem set.
- Recommended learning module.

Each assignment should include:
- Title.
- Description.
- Resource reference.
- Assigned class or students.
- Created by.
- Start date.
- Due date, where appropriate.
- Completion expectations.
- Assignment status.

Assignments should reference existing Mathlete content, not create copies.

## 5.4 Student Assignment Dashboard

Students should see:
- Assigned activities.
- Due dates.
- Completion status.
- Recommended activities.
- Recently completed work.

Do not overwhelm students with a complex LMS experience.

Keep the interface focused on completing learning activities.

## 5.5 Instructor Dashboard

Instructors should see:
- Assigned classes.
- Student participation.
- Assignment completion.
- Recent student practice.
- Students who may need additional support.

Instructors must only see student data for classes or individuals they are authorized to access.

## 5.6 Academic Progress

Provide basic organization-level reporting.

Examples:
- Students practicing a particular topic.
- Activity completion.
- Practice participation.
- Question-level performance.
- Areas where students repeatedly struggle.

Do not provide a simplistic ranking of students.

Focus on instructional usefulness.

## 5.7 Acceptance Criteria

- [ ] Organization admins can create classes.
- [ ] Instructors can be assigned to classes.
- [ ] Students can belong to classes.
- [ ] Instructors can assign available learning resources.
- [ ] Students can view and complete assignments.
- [ ] Instructors can review assigned student activity.
- [ ] Cross-organization access remains blocked.
- [ ] Archived classes preserve their historical information.

---

# CROSS-PRD REQUIREMENTS

The following requirements apply to every implementation.

## A. Security

Implement secure authentication and server-side authorization.

Use:
- Role-based access control.
- Organization-context verification.
- Database access restrictions.
- Secure invitation tokens.
- Protected file storage.
- Audit logging.
- Appropriate session management.

Never rely exclusively on frontend permissions.

Test direct API access and unauthorized organization-ID manipulation.

## B. Privacy and Student Data

Mathlete serves students, including minors.

Implement privacy-conscious defaults.

- Collect only necessary personal information.
- Restrict student access to their own records.
- Restrict instructor access to assigned students.
- Restrict organization administrators to their own organization.
- Separate private tutor notes from student-visible information.
- Support appropriate data export and deletion workflows.
- Do not sell educational records.
- Do not use student records for unrelated advertising.
- Review applicable education privacy requirements before institutional deployment.

## C. Audit Logging

Track important administrative events.

Examples:
- Organization created.
- Subscription activated.
- Subscription suspended.
- Seat allocated.
- Seat released.
- Member invited.
- Member removed.
- Role changed.
- Resource enabled.
- Organization settings updated.

Audit events should include:
- Actor.
- Organization.
- Action.
- Target record.
- Timestamp.
- Relevant metadata.

Do not record passwords, invitation secrets, payment credentials, or unnecessary student information.

## D. User Interface

Maintain Mathlete's existing visual design.

The organizational experience should feel like a professional educational software platform.

Use:
- Clear dashboards.
- Simple navigation.
- Consistent organization branding.
- Responsive design.
- Accessible controls.
- Clear access and subscription statuses.

Avoid unnecessary enterprise complexity in the initial release.

## E. Technical Quality

- Use database migrations.
- Preserve existing records.
- Add appropriate indexes.
- Enforce foreign keys.
- Add automated access-control tests.
- Add service-level tests for subscription logic.
- Handle failed invitations and payment events.
- Keep business logic modular.
- Avoid duplicated learning-resource content.
- Document environment variables and integration configuration.
- Do not commit secrets.

## F. Non-Goals

Do not build the following as part of this institutional foundation:

- Separate application deployments for each school.
- Full white-label software.
- Custom domains.
- Complete school information system.
- Attendance management.
- Gradebook replacement.
- Parent messaging platform.
- Full LMS integration.
- SAML enterprise SSO.
- AI school administration.
- Automated AI grading.
- Separate copies of learning labs for every institution.

These may be considered in later product phases.

---

# IMPLEMENTATION SEQUENCE

The order of implementation matters.

**Phase 0: Audit**
Complete PRD 0 and review its architecture proposal.

**Phase 1: Organization Foundation**
Complete PRD 1. Prove that two organizations can exist with secure data separation.

**Phase 2: Onboarding**
Complete PRD 2. Prove that each organization can manage individual students and instructors.

**Phase 3: Resource Configuration**
Complete PRD 3. Prove that an organization can enable and disable licensed Mathlete resources.

**Phase 4: Licensing**
Complete PRD 4. Prove that an organization must have an active license and available student seats to access protected content.

**Phase 5: School Operations**
Complete PRD 5. Allow organizations to organize classes, distribute assignments, and monitor their students.

Billing automation can follow once manual licensing is working.

---

# FIRST CUSTOMER ACCEPTANCE TEST: WORLD CLASS ACADEMY

The final test of the initial platform should be the complete onboarding of World Class Academy.

Mathlete Super Admin must be able to:

1. Create World Class Academy.
2. Assign an organization owner.
3. Activate a manually managed organization license.
4. Allocate an agreed number of student seats.
5. Enable Trail Builder and other purchased resources.
6. Invite a WCA instructor.
7. Invite a WCA student.
8. Have the instructor create a class.
9. Enroll the student in that class.
10. Assign Slope & Linear Relationships.
11. Have the student log in and access the resource.
12. Have the student complete the learning activity.
13. Have the instructor review the student's permitted learning history.

Then test a second organization:

14. Create a separate organization.
15. Ensure it has no active license.
16. Attempt to access a paid Mathlete resource.
17. Confirm that access is denied.
18. Confirm that it cannot retrieve WCA student records.
19. Activate its own license.
20. Enable a different set of resources.
21. Confirm that its configuration does not change WCA's configuration.

The system must pass these tests before being considered ready for a second institutional customer.

---

# FINAL PRODUCT DEFINITION

Mathlete is a centralized educational software platform that licenses its content, learning environments, and academic tools to schools and educational organizations.

Each organization receives an independent workspace, individual user accounts, customizable learning resources, and appropriate student management tools.

Mathlete maintains ownership and control of the shared software and educational content.

The business should be able to grow from one founding school to dozens or hundreds of organizations without creating separate applications or duplicating learning content.

**Build the organizational infrastructure once. Let schools configure their own experience. Let Mathlete continue improving the product for everyone.**