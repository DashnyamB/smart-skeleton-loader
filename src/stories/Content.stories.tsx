import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { AutoSkeleton } from '../AutoSkeleton';
import {
  ArticleCard,
  AVATAR_PLACEHOLDER,
  IMG_PLACEHOLDER,
  LoginForm,
  Panel,
  SideBySide,
} from './fixtures';

/** What AutoSkeleton detects in your markup, and how to steer it. */
const meta = {
  title: 'AutoSkeleton/Content detection',
  component: AutoSkeleton,
} satisfies Meta<typeof AutoSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

const inside = (r: DOMRect, area: DOMRect) =>
  r.left >= area.left - 1 &&
  r.right <= area.right + 1 &&
  r.top >= area.top - 1 &&
  r.bottom <= area.bottom + 1;

/** One bar per rendered line, a shorter last line, and no overlap for nested inline text. */
export const Text: Story = {
  args: { loading: true, children: null },
  render: () => (
    <SideBySide>
      <div style={{ width: 280 }}>
        <h3 style={{ margin: '0 0 8px' }}>
          Release notes for <strong>v2.0</strong>
        </h3>
        <p data-testid="paragraph" style={{ margin: 0, lineHeight: 1.5 }}>
          Skeletons follow the real shape of your text. A paragraph that wraps
          onto several lines gets one bar per line, and the last bar is only as
          long as the last line.
        </p>
      </div>
    </SideBySide>
  ),
  play: async ({ canvasElement }) => {
    const loading = within(canvasElement).getByTestId('loading');
    const paragraph = within(loading).getByTestId('paragraph');
    const range = document.createRange();
    range.selectNodeContents(paragraph.firstChild!);
    const lineTops = new Set(
      Array.from(range.getClientRects()).map((r) => Math.round(r.top)),
    );
    await expect(lineTops.size).toBeGreaterThan(1);

    const p = paragraph.getBoundingClientRect();
    const bars = within(loading)
      .getAllByTestId('skeleton')
      .filter((bar) => inside(bar.getBoundingClientRect(), p));
    await expect(bars).toHaveLength(lineTops.size);

    const widths = bars.map((b) => b.getBoundingClientRect().width);
    await expect(widths[widths.length - 1]).toBeLessThan(Math.max(...widths));
  },
};

/** Cards keep their border and background; only the content inside pulses. */
export const Card: Story = {
  args: { loading: true, children: null },
  render: () => (
    <SideBySide>
      <ArticleCard />
    </SideBySide>
  ),
};

/** Inputs, selects and buttons keep their size and radius. */
export const Form: Story = {
  args: { loading: true, children: null },
  render: () => (
    <SideBySide>
      <LoginForm />
    </SideBySide>
  ),
  play: async ({ canvasElement }) => {
    const loading = within(canvasElement).getByTestId('loading');
    const kinds = within(loading)
      .getAllByTestId('skeleton')
      .map((b) => b.dataset.skeletonKind);
    await expect(kinds.filter((k) => k === 'input')).toHaveLength(2);
    await expect(kinds.filter((k) => k === 'button')).toHaveLength(2);
  },
};

/** Every bar is tagged with what it stands for, so each kind can be styled. */
export const BarKinds: Story = {
  args: { loading: true, children: null },
  render: () => (
    <AutoSkeleton loading>
      <div style={{ width: 320, display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <img
            src={AVATAR_PLACEHOLDER}
            alt=""
            width={40}
            height={40}
            style={{ borderRadius: '50%' }}
          />
          <h3 style={{ margin: 0 }}>Heading</h3>
        </div>
        <p style={{ margin: 0 }}>Body text</p>
        <img
          src={IMG_PLACEHOLDER}
          alt=""
          style={{ width: '100%', height: 100, display: 'block' }}
        />
        <input aria-label="Search" placeholder="Search" />
        <button type="button" style={{ justifySelf: 'start' }}>
          Button
        </button>
        <div
          data-skeleton-type="avatar"
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#8b5cf6',
            color: 'white',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          AL
        </div>
      </div>
    </AutoSkeleton>
  ),
  play: async ({ canvasElement }) => {
    const kinds = within(canvasElement)
      .getAllByTestId('skeleton')
      .map((b) => b.dataset.skeletonKind);
    await expect(kinds).toEqual([
      'avatar',
      'heading',
      'text',
      'media',
      'input',
      'button',
      'avatar', // data-skeleton-type: one bar instead of a circle plus initials
    ]);
  },
};

/** `data-skeleton-ignore` skips an element; `data-skeleton-block` draws one block for a complex widget. */
export const ElementOverrides: Story = {
  args: { loading: true, children: null },
  render: () => (
    <SideBySide>
      <Panel style={{ width: 300 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h4 style={{ margin: 0 }}>Weekly revenue</h4>
          <span
            data-skeleton-ignore
            data-testid="badge"
            style={{ fontSize: 12 }}
          >
            beta
          </span>
        </div>
        <div
          data-skeleton-block
          data-testid="chart"
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 6,
            height: 100,
            marginTop: 12,
            borderRadius: 6,
          }}
        >
          {[40, 70, 55, 90, 65, 80, 50].map((h, i) => (
            <span
              key={i}
              style={{ flex: 1, height: `${h}%`, background: '#7c9cf5' }}
            >
              {' '}
            </span>
          ))}
        </div>
      </Panel>
    </SideBySide>
  ),
  play: async ({ canvasElement }) => {
    const loading = within(within(canvasElement).getByTestId('loading'));
    const chart = loading.getByTestId('chart').getBoundingClientRect();
    const badge = loading.getByTestId('badge').getBoundingClientRect();
    const bars = loading
      .getAllByTestId('skeleton')
      .map((b) => b.getBoundingClientRect());
    await expect(bars.filter((r) => inside(r, chart))).toHaveLength(1);
    await expect(bars.filter((r) => inside(r, badge))).toHaveLength(0);
  },
};
