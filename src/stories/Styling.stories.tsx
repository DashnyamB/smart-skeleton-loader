import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState, type CSSProperties } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { AutoSkeleton } from '../AutoSkeleton';
import { SkeletonProvider } from '../SkeletonProvider';
import {
  barsIn,
  Caption,
  IMG_PLACEHOLDER,
  lightness,
  ProfileRow,
  SideBySide,
} from './fixtures';

/** Colors, motion and per-kind styling. Try the Surface toolbar: adaptive bars follow it. */
const meta = {
  title: 'AutoSkeleton/Styling',
  component: AutoSkeleton,
} satisfies Meta<typeof AutoSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(260px, 1fr))',
  gap: 16,
};

const SURFACES = [
  { id: 'page', label: 'Page (follows the toggle)' },
  {
    id: 'sidebar',
    label: 'Dark sidebar',
    background: '#0f172a',
    color: '#e2e8f0',
  },
  { id: 'brand', label: 'Brand card', background: '#1d4ed8', color: '#eff6ff' },
  {
    id: 'sepia',
    label: 'Sepia theme',
    background: '#f4ecd8',
    color: '#5b4636',
  },
] as const;

/** Default. No colors configured: each skeleton tints itself from the surface it sits on. */
export const AdaptiveColor: Story = {
  args: { loading: true, children: null },
  render: function Render() {
    const [dark, setDark] = useState(false);
    return (
      <div
        style={{
          padding: 16,
          borderRadius: 8,
          background: dark ? '#111' : '#fafafa',
          color: dark ? '#eee' : '#222',
        }}
      >
        <button
          type="button"
          onClick={() => setDark((d) => !d)}
          style={{ marginBottom: 16 }}
        >
          Toggle page theme
        </button>
        <div style={grid}>
          {SURFACES.map(({ id, label, ...colors }) => (
            <div
              key={id}
              data-testid={`surface-${id}`}
              style={{ padding: 16, borderRadius: 8, ...colors }}
            >
              <Caption>{label}</Caption>
              <AutoSkeleton loading>
                <ProfileRow />
              </AutoSkeleton>
            </div>
          ))}
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const bar = (id: string) =>
      getComputedStyle(barsIn(canvasElement, `surface-${id}`)[0])
        .backgroundColor;

    // Dark surfaces get light ink, light surfaces get dark ink
    await expect(lightness(bar('sidebar'))).toBeGreaterThan(0.5);
    await expect(lightness(bar('brand'))).toBeGreaterThan(0.5);
    await expect(lightness(bar('sepia'))).toBeLessThan(0.5);
    await expect(lightness(bar('page'))).toBeLessThan(0.5);

    // Switching the theme mid-load re-tints the bars on the page surface
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Toggle page theme' }),
    );
    await waitFor(() => expect(lightness(bar('page'))).toBeGreaterThan(0.5));
  },
};

