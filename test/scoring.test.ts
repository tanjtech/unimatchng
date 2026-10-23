import assert from 'node:assert';
import { calculateWeightedScore, toRomanNumeral, analyzeWaecResults, SCORING_WEIGHTS } from '../src/lib/scoring/index.ts';
import { hashData, createRecommendationsCacheKey } from '../src/lib/cache/index.ts';
import { StudentProfileSchema, WaecSubject } from '../src/lib/schemas/index.ts';

console.log('--- Running UniMatch NG Test Suite ---');

// Test 1: Scoring function weights
{
  console.log('Test 1: Scoring function weights & determinism');
  const totalWeight = Object.values(SCORING_WEIGHTS).reduce((sum, w) => sum + w, 0);
  assert.strictEqual(Math.round(totalWeight * 100) / 100, 1.0, 'Weights must sum exactly to 1.0');

  const perfectScore = calculateWeightedScore({
    cutoffFit: 100,
    courseStrength: 100,
    tuitionAffordability: 100,
    campusAmbiance: 100,
    reviewsReputation: 100,
    locationAccommodation: 100,
  });
  assert.strictEqual(perfectScore, 100, 'All 100s must evaluate to 100');

  const zeroScore = calculateWeightedScore({
    cutoffFit: 0,
    courseStrength: 0,
    tuitionAffordability: 0,
    campusAmbiance: 0,
    reviewsReputation: 0,
    locationAccommodation: 0,
  });
  assert.strictEqual(zeroScore, 0, 'All 0s must evaluate to 0');

  const sampleScore = calculateWeightedScore({
    cutoffFit: 80, // 80 * 0.30 = 24
    courseStrength: 90, // 90 * 0.25 = 22.5
    tuitionAffordability: 70, // 70 * 0.15 = 10.5
    campusAmbiance: 85, // 85 * 0.10 = 8.5
    reviewsReputation: 95, // 95 * 0.10 = 9.5
    locationAccommodation: 80, // 80 * 0.10 = 8.0
    // Sum = 24 + 22.5 + 10.5 + 8.5 + 9.5 + 8.0 = 83.0
  });
  assert.strictEqual(sampleScore, 83.0, 'Sample weighted calculation should be 83.0');
  console.log('✓ Scoring weights passed');
}

// Test 2: Roman numerals
{
  console.log('Test 2: Roman Numeral conversion');
  assert.strictEqual(toRomanNumeral(1), 'I');
  assert.strictEqual(toRomanNumeral(2), 'II');
  assert.strictEqual(toRomanNumeral(3), 'III');
  assert.strictEqual(toRomanNumeral(4), 'IV');
  assert.strictEqual(toRomanNumeral(5), 'V');
  assert.strictEqual(toRomanNumeral(6), 'VI');
  assert.strictEqual(toRomanNumeral(7), 'VII');
  assert.strictEqual(toRomanNumeral(8), 'VIII');
  assert.strictEqual(toRomanNumeral(9), 'IX');
  assert.strictEqual(toRomanNumeral(10), 'X');
  console.log('✓ Roman numerals passed');
}

// Test 3: WAEC / NECO Analysis
{
  console.log('Test 3: WAEC/NECO credit evaluation');
  const subjects: WaecSubject[] = [
    { subject: 'English Language', grade: 'B2' },
    { subject: 'General Mathematics', grade: 'A1' },
    { subject: 'Physics', grade: 'B3' },
    { subject: 'Chemistry', grade: 'C4' },
    { subject: 'Biology', grade: 'C5' },
    { subject: 'Economics', grade: 'D7' }, // Pass, not credit
    { subject: 'Civic Education', grade: 'C6' },
  ];
  const analysis = analyzeWaecResults(subjects);
  assert.strictEqual(analysis.creditCount, 6, 'Should have 6 credits (A1-C6)');
  assert.strictEqual(analysis.hasEnglishCredit, true, 'Should recognize English credit');
  assert.strictEqual(analysis.hasMathsCredit, true, 'Should recognize Mathematics credit');
  assert.strictEqual(analysis.isTertiaryEligible, true, 'Should be tertiary eligible with 6 credits including Eng & Maths');
  console.log('✓ WAEC analysis passed');
}

// Test 4: Cache Key Hashing
{
  console.log('Test 4: Cache key hashing determinism');
  const dataA = { name: 'Adebayo', age: 17, course: 'Law' };
  const dataB = { age: 17, course: 'Law', name: 'Adebayo' }; // re-ordered keys
  const hashA = hashData(dataA);
  const hashB = hashData(dataB);
  assert.strictEqual(hashA, hashB, 'Normalized data with different key insertion orders must yield identical hash');

  const key = createRecommendationsCacheKey(dataA, 'v1.4');
  assert.ok(key.startsWith('unimatch:recs:v1:'), 'Cache key must have correct namespace prefix');
  console.log('✓ Cache hashing passed');
}

// Test 5: Zod Schema Validation
{
  console.log('Test 5: StudentProfile Zod validation');
  const validProfile = {
    fullName: 'Chinua Achebe',
    age: 18,
    classBackground: 'Arts',
    interests: ['Literature', 'Creative Writing', 'History'],
    dreamJob: 'Diplomat / Author',
    waecIsNA: false,
    waecSubjects: [
      { subject: 'English Language', grade: 'A1' },
      { subject: 'Literature in English', grade: 'A1' },
    ],
    jambIsNA: false,
    jambScore: 285,
    courseIsNA: false,
    aspiringCourse: 'English & International Studies',
    preferredType: 'Federal',
  };

  const parsed = StudentProfileSchema.safeParse(validProfile);
  assert.strictEqual(parsed.success, true, 'Valid profile must parse cleanly');

  // Negative test: invalid age
  const invalidProfile = {
    ...validProfile,
    age: 10, // Too young
  };
  const invalidParsed = StudentProfileSchema.safeParse(invalidProfile);
  assert.strictEqual(invalidParsed.success, false, 'Invalid age must fail validation');
  console.log('✓ Schema validation passed');
}

console.log('All 5 test suites passed successfully!');
