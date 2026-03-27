import { describe, it, expect } from 'vitest';
import { generateTrainingPlan } from '../trainingPlan';
import type { UserProfile } from '../../types';

const beginnerProfile: UserProfile = { name: 'Test', fitnessLevel: 'beginner' };

describe('generateTrainingPlan', () => {
  it('generates a plan with sessions for each week', () => {
    const plan = generateTrainingPlan(beginnerProfile, 5);
    expect(plan.sessions.length).toBeGreaterThan(0);
    expect(plan.totalWeeks).toBeGreaterThan(0);
  });

  it('respects the goal distance', () => {
    const plan = generateTrainingPlan(beginnerProfile, 5);
    expect(plan.goalDistanceKm).toBe(5);
    const maxDistance = Math.max(...plan.sessions.map((s) => s.distanceKm));
    expect(maxDistance).toBeLessThanOrEqual(5);
  });

  it('generates 3 sessions per week', () => {
    const plan = generateTrainingPlan(beginnerProfile, 5);
    const week1Sessions = plan.sessions.filter((s) => s.week === 1);
    expect(week1Sessions.length).toBe(3);
  });

  it('each session has a valid target pace', () => {
    const plan = generateTrainingPlan(beginnerProfile, 5);
    plan.sessions.forEach((session) => {
      expect(session.targetPace.minutesPerKm).toBeGreaterThan(0);
      expect(session.targetPace.formattedPace).toMatch(/\d+:\d{2} \/km/);
    });
  });

  it('distance increases progressively across weeks', () => {
    const plan = generateTrainingPlan(beginnerProfile, 10);
    const week1 = plan.sessions.filter((s) => s.week === 1 && s.type === 'moderate')[0];
    const week3 = plan.sessions.filter((s) => s.week === 3 && s.type === 'moderate')[0];
    expect(week3.distanceKm).toBeGreaterThanOrEqual(week1.distanceKm);
  });
});
