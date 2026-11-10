import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { AutoSkeleton } from '../AutoSkeleton';

import '../styles.css'; // Import the default theme styles

const meta = {
  title: 'Components/AutoSkeleton/Theming',
  component: AutoSkeleton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    loading: { control: 'boolean' },
    config: { control: 'object' },
  },
} satisfies Meta<typeof AutoSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper for presentation
const ThemeDemoBlock = ({
  themeName,
  themeProp,
}: {
  themeName: string;
  themeProp: 'light' | 'dark' | 'auto';
}) => (
  <div style={{ marginBottom: 40 }}>
    <h3>{themeName}</h3>
    <p style={{ color: '#666', marginBottom: 10 }}>
      config.theme = "{themeProp}"
    </p>
    <div
      style={{
        padding: 20,
        border: '1px solid #ddd',
        borderRadius: 8,
        // Simulate a background to see contrast if needed, primarily for Light/Dark checking
        background: themeProp === 'dark' ? '#1a1a1a' : '#ffffff',
        color: themeProp === 'dark' ? '#fff' : '#000',
        transition: 'background 0.3s',
      }}
    >
      <AutoSkeleton loading={true} config={{ theme: themeProp }}>
        <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'red',
            }}
          ></div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 8px' }}>Themed Skeleton</h3>
            <p style={{ margin: 0 }}>
              The skeleton colors should match the {themeName} theme
              expectations.
            </p>
          </div>
        </div>
      </AutoSkeleton>
    </div>
  </div>
);

export const AllThemes: Story = {
  args: { loading: true, children: null },
  render: () => (
    <div style={{ fontFamily: 'sans-serif', maxWidth: 600 }}>
      <h1>Theme Integration</h1>
      <p>
        The <code>AutoSkeleton</code> component now supports a{' '}
        <code>theme</code> prop via config. You must import the CSS (or define
        variables) for this to work.
      </p>

      <ThemeDemoBlock themeName="Light Theme" themeProp="light" />
      <ThemeDemoBlock themeName="Dark Theme" themeProp="dark" />

      <div style={{ marginBottom: 40 }}>
        <h3>Auto Theme (System Default)</h3>
        <p>config.theme = "auto" (default)</p>
        <p>
          <em>Change your OS or Browser color scheme to see this adapt.</em>
        </p>
        <div
          style={{ padding: 20, border: '1px dashed #ccc', borderRadius: 8 }}
        >
          <AutoSkeleton loading={true} config={{ theme: 'auto' }}>
            <div style={{ height: 80 }}>Content</div>
          </AutoSkeleton>
        </div>
      </div>
    </div>
  ),
};

export const DarkModeExplicit: Story = {
  args: {
    loading: true,
    config: { theme: 'dark' },
    children: null,
  },
  render: (args) => (
    <div style={{ background: '#000', padding: 20, borderRadius: 8 }}>
      <h3 style={{ color: 'white' }}>Dark Context</h3>
      <AutoSkeleton {...args}>
        <div style={{ color: 'white' }}>
          <p>Some white text on dark background.</p>
        </div>
      </AutoSkeleton>
    </div>
  ),
};

// User-customizable theme colors
export const CustomThemeColors: Story = {
  args: {
    loading: true,
    config: {
      theme: 'dark',
      darkColor: '#3b82f6',
      darkHighlightColor: '#60a5fa',
    },
    children: null,
  },
  render: (args) => (
    <div
      style={{
        background: '#0f172a',
        padding: 20,
        borderRadius: 8,
        fontFamily: 'sans-serif',
      }}
    >
      <h3 style={{ color: 'white', marginTop: 0 }}>Custom Dark Theme Colors</h3>
      <p style={{ color: '#94a3b8', marginBottom: 16 }}>
        Using <code>darkColor</code> and <code>darkHighlightColor</code> in
        config.
      </p>
      <AutoSkeleton {...args}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              background: '#3b82f6',
            }}
          ></div>
          <div>
            <h4 style={{ margin: 0, color: 'white' }}>Blue Skeleton</h4>
            <p style={{ margin: 0, color: '#cbd5e1' }}>
              Custom colors for your brand.
            </p>
          </div>
        </div>
      </AutoSkeleton>
    </div>
  ),
};

// theme: 'auto' (the default) applies lightColor/darkColor by OS color scheme
export const AutoThemeColors: Story = {
  args: {
    loading: true,
    config: {
      lightColor: '#fcd34d',
      lightHighlightColor: '#fde68a',
      darkColor: '#1d4ed8',
      darkHighlightColor: '#3b82f6',
    },
    children: null,
  },
  render: (args) => (
    <div style={{ fontFamily: 'sans-serif' }}>
      <p style={{ marginTop: 0 }}>
        No <code>theme</code> set: amber in light mode, blue in dark mode.
        Switch your OS color scheme to see it follow.
      </p>
      <AutoSkeleton {...args}>
        <div style={{ width: 260 }}>
          <h4 style={{ margin: '0 0 8px' }}>Follows the OS scheme</h4>
          <p style={{ margin: 0 }}>
            Theme-specific colors without forcing a theme.
          </p>
        </div>
      </AutoSkeleton>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const bar = within(canvasElement).getAllByTestId('skeleton')[0];
    await expect(bar.style.backgroundColor).toBe(
      dark ? 'rgb(29, 78, 216)' : 'rgb(252, 211, 77)',
    );
  },
};
