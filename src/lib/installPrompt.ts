export interface InstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type InstallPromptEvent = Event & InstallPrompt;

let current: InstallPrompt | null = null;
const listeners = new Set<() => void>();

function setInstallPrompt(next: InstallPrompt | null): void {
  current = next;
  for (const listener of listeners) listener();
}

/**
 * Chrome fires `beforeinstallprompt` once per page load, often before the
 * tracker route mounts. Capture it at startup so the banner can use it later.
 */
export function captureInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    const installEvent = event as InstallPromptEvent;
    setInstallPrompt({
      prompt: () => installEvent.prompt(),
      userChoice: installEvent.userChoice,
    });
  });
  window.addEventListener('appinstalled', () => setInstallPrompt(null));
}

export function subscribeInstallPrompt(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getInstallPrompt(): InstallPrompt | null {
  return current;
}

export function clearInstallPrompt(): void {
  setInstallPrompt(null);
}
