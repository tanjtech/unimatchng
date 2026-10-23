import { z } from 'zod';

export const WaecSubjectGradeSchema = z.enum([
  'A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'
]);

export type WaecSubjectGrade = z.infer<typeof WaecSubjectGradeSchema>;

export const WaecSubjectSchema = z.object({
  subject: z.string().min(2, 'Subject name is required'),
  grade: WaecSubjectGradeSchema,
});

export type WaecSubject = z.infer<typeof WaecSubjectSchema>;

export const ClassBackgroundSchema = z.enum([
  'Science',
  'Arts',
  'Commercial',
  'Social Science'
]);

export type ClassBackground = z.infer<typeof ClassBackgroundSchema>;

export const InstitutionTypeSchema = z.enum(['Federal', 'State', 'Private']);
export type InstitutionType = z.infer<typeof InstitutionTypeSchema>;

export const AdmissionChanceSchema = z.enum(['Reach', 'Match', 'Safe']);
export type AdmissionChance = z.infer<typeof AdmissionChanceSchema>;

export const StudentProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  age: z.coerce.number().int().min(14, 'Age must be at least 14').max(90, 'Age must be reasonable'),
  classBackground: ClassBackgroundSchema,
  interests: z.array(z.string().min(1)).min(1, 'Please specify at least one interest or subject you enjoy'),
  dreamJob: z.string().min(2, 'Dream vocation or career path is required').max(120),
  
  // WAEC / NECO section
  waecIsNA: z.boolean().default(false),
  waecSubjects: z.array(WaecSubjectSchema).max(9).default([]),
  
  // JAMB UTME section
  jambIsNA: z.boolean().default(false),
  jambScore: z.coerce.number().int().min(0).max(400).optional().nullable(),
  
  // Target course / department
  courseIsNA: z.boolean().default(false),
  aspiringCourse: z.string().optional().nullable(),
  
  // Preferences
  preferredType: z.enum(['All', 'Federal', 'State', 'Private']).default('All'),
  budgetPreference: z.string().optional().nullable(),
  locationPreference: z.string().optional().nullable(),
});

export type StudentProfile = z.infer<typeof StudentProfileSchema>;

export const UniversitySubScoresSchema = z.object({
  cutoffFit: z.number().min(0).max(100),
  courseStrength: z.number().min(0).max(100),
  tuitionAffordability: z.number().min(0).max(100),
  campusAmbiance: z.number().min(0).max(100),
  reviewsReputation: z.number().min(0).max(100),
  locationAccommodation: z.number().min(0).max(100),
});

export type UniversitySubScores = z.infer<typeof UniversitySubScoresSchema>;

export const UniversityRecommendationSchema = z.object({
  rank: z.number().int().min(1).max(10),
  name: z.string(),
  shortName: z.string(),
  slug: z.string(),
  type: InstitutionTypeSchema,
  state: z.string(),
  city: z.string(),
  course: z.string(),
  approxCutoff: z.string(),
  admissionChance: AdmissionChanceSchema,
  feesRangeNGN: z.string(),
  ambianceSummary: z.string(),
  reviewSummary: z.string(),
  pros: z.array(z.string()).min(1),
  cons: z.array(z.string()).min(1),
  subScores: UniversitySubScoresSchema,
  finalScore: z.number().min(0).max(100).optional(),
  whyItFits: z.string(),
});

export type UniversityRecommendation = z.infer<typeof UniversityRecommendationSchema>;

export const RecommendationResponseSchema = z.object({
  suggestedCourses: z.array(z.string()).optional().default([]),
  counsellorNote: z.string().optional(),
  universities: z.array(UniversityRecommendationSchema).min(1).max(10),
});

export type RecommendationResponse = z.infer<typeof RecommendationResponseSchema>;

export const UniversityDetailSchema = z.object({
  slug: z.string(),
  name: z.string(),
  motto: z.string().optional().default('Knowledge for Excellence'),
  foundedYear: z.union([z.number(), z.string()]).optional().default('1948'),
  overview: z.string(),
  admissionRequirements: z.object({
    postUtmeDetails: z.string(),
    olevelSubjectCombination: z.array(z.string()),
    jambSubjectCombination: z.array(z.string()),
    minimumCutoffNote: z.string(),
  }),
  feesBreakdown: z.object({
    acceptanceFee: z.string(),
    tuitionSession: z.string(),
    facultyDues: z.string(),
    accommodationEstimated: z.string(),
    totalEstimatedYearOne: z.string(),
  }),
  hostelsAndAccommodation: z.object({
    onCampusAvailability: z.string(),
    offCampusAverageRent: z.string(),
    qualityDescription: z.string(),
  }),
  notableFaculties: z.array(z.string()),
  campusLife: z.object({
    associationsAndClubs: z.array(z.string()),
    securityAndEnvironment: z.string(),
    traditions: z.string(),
  }),
  scholarshipsAndAid: z.array(z.string()),
  howToApply: z.array(z.string()),
  dreamJobFitAnalysis: z.string(),
  webSourcesConsulted: z.array(z.string()).optional().default([]),
});

export type UniversityDetail = z.infer<typeof UniversityDetailSchema>;

export const ChatMessageSchema = z.object({
  id: z.string(),
  sender: z.enum(['student', 'counsellor']),
  text: z.string(),
  timestamp: z.string(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(1000),
  threadId: z.string().optional(),
  universitySlug: z.string().optional(),
  context: z.string().optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
