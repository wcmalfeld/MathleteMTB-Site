# PRD: Mathlete — Resources Library

**Feature:** Resources  
**Product:** Mathlete  
**Priority:** High  
**Status:** Ready for development

---

## 1. Overview

Build a dedicated **Resources** section within the Mathlete website that serves as a centralized library of educational resources, tools, articles, documents, videos, and other materials that help students become better learners and problem solvers.

The purpose of this section is to collect and organize valuable information that students can use to improve their academic abilities, develop better learning habits, strengthen their problem-solving skills, and build a deeper understanding of mathematics and science.

Resources may include:
- PDF documents and worksheets
- Study guides and cheat sheets
- Educational articles and blog posts
- YouTube videos and other video content
- External websites and learning platforms
- Interactive educational tools
- Research papers and educational studies
- Books and book recommendations
- Podcasts
- Downloadable templates
- General learning strategies and techniques
- Other useful educational materials

The Resources section should be easy for an administrator or tutor to update without requiring code changes.

### Core philosophy

Mathlete isn't just about helping students complete their current math assignments. It's about helping them become better thinkers and independent learners.

The Resources section should reflect that philosophy by exposing students to valuable ideas, tools, and information that they can use both inside and outside the classroom.

---

## 2. Goals

1. Create one centralized place for valuable educational resources.
2. Make it easy for administrators and tutors to upload, organize, edit, and remove resources.
3. Allow students to easily discover resources relevant to their academic needs and interests.
4. Organize resources around subjects, skills, and learning objectives rather than simply file types.
5. Support different types of content, including documents, websites, articles, and videos.
6. Allow resources to be curated and shared across different schools and organizations.
7. Build an expandable foundation for a larger Mathlete knowledge library.

### Success criteria

- An administrator can add a new resource in under one minute.
- Students can quickly find resources using categories, search, and filters.
- Resources display consistently regardless of content type.
- Organization-specific resources remain private to the appropriate organization.
- The library works well on desktop, tablets, and mobile devices.

---

## 3. Website Navigation and Structure

Add a new top-level navigation item called:

**Resources**

It should sit alongside the existing Mathlete sections.

Suggested navigation:

- Home
- Classes
- MTB Coaching
- Private Tutoring
- Resources
- About

Do not merge Resources with Classes or MTB Coaching. Resources is a separate section that covers broader academic development, learning strategies, and educational materials.

### Resources landing page

The main Resources page should feature:

**A. Page introduction**

Title: Resources

Subtitle:
"Explore tools, ideas, and resources to help you become a better student, a stronger problem solver, and a more confident learner."

**B. Featured resources**

Display a curated selection of important or recommended resources at the top of the page.

Administrators should be able to designate resources as featured.

**C. Search**

A prominent search bar allowing students to search by:
- Resource title
- Description
- Subject
- Category
- Tags
- Keywords

**D. Resource categories**

Display a category-based browsing experience.

Suggested initial categories:

| Category | Description |
|---|---|
| Math & Mathematics | Resources for understanding and improving mathematical skills |
| Problem Solving | Critical thinking, logical reasoning, and approaching difficult problems |
| Study Skills | Learning techniques, studying strategies, and academic habits |
| How to Learn | Memory, understanding, focus, and effective learning methods |
| Physics & Science | Resources for understanding scientific concepts |
| Productivity & Organization | Time management, goal setting, and staying organized |
| Mindset & Motivation | Confidence, persistence, overcoming challenges, and developing a growth mindset |
| Tools & Technology | Useful websites, apps, calculators, and interactive learning tools |
| Books & Recommendations | Books and other recommended learning materials |

Categories should be manageable through the admin interface. Administrators should be able to create, rename, reorder, and remove categories.

**E. Recently added**

Include a section highlighting recently published resources.

**F. Browse all resources**

A searchable, filterable collection of all published resources.

---

## 4. Resource Types

The platform must support multiple resource formats.

Each resource should have a common metadata structure but render differently depending on its content type.

### Type 1: Uploaded Documents

Allow administrators and authorized tutors to upload files directly.

Supported formats should include:
- PDF
- DOC/DOCX
- PPT/PPTX
- XLS/XLSX
- TXT
- MD
- JPG/JPEG
- PNG
- WebP

Functionality:
- Upload files from a local device.
- Add a title and description.
- Assign categories and tags.
- Add a thumbnail or cover image.
- Preview PDFs within the website when supported.
- Download the original document.
- Display file format and file size.
- Replace or update an existing file.

### Type 2: Articles and External Websites

Allow administrators to save useful articles and websites.

Fields:
- Title
- Description
- URL
- Source or publication
- Author (optional)
- Thumbnail image (optional)
- Category
- Tags

