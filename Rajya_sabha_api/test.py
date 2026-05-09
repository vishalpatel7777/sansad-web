"""
Rajya Sabha API — Integration & Unit Test Suite
================================================
Requires:
  - A running FastAPI server at http://127.0.0.1:8000  (start with: uvicorn main:app)
  - A live MySQL connection configured in config.py / .env
  - httpx installed (listed in requirements.txt)

Run:  python test.py
"""

import unittest
import httpx

BASE_URL = "http://127.0.0.1:8000"
VALID_KEY = "321"          # default key from config.py
INVALID_KEY = "wrong-key"


def auth_headers(key=VALID_KEY):
    return {"x-api-key": key}


# ─────────────────────────────────────────────
# 1. DATABASE CONNECTIVITY
# ─────────────────────────────────────────────
class TestDatabaseConnectivity(unittest.TestCase):
    """Direct database-layer tests (no HTTP server required)."""

    def test_db_connection_succeeds(self):
        from database import get_database_connection, close_connection
        conn = get_database_connection()
        self.assertIsNotNone(conn, "get_database_connection() returned None")
        close_connection(conn)

    def test_members_table_is_populated(self):
        from database import get_database_connection, close_connection
        conn = get_database_connection()
        if conn is None:
            self.skipTest("Database not available")
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM members")
        count = cursor.fetchone()[0]
        self.assertGreater(count, 0, "members table is empty")
        cursor.close()
        close_connection(conn)

    def test_all_api_tables_exist(self):
        """All 14 tables that back API endpoints must be present."""
        from database import get_database_connection, close_connection
        conn = get_database_connection()
        if conn is None:
            self.skipTest("Database not available")
        cursor = conn.cursor()
        cursor.execute("SHOW TABLES")
        tables = {row[0] for row in cursor.fetchall()}
        required = {
            "members", "member_attendance", "member_bills", "member_committees",
            "member_dashboard", "member_debates", "member_other_details",
            "member_personal_details", "member_questions", "member_special_mentions",
            "mp_tour", "assurance", "education_levels", "gallery",
        }
        missing = required - tables
        self.assertEqual(missing, set(), f"Missing tables: {missing}")
        cursor.close()
        close_connection(conn)


# ─────────────────────────────────────────────
# 2. PUBLIC ENDPOINTS (no auth required)
# ─────────────────────────────────────────────
class TestPublicEndpoints(unittest.TestCase):

    def test_root_returns_200(self):
        r = httpx.get(f"{BASE_URL}/")
        self.assertEqual(r.status_code, 200)
        self.assertIn("message", r.json())

    def test_health_returns_healthy(self):
        r = httpx.get(f"{BASE_URL}/health")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json().get("status"), "healthy")

    def test_proxy_image_no_auth_needed(self):
        """proxy/image must be accessible without an API key."""
        url = "https://via.placeholder.com/50"
        r = httpx.get(f"{BASE_URL}/proxy/image", params={"url": url})
        self.assertNotEqual(r.status_code, 401)


# ─────────────────────────────────────────────
# 3. AUTHENTICATION
# ─────────────────────────────────────────────
class TestAuthentication(unittest.TestCase):

    def test_valid_key_returns_200(self):
        r = httpx.get(f"{BASE_URL}/members", headers=auth_headers(VALID_KEY))
        self.assertEqual(r.status_code, 200, r.text)

    def test_missing_key_returns_401(self):
        r = httpx.get(f"{BASE_URL}/members")
        self.assertEqual(r.status_code, 401)
        self.assertIn("detail", r.json())

    def test_invalid_key_returns_401(self):
        r = httpx.get(f"{BASE_URL}/members", headers=auth_headers(INVALID_KEY))
        self.assertEqual(r.status_code, 401)
        self.assertIn("Invalid", r.json().get("detail", ""))

    def test_invalid_key_on_debates_endpoint(self):
        r = httpx.get(
            f"{BASE_URL}/member-debates",
            params={"srno": 1},
            headers=auth_headers(INVALID_KEY),
        )
        self.assertEqual(r.status_code, 401)


