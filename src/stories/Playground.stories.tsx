import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { AutoSkeleton } from '../AutoSkeleton';
import type { SkeletonAnimation } from '../SkeletonPrimitive';
import { ArticleCard } from './fixtures';

interface PlaygroundArgs {
  loading: boolean;
  delay: number;
  minDuration: number;
  loadingLabel: string;
  animation: SkeletonAnimation;
  shimmer: 'sync' | 'local';
  color: string;
  adaptive: 'surface' | 'inherit';
  borderRadius: string;
}

/** Every option in one place. Flip `loading` to watch the crossfade. */
const meta = {
  title: 'AutoSkeleton/Playground',
  args: {
    loading: true,
    delay: 150,
    minDuration: 400,
    loadingLabel: 'Loading…',
    animation: 'pulse',
    shimmer: 'sync',
    color: 'adaptive',
    adaptive: 'surface',
    borderRadius: '',
  },
  argTypes: {
    loading: { control: 'boolean' },
    delay: { control: { type: 'range', min: 0, max: 1000, step: 50 } },
    minDuration: { control: { type: 'range', min: 0, max: 2000, step: 100 } },
    animation: {
      control: 'inline-radio',
      options: ['pulse', 'shimmer', 'none'],
    },
    shimmer: { control: 'inline-radio', options: ['sync', 'local'] },
    color: {
      control: 'text',
      description: "'adaptive', 'static' or any CSS color",
    },
    adaptive: { control: 'inline-radio', options: ['surface', 'inherit'] },
    borderRadius: {
      control: 'text',
      description: 'Fallback radius; empty = detected from your elements',
    },
  },
  render: ({
    loading,
    delay,
    minDuration,
    loadingLabel,
    borderRadius,
    ...config
  }) => (
    <AutoSkeleton
      loading={loading}
      delay={delay}
      minDuration={minDuration}
      loadingLabel={loadingLabel}
      config={{ ...config, borderRadius: borderRadius || undefined }}
    >
      <ArticleCard />
    </AutoSkeleton>
  ),
} satisfies Meta<PlaygroundArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Image, heading, text lines and the button all get bars
    const kinds = new Set(
      canvas.getAllByTestId('skeleton').map((b) => b.dataset.skeletonKind),
    );
    await expect([...kinds]).toEqual(
      expect.arrayContaining(['media', 'heading', 'text', 'button']),
    );
    // Hidden content cannot be reached while loading
    await userEvent.tab();
    await expect(canvasElement.ownerDocument.activeElement?.tagName).not.toBe(
      'BUTTON',
    );
  },
};
