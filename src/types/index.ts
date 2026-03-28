export interface UserProfile {
  name: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  weight?: number; // kg
  age?: number;
}

export interface Pace {
  minutesPerKm: number;
  formattedPace: string; // "MM:SS /km"
}

export interface TrainingSession {
  week: number;
  day: number;
  distanceKm: number;
  targetPace: Pace;
  description: string;
  type: 'easy' | 'moderate' | 'rest';
}

export interface TrainingPlan {
  sessions: TrainingSession[];
  totalWeeks: number;
  goalDistanceKm: number;
}

export interface RunRecord {
  id: string;
  date: string;
  distanceKm: number;
  durationSeconds: number;
  avgPaceMinPerKm: number;
  calories: number;
}
