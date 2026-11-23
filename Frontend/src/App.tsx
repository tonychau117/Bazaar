// Imports route components and the not-found redirect behavior.
import { Navigate, Route, Routes } from 'react-router-dom'; // Loads the router components used to select each page.
// Imports the results page for an individual item.
import { ItemPage } from './pages/ItemPage'; // Provides the route that loads item prices.
// Imports the landing page containing the main search form.
import { SearchPage } from './pages/SearchPage'; // Provides the route where users start a search.
// Imports the shared header and footer surrounding every route.
import { SiteLayout } from './components/SiteLayout'; // Wraps route content in the common site shell.

// Defines the application routes inside the shared site layout.
export default function App() { // Declares the root component rendered by the frontend entry point.
  return ( // Starts the root application's JSX tree.
    <SiteLayout>{/* Adds the common header and footer around routed pages. */}
      <Routes>{/* Selects a page component based on the current URL. */}
        <Route path="/items" element={<SearchPage />} />{/* Shows the item search landing page. */}
        <Route path="/items/:query" element={<ItemPage />} />{/* Shows results for the item key in the URL. */}
        <Route path="*" element={<Navigate to="/items" replace />} />{/* Redirects unmatched URLs to the search page. */}
      </Routes>{/* Ends the application route definitions. */}
      {/* Closes the shared site layout. */}</SiteLayout>
  ); // Ends the root application's render expression.
} // Ends the root application component.