# ─────────────────────────────────────────────
# 4. MEMBER LISTING AND PAGINATION
# ─────────────────────────────────────────────
class TestMemberListing(unittest.TestCase):

    def test_response_structure(self):
        r = httpx.get(f"{BASE_URL}/members", headers=auth_headers())
        self.assertEqual(r.status_code, 200)
        body = r.json()
        for key in ("total", "page", "data"):
            self.assertIn(key, body)
        self.assertIsInstance(body["data"], list)

    def test_default_limit_is_50(self):
        r = httpx.get(f"{BASE_URL}/members", headers=auth_headers())
        self.assertLessEqual(len(r.json()["data"]), 50)

    def test_limit_parameter(self):
        r = httpx.get(
            f"{BASE_URL}/members",
            params={"page": 1, "limit": 10},
            headers=auth_headers(),
        )
        self.assertEqual(r.status_code, 200)
        self.assertLessEqual(len(r.json()["data"]), 10)

    def test_page_2_differs_from_page_1(self):
        r1 = httpx.get(f"{BASE_URL}/members", params={"page": 1, "limit": 5}, headers=auth_headers())
        r2 = httpx.get(f"{BASE_URL}/members", params={"page": 2, "limit": 5}, headers=auth_headers())
        if r1.status_code == 200 and r2.status_code == 200:
            ids1 = {m["srno"] for m in r1.json()["data"]}
            ids2 = {m["srno"] for m in r2.json()["data"]}
            self.assertEqual(ids1 & ids2, set(), "Pages 1 and 2 share the same members")


# ─────────────────────────────────────────────
# 5. SINGLE MEMBER RETRIEVAL
# ─────────────────────────────────────────────
class TestMemberDetail(unittest.TestCase):

    def _first_srno(self):
        r = httpx.get(f"{BASE_URL}/members", params={"page": 1, "limit": 1}, headers=auth_headers())
        data = r.json().get("data", [])
        if not data:
            self.skipTest("No members in database")
        return data[0]["srno"]

    def test_valid_srno_returns_200(self):
        srno = self._first_srno()
        r = httpx.get(f"{BASE_URL}/members/{srno}", headers=auth_headers())
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json().get("srno"), srno)

    def test_nonexistent_srno_returns_404(self):
        r = httpx.get(f"{BASE_URL}/members/9999999", headers=auth_headers())
        self.assertEqual(r.status_code, 404)
        self.assertIn("detail", r.json())


# ─────────────────────────────────────────────
# 6. FETCH-TABLE ENDPOINTS
# ─────────────────────────────────────────────
class TestFetchTableEndpoints(unittest.TestCase):

    ENDPOINTS = [
        "/assurance", "/education-levels", "/gallery",
        "/member-attendance", "/member-bills", "/member-committees",
        "/member-dashboard", "/member-debates", "/member-other-details",
        "/member-personal-details", "/member-questions",
        "/member-special-mentions", "/mp-tour",
    ]

    def _first_srno(self):
        r = httpx.get(f"{BASE_URL}/members", params={"page": 1, "limit": 1}, headers=auth_headers())
        data = r.json().get("data", [])
        if not data:
            self.skipTest("No members in database")
        return data[0]["srno"]

    def test_all_endpoints_return_200(self):
        srno = self._first_srno()
        for ep in self.ENDPOINTS:
            with self.subTest(endpoint=ep):
                r = httpx.get(
                    f"{BASE_URL}{ep}",
                    params={"srno": srno},
                    headers=auth_headers(),
                )
                self.assertEqual(r.status_code, 200, f"{ep} → {r.status_code}: {r.text[:200]}")

    def test_all_endpoints_return_count_and_data(self):
        srno = self._first_srno()
        for ep in self.ENDPOINTS:
            with self.subTest(endpoint=ep):
                r = httpx.get(f"{BASE_URL}{ep}", params={"srno": srno}, headers=auth_headers())
                if r.status_code == 200:
                    body = r.json()
                    self.assertIn("count", body, f"{ep} missing 'count'")
                    self.assertIn("data", body, f"{ep} missing 'data'")
                    self.assertIsInstance(body["data"], list)

    def test_education_levels_no_srno_required(self):
        r = httpx.get(f"{BASE_URL}/education-levels", headers=auth_headers())
        self.assertEqual(r.status_code, 200)
        self.assertIn("data", r.json())


# ─────────────────────────────────────────────
# 7. RATE LIMITING
# ─────────────────────────────────────────────
class TestRateLimiting(unittest.TestCase):

    def test_single_request_not_rate_limited(self):
        """A single request to /members must not return HTTP 429."""
        r = httpx.get(f"{BASE_URL}/members", headers=auth_headers())
        self.assertNotEqual(r.status_code, 429)

    @unittest.skip("Sends 101 requests — run manually to verify HTTP 429 enforcement.")
    def test_429_after_100_requests(self):
        """Send 101 requests; the 101st must return HTTP 429."""
        for _ in range(101):
            r = httpx.get(f"{BASE_URL}/members", headers=auth_headers())
            if r.status_code == 429:
                return
        self.fail("HTTP 429 was never returned after 101 requests")


# ─────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────
if __name__ == "__main__":
    unittest.main(verbosity=2)
