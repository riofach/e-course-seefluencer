---
title: Change Proposal — Epic 8 Learning Zone UX Polish
date: 2026-03-11
status: approved-planning-update
related_documents:
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/ux-design-directions.html
  - _bmad-output/implementation-artifacts/sprint-status.yaml
---

# Change Proposal: Separate Learning Zone Polish from Epic 7 Public Zone Scope

## Decision Summary

Create a new planning epic after Epic 7 to cover learning-zone UX polish, starting with route `/courses/[slug]/lessons/[lessonId]`.

This change is intentionally a planning and tracking adjustment only. It does **not** introduce a new product capability, does **not** alter source code, and does **not** convert the lesson viewer into a public marketing surface.

## Why a New Epic Is Needed

Epic 7 is explicitly scoped to the **public zone** surface:

- `/`
- `/courses`
- `/courses/[slug]`
- `/pricing`

That scope aligns with reviewer-facing discovery and conversion surfaces. The lesson viewer route `/courses/[slug]/lessons/[lessonId]` belongs to the **learning/app zone**, which serves a different user mode and a different UX goal.

Keeping lesson viewer polish inside Epic 7 would blur an important product boundary:

- **Public zone:** expressive, persuasive, conversion-oriented
- **Learning zone:** focused, calm, utility-first, low distraction

Because the approved UX direction already defines this boundary clearly, the planning artifacts should mirror that separation.

## Boundary Clarification

### Public Zone

Applies to routes intended to attract, explain, and convert:

- `/`
- `/courses`
- `/courses/[slug]`
- `/pricing`

Expected characteristics:

- stronger editorial presentation
- gradient and marketing composition where appropriate
- persuasive CTA hierarchy
- reviewer-facing “stage” experience

## Learning Zone

Applies to routes intended to support active study:

- `/courses/[slug]/lessons/[lessonId]`

Expected characteristics:

- app-zone styling, not landing-zone styling
- low distraction layout
- strong content hierarchy
- persistent orientation via breadcrumb/sidebar/progress
- action clarity for completion and lesson-to-lesson movement
- ergonomic mobile behavior for long-form consumption

This follows the approved principle:

> **App is a Tool, Landing is a Stage**

## Why PRD Does Not Need to Change

The PRD already contains the necessary product intent:

- FR09–FR14 define the learning experience capability
- FR16 and FR25–FR29 distinguish public-facing pricing/landing behavior
- the PRD does not require lesson viewer to behave like a marketing surface

Therefore, this update is best handled in epics/tracking/planning interpretation rather than by modifying the PRD itself.

## FR Coverage Rationale for Epic 8

Epic 8 should cover the subset of learning FRs that are directly impacted by lesson-viewer route polish:

- **FR09** — lesson viewer content presentation is the primary route scope
- **FR10** — mark-as-complete feedback must remain coordinated with the polished interface
- **FR11** — progress visibility and visual hierarchy are part of the route-level UX refinement
- **FR12** — next/previous/sidebar navigation ergonomics are part of the same route experience

FR13 and FR14 are not included in the initial Epic 8 scope because the first story targets the core lesson viewer shell and interaction polish rather than quiz-specific experience refinement.

## Planning Outcome

The following planning updates are appropriate:

1. Add **Epic 8: Learning Zone UX Polish** to `epics.md`
2. Add initial story for lesson viewer polish on `/courses/[slug]/lessons/[lessonId]`
3. Add Epic 8 and Story 8.1 to `sprint-status.yaml` with `backlog` status
4. Leave PRD unchanged

## Recommended Follow-up

After this planning update, the next suitable step is to use the Create Story workflow/agent to generate the implementation-ready story artifact for **Story 8.1**.
