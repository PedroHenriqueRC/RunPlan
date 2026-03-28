import type { TrainingPlan, TrainingSession, UserProfile } from '../types';
import { calculateIdealPace } from './paceCalculator';

export function generateTrainingPlan(
  profile: UserProfile,
  goalDistanceKm: number,
  startingDistanceKm: number = 2
): TrainingPlan {
  const targetPace = calculateIdealPace(profile);
  const easyPaceMin = targetPace.minutesPerKm + 1.5;
  const moderatePaceMin = targetPace.minutesPerKm + 0.5;

  const easyPace = {
    minutesPerKm: easyPaceMin,
    formattedPace: formatPaceLocal(easyPaceMin),
  };
  const moderatePace = {
    minutesPerKm: moderatePaceMin,
    formattedPace: formatPaceLocal(moderatePaceMin),
  };

  const sessions: TrainingSession[] = [];
  const totalWeeks = Math.ceil(goalDistanceKm / startingDistanceKm) + 2;

  let currentDistance = startingDistanceKm;

  for (let week = 1; week <= totalWeeks; week++) {
    // 3 running days per week: Mon, Wed, Fri
    // Week pattern: easy, moderate, easy
    const weekSessions: Array<{ day: number; type: TrainingSession['type']; distanceFactor: number; description: string }> = [
      { day: 1, type: 'easy', distanceFactor: 0.8, description: 'Corrida leve – foco na respiração e postura' },
      { day: 3, type: 'moderate', distanceFactor: 1.0, description: 'Corrida moderada – mantenha o ritmo constante' },
      { day: 5, type: 'easy', distanceFactor: 0.9, description: 'Corrida recuperativa – vá no seu próprio ritmo' },
    ];

    for (const s of weekSessions) {
      const distance = Math.min(
        Math.round(currentDistance * s.distanceFactor * 10) / 10,
        goalDistanceKm
      );
      sessions.push({
        week,
        day: s.day,
        distanceKm: distance,
        targetPace: s.type === 'easy' ? easyPace : moderatePace,
        description: s.description,
        type: s.type,
      });
    }

    // Progressive overload: increase ~10% per week
    if (week < totalWeeks) {
      currentDistance = Math.min(
        Math.round(currentDistance * 1.1 * 10) / 10,
        goalDistanceKm
      );
    }
  }

  return {
    sessions,
    totalWeeks,
    goalDistanceKm,
  };
}

function formatPaceLocal(minutesPerKm: number): string {
  const minutes = Math.floor(minutesPerKm);
  const seconds = Math.round((minutesPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
}
