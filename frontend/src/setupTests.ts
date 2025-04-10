import '@testing-library/jest-dom'

// Polyfill a window.matchMedia függvényhez, mivel jsdom-ben alapból nincs implementálva.
if (!window.matchMedia) {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {}, // a régebbi API
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
}