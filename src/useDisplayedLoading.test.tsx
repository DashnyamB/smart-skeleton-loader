// @vitest-environment jsdom
import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AutoSkeleton } from './AutoSkeleton';
import { useDisplayedLoading } from './useDisplayedLoading';

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('useDisplayedLoading', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const setup = (loading: boolean, opts = {}) =>
    renderHook(
      (p: { loading: boolean }) => useDisplayedLoading(p.loading, opts),
      {
        initialProps: { loading },
      },
    );

  it('shows immediately and hides immediately with default options', () => {
    const { result, rerender } = setup(true);
    expect(result.current).toBe(true);
    rerender({ loading: false });
    expect(result.current).toBe(false);
  });

  it('shows immediately on mount, even with a delay (nothing to keep on screen yet)', () => {
    const { result } = setup(true, { delay: 150 });
    expect(result.current).toBe(true);
  });

  it('waits for `delay` when loading starts after mount', () => {
    const { result, rerender } = setup(false, { delay: 150 });
    rerender({ loading: true });
    expect(result.current).toBe(false);
    advance(100);
    expect(result.current).toBe(false);
    advance(50);
    expect(result.current).toBe(true);
  });

  it('never shows when a refetch ends before `delay`', () => {
    const { result, rerender } = setup(false, { delay: 150 });
    const seen: boolean[] = [];
    rerender({ loading: true });
    seen.push(result.current);
    advance(100);
    seen.push(result.current);
    rerender({ loading: false });
    advance(500);
    seen.push(result.current);
    expect(seen).toEqual([false, false, false]);
  });

  it('keeps the skeleton for `minDuration` once shown', () => {
    const { result, rerender } = setup(true, { minDuration: 500 });
    advance(100);
    rerender({ loading: false });
    expect(result.current).toBe(true);
    advance(300); // 400ms since shown
    expect(result.current).toBe(true);
    advance(100); // 500ms since shown
    expect(result.current).toBe(false);
  });

  it('hides right away when loading already outlasted `minDuration`', () => {
    const { result, rerender } = setup(true, { minDuration: 500 });
    advance(800);
    rerender({ loading: false });
    expect(result.current).toBe(false);
  });
});

describe('AutoSkeleton reveal timing', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  const view = (loading: boolean) => (
    <AutoSkeleton loading={loading} minDuration={500}>
      <div data-testid="content">Content</div>
    </AutoSkeleton>
  );

  it('holds content hidden for minDuration, then crossfades the overlay out', () => {
    const { rerender } = render(view(true));
    advance(100);
    rerender(view(false));

    const content = screen.getByTestId('content').parentElement!;
    expect(content).toHaveStyle({ opacity: '0' });
    expect(content).toHaveAttribute('inert');
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');

    advance(400); // minDuration reached: content fades in, overlay fades out
    expect(content).toHaveStyle({ opacity: '1' });
    expect(content).not.toHaveAttribute('inert');
    expect(screen.getByTestId('skeleton-overlay')).toHaveStyle({
      opacity: '0',
    });

    advance(200); // fade finished
    expect(screen.queryByTestId('skeleton-overlay')).toBeNull();
  });

  it('keeps already-revealed content on screen during a refetch delay', () => {
    const refetch = (loading: boolean) => (
      <AutoSkeleton loading={loading} delay={150}>
        <div data-testid="content">Content</div>
      </AutoSkeleton>
    );
    const { rerender } = render(refetch(false));
    const content = screen.getByTestId('content').parentElement!;

    rerender(refetch(true));
    expect(content).toHaveStyle({ opacity: '1' });
    expect(content).toHaveAttribute('inert');
    advance(100);
    rerender(refetch(false)); // fast refetch: nothing visible ever changed
    expect(content).toHaveStyle({ opacity: '1' });
    expect(screen.queryByTestId('skeleton-overlay')).toBeNull();

    rerender(refetch(true));
    advance(150); // slow refetch: skeleton takes over, content hidden instantly
    expect(screen.getByTestId('skeleton-overlay')).toBeInTheDocument();
    expect(content).toHaveStyle({ opacity: '0', transition: 'none' });
  });

  it('shows the skeleton immediately on mount despite a delay', () => {
    render(
      <AutoSkeleton loading delay={150}>
        <div data-testid="content">Content</div>
      </AutoSkeleton>,
    );
    expect(screen.getByTestId('content').parentElement).toHaveStyle({
      opacity: '0',
    });
    expect(screen.getByTestId('skeleton-overlay')).toBeInTheDocument();
  });

  it('defaults to delay 150 / minDuration 400', () => {
    const at = (loading: boolean) => (
      <AutoSkeleton loading={loading}>
        <div data-testid="content">Content</div>
      </AutoSkeleton>
    );
    const { rerender } = render(at(false));
    rerender(at(true)); // refetch
    advance(149);
    expect(screen.queryByTestId('skeleton-overlay')).toBeNull();
    advance(1);
    expect(screen.getByTestId('skeleton-overlay')).toBeInTheDocument();

    rerender(at(false));
    advance(399); // held for minDuration
    expect(screen.getByTestId('skeleton-overlay')).toHaveStyle({
      opacity: '1',
    });
    advance(1);
    expect(screen.getByTestId('skeleton-overlay')).toHaveStyle({
      opacity: '0',
    });
  });
});
