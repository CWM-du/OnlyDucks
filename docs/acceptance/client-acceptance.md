# OnlyDucks — Client Acceptance Plan

**Release candidate:** PR #45 — `feat/onlyducks-three-column-feed`  
**Environment:** Vercel preview only; no production release is authorized by this plan.  
**Acceptance status:** Not started. The client must review the latest READY preview and record a decision.

## 1. Entry criteria

The formal client session may start only when all of the following are true:

- [ ] PR #45 head commit is identified and remains unmerged pending explicit approval.
- [ ] GitHub CI passes Prisma validation, clean-database migrations, lint, typecheck, unit tests and production build.
- [ ] Playwright Chromium E2E suite passes on the same head commit.
- [ ] Vercel preview for that exact commit is READY and accessible to the client.
- [ ] No open blocker or critical defect remains.
- [ ] Preview content and non-live integrations are clearly labelled.

## 2. Client test script

### A. Branding and visual consistency
- [ ] Confirm the product name is rendered as **OnlyDucks** on the homepage and profile.
- [ ] Confirm the marine-blue-on-white theme is legible and consistent.
- [ ] Switch to Electronic Dark and confirm contrast and component styling.
- [ ] Navigate between homepage and profile; confirm the selected theme persists.
- [ ] Confirm the profile avatar and display name are reflected in the homepage profile panel after saving.

### B. Responsive layout
Review at representative widths:
- [ ] Mobile: 390 × 844 — navigation, feed cards, panels and bottom navigation remain usable; no horizontal overflow.
- [ ] Tablet: 768 × 900 — columns reflow without clipping or overlap.
- [ ] Desktop: 1280 × 900 — left navigation, central feed and right information panel are visible and balanced.
- [ ] Keyboard focus is visible; links, buttons and form controls can be reached and operated.
- [ ] Text remains readable at browser zoom 200%.

### C. Functional routes and profile
- [ ] Open the primary destinations: Feed, Roadmap, Mentors, Agent, Profile and Welcome.
- [ ] Upload a valid PNG/JPG/WebP avatar up to 1 MB; verify preview and save.
- [ ] Reload Profile and verify the locally saved profile remains available in the same browser.
- [ ] Try an unsupported or oversized avatar and confirm an error is communicated.
- [ ] Clear the profile and confirm the local data is removed.
- [ ] Confirm the profile-local-storage notice is understood.

### D. Content and integration boundaries
- [ ] Confirm sample posts, trends, jobs and mentor material are identified as preview/demo content.
- [ ] Confirm no preview control implies a live API, real job listing, real mentor availability or authenticated account.
- [ ] Confirm Oscar API, SSO, analytics and production persistence are not represented as complete.
- [ ] Record any content, privacy, consent or attribution changes required before pilot use.

## 3. Defect severity and disposition

| Severity | Definition | Acceptance rule |
| --- | --- | --- |
| Blocker | Prevents core review, exposes data, or makes the preview unavailable | Must be fixed before acceptance |
| Critical | Core route, navigation, theme, profile save or responsive use is broken | Must be fixed before acceptance |
| Major | Significant visual, usability or accessibility issue with a workaround | Fix or obtain written client waiver |
| Minor | Cosmetic issue with limited impact | May be accepted into a tracked follow-up |

Every defect should include: ID, route, viewport, theme, reproduction steps, expected result, actual result, severity, evidence, owner and disposition.

## 4. Acceptance record

**Client / representative:** ____________________  
**Review date:** ____________________  
**Preview URL and commit SHA:** ____________________  
**Decision:** [ ] Accepted  [ ] Accepted with listed waivers  [ ] Rejected / rework required

**Outstanding defects and agreed waivers:**

| ID | Severity | Description | Owner | Due date | Waiver / disposition |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

**Client comments:**  
____________________________________________________________

**Client sign-off:** ____________________  
**Project sign-off:** ____________________

## 5. Explicit exclusions and release controls

This acceptance cycle covers the frontend preview and its documented local/demo behaviour only. It does not certify SSO, Oscar's API, production data persistence, analytics, legal/privacy approval, production infrastructure or operational readiness.

Oscar / the designated owners must separately complete the API contract and integration, identity configuration, approved content/analytics sources, production storage and final host deployment. Production deployment and PR merge remain blocked until the user gives explicit approval.
