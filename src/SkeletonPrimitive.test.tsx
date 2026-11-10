import { cleanup, render, screen } from '@testing-library/react';
// @vitest-environment jsdom
import type React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AutoSkeleton } from './AutoSkeleton';
import { SkeletonPrimitive } from './SkeletonPrimitive';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SkeletonPrimitive animation', () => {
  it.each([
    ['pulse', 'auto-skeleton auto-skeleton--adaptive auto-skeleton--pulse'],
    [
      'shimmer',
      'auto-skeleton auto-skeleton--adaptive auto-skeleton--shimmer auto-skeleton--sync',
    ],
    ['none', 'auto-skeleton auto-skeleton--adaptive'],
  ] as const)('%s → "%s"', (animation, className) => {
    render(<SkeletonPrimitive animation={animation} />);
    expect(screen.getByTestId('skeleton').className).toBe(className);
  });

  it('pulses by default and keeps a custom className', () => {
    render(<SkeletonPrimitive className="mine" />);
    expect(screen.getByTestId('skeleton').className).toBe(
      'auto-skeleton auto-skeleton--adaptive auto-skeleton--pulse mine',
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

describe('SkeletonPrimitive motion', () => {
  it("shimmer: 'local' drops the page-wide sync", () => {
    render(<SkeletonPrimitive animation="shimmer" shimmer="local" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveClass('auto-skeleton--shimmer');
    expect(el).not.toHaveClass('auto-skeleton--sync');
  });

  it('sync only applies to shimmer', () => {
    render(<SkeletonPrimitive animation="pulse" />);
    expect(screen.getByTestId('skeleton')).not.toHaveClass(
      'auto-skeleton--sync',
    );
  });

  it('ships sync and forced-colors rules in the hoisted stylesheet', () => {
    render(<SkeletonPrimitive />);
    const css = document.querySelector('style')!.textContent!;
    expect(css).toMatch(
      /\.auto-skeleton--shimmer\.auto-skeleton--sync\s*\{\s*background-attachment: fixed/,
    );
    expect(css).toMatch(
      /@media \(forced-colors: active\)[\s\S]*background-color: GrayText !important/,
    );
  });
});

describe('SkeletonPrimitive adaptive color', () => {
  it('sets the ink variable when given one', () => {
    render(<SkeletonPrimitive ink="rgb(1, 2, 3)" />);
    const el = screen.getByTestId('skeleton');
    expect(el).toHaveClass('auto-skeleton--adaptive');
    expect(el.style.getPropertyValue('--auto-skeleton-ink')).toBe(
      'rgb(1, 2, 3)',
    );
  });

  it('adaptive={false} uses the static palette and ignores ink', () => {
    render(<SkeletonPrimitive adaptive={false} ink="rgb(1, 2, 3)" />);
    const el = screen.getByTestId('skeleton');
    expect(el).not.toHaveClass('auto-skeleton--adaptive');
    expect(el.style.getPropertyValue('--auto-skeleton-ink')).toBe('');
  });
});

describe('AutoSkeleton color modes', () => {
  const box = {
    top: 0,
    left: 0,
    width: 100,
    height: 20,
    bottom: 20,
    right: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect;
  const renderBars = (
    config?: React.ComponentProps<typeof AutoSkeleton>['config'],
  ) => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(box);
    render(
      <AutoSkeleton loading config={config}>
        <button type="button">Go</button>
      </AutoSkeleton>,
    );
    return screen.getAllByTestId('skeleton');
  };

  it('is adaptive by default', () => {
    for (const bar of renderBars()) {
      expect(bar).toHaveClass('auto-skeleton--adaptive');
    }
  });

  it.each([
    ['static', { color: 'static' }],
    ['an explicit theme', { theme: 'dark' }],
  ] as const)('%s turns adaptive off', (_, config) => {
    for (const bar of renderBars(config)) {
      expect(bar).not.toHaveClass('auto-skeleton--adaptive');
    }
  });

  it('an explicit color wins over adaptive', () => {
    const [bar] = renderBars({ color: 'rgb(9, 9, 9)' });
    expect(bar.style.getPropertyValue('--auto-skeleton-c')).toBe(
      'rgb(9, 9, 9)',
    );
  });

  it('"adaptive" is a mode, not a color', () => {
    const [bar] = renderBars({ color: 'adaptive' });
    expect(bar.style.getPropertyValue('--auto-skeleton-c')).not.toBe(
      'adaptive',
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
