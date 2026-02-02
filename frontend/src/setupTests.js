// jest-dom adds custom matchers for asserting on DOM nodes
// Works with both Jest and Vitest
// Learn more: https://github.com/testing-library/jest-dom
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

expect.extend(matchers);

// Cleanup after each test to prevent DOM pollution
afterEach(() => {
  cleanup();
});
