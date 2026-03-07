# /plan — work plan template (epic/feature)

Use this template for all plans in the repository: epics, large features, weekly plans.  
The goal is to make plans “executable”: you can copy them into a task tracker, assign to juniors, and accept work against explicit criteria.

---

# <Plan title>

**ID:** `<EPIC-XX | FEAT-XX | WEEK-XX>`  
**Priority:** `P0 | P1 | P2`  
**Status:** `draft | ready | in_progress | blocked | done`  
**Owner:** `<name/role>`  
**PRD/RFC reference:** `<path:line or section>`

## 1) Objective (Outcome)
One paragraph: the measurable user/product outcome that should exist after completion.

## 2) Context
- Why it matters now (1–3 bullets).
- Which problems/hypotheses it addresses.

## 3) Scope
**In scope:**
- …

**Out of scope (explicit non-goals):**
- …

## 4) Deliverables
What should remain in the repo/product afterwards (screens, modules, schemas, tests, docs).

## 5) Dependencies
- Technical: …
- Product/design: …
- Data/tools: …

## 6) Work breakdown (junior-friendly tasks)
Rules:
- Each task should be at most 0.5–2 days for a junior (prefer 1–4 hours).
- Each task has **Acceptance criteria** and **Definition of Done (DoD)**.
- If there is a risk of “unclear how to do this”, add an explicit “how to verify” step.

### T1. <Short title>
**Description:** …  
**Steps:**
1) …
2) …
**Acceptance criteria:**
- …
**DoD (done when):**
- …
**Estimate:** `<S=1–2h | M=0.5d | L=1d | XL=2d>`  
**Risks/notes:** …

### T2. …

## 7) Testing and QA
- Unit: …
- Integration: …
- E2E: …
- Manual checklist: …

## 8) Metrics / Events (if applicable)
- What events/logs are added.
- How to compute the metric (minimally).

## 9) Risks and mitigations
- …

## 10) Open questions
- …

