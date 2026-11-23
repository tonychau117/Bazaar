// Converts a typed search phrase into the item key used by the pricing API.
export function productId(query: string) { // Names the URL and API key normalization helper.
  return query.trim().split(/\s+/).join('_').toUpperCase(); // Trims whitespace, joins words with underscores, and uppercases the key.
} // Ends the item key normalization helper.

// Converts an API item key into a human-readable title for display.
export function itemName(query: string) { // Names the display title formatting helper.
  return query.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()); // Replaces underscores and capitalizes each word.
} // Ends the display title formatting helper.

// Formats numeric prices and counts in a compact English locale.
export function formatNumber(value: number) { // Names the compact number formatting helper.
  if (!Number.isFinite(value)) return '—'; // Uses a dash for invalid or infinite numeric values.
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value).toLowerCase(); // Formats valid values compactly with one decimal place.
} // Ends the compact number formatting helper.

