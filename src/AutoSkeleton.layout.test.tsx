// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AutoSkeleton } from './AutoSkeleton';

describe('AutoSkeleton wrapper layout', () => {
  afterEach(cleanup);

  it('renders a block-level wrapper so it fills its parent', () => {
    const { container } = render(
      <AutoSkeleton loading>
        <div>Content</div>
      </AutoSkeleton>,
    );
    expect(container.firstElementChild).toHaveStyle({
      display: 'block',
      position: 'relative',
    });
  });

  it('passes className and style to the wrapper', () => {
    const { container } = render(
      <AutoSkeleton loading className="card-slot" style={{ marginTop: 12 }}>
        <div>Content</div>
      </AutoSkeleton>,
    );
    const wrapper = container.firstElementChild!;
    expect(wrapper).toHaveClass('card-slot');
    expect(wrapper).toHaveStyle({ marginTop: '12px', display: 'block' });
  });

  it('lets the user style override the default display', () => {
    const { container } = render(
      <AutoSkeleton loading style={{ display: 'inline-block' }}>
        <span>Inline</span>
      </AutoSkeleton>,
    );
    expect(container.firstElementChild).toHaveStyle({
      display: 'inline-block',
    });
  });
});
