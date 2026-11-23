// Imports the item response shape used to render price and volume data.
import type { ItemPrices } from '../api'; // Uses the API type without emitting an import at runtime.
// Imports shared helpers for the title, key, and numeric values.
import { formatNumber, itemName, productId } from '../utils/itemFormatting'; // Keeps item presentation consistent across pages.

// Renders one item's market prices, volumes, order counts, and margin.
export function ItemCard({ query, item }: { query: string; item: ItemPrices }) { // Defines the card inputs and component.
  const buyPrice = Number(item.buy_price); // Converts the API buy price to a number for calculations.
  const sellPrice = Number(item.sell_price); // Converts the API sell price to a number for calculations.
  const margin = buyPrice - sellPrice; // Calculates the difference between buy and sell order prices.
  const marginPercent = sellPrice > 0 ? `${(margin / sellPrice * 100).toFixed(1)}%` : '—'; // Calculates a percentage only when the sell price is positive.

  // Renders the item title and its market statistics.
  return ( // Starts the item card JSX tree.
    <article className="item-card">{/* Groups the selected item's market information. */}
      <div className="item-heading">{/* Places the item identity and decorative symbol together. */}
        <div>{/* Groups the readable title and API item key. */}
          <h2>{itemName(query)}</h2>{/* Displays the formatted item name. */}
          <p className="product-id">{productId(query)}</p>{/* Displays the normalized item key. */}
        </div>{/* Ends the item identity group. */}
        <span className="item-symbol" aria-hidden="true">✦</span>{/* Adds a decorative symbol hidden from assistive technology. */}
      </div>{/* Ends the item heading. */}
      <dl className="item-stats">{/* Starts the definition list of market statistics. */}
        <div><dt>Buy Order Price</dt><dd>{formatNumber(buyPrice)} <span className="unit">coins</span></dd></div>{/* Shows the current buy order price. */}
        <div><dt>Sell Order Price</dt><dd>{formatNumber(sellPrice)} <span className="unit">coins</span></dd></div>{/* Shows the current sell order price. */}
        <div><dt>Buy Volume</dt><dd>{formatNumber(Number(item.buy_volume))}</dd></div>{/* Shows the current buy volume. */}
        <div><dt>Sell Volume</dt><dd>{formatNumber(Number(item.sell_volume))}</dd></div>{/* Shows the current sell volume. */}
        <div><dt>Buy Orders</dt><dd>{formatNumber(Number(item.buy_orders))}</dd></div>{/* Shows the count of current buy orders. */}
        <div><dt>Sell Orders</dt><dd>{formatNumber(Number(item.sell_orders))}</dd></div>{/* Shows the count of current sell orders. */}
        <div className="margin-row"><dt>Margin</dt><dd>{formatNumber(margin)} <span className="percentage">({marginPercent})</span></dd></div>{/* Shows the price difference and its percentage. */}
      </dl>{/* Ends the market statistics list. */}
      <p className="card-note">Margin = buy order price − sell order price. Before fees.</p>{/* Explains how the displayed margin is calculated. */}
    {/* Closes the item information card. */}</article>
  ); // Ends the item card render expression.
} // Ends the item card component.

