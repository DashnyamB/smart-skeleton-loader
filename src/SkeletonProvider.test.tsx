// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AutoSkeleton } from './AutoSkeleton';
import { SkeletonProvider, useSkeletonConfig } from './SkeletonProvider';

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

beforeEach(() => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(box);
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const Bar = (props: Partial<React.ComponentProps<typeof AutoSkeleton>>) => (
  <AutoSkeleton loading {...props}>
    <button type="button">Go</button>
  </AutoSkeleton>
);

describe('SkeletonProvider', () => {
  it('applies its defaults to every AutoSkeleton inside it', () => {
    render(
      <SkeletonProvider
        loadingLabel="Fetching"
        config={{ animation: 'shimmer', color: 'static' }}
      >
        <Bar />
      </SkeletonProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Fetching');
    const [bar] = screen.getAllByTestId('skeleton');
    expect(bar).toHaveClass('auto-skeleton--shimmer');
    expect(bar).not.toHaveClass('auto-skeleton--adaptive');
  });

  it('lets instance props win, key by key', () => {
    render(
      <SkeletonProvider
        loadingLabel="Fetching"
        config={{ animation: 'shimmer', color: 'static' }}
      >
        <Bar loadingLabel="Mine" config={{ animation: 'none' }} />
      </SkeletonProvider>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Mine');
    const [bar] = screen.getAllByTestId('skeleton');
    expect(bar).not.toHaveClass('auto-skeleton--shimmer');
    // color: 'static' still comes from the provider
    expect(bar).not.toHaveClass('auto-skeleton--adaptive');
  });

  it('merges nested providers, inner first', () => {
    const Probe = () => (
      <pre data-testid="probe">{JSON.stringify(useSkeletonConfig())}</pre>
    );
    render(
      <SkeletonProvider
        delay={0}
        config={{ animation: 'shimmer', borderRadius: 8 }}
      >
        <SkeletonProvider config={{ animation: 'none' }}>
          <Probe />
        </SkeletonProvider>
      </SkeletonProvider>,
    );
    const seen = JSON.parse(screen.getByTestId('probe').textContent!);
    expect(seen.delay).toBe(0);
    expect(seen.config).toEqual({ animation: 'none', borderRadius: 8 });
  });

  it("adaptive: 'inherit' drops per-surface ink", () => {
    render(
      <SkeletonProvider config={{ adaptive: 'inherit' }}>
        <Bar />
      </SkeletonProvider>,
    );
    const [bar] = screen.getAllByTestId('skeleton');
    expect(bar).toHaveClass('auto-skeleton--adaptive');
    expect(bar.style.getPropertyValue('--auto-skeleton-ink')).toBe('');
  });

  it('per-surface ink is the default', () => {
    render(<Bar />);
    const [bar] = screen.getAllByTestId('skeleton');
    expect(bar.style.getPropertyValue('--auto-skeleton-ink')).not.toBe('');
  });

  it('renders on the server', () => {
    const html = renderToString(
      <SkeletonProvider loadingLabel="Fetching">
        <Bar />
      </SkeletonProvider>,
    );
    expect(html).toContain('Fetching');
  });
});
