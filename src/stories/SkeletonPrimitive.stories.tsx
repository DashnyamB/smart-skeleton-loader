import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { SkeletonPrimitive } from '../SkeletonPrimitive';
import { Caption } from './fixtures';

/**
 * The building block AutoSkeleton draws with. Use it directly for one-off,
 * hand-placed placeholders.
 */
const meta = {
  title: 'Building blocks/SkeletonPrimitive',
  component: SkeletonPrimitive,
  tags: ['autodocs'],
  args: {
    width: 240,
    height: 16,
    borderRadius: 4,
    animation: 'pulse',
    adaptive: true,
  },
  argTypes: {
    animation: {
      control: 'inline-radio',
      options: ['pulse', 'shimmer', 'none'],
    },
    shimmer: { control: 'inline-radio', options: ['sync', 'local'] },
    kind: {
      control: 'select',
      options: [
        'text',
        'heading',
        'avatar',
        'media',
        'button',
        'input',
        'block',
      ],
    },
  },
} satisfies Meta<typeof SkeletonPrimitive>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** A hand-built placeholder: avatar, two text lines and a media block. */
export const Composed: Story = {
  render: (args) => (
    <div style={{ width: 280, display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <SkeletonPrimitive
          {...args}
          kind="avatar"
          width={40}
          height={40}
          borderRadius="50%"
        />
        <div style={{ flex: 1, display: 'grid', gap: 6 }}>
          <SkeletonPrimitive {...args} kind="heading" width="60%" height={14} />
          <SkeletonPrimitive {...args} kind="text" width="90%" height={10} />
        </div>
      </div>
      <SkeletonPrimitive
        {...args}
        kind="media"
        width="100%"
        height={140}
        borderRadius={8}
      />
    </div>
  ),
};

/** `ink` tints an adaptive bar from any color; `adaptive={false}` uses the fixed greys. */
export const InkAndStatic: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12 }}>
      {[
        ['inherits the text color', {}],
        ['ink="#2563eb"', { ink: '#2563eb' }],
        ['ink="#dc2626"', { ink: '#dc2626' }],
        ['adaptive={false}', { adaptive: false }],
      ].map(([label, extra]) => (
        <div key={label as string} data-testid={label as string}>
          <Caption>{label as string}</Caption>
          <SkeletonPrimitive
            {...args}
            animation="none"
            {...(extra as object)}
          />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const bg = (id: string) =>
      getComputedStyle(
        within(within(canvasElement).getByTestId(id)).getByTestId('skeleton'),
      ).backgroundColor;
    await expect(bg('ink="#2563eb"')).not.toBe(bg('ink="#dc2626"'));
    await expect(bg('adaptive={false}')).toBe('rgb(224, 224, 224)');
  },
};
