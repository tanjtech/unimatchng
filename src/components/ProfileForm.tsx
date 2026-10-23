import React, { useState, useEffect } from 'react';
import { StudentProfile, StudentProfileSchema, ClassBackground, WaecSubjectGrade, WaecSubject } from '../lib/schemas/index.ts';
import { analyzeWaecResults } from '../lib/scoring/index.ts';
import { saveClientCache, getClientCache } from '../lib/client-storage.ts';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Plus, X, RotateCcw } from 'lucide-react';

const COMMON_NIGERIAN_SUBJECTS = [
  'English Language',
  'General Mathematics',
  'Biology',
  'Chemistry',
  'Physics',
  'Economics',
  'Government',
  'Literature in English',
  'Civic Education',
  'Agricultural Science',
  'Financial Accounting',
  'Commerce',
  'Christian Religious Studies',
  'Islamic Religious Studies',
  'Geography',
  'Computer Studies',
];

const WAEC_GRADES: WaecSubjectGrade[] = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

const INTEREST_SUGGESTIONS = [
  'Software & AI',
  'Civil Infrastructure',
  'Constitutional Law',
  'Clinical Medicine',
  'Macroeconomics',
  'Creative Writing',
  'Agronomy & Food Systems',
  'Aeronautical Science',
  'International Diplomacy',
  'Biotechnology',
  'Investment Banking',
  'Visual Arts & Architecture',
];

interface ProfileFormProps {
  onSubmitProfile: (profile: StudentProfile) => void;
  isLoading: boolean;
}

