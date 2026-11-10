export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Merges rects that sit on the same visual line (tops within `tolerance` px)
 * into one box per line, ordered top to bottom.
 */
export function groupRectsIntoLines(
  rects: ArrayLike<Box>,
  tolerance = 2,
): Box[] {
  const sorted = Array.from(rects)
    .filter((r) => r.width > 0 && r.height > 0)
    .sort((a, b) => a.top - b.top || a.left - b.left);

  const lines: Array<{
    top: number;
    left: number;
    right: number;
    bottom: number;
  }> = [];
  for (const r of sorted) {
    const line = lines[lines.length - 1];
    if (line && Math.abs(r.top - line.top) <= tolerance) {
      line.left = Math.min(line.left, r.left);
      line.right = Math.max(line.right, r.left + r.width);
      line.bottom = Math.max(line.bottom, r.top + r.height);
    } else {
      lines.push({
        top: r.top,
        left: r.left,
        right: r.left + r.width,
        bottom: r.top + r.height,
      });
    }
  }

  return lines.map((l) => ({
    top: l.top,
    left: l.left,
    width: l.right - l.left,
    height: l.bottom - l.top,
  }));
}

/**
 * Line boxes of an element's own (direct) text nodes, in viewport coordinates.
 * Returns [] when the environment can't measure text ranges (e.g. jsdom).
 */
export function getTextLineBoxes(el: Element): Box[] {
  if (typeof document.createRange !== 'function') return [];

  const rects: Box[] = [];
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    if (typeof range.getClientRects !== 'function') return [];
    rects.push(...Array.from(range.getClientRects()));
  }
  return groupRectsIntoLines(rects);
}
