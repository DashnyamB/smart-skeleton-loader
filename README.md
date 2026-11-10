<div align="center">

# smart-skeleton-loader

### Stop hand-writing skeleton screens.

**Wrap any React component. Get a pixel-perfect loading skeleton, generated from your real layout.**

[![npm version](https://img.shields.io/npm/v/smart-skeleton-loader.svg)](https://www.npmjs.com/package/smart-skeleton-loader)
[![npm downloads](https://img.shields.io/npm/dm/smart-skeleton-loader.svg)](https://www.npmjs.com/package/smart-skeleton-loader)
[![bundle size](https://img.shields.io/bundlephobia/minzip/smart-skeleton-loader)](https://bundlephobia.com/package/smart-skeleton-loader)
[![types](https://img.shields.io/npm/types/smart-skeleton-loader)](https://www.npmjs.com/package/smart-skeleton-loader)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**~4.5 kB gzipped** · **Zero dependencies** · **React 19** · **Next.js ready** · **TypeScript**

</div>

```tsx
<AutoSkeleton loading={isLoading}>
  <UserCard user={user} />
</AutoSkeleton>
```

That's the whole API. No `<Skeleton width={120} />` copies of every component, no skeletons that drift out of sync when the design changes.

---

## Why smart-skeleton-loader?

Hand-written skeletons are a second copy of your UI. Every time a card gets a new field, a font size changes, or a layout goes responsive, someone has to update the skeleton too, and usually nobody does.

`smart-skeleton-loader` takes a different approach: it renders your **real** component invisibly, measures what the browser actually laid out, and draws a skeleton exactly on top of it.

|                                   | Hand-written skeletons  |  **smart-skeleton-loader**   |
| --------------------------------- | :---------------------: | :--------------------------: |
| Extra skeleton code per component |    😩 Yes, all of it    |           ✅ None            |
| Stays in sync with design changes |    ❌ Manual updates    |         ✅ Automatic         |
| Matches responsive layouts        | ⚠️ Separate breakpoints |       ✅ Measured live       |
| One bar per wrapped text line     |      ❌ Guesswork       |           ✅ Exact           |
| Layout shift on reveal            |        ⚠️ Often         |           ✅ Zero            |
| Flicker on fast refetches         |        ⚠️ Often         |     ✅ Built-in `delay`      |
| Screen-reader support             |      🤷 Up to you       | ✅ `aria-busy` + live region |

## ✨ Features

- 📏 **Measures your real layout.** Text, images, inputs, buttons and cards are detected and skeletonized automatically.
- 📝 **Line-accurate text.** One bar per rendered line, with a naturally shorter last line, just like the real paragraph.
- 🃏 **Understands containers.** Cards with borders, backgrounds or shadows keep their look; only the content inside pulses.
- 🧘 **Zero layout shift.** The real content holds its space the whole time, then crossfades in. Your CLS score will thank you.
- ⏱️ **No flicker, ever.** Fast refetches never flash a skeleton (`delay`), and a skeleton that does appear never blinks away (`minDuration`).
- ♿ **Accessible by default.** Hidden content is `inert`, the wrapper is `aria-busy`, and loading is announced to screen readers.
- 🎨 **Matches your theme automatically.** Bars are tinted from the text color of the surface they sit on, so light pages, dark sidebars, brand-colored cards and custom themes all look right with zero config, and a theme switch mid-load re-tints them.
- 🌗 **Pulse, shimmer or static.** `prefers-reduced-motion` is respected; fixed light/dark palettes are available too.
- ⚡ **Next.js & SSR friendly.** Ships with `'use client'`, works from Server Components, and shows a placeholder before hydration.
- 🪶 **Tiny and dependency-free.** ~4.5 kB gzipped, nothing but `react` as a peer. No CSS import required.

## 📦 Installation

```bash
npm install smart-skeleton-loader
```

```bash
pnpm add smart-skeleton-loader
# or
yarn add smart-skeleton-loader
# or
bun add smart-skeleton-loader
```

Requires `react` 19+. That's it: no providers, no CSS to import, no config.

## 🚀 Quick start

```tsx
import { AutoSkeleton } from 'smart-skeleton-loader';

const UserProfile = ({ loading, user }) => (
  <AutoSkeleton loading={loading}>
    <div className="card">
      <img src={user?.avatar ?? '/placeholder.png'} alt="Avatar" />
      <h3>{user?.name ?? 'Placeholder Name'}</h3>
      <p>{user?.bio ?? 'A line of text about as long as a real bio.'}</p>
      <button>Follow</button>
    </div>
  </AutoSkeleton>
);
```

> [!TIP]
> **The one rule: AutoSkeleton measures what is rendered.** While loading, give your component
> realistic **placeholder data**. An empty `<h3></h3>` or an image without a `src` has no size,
> so there is nothing to measure.

## 📚 Recipes

### Lists and data fetching (the template pattern)

You usually start with no data. Render a few "template" items while loading. AutoSkeleton measures them, draws the skeleton, then crossfades to the real items.

```tsx
import { AutoSkeleton } from 'smart-skeleton-loader';

const TEMPLATE_USERS = Array.from({ length: 3 }, (_, i) => ({
  id: `template-${i}`,
  name: 'Template User Name',
  bio: 'A template bio, about as long as a real one.',
  avatar: '/placeholder.png',
}));

const UserList = () => {
  const { data, isLoading } = useFetchUsers(); // TanStack Query, SWR, RTK Query, fetch…
  const users = isLoading ? TEMPLATE_USERS : data;

  return (
    <AutoSkeleton loading={isLoading}>
      <div className="list">
        {users.map((user) => (
          <UserCard key={user.id} {...user} />
        ))}
      </div>
    </AutoSkeleton>
  );
};
```

### Cards and containers

AutoSkeleton tells **content** apart from **containers**:

- **Content** (text, images, inputs, buttons) becomes **animated bars**, one per text line.
- **Containers** (elements with a visible `border`, `background-color` or `box-shadow`) render as a **static clone** with your exact styles, without animation.

So a card still looks like a card while its content pulses inside it.

### Charts, maps and decorations

```tsx
<div data-skeleton-block>
  <Chart data={data} /> {/* one solid block, children skipped */}
</div>

<span data-skeleton-ignore>NEW</span> {/* no skeleton at all */}
```

### Theming

**Adaptive color (default).** With no color configured, each bar is the text color of the surface it sits on at 12% opacity. A dark sidebar inside a light page gets light bars; a blue card gets bluish bars. Everything on one surface gets the same tint, so skeletons stay consistent across the app. Tune the strength with a CSS variable:

```css
:root {
  --auto-skeleton-strength: 16%; /* default 12% */
}
```

**Fixed colors.** Explicit colors always win over adaptive ones:

```tsx
<AutoSkeleton
  loading={isLoading}
  config={{
    animation: 'shimmer',
    theme: 'auto', // follows the OS color scheme live
    lightColor: '#e5e7eb',
    darkColor: '#1f2937',
    borderRadius: '8px',
  }}
>
  <MyComponent />
</AutoSkeleton>
```

Prefer CSS? Set `--auto-skeleton-color` and `--auto-skeleton-highlight` globally, or import the optional `smart-skeleton-loader/styles.css` (supports a `.dark` class). Either one replaces adaptive color.

Color precedence: `color` props › `--auto-skeleton-color` CSS variable › adaptive. `config.color: 'static'` or an explicit `theme: 'light' | 'dark'` uses the fixed greys instead.

### Styling each kind of bar

Every bar knows what it stands for: `text`, `heading`, `avatar`, `media`, `button`, `input`, `block` or `container`. Target them with classes (Tailwind works), inline styles, or plain CSS:

```tsx
<AutoSkeleton
  loading={isLoading}
  config={{
    classNames: { avatar: 'ring-2 ring-offset-2', heading: 'w-1/2' },
    styles: { media: { opacity: 0.6 } },
  }}
>
  <PostCard />
</AutoSkeleton>
```

```css
/* Each bar has .auto-skeleton--{kind} and [data-skeleton-kind] */
.auto-skeleton--media {
  opacity: 0.6;
}
/* Per-kind radius tokens */
:root {
  --auto-skeleton-heading-radius: 999px;
  --auto-skeleton-avatar-radius: 50%;
}
```

Detection is automatic (headings by tag or a font size at least 1.25× the surrounding text, avatars as round, square images). Override it on any element with `data-skeleton-type="avatar"`; a non-text type draws the element as one bar, like `data-skeleton-block`.

### App-wide defaults

Wrap your app once instead of repeating `config` everywhere. Props on an individual `<AutoSkeleton>` still win, key by key, and nested providers merge over outer ones.

```tsx
import { SkeletonProvider } from 'smart-skeleton-loader';

<SkeletonProvider
  config={{ animation: 'shimmer', borderRadius: 8 }}
  delay={200}
  loadingLabel="Loading content"
>
  <App />
</SkeletonProvider>;
```

Want every skeleton in the app to share exactly one tint, whatever surface it is on? Use `config={{ adaptive: 'inherit' }}`. The default, `'surface'`, tints each surface from its own text color.

### Hand-placed skeletons

Need a one-off placeholder outside AutoSkeleton? The same building block is exported:

```tsx
import { SkeletonPrimitive } from 'smart-skeleton-loader';

<SkeletonPrimitive width={120} height={16} animation="shimmer" />;
```

## 🧩 API reference

### `<AutoSkeleton>` props

| Prop           | Type            | Default      | Description                                                                                                                                   |
| -------------- | --------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `loading`      | `boolean`       | _required_   | Whether to show the skeleton or the actual content.                                                                                           |
| `children`     | `ReactNode`     | -            | The content to measure.                                                                                                                       |
| `config`       | `object`        | -            | Appearance options (see below).                                                                                                               |
| `loadingLabel` | `string`        | `"Loading…"` | Text announced to screen readers while loading.                                                                                               |
| `className`    | `string`        | -            | Class name for the outer wrapper.                                                                                                             |
| `style`        | `CSSProperties` | -            | Style for the outer wrapper, merged over `position: relative; display: block`.                                                                |
| `delay`        | `number`        | `150`        | When `loading` turns on after mount, wait this long (ms) before showing the skeleton, so fast refetches never flash it. Not applied on mount. |
| `minDuration`  | `number`        | `400`        | Once shown, keep the skeleton at least this long (ms).                                                                                        |

### `config`

| Key                                  | Type                               | Default      | Description                                                                                                   |
| ------------------------------------ | ---------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------- |
| `color`                              | `'adaptive' \| 'static' \| string` | `'adaptive'` | `'adaptive'` tints from the surrounding text color, `'static'` uses fixed light/dark greys, or any CSS color. |
| `highlightColor`                     | `string`                           | `#f2f2f2`    | Animation highlight color.                                                                                    |
| `borderRadius`                       | `string \| number`                 | `4px`        | Fallback radius (auto-detected from your elements first).                                                     |
| `theme`                              | `'light' \| 'dark' \| 'auto'`      | `'auto'`     | `'light'`/`'dark'` force the fixed palette for that theme. Not needed with adaptive color.                    |
| `animation`                          | `'pulse' \| 'shimmer' \| 'none'`   | `'pulse'`    | Pulse the color, sweep a highlight, or stay static. Disabled under `prefers-reduced-motion`.                  |
| `shimmer`                            | `'sync' \| 'local'`                | `'sync'`     | Shimmer only: all bars share one page-wide sweep, or each bar sweeps on its own.                              |
| `classNames` / `styles`              | `Partial<Record<BarKind, …>>`      | -            | Extra class names / inline styles per kind of bar.                                                            |
| `adaptive`                           | `'surface' \| 'inherit'`           | `'surface'`  | Adaptive ink from each surface's text color, or one tint everywhere from the wrapper's text color.            |
| `lightColor` / `lightHighlightColor` | `string`                           | -            | Colors used when the (resolved) theme is light.                                                               |
| `darkColor` / `darkHighlightColor`   | `string`                           | -            | Colors used when the (resolved) theme is dark. With `'auto'` they switch live with the OS scheme.             |

### Per-element attributes

| Attribute              | Effect                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `data-skeleton-ignore` | No skeleton for this element or anything inside it (e.g. decorative badges).                                                   |
| `data-skeleton-block`  | Draw the element as one block and skip its children (e.g. charts, maps, complex widgets).                                      |
| `data-skeleton-type`   | Set the bar kind (`text`, `heading`, `avatar`, `media`, `button`, `input`, `block`, `container`). Non-text kinds draw one bar. |

## 🛠 How it works

1. **Invisible render.** While `loading`, your children render normally but with `opacity: 0`, so they take up real space.
2. **Smart scan.** A `TreeWalker` walks the DOM:
   - text becomes **one bar per rendered line**,
   - images, inputs and buttons become **primitive skeletons**,
   - styled containers become **container skeletons**.
3. **Overlay.** Absolutely positioned skeletons are drawn exactly over the measured elements.
4. **Crossfade.** When `loading` turns `false`, the content is already in place, so the skeleton fades out with zero layout shift.

## ❓ FAQ

<details>
<summary><b>Does it work with Next.js App Router and Server Components?</b></summary>

Yes. The package is marked `'use client'`, so you can import it directly from a Server Component. Server-rendered HTML shows one pulsing block over the reserved space until hydration, then switches to measured skeletons.

</details>

<details>
<summary><b>Will it flash a skeleton on every quick refetch?</b></summary>

No. By default a refetch faster than 150 ms changes nothing on screen (the current content stays, non-interactive), and a skeleton that does appear stays at least 400 ms, then crossfades over 200 ms. On first mount the skeleton shows immediately. Pass `delay={0} minDuration={0}` for instant behaviour.

</details>

<details>
<summary><b>Is it accessible?</b></summary>

While `loading`, the real content is `inert` (no clicks, no Tab focus, hidden from assistive tech), the wrapper has `aria-busy`, and `loadingLabel` is announced through a `role="status"` region. Animations are disabled under `prefers-reduced-motion`. In forced-colors mode (Windows High Contrast) bars switch to the system `GrayText` color so they stay visible.

</details>

<details>
<summary><b>Do I need to import a stylesheet?</b></summary>

No. Skeletons tint themselves from your UI (adaptive color), and fixed greys (light `#e0e0e0` / `#f2f2f2`, dark `#2a2a2a` / `#3d3d3d`) are built in for `color: 'static'`. `styles.css` is optional, for global theming via CSS variables.

</details>

<details>
<summary><b>My skeletons changed color after upgrading.</b></summary>

Since 2.3, skeletons use adaptive color by default instead of a fixed grey. To restore the old look, pass `config={{ color: 'static' }}`, or set `--auto-skeleton-color` / import `styles.css`. Adaptive color uses CSS `color-mix()` (Chrome 111+, Safari 16.2+, Firefox 113+).

</details>

<details>
<summary><b>My skeleton is missing for some elements. Why?</b></summary>

Elements with no size can't be measured. Make sure text has placeholder content and images have a `src` (even a placeholder) or an explicit `width`/`height`.

</details>

<details>
<summary><b>The wrapper breaks my inline layout.</b></summary>

The wrapper is `display: block` so it fills its parent like the content it replaces. For inline content pass `style={{ display: 'inline-block' }}`.

</details>

## 🤝 Contributing

Bug reports, ideas and pull requests are welcome! Open an [issue](https://github.com/DashnyamB/smart-skeleton-loader/issues) or start a PR.

## 💖 Support

If `smart-skeleton-loader` saved you from writing yet another skeleton component, you can help it grow:

- ⭐ **[Star the repo on GitHub](https://github.com/DashnyamB/smart-skeleton-loader)** so more developers find it
- ☕ **[Buy me a coffee](https://buymeacoffee.com/dashnyamkkq)** to support further development

<a href="https://buymeacoffee.com/dashnyamkkq"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="48"></a>

## License

MIT © 2026 [dashnyamb](https://github.com/DashnyamB)
