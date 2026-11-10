import React from 'react';

import type { BarKind } from './scan';

export type SkeletonAnimation = 'pulse' | 'shimmer' | 'none';

export interface SkeletonPrimitiveProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  color?: string;
  highlightColor?: string;
  /** `pulse` (default) fades the color, `shimmer` sweeps a highlight, `none` is static. */
  animation?: SkeletonAnimation;
  /**
   * Tint the bar from the text color around it (default), so it matches any
   * theme or surface. `false` uses the static light/dark greys.
   */
  adaptive?: boolean;
  /** Text color to tint from when adaptive; defaults to the inherited `currentColor`. */
  ink?: string;
  /** What the bar stands for; adds `auto-skeleton--{kind}` and `data-skeleton-kind`. */
  kind?: BarKind;
  /**
   * Shimmer only. `'sync'` (default): every bar on the page shares one sweep.
   * `'local'`: each bar sweeps on its own.
   */
  shimmer?: 'sync' | 'local';
}

/** Built-in defaults: used when no --auto-skeleton-* variable or color prop is set. */
export const DEFAULT_COLORS = {
  light: { color: '#e0e0e0', highlight: '#f2f2f2' },
  dark: { color: '#2a2a2a', highlight: '#3d3d3d' },
} as const;

const vars = (c: { color: string; highlight: string }) =>
  `--auto-skeleton-default-c: ${c.color}; --auto-skeleton-default-h: ${c.highlight};`;

const SKELETON_CSS = `
.auto-skeleton { ${vars(DEFAULT_COLORS.light)} }
@media (prefers-color-scheme: dark) {
  .auto-skeleton { ${vars(DEFAULT_COLORS.dark)} }
}
[data-skeleton-theme='light'] .auto-skeleton { ${vars(DEFAULT_COLORS.light)} }
[data-skeleton-theme='dark'] .auto-skeleton { ${vars(DEFAULT_COLORS.dark)} }

/* Adaptive: the surface's text color at low alpha, so the bar takes on any background */
.auto-skeleton.auto-skeleton--adaptive {
  --auto-skeleton-default-c: color-mix(in srgb, var(--auto-skeleton-ink, currentColor) var(--auto-skeleton-strength, 12%), transparent);
  --auto-skeleton-default-h: color-mix(in srgb, var(--auto-skeleton-ink, currentColor) calc(var(--auto-skeleton-strength, 12%) * 1.7), transparent);
}

@keyframes auto-skeleton-pulse {
  0%, 100% { background-color: var(--auto-skeleton-c); }
  50% { background-color: var(--auto-skeleton-h); }
}
@keyframes auto-skeleton-shimmer {
  from { background-position: 200% 0; }
  to { background-position: -100% 0; }
}
.auto-skeleton--pulse { animation: auto-skeleton-pulse 1.5s ease-in-out infinite; }
.auto-skeleton--shimmer {
  background-image: linear-gradient(90deg, transparent 0%, var(--auto-skeleton-h) 50%, transparent 100%);
  background-size: 200% 100%;
  background-repeat: no-repeat;
  animation: auto-skeleton-shimmer 1.5s linear infinite;
}
/* One page-wide sweep: the gradient is pinned to the viewport, so bars line up */
.auto-skeleton--shimmer.auto-skeleton--sync { background-attachment: fixed; }
@media (prefers-reduced-motion: reduce) {
  .auto-skeleton { animation: none; background-image: none; }
}
/* Windows High Contrast & co.: translucent tints would be forced away, use a system color */
@media (forced-colors: active) {
  .auto-skeleton {
    forced-color-adjust: none;
    background-color: GrayText !important;
    background-image: none;
    animation: none;
  }
}
`;

export const SkeletonPrimitive: React.FC<SkeletonPrimitiveProps> = ({
  width,
  height,
  borderRadius = '4px',
  color = 'var(--auto-skeleton-color, var(--auto-skeleton-default-c))',
  highlightColor = 'var(--auto-skeleton-highlight, var(--auto-skeleton-default-h))',
  animation = 'pulse',
  adaptive = true,
  ink,
  kind,
  shimmer = 'sync',
  className,
  style,
  ...props
}) => {
  const classes = ['auto-skeleton'];
  if (adaptive) classes.push('auto-skeleton--adaptive');
  if (animation !== 'none') classes.push(`auto-skeleton--${animation}`);
  if (animation === 'shimmer' && shimmer === 'sync') {
    classes.push('auto-skeleton--sync');
  }
  if (kind) classes.push(`auto-skeleton--${kind}`);
  if (className) classes.push(className);

  return (
    <>
      {/* React 19 hoists this into <head> and dedupes it by href */}
      <style href="auto-skeleton" precedence="default">
        {SKELETON_CSS}
      </style>
      <div
        className={classes.join(' ')}
        style={
          {
            width,
            height,
            borderRadius,
            backgroundColor: color,
            '--auto-skeleton-c': color,
            '--auto-skeleton-h': highlightColor,
            ...(adaptive && ink ? { '--auto-skeleton-ink': ink } : {}),
            ...style,
          } as React.CSSProperties
        }
        data-testid="skeleton"
        data-skeleton-kind={kind}
        {...props}
      />
    </>
  );
};
