/**
 * LocalStorage progress manager for SignSense letter practice and stats.
 */

const STORAGE_KEY = 'sign_sense_progress';

const DEFAULT_PROGRESS = {
  completedLetters: [],
  letterStats: {},
  totalAttempts: 0,
  bestOverallAccuracy: 0
};

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw);
    return {
      completedLetters: parsed.completedLetters || [],
      letterStats: parsed.letterStats || {},
      totalAttempts: parsed.totalAttempts || 0,
      bestOverallAccuracy: parsed.bestOverallAccuracy || 0
    };
  } catch (e) {
    console.warn('Failed to load progress from localStorage:', e);
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveLetterAttempt(letter, accuracyScore, isCompleted = false) {
  try {
    const progress = loadProgress();
    const roundScore = Math.round(accuracyScore || 0);

    const prevStat = progress.letterStats[letter] || { attempts: 0, bestScore: 0, completed: false };

    const newAttempts = prevStat.attempts + 1;
    const newBest = Math.max(prevStat.bestScore, roundScore);
    const newCompleted = prevStat.completed || isCompleted;

    progress.letterStats[letter] = {
      attempts: newAttempts,
      bestScore: newBest,
      completed: newCompleted,
      lastPracticed: new Date().toISOString()
    };

    if (newCompleted && !progress.completedLetters.includes(letter)) {
      progress.completedLetters.push(letter);
    }

    progress.totalAttempts = (progress.totalAttempts || 0) + 1;
    progress.bestOverallAccuracy = Math.max(progress.bestOverallAccuracy || 0, roundScore);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return progress;
  } catch (e) {
    console.warn('Failed to save progress to localStorage:', e);
    return loadProgress();
  }
}

export function resetProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to reset progress:', e);
  }
  return { ...DEFAULT_PROGRESS };
}
