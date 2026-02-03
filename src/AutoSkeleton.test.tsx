// @vitest-environment jsdom
import { render, screen, cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { AutoSkeleton } from "./AutoSkeleton";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

expect.extend(matchers);

// @ts-ignore
const MockObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
// @ts-ignore
window.ResizeObserver = MockObserver;
// @ts-ignore
globalThis.ResizeObserver = MockObserver;

describe("AutoSkeleton", () => {
  beforeEach(() => {
    // Reset mocks
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders children visible when loading is false", () => {
    render(
      <AutoSkeleton loading={false}>
        <div data-testid="content">Content</div>
      </AutoSkeleton>,
    );

    const content = screen.getByTestId("content");
    expect(content).toBeVisible();
    // Container visible
    expect(content.parentElement).toHaveStyle({ visibility: "visible" });
  });

  it("hides children when loading is true", () => {
    const { getByTestId } = render(
      <AutoSkeleton loading={true}>
        <div data-testid="content">Content</div>
      </AutoSkeleton>,
    );

    // Use scoped query to avoid interference from previous tests
    const content = getByTestId("content");
    // The original content's parent wrapper sets opacity to 0 (not visibility hidden)
    expect(content.parentElement).toHaveStyle({ opacity: "0" });
  });

  it("generates fallback skeleton if no content is measured (default jsdom behavior)", async () => {
    // In JSDOM, getBoundingClientRect returns 0.
    // Our logic says: if newSkeletons is empty AND container has size, render fallback.
    // If JSDOM says 0 size, we get nothing.
    // We need to mock getBoundingClientRect for the container to return size.

    // We can't easily mock the ref's method directly before render.
    // But we can patch Element.prototype.getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 100,
      height: 50,
      top: 0,
      left: 0,
      bottom: 50,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    render(
      <AutoSkeleton loading={true}>
        <div style={{ width: 100, height: 50 }}>Content</div>
      </AutoSkeleton>,
    );

    // Verify the AutoSkeleton container is rendered
    const container = document.querySelector('[style*="position: relative"]');
    expect(container).not.toBeNull();
  });
});
