import type { Pace, UserProfile } from '../types';

export function formatPace(minutesPerKm: number): string {
  const minutes = Math.floor(minutesPerKm);
  const seconds = Math.round((minutesPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
}

export function calculateIdealPace(profile: UserProfile): Pace {
  // Base paces for each level (min/km)
  const basePaces: Record<UserProfile['fitnessLevel'], number> = {
    beginner: 8.0,    // ~8 min/km
    intermediate: 6.0, // ~6 min/km
    advanced: 4.5,    // ~4:30 /km
  };

  let minutesPerKm = basePaces[profile.fitnessLevel];

  // Adjust for age
  if (profile.age) {
    if (profile.age > 50) minutesPerKm += 0.5;
    else if (profile.age > 40) minutesPerKm += 0.25;
    else if (profile.age < 25) minutesPerKm -= 0.1;
  }

  // Adjust for weight (rough estimate)
  if (profile.weight) {
    if (profile.weight > 90) minutesPerKm += 0.3;
    else if (profile.weight > 75) minutesPerKm += 0.15;
  }

  minutesPerKm = Math.max(4.0, minutesPerKm);

  return {
    minutesPerKm,
    formattedPace: formatPace(minutesPerKm),
  };
}

export function calculateCalories(
  distanceKm: number,
  durationMinutes: number,
  weightKg: number = 70
): number {
  // MET for running ~8-10 MET, jogging ~7 MET
  const met = durationMinutes / distanceKm < 8 ? 10 : 7;
  return Math.round((met * weightKg * (durationMinutes / 60)));
}

export function paceFromDuration(distanceKm: number, durationSeconds: number): number {
  return durationSeconds / 60 / distanceKm;
}