Functionality:
- Display the resource as a card.
- Open the external resource in a new browser tab.
- Allow administrators to include a short explanation of why the resource is valuable.
- Allow administrators to manually edit the preview information.

Do not require automatic website scraping to create a resource.

### Type 3: Videos

Support both external videos and directly uploaded video files.

External video support:
- YouTube
- Vimeo
- Other supported video URLs

Functionality:
- Display a video thumbnail.
- Embed supported videos within the resource detail page.
- Include a title, description, source, and tags.
- Allow users to open the video on its original platform.

Uploaded video support:
- Allow supported video file formats, such as MP4, subject to configured storage limits.
- Play supported files using the native browser video player.
- Do not build a custom video-transcoding system as part of the initial feature.

### Type 4: External Tools and Interactive Websites

Allow administrators to save useful interactive resources, such as:
- Math visualization tools
- Graphing calculators
- Interactive physics simulations
- Educational games
- Online practice platforms
- Other useful websites

Functionality:
- Store the external URL.
- Provide a title and explanation.
- Add an optional thumbnail.
- Open the external tool in a new tab.

### Type 5: Custom Notes and Written Resources

Allow administrators and tutors to create resources directly within Mathlete.

Examples:
- My approach to solving difficult math problems.
- Five study habits that actually work.
- How to prepare for a math exam.
- How to approach a problem you don't understand.
- Tips for staying focused while studying.

Functionality:
- Rich-text editor.
- Support headings, paragraphs, lists, links, and images.
- Save and edit content directly in the platform.
- Display written resources using a dedicated reading layout.

---

## 5. Resource Metadata and Organization

Every resource should have a consistent collection of metadata.

### Required fields

- Resource title
- Short description
- Resource type
- Primary category

### Optional fields

- Thumbnail / cover image
- External URL
- Uploaded file
- Author
- Source / publication
- Additional tags
- Subject
- Related academic course
- Recommended grade level
- Difficulty level
- Estimated time to complete or consume
- Why this resource is recommended
- Featured status

### Tags

Allow administrators to assign multiple tags to every resource.

Example tags:
- Algebra
- Geometry
- Calculus
- Critical Thinking
- Memory
- Focus
- Learning Strategies
- Growth Mindset
- Exam Preparation
- Independent Learning
- Mental Math
- Visual Learning

Tags should be searchable and reusable across resources.

### Subjects and skills

Keep categories, subjects, and skills separate.

For example:

Resource: How to Solve Difficult Problems

- Category: Problem Solving
- Subject: Mathematics
- Skills: Critical Thinking, Logical Reasoning, Perseverance

This allows students to discover resources from multiple perspectives.

---

## 6. Resource Browsing Experience

The student-facing experience should be clean, engaging, and easy to navigate.

### Resource cards

Each resource should display:

- Thumbnail or resource-type icon
- Title
- Short description
- Resource category
- Resource type
- Relevant tags

Use a consistent card design across all resource types.

The card should visually indicate whether the resource is a:
- Document
- Article
- Video
- External tool
- Written resource

### Resource detail page

Clicking a resource should open a dedicated detail page.

Include:
- Resource title
- Description
- Resource content or embedded preview
- Resource source
- Category and tags
- Additional notes or recommendations
- Related resources

Depending on the resource type:
- Documents should provide a preview and download option.
- Videos should display an embedded player when supported.
- Articles should provide an external link.
- Written resources should display readable content.
- Interactive tools should provide a clear link to launch the tool.

### Search and filters

Allow users to filter by:

- Category
- Subject
- Skill
- Resource type
- Grade level
- Difficulty

Allow sorting by:
- Recently added
- Alphabetical
- Featured

Search and filtering should work together.

Display a useful empty state when no resources match a search.

---

## 7. Admin and Tutor Management

A major requirement is that administrators can continuously add resources without developer assistance.

Create an admin management interface for the Resources section.

### Resource management dashboard

Administrators should be able to:

- View all resources.
- Search and filter existing resources.
- Add new resources.
- Edit resources.
- Delete resources.
- Publish and unpublish resources.
- Feature and unfeature resources.
- Assign categories and tags.
- Change resource visibility.
- Reorder featured resources.

### Add Resource workflow

Create a straightforward Add Resource form.

Step 1: Select resource type.

Options:
- Document
- Article / Website
- Video
- Interactive Tool
- Written Resource

Step 2: Enter resource information.

Display the appropriate fields based on the selected type.

Step 3: Organize the resource.

Select:
- Category
- Subject
- Skills / Tags
- Grade level
- Difficulty

Step 4: Set visibility.

