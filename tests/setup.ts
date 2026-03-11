/**
 * Vitest test setup file
 * Configures test environment for React + JSDOM
 */

import { afterEach, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Polyfill for matchMedia (needed for HeroMomentOverlay)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock the siege and season services to avoid async initialization in tests
vi.mock('../src/game/services/siege-service', () => ({
  checkAndCreateSieges: vi.fn().mockResolvedValue(0),
}));

vi.mock('../src/game/services/season-service', () => ({
  checkAndStartNewSeason: vi.fn().mockResolvedValue(null),
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Clear all mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});

// Clear sessionStorage and localStorage after each test
afterEach(() => {
  sessionStorage.clear();
  localStorage.clear();
});

// Setup before each test if needed
beforeEach(() => {
  // Reset any mock implementations
  vi.clearAllMocks();
});
