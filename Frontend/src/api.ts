// Redis returns the numeric hash values as strings.
export type ItemPrices = {
  buy_price: string;
  sell_price: string;
  buy_volume: string;
  sell_volume: string;
  buy_orders: string;
  sell_orders: string;
};

const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export async function getItem(query: string, signal: AbortSignal): Promise<ItemPrices> {
  const response = await fetch(`${apiUrl}/items/${encodeURIComponent(query)}`, { signal });

  if (response.status === 404) {
    throw new Error('No cached item found. Check the name and try again.');
  }
  if (response.status === 503) {
    throw new Error('Prices are temporarily unavailable. Please try again shortly.');
  }
  if (!response.ok) {
    throw new Error('Unable to load this item. Please try again.');
  }

  return response.json();
}
