// Imports the router link used for navigating to example item results.
import { Link } from 'react-router-dom'; // Loads client-side links for sample searches.
// Imports the shared search form displayed on this page.
import { SearchForm } from '../components/SearchForm'; // Reuses the common search controls.

// Renders the landing page and example item searches.
export function SearchPage() { // Defines the search landing page component.
  return ( // Starts the landing page JSX tree.
    <main className="search-page">{/* Creates the main search page landmark. */}
      <div className="search-content">{/* Constrains the page content for its layout. */}
        <p className="eyebrow">SKYBLOCK BAZAAR</p>{/* Identifies the site above the page heading. */}
        <h1>Every item. A better trade.</h1>{/* States the main purpose of the page. */}
        <p className="intro">Find an item’s prices, trading volumes, and spread.</p>{/* Describes the information users can look up. */}
        <SearchForm />{/* Displays the shared item search control. */}
        <p className="search-hint">Try <Link to="/items/RECOMBOBULATOR_3000">Recombobulator 3000</Link> or <Link to="/items/ENCHANTED_DIAMOND">Enchanted Diamond</Link></p>{/* Offers direct links to two example item pages. */}
      </div>{/* Ends the centered search content. */}
    {/* Closes the search page landmark. */}</main>
  ); // Ends the landing page render expression.
} // Ends the search landing page component.

