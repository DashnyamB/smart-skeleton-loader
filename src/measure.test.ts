import { describe, expect, it } from 'vitest';

import { groupRectsIntoLines } from './measure';

const r = (top: number, left: number, width: number, height = 20) => ({
  top,
  left,
  width,
  height,
});

describe('groupRectsIntoLines', () => {
  it('returns no lines for empty input', () => {
    expect(groupRectsIntoLines([])).toEqual([]);
  });

  it('merges fragments on the same line into one box', () => {
    expect(groupRectsIntoLines([r(10, 100, 50), r(11, 0, 80)])).toEqual([
      { top: 10, left: 0, width: 150, height: 21 },
    ]);
  });

  it('keeps separate lines apart, ordered top to bottom', () => {
    const lines = groupRectsIntoLines([
      r(40, 0, 120),
      r(0, 0, 200),
      r(20, 0, 200),
    ]);
    expect(lines.map((l) => [l.top, l.width])).toEqual([
      [0, 200],
      [20, 200],
      [40, 120],
    ]);
  });

  it('ignores zero-size rects', () => {
    expect(groupRectsIntoLines([r(0, 0, 0), r(0, 0, 10, 0)])).toEqual([]);
  });
});
