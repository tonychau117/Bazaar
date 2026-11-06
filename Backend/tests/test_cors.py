import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from Bazaar.api import app


class CorsTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_frontend_preflight(self):
        for origin in ("http://localhost:5173", "http://127.0.0.1:5173"):
            with self.subTest(origin=origin):
                response = self.client.options("/items", headers={
                    "Origin": origin,
                    "Access-Control-Request-Method": "POST",
                    "Access-Control-Request-Headers": "Content-Type",
                })
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.headers["access-control-allow-origin"], origin)

    def test_item_response_allows_frontend(self):
        with patch("Bazaar.api.redis_client.client.hgetall", return_value={"buy_price": "2.5"}):
            response = self.client.get("/items/ENCHANTED_DIAMOND", headers={"Origin": "http://localhost:5173"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers["access-control-allow-origin"], "http://localhost:5173")

    def test_unlisted_origin_is_not_allowed(self):
        response = self.client.options("/items", headers={
            "Origin": "https://unlisted.example",
            "Access-Control-Request-Method": "POST",
        })
        self.assertEqual(response.status_code, 400)
        self.assertNotIn("access-control-allow-origin", response.headers)


if __name__ == "__main__":
    unittest.main()
