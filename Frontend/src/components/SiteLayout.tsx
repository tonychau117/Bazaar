// Imports the React node type used for nested route content.
import type { ReactNode } from 'react'; // Types the layout's children without a runtime import.
// Imports router links for the site brand.
import { Link } from 'react-router-dom'; // Loads the client-side link component.

// Renders the site header and footer around the active route content.
export function SiteLayout({ children }: { children: ReactNode }) { // Defines the layout component and its nested page content.
  return ( // Starts the shared site shell JSX tree.
    <> {/* Wraps the header, page, and footer without adding an extra element. */}
      <header className="site-header">{/* Creates the shared top navigation area. */}
        <Link className="brand" to="/items">{/* Makes the Bazaar brand navigate to the search landing page. */}
          <span className="brand-mark" aria-hidden="true">B</span>Bazaar{/* Shows the decorative brand initial and site name. */}
          <span className="brand-divider">/</span>{/* Separates the brand name from its description. */}
          <span className="brand-description">Item lookup</span>{/* Describes the site's main function. */}
        </Link>{/* Ends the brand navigation link. */}
        <span className="header-note">SkyBlock market explorer</span>{/* Displays the short site descriptor in the header. */}
      </header>{/* Ends the shared top navigation area. */}
      {children}{/* Places the active route page inside the site shell. */}
      <footer className="site-footer">Built for better Bazaar decisions.</footer>{/* Displays the shared site footer. */}
      {/* Closes the fragment containing the site shell. */}</>
  ); // Ends the shared site shell render expression.
} // Ends the site layout component.

