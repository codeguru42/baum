// jest-dom adds custom matchers for asserting on DOM nodes
// Works with both Jest and Vitest
// Learn more: https://github.com/testing-library/jest-dom
import * as matchers from '@testing-library/jest-dom/matchers';
import { expect } from 'vitest';

expect.extend(matchers);
