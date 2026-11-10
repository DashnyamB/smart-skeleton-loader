import type { Preview } from '@storybook/react-vite';

const SURFACES = {
  light: { background: '#ffffff', color: '#1f2328' },
  dark: { background: '#0d1117', color: '#e6edf3' },
} as const;

const preview: Preview = {
  // Toolbar switch: the same stories on a light or dark page. Skeletons are
  // adaptive, so they should look right on both without any config.
  globalTypes: {
    surface: {
      description: 'Page background',
      toolbar: {
        title: 'Surface',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light page' },
          { value: 'dark', title: 'Dark page' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { surface: 'light' },
  decorators: [
    (Story, { globals }) => (
      <div
        style={{
          ...SURFACES[(globals.surface as keyof typeof SURFACES) ?? 'light'],
          font: '14px/1.4 system-ui, sans-serif',
          padding: 24,
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    options: {
      storySort: {
        order: [
          'Introduction',
          'AutoSkeleton',
          ['Playground', 'Content detection', 'Styling', 'Behavior'],
          'Building blocks',
        ],
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
