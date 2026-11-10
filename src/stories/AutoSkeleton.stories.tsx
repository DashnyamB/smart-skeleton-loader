import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';
import { renderToString } from 'react-dom/server';
import { expect, userEvent, within } from 'storybook/test';

import { AutoSkeleton } from '../AutoSkeleton';

const meta = {
  title: 'Components/AutoSkeleton',
  component: AutoSkeleton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
  },
} satisfies Meta<typeof AutoSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Reliable Base64 Placeholder
const IMG_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23666666'%3EImage%3C/text%3E%3C/svg%3E";
const AVATAR_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23cccccc'/%3E%3C/svg%3E";

// Helper for Side-By-Side Comparison
const SideBySide = ({
  children,
  args,
}: {
  children: React.ReactNode;
  args: any;
}) => (
  <div
    style={{
      display: 'flex',
      gap: 40,
      alignItems: 'flex-start',
      flexWrap: 'wrap',
    }}
  >
    <div style={{ flex: 1, minWidth: 300 }}>
      <h4 style={{ marginBottom: 10, color: '#666', fontFamily: 'sans-serif' }}>
        Loading State (Skeleton)
      </h4>
      <AutoSkeleton {...args} loading={true}>
        {children}
      </AutoSkeleton>
    </div>
    <div style={{ flex: 1, minWidth: 300 }}>
      <h4 style={{ marginBottom: 10, color: '#666', fontFamily: 'sans-serif' }}>
        Loaded State (Actual)
      </h4>
      <AutoSkeleton {...args} loading={false}>
        {children}
      </AutoSkeleton>
    </div>
  </div>
);

// Basic Text Example
export const TextBlock: Story = {
  args: { loading: true, children: null },
  render: (args) => (
    <SideBySide args={args}>
      <div style={{ width: 400, fontFamily: 'sans-serif' }}>
        <h1>Heading Level 1</h1>
        <p>
          This is a paragraph of text. It has multiple lines to demonstrate how
          the skeleton will wrap around the text content. The skeleton should
          match the lines approximately or cover the block.
        </p>
        <p>Another short paragraph.</p>
      </div>
    </SideBySide>
  ),
};

// Image Card Example
export const ImageCard: Story = {
  args: { loading: true, children: null }, // Mock args to satisfy TS
  render: (args) => (
    <SideBySide args={args}>
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: 8,
          overflow: 'hidden',
          width: 300,
          fontFamily: 'sans-serif',
        }}
      >
        <img
          src={IMG_PLACEHOLDER}
          alt="Cover"
          style={{ width: '100%', height: 200, display: 'block' }}
        />
        <div style={{ padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Card Title</h3>
          <p style={{ color: '#666' }}>Some description text for the card.</p>
          <button
            style={{
              padding: '8px 16px',
              background: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Action
          </button>
        </div>
      </div>
    </SideBySide>
  ),
};

// Form Inputs
export const FormInputs: Story = {
  args: { loading: true, children: null },
  render: (args) => (
    <SideBySide args={args}>
      <div
        style={{
          width: 300,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 14, fontWeight: 500 }}>Email</label>
          <input
            type="email"
            placeholder="john@example.com"
            style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 14, fontWeight: 500 }}>Password</label>
          <input
            type="password"
            style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          <button
            style={{
              padding: '8px 16px',
              background: '#333',
              color: 'white',
              border: 'none',
              borderRadius: 4,
            }}
          >
            Login
          </button>
          <button
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid #ccc',
              borderRadius: 4,
            }}
          >
            Forgot?
          </button>
        </div>
      </div>
    </SideBySide>
  ),
};

// Config Customization
export const CustomColors: Story = {
  args: {
    loading: true,
    children: null,
    config: {
      color: '#ffc107',
      highlightColor: '#ffecb3',
      borderRadius: '12px',
    },
  },
  render: (args) => (
    <SideBySide args={args}>
      <div
        style={{
          padding: 20,
          background: '#fff3cd',
          borderRadius: 12,
          fontFamily: 'sans-serif',
          width: 300,
        }}
      >
        <h2 style={{ marginTop: 0, color: '#856404' }}>Warning Message</h2>
        <p style={{ marginBottom: 0, color: '#856404' }}>
          This checks custom skeleton colors matching the alert theme.
        </p>
      </div>
    </SideBySide>
  ),
};

// Interactive Toggle Demo
const InteractiveDemo = () => {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <h3 style={{ marginBottom: 10 }}>Interactive Mode</h3>
      <button
        onClick={() => setLoading(!loading)}
        style={{ marginBottom: 20, padding: '8px 16px', cursor: 'pointer' }}
      >
        <span style={{ marginRight: 8 }}>{loading ? '⏹️' : '▶️'}</span>
        Toggle Loading: <strong>{loading ? 'ON' : 'OFF'}</strong>
      </button>
      <AutoSkeleton loading={loading}>
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: 8,
            overflow: 'hidden',
            width: 300,
          }}
        >
          <img
            src={IMG_PLACEHOLDER}
            alt="Cover"
            style={{
              width: '100%',
              height: 150,
              display: 'block',
              objectFit: 'cover',
            }}
          />
          <div style={{ padding: 16 }}>
            <h4 style={{ marginTop: 0 }}>Dynamic Content</h4>
            <p style={{ color: '#666', fontSize: 14 }}>
              Toggle the button above to see the transition between skeleton and
              content.
            </p>
          </div>
        </div>
      </AutoSkeleton>
    </div>
  );
};

