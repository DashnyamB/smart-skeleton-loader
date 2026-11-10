import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { AutoSkeleton } from '../AutoSkeleton';
import { Caption, Panel, ProfileRow } from './fixtures';

/** Timing, accessibility, layout and the real-world loading pattern. */
const meta = {
  title: 'AutoSkeleton/Behavior',
  component: AutoSkeleton,
} satisfies Meta<typeof AutoSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Data fetching: the template pattern
// ---------------------------------------------------------------------------

interface User {
  id: number;
  name: string;
  role: string;
}

const USERS: User[] = [
  { id: 1, name: 'Ada Lovelace', role: 'Analytical Engine team' },
  { id: 2, name: 'Grace Hopper', role: 'Compilers' },
  { id: 3, name: 'Alan Turing', role: 'Codebreaking' },
];
// Same shape as the real data, so the skeleton matches the real layout
const PLACEHOLDER_USERS: User[] = USERS.map((u) => ({
  ...u,
  name: 'Placeholder name',
  role: 'Placeholder role text',
}));

const Users = ({ latency }: { latency: number }) => {
  const [users, setUsers] = useState<User[] | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => setUsers(USERS), latency);
    return () => clearTimeout(timer);
  }, [latency]);

  return (
    <AutoSkeleton loading={!users}>
      <ul
        data-testid="users"
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gap: 12,
        }}
      >
        {(users ?? PLACEHOLDER_USERS).map((u) => (
          <li key={u.id}>
            <ProfileRow name={u.name} role={u.role} />
          </li>
        ))}
      </ul>
    </AutoSkeleton>
  );
};

const UserList = ({ latency }: { latency: number }) => {
  // A new key starts a fresh request
  const [request, setRequest] = useState(0);
  return (
    <div style={{ width: 360 }}>
      <button
        type="button"
        onClick={() => setRequest((r) => r + 1)}
        style={{ marginBottom: 12 }}
      >
        Refetch
      </button>
      <Users key={request} latency={latency} />
    </div>
  );
};

/**
 * The recommended pattern: render the same component with placeholder data
 * while loading, so the skeleton matches the real layout exactly.
 */
export const DataFetching: StoryObj<{ latency: number }> = {
  args: { latency: 1500 },
  argTypes: {
    latency: { control: { type: 'range', min: 100, max: 5000, step: 100 } },
  },
  render: ({ latency }) => <UserList latency={latency} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByTestId('skeleton').length).toBeGreaterThan(0);
    await waitFor(
      () => expect(canvas.getByText('Grace Hopper')).toBeVisible(),
      {
        timeout: 4000,
      },
    );
  },
};

// ---------------------------------------------------------------------------
// Reveal timing
// ---------------------------------------------------------------------------

const TimingCard = ({ title }: { title: string }) => (
  <Panel style={{ width: 240 }}>
    <h4 style={{ margin: '0 0 8px' }}>{title}</h4>
    <p style={{ margin: 0 }}>Content arrives after a simulated request.</p>
  </Panel>
);

const RevealTimingDemo = ({
  delay,
  minDuration,
}: {
  delay: number;
  minDuration: number;
}) => {
  const [loading, setLoading] = useState(false);
  const load = (ms: number) => {
    setLoading(true);
    setTimeout(() => setLoading(false), ms);
  };
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button type="button" onClick={() => load(60)}>
          Fast load (60ms)
        </button>
        <button type="button" onClick={() => load(2000)}>
          Slow load (2s)
        </button>
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        <div data-testid="naive">
          <Caption>Naive (0 / 0)</Caption>
          <AutoSkeleton loading={loading} delay={0} minDuration={0}>
            <TimingCard title="No timing" />
          </AutoSkeleton>
        </div>
        <div data-testid="tuned">
          <Caption>
            Tuned ({delay}ms delay / {minDuration}ms min)
          </Caption>
          <AutoSkeleton
            loading={loading}
            delay={delay}
            minDuration={minDuration}
          >
            <TimingCard title="With timing" />
          </AutoSkeleton>
        </div>
      </div>
    </div>
  );
};

/** `delay` keeps fast refetches from flashing a skeleton; `minDuration` stops a shown one from blinking away. */
export const RevealTiming: StoryObj<{ delay: number; minDuration: number }> = {
  args: { delay: 150, minDuration: 400 },
  argTypes: {
    delay: { control: { type: 'range', min: 0, max: 1000, step: 50 } },
    minDuration: { control: { type: 'range', min: 0, max: 2000, step: 100 } },
  },
  render: (args) => <RevealTimingDemo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overlay = (id: string) =>
      within(canvas.getByTestId(id)).queryByTestId('skeleton-overlay');
    const tunedContent = canvas
      .getByTestId('tuned')
      .querySelector('[aria-busy]')!.children[1] as HTMLElement;

    await userEvent.click(canvas.getByRole('button', { name: /fast load/i }));
    // Naive flashes a skeleton; tuned stays quiet during its delay
    await expect(overlay('naive')).not.toBeNull();
    await expect(overlay('tuned')).toBeNull();

    // Sample every frame until the fast load is over: the tuned card never dims
    let minOpacity = 1;
    const start = performance.now();
    while (performance.now() - start < 400) {
      await new Promise(requestAnimationFrame);
      minOpacity = Math.min(
        minOpacity,
        +getComputedStyle(tunedContent).opacity,
      );
      await expect(overlay('tuned')).toBeNull();
    }
    await expect(minOpacity).toBe(1);
  },
};

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

