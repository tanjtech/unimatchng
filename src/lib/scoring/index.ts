import { UniversitySubScores, WaecSubject } from '../schemas/index.ts';

/**
 * Weights defined in UniMatch NG specification:
 * - cut-off fit: 30%
 * - course/department strength: 25%
 * - tuition and fees: 15%
 * - campus ambiance and student life: 10%
 * - reviews and reputation: 10%
 * - location and accommodation: 10%
 * Sum = 100%
 */
export const SCORING_WEIGHTS = {
  cutoffFit: 0.30,
  courseStrength: 0.25,
  tuitionAffordability: 0.15,
  campusAmbiance: 0.10,
  reviewsReputation: 0.10,
  locationAccommodation: 0.10,
} as const;

/**
 * Computes deterministic final weighted score (0 to 100) rounded to 1 decimal place.
 */
export function calculateWeightedScore(subScores: UniversitySubScores): number {
  const raw =
    subScores.cutoffFit * SCORING_WEIGHTS.cutoffFit +
    subScores.courseStrength * SCORING_WEIGHTS.courseStrength +
    subScores.tuitionAffordability * SCORING_WEIGHTS.tuitionAffordability +
    subScores.campusAmbiance * SCORING_WEIGHTS.campusAmbiance +
    subScores.reviewsReputation * SCORING_WEIGHTS.reviewsReputation +
    subScores.locationAccommodation * SCORING_WEIGHTS.locationAccommodation;

  return Math.min(100, Math.max(0, Math.round(raw * 10) / 10));
}

/**
 * Converts a positive integer to Roman numerals (e.g. 1 -> I, 4 -> IV, 10 -> X).
 */
export function toRomanNumeral(num: number): string {
  const romanMap: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];

  let result = '';
  let remaining = num;
  for (const [val, roman] of romanMap) {
    while (remaining >= val) {
      result += roman;
      remaining -= val;
    }
  }
  return result || `${num}`;
}

const CREDIT_GRADES = new Set(['A1', 'B2', 'B3', 'C4', 'C5', 'C6']);

export interface WaecAnalysis {
  creditCount: number;
  hasEnglishCredit: boolean;
  hasMathsCredit: boolean;
  isTertiaryEligible: boolean; // Minimum standard in Nigeria: 5 credits including English & Maths
}

export function analyzeWaecResults(subjects: WaecSubject[]): WaecAnalysis {
  let creditCount = 0;
  let hasEnglishCredit = false;
  let hasMathsCredit = false;

  for (const s of subjects) {
    const isCredit = CREDIT_GRADES.has(s.grade);
    if (isCredit) {
      creditCount++;
    }

    const norm = s.subject.trim().toLowerCase();
    if (norm.includes('english')) {
      if (isCredit) hasEnglishCredit = true;
    } else if (norm.includes('math') || norm.includes('arithmetic')) {
      if (isCredit) hasMathsCredit = true;
    }
  }

  return {
    creditCount,
    hasEnglishCredit,
    hasMathsCredit,
    isTertiaryEligible: creditCount >= 5 && hasEnglishCredit && hasMathsCredit,
  };
}
