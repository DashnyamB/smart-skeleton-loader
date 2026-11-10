import { createContext, useContext, useMemo, type ReactNode } from 'react';

import type { AutoSkeletonProps } from './AutoSkeleton';

/** App-wide defaults for every `<AutoSkeleton>` below the provider. */
export interface SkeletonDefaults {
  config?: AutoSkeletonProps['config'];
  delay?: number;
  minDuration?: number;
  loadingLabel?: string;
}

const SkeletonContext = createContext<SkeletonDefaults>({});

/** Reads the merged defaults from the nearest `<SkeletonProvider>`s. */
export function useSkeletonConfig(): SkeletonDefaults {
  return useContext(SkeletonContext);
}

/**
 * Sets defaults for every `<AutoSkeleton>` inside it. Props on an individual
 * `<AutoSkeleton>` win; nested providers merge over outer ones.
 */
export function SkeletonProvider({
  children,
  config,
  delay,
  minDuration,
  loadingLabel,
}: SkeletonDefaults & { children: ReactNode }) {
  const parent = useContext(SkeletonContext);
  const value = useMemo<SkeletonDefaults>(
    () => ({
      config: { ...parent.config, ...config },
      delay: delay ?? parent.delay,
      minDuration: minDuration ?? parent.minDuration,
      loadingLabel: loadingLabel ?? parent.loadingLabel,
    }),
    [parent, config, delay, minDuration, loadingLabel],
  );
  return (
    <SkeletonContext.Provider value={value}>
      {children}
    </SkeletonContext.Provider>
  );
}
