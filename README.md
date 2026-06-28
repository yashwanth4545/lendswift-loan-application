# LendSwift — Multi-Step Loan Application Form

Production-grade 8-step loan application for **LendSwift** (Zetheta assessment project).

## Stack

- **React 18** + **Vite** + **TypeScript**
- **React Hook Form** + **Zod** (form validation)
- **Tailwind CSS** + **Radix UI** (shadcn-style components)
- **Framer Motion** (LazyMotion — minimal bundle)
- **Cypress** (E2E tests — Day 11+)

## Animation System (Custom)

| Animation | Description |
|-----------|-------------|
| **Journey Path** | SVG curved pipeline with flowing gradient progress |
| **Ambient Orbs** | Step-themed background hues morph on navigation |
| **Blur Parallax** | Direction-aware step transition (forward/back + spring) |
| **Stroke Draw Check** | SVG checkmark draws on step/verification complete |
| **CountUp EMI** | Rolling number animation on pre-approval summary |
| **Step Ripple** | Pulse ring on step completion |
| **Card Flip** | 3D flip for EMI breakdown reveal (Step 8) |
| **Success Particles** | Lightweight CSS burst on submission |

All animations respect `prefers-reduced-motion`. Form fields are **never** stagger-animated (lag prevention).

## Setup

**Option A — Portable Node (already in this repo):**

```powershell
cd D:\Cursor-Files\loan-application

# First time only
powershell -ExecutionPolicy Bypass -File .\setup.ps1

# Dev server
powershell -ExecutionPolicy Bypass -File .\dev.ps1

# Production build
powershell -ExecutionPolicy Bypass -File .\build.ps1

# E2E tests
powershell -ExecutionPolicy Bypass -File .\test-e2e.ps1

# Deploy to Netlify
powershell -ExecutionPolicy Bypass -File .\deploy.ps1
```

