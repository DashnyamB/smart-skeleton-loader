// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AutoSkeleton } from './AutoSkeleton';

const rect = (top: number, left: number, width: number, height: number) =>
  ({
    top,
    left,
    width,
    height,
    bottom: top + height,
    right: left + width,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

const mockRange = (rects: DOMRect[]) =>
  vi.spyOn(document, 'createRange').mockImplementation(
    () =>
      ({
        selectNodeContents: () => {},
        getClientRects: () => rects,
      }) as unknown as Range,
  );

const Paragraph = () => (
  <p style={{ width: 200 }}>
    A paragraph long enough to wrap onto three separate lines of text.
  </p>
);

describe('AutoSkeleton text lines', () => {
  beforeEach(() => {
    // Container sits at the viewport origin with real size
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(
      rect(0, 0, 200, 60),
    );
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders one bar per rendered line, keeping the short last line', () => {
    mockRange([rect(0, 0, 200, 20), rect(20, 0, 200, 20), rect(40, 0, 90, 20)]);

    render(
      <AutoSkeleton loading>
        <Paragraph />
      </AutoSkeleton>,
    );

    const bars = screen.getAllByTestId('skeleton');
    expect(bars).toHaveLength(3);
    // 70% of a 20px line, centered: 14px tall, offset 3px into the line
    expect(bars.map((b) => b.style.width)).toEqual(['200px', '200px', '90px']);
    expect(bars.map((b) => b.style.height)).toEqual(['14px', '14px', '14px']);
    expect(bars.map((b) => b.parentElement!.style.top)).toEqual([
      '3px',
      '23px',
      '43px',
    ]);
  });

  it('falls back to one block when text ranges cannot be measured', () => {
    mockRange([]);

    render(
      <AutoSkeleton loading>
        <Paragraph />
      </AutoSkeleton>,
    );

    const bars = screen.getAllByTestId('skeleton');
    expect(bars).toHaveLength(1);
    expect(bars[0].style.width).toBe('200px');
    expect(bars[0].style.height).toBe('60px');
  });
});