const AccessibilityDemo = ({ loading }: { loading: boolean }) => {
  const [clicks, setClicks] = useState(0);
  return (
    <div>
      <p data-testid="click-count">Clicks: {clicks}</p>
      <AutoSkeleton loading={loading} loadingLabel="Loading profile form">
        <Panel style={{ width: 260, display: 'grid', gap: 8 }}>
          <label htmlFor="a11y-name">Name</label>
          <input id="a11y-name" placeholder="Jane Doe" />
          <button type="button" onClick={() => setClicks((c) => c + 1)}>
            Save
          </button>
        </Panel>
      </AutoSkeleton>
    </div>
  );
};

/** While loading, content is `inert` (no clicks, no Tab focus), the wrapper is `aria-busy`, and `loadingLabel` is announced. */
export const Accessibility: Story = {
  args: { loading: true, children: null },
  render: (args) => <AccessibilityDemo loading={args.loading} />,
  play: async ({ canvasElement, args }) => {
    if (!args.loading) return;
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Loading profile form',
    );

    // Keyboard focus skips the hidden input and button
    await userEvent.tab();
    await expect(canvasElement.ownerDocument.activeElement).not.toBe(
      canvasElement.querySelector('#a11y-name'),
    );

    // Clicking where the hidden button sits does nothing
    const button = canvasElement.querySelector('button')!;
    const { x, y, width, height } = button.getBoundingClientRect();
    const hit = canvasElement.ownerDocument.elementFromPoint(
      x + width / 2,
      y + height / 2,
    ) as HTMLElement | null;
    hit?.click();
    await expect(canvas.getByTestId('click-count')).toHaveTextContent(
      'Clicks: 0',
    );
  },
};

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

/** The wrapper is `display: block`: it fills block and flex-column parents like the content it replaces. */
export const Layout: Story = {
  args: { loading: true, children: null },
  render: (args) => (
    <div style={{ display: 'grid', gap: 24 }}>
      <div data-testid="block-parent" style={{ width: 600 }}>
        <Caption>Block parent, 600px</Caption>
        <AutoSkeleton loading={args.loading}>
          <Panel>
            <ProfileRow />
          </Panel>
        </AutoSkeleton>
      </div>
      <div
        data-testid="flex-parent"
        style={{ display: 'flex', flexDirection: 'column', width: 400 }}
      >
        <Caption>Flex column parent, 400px</Caption>
        <AutoSkeleton loading={args.loading}>
          <Panel>
            <ProfileRow />
          </Panel>
        </AutoSkeleton>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const id of ['block-parent', 'flex-parent']) {
      const parent = within(canvasElement).getByTestId(id);
      const wrapper = parent.querySelector('[aria-busy]')!;
      const diff = Math.abs(
        parent.getBoundingClientRect().width -
          wrapper.getBoundingClientRect().width,
      );
      await expect(diff).toBeLessThanOrEqual(1);
    }
  },
};

// ---------------------------------------------------------------------------
// Server rendering
// ---------------------------------------------------------------------------

const serverHtml = renderToString(
  <AutoSkeleton loading>
    <Panel style={{ width: 280 }}>
      <h4 style={{ margin: '0 0 8px' }}>Server-rendered card</h4>
      <p style={{ margin: 0 }}>
        Before hydration this area pulses as one block.
      </p>
    </Panel>
  </AutoSkeleton>,
);

/** The HTML a server sends before hydration: nothing can be measured yet, so one block covers the space. */
export const ServerRendering: Story = {
  args: { loading: true, children: null },
  render: () => (
    <div
      data-testid="server-html"
      dangerouslySetInnerHTML={{ __html: serverHtml }}
    />
  ),
  play: async ({ canvasElement }) => {
    const root = within(canvasElement).getByTestId('server-html');
    const block = root.querySelector('[data-testid="skeleton"]') as HTMLElement;
    await expect(block).not.toBeNull();
    const card = root.querySelector('[aria-busy]') as HTMLElement;
    await expect(block.getBoundingClientRect().height).toBe(
      card.getBoundingClientRect().height,
    );
  },
};

// ---------------------------------------------------------------------------
// Performance
// ---------------------------------------------------------------------------

const LargeListDemo = ({ rows }: { rows: number }) => {
  const [loading, setLoading] = useState(true);
  return (
    <div>
      <button type="button" onClick={() => setLoading((l) => !l)}>
        Toggle loading ({loading ? 'on' : 'off'})
      </button>
      <AutoSkeleton loading={loading} style={{ marginTop: 12, width: 320 }}>
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {Array.from({ length: rows }, (_, i) => (
            <li key={i} style={{ lineHeight: '24px' }}>
              Row {i + 1}: some list content
            </li>
          ))}
        </ul>
      </AutoSkeleton>
    </div>
  );
};

/** Scanned once per frame and only while loading, so long lists stay cheap. */
export const LargeList: StoryObj<{ rows: number }> = {
  args: { rows: 300 },
  argTypes: {
    rows: { control: { type: 'range', min: 10, max: 1000, step: 10 } },
  },
  render: (args) => <LargeListDemo rows={args.rows} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByTestId('skeleton')).toHaveLength(args.rows);

    // Toggling off and on again re-measures (after the default 150ms delay)
    const toggle = canvas.getByRole('button', { name: /toggle loading/i });
    await userEvent.click(toggle);
    await userEvent.click(toggle);
    await waitFor(() =>
      expect(canvas.getAllByTestId('skeleton')).toHaveLength(args.rows),
    );
  },
};
