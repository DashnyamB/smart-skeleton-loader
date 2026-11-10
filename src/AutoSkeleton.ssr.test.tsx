// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { AutoSkeleton } from './AutoSkeleton';

describe('AutoSkeleton server rendering', () => {
  it('renders without a DOM', () => {
    expect(() =>
      renderToString(
        <AutoSkeleton loading>
          <p>Content</p>
        </AutoSkeleton>,
      ),
    ).not.toThrow();
  });

  it('sends a fallback skeleton block while loading, so the first paint is not blank', () => {
    const html = renderToString(
      <AutoSkeleton loading>
        <p>Content</p>
      </AutoSkeleton>,
    );
    expect(html).toContain('data-testid="skeleton-overlay"');
    expect(html).toMatch(/data-testid="skeleton"[^>]*|class="auto-skeleton"/);
    expect(html).toContain('width:100%;height:100%');
  });

  it('sends only the content when not loading', () => {
    const html = renderToString(
      <AutoSkeleton loading={false}>
        <p>Content</p>
      </AutoSkeleton>,
    );
    expect(html).not.toContain('skeleton-overlay');
    expect(html).toContain('<p>Content</p>');
  });
});
