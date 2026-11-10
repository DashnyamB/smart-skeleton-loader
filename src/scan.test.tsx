// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AutoSkeleton } from './AutoSkeleton';
import * as scan from './scan';

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

const List = ({ n }: { n: number }) => (
  <ul>
    {Array.from({ length: n }, (_, i) => (
      <li key={i}>Row {i}</li>
    ))}
  </ul>
);

beforeEach(() => {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue(box);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('scanSkeletons', () => {
  it('reads each element’s computed style exactly once', () => {
    const host = document.createElement('div');
    host.innerHTML = `<ul>${'<li>Row</li>'.repeat(50)}</ul>`;
    document.body.append(host);
    const spy = vi.spyOn(window, 'getComputedStyle');

    scan.scanSkeletons(host);

    expect(spy).toHaveBeenCalledTimes(51); // 1 <ul> + 50 <li>
    host.remove();
  });

  it('skips display:none subtrees and keeps detection rules', () => {
    const host = document.createElement('div');
    host.innerHTML = `
      <div style="display:none"><p>hidden</p></div>
      <div style="background-color: red"></div>
      <button></button>
    `;
    document.body.append(host);

    const boxes = scan.scanSkeletons(host, 8);

    expect(boxes.map((b) => b.type)).toEqual(['container', 'primitive']);
    expect(boxes.every((b) => b.borderRadius === '8px')).toBe(true);
    host.remove();
  });

  it('gives buttons a 6px default radius', () => {
    const host = document.createElement('div');
    host.innerHTML = '<button></button>';
    document.body.append(host);
    expect(scan.scanSkeletons(host)[0].borderRadius).toBe('6px');
    host.remove();
  });
});

describe('AutoSkeleton scanning cost', () => {
  it('does not scan at all when not loading', () => {
    const spy = vi.spyOn(window, 'getComputedStyle');
    render(
      <AutoSkeleton loading={false}>
        <List n={100} />
      </AutoSkeleton>,
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it('keeps its observers across re-renders with new children', () => {
    const Original = window.MutationObserver;
    let created = 0;
    window.MutationObserver = class extends Original {
      constructor(cb: MutationCallback) {
        super(cb);
        created++;
      }
    };
    try {
      const { rerender } = render(
        <AutoSkeleton loading>
          <List n={3} />
        </AutoSkeleton>,
      );
      for (let i = 0; i < 5; i++) {
        rerender(
          <AutoSkeleton loading>
            <List n={3} />
          </AutoSkeleton>,
        );
      }
      expect(created).toBe(1);
    } finally {
      window.MutationObserver = Original;
    }
  });

  it('coalesces a burst of DOM mutations into one scan per frame', async () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });
    const spy = vi.spyOn(window, 'getComputedStyle');

    const { container } = render(
      <AutoSkeleton loading>
        <List n={3} />
      </AutoSkeleton>,
    );
    const ul = container.querySelector('ul')!;
    spy.mockClear();

    for (let i = 0; i < 10; i++) ul.append(document.createElement('li'));
    await act(async () => {}); // flush MutationObserver callbacks
    expect(frames).toHaveLength(1);

    act(() => frames.shift()!(0));
    // One scan: <ul> + 3 rows + 10 new rows
    expect(spy).toHaveBeenCalledTimes(14);
  });
});

describe('per-element overrides', () => {
  const scanHtml = (html: string) => {
    const host = document.createElement('div');
    host.innerHTML = html;
    document.body.append(host);
    const boxes = scan.scanSkeletons(host);
    host.remove();
    return boxes;
  };

  it('data-skeleton-ignore skips the element and its subtree', () => {
    const boxes = scanHtml(`
      <div data-skeleton-ignore style="background-color: red">
        <button></button><img alt="" />
      </div>
      <button></button>
    `);
    expect(boxes).toHaveLength(1);
  });

  it('data-skeleton-block draws one block and skips children', () => {
    const boxes = scanHtml(`
      <div data-skeleton-block style="border-radius: 12px">
        <img alt="" /><button></button><span>text</span>
      </div>
    `);
    expect(boxes).toHaveLength(1);
    expect(boxes[0]).toMatchObject({ type: 'primitive', borderRadius: '12px' });
  });

  it('data-skeleton-block defaults to a 4px radius', () => {
    const [block] = scanHtml('<div data-skeleton-block></div>');
    expect(block.borderRadius).toBe('4px');
  });
});
