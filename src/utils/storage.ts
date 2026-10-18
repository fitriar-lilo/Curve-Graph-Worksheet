import { StudentProgress, QuestionAttemptState } from '../types/math';

const STORAGE_KEY = 'cambridge_0580_curve_graphs_progress_v2';

export const initialProgress: StudentProgress = {
  studentName: '',
  className: '',
  candidateNumber: '',
  centreNumber: '',
  attempts: {},
  lastSavedAt: new Date().toISOString(),
  timeSpentSeconds: 0,
};

export function saveStudentProgress(progress: StudentProgress): void {
  try {
    const dataToSave: StudentProgress = {
      ...progress,
      lastSavedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (error) {
    console.warn('Unable to auto-save to localStorage:', error);
  }
}

export function loadStudentProgress(): StudentProgress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudentProgress;
    return parsed;
  } catch (error) {
    console.warn('Unable to read from localStorage:', error);
    return null;
  }
}

export function clearStudentProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Unable to clear localStorage:', error);
  }
}

/**
 * Calculates score based on trials rule:
 * - 2.5 points if correct on 1st or 2nd trial
 * - 2.0 points if correct on 3rd or 4th trial
 * - 0 points otherwise
 */
export function calculateTrialScore(trialNumber: number): number {
  if (trialNumber <= 2) return 2.5;
  if (trialNumber <= 4) return 2.0;
  return 0;
}
