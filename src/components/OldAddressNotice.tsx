// Addresses Rosetide was served from before rosetide.net. Browser storage is per address,
// so records saved here never appear at rosetide.net on their own.
const OLD_HOSTS: Partial<Record<string, true>> = {
  'periodos.nirjan.net': true,
  'periodos.pages.dev': true,
};

export function OldAddressNotice() {
  if (!OLD_HOSTS[window.location.hostname]) return null;

  return (
    <div role="note" className="alert alert-warning mb-6 shadow-md">
      <div>
        <p className="font-semibold">Rosetide now lives at rosetide.net</p>
        <p className="text-sm">
          Records you saved at this address stay here. To move them, open Settings &amp; Backup,
          tap Export to CSV, then open{' '}
          <a href="https://rosetide.net/app" className="link font-semibold">
            rosetide.net
          </a>{' '}
          and import the file.
        </p>
      </div>
    </div>
  );
}
