import type React from 'react';

import { getTextLineBoxes } from './measure';

/** Text bars are drawn at this fraction of the line box height, vertically centered. */
const TEXT_BAR_RATIO = 0.7;

const MEDIA_TAGS = new Set(['IMG', 'VIDEO', 'CANVAS', 'SVG', 'PICTURE']);
const INPUT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
const ATOMIC_TAGS = new Set([...MEDIA_TAGS, ...INPUT_TAGS, 'BUTTON']);
const HEADING_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6']);
/** Text at least this much larger than the surrounding text counts as a heading. */
const HEADING_SCALE = 1.25;

/** What a bar stands for; each kind can be styled separately. */
export type BarKind =
  | 'text'
  | 'heading'
  | 'avatar'
  | 'media'
  | 'button'
  | 'input'
  | 'block'
  | 'container';

export const BAR_KINDS: readonly BarKind[] = [
  'text',
  'heading',
  'avatar',
  'media',
  'button',
  'input',
  'block',
  'container',
];
const TRANSPARENT = new Set(['rgba(0, 0, 0, 0)', 'transparent']);

export interface SkeletonBox {
  key: string;
  type: 'primitive' | 'container';
  kind: BarKind;
  width: number;
  height: number;
  top: number;
  left: number;
  borderRadius: string;
  style?: React.CSSProperties;
  /** Text color of the surface the bar sits on; adaptive bars are tinted from it. */
  ink?: string;
}

type Kind =
  | { type: 'primitive'; text: boolean }
  | { type: 'container'; styles: React.CSSProperties };

const hasOwnText = (el: Element) =>
  Array.from(el.childNodes).some(
    (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim(),
  );

/** Classifies an element from one computed-style read. */
function classify(el: Element, style: CSSStyleDeclaration): Kind | null {
  if (ATOMIC_TAGS.has(el.tagName.toUpperCase()))
    return { type: 'primitive', text: false };
  if (hasOwnText(el)) return { type: 'primitive', text: true };

  const hasBackground = !TRANSPARENT.has(style.backgroundColor);
  const hasBorder =
    style.borderWidth !== '0px' &&
    style.borderStyle !== 'none' &&
    !TRANSPARENT.has(style.borderColor);
  const hasShadow = style.boxShadow !== 'none';
  if (!hasBackground && !hasBorder && !hasShadow) return null;

  return {
    type: 'container',
    styles: {
      backgroundColor: style.backgroundColor,
      border: style.border,
      borderRadius: style.borderRadius,
      boxShadow: style.boxShadow,
    },
  };
}

/** True for a computed background color that fully covers what is behind it. */
export function isOpaque(color: string): boolean {
  if (TRANSPARENT.has(color)) return false;
  // rgba(r, g, b, a) / rgb(r g b / a) / color(srgb r g b / a)
  const alpha = /(?:,|\/)\s*([\d.]+%?)\s*\)$/.exec(color);
  if (!alpha || (color.startsWith('rgb(') && !color.includes('/'))) return true;
  const a = alpha[1].endsWith('%')
    ? parseFloat(alpha[1]) / 100
    : parseFloat(alpha[1]);
  return a >= 1;
}

/** Round, roughly square elements (avatars) vs other media. */
function isRound(style: CSSStyleDeclaration, rect: DOMRect): boolean {
  const { width, height } = rect;
  if (
    !width ||
    !height ||
    Math.abs(width - height) > 0.1 * Math.max(width, height)
  ) {
    return false;
  }
  const radius = style.borderRadius;
  if (radius.endsWith('%')) return parseFloat(radius) >= 50;
  return parseFloat(radius) >= Math.min(width, height) / 2 - 0.5;
}

/** Kind of an atomic (non-text) element. */
function atomicKind(
  el: Element,
  style: CSSStyleDeclaration,
  rect: DOMRect,
): BarKind {
  const tag = el.tagName.toUpperCase();
  if (tag === 'BUTTON') return 'button';
  if (INPUT_TAGS.has(tag)) return 'input';
  return isRound(style, rect) ? 'avatar' : 'media';
}

const declaredKind = (el: Element): BarKind | undefined => {
  const value = el.getAttribute('data-skeleton-type') as BarKind | null;
  return value && BAR_KINDS.includes(value) ? value : undefined;
};

const toCss = (r: string | number | undefined) =>
  typeof r === 'number' ? `${r}px` : r;

/**
 * Walks `container` and returns the skeleton boxes to draw, relative to it.
 * Reads each element's computed style exactly once.
 *
 * Per-element overrides:
 * - `data-skeleton-ignore`: draw nothing for the element or its subtree
 * - `data-skeleton-block`: draw the element as one block, ignoring its children
 */
