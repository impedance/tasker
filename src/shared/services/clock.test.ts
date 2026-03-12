/**
 * Clock boundary tests — T5 (Refactor Plan REFAC-01)
 * Tests for deterministic time access via Clock interface.
 */

import { describe, it, expect } from 'vitest';
import { systemClock, createMockClock, createSteppingClock } from './clock';

describe('Clock boundary', () => {
  describe('systemClock', () => {
    it('should return current date', () => {
      const before = Date.now();
      const result = systemClock.now();
      const after = Date.now();

      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe('createMockClock', () => {
    it('should return fixed time', () => {
      const fixedTime = new Date('2024-01-15T10:30:00Z');
      const clock = createMockClock(fixedTime);

      expect(clock.now()).toEqual(fixedTime);
      expect(clock.now()).toEqual(fixedTime);
      expect(clock.now() === clock.now()).toBe(false); // Different instances, same time
    });

    it('should not mutate original date', () => {
      const fixedTime = new Date('2024-01-15T10:30:00Z');
      const clock = createMockClock(fixedTime);

      const result1 = clock.now();
      result1.setFullYear(2099);

      const result2 = clock.now();
      expect(result2.getFullYear()).toBe(2024);
    });
  });

  describe('createSteppingClock', () => {
    it('should advance time by delta on each call', () => {
      const startTime = new Date('2024-01-15T10:30:00Z');
      const deltaMs = 60000; // 1 minute
      const clock = createSteppingClock(startTime, deltaMs);

      const t1 = clock.now();
      const t2 = clock.now();
      const t3 = clock.now();

      expect(t1.getTime()).toBe(startTime.getTime());
      expect(t2.getTime()).toBe(startTime.getTime() + deltaMs);
      expect(t3.getTime()).toBe(startTime.getTime() + 2 * deltaMs);
    });

    it('should work with different delta values', () => {
      const startTime = new Date('2024-01-15T10:30:00Z');
      const oneDayMs = 24 * 60 * 60 * 1000;
      const clock = createSteppingClock(startTime, oneDayMs);

      const t1 = clock.now();
      const t2 = clock.now();
      const t3 = clock.now();

      expect(t1.getDate()).toBe(15);
      expect(t2.getDate()).toBe(16);
      expect(t3.getDate()).toBe(17);
    });
  });
});