export const Interactive: Story = {
  args: { loading: true, children: null },
  render: () => <InteractiveDemo />,
};

// Data Fetching List Pattern
const DataFetchingDemo = () => {
  const [data, setData] = useState<any[] | null>(null);

  // Simulate fetch
  const fetchData = () => {
    setData(null); // Reset to loading
    setTimeout(() => {
      setData([
        {
          id: 1,
          title: 'Real Item 1',
          desc: 'Description for item 1',
          img: AVATAR_PLACEHOLDER,
        },
        {
          id: 2,
          title: 'Real Item 2',
          desc: 'Description for item 2',
          img: AVATAR_PLACEHOLDER,
        },
        {
          id: 3,
          title: 'Real Item 3',
          desc: 'Description for item 3',
          img: AVATAR_PLACEHOLDER,
        },
      ]);
    }, 2000);
  };

  // Auto-fetch on mount
  React.useEffect(() => {
    fetchData();
  }, []);

  // The component we want to skeletonize
  const CardItem = ({ title, desc, img }: any) => (
    <div
      style={{
        display: 'flex',
        gap: 16,
        border: '1px solid #eee',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <img
        src={img}
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          objectFit: 'cover',
        }}
        alt=""
      />
      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 8px 0' }}>{title}</h4>
        <p style={{ margin: 0, color: '#666', fontSize: 14 }}>{desc}</p>
      </div>
      <button
        style={{
          padding: '8px 12px',
          borderRadius: 6,
          border: 'none',
          background: '#eee',
          cursor: 'pointer',
        }}
      >
        View
      </button>
    </div>
  );

  return (
    <div style={{ width: 400 }}>
      <div
        style={{
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: 0, fontFamily: 'sans-serif' }}>User List</h3>
        <button
          onClick={fetchData}
          style={{ padding: '6px 12px', cursor: 'pointer' }}
        >
          Refetch
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {!data
          ? // LOADING STATE:
            // Render "Template" items with dummy data wrapped in AutoSkeleton.
            // This allows AutoSkeleton to measure the layout of an *actual* card.
            Array.from({ length: 3 }).map((_, i) => (
              <AutoSkeleton key={i} loading={true}>
                <CardItem
                  title="Loading User Name"
                  desc="This is a placeholder description that simulates length."
                  img={AVATAR_PLACEHOLDER}
                />
              </AutoSkeleton>
            ))
          : // LOADED STATE:
            // Render actual data
            data.map((item) => <CardItem key={item.id} {...item} />)}
      </div>
    </div>
  );
};

export const DataFetchingList: Story = {
  args: { loading: true, children: null },
  render: () => <DataFetchingDemo />,
};

// Accessibility: hidden content must not be reachable while loading
const AccessibilityDemo = ({ loading }: { loading: boolean }) => {
  const [clicks, setClicks] = useState(0);
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <p data-testid="click-count">Clicks: {clicks}</p>
      <AutoSkeleton loading={loading} loadingLabel="Loading profile form">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            padding: 16,
            border: '1px solid #ddd',
            borderRadius: 8,
            width: 260,
          }}
        >
          <label htmlFor="a11y-name">Name</label>
          <input id="a11y-name" placeholder="Jane Doe" />
          <button type="button" onClick={() => setClicks((c) => c + 1)}>
            Save
          </button>
        </div>
      </AutoSkeleton>
    </div>
  );
};

export const Accessibility: Story = {
  args: { loading: true, children: null },
  render: (args) => <AccessibilityDemo loading={args.loading} />,
  play: async ({ canvasElement, args }) => {
    if (!args.loading) return;
    const canvas = within(canvasElement);

    // Announced to screen readers
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

// Layout: the wrapper must not shrink full-width or flex children
const ProfileCard = () => (
  <div
    data-testid="full-width-card"
    style={{
      padding: 16,
      border: '1px solid #ddd',
      borderRadius: 8,
      fontFamily: 'sans-serif',
    }}
  >
    <h4 style={{ margin: '0 0 8px' }}>Full-width card</h4>
    <p style={{ margin: 0 }}>Stretches to its parent, like any block.</p>
  </div>
);

export const FullWidthLayout: Story = {
  args: { loading: true, children: null },
  parameters: { layout: 'padded' },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div data-testid="block-parent" style={{ width: 600 }}>
        <AutoSkeleton loading={args.loading}>
          <ProfileCard />
        </AutoSkeleton>
      </div>
      <div
        data-testid="flex-parent"
        style={{ display: 'flex', flexDirection: 'column', width: 400 }}
      >
        <AutoSkeleton loading={args.loading}>
          <ProfileCard />
        </AutoSkeleton>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const id of ['block-parent', 'flex-parent']) {
      const parent = within(canvasElement).getByTestId(id);
      const wrapper = parent.firstElementChild as HTMLElement;
      const diff = Math.abs(
        parent.getBoundingClientRect().width -
          wrapper.getBoundingClientRect().width,
      );
      await expect(diff).toBeLessThanOrEqual(1);
    }
  },
};

