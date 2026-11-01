import { createFileRoute } from '@tanstack/react-router';
import { MarketingLayout } from '@/components/MarketingLayout';

export const Route = createFileRoute('/about')({
  component: AboutPage,
  head: () => ({
    meta: [
      {
        name: 'description',
        content: 'About Rosetide: a small local-first period tracker focused on privacy, simplicity, and user-controlled backups.',
      },
      { property: 'og:title', content: 'About Rosetide' },
      {
        property: 'og:description',
        content: 'A small browser-local tracker with honest privacy limits and user-controlled backups.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://rosetide.net/about' }],
  }),
});

function AboutPage() {
  return (
    <MarketingLayout
      title="About"
      description="Rosetide is a small product focused on one job: simple period tracking without accounts or cloud sync."
    >
      <h2>What it does</h2>
      <p>
        Rosetide logs periods, shows calendar and history views, calculates simple cycle estimates,
        and exports or imports CSV backups. It deliberately avoids accounts, social features,
        advertising, and an ever-expanding health dashboard.
      </p>
      <h2>Why local-first</h2>
      <p>
        Menstrual data is sensitive. Keeping records in the browser removes an entire category of
        account and sync risk. The tradeoff is explicit: users are responsible for backups, and each
        browser starts empty.
      </p>
      <h2>What it is not</h2>
      <p>
        Rosetide is not a medical app, contraceptive, diagnostic tool, or pregnancy-planning service.
        Estimates are calendar math and can be wrong, especially with irregular cycles or limited
        history.
      </p>
    </MarketingLayout>
  );
}
