// @vitest-environment jsdom
import * as matchers from '@testing-library/jest-dom/matchers';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AutoSkeleton } from './AutoSkeleton';

expect.extend(matchers);

// @ts-ignore
const MockObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
// @ts-ignore
window.ResizeObserver = MockObserver;
// @ts-ignore
globalThis.ResizeObserver = MockObserver;

describe('AutoSkeleton Theme', () => {
  it('applies data-skeleton-theme="light" when theme prop is light', () => {
    const { container } = render(
      <AutoSkeleton loading={true} config={{ theme: 'light' }}>
        <div>Content</div>
      </AutoSkeleton>,
    );
    const wrapper = container.querySelector('[data-skeleton-theme="light"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('applies data-skeleton-theme="dark" when theme prop is dark', () => {
    const { container } = render(
      <AutoSkeleton loading={true} config={{ theme: 'dark' }}>
        <div>Content</div>
      </AutoSkeleton>,
    );
    const wrapper = container.querySelector('[data-skeleton-theme="dark"]');
    expect(wrapper).toBeInTheDocument();
  });

  it('does not apply data-skeleton-theme when theme is auto', () => {
    const { container } = render(
      // @ts-ignore
      <AutoSkeleton loading={true} config={{ theme: 'auto' }}>
        <div>Content</div>
      </AutoSkeleton>,
    );
    const wrapper = container.querySelector('[data-skeleton-theme]');
    expect(wrapper).toBeNull();
  });

  it('does not apply data-skeleton-theme when config is undefined', () => {
    const { container } = render(
      <AutoSkeleton loading={true}>
        <div>Content</div>
      </AutoSkeleton>,
    );
    const wrapper = container.querySelector('[data-skeleton-theme]');
    expect(wrapper).toBeNull();
  });
});
