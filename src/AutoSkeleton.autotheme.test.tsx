// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AutoSkeleton } from './AutoSkeleton';

const themed = {
  lightColor: 'rgb(1, 1, 1)',
  lightHighlightColor: 'rgb(2, 2, 2)',
  darkColor: 'rgb(9, 9, 9)',
  darkHighlightColor: 'rgb(8, 8, 8)',
};

let dark = false;
let listeners: Array<() => void> = [];
const setScheme = (isDark: boolean) => {
  dark = isDark;
  act(() => listeners.forEach((l) => l()));
};

const view = (theme?: 'auto' | 'light' | 'dark') => (
  <AutoSkeleton loading config={{ theme, ...themed }}>
    <img alt="" src="data:," />
  </AutoSkeleton>
);

const barColor = () =>
  screen.getAllByTestId('skeleton')[0].style.backgroundColor;

describe('AutoSkeleton theme "auto" colors', () => {
  beforeEach(() => {
    listeners = [];
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      left: 0,
      width: 100,
      height: 40,
      bottom: 40,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    window.matchMedia = vi.fn().mockImplementation(() => ({
      get matches() {
        return dark;
      },
      addEventListener: (_: string, l: () => void) => listeners.push(l),
      removeEventListener: (_: string, l: () => void) => {
        listeners = listeners.filter((x) => x !== l);
      },
    }));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('uses the light colors when the OS is in light mode', () => {
    dark = false;
    render(view());
    expect(barColor()).toBe(themed.lightColor);
  });

  it('uses the dark colors when the OS is in dark mode', () => {
    dark = true;
    render(view('auto'));
    expect(barColor()).toBe(themed.darkColor);
  });

  it('follows OS scheme changes live', () => {
    dark = false;
    render(view());
    setScheme(true);
    expect(barColor()).toBe(themed.darkColor);
  });

  it('an explicit theme still wins over the OS scheme', () => {
    dark = true;
    render(view('light'));
    expect(barColor()).toBe(themed.lightColor);
  });
});
