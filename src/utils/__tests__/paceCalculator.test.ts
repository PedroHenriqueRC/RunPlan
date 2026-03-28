import { describe, it, expect } from 'vitest';
import { calculateIdealPace, formatPace, calculateCalories, paceFromDuration } from '../paceCalculator';

describe('formatPace', () => {
  it('formats pace correctly', () => {
    expect(formatPace(8)).toBe('8:00 /km');
    expect(formatPace(6.5)).toBe('6:30 /km');
    expect(formatPace(4.75)).toBe('4:45 /km');
  });
});

describe('calculateIdealPace', () => {
  it('returns beginner pace around 8 min/km', () => {
    const pace = calculateIdealPace({ name: 'Test', fitnessLevel: 'beginner' });
    expect(pace.minutesPerKm).toBeGreaterThanOrEqual(7.5);
    expect(pace.minutesPerKm).toBeLessThanOrEqual(9.0);
  });

  it('returns intermediate pace around 6 min/km', () => {
    const pace = calculateIdealPace({ name: 'Test', fitnessLevel: 'intermediate' });
    expect(pace.minutesPerKm).toBeGreaterThanOrEqual(5.5);
    expect(pace.minutesPerKm).toBeLessThanOrEqual(7.0);
  });

  it('returns advanced pace around 4.5 min/km', () => {
    const pace = calculateIdealPace({ name: 'Test', fitnessLevel: 'advanced' });
    expect(pace.minutesPerKm).toBeGreaterThanOrEqual(4.0);
    expect(pace.minutesPerKm).toBeLessThanOrEqual(5.5);
  });

  it('increases pace for heavier users', () => {
    const light = calculateIdealPace({ name: 'Test', fitnessLevel: 'beginner', weight: 60 });
    const heavy = calculateIdealPace({ name: 'Test', fitnessLevel: 'beginner', weight: 95 });
    expect(heavy.minutesPerKm).toBeGreaterThan(light.minutesPerKm);
  });

  it('includes formatted pace string', () => {
    const pace = calculateIdealPace({ name: 'Test', fitnessLevel: 'beginner' });
    expect(pace.formattedPace).toMatch(/\d+:\d{2} \/km/);
  });

  it('never returns pace below 4 min/km', () => {
    const pace = calculateIdealPace({ name: 'Test', fitnessLevel: 'advanced', age: 20, weight: 50 });
    expect(pace.minutesPerKm).toBeGreaterThanOrEqual(4.0);
  });
});

describe('calculateCalories', () => {
  it('calculates calories for a run', () => {
    const cal = calculateCalories(5, 30, 70);
    expect(cal).toBeGreaterThan(200);
    expect(cal).toBeLessThan(600);
  });
});

describe('paceFromDuration', () => {
  it('calculates pace from distance and duration', () => {
    // 5 km in 30 minutes (1800 seconds) = 6 min/km
    const pace = paceFromDuration(5, 1800);
    expect(pace).toBeCloseTo(6, 1);
  });
});
