import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-color-scheme: dark)';

const getMedia = () =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(QUERY)
    : null;

const subscribe = (onChange: () => void) => {
  const media = getMedia();
  media?.addEventListener('change', onChange);
  return () => media?.removeEventListener('change', onChange);
};

/** Live `prefers-color-scheme: dark` match; `false` on the server. */
export function usePrefersDark(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => getMedia()?.matches ?? false,
    () => false,
  );
}
