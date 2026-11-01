import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx';
import { routeTree } from './routeTree.gen'; // Import the generated route tree
import './styles.css';
import reportWebVitals from './reportWebVitals.ts';
import { captureInstallPrompt } from './lib/installPrompt';

captureInstallPrompt();

// The installed app is the tracker. If it launches on the landing page (an old
// shortcut, or a stale cached redirect from an earlier deploy), start on /app.
// Runs once at startup only, so in-app navigation to the landing page still works.
if (window.matchMedia('(display-mode: standalone)').matches && window.location.pathname === '/') {
  window.history.replaceState(window.history.state, '', '/app');
}

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

function main() {
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
}

// --- Start the Application ---
main();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      console.error('Service worker registration failed:', error);
    });
  });
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
