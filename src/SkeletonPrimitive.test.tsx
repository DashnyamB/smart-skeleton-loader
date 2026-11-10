// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AutoSkeleton } from './AutoSkeleton';
import { SkeletonPrimitive } from './SkeletonPrimitive';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SkeletonPrimitive animation', () => {
  it.each([
    ['pulse', 'auto-skeleton auto-skeleton--pulse'],
    ['shimmer', 'auto-skeleton auto-skeleton--shimmer'],
    ['none', 'auto-skeleton'],
  ] as const)('%s → "%s"', (animation, className) => {
    render(<SkeletonPrimitive animation={animation} />);
    expect(screen.getByTestId('skeleton').className).toBe(className);
  });

  it('pulses by default and keeps a custom className', () => {
    render(<SkeletonPrimitive className="mine" />);
    expect(screen.getByTestId('skeleton').className).toBe(
      'auto-skeleton auto-skeleton--pulse mine',
    );
  });

  it('falls back to the built-in default colors when no variable is set', () => {
    render(<SkeletonPrimitive />);
    const el = screen.getByTestId('skeleton');
    expect(el.style.getPropertyValue('--auto-skeleton-c')).toBe(
      'var(--auto-skeleton-color, var(--auto-skeleton-default-c))',
    );
  });
});

it('AutoSkeleton passes config.animation to every bar', () => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    top: 0,
    left: 0,
    width: 100,
    height: 20,
    bottom: 20,
    right: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
  render(
    <AutoSkeleton loading config={{ animation: 'shimmer' }}>
      <img alt="" src="data:," />
      <button type="button">Go</button>
    </AutoSkeleton>,
  );
  const bars = screen.getAllByTestId('skeleton');
  expect(bars.length).toBeGreaterThan(0);
  for (const bar of bars) expect(bar).toHaveClass('auto-skeleton--shimmer');
});
