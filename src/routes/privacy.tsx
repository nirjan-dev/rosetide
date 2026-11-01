import { createFileRoute } from '@tanstack/react-router';
import { MarketingLayout } from '@/components/MarketingLayout';

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
  head: () => ({
    meta: [
      {
        name: 'description',
        content: 'Rosetide privacy: period records stay in your browser IndexedDB with no account or automatic cloud sync.',
      },
      { property: 'og:title', content: 'Rosetide privacy' },
      {
        property: 'og:description',
        content: 'No account, no cloud sync, manual CSV backups, and honest browser-storage limits.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://rosetide.net/privacy' }],
  }),
});

function PrivacyPage() {
  return (
    <MarketingLayout
      title="Privacy"
      description="Rosetide is designed so your period records stay under your control in your own browser."
    >
      <h2>Where your records live</h2>
      <p>
        Period dates and daily logs are stored in browser IndexedDB on rosetide.net. There is no
        account, profile database, or automatic cloud sync.
      </p>
      <h2>What this does not mean</h2>
      <ul>
        <li>It is not encrypted secure storage; anyone with access to this browser profile may see it.</li>
        <li>Automatic restore points live in this browser too, so clearing browser data removes them along with your records.</li>
        <li>It is not cross-device; each browser starts empty unless you import a backup file.</li>
      </ul>
      <h2>Backups</h2>
      <p>
        Restore points are saved automatically: one each day your records change (the last 7 are
        kept) and one before every import, deletion or restore (the last 3 are kept). They let you
        undo mistakes from Settings &amp; Backup. Delete all my data removes them too.
      </p>
      <p>
        A backup file is the copy that survives cleared browser data or a new phone. Save it to the
        device, or send it to Drive or email from the share sheet. The tracker shows when you last
        saved one and reminds you when it&apos;s been a while. Import restores the same dates, skips
        duplicates, and reports invalid rows.
      </p>
      <h2>Storage durability</h2>
      <p>
        Browsers may clear site storage under low-storage pressure. The installed app asks the
        browser to protect its storage automatically; in a browser tab, Settings can ask too.
        Protection is a browser decision, not a guarantee.
      </p>
      <h2>Analytics and tracking</h2>
      <p>
        Rosetide never sends your period records anywhere — they stay in your browser. The site
        host counts anonymous page visits to keep the site running; these counts contain no
        health data and cannot identify your cycle.
      </p>
    </MarketingLayout>
  );
}
