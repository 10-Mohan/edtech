import '@testing-library/jest-dom';

// Polyfill localStorage if needed in jsdom
if (typeof window !== 'undefined' && !window.localStorage) {
  const store: Record<string, string> = {};
  window.localStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(k => delete store[k]);
    },
    key: (index: number) => Object.keys(store)[index] || null,
    length: Object.keys(store).length
  };
}
