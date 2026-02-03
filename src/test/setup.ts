import '@testing-library/jest-dom';

// Mock ResizeObserver if it's not available (e.g., in JSDOM)
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
