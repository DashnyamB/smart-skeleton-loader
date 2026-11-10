import { useLayoutEffect, useRef, useState } from 'react';

export interface DisplayedLoadingOptions {
  /** Wait this long (ms) before showing the skeleton; fast loads never show it. */
  delay?: number;
  /** Once shown, keep the skeleton at least this long (ms) to avoid a flash. */
  minDuration?: number;
}

/**
 * Turns a raw `loading` flag into "should the skeleton be on screen",
 * applying a show delay and a minimum display time.
 */
export function useDisplayedLoading(
  loading: boolean,
  { delay = 0, minDuration = 0 }: DisplayedLoadingOptions = {},
): boolean {
  const [shown, setShown] = useState(() => loading && delay <= 0);
  const shownAt = useRef(0);

  useLayoutEffect(() => {
    if (shown) shownAt.current = Date.now();
  }, [shown]);

  useLayoutEffect(() => {
    if (loading === shown) return;

    const wait = loading
      ? delay
      : Math.max(0, minDuration - (Date.now() - shownAt.current));

    if (wait <= 0) {
      setShown(loading);
      return;
    }
    const timer = setTimeout(() => setShown(loading), wait);
    return () => clearTimeout(timer);
  }, [loading, shown, delay, minDuration]);

  return shown;
}
