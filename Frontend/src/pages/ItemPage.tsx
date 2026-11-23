// Imports React effects and state for loading an item's market data.
import { useEffect, useState } from 'react'; // Loads the hooks for request lifecycle and page state.
// Imports router links and the current item route parameter.
import { Link, useParams } from 'react-router-dom'; // Loads navigation links and route values.
// Imports the card that displays the fetched item values.
import { ItemCard } from '../components/ItemCard'; // Renders item prices and statistics.
// Imports the shared search form for looking up another item.
import { SearchForm } from '../components/SearchForm'; // Reuses search controls on the results page.
// Imports the API function and response type used by the request.
import { getItem } from '../api'; // Loads item data from the backend service.
import type { ItemPrices } from '../api'; // Types the item state without a runtime import.
// Imports the helper that formats the route key for the search field.
import { itemName } from '../utils/itemFormatting'; // Converts the item key to readable search text.

// Renders the item results page and loads prices for its route parameter.
export function ItemPage() { // Defines the results page component.
  const { query = '' } = useParams(); // Reads the item key from the current URL.
  const [item, setItem] = useState<ItemPrices | null>(null); // Stores the loaded item or null while none is available.
  const [error, setError] = useState(''); // Stores a readable request failure message.

  // Loads a fresh item when the URL key changes and cancels stale requests.
  useEffect(() => { // Starts an effect tied to the current route key.
    const controller = new AbortController(); // Creates a cancellation signal for this request.
    setItem(null); // Clears the previous item's data while the new item loads.
    setError(''); // Clears any previous request failure.
    getItem(query, controller.signal) // Requests the selected item's pricing with cancellation support.
      .then(setItem) // Stores the API response after a successful request.
      .catch((reason: unknown) => { // Handles errors returned while loading the item.
        if (controller.signal.aborted) return; // Ignores request failures caused by cleanup.
        if (reason instanceof TypeError) { // Checks for fetch connection failures.
          setError('Could not connect to the price service. Please try again.'); // Shows a helpful service connection message.
        } else if (reason instanceof Error) { // Checks for a standard error with a message.
          setError(reason.message); // Displays the error message from the API layer.
        } else { // Handles values that are not standard Error objects.
          setError('Unable to load this item.'); // Shows a fallback message for unknown failures.
        } // Ends the error type checks.
      }); // Ends the request promise handlers.
    return () => controller.abort(); // Cancels the request when the route changes or component unmounts.
  }, [query]); // Reruns the request whenever the item key changes.

  // Renders the search controls, request status, and loaded item details.
  return ( // Starts the item results JSX tree.
    <main className="results-page">{/* Creates the main results page landmark. */}
      <Link className="back-link" to="/items">← Back to search</Link>{/* Provides a route back to the search landing page. */}
      <h1>Bazaar Results</h1>{/* Labels the page showing item information. */}
      <p className="intro">Current cached Bazaar pricing and spreads.</p>{/* Explains the source and content of the displayed data. */}
      <SearchForm key={query} initialQuery={itemName(query)} />{/* Prefills a new search with the current item's readable name. */}
      <div className="results-content">{/* Groups request status and item data. */}
        {!item && !error && <p className="status-message" role="status">Loading item prices…</p>}{/* Announces loading while the request has no result or error. */}
        {error && (/* Shows the error panel only after the item request fails. */
          <div className="status-message error" role="alert">{/* Announces the failure as an alert. */}
            <h2>Couldn’t load this item</h2>{/* Summarizes the loading failure. */}
            <p>{error}</p>{/* Displays the detailed failure message. */}
            {/* Ends the item request error panel. */}</div>
        )}{/* Ends the conditional error display. */}
        {item && <ItemCard query={query} item={item} />}{/* Displays the card after item data has loaded. */}
      </div>{/* Ends the request status and data group. */}
      <p className="results-note">Prices reflect the latest cached market data and may change.</p>{/* Reminds users that market values can change. */}
    {/* Closes the results page landmark. */}</main>
  ); // Ends the item results render expression.
} // Ends the item results page component.

