---
title: Change Proposal — Story 7.5 Auth Entry Public Zone Alignment
date: 2026-03-11
status: approved-planning-update
related_documents:
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/implementation-artifacts/sprint-status.yaml
---

# Change Proposal: Add Story 7.5 for Login & Register Public Zone Alignment

## Decision Summary

Add a new planning story under **Epic 7: Public Zone Visual Alignment** to cover visual and layout alignment for the auth entry pages:

- `/login`
- `/register`

The new story is:

**Story 7.5: Login & Register Public Zone Alignment**

This is a planning-only update to close a discovered consistency gap between Epic 7 public surfaces and the existing auth entry routes. It does **not** introduce a new feature, does **not** change authentication behavior, and does **not** require a PRD update.

## Confirmed Audit Findings

The following implementation facts have already been verified:

- `/login` and `/register` live under `src/app/(auth)/...`
- `src/app/(auth)/layout.tsx` currently uses only a simple `bg-background` + centered container wrapper
- the auth layout does **not** use `PublicNavbarShell`
- `GlobalHeader` in the root layout is hidden only for routes that pass `shouldUsePublicNavbar(pathname)`
- `shouldUsePublicNavbar(pathname)` currently returns `true` only for `/`, `/courses*`, and `/pricing*`
- therefore `/login` and `/register` are not currently aligned to the shared Epic 7 public shell/navbar conventions
- this is a **public-zone alignment gap**, not a learning-zone issue

## Why This Belongs in Epic 7

Epic 7 is already responsible for aligning the premium public-facing experience across discovery and conversion surfaces.

Although authentication is part of Epic 1 functionally, this proposed update is **not** about auth capability. It is about ensuring the **entry pages into authentication** feel like a seamless continuation of the public journey rather than a disconnected legacy shell.

That makes Story 7.5 a visual consistency and shared-shell planning item under Epic 7, not a feature expansion of Epic 1.

## Scope of Story 7.5

### In Scope

- align `/login` and `/register` to the shared public-zone shell/navbar conventions established in Epic 7
- ensure the routes do not display the non-public/global app header
- align typography, spacing, surface treatment, and dark/light behavior with the public zone
- preserve clear responsive hierarchy across mobile and desktop
- keep these pages visually consistent with public discovery/conversion routes

### Out of Scope

- authentication logic
- validation rules
- redirect behavior
- server actions
- session handling
- callback URL logic
- toast behavior changes unrelated to visual alignment
- register/login form capability changes

## Why PRD Does Not Need to Change

The product intent already exists:

- Epic 1 covers authentication capability
- Epic 7 covers public-zone visual alignment

This proposal only clarifies where a known visual consistency gap should be planned and tracked. It does not add a new business requirement or user capability. Therefore, the correct update surface is **planning artifacts only**, not the PRD.

## Planning Outcome

The following planning updates are appropriate:

1. create a dedicated change proposal for Story 7.5
2. add **Story 7.5: Login & Register Public Zone Alignment** under Epic 7 in `epics.md`
3. add `7-5-login-and-register-public-zone-alignment: backlog` to `sprint-status.yaml`
4. keep PRD unchanged

## Recommended Follow-up

After this planning update, the next recommended step is for the Scrum Master / Story creation workflow to produce the implementation-ready story artifact for **Story 7.5**, including task breakdown and developer-ready handoff notes.
