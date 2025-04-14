import 'zone.js';

// Polyfill global this
(window as any).global = window;

// Polyfill Buffer and process
import { Buffer } from 'buffer';

(async () => {
  try {
    const process = await import('process');
    (window as any).Buffer = Buffer;
    (window as any).process = process.default;
  } catch (err) {
    console.error('Error loading polyfills:', err);
  }
})();
