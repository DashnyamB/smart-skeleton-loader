# react-auto-skeleton

> **The smartest skeleton loader for React.**
> Automatically generate perfectly matching skeletons by measuring your actual components.

[![npm version](https://img.shields.io/npm/v/react-auto-skeleton.svg)](https://www.npmjs.com/package/react-auto-skeleton)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

`react-auto-skeleton` eliminates the need to manually create and maintain skeleton versions of your components. It renders your actual component responsibly (hidden), measures its layout, and overlays precise skeletons for text, images, and containers.

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
npm install react-auto-skeleton framer-motion
# or
yarn add react-auto-skeleton framer-motion
```

_Note: `framer-motion` is a peer dependency used for the smooth pulse animations._

## 🚀 Usage

### 1. Basic Example

Wrap your component in `AutoSkeleton` and control the `loading` state.

```tsx
import { AutoSkeleton } from "react-auto-skeleton";

const UserProfile = ({ loading, user }) => {
  return (
    <AutoSkeleton loading={loading}>
      <div className="card">
        {/* Use a placeholder fallback so the skeleton knows the size if data is null! */}
        <img src={user?.avatar || "/placeholder.png"} alt="Avatar" />
        <h3>{user?.name || "Loading Name..."}</h3>
        <p>{user?.bio || "This is a long line of text to simulate the bio."}</p>
        <button>Follow</button>
      </div>
    </AutoSkeleton>
  );
};
```

### 2. Data Fetching (The Template Pattern)

When fetching lists, you might start with an empty array. **How can we measure an empty array?**

The solution is the **Template Pattern**: Render "dummy" items while loading. `react-auto-skeleton` will measure these dummies and create the skeleton layout.

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

`react-auto-skeleton` intelligently distinguishes between **Content** and **Containers**.

- **Content** (Text, Images, Buttons) -> Renders as a **Pulsing Gray Box**.
- **Containers** (Elements with visible `border`, `background-color`, or `box-shadow`) -> Renders as a **Static Clone** (with your exact styles) and **NO** pulse.

This means a "Card" looks like a card (white background, shadow), and the content inside it pulses.

## ⚙️ Configuration

Customize the appearance via the `config` prop:

```tsx
<AutoSkeleton
  loading={true}
  config={{
    color: "#e0e0e0", // Base color of the skeleton pulse
    highlightColor: "#f5f5f5", // Shine color
    borderRadius: "8px", // Global border radius (auto-detects if not set)
  }}
>
  <MyComponent />
</AutoSkeleton>
```

## 🧩 API Reference

| Prop       | Type        | Default | Description                                         |
| ---------- | ----------- | ------- | --------------------------------------------------- |
| `loading`  | `boolean`   | `true`  | Whether to show the skeleton or the actual content. |
| `children` | `ReactNode` | -       | The content to measure.                             |
| `config`   | `object`    | -       | Customization options.                              |

### Config Object

| Key              | Type     | Default   | Description                                          |
| ---------------- | -------- | --------- | ---------------------------------------------------- |
| `color`          | `string` | `#eee`    | Background color of primitives.                      |
| `highlightColor` | `string` | `#f5f5f5` | Animation highlight color.                           |
| `borderRadius`   | `string` | `4px`     | Fallback radius (Auto-detection is attempted first). |

## 🛠 How It Works

1.  **Invisible Measurement**: When `loading={true}`, your children are rendered in the DOM but hidden using `opacity: 0`. This allows them to take up space and be measured by the browser.
2.  **Smart Scan**: We use a `TreeWalker` to scan the DOM elements.
    - If it finds text/images -> It creates a **Primitive Skeleton**.
    - If it finds a styled container -> It creates a **Container Skeleton**.
3.  **Overlay**: We render absolute positioned `divs` (using Framer Motion) exactly over the measured elements.
4.  **No Shift**: Because the hidden content is already holding the space, when `loading` becomes `false`, we simply fade `opacity` to 1. No jumping content!

## ⚠️ Notes

- **Placeholders**: For images, ensure you provide a `src` (even a placeholder) or explicit `width/height` style so the image takes up space to be measured.
- **Opacity vs Visibility**: We use `opacity: 0` to hide content. This ensures that even elements that might behave strangely with `visibility: hidden` are correctly measured.

## License

MIT © 2024
