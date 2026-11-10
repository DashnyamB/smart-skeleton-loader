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

- 📏 **Auto-Measurement**: Measures rendered elements to perfectly match dimensions.
- 🧠 **Smart Detection**:
  - **Text**: Detects text blocks and wraps them.
  - **Content**: Automatically handles `<img>`, `<input>`, `<button>`, `<textarea>`.
  - **Containers**: **NEW!** Detects cards and sections with borders/shadows and renders a static structural skeleton for them.
- 🧘 **No Layout Shift**: Preserves the exact container space while loading to prevent CLS (Cumulative Layout Shift).
- 🎨 **Customizable**: Control colors, border radius, and animations.
- ♻️ **Template Pattern**: Use your actual components mock data to generate skeletons for data-fetching lists.

## 📦 Installation

```bash
npm install smart-skeleton-loader
# or
yarn add smart-skeleton-loader
```

_Zero runtime dependencies — only `react` (19+) as a peer._

## 🚀 Usage

### 1. Basic Example

Wrap your component in `AutoSkeleton` and control the `loading` state.

```tsx
import { AutoSkeleton } from 'smart-skeleton-loader';

const UserProfile = ({ loading, user }) => {
  return (
    <AutoSkeleton loading={loading}>
      <div className="card">
        {/* Use a placeholder fallback so the skeleton knows the size if data is null! */}
        <img src={user?.avatar || '/placeholder.png'} alt="Avatar" />
        <h3>{user?.name || 'Loading Name...'}</h3>
        <p>{user?.bio || 'This is a long line of text to simulate the bio.'}</p>
        <button>Follow</button>
      </div>
    </AutoSkeleton>
  );
};
```

### 2. Data Fetching (The Template Pattern)

When fetching lists, you might start with an empty array. **How can we measure an empty array?**

The solution is the **Template Pattern**: Render "dummy" items while loading. `smart-skeleton-loader` will measure these dummies and create the skeleton layout.

```tsx
const UserList = () => {
  const { data, isLoading } = useFetchUsers();

  return (
    <div className="list">
      {isLoading
        ? // RENDER 3 TEMPLATES WHILE LOADING
          Array.from({ length: 3 }).map((_, i) => (
            <AutoSkeleton key={i} loading={true}>
              <UserCard
                name="Template User Name"
                bio="This is a template bio for measurement."
                avatar="/placeholder.png"
              />
            </AutoSkeleton>
          ))
        : // RENDER REAL DATA
          data.map((user) => <UserCard key={user.id} {...user} />)}
    </div>
  );
};
```

### 3. Container Detection (Cards)

`smart-skeleton-loader` intelligently distinguishes between **Content** and **Containers**.

- **Content** (Text, Images, Buttons) -> Renders as a **Pulsing Gray Box**.
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

| Prop           | Type            | Default      | Description                                                                    |
| -------------- | --------------- | ------------ | ------------------------------------------------------------------------------ |
| `loading`      | `boolean`       | `true`       | Whether to show the skeleton or the actual content.                            |
| `children`     | `ReactNode`     | -            | The content to measure.                                                        |
| `config`       | `object`        | -            | Customization options.                                                         |
| `loadingLabel` | `string`        | `"Loading…"` | Text announced to screen readers while loading.                                |
| `className`    | `string`        | -            | Class name for the outer wrapper.                                              |
| `style`        | `CSSProperties` | -            | Style for the outer wrapper, merged over `position: relative; display: block`. |
| `delay`        | `number`        | `0`          | Wait this long (ms) before showing the skeleton, so fast loads never flash it. |
| `minDuration`  | `number`        | `0`          | Once shown, keep the skeleton at least this long (ms).                         |

### Config Object

| Key                                  | Type                          | Default   | Description                                                                                       |
| ------------------------------------ | ----------------------------- | --------- | ------------------------------------------------------------------------------------------------- |
| `color`                              | `string`                      | `#eee`    | Background color of primitives.                                                                   |
| `highlightColor`                     | `string`                      | `#f5f5f5` | Animation highlight color.                                                                        |
| `borderRadius`                       | `string`                      | `4px`     | Fallback radius (Auto-detection is attempted first).                                              |
| `theme`                              | `'light' \| 'dark' \| 'auto'` | `'auto'`  | Force a theme, or follow the OS color scheme.                                                     |
| `lightColor` / `lightHighlightColor` | `string`                      | -         | Colors used when the (resolved) theme is light.                                                   |
| `darkColor` / `darkHighlightColor`   | `string`                      | -         | Colors used when the (resolved) theme is dark. With `'auto'` they switch live with the OS scheme. |

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
- **Avoiding flicker:** for most data fetching use `delay={150} minDuration={400}`: loads faster than 150ms show nothing, and a skeleton that does appear stays long enough to read as intentional. The skeleton and content crossfade over 200ms.
- **Server rendering / Next.js:** the package is marked `'use client'`, so it can be imported from Server Components. Server-rendered HTML shows one pulsing block over the reserved space until hydration, then switches to measured skeletons.
- **Layout:** the wrapper is `display: block`, so it fills its parent like the content it replaces. For inline content pass `style={{ display: 'inline-block' }}`.
- **Placeholders**: For images, ensure you provide a `src` (even a placeholder) or explicit `width/height` style so the image takes up space to be measured.
- **Opacity vs Visibility**: We use `opacity: 0` to hide content. This ensures that even elements that might behave strangely with `visibility: hidden` are correctly measured.

## License

MIT © 2026
