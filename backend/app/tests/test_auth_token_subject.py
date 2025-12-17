import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


def test_login_token_allows_access_to_protected_endpoint(client: TestClient):
    # Login using the known default admin.
    # (In development, startup seeding ensures this exists and password is admin123.)
    r = client.post(
        "/api/v1/auth/login",
        data={"username": "admin@example.com", "password": "admin123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert r.status_code == 200, r.text
    token = r.json()["access_token"]

    # Access a protected endpoint using Bearer token
    r2 = client.get(
        "/api/v1/analytics/dashboard",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r2.status_code == 200, r2.text
