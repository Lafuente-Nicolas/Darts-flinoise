import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
}

/** Faux quand l'onglet est en arrière-plan ou le téléphone verrouillé. */
export function usePageVisible(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => document.visibilityState === 'visible',
    () => true,
  );
}
