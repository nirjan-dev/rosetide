import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';

import { db } from './lib/db';

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx';
import { routeTree } from './routeTree.gen'; // Import the generated route tree
import './styles.css';
import reportWebVitals from './reportWebVitals.ts';

const TanStackQueryProviderContext = TanStackQueryProvider.getContext();
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

async function main() {
  try {
    //  Ensure the database is open and ready before rendering the app.
    // This is crucial for preventing race conditions where the app tries to
    // query the database before it has been initialized.
    await db.open();
    console.log('Database initialized successfully.');

    // Render the app once the database is ready.
    const rootElement = document.getElementById('app');
    if (rootElement && !rootElement.innerHTML) {
      const root = ReactDOM.createRoot(rootElement);
      root.render(
        <StrictMode>
          <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
            <RouterProvider router={router} />
          </TanStackQueryProvider.Provider>
        </StrictMode>,
      );
    }
  } catch (error) {
    // Log any critical errors that occur during database initialization.
    console.error('Failed to initialize the database:', error);
    // You could render a fallback UI here if needed.
    const rootElement = document.getElementById('app');
    if (rootElement) {
      rootElement.innerHTML = `
            <div style="font-family: sans-serif; text-align: center; padding: 2rem;">
                <h1>Application Error</h1>
                <p>Could not initialize the local database. Please try clearing site data or using a different browser.</p>
                <p><em>Details: ${error instanceof Error ? error.message : String(error)}</em></p>
            </div>
        `;
    }
  }
}

// --- Start the Application ---
main();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
