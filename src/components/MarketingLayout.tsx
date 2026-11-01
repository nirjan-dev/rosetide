import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

export function MarketingHeader() {
  return (
    <header className="flex items-center justify-between gap-3">
      <Link to="/" className="flex min-h-11 items-center gap-2">
        <img src="/images/logo.svg" alt="" className="h-9 w-auto" />
        <span className="text-xl font-bold">Rosetide</span>
      </Link>
      <Link to="/app" className="btn btn-primary btn-sm min-h-11 shrink-0">
        Open tracker
      </Link>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-base-200">
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-between gap-3 px-4 py-6 text-center text-sm opacity-70 sm:flex-row sm:px-6 sm:text-left">
        <span>
          Made with care by{' '}
          <a
            href="https://nirjan.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="link link-hover font-semibold"
          >
            Nirjan
          </a>{' '}
          🌙
        </span>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2" aria-label="Footer">
          <Link to="/how-it-works" className="link link-hover inline-flex min-h-11 items-center">
            How it works
          </Link>
          <Link to="/privacy" className="link link-hover inline-flex min-h-11 items-center">
            Privacy
          </Link>
          <Link to="/faq" className="link link-hover inline-flex min-h-11 items-center">
            FAQ
          </Link>
          <Link to="/about" className="link link-hover inline-flex min-h-11 items-center">
            About
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export function MarketingLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 sm:px-6">
      <div className="py-5">
        <MarketingHeader />
      </div>

      <main className="flex-1 py-8 sm:py-12">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-lg opacity-80">{description}</p>
        <div className="mt-8 max-w-none space-y-4 text-base leading-relaxed [&_h2:not(:first-child)]:pt-4 [&_h2]:text-xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_p]:opacity-80 [&_ul]:space-y-2">
          {children}
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}
