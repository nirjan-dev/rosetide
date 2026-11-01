import { createFileRoute } from '@tanstack/react-router';
import { MarketingLayout } from '@/components/MarketingLayout';

export const Route = createFileRoute('/faq')({
  component: FaqPage,
  head: () => ({
    meta: [
      {
        name: 'description',
        content: 'Rosetide FAQ: accounts, data location, backups, browser changes, predictions, and medical limits.',
      },
      { property: 'og:title', content: 'Rosetide FAQ' },
      {
        property: 'og:description',
        content: 'Common questions about browser-local period tracking, backups, and estimates.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://rosetide.net/faq' }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Where is my period data stored?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'In browser IndexedDB on rosetide.net. There is no account database or automatic cloud sync.',
              },
            },
            {
              '@type': 'Question',
              name: 'Do I need an account?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'No. Rosetide works immediately without signing up.',
              },
            },
            {
              '@type': 'Question',
              name: 'What happens if I clear browser data or change devices?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Local records can be lost. Export CSV regularly and import the backup on the new browser or device.',
              },
            },
            {
              '@type': 'Question',
              name: 'Are predictions medical advice?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'No. Rosetide shows calendar estimates only. Do not use them for contraception, pregnancy planning, or medical decisions.',
              },
            },
          ],
        }),
      },
    ],
  }),
});

function FaqPage() {
  return (
    <MarketingLayout
      title="FAQ"
      description="Short answers about accounts, data, backups, and the limits of cycle estimates."
    >
      <h2>Where is my period data stored?</h2>
      <p>In browser IndexedDB on rosetide.net. There is no account database or automatic cloud sync.</p>
      <h2>Do I need an account?</h2>
      <p>No. Rosetide works immediately without signing up.</p>
      <h2>What happens if I clear browser data or change devices?</h2>
      <p>Local records can be lost. Export CSV regularly and import the backup on the new browser or device.</p>
      <h2>Does Rosetide work offline?</h2>
      <p>
        Yes, after your first online visit. The installed web app caches its shell and previously
        loaded pages so the tracker opens offline. Your records remain in browser IndexedDB and are
        never uploaded by offline support.
      </p>
      <h2>Are predictions medical advice?</h2>
      <p>
        No. Rosetide shows calendar estimates based on your average cycle. Do not use them for
        contraception, pregnancy planning, or medical decisions.
      </p>
      <h2>Who is Rosetide for?</h2>
      <p>
        People who want a simple tracker without accounts, cloud sync, ads, or a large health
        dashboard. It is a personal local-first product, not a medical service.
      </p>
    </MarketingLayout>
  );
}