Choose who can access the resource.

Step 5: Save.

Allow administrators to save resources as drafts or publish immediately.

The form should be intuitive and avoid unnecessary complexity.

### Resource library management

Use a table or list view in the admin dashboard.

Columns:
- Resource title
- Type
- Category
- Visibility
- Status
- Date added
- Created by
- Actions

Actions:
- Edit
- Preview
- Publish / Unpublish
- Delete

Include a confirmation step before permanently deleting a resource.

---

## 8. Organization and User Permissions

Mathlete is intended to support multiple schools and organizations using the platform.

The Resources section must be compatible with this architecture.

### Resource visibility

Implement three visibility options:

**1. Mathlete-wide**

Resources made available across all participating organizations.

Examples:
- General study strategies.
- Recommended educational videos.
- Math learning resources.

**2. Organization-specific**

Resources available only to a particular school or organization.

Examples:
- A school's internal study guides.
- Teacher-uploaded materials.
- Organization-specific learning recommendations.

**3. Private / Admin-only**

Resources visible only to authorized administrators or tutors.

Examples:
- Internal teaching references.
- Tutor training materials.
- Resources being reviewed before publication.

### Permissions

| Role | Permissions |
|---|---|
| Platform Admin | Manage all resources across Mathlete |
| Organization Admin | Manage resources for their organization and access permitted shared resources |
| Tutor | View accessible resources and add/manage resources where authorized |
| Student | Browse and access published resources available to their organization |

Implement role-based access using the existing authentication and authorization architecture.

Important:
- Students must never see unpublished resources.
- Organization-specific resources must not leak between organizations.
- Only authorized users should be able to upload, edit, publish, or delete resources.
- Organization administrators should not be able to edit Mathlete-wide resources unless explicitly granted permission.

---

## 9. Data Model

Build the data model to accommodate additional resource types and organization-level permissions without requiring a major redesign.

### Resource

Suggested fields:

- id
- title
- slug
- description
- resource_type
- content
- external_url
- file_storage_key
- file_name
- file_type
- file_size
- thumbnail_url
- author
- source_name
- category_id
- subject
- tags
- grade_levels
- difficulty
- estimated_duration
- recommendation_note
- visibility
- organization_id (nullable for Mathlete-wide resources)
- is_featured
- display_order
- status (draft / published / archived)
- created_by
- created_at
- updated_at
- published_at

Adapt field names and relationships to the existing database conventions.

### Supporting entities

**Resource Categories**
- id
- name
- description
- slug
- display_order
- created_at

**Resource Tags**
- id
- name
- slug

**Resource-Tag Relationship**
- resource_id
- tag_id

**Resource Collections**

Allow related resources to be grouped into curated collections.

Fields:
- id
- title
- description
- thumbnail_url
- organization_id (nullable for Mathlete-wide collections)
- visibility
- display_order
- status
- created_at
- updated_at

**Collection-Resource Relationship**
- collection_id
- resource_id
- display_order

Use appropriate indexes for organization, status, category, resource type, and search fields.

Use the existing authentication and organization tables. Do not create duplicate organization or user models.

---

## 10. Curated Collections

An important feature is the ability to group several resources into a collection.

Instead of requiring a student to browse dozens of individual resources, administrators should be able to create themed collections.

Examples:

**Become a Better Math Student**
- How to approach difficult problems.
- Effective math study habits.
- How to prepare for a math test.
- How to learn from mistakes.

**The Art of Problem Solving**
- Critical thinking techniques.
- Logical reasoning.
- Breaking complex problems into smaller steps.
- Developing persistence.

**Learning How to Learn**
- Spaced repetition.
- Active recall.
- Memory techniques.
- Understanding versus memorization.

**Essential Math Tools**
- Desmos.
- GeoGebra.
- Online graphing calculators.
- Interactive math visualizations.

Collection functionality:
- Create and edit collections.
- Add and remove resources.
- Reorder resources.
- Assign a cover image.
- Set visibility.
- Feature collections on the Resources homepage.

Collections should be optional. Individual resources must remain discoverable without belonging to a collection.

---

## 11. Design and User Experience

The Resources section should use the existing Mathlete design system.

Do not redesign the rest of the website.

Design principles:
- Clean and organized.
- Modern but not overly corporate.
- Easy for high school students to navigate.
- Visually distinguish different types of resources.
- Prioritize content discovery over decorative elements.
- Fully responsive.
- Consistent with the existing Mathlete branding and visual language.

The experience should feel like a curated educational library rather than a generic file manager.

Use attractive resource thumbnails, recognizable content-type indicators, and clear category navigation.

