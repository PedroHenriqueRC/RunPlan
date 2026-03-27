import type { RunRecord, UserProfile } from '../types';

const PROFILE_KEY = 'runplan_profile';
const RECORDS_KEY = 'runplan_records';

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadProfile(): UserProfile | null {
  const data = localStorage.getItem(PROFILE_KEY);
  return data ? JSON.parse(data) : null;
}

export function saveRecord(record: RunRecord): void {
  const records = loadRecords();
  records.push(record);
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function loadRecords(): RunRecord[] {
  const data = localStorage.getItem(RECORDS_KEY);
  return data ? JSON.parse(data) : [];
}

export function clearRecords(): void {
  localStorage.removeItem(RECORDS_KEY);
}
