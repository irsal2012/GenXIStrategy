# Manual test: PMI-CPMAI → Business Understanding → “Analyze & classify”

## Prereqs

- Frontend running on `http://localhost:3000`
- Backend running on `http://localhost:8000`
- Test user:
  - `admin@example.com`
  - `admin123`

## Steps

1. Open: `http://localhost:3000/pmi-cpmai/business-understanding`
2. Sign in with the test user.
3. In **Step 1 — Describe the business problem**, paste a paragraph of at least 30 characters.
4. Click **Analyze & classify**.

## Expected

- The button changes to **Analyzing…** and the page shows the loading bar.
- Within ~60s, you advance to **Step 2 — Confirm or change the AI pattern**.
- The **AI Pattern Classification** card shows:
  - `primary_pattern`
  - confidence
  - reasoning

## Failure visibility

If the request fails, you should see a red error alert on the page (never silent).
In dev tools console, you should also see a log entry starting with:

`[classify-pattern] failed`.

