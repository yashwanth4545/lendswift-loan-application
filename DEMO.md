# LendSwift — Demo Script (~8 minutes)

Use this script for a screen recording or live walkthrough.  
**Live URL:** https://lendswift-loan-application.netlify.app

## Automated demo video (no voiceover)

An automated walkthrough with on-screen captions can be generated locally:

```powershell
powershell -ExecutionPolicy Bypass -File .\record-demo.ps1
```

Output: **`demo/lendswift-demo.mp4`** (~1–2 min, all 8 steps + success modal).

For a narrated submission video, play this recording and add voiceover in any editor, or record yourself following the steps below.

## Before you start

- Open the live URL in Chrome (1280×800 or mobile 390×844)
- Clear site data once: DevTools → Application → Local Storage → Clear (shows fresh wizard)
- Have test data handy (below)

## Test data (Personal loan — fastest path)

| Field | Value |
|-------|-------|
| Loan type | Personal |
| Amount | ₹3,00,000 |
| Tenure | 36 months |
| Purpose | Medical |
| Full name | Rajesh Kumar |
| DOB | 1990-06-15 |
| Gender | Male |
| Email | rajesh.kumar@example.com |
| Mobile | 9876543210 |
| PAN | ABCPK1234L |
| Aadhaar | 234567890126 |
| PIN | 560001 |
| Residence | Rented, ₹18,000/month |
| Employment | Salaried @ Infosys, ₹85,000/month |

---

## 1. Introduction (30 sec)

> “This is LendSwift’s rebuilt 8-step loan application. The old form had a 55% drop-off rate — this version adds auto-save, cross-step validation, document upload, e-signature, and full accessibility support.”

- Point out **journey path** animation and **step progress**
- Press **Tab** once — show **“Skip to application form”** skip link (Day 14 a11y)

## 2. Step 1 — Loan type (45 sec)

- Select **Personal Loan**, amount **₹3,00,000**, tenure **36 months**, purpose **Medical**
- Click **Next**
- Mention: tenure options filter by age from Step 2 DOB (cross-step sync)

## 3. Step 2 — Personal info (45 sec)

- Fill name, DOB, gender, parents, email, mobile
- Blur validation — show error if email invalid, then fix
- **Next**

## 4. Step 3 — KYC (1 min)

- Enter PAN `ABCPK1234L` → wait for **verification spinner → green check**
- Enter Aadhaar `234567890126` → verify
- Check **consent** checkbox (required)
- **Next**

## 5. Step 4 — Address (1 min)

- Address lines, PIN **560001** → **auto-fill city/state**
- Residence **Rented**, rent **₹18,000**
- Toggle **Same as permanent** off briefly to show permanent section, then back on
- **Next**

## 6. Step 5 — Employment (45 sec)

- **Salaried** → company, designation, salary, experience
- Note EMI affordability uses salary minus rent (cross-step)
- **Next**

## 7. Step 6 — Co-applicant (15 sec)

- Personal loan under ₹5L — step shows **“No co-applicant required”**
- **Next** (or mention Home loan > ₹25L triggers co-applicant)

## 8. Step 7 — Documents & signature (1.5 min)

- Upload required docs (PDF/JPG under 5MB)
- Draw signature on pad → **Save signature**
- Mention encrypted local vault + compression for images
- **Next**

## 9. Step 8 — Review & submit (1 min)

- Scroll review sections — data from all steps
- **EMI breakdown** card flip animation
- Check all **consent** boxes
- **Submit application**
- **Success modal** with reference number + confetti/particles

## 10. Auto-save demo (45 sec) — optional encore

- Refresh mid-flow or open in new tab
- **Resume draft** modal appears
- Continue from saved step

## 11. Technical highlights (30 sec) — for assessors

| Area | Detail |
|------|--------|
| Stack | React 18, Vite, TypeScript, RHF + Zod, Tailwind, Framer Motion |
| Tests | 37 Cypress E2E tests + axe accessibility spec |
| Deploy | Netlify — SPA redirects in `netlify.toml` |
| A11y | WCAG-oriented: skip link, live regions, focus management, reduced motion |

---

## Quick alt demos

**Home loan + co-applicant:** use fixture `cypress/fixtures/valid-home-loan.json` values  
**Business loan:** `valid-business-loan.json` — GST field, business employment form

## Run automated tests (for Q&A)

```powershell
cd D:\Cursor-Files\loan-application
powershell -ExecutionPolicy Bypass -File .\test-e2e.ps1
```

Expected: **37 passing** tests across 11 specs.
