import { Link, createFileRoute } from '@tanstack/react-router';
import { MarketingLayout } from '@/components/MarketingLayout';

export const Route = createFileRoute('/how-it-works')({
  component: HowItWorksPage,
  head: () => ({
    meta: [
      {
        name: 'description',
        content: 'How Rosetide works: log periods in your browser, review calendar history, and keep CSV backups without an account.',
      },
      { property: 'og:title', content: 'How Rosetide works' },
      {
        property: 'og:description',
        content: 'Log periods, review history, understand estimates, and back up your data with CSV.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://rosetide.net/how-it-works' }],
  }),
});

function HowItWorksPage() {
  return (
    <MarketingLayout
      title="How Rosetide works"
      description="A small loop: log dates, review history, understand estimates, and keep your own backup."
    >
      <h2>1. Log periods</h2>
      <p>
        Start a period today or add past periods with start and end dates. You can update daily flow
        intensity while a period is active.
      </p>
      <h2>2. Review history</h2>
      <p>
        Use the calendar to see period, fertile-window, and estimated ovulation markings, or use the
        history list to review and delete individual periods.
      </p>
      <h2>3. Understand estimates</h2>
      <p>
        After two completed periods, Rosetide estimates your next period and fertile window from your
        average cycle length. Confidence increases as you log more periods.
      </p>
      <p>
        These are calendar estimates only. They are not medical advice, contraception, or pregnancy
        planning.
      </p>
      <h2>4. Keep a backup</h2>
      <p>
        Records stay in this browser. Export CSV regularly, especially before clearing browser data,
        changing devices, or reinstalling your browser. Import restores the same dates and reports
        added, skipped, and invalid rows.
      </p>
      <p>
        <Link to="/app" className="btn btn-primary min-h-12">Open the tracker</Link>
      </p>
    </MarketingLayout>
  );
}
