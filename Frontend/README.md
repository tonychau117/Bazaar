# Bazaar frontend

A small React + TypeScript app built with Vite. It uses React Router for two pages, browser `fetch` for the API, and plain CSS for styling.

- `/items`: centered item search.
- `/items/{query}`: cached prices, volumes, order counts, and margin. For example, searching `recombobulator 3000` opens `/items/RECOMBOBULATOR_3000`.
- `/` redirects to `/items`.

## Run locally

Use Node.js 22.12+ (or a newer supported LTS) and Python 3.12+. From the repository root, start the databases:

```sh
docker compose up -d
```

Using your Python environment with `fastapi[standard]`, `psycopg[binary]`, `redis`, and `requests` installed, initialize the table and start FastAPI:

```sh
cd Backend/Database
python create_tables.py
cd ..
python -m uvicorn Bazaar.api:app --reload --port 8000
```

In another terminal, from the repository root:

```sh
cd Frontend
npm ci
npm run dev
```

Open `http://localhost:5173/items`. Both development and preview use port 5173 and fail if that port is already occupied.

## Where prices come from

The frontend reads the existing FastAPI `GET /items/{query}` endpoint, which returns Redis hash values as strings. It accepts spaces or underscores and ignores case. The frontend never connects directly to Redis or PostgreSQL.

Populate or refresh the cache by calling the **backend** refresh endpoint once, after the databases and table are ready:

```sh
curl --fail http://localhost:8000/items
```

This contacts Hypixel and writes to both PostgreSQL and Redis. An empty cache produces a helpful “No cached item found” message in the frontend. The search page does not trigger a full market refresh. Prices are cached snapshots, not a live stream.

The card follows the supplied reference: blue item name, gray background, and labeled prices and volumes. Margin is `buy_price - sell_price`; the percentage divides that margin by `sell_price`. It excludes fees and displays a dash for the percentage if the sell price is zero. The decorative symbol is a placeholder, not an item-specific game texture.

## API URL and CORS

The API defaults to `http://localhost:8000`. To change it, copy `.env.example` to `.env.local`, set `VITE_API_URL`, and restart Vite (or rebuild for production). The URL must be reachable from the user's browser.

FastAPI's `CORSMiddleware` allows `http://localhost:5173` and `http://127.0.0.1:5173` by default. It permits GET, POST, and the Content-Type header. Set the backend's `CORS_ORIGINS` environment variable to a comma-separated list of frontend origins when deploying, then restart FastAPI. Origins include the scheme and optional port, but no path.

For example: `CORS_ORIGINS=https://bazaar.example.com`. This is independent of `VITE_API_URL`, which points to the backend. No Vite proxy is used; the browser calls FastAPI through CORS.

## Checks and deployment

```sh
npm run build
```

This checks TypeScript and creates `dist/`. Use `npm run preview` to inspect the build locally after stopping the dev server. For production, configure the frontend host to serve `index.html` for `/items` and `/items/*` so direct links and page reloads work.

Run backend endpoint and CORS tests from the repository root:

```sh
PYTHONDONTWRITEBYTECODE=1 PYTHONPATH=Backend python -m unittest discover -s Backend/tests -v
```

These backend tests mock Redis; running the browser against FastAPI also requires Redis and cached item data.
