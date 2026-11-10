/**
 * Shared demo content for the stories. Plain inline styles on purpose: the
 * skeleton must work with whatever styling the host app uses.
 */
import type { CSSProperties, ReactNode } from 'react';
import { within } from 'storybook/test';

import { AutoSkeleton, type AutoSkeletonProps } from '../AutoSkeleton';

export const IMG_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23666666'%3EImage%3C/text%3E%3C/svg%3E";
export const AVATAR_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23cccccc'/%3E%3C/svg%3E";

const BORDER = '1px solid color-mix(in srgb, currentColor 18%, transparent)';

/** Small grey caption above a demo. */
export const Caption = ({ children }: { children: ReactNode }) => (
  <p style={{ margin: '0 0 8px', fontSize: 12, opacity: 0.65 }}>{children}</p>
);

/** The same content rendered loading (left) and loaded (right). */
export const SideBySide = ({
  children,
  props,
}: {
  children: ReactNode;
  props?: Partial<AutoSkeletonProps>;
}) => (
  <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
    {[true, false].map((loading) => (
      <div key={String(loading)} data-testid={loading ? 'loading' : 'loaded'}>
        <Caption>{loading ? 'Loading' : 'Loaded'}</Caption>
        <AutoSkeleton {...props} loading={loading}>
          {children}
        </AutoSkeleton>
      </div>
    ))}
  </div>
);

export const ProfileRow = ({
  name = 'Ada Lovelace',
  role = 'Analytical Engine team',
}: {
  name?: string;
  role?: string;
}) => (
  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
    <img
      src={AVATAR_PLACEHOLDER}
      alt=""
      width={40}
      height={40}
      style={{ borderRadius: '50%' }}
    />
    <div>
      <strong style={{ display: 'block' }}>{name}</strong>
      <span>{role}</span>
    </div>
  </div>
);

export const ArticleCard = ({ width = 300 }: { width?: number }) => (
  <article
    style={{ width, border: BORDER, borderRadius: 8, overflow: 'hidden' }}
  >
    <img
      src={IMG_PLACEHOLDER}
      alt=""
      style={{ width: '100%', height: 160, display: 'block' }}
    />
    <div style={{ padding: 16 }}>
      <h3 style={{ margin: '0 0 8px' }}>Weekend in the Alps</h3>
      <p style={{ margin: '0 0 12px', lineHeight: 1.5 }}>
        Three days of hiking, two mountain huts and one very long cable car ride
        above the clouds.
      </p>
      <button type="button" style={{ padding: '6px 14px', borderRadius: 6 }}>
        Read more
      </button>
    </div>
  </article>
);

export const LoginForm = () => (
  <form
    style={{ width: 280, display: 'grid', gap: 8 }}
    onSubmit={(e) => e.preventDefault()}
  >
    <label htmlFor="story-email">Email</label>
    <input id="story-email" type="email" placeholder="ada@example.com" />
    <label htmlFor="story-password">Password</label>
    <input id="story-password" type="password" />
    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
      <button type="submit">Sign in</button>
      <button type="button">Forgot password?</button>
    </div>
  </form>
);

export const Panel = ({
  children,
  testId,
  style,
}: {
  children: ReactNode;
  testId?: string;
  style?: CSSProperties;
}) => (
  <div
    data-testid={testId}
    style={{ padding: 16, borderRadius: 8, border: BORDER, ...style }}
  >
    {children}
  </div>
);

/** All skeleton bars inside the element with `testId`. */
export const barsIn = (canvasElement: HTMLElement, testId: string) =>
  within(within(canvasElement).getByTestId(testId)).getAllByTestId('skeleton');

/** Rough 0–1 lightness of a computed color (Chrome reports animated colors in oklab). */
export const lightness = (color: string) => {
  const nums = (color.match(/-?[\d.]+/g) ?? []).map(Number);
  if (color.startsWith('ok')) return nums[0]; // oklab()/oklch(): L comes first
  const rgb = color.startsWith('color(')
    ? nums.slice(0, 3)
    : nums.slice(0, 3).map((n) => n / 255);
  return (rgb[0] + rgb[1] + rgb[2]) / 3;
};
