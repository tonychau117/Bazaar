import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { getItem } from './api';
import type { ItemPrices } from './api';

// Keep product IDs in the URL consistent with the keys used by Redis.
function productId(query: string) {
  return query.trim().split(/\s+/).join('_').toUpperCase();
}

function itemName(query: string) {
  return query.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value).toLowerCase();
}

function SearchForm({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = productId(query);
    if (id) navigate(`/items/${encodeURIComponent(id)}`);
  }

  return (
    <form className="search-form" onSubmit={search} role="search">
      <label className="sr-only" htmlFor="item-query">Item name</label>
      <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
      <input
        id="item-query"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search an item, e.g. Recombobulator 3000"
        autoComplete="off"
        required
      />
      <button type="submit" disabled={!query.trim()}>Search <span aria-hidden="true">→</span></button>
    </form>
  );
}

function SearchPage() {
  return (
    <main className="search-page">
      <div className="search-content">
        <p className="eyebrow">SKYBLOCK BAZAAR</p>
        <h1>Every item. A better trade.</h1>
        <p className="intro">Find an item’s prices, trading volumes, and spread.</p>
        <SearchForm />
        <p className="search-hint">Try <Link to="/items/RECOMBOBULATOR_3000">Recombobulator 3000</Link> or <Link to="/items/ENCHANTED_DIAMOND">Enchanted Diamond</Link></p>
      </div>
    </main>
  );
}

function ItemCard({ query, item }: { query: string; item: ItemPrices }) {
  const buyPrice = Number(item.buy_price);
  const sellPrice = Number(item.sell_price);
  const margin = buyPrice - sellPrice;
  const marginPercent = sellPrice > 0 ? `${(margin / sellPrice * 100).toFixed(1)}%` : '—';

  return (
    <article className="item-card">
      <div className="item-heading">
        <div>
          <h2>{itemName(query)}</h2>
          <p className="product-id">{productId(query)}</p>
        </div>
        <span className="item-symbol" aria-hidden="true">✦</span>
      </div>
      <dl className="item-stats">
        <div><dt>Buy Order Price</dt><dd>{formatNumber(buyPrice)} <span className="unit">coins</span></dd></div>
        <div><dt>Sell Order Price</dt><dd>{formatNumber(sellPrice)} <span className="unit">coins</span></dd></div>
        <div><dt>Buy Volume</dt><dd>{formatNumber(Number(item.buy_volume))}</dd></div>
        <div><dt>Sell Volume</dt><dd>{formatNumber(Number(item.sell_volume))}</dd></div>
        <div><dt>Buy Orders</dt><dd>{formatNumber(Number(item.buy_orders))}</dd></div>
        <div><dt>Sell Orders</dt><dd>{formatNumber(Number(item.sell_orders))}</dd></div>
        <div className="margin-row"><dt>Margin</dt><dd>{formatNumber(margin)} <span className="percentage">({marginPercent})</span></dd></div>
      </dl>
      <p className="card-note">Margin = buy order price − sell order price. Before fees.</p>
    </article>
  );
}

function ItemPage() {
  const { query = '' } = useParams();
  const [item, setItem] = useState<ItemPrices | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setItem(null);
    setError('');
    getItem(query, controller.signal)
      .then(setItem)
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        if (reason instanceof TypeError) {
          setError('Could not connect to the price service. Please try again.');
        } else if (reason instanceof Error) {
          setError(reason.message);
        } else {
          setError('Unable to load this item.');
        }
      });
    return () => controller.abort();
  }, [query]);

  return (
    <main className="results-page">
      <Link className="back-link" to="/items">← Back to search</Link>
      <h1>Bazaar Results</h1>
      <p className="intro">Current cached Bazaar pricing and spreads.</p>
      <SearchForm key={query} initialQuery={itemName(query)} />
      <div className="results-content">
        {!item && !error && <p className="status-message" role="status">Loading item prices…</p>}
        {error && (
          <div className="status-message error" role="alert">
            <h2>Couldn’t load this item</h2>
            <p>{error}</p>
          </div>
        )}
        {item && <ItemCard query={query} item={item} />}
      </div>
      <p className="results-note">Prices reflect the latest cached market data and may change.</p>
    </main>
  );
}

export default function App() {
  return (
    <>
      <header className="site-header">
        <Link className="brand" to="/items">
          <span className="brand-mark" aria-hidden="true">B</span>Bazaar
          <span className="brand-divider">/</span>
          <span className="brand-description">Item lookup</span>
        </Link>
        <span className="header-note">SkyBlock market explorer</span>
      </header>
      <Routes>
        <Route path="/items" element={<SearchPage />} />
        <Route path="/items/:query" element={<ItemPage />} />
        <Route path="*" element={<Navigate to="/items" replace />} />
      </Routes>
      <footer className="site-footer">Built for better Bazaar decisions.</footer>
    </>
  );
}