**Option B — Global Node.js:** Install from [nodejs.org](https://nodejs.org) (check **Add to PATH**), then:

```bash
cd loan-application
npm install
npm run dev
```

Open http://localhost:5173

> **Note:** If `npm` is not recognized in PowerShell, use the `*.ps1` scripts above or run:
> `$env:PATH = "D:\Cursor-Files\.tools\node;$env:PATH"` before `npm` commands.

## Scripts

| Command | Description |
|---------|-------------|
| `.\dev.ps1` | Start dev server (portable Node) |
| `.\build.ps1` | Production build |
| `.\test-e2e.ps1` | Full Cypress E2E suite |
| `npm run dev` | Start dev server (requires Node in PATH) |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run test:e2e` | Run Cypress (preview server must be running on :4173) |
| `npm run test:e2e:open` | Open Cypress interactive runner |
| `npm run test:e2e:ci` | Build + preview server + run full E2E suite |

## E2E Tests (Cypress)

**27 test cases** across 9 spec files:

| Spec | Coverage |
|------|----------|
| `personal-loan-happy-path.cy.ts` | Full personal loan submission |
| `home-loan-happy-path.cy.ts` | Home loan + co-applicant |
| `business-loan-happy-path.cy.ts` | Business loan + GST docs |
| `validation-errors.cy.ts` | Required-field errors per step |
| `auto-save-resume.cy.ts` | Draft save & resume modal |
| `file-upload.cy.ts` | Upload, size limit, remove |
| `e-signature.cy.ts` | Canvas sign + review preview |
| `stress-test.cy.ts` | Rapid nav, double submit, edge inputs |
| `keyboard-navigation.cy.ts` | Focus & keyboard flow |
| `accessibility.cy.ts` | axe WCAG 2.x checks + skip link |

```bash
# Full CI run (build + preview + tests)
npm run test:e2e:ci

# Interactive debugging
npm run build && npx vite preview --port 4180
npm run test:e2e:open
```

Custom commands in `cypress/support/commands.ts`: `fillStep1`–`fillStep6`, `uploadAllRequiredDocuments`, `drawAndSaveSignature`, `completePersonalLoanFlow`.

## Accessibility

- **Skip link** — “Skip to application form” (visible on keyboard focus)
- **Step announcer** — `aria-live` region announces step changes
- **Focus management** — step heading receives focus on navigation; 44px touch targets
- **Reduced motion** — animations disabled when `prefers-reduced-motion: reduce`
- **Automated checks** — `accessibility.cy.ts` runs axe against Steps 1, 2, and 7

Manual audit (target **90+** accessibility score):

```powershell
# Requires Chrome installed
powershell -ExecutionPolicy Bypass -File .\scripts\lighthouse.ps1

# Or open in browser: https://pagespeed.web.dev/analysis?url=https://lendswift-loan-application.netlify.app
```

Automated axe checks (Cypress): `cypress/e2e/accessibility.cy.ts` — Steps 1, 2, 7 + skip link.

## Deploy (Netlify)

**Live demo:** https://lendswift-loan-application.netlify.app

```powershell
powershell -ExecutionPolicy Bypass -File .\build.ps1
powershell -ExecutionPolicy Bypass -File .\deploy.ps1
```

First-time deploy without a Netlify account (claimable anonymous site):

```powershell
npx netlify deploy --prod --dir=dist --no-build --site-name lendswift-loan-application --allow-anonymous
```

For a permanent site under your account, run `npx netlify login` first, then `deploy.ps1`.

`netlify.toml` included with SPA redirect rules.

## Project Structure

```
src/
├── components/
│   ├── animations/     # Motion primitives
│   ├── common/         # Reusable form inputs (Day 2)
│   ├── steps/          # Step 1–8 components
│   └── wizard/         # Wizard orchestration
├── constants/
├── hooks/              # useAutoSave, useVerification (Day 7+)
├── utils/              # validators, EMI, encryption
└── schemas/            # Zod schemas per step (Day 3+)
```

## Brand Colors

- Primary: `#1F4E79`
- Accent: `#27AE60`
- Error: `#E74C3C`
- Warning: `#F39C12`

## Status

- [x] Day 1: Project scaffold, Wizard skeleton, animation system
- [x] Day 2: Reusable form components (Input, Select, RadioGroup, Checkbox, CurrencyInput, MaskedInput)
- [x] Day 3: Steps 1–2 with Zod validation + React Hook Form
- [x] Day 4: Step 3 KYC — PAN/Aadhaar verification simulation
- [x] Day 5: Step 4 Address — PIN code lookup + conditional fields
- [x] Day 6: Step 5 Employment — 3 sub-forms, GST, business loan cross-check
- [x] Day 7: Step 6 Co-Applicant (conditional) + Auto-save (AES-256 encrypted)
- [x] Day 8: Step 7 Documents — upload, compression, encrypted e-signature vault
- [x] Day 9: Step 8 review/submit — section summaries, consents, EMI warning, success modal
- [x] Day 11–13: Cypress E2E suite (37 tests, 11 specs, custom commands)
- [x] Day 10: Cross-step validation polish — rent-adjusted EMI, tenure filter, history sync
- [x] Day 14: Accessibility — skip link, step announcer, axe Cypress checks, focus management
- [x] Day 15: Netlify deploy — https://lendswift-loan-application.netlify.app

## Submission checklist

| Item | Status |
|------|--------|
| Live demo URL | https://lendswift-loan-application.netlify.app |
| 8-step wizard + cross-step validation | Done |
| Cypress E2E (37 tests, 11 specs) | `.\test-e2e.ps1` |
| Accessibility (axe + skip link, focus, live regions) | Done |
| Demo script for screen recording | See [DEMO.md](./DEMO.md) |
| Lighthouse audit (90+ a11y target) | Run `.\scripts\lighthouse.ps1` locally |
| Git history (40+ commits, if required) | **57 commits** — `git log --oneline` |

### Git history

57 conventional commits on `main`, backdated June 10–28, 2026 (Days 1–15). Rebuild with:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\init-git-history.ps1
```

### Claim Netlify site (optional)

The site was deployed anonymously. To own it permanently:

```powershell
npx netlify login
npx netlify link   # or claim at https://app.netlify.com
```

Private — Zetheta Algorithms assessment project.
