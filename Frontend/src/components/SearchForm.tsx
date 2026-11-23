// Imports React state for keeping the input value in sync with the form.
import { useState } from 'react'; // Loads the state hook used by the search field.
// Imports the form event type without adding a runtime dependency.
import type { FormEvent } from 'react'; // Provides a type for the submit handler.
// Imports router navigation so a search can open its results route.
import { useNavigate } from 'react-router-dom'; // Loads the hook used to navigate to item results.
// Imports the helper that converts user text into an item key.
import { productId } from '../utils/itemFormatting'; // Shares URL key formatting with the item page.

// Renders the reusable item search field and submit button.
export function SearchForm({ initialQuery = '' }: { initialQuery?: string }) { // Defines the form and its optional starting text.
  const [query, setQuery] = useState(initialQuery); // Stores the current search field value.
  const navigate = useNavigate(); // Gets the router navigation function.

  // Handles a form submission by navigating to the selected item.
  function search(event: FormEvent<HTMLFormElement>) { // Defines the typed submit event handler.
    event.preventDefault(); // Prevents the browser from reloading the page.
    const id = productId(query); // Converts the entered phrase to the API item key.
    if (id) navigate(`/items/${encodeURIComponent(id)}`); // Opens the encoded item route when the key is nonempty.
  } // Ends the form submit handler.

  // Renders an accessible search form with its icon, input, and action button.
  return ( // Starts the form's returned JSX tree.
    <form className="search-form" onSubmit={search} role="search">{/* Groups the search controls and connects form submission. */}
      <label className="sr-only" htmlFor="item-query">Item name</label>{/* Gives the search field an accessible name. */}
      <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{/* Draws a decorative magnifying glass icon. */}
        <circle cx="10.5" cy="10.5" r="6.5" />{/* Draws the circular glass portion. */}
        <path d="m16 16 4 4" />{/* Draws the magnifying glass handle. */}
      </svg>{/* Closes the decorative search icon. */}
      <input id="item-query" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search an item, e.g. Recombobulator 3000" autoComplete="off" required />{/* Binds the text field to state and requires a search phrase. */}
      <button type="submit" disabled={!query.trim()}>Search <span aria-hidden="true">→</span></button>{/* Submits nonempty searches and displays an arrow. */}
    {/* Closes the reusable search form. */}</form>
  ); // Ends the form render expression.
} // Ends the reusable search form component.

