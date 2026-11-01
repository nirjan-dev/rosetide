import { useCallback, useState, useSyncExternalStore } from 'react';
import {
  clearInstallPrompt,
  getInstallPrompt,
  subscribeInstallPrompt,
} from '@/lib/installPrompt';

const DISMISSED_KEY = 'rosetide_install_dismissed';

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function useInstallPrompt() {
  const promptApi = useSyncExternalStore(subscribeInstallPrompt, getInstallPrompt, () => null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  const install = useCallback(async () => {
    if (!promptApi) return;
    // A captured prompt can only be shown once; Chrome fires a fresh event later if needed.
    clearInstallPrompt();
    await promptApi.prompt();
    await promptApi.userChoice;
  }, [promptApi]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Private mode: dismissal just won't persist.
    }
  }, []);

  return {
    canInstall: promptApi !== null && !dismissed && !isStandalone(),
    install,
    dismiss,
  };
}
