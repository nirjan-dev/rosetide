import { Link, createFileRoute } from '@tanstack/react-router';
import { MarketingFooter, MarketingHeader } from '@/components/MarketingLayout';

export const Route = createFileRoute('/')({
  component: MarketingPage,
  head: () => ({
    meta: [
      {
        name: 'description',
        content: 'Rosetide is a simple, private period tracker. No sign-up, no ads — your data stays on your phone.',
      },
      { property: 'og:title', content: 'Rosetide - A private period tracker' },
      {
        property: 'og:description',
        content: 'Know your cycle without giving up your privacy. No sign-up, no ads, no tracking.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
    links: [{ rel: 'canonical', href: 'https://rosetide.net/' }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'Do I need to sign up?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'No. Rosetide works right away — no email, no password, no account.',
              },
            },
            {
              '@type': 'Question',
              name: 'Where does my data go?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Nowhere. Your periods stay on your own phone or computer. Rosetide has no cloud, no ads, and no tracking.',
              },
            },
            {
              '@type': 'Question',
              name: 'What if I get a new phone?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Save a backup file from Settings before you switch, then load it on your new phone. It takes less than a minute.',
              },
            },
            {
              '@type': 'Question',
              name: 'Can I trust the predictions?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'They are helpful estimates, not medical advice. Always talk to a doctor about health decisions.',
              },
            },
          ],
        }),
      },
    ],
  }),
});

const faqs = [
  {
    question: 'Do I need to sign up?',
    answer: 'Nope! Just open the tracker and start. No email, no password, no account — ever.',
  },
  {
    question: 'Where does my data go?',
    answer:
      'Nowhere. Your periods stay on your own phone or computer. Rosetide has no cloud, no ads, and no tracking.',
  },
  {
    question: 'What if I get a new phone?',
    answer:
      'Save a backup file from Settings before you switch, then load it on your new phone. It takes less than a minute.',
  },
  {
    question: 'Does it work without internet?',
    answer:
      'Yes. Once you have opened Rosetide, the tracker keeps working offline — handy when you are travelling.',
  },
  {
    question: 'Can I trust the predictions?',
    answer:
      'They are helpful estimates based on your past cycles — not medical advice. Always talk to a doctor about health decisions.',
  },
];

function MarketingPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-4xl px-4 py-5 sm:px-6">
        <MarketingHeader />
      </div>

      <main className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <section className="py-10 text-center sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-widest opacity-70">
            🌙 A calmer way to track
          </p>
          <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Know your cycle, keep your privacy.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg opacity-80">
            Rosetide is a gentle little period tracker. No sign-up, no ads, no judgement — your
            data never leaves your phone.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/app" className="btn btn-primary btn-lg min-h-12 w-full sm:w-auto">
              Start tracking — it&apos;s free
            </Link>
            <a href="#how-it-works" className="btn btn-ghost min-h-12 w-full sm:w-auto">
              See how it works ↓
            </a>
          </div>
          <p className="mt-4 text-sm opacity-60">Free forever · Works offline · No account needed</p>
        </section>

        <section id="how-it-works" className="scroll-mt-8 py-10 sm:py-14">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Three tiny steps</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body items-center text-center">
                <span className="text-4xl" aria-hidden="true">📅</span>
                <h3 className="card-title text-lg">1. Tap your start day</h3>
                <p className="text-sm opacity-80">
                  One tap when your period begins. Add past periods too, if you like.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body items-center text-center">
                <span className="text-4xl" aria-hidden="true">🔮</span>
                <h3 className="card-title text-lg">2. See what&apos;s next</h3>
                <p className="text-sm opacity-80">
                  After two periods, Rosetide gently predicts your next one and fertile days.
                </p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body items-center text-center">
                <span className="text-4xl" aria-hidden="true">💾</span>
                <h3 className="card-title text-lg">3. Keep a backup</h3>
                <p className="text-sm opacity-80">
                  Save a backup file anytime, so a new phone never means starting over.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="card bg-primary text-primary-content shadow-xl">
            <div className="card-body items-center text-center sm:p-10">
              <span className="text-4xl" aria-hidden="true">🔒</span>
              <h2 className="card-title text-2xl sm:text-3xl">Your body, your business</h2>
              <p className="mt-2 max-w-xl opacity-90">
                Most trackers send your most personal data to their servers. Rosetide simply
                doesn&apos;t have a server for it. Everything lives on your device — private by
                design, not by promise.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm font-semibold">
                <span className="badge badge-lg">No sign-up</span>
                <span className="badge badge-lg">No ads</span>
                <span className="badge badge-lg">No tracking</span>
                <span className="badge badge-lg">No cloud</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Questions, answered</h2>
          <div className="mx-auto mt-8 max-w-2xl space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="collapse collapse-arrow rounded-2xl bg-base-100 shadow-md"
                name="faq"
              >
                <summary className="collapse-title min-h-12 text-left text-base font-semibold">
                  {faq.question}
                </summary>
                <div className="collapse-content text-left opacity-80">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="py-10 text-center sm:py-14">
          <h2 className="text-2xl font-bold sm:text-3xl">Ready when you are 🌸</h2>
          <p className="mx-auto mt-3 max-w-md opacity-80">
            It takes ten seconds to start — and your data stays yours from the very first tap.
          </p>
          <Link to="/app" className="btn btn-primary btn-lg mt-6 min-h-12">
            Open the tracker
          </Link>
          <p className="mx-auto mt-6 max-w-xl text-xs opacity-60">
            Rosetide shows cycle estimates for information only — not medical advice, contraception,
            or pregnancy planning. When in doubt, talk to a healthcare professional.
          </p>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
