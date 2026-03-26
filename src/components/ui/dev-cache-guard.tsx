import { useEffect } from 'react';

type CacheGuardWindow = Window & {
  __AURA_DEV_CACHE_GUARD_RAN__?: boolean;
};

async function cleanupDevCaches(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map((registration) => registration.unregister())
    );
  }

  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
}

export function DevCacheGuard() {
  useEffect(() => {
    if (!import.meta.env.DEV || typeof window === 'undefined') {
      return;
    }

    const guardedWindow = window as CacheGuardWindow;
    if (guardedWindow.__AURA_DEV_CACHE_GUARD_RAN__) {
      return;
    }

    guardedWindow.__AURA_DEV_CACHE_GUARD_RAN__ = true;

    cleanupDevCaches().catch(() => {
      // Ignore cleanup errors in development.
    });
  }, []);

  return null;
}
