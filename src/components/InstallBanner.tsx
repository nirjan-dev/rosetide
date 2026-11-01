import { X } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

export function InstallBanner() {
  const { canInstall, install, dismiss } = useInstallPrompt();
  if (!canInstall) return null;

  return (
    <div
      role="region"
      aria-label="Install Rosetide"
      className="alert alert-info mb-6 shadow-md"
    >
      <span className="text-2xl" aria-hidden="true">
        📲
      </span>
      <div className="flex-1">
        <p className="font-semibold">Add Rosetide to your home screen?</p>
        <p className="text-sm opacity-80">One tap to open, works offline — like a real app.</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="btn btn-primary btn-sm min-h-11" onClick={() => void install()}>
          Install
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-circle min-h-11 min-w-11"
          onClick={dismiss}
          aria-label="Dismiss install suggestion"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
