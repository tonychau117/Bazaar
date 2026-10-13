import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from redis.exceptions import ConnectionError

from Bazaar.api import app


class ItemQueryTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.fields = {
            "buy_price": "2.5",
            "sell_price": "1.5",
            "buy_volume": "20",
            "sell_volume": "30",
            "buy_orders": "2",
            "sell_orders": "3",
        }

    def lookup(self, method, query):
        if method == "POST":
            return self.client.post("/items", content=query, headers={"Content-Type": "text/plain"})
        return self.client.get("/items/" + query)

    def test_normalized_lookup_for_both_methods(self):
        for method in ("GET", "POST"):
            for query in ("absolute ender pearl", "  Absolute   Ender Pearl  ", "ABSOLUTE_ENDER_PEARL"):
                with self.subTest(method=method, query=query):
                    with patch("Bazaar.api.redis_client.client.hgetall", return_value=self.fields) as cache, patch("Bazaar.api.requests.get") as upstream, patch("Bazaar.api.psycopg.connect") as database:
                        response = self.lookup(method, query)
                        self.assertEqual(response.status_code, 200)
                        self.assertEqual(response.json(), self.fields)
                        cache.assert_called_once_with("ABSOLUTE_ENDER_PEARL")
                        upstream.assert_not_called()
                        database.assert_not_called()

    def test_blank_query_is_rejected_before_cache_lookup(self):
        for method in ("GET", "POST"):
            with self.subTest(method=method), patch("Bazaar.api.redis_client.client.hgetall") as cache:
                self.assertEqual(self.lookup(method, "   ").status_code, 400)
                cache.assert_not_called()

    def test_unknown_item(self):
        for method in ("GET", "POST"):
            with self.subTest(method=method), patch("Bazaar.api.redis_client.client.hgetall", return_value={}):
                self.assertEqual(self.lookup(method, "unknown item").status_code, 404)

    def test_cache_unavailable(self):
        for method in ("GET", "POST"):
            with self.subTest(method=method), patch("Bazaar.api.redis_client.client.hgetall", side_effect=ConnectionError("connection failed")):
                response = self.lookup(method, "absolute ender pearl")
                self.assertEqual(response.status_code, 503)
                self.assertEqual(response.json()["detail"], "Redis cache unavailable")

    def test_invalid_post_body(self):
        for body in ({"query": "absolute ender pearl"}, 123, None, []):
            with self.subTest(body=body), patch("Bazaar.api.redis_client.client.hgetall") as cache:
                self.assertEqual(self.client.post("/items", json=body).status_code, 422)
                cache.assert_not_called()

    def test_missing_post_query(self):
        with patch("Bazaar.api.redis_client.client.hgetall") as cache:
            self.assertEqual(self.lookup("POST", "").status_code, 422)
            cache.assert_not_called()


if __name__ == "__main__":
    unittest.main()