/** `adaptive: 'surface'` (default) tints per surface; `'inherit'` uses the wrapper's text color everywhere. */
export const SurfaceVsInherit: Story = {
  args: { loading: true, children: null },
  render: () => (
    <div style={grid}>
      {(['surface', 'inherit'] as const).map((mode) => (
        <div key={mode} data-testid={`mode-${mode}`}>
          <Caption>adaptive: '{mode}'</Caption>
          <AutoSkeleton loading config={{ adaptive: mode }}>
            <div
              style={{
                padding: 16,
                borderRadius: 8,
                background: '#0f172a',
                color: '#e2e8f0',
              }}
            >
              <ProfileRow />
            </div>
          </AutoSkeleton>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bar = (mode: string) =>
      getComputedStyle(barsIn(canvasElement, `mode-${mode}`)[0])
        .backgroundColor;
    // Inside the dark card: surface → light ink, inherit → the page's dark ink
    await expect(lightness(bar('surface'))).toBeGreaterThan(0.5);
    await expect(lightness(bar('inherit'))).toBeLessThan(0.5);
  },
};

const FIXED_CASES = [
  { id: 'static', label: "color: 'static'", config: { color: 'static' } },
  {
    id: 'dark-theme',
    label: "theme: 'dark'",
    config: { theme: 'dark' },
    panel: { background: '#111', color: '#eee' },
  },
  { id: 'explicit', label: "color: '#f59e0b'", config: { color: '#f59e0b' } },
  {
    id: 'per-scheme',
    label: 'lightColor / darkColor (follows the OS scheme)',
    config: { lightColor: '#fcd34d', darkColor: '#1d4ed8' },
  },
  {
    id: 'css-vars',
    label: '--auto-skeleton-color CSS variable',
    config: {},
    panel: { '--auto-skeleton-color': '#a78bfa' } as CSSProperties,
  },
] as const;

/**
 * Opting out of adaptive color. Precedence: color props › `--auto-skeleton-color` › adaptive.
 * Shown without animation so the base color is visible.
 */
export const FixedColors: Story = {
  args: { loading: true, children: null },
  render: () => (
    <SkeletonProvider config={{ animation: 'none' }}>
      <div style={grid}>
        {FIXED_CASES.map((c) => (
          <div
            key={c.id}
            data-testid={c.id}
            style={{
              padding: 16,
              borderRadius: 8,
              ...('panel' in c ? c.panel : {}),
            }}
          >
            <Caption>{c.label}</Caption>
            <AutoSkeleton loading config={c.config}>
              <ProfileRow />
            </AutoSkeleton>
          </div>
        ))}
      </div>
    </SkeletonProvider>
  ),
  play: async ({ canvasElement }) => {
    const bg = (id: string) =>
      getComputedStyle(barsIn(canvasElement, id)[0]).backgroundColor;
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    await expect(bg('static')).toBe(
      dark ? 'rgb(42, 42, 42)' : 'rgb(224, 224, 224)',
    );
    await expect(bg('dark-theme')).toBe('rgb(42, 42, 42)');
    await expect(bg('explicit')).toBe('rgb(245, 158, 11)');
    await expect(bg('per-scheme')).toBe(
      dark ? 'rgb(29, 78, 216)' : 'rgb(252, 211, 77)',
    );
    await expect(bg('css-vars')).toBe('rgb(167, 139, 250)');
  },
};

const ANIMATIONS = [
  { id: 'pulse', config: { animation: 'pulse' } },
  { id: 'shimmer', config: { animation: 'shimmer' } },
  { id: 'shimmer-local', config: { animation: 'shimmer', shimmer: 'local' } },
  { id: 'none', config: { animation: 'none' } },
] as const;

/** Pulse (default), shimmer, or static. Shimmer bars share one page-wide sweep unless `shimmer: 'local'`. Off under `prefers-reduced-motion`. */
export const Animations: Story = {
  args: { loading: true, children: null },
  render: () => (
    <div style={grid}>
      {ANIMATIONS.map(({ id, config }) => (
        <div key={id} data-testid={id}>
          <Caption>{JSON.stringify(config).replace(/"/g, "'")}</Caption>
          <AutoSkeleton loading config={config}>
            <ProfileRow />
          </AutoSkeleton>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const style = (id: string) =>
      getComputedStyle(barsIn(canvasElement, id)[0]);
    await expect(style('pulse').animationName).toBe('auto-skeleton-pulse');
    await expect(style('shimmer').animationName).toBe('auto-skeleton-shimmer');
    await expect(style('none').animationName).toBe('none');
    await expect(style('shimmer').backgroundAttachment).toBe('fixed');
    await expect(style('shimmer-local').backgroundAttachment).toBe('scroll');
  },
};

const KIND_CSS = `
.demo-avatar { outline: 2px solid color-mix(in srgb, currentColor 25%, transparent); outline-offset: 2px; }
.demo-heading { --auto-skeleton-heading-radius: 999px; }
.demo-media { opacity: 0.6; }
`;

/** Style each kind of bar with `config.classNames` (Tailwind works too), `config.styles` or CSS tokens. */
export const PerKindStyling: Story = {
  args: { loading: true, children: null },
  render: () => (
    <>
      <style>{KIND_CSS}</style>
      <SideBySide
        props={{
          config: {
            classNames: {
              avatar: 'demo-avatar',
              heading: 'demo-heading',
              media: 'demo-media',
            },
          },
        }}
      >
        <div style={{ width: 300 }}>
          <ProfileRow />
          <h3 style={{ margin: '12px 0 8px' }}>Weekend in the Alps</h3>
          <img
            src={IMG_PLACEHOLDER}
            alt=""
            style={{ width: '100%', height: 140, display: 'block' }}
          />
        </div>
      </SideBySide>
    </>
  ),
  play: async ({ canvasElement }) => {
    const bars = barsIn(canvasElement, 'loading');
    const ofKind = (kind: string) =>
      bars.find((b) => b.dataset.skeletonKind === kind)!;
    await expect(ofKind('avatar')).toHaveClass('demo-avatar');
    await expect(getComputedStyle(ofKind('avatar')).outlineStyle).toBe('solid');
    await expect(getComputedStyle(ofKind('heading')).borderTopLeftRadius).toBe(
      '999px',
    );
    await expect(getComputedStyle(ofKind('media')).opacity).toBe('0.6');
  },
};

/** `<SkeletonProvider>` sets app-wide defaults; props on one AutoSkeleton still win. */
export const ProviderDefaults: Story = {
  args: { loading: true, children: null },
  render: () => (
    <SkeletonProvider config={{ animation: 'shimmer', borderRadius: 999 }}>
      <div style={grid}>
        {['from-provider-1', 'from-provider-2'].map((id) => (
          <div key={id} data-testid={id}>
            <Caption>Provider: shimmer, pill radius</Caption>
            <AutoSkeleton loading>
              <ProfileRow />
            </AutoSkeleton>
          </div>
        ))}
        <div data-testid="overridden">
          <Caption>Instance override: pulse, 4px</Caption>
          <AutoSkeleton
            loading
            config={{ animation: 'pulse', borderRadius: 4 }}
          >
            <ProfileRow />
          </AutoSkeleton>
        </div>
      </div>
    </SkeletonProvider>
  ),
  play: async ({ canvasElement }) => {
    const animation = (id: string) =>
      getComputedStyle(barsIn(canvasElement, id)[0]).animationName;
    await expect(animation('from-provider-1')).toBe('auto-skeleton-shimmer');
    await expect(animation('from-provider-2')).toBe('auto-skeleton-shimmer');
    await expect(animation('overridden')).toBe('auto-skeleton-pulse');
  },
};
