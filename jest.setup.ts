import '@testing-library/jest-dom';

// JSDOM does not implement window.matchMedia. Provide a default stub that
// always returns `matches: false` (desktop) so components that call
// useIsMobile() via DataGrid don't crash. Tests that need mobile behaviour
// should override this locally (e.g. `window.matchMedia = jest.fn()...`).
// Guard is needed because some test suites run in the Node (non-jsdom) env.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((q: string) => ({
      matches: false,
      media: q,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })),
  });
}

// Polyfill Blob.prototype.arrayBuffer for jsdom environments that lack it.
if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function (): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(this);
    });
  };
}

if (!(global as any).createImageBitmap) {
  (global as any).createImageBitmap = async (_blob: Blob) => ({
    width: 2,
    height: 2,
    close: () => {},
  });
}

if (!(global as any).OffscreenCanvas) {
  class FakeOffscreenCanvas {
    width: number;
    height: number;
    constructor(w: number, h: number) {
      this.width = w;
      this.height = h;
    }
    getContext() {
      return {drawImage: () => {}};
    }
    async convertToBlob(opts: {type: string}) {
      const bytes = new Uint8Array(20);
      bytes.set([0x52, 0x49, 0x46, 0x46], 0);
      bytes.set([0x57, 0x45, 0x42, 0x50], 8);
      return new Blob([bytes], {type: opts.type});
    }
  }
  (global as any).OffscreenCanvas = FakeOffscreenCanvas;
}

if (typeof (global as any).fetch === 'undefined') {
  (global as any).fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
    }),
  );
}

if (!(globalThis.crypto as any)?.subtle) {
  const {webcrypto} = require('crypto');
  Object.defineProperty(globalThis, 'crypto', {value: webcrypto});
}
