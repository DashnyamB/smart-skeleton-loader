// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AutoSkeleton } from './AutoSkeleton';

const Card = () => (
  <div data-testid="content">
    <button type="button">Save</button>
  </div>
);

describe('AutoSkeleton accessibility', () => {
  afterEach(cleanup);

  it('makes content inert while loading and restores it after', () => {
    const { rerender } = render(
      <AutoSkeleton loading minDuration={0}>
        <Card />
      </AutoSkeleton>,
    );
    const contentWrapper = screen.getByTestId('content').parentElement!;
    expect(contentWrapper).toHaveAttribute('inert');

    rerender(
      <AutoSkeleton loading={false} minDuration={0}>
        <Card />
      </AutoSkeleton>,
    );
    expect(contentWrapper).not.toHaveAttribute('inert');
  });

  it('toggles aria-busy on the wrapper', () => {
    const { container, rerender } = render(
      <AutoSkeleton loading minDuration={0}>
        <Card />
      </AutoSkeleton>,
    );
    const wrapper = container.firstElementChild!;
    expect(wrapper).toHaveAttribute('aria-busy', 'true');

    rerender(
      <AutoSkeleton loading={false} minDuration={0}>
        <Card />
      </AutoSkeleton>,
    );
    expect(wrapper).toHaveAttribute('aria-busy', 'false');
  });

  it('announces the loading state through a status region', () => {
    const { rerender } = render(
      <AutoSkeleton loading minDuration={0}>
        <Card />
      </AutoSkeleton>,
    );
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Loading…');

    rerender(
      <AutoSkeleton loading={false} minDuration={0}>
        <Card />
      </AutoSkeleton>,
    );
    // Same node stays mounted so the live region is not recreated
    expect(screen.getByRole('status')).toBe(status);
    expect(status).toBeEmptyDOMElement();
  });

  it('uses a custom loadingLabel', () => {
    render(
      <AutoSkeleton loading loadingLabel="Fetching profile">
        <Card />
      </AutoSkeleton>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Fetching profile');
  });
});
