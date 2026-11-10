// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AutoSkeleton } from './AutoSkeleton';
import { scanSkeletons } from './scan';

const rect = (width: number, height: number) =>
  ({
    top: 0,
    left: 0,
    width,
    height,
    bottom: height,
    right: width,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  }) as DOMRect;

/** Sizes come from data-w / data-h so jsdom can tell square from wide. */
const mockSizes = () =>
  vi
    .spyOn(Element.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: Element) {
      return rect(
        Number(this.getAttribute('data-w') ?? 100),
        Number(this.getAttribute('data-h') ?? 20),
      );
    });

const kindsOf = (html: string) => {
  mockSizes();
  const host = document.createElement('div');
  host.style.fontSize = '16px';
  host.innerHTML = html;
  document.body.append(host);
  const kinds = scanSkeletons(host).map((b) => b.kind);
  host.remove();
  return kinds;
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('bar kinds', () => {
  it.each([
    ['<p>Body copy</p>', 'text'],
    ['<h2>Title</h2>', 'heading'],
    ['<span style="font-size: 24px">Big</span>', 'heading'],
    ['<span style="font-size: 17px">Barely bigger</span>', 'text'],
    [
      '<img alt="" data-w="40" data-h="40" style="border-radius: 50%" />',
      'avatar',
    ],
    [
      '<img alt="" data-w="40" data-h="40" style="border-radius: 20px" />',
      'avatar',
    ],
    ['<img alt="" data-w="40" data-h="40" />', 'media'],
    [
      '<img alt="" data-w="300" data-h="200" style="border-radius: 50%" />',
      'media',
    ],
    ['<video data-w="300" data-h="200"></video>', 'media'],
    ['<canvas data-w="300" data-h="200"></canvas>', 'media'],
    ['<button></button>', 'button'],
    ['<input />', 'input'],
    ['<textarea></textarea>', 'input'],
    ['<select></select>', 'input'],
    ['<div data-skeleton-block></div>', 'block'],
    ['<div style="background-color: red"></div>', 'container'],
  ])('%s → %s', (html, kind) => {
    expect(kindsOf(html)[0]).toBe(kind);
  });

  it('data-skeleton-type overrides detection', () => {
    expect(kindsOf('<p data-skeleton-type="heading">Copy</p>')).toEqual([
      'heading',
    ]);
  });

  it('a declared non-text kind draws one bar and skips the children', () => {
    expect(
      kindsOf(`
        <div data-skeleton-type="avatar" style="background-color: red">
          <span>AL</span>
        </div>
      `),
    ).toEqual(['avatar']);
  });

  it('ignores unknown data-skeleton-type values', () => {
    expect(kindsOf('<button data-skeleton-type="nope"></button>')).toEqual([
      'button',
    ]);
  });

  it('the whole-container fallback is a block', () => {
    expect(kindsOf('')).toEqual(['block']);
  });
});

describe('styling by kind', () => {
  it('tags each bar with its kind and applies classNames and styles', () => {
    mockSizes();
    render(
      <AutoSkeleton
        loading
        config={{
          classNames: { button: 'my-button', container: 'my-card' },
          styles: {
            button: { opacity: 0.5 },
            container: { outline: '1px solid red' },
          },
        }}
      >
        <div style={{ backgroundColor: 'red' }}>
          <button type="button">Go</button>
        </div>
      </AutoSkeleton>,
    );
    const overlay = screen.getByTestId('skeleton-overlay');
    const card = overlay.querySelector(
      '[data-skeleton-kind="container"]',
    ) as HTMLElement;
    expect(card).toHaveClass('my-card');
    expect(card.style.outline).toBe('1px solid red');

    const [button] = screen.getAllByTestId('skeleton');
    expect(button).toHaveAttribute('data-skeleton-kind', 'button');
    expect(button).toHaveClass('auto-skeleton--button', 'my-button');
    expect(button.style.opacity).toBe('0.5');
  });

  it('exposes a per-kind radius token', () => {
    mockSizes();
    render(
      <AutoSkeleton loading>
        <button type="button">Go</button>
      </AutoSkeleton>,
    );
    const [button] = screen.getAllByTestId('skeleton');
    expect(button.style.borderRadius).toBe(
      'var(--auto-skeleton-button-radius, 6px)',
    );
  });
});
