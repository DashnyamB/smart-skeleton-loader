# smart-skeleton-loader

> **The smartest skeleton loader for React.**
> Automatically generate perfectly matching skeletons by measuring your actual components.

[![npm version](https://img.shields.io/npm/v/smart-skeleton-loader.svg)](https://www.npmjs.com/package/smart-skeleton-loader)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Donate-orange.svg?logo=buy-me-a-coffee&logoColor=white)](https://buymeacoffee.com/dashnyamkkq)

<div align="center">

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://buymeacoffee.com/dashnyamkkq)

</div>

`smart-skeleton-loader` eliminates the need to manually create and maintain skeleton versions of your components. It renders your actual component responsibly (hidden), measures its layout, and overlays precise skeletons for text, images, and containers.

> [!IMPORTANT]
> **Enjoying this project?** If you find `smart-skeleton-loader` useful, please consider [buying me a coffee](https://buymeacoffee.com/dashnyamkkq) to support further development! 💖

## ✨ Features

- 📏 **Auto-Measurement**: Measures your real rendered layout, so the skeleton always matches it.
- 🧠 **Smart Detection**:
  - **Text**: One bar per rendered line, with a naturally shorter last line.
  - **Content**: `<img>`, `<input>`, `<button>`, `<textarea>`, `<select>`.
  - **Containers**: Cards and sections with borders/backgrounds/shadows render as static outlines.
- 🧘 **No Layout Shift**: The real content holds its space while loading.
- ⏱️ **No Flicker**: Fast refetches never flash a skeleton (`delay`), a shown skeleton never blinks (`minDuration`), and the reveal crossfades.
- ♿ **Accessible**: Hidden content is `inert`, the wrapper is `aria-busy`, and loading is announced.
- 🎨 **Customizable**: Colors, radius, pulse/shimmer/none, light/dark, per-element overrides.
- 🪶 **Zero runtime dependencies**, `'use client'`-ready for Next.js.

## 📦 Installation

```bash
npm install smart-skeleton-loader
# or
yarn add smart-skeleton-loader
```

_Zero runtime dependencies — only `react` (19+) as a peer._

## 🚀 Usage

> [!IMPORTANT]
> **AutoSkeleton measures what is rendered.** While loading, render your component with
> realistic **placeholder data**: an empty `<h3></h3>` or a missing image has no size, so
> it gets no skeleton. This is the one thing to remember.

### 1. Data fetching (the template pattern)

You usually start with no data. Render a few "template" items with placeholder data while
loading. AutoSkeleton measures them and draws the skeleton, then crossfades to the real
items.

```tsx
import { AutoSkeleton } from 'smart-skeleton-loader';

const TEMPLATE_USERS = Array.from({ length: 3 }, (_, i) => ({
  id: `template-${i}`,
  name: 'Template User Name',
  bio: 'A template bio, about as long as a real one.',
  avatar: '/placeholder.png',
}));

const UserList = () => {
  const { data, isLoading } = useFetchUsers();
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

### 2. A single component

Give each field a placeholder fallback so it has a size while `user` is still `null`.

```tsx
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

### 3. Container Detection (Cards)

`smart-skeleton-loader` intelligently distinguishes between **Content** and **Containers**.

- **Content** (Text, Images, Buttons) -> Renders as **animated bars** (one per text line).
- **Containers** (Elements with visible `border`, `background-color`, or `box-shadow`) -> Renders as a **Static Clone** (with your exact styles) and **NO** pulse.

This means a "Card" looks like a card (white background, shadow), and the content inside it pulses.

## ⚙️ Configuration

Customize the appearance via the `config` prop:

```tsx
<AutoSkeleton
  loading={true}
  config={{
    color: '#e0e0e0', // Base color of the skeleton pulse
    highlightColor: '#f5f5f5', // Shine color
    borderRadius: '8px', // Global border radius (auto-detects if not set)
  }}
>
  <MyComponent />
</AutoSkeleton>
```

## 🧩 API Reference

| Prop           | Type            | Default      | Description                                                                                                                                   |
| -------------- | --------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `loading`      | `boolean`       | _required_   | Whether to show the skeleton or the actual content.                                                                                           |
| `children`     | `ReactNode`     | -            | The content to measure.                                                                                                                       |
| `config`       | `object`        | -            | Customization options.                                                                                                                        |
| `loadingLabel` | `string`        | `"Loading…"` | Text announced to screen readers while loading.                                                                                               |
| `className`    | `string`        | -            | Class name for the outer wrapper.                                                                                                             |
| `style`        | `CSSProperties` | -            | Style for the outer wrapper, merged over `position: relative; display: block`.                                                                |
| `delay`        | `number`        | `150`        | When `loading` turns on after mount, wait this long (ms) before showing the skeleton, so fast refetches never flash it. Not applied on mount. |
| `minDuration`  | `number`        | `400`        | Once shown, keep the skeleton at least this long (ms).                                                                                        |

### Config Object

| Key                                  | Type                             | Default   | Description                                                                                       |
| ------------------------------------ | -------------------------------- | --------- | ------------------------------------------------------------------------------------------------- |
| `color`                              | `string`                         | `#e0e0e0` | Background color of primitives.                                                                   |
| `highlightColor`                     | `string`                         | `#f2f2f2` | Animation highlight color.                                                                        |
| `borderRadius`                       | `string`                         | `4px`     | Fallback radius (Auto-detection is attempted first).                                              |
| `theme`                              | `'light' \| 'dark' \| 'auto'`    | `'auto'`  | Force a theme, or follow the OS color scheme.                                                     |
| `animation`                          | `'pulse' \| 'shimmer' \| 'none'` | `'pulse'` | Pulse the color, sweep a highlight, or stay static. Disabled under `prefers-reduced-motion`.      |
| `lightColor` / `lightHighlightColor` | `string`                         | -         | Colors used when the (resolved) theme is light.                                                   |
| `darkColor` / `darkHighlightColor`   | `string`                         | -         | Colors used when the (resolved) theme is dark. With `'auto'` they switch live with the OS scheme. |

### Per-element overrides

| Attribute              | Effect                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| `data-skeleton-ignore` | No skeleton for this element or anything inside it (e.g. decorative badges).              |
| `data-skeleton-block`  | Draw the element as one block and skip its children (e.g. charts, maps, complex widgets). |

```tsx
<div data-skeleton-block>
  <Chart data={data} />
</div>
```

## 🛠 How It Works

1.  **Invisible Measurement**: When `loading={true}`, your children are rendered in the DOM but hidden using `opacity: 0`. This allows them to take up space and be measured by the browser.
2.  **Smart Scan**: We use a `TreeWalker` to scan the DOM elements.
    - If it finds text -> It creates **one bar per rendered line** (the last bar is as short as the last line).
    - If it finds images/inputs/buttons -> It creates a **Primitive Skeleton**.
    - If it finds a styled container -> It creates a **Container Skeleton**.
3.  **Overlay**: We render absolute positioned `divs` exactly over the measured elements.
4.  **No Shift**: Because the hidden content is already holding the space, when `loading` becomes `false`, the skeleton and content crossfade. No jumping content!

## ⚠️ Notes

- **Accessibility:** while `loading`, the real content is `inert` (no clicks, no Tab focus, hidden from assistive tech), the wrapper has `aria-busy`, and `loadingLabel` is announced through a `role="status"` region.
- **Avoiding flicker:** by default a refetch faster than 150ms changes nothing on screen (the current content stays, non-interactive), and a skeleton that does appear stays at least 400ms, then crossfades over 200ms. On mount the skeleton shows immediately. Pass `delay={0} minDuration={0}` for the old instant behaviour.
- **Server rendering / Next.js:** the package is marked `'use client'`, so it can be imported from Server Components. Server-rendered HTML shows one pulsing block over the reserved space until hydration, then switches to measured skeletons.
- **Default colors:** light `#e0e0e0`/`#f2f2f2`, dark `#2a2a2a`/`#3d3d3d`, chosen by OS scheme or `theme`, with no CSS import needed. `styles.css` is optional: import it, or set `--auto-skeleton-color` / `--auto-skeleton-highlight` yourself, to theme globally (it also supports a `.dark` class).
- **Layout:** the wrapper is `display: block`, so it fills its parent like the content it replaces. For inline content pass `style={{ display: 'inline-block' }}`.
- **Placeholders**: For images, ensure you provide a `src` (even a placeholder) or explicit `width/height` style so the image takes up space to be measured.
- **Opacity vs Visibility**: We use `opacity: 0` to hide content. This ensures that even elements that might behave strangely with `visibility: hidden` are correctly measured.

## License

MIT © 2026
