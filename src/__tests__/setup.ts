// Test setup for Vitest
// This file is for basic unit tests without DOM

// If you need DOM testing, use a test file with /* @vitest-environment jsdom */

// Suppress console errors during tests (optional)
const originalError = console.error
console.error = (...args: unknown[]) => {
  // Suppress known React/testing-library warnings
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Warning:') || args[0].includes('ReactDOM.render'))
  ) {
    return
  }
  originalError.call(console, ...args)
}