export function scanSkeletons(
  container: HTMLElement,
  borderRadius?: string | number,
): SkeletonBox[] {
  const origin = container.getBoundingClientRect();
  const radiusOverride = toCss(borderRadius);
  const boxes: SkeletonBox[] = [];
  let idx = 0;
  // The content's own text color is the ink of the outermost surface
  const rootStyle = window.getComputedStyle(container);
  const rootInk = rootStyle.color || undefined;
  const rootFontSize = parseFloat(rootStyle.fontSize) || 16;

  const visit = (el: Element, ink: string | undefined) => {
    // Opt-out: no skeleton for this element or anything inside it
    if (el.hasAttribute('data-skeleton-ignore')) return;

    const style = window.getComputedStyle(el);
    if (style.display === 'none') return;
    // An opaque background starts a new surface: its text color tints the bars inside it
    const childInk = isOpaque(style.backgroundColor) ? style.color || ink : ink;

    const declared = declaredKind(el);

    // Opt-in: draw the whole element as one block, skip its children.
    // A declared non-text kind (e.g. an initials avatar) is drawn the same way.
    if (
      el.hasAttribute('data-skeleton-block') ||
      (declared && declared !== 'text' && declared !== 'heading')
    ) {
      const rect = el.getBoundingClientRect();
      boxes.push({
        key: `${idx++}`,
        type: 'primitive',
        kind: declared ?? 'block',
        width: rect.width,
        height: rect.height,
        top: rect.top - origin.top,
        left: rect.left - origin.left,
        borderRadius:
          radiusOverride ??
          (style.borderRadius && style.borderRadius !== '0px'
            ? style.borderRadius
            : '4px'),
        ink,
      });
      return;
    }

    const kind = classify(el, style);
    const textKind: BarKind =
      declared ??
      (HEADING_TAGS.has(el.tagName.toUpperCase()) ||
      parseFloat(style.fontSize) >= rootFontSize * HEADING_SCALE
        ? 'heading'
        : 'text');
    if (kind?.type === 'primitive' && kind.text) {
      const lines = getTextLineBoxes(el);
      for (const line of lines) {
        const height = Math.max(4, line.height * TEXT_BAR_RATIO);
        boxes.push({
          key: `${idx++}`,
          type: 'primitive',
          kind: textKind,
          width: line.width,
          height,
          top: line.top + (line.height - height) / 2 - origin.top,
          left: line.left - origin.left,
          borderRadius: radiusOverride ?? '4px',
          ink,
        });
      }
      if (lines.length > 0) {
        for (const child of Array.from(el.children)) visit(child, childInk);
        return;
      }
    }

    if (kind) {
      const rect = el.getBoundingClientRect();
      let radius =
        radiusOverride ??
        (kind.type === 'container' ? kind.styles.borderRadius : undefined) ??
        style.borderRadius;
      if (kind.type === 'primitive' && (!radius || radius === '0px')) {
        radius = el.tagName === 'BUTTON' ? '6px' : '4px';
      }
      let barKind: BarKind;
      if (declared) barKind = declared;
      else if (kind.type === 'container') barKind = 'container';
      else if (kind.text) barKind = textKind; // text we could not split into lines
      else barKind = atomicKind(el, style, rect);
      boxes.push({
        key: `${idx++}`,
        type: kind.type,
        kind: barKind,
        width: rect.width,
        height: rect.height,
        top: rect.top - origin.top,
        left: rect.left - origin.left,
        borderRadius: String(radius),
        style: kind.type === 'container' ? kind.styles : undefined,
        ink,
      });
    }

    for (const child of Array.from(el.children)) visit(child, childInk);
  };

  for (const child of Array.from(container.children)) visit(child, rootInk);

  if (boxes.length === 0 && (origin.width > 0 || origin.height > 0)) {
    boxes.push({
      key: 'fallback',
      type: 'primitive',
      kind: 'block',
      width: origin.width,
      height: origin.height,
      top: 0,
      left: 0,
      borderRadius: radiusOverride ?? '4px',
      ink: rootInk,
    });
  }
  return boxes;
}

/** True when two scans would render identically (skip a re-render). */
export function sameBoxes(a: SkeletonBox[], b: SkeletonBox[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((x, i) => {
    const y = b[i];
    return (
      x.type === y.type &&
      x.kind === y.kind &&
      x.width === y.width &&
      x.height === y.height &&
      x.top === y.top &&
      x.left === y.left &&
      x.borderRadius === y.borderRadius &&
      x.ink === y.ink
    );
  });
}