Avoid overwhelming users with too many filters or metadata fields at once.

---

## 12. Technical Requirements

Before implementation, inspect the existing Mathlete codebase.

Identify:
- Existing application framework.
- Current navigation structure.
- Authentication implementation.
- User roles and permissions.
- Organization / tenant architecture.
- Database conventions.
- Existing file storage infrastructure.
- Existing admin dashboard.
- Existing UI component library.
- Current design system.

Build the feature using existing architectural patterns wherever possible.

### File handling

- Store uploaded files in the existing secure storage infrastructure or an appropriate private object-storage solution.
- Store file metadata in the database.
- Do not store large binary files directly in database records.
- Validate file extensions, MIME types, and file sizes.
- Restrict upload access to authorized users.
- Use secure, permission-checked file delivery or signed download URLs as appropriate.
- Prevent executable uploads and unsafe file handling.
- Do not expose private storage paths or organization-specific files publicly.

### External content

- Validate and sanitize external URLs.
- Use HTTPS where supported.
- Open external links safely in new tabs.
- Restrict embedded content to approved providers and domains.
- Do not execute arbitrary HTML or JavaScript submitted by resource creators.
- Never render untrusted iframe or embed code directly.

### Performance

- Paginate resource listings.
- Optimize thumbnail images.
- Avoid loading every resource file when the landing page loads.
- Use efficient database queries for filters.
- Implement server-side permission checks.

### Accessibility

- Support keyboard navigation.
- Provide descriptive labels for interactive elements.
- Use readable contrast and responsive layouts.
- Include alternative text for meaningful images.

---

## 13. MVP Development Scope

Build this feature in manageable phases.

### Phase 1: Core Resources Library

Required:
- Resources navigation item.
- Resources landing page.
- Resource cards.
- Resource categories.
- Search.
- Basic filters.
- Resource detail pages.
- Upload documents.
- Add external links and articles.
- Add YouTube/Vimeo videos.
- Written resources.
- Basic resource metadata.
- Admin create, edit, delete, and publish functionality.
- Resource visibility and organization permissions.
- Responsive design.

### Phase 2: Advanced Organization

Add:
- Curated collections.
- Advanced tagging.
- Subject and skill filters.
- Featured resources.
- Recently added resources.
- Resource reordering.
- Direct video uploads.
- Richer article and document previews.
- Bulk resource management.

### Phase 3: Student Personalization

Potential future additions:
- Students can bookmark resources.
- Students can create personal resource lists.
- Tutors can recommend resources to individual students.
- Tutors can assign resource collections.
- Students can mark resources as completed.
- Recently viewed resources.
- Resource usage analytics.
- Personalized resource recommendations.

Do not implement Phase 3 features during the initial build unless the existing architecture makes them trivial.

---

## 14. Acceptance Criteria

The feature is ready for release when:

1. A Resources section appears in the main website navigation.
2. Students can access published resources available to them.
3. Administrators can upload supported documents.
4. Administrators can add articles, websites, videos, and written content.
5. Each resource supports a title, description, category, and appropriate content.
6. Resource cards display correctly across content types.
7. Clicking a card opens the correct resource detail experience.
8. Students can search and filter the resource library.
9. Administrators can create, edit, publish, unpublish, and delete resources.
10. Administrators can create and manage categories and tags.
11. Resources can be designated as featured.
12. Visibility settings are enforced.
13. Organization-specific content is isolated between organizations.
14. Students cannot access drafts or private resources.
15. The experience works on desktop and mobile.
16. Uploaded files are securely stored and accessible only to authorized users.

---

## 15. Instructions to Claude Code

Build this as a self-contained feature integrated into the existing Mathlete website.

Do not replace or restructure existing website sections.

Prioritize a polished, functional MVP rather than attempting to implement every future feature at once.

Before writing code:
1. Inspect the existing application architecture.
2. Identify how organizations, users, roles, and permissions currently work.
3. Identify existing file storage and upload capabilities.
4. Identify the current navigation and admin dashboard patterns.
5. Propose the implementation structure and database migrations.

Then implement Phase 1.

Ensure all database changes are migration-based, all permissions are enforced server-side, and all new components follow existing project conventions.

Do not introduce duplicate authentication, organization, or user systems.

At completion, provide:
- Summary of completed functionality.
- Database changes.
- New routes and components.
- Any environment variables or storage configuration required.
- Any functionality intentionally deferred to later phases.
- Instructions for testing the feature with administrator, tutor, and student accounts.

**Final product vision:** The Resources section should become Mathlete's curated library of the best ideas, tools, and materials for helping students become better at math, better at problem solving, and better at learning. It should be a living resource that grows as Mathlete grows.