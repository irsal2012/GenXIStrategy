# Login Fix: Frontend ↔ Backend Connection

## What was broken
The React frontend was configured to call the backend with this axios base URL:

- `frontend/src/api/axios.js`: `baseURL: '/api/api/v1'`

But the FastAPI backend mounts routes at:

- `/api/v1/...` (see `backend/app/core/config.py` via `API_V1_STR=/api/v1` and `backend/app/main.py`)

And Vite proxies any request starting with `/api` to `http://localhost:8000` (see `frontend/vite.config.js`).

That extra `/api` meant login requests went to:

- `/api/api/v1/auth/login`  ❌ (404)

instead of:

- `/api/v1/auth/login` ✅

## The fix
Updated axios baseURL to `/api/v1`.

File changed:
- `frontend/src/api/axios.js`

## How to verify
1. Ensure backend is running on `http://localhost:8000`
   - `curl http://localhost:8000/health`

2. Verify login endpoint works:

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'username=admin@example.com' \
  --data-urlencode 'password=admin123'
```

3. Start frontend and login via UI:

```bash
./run_frontend.sh
```

Then log in with:
- `admin@example.com`
- `admin123`
