# Manual Test: AI Go/No-Go (9-factor gate)

### Trustworthy AI (Five Layers) visibility

- Navigate to **Phase 1: Business Understanding** for an initiative.
- In **AI Go/No-Go (9-factor gate)**, verify the **Trustworthy AI** category renders **five** items:
  1. Ethical AI
  2. Responsible AI
  3. Transparent AI
  4. Governed AI
  5. Explainable AI
- If the backend assessment payload is missing these layers, the UI should still display them with default **Cautious** status so users can override and save.

## Prereqs
- Backend running
- Frontend running
- You have an initiative with an existing Business Understanding record.

## Steps
1. Navigate to **AI Projects → Phase 1: Business Understanding** for an initiative.
2. Find the section **“AI Go/No-Go (9-factor gate)”**.
3. Click **“Generate AI Go/No-Go”**.
   - Expected: Overall status + score appear.
   - Expected: 9 factors appear grouped into 3 categories.
4. Change a factor using the **Override** dropdown.
   - Expected: the factor chip changes color immediately.
5. Click **“Save assessment”**.
   - Expected: no error; refresh page; assessment should still be present.

## Notes
- This assessment is a *suggestion only* and does **not** automatically change the phase governance **Go/No-Go Decision**.
- Backend recomputes the overall rollup when saving.