// Text: one bar per rendered line, short last line, no overlap for nested inline text
export const MultiLineParagraph: Story = {
  args: { loading: true, children: null },
  render: (args) => (
    <SideBySide args={args}>
      <div style={{ width: 280, fontFamily: 'sans-serif' }}>
        <h3 style={{ margin: '0 0 8px' }}>
          Release notes for <strong>v2.0</strong>
        </h3>
        <p data-testid="paragraph" style={{ margin: 0, lineHeight: 1.5 }}>
          Skeletons now follow the real shape of your text. A paragraph that
          wraps onto several lines gets one bar per line, and the last bar is
          only as long as the last line.
        </p>
      </div>
    </SideBySide>
  ),
  play: async ({ canvasElement }) => {
    // The first SideBySide column is the loading one
    const paragraph = within(canvasElement).getAllByTestId('paragraph')[0];
    const range = document.createRange();
    range.selectNodeContents(paragraph.firstChild!);
    const lineTops = new Set(
      Array.from(range.getClientRects()).map((r) => Math.round(r.top)),
    );
    await expect(lineTops.size).toBeGreaterThan(1);

    const p = paragraph.getBoundingClientRect();
    const bars = within(canvasElement)
      .getAllByTestId('skeleton')
      .filter((bar) => {
        const b = bar.getBoundingClientRect();
        return b.top >= p.top - 1 && b.bottom <= p.bottom + 1;
      });
    await expect(bars).toHaveLength(lineTops.size);

    const widths = bars.map((b) => b.getBoundingClientRect().width);
    await expect(widths[widths.length - 1]).toBeLessThan(Math.max(...widths));
  },
};

// Reveal timing: delay + minDuration stop fast loads from flashing a skeleton
const TimingCard = ({ title }: { title: string }) => (
  <div
    style={{
      width: 240,
      padding: 16,
      border: '1px solid #ddd',
      borderRadius: 8,
      fontFamily: 'sans-serif',
    }}
  >
    <h4 style={{ margin: '0 0 8px' }}>{title}</h4>
    <p style={{ margin: 0 }}>Content arrives after a simulated request.</p>
  </div>
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
    <div style={{ fontFamily: 'sans-serif' }}>
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
          <p style={{ fontSize: 12, color: '#666' }}>Naive (0 / 0)</p>
          <AutoSkeleton loading={loading}>
            <TimingCard title="No timing" />
          </AutoSkeleton>
        </div>
        <div data-testid="tuned">
          <p style={{ fontSize: 12, color: '#666' }}>
            Tuned ({delay}ms delay / {minDuration}ms min)
          </p>
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

// Server rendering: the HTML a server sends before hydration (no measurement possible)
const serverHtml = renderToString(
  <AutoSkeleton loading>
    <div
      style={{
        width: 280,
        padding: 16,
        border: '1px solid #ddd',
        borderRadius: 8,
        fontFamily: 'sans-serif',
      }}
    >
      <h4 style={{ margin: '0 0 8px' }}>Server-rendered card</h4>
      <p style={{ margin: 0 }}>
        Before hydration this area pulses as one block.
      </p>
    </div>
  </AutoSkeleton>,
);

export const ServerRenderFallback: Story = {
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
    // The fallback block covers the space the hidden card reserves
    await expect(block.getBoundingClientRect().height).toBe(
      card.getBoundingClientRect().height,
    );
  },
};

// Performance: a long list is scanned once per frame, only while loading
const LargeListDemo = ({ rows }: { rows: number }) => {
  const [loading, setLoading] = useState(true);
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <button type="button" onClick={() => setLoading((l) => !l)}>
        Toggle loading ({loading ? 'on' : 'off'})
      </button>
      <AutoSkeleton loading={loading} style={{ marginTop: 12, width: 320 }}>
        <ul style={{ margin: 0, paddingLeft: 16 }} data-testid="large-list">
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

export const LargeList: StoryObj<{ rows: number }> = {
  args: { rows: 300 },
  argTypes: {
    rows: { control: { type: 'range', min: 10, max: 1000, step: 10 } },
  },
  render: (args) => <LargeListDemo rows={args.rows} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    // One bar per row
    await expect(canvas.getAllByTestId('skeleton')).toHaveLength(args.rows);

    // Toggling off and on again re-measures before paint
    const toggle = canvas.getByRole('button', { name: /toggle loading/i });
    await userEvent.click(toggle);
    await userEvent.click(toggle);
    await expect(canvas.getAllByTestId('skeleton')).toHaveLength(args.rows);
  },
};
