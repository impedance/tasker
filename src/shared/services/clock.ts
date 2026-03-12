/**
 * Clock boundary — T5 (Refactor Plan REFAC-01)
 * Centralizes time access for deterministic behavior and testability.
 *
 * Usage:
 *   - Default to systemClock in production
 *   - Inject mock clocks in tests for deterministic time-dependent logic
 */

export interface Clock {
  /** Returns current time as Date */
  now(): Date;
}

/** System clock — uses real Date */
export const systemClock: Clock = {
  now: () => new Date(),
};

/**
 * Creates a mock clock with a fixed time.
 * Useful for tests requiring deterministic behavior.
 */
export function createMockClock(fixedTime: Date): Clock {
  return {
    now: () => new Date(fixedTime.getTime()),
  };
}

/**
 * Creates a clock that advances by a specified delta on each call.
 * Useful for testing time-based logic with controlled progression.
 */
export function createSteppingClock(startTime: Date, deltaMs: number): Clock {
  let currentTime = startTime.getTime();
  return {
    now: () => {
      const result = new Date(currentTime);
      currentTime += deltaMs;
      return result;
    },
  };
}