const DEFAULT_PROFILE: StudentProfile = {
  fullName: '',
  age: 18,
  classBackground: 'Science',
  interests: ['Software & AI'],
  dreamJob: '',
  waecIsNA: false,
  waecSubjects: [
    { subject: 'English Language', grade: 'B2' },
    { subject: 'General Mathematics', grade: 'B3' },
    { subject: 'Physics', grade: 'C4' },
    { subject: 'Chemistry', grade: 'C5' },
    { subject: 'Biology', grade: 'C4' },
  ],
  jambIsNA: false,
  jambScore: 265,
  courseIsNA: false,
  aspiringCourse: 'Computer Science',
  preferredType: 'All',
  budgetPreference: '₦100,000 - ₦800,000',
  locationPreference: 'South West / Lagos & Ibadan',
};

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmitProfile, isLoading }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [profile, setProfile] = useState<StudentProfile>(() => {
    const cached = getClientCache<StudentProfile>('draft_profile');
    return cached?.data || DEFAULT_PROFILE;
  });

  const [interestInput, setInterestInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectGrade, setNewSubjectGrade] = useState<WaecSubjectGrade>('B3');

  // Auto-save draft profile to cache as student types
  useEffect(() => {
    saveClientCache('draft_profile', profile);
  }, [profile]);

  // Compute live WAEC analysis
  const waecAnalysis = analyzeWaecResults(profile.waecSubjects || []);

  const handleUpdate = <K extends keyof StudentProfile>(key: K, value: StudentProfile[K]) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
    // Clear specific error on field change
    if (errors[key as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  };

  const handleAddInterest = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (!profile.interests.includes(trimmed)) {
      handleUpdate('interests', [...profile.interests, trimmed]);
    }
    setInterestInput('');
  };

  const handleRemoveInterest = (tagToRemove: string) => {
    handleUpdate(
      'interests',
      profile.interests.filter((t) => t !== tagToRemove)
    );
  };

  const handleAddSubject = () => {
    if (!newSubjectName.trim()) return;
    if (profile.waecSubjects.length >= 9) return;

    const exists = profile.waecSubjects.some(
      (s) => s.subject.toLowerCase() === newSubjectName.trim().toLowerCase()
    );
    if (!exists) {
      handleUpdate('waecSubjects', [
        ...profile.waecSubjects,
        { subject: newSubjectName.trim(), grade: newSubjectGrade },
      ]);
      setNewSubjectName('');
    }
  };

  const handleRemoveSubject = (index: number) => {
    const updated = [...profile.waecSubjects];
    updated.splice(index, 1);
    handleUpdate('waecSubjects', updated);
  };

  const handleSubjectGradeChange = (index: number, grade: WaecSubjectGrade) => {
    const updated = [...profile.waecSubjects];
    updated[index] = { ...updated[index], grade };
    handleUpdate('waecSubjects', updated);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!profile.fullName.trim()) newErrors.fullName = 'Full Name is required.';
      if (!profile.age || profile.age < 14 || profile.age > 80)
        newErrors.age = 'Age must be between 14 and 80.';
    } else if (step === 2) {
      if (!profile.jambIsNA && profile.jambScore != null) {
        if (profile.jambScore < 0 || profile.jambScore > 400) {
          newErrors.jambScore = 'UTME score must be between 0 and 400.';
        }
      }
    } else if (step === 3) {
      if (profile.interests.length === 0)
        newErrors.interests = 'Please specify at least one interest or discipline.';
      if (!profile.dreamJob.trim())
        newErrors.dreamJob = 'Dream vocation or career ambition is required.';
      if (!profile.courseIsNA && !profile.aspiringCourse?.trim()) {
        newErrors.aspiringCourse = 'Specify your aspiring course or toggle N/A.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => (Math.min(4, prev + 1) as 1 | 2 | 3 | 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => (Math.max(1, prev - 1) as 1 | 2 | 3 | 4));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    const parseResult = StudentProfileSchema.safeParse(profile);
    if (!parseResult.success) {
      const issueMap: Record<string, string> = {};
      parseResult.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        issueMap[path] = issue.message;
      });
      setErrors(issueMap);
      return;
    }

    onSubmitProfile(parseResult.data);
  };

  const resetToSample = () => {
    setProfile(DEFAULT_PROFILE);
    setErrors({});
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Dossier Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-serif tracking-widest uppercase text-[#A98A4F]">
          Candidate Appraisal Form
        </span>
        <h2 className="font-heading text-3xl font-bold text-[#1F3D2B] mt-1">
          Your Undergraduate Enquiry Dossier
        </h2>
        <p className="font-serif text-sm text-[#8A8576] mt-1">
          Complete the four sections below to configure your bespoke institutional analysis.
        </p>

        {/* Roman Step Indicator */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6">
          {(
            [
              { step: 1, label: 'Identity', roman: 'I' },
              { step: 2, label: 'Academics', roman: 'II' },
              { step: 3, label: 'Vocation', roman: 'III' },
              { step: 4, label: 'Ledger', roman: 'IV' },
            ] as const
          ).map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => {
                if (item.step < currentStep || validateStep(currentStep)) {
                  setCurrentStep(item.step);
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 border text-xs font-serif transition-colors ${
                currentStep === item.step
                  ? 'border-[#1F3D2B] bg-[#1F3D2B] text-[#F5EFE0] font-semibold'
                  : currentStep > item.step
                  ? 'border-[#A98A4F] bg-[#FBF7EC] text-[#1F3D2B]'
                  : 'border-[#E3D9C6] bg-transparent text-[#8A8576]'
              }`}
            >
              <span className="font-heading font-bold text-sm">{item.roman}.</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#FBF7EC] border border-[#D5C7AA] p-6 sm:p-8 shadow-xs"
      >
        {/* STEP I: Candidate Identity */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-[#E3D9C6] pb-3">
              <h3 className="font-heading text-xl font-bold text-[#1F3D2B] flex items-center gap-2">
                <span>Section I: Candidate Identity</span>
              </h3>
              <p className="font-serif text-xs text-[#8A8576]">
                Personal particulars and academic background
              </p>
            </div>

            <div>
              <label className="block font-heading text-sm font-semibold text-[#1B2432] mb-1">
                Full Name <span className="text-[#5A1A24]">*</span>
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => handleUpdate('fullName', e.target.value)}
                placeholder="e.g. Adebayo Chukwuma Danjuma"
                className="w-full bg-[#F5EFE0] border border-[#D5C7AA] px-3.5 py-2.5 font-serif text-sm text-[#1B2432] focus:outline-hidden focus:border-[#1F3D2B]"
              />
              {errors.fullName && (
                <p className="font-serif text-xs text-[#5A1A24] mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-heading text-sm font-semibold text-[#1B2432] mb-1">
                  Age <span className="text-[#5A1A24]">*</span>
                </label>
                <input
                  type="number"
                  min={14}
                  max={80}
                  value={profile.age}
                  onChange={(e) => handleUpdate('age', parseInt(e.target.value, 10) || 18)}
                  className="w-full bg-[#F5EFE0] border border-[#D5C7AA] px-3.5 py-2.5 font-serif text-sm text-[#1B2432] focus:outline-hidden focus:border-[#1F3D2B]"
                />
                {errors.age && (
                  <p className="font-serif text-xs text-[#5A1A24] mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.age}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-heading text-sm font-semibold text-[#1B2432] mb-1">
                  Secondary School Class Track <span className="text-[#5A1A24]">*</span>
                </label>
                <select
                  value={profile.classBackground}
                  onChange={(e) =>
                    handleUpdate('classBackground', e.target.value as ClassBackground)
                  }
                  className="w-full bg-[#F5EFE0] border border-[#D5C7AA] px-3.5 py-2.5 font-serif text-sm text-[#1B2432] focus:outline-hidden focus:border-[#1F3D2B]"
                >
                  <option value="Science">Science (Pure / Applied Sciences & Engineering)</option>
                  <option value="Arts">Arts (Humanities, Languages, History)</option>
                  <option value="Commercial">Commercial / Business (Accounting, Commerce)</option>
                  <option value="Social Science">Social Science (Economics, Political Science)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP II: Academic Record (WAEC / NECO / UTME) */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-[#E3D9C6] pb-3">
              <h3 className="font-heading text-xl font-bold text-[#1F3D2B]">
                Section II: Academic Credentials
              </h3>
              <p className="font-serif text-xs text-[#8A8576]">
                JAMB UTME score and O&apos;Level results (WAEC / NECO)
              </p>
            </div>

            {/* JAMB UTME Section */}
            <div className="border border-[#E3D9C6] p-4 bg-[#F5EFE0]/50">
              <div className="flex items-center justify-between mb-2">
                <label className="font-heading text-sm font-semibold text-[#1B2432]">
                  JAMB UTME Score (0–400)
                </label>
                <label className="flex items-center gap-2 text-xs font-serif cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.jambIsNA}
                    onChange={(e) => handleUpdate('jambIsNA', e.target.checked)}
                    className="accent-[#1F3D2B]"
                  />
                  <span>Awaiting / Not yet sat (N/A)</span>
                </label>
              </div>

              {!profile.jambIsNA ? (
                <div>
                  <input
                    type="number"
                    min={0}
                    max={400}
                    value={profile.jambScore ?? ''}
                    onChange={(e) =>
                      handleUpdate(
                        'jambScore',
                        e.target.value === '' ? null : parseInt(e.target.value, 10)
                      )
                    }
                    placeholder="e.g. 278"
                    className="w-full bg-[#FBF7EC] border border-[#D5C7AA] px-3.5 py-2.5 font-serif text-sm text-[#1B2432] focus:outline-hidden focus:border-[#1F3D2B]"
                  />
                  {errors.jambScore && (
                    <p className="font-serif text-xs text-[#5A1A24] mt-1">{errors.jambScore}</p>
                  )}
                  <p className="font-serif text-[11px] text-[#8A8576] mt-1">
                    Standard Nigerian federal benchmarks: 200+ for competitive departments; 250+ for Medicine & Law.
                  </p>
                </div>
              ) : (
                <p className="font-serif text-xs italic text-[#8A8576] py-1">
                  Institutional cut-offs will be projected without an active score, displaying required target thresholds.
                </p>
              )}
            </div>

            {/* WAEC / NECO Section */}
            <div className="border border-[#E3D9C6] p-4 bg-[#F5EFE0]/50">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="font-heading text-sm font-semibold text-[#1B2432]">
                    WAEC / NECO O&apos;Level Subjects & Grades
                  </label>
                  <p className="font-serif text-xs text-[#8A8576]">
                    Credit grades are A1 through C6. D7 and E8 represent pass marks.
                  </p>
                </div>
                <label className="flex items-center gap-2 text-xs font-serif cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.waecIsNA}
                    onChange={(e) => handleUpdate('waecIsNA', e.target.checked)}
                    className="accent-[#1F3D2B]"
                  />
                  <span>Awaiting Results (N/A)</span>
                </label>
              </div>

              {!profile.waecIsNA && (
                <div className="space-y-4">
                  {/* Live Credit Summary Ledger */}
                  <div className="p-3 bg-[#FBF7EC] border border-[#A98A4F]/40 flex flex-wrap items-center justify-between gap-3 text-xs font-serif">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#1B2432]">Credits Counted:</span>
                      <span className="font-heading text-base font-bold text-[#1F3D2B]">
                        {waecAnalysis.creditCount} / 9
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`flex items-center gap-1 ${
                          waecAnalysis.hasEnglishCredit ? 'text-[#1F3D2B]' : 'text-[#5A1A24]'
                        }`}
                      >
                        {waecAnalysis.hasEnglishCredit ? '✓' : '✗'} English Credit
                      </span>
                      <span
                        className={`flex items-center gap-1 ${
                          waecAnalysis.hasMathsCredit ? 'text-[#1F3D2B]' : 'text-[#5A1A24]'
                        }`}
                      >
                        {waecAnalysis.hasMathsCredit ? '✓' : '✗'} Maths Credit
                      </span>
                    </div>

                    <div className="text-[11px] uppercase tracking-wide">
                      {waecAnalysis.isTertiaryEligible ? (
                        <span className="text-[#1F3D2B] font-semibold">
                          [Standard 5-Credit Matriculation Met]
                        </span>
                      ) : (
                        <span className="text-[#5A1A24]">
                          [5 credits inc. Eng & Maths advised]
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Subject List */}
                  <div className="space-y-2">
                    {profile.waecSubjects.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 bg-[#FBF7EC] border border-[#E3D9C6] px-3 py-1.5"
                      >
                        <span className="font-serif text-sm text-[#1B2432] truncate flex-1">
                          {item.subject}
                        </span>
                        <div className="flex items-center gap-2">
                          <select
                            value={item.grade}
                            onChange={(e) =>
                              handleSubjectGradeChange(idx, e.target.value as WaecSubjectGrade)
                            }
                            className="bg-[#F5EFE0] border border-[#D5C7AA] text-xs font-mono font-semibold px-2 py-1"
                          >
                            {WAEC_GRADES.map((g) => (
                              <option key={g} value={g}>
                                {g}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(idx)}
                            className="text-[#8A8576] hover:text-[#5A1A24] p-1"
                            title="Remove Subject"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Subject Row */}
                  {profile.waecSubjects.length < 9 && (
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <input
                        list="nigerian-subjects"
                        type="text"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        placeholder="Add subject (e.g. Economics)"
                        className="flex-1 bg-[#FBF7EC] border border-[#D5C7AA] px-3 py-1.5 text-xs font-serif"
                      />
                      <datalist id="nigerian-subjects">
                        {COMMON_NIGERIAN_SUBJECTS.map((s) => (
                          <option key={s} value={s} />
                        ))}
                      </datalist>

                      <select
                        value={newSubjectGrade}
                        onChange={(e) => setNewSubjectGrade(e.target.value as WaecSubjectGrade)}
                        className="bg-[#FBF7EC] border border-[#D5C7AA] px-2 py-1.5 text-xs font-mono"
                      >
                        {WAEC_GRADES.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleAddSubject}
                        className="px-4 py-1.5 bg-[#1F3D2B] text-[#F5EFE0] font-serif text-xs flex items-center justify-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP III: Vocation & Aspirations */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-[#E3D9C6] pb-3">
              <h3 className="font-heading text-xl font-bold text-[#1F3D2B]">
                Section III: Vocational Aspirations
              </h3>
              <p className="font-serif text-xs text-[#8A8576]">
                Target discipline, vocational goal, and scholarly interests
              </p>
            </div>

            {/* Aspiring Course with N/A Toggle */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-heading text-sm font-semibold text-[#1B2432]">
                  Aspiring Undergraduate Department / Course
                </label>
                <label className="flex items-center gap-2 text-xs font-serif cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.courseIsNA}
                    onChange={(e) => handleUpdate('courseIsNA', e.target.checked)}
                    className="accent-[#1F3D2B]"
                  />
                  <span>Undecided (Recommend 3 best-fit courses)</span>
                </label>
              </div>

              {!profile.courseIsNA ? (
                <div>
                  <input
                    type="text"
                    value={profile.aspiringCourse ?? ''}
                    onChange={(e) => handleUpdate('aspiringCourse', e.target.value)}
                    placeholder="e.g. Electrical & Electronics Engineering, Law, Pharmacy"
                    className="w-full bg-[#F5EFE0] border border-[#D5C7AA] px-3.5 py-2.5 font-serif text-sm text-[#1B2432] focus:outline-hidden focus:border-[#1F3D2B]"
                  />
                  {errors.aspiringCourse && (
                    <p className="font-serif text-xs text-[#5A1A24] mt-1">
                      {errors.aspiringCourse}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-[#F5EFE0] border border-[#A98A4F]/40 text-xs font-serif text-[#1F3D2B]">
                  <strong>Counsellor Pathway:</strong> Since your course is undecided, UniMatch NG will synthesize your class background, passions, and dream career to propose the three most viable, accredited degree pathways.
                </div>
              )}
            </div>

            {/* Dream Job */}
            <div>
              <label className="block font-heading text-sm font-semibold text-[#1B2432] mb-1">
                Dream Job / Life Vocation <span className="text-[#5A1A24]">*</span>
              </label>
              <input
                type="text"
                value={profile.dreamJob}
                onChange={(e) => handleUpdate('dreamJob', e.target.value)}
                placeholder="e.g. AI Systems Architect, Senior Advocate of Nigeria (SAN), Neurosurgeon, Central Banker"
                className="w-full bg-[#F5EFE0] border border-[#D5C7AA] px-3.5 py-2.5 font-serif text-sm text-[#1B2432] focus:outline-hidden focus:border-[#1F3D2B]"
              />
              {errors.dreamJob && (
                <p className="font-serif text-xs text-[#5A1A24] mt-1">{errors.dreamJob}</p>
              )}
            </div>

            {/* Interests & Tags */}
            <div>
              <label className="block font-heading text-sm font-semibold text-[#1B2432] mb-1">
                Academic Passions & Inquisitive Interests
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddInterest(interestInput);
                    }
                  }}
                  placeholder="Type interest and press enter"
                  className="flex-1 bg-[#F5EFE0] border border-[#D5C7AA] px-3.5 py-2 font-serif text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleAddInterest(interestInput)}
                  className="px-4 py-2 bg-[#1F3D2B] text-[#F5EFE0] text-xs font-serif"
                >
                  Add Tag
                </button>
              </div>

              {/* Tag Display */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {profile.interests.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 bg-[#F5EFE0] border border-[#D5C7AA] px-2.5 py-1 text-xs font-serif text-[#1F3D2B]"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(tag)}
                      className="text-[#8A8576] hover:text-[#5A1A24]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick suggestions */}
              <div>
                <span className="text-[11px] font-serif text-[#8A8576] mr-2">Suggestions:</span>
                <div className="inline-flex flex-wrap gap-1">
                  {INTEREST_SUGGESTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddInterest(tag)}
                      className="text-[11px] font-serif text-[#1F3D2B] hover:text-[#5A1A24] underline cursor-pointer mr-2"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP IV: Institutional Preferences & Final Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-[#E3D9C6] pb-3">
              <h3 className="font-heading text-xl font-bold text-[#1F3D2B]">
                Section IV: Institutional Ledger & Dispatch
              </h3>
              <p className="font-serif text-xs text-[#8A8576]">
                Institutional category preference and final candidate verification
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-heading text-sm font-semibold text-[#1B2432] mb-1">
                  Preferred University Type
                </label>
                <select
                  value={profile.preferredType}
                  onChange={(e) =>
                    handleUpdate('preferredType', e.target.value as 'All' | 'Federal' | 'State' | 'Private')
                  }
                  className="w-full bg-[#F5EFE0] border border-[#D5C7AA] px-3.5 py-2.5 font-serif text-sm text-[#1B2432]"
                >
                  <option value="All">All Categories (Diverse Mix)</option>
                  <option value="Federal">Federal Universities (Premier & Subsidized)</option>
                  <option value="State">State Universities (Regional Heritage)</option>
                  <option value="Private">Private Universities (High Infrastructure & Academic Calendar Stability)</option>
                </select>
              </div>

              <div>
                <label className="block font-heading text-sm font-semibold text-[#1B2432] mb-1">
                  Tuition Budget Tolerance
                </label>
                <select
                  value={profile.budgetPreference ?? '₦100,000 - ₦800,000'}
                  onChange={(e) => handleUpdate('budgetPreference', e.target.value)}
                  className="w-full bg-[#F5EFE0] border border-[#D5C7AA] px-3.5 py-2.5 font-serif text-sm text-[#1B2432]"
                >
                  <option value="Under ₦200,000 (Federal Focus)">Under ₦200,000 / session (Federal focus)</option>
                  <option value="₦200,000 - ₦800,000 (Federal & State)">₦200,000 - ₦800,000 (Federal & State)</option>
                  <option value="₦800,000 - ₦2,500,000 (Private Tier II)">₦800,000 - ₦2,500,000 (Private Tier II)</option>
                  <option value="₦2,500,000+ (Premier Private)">₦2,500,000+ (Premier Private)</option>
                </select>
              </div>
            </div>

            {/* Dossier Summary Box */}
            <div className="bg-[#F5EFE0] border border-[#D5C7AA] p-4 font-serif text-xs space-y-2">
              <h4 className="font-heading text-sm font-bold text-[#1F3D2B] uppercase tracking-wider">
                Candidate Summary for Dispatch
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[#1B2432]">
                <div>
                  <span className="text-[#8A8576]">Scholar:</span> {profile.fullName} (Age {profile.age})
                </div>
                <div>
                  <span className="text-[#8A8576]">Track:</span> {profile.classBackground}
                </div>
                <div>
                  <span className="text-[#8A8576]">UTME Score:</span>{' '}
                  {profile.jambIsNA ? 'Awaiting / Unknown' : `${profile.jambScore} / 400`}
                </div>
                <div>
                  <span className="text-[#8A8576]">O&apos;Level Credits:</span>{' '}
                  {profile.waecIsNA ? 'Awaiting results' : `${waecAnalysis.creditCount} subjects credited`}
                </div>
                <div className="col-span-2">
                  <span className="text-[#8A8576]">Target Department:</span>{' '}
                  {profile.courseIsNA ? 'Undecided (Counsellor will formulate 3 recommendations)' : profile.aspiringCourse}
                </div>
                <div className="col-span-2">
                  <span className="text-[#8A8576]">Career Ambition:</span> {profile.dreamJob}
                </div>
              </div>
            </div>

            {/* Reset to Sample Option */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={resetToSample}
                className="text-xs font-serif text-[#8A8576] hover:text-[#1B2432] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to exemplary candidate sample</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between border-t border-[#E3D9C6] pt-6 mt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-5 py-2.5 border border-[#D5C7AA] bg-[#F5EFE0] hover:bg-[#EAE2D0] text-[#1B2432] font-serif text-xs flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Section</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 bg-[#1F3D2B] hover:bg-[#162C1F] text-[#F5EFE0] font-heading font-semibold text-xs tracking-wider uppercase border border-[#A98A4F] flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Continue to Section {currentStep === 1 ? 'II' : currentStep === 2 ? 'III' : 'IV'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A98A4F]" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-[#1F3D2B] hover:bg-[#162C1F] disabled:opacity-50 text-[#F5EFE0] font-heading font-bold text-sm tracking-widest uppercase border border-[#A98A4F] flex items-center gap-2 cursor-pointer shadow-md"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-[#A98A4F] border-t-transparent rounded-full animate-spin" />
                  <span>Consulting Admissions Council...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#A98A4F]" />
                  <span>Obtain Institutional Recommendations</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
