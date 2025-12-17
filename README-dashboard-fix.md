# Dashboard load fix

## What was broken
1. **Frontend auth calls were using plain `axios`** (no baseURL/proxy), which can cause login to hit the wrong origin depending on how the dev server is started.
2. **Backend SQLite schema was out-of-sync** with the `Initiative` model (`initiatives.ai_type` missing), causing `/api/v1/analytics/dashboard` to 500.

## Fixes applied
### Frontend
- **File:** `frontend/src/store/slices/authSlice.js`
- Updated `login` and `register` to use the shared `axiosInstance`.
  - This keeps dev/prod behavior consistent because `axiosInstance` uses `baseURL: '/api/v1'`.

### Backend
- **File:** `backend/app/core/database.py`
- Added a small SQLite-only schema sync block that **adds missing columns** to `initiatives` via `ALTER TABLE`.
  - This is a lightweight fallback in lieu of migrations and avoids dropping existing data.

### UX safeguard
- **File:** `frontend/src/pages/Dashboard.jsx`
- Dashboard now shows a friendly error instead of an infinite spinner if the API request fails.

## How to run
Backend:
```bash
cd backend
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Frontend:
```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

## Validate
1. Open http://127.0.0.1:5173
2. Login with the seeded dev user:
   - email: `admin@example.com`
   - password: `admin123`
3. Dashboard should render and `/api/v1/analytics/dashboard` should return **200**.
