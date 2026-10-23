import React, { useState, useMemo } from 'react';
import {
  UniversityRecommendation,
  RecommendationResponse,
  AdmissionChance,
  InstitutionType,
} from '../lib/schemas/index.ts';
import { toRomanNumeral } from '../lib/scoring/index.ts';
import {
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Archive,
  Info,
  Check,
  SlidersHorizontal,
  GraduationCap,
} from 'lucide-react';

interface RecommendationsViewProps {
  data: RecommendationResponse;
  isFromArchive: boolean;
  onRefresh: () => void;
  isLoading: boolean;
  onSelectUniversity: (uni: UniversityRecommendation) => void;
  savedList: UniversityRecommendation[];
  onToggleSave: (uni: UniversityRecommendation) => void;
  onSelectSuggestedCourse?: (course: string) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  data,
  isFromArchive,
  onRefresh,
  isLoading,
  onSelectUniversity,
  savedList,
  onToggleSave,
  onSelectSuggestedCourse,
}) => {
  const [filterType, setFilterType] = useState<string>('All');
  const [filterChance, setFilterChance] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'rank' | 'score' | 'chance'>('rank');
  const [expandedSubscores, setExpandedSubscores] = useState<Record<string, boolean>>({});

  const savedSlugSet = useMemo(() => new Set(savedList.map((u) => u.slug)), [savedList]);

  const toggleSubscore = (slug: string) => {
    setExpandedSubscores((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

  const filteredAndSorted = useMemo(() => {
    let list = [...data.universities];

    // Filter by type
    if (filterType !== 'All') {
      list = list.filter((u) => u.type === filterType);
    }

    // Filter by chance
    if (filterChance !== 'All') {
      list = list.filter((u) => u.admissionChance === filterChance);
    }

    // Sort
    if (sortBy === 'score') {
      list.sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));
    } else if (sortBy === 'chance') {
      const chanceWeight: Record<AdmissionChance, number> = { Safe: 3, Match: 2, Reach: 1 };
      list.sort((a, b) => chanceWeight[b.admissionChance] - chanceWeight[a.admissionChance]);
    } else {
      list.sort((a, b) => a.rank - b.rank);
    }

    return list;
  }, [data.universities, filterType, filterChance, sortBy]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Top Banner & Archive Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#D5C7AA] mb-8">
        <div>
          <span className="text-xs font-serif tracking-widest uppercase text-[#A98A4F]">
            Evaluated Prospectus
          </span>
          <h2 className="font-heading text-3xl font-bold text-[#1F3D2B] mt-0.5">
            Your Esteemed Recommendations
          </h2>
          <p className="font-serif text-xs text-[#8A8576] mt-1">
            Ten Nigerian institutions appraised across cut-off fit, academic faculty strength, and living environment.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {isFromArchive && (
            <span className="flex items-center gap-1.5 text-xs font-serif text-[#8A8576] bg-[#FBF7EC] border border-[#D5C7AA] px-2.5 py-1">
              <Archive className="w-3.5 h-3.5 text-[#A98A4F]" />
              <span>From archive</span>
            </span>
          )}

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#FBF7EC] hover:bg-[#F5EFE0] border border-[#D5C7AA] text-xs font-serif text-[#1F3D2B] font-semibold cursor-pointer"
            title="Bypass cached evaluation and generate a fresh appraisal"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#A98A4F]' : ''}`} />
            <span>Refresh Appraisal</span>
          </button>
        </div>
      </div>

      {/* Suggested Courses Banner if Course was N/A */}
      {data.suggestedCourses && data.suggestedCourses.length > 0 && (
        <div className="mb-8 p-5 bg-[#FBF7EC] border border-[#A98A4F] shadow-xs">
          <div className="flex items-start gap-3">
            <GraduationCap className="w-5 h-5 text-[#A98A4F] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-heading text-base font-bold text-[#1F3D2B]">
                Counsellor Pathway: Three Best-Fit Disciplines
              </h3>
              <p className="font-serif text-xs text-[#8A8576] mb-3">
                Based on your interests, class background, and vocational ambition, the admissions council recommends these accredited disciplines:
              </p>
              <div className="flex flex-wrap gap-2">
                {data.suggestedCourses.map((course, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectSuggestedCourse?.(course)}
                    className="px-3 py-1 bg-[#F5EFE0] hover:bg-[#EAE2D0] border border-[#D5C7AA] text-xs font-serif text-[#1F3D2B] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{course}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Counsellor Note */}
      {data.counsellorNote && (
        <div className="mb-8 p-4 bg-[#1F3D2B]/5 border-l-4 border-[#1F3D2B] font-serif text-xs text-[#1B2432] leading-relaxed">
          <strong className="font-heading text-sm text-[#1F3D2B] block mb-1">
            Advisory Council Observation:
          </strong>
          {data.counsellorNote}
        </div>
      )}

      {/* Filter and Sort Bar */}
      <div className="bg-[#FBF7EC] border border-[#E3D9C6] p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs font-serif">
          <span className="flex items-center gap-1 text-[#8A8576] font-semibold uppercase tracking-wider text-[10px]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#A98A4F]" />
            <span>Filter By:</span>
          </span>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#F5EFE0] border border-[#D5C7AA] px-2.5 py-1 text-xs font-serif text-[#1B2432]"
          >
            <option value="All">All Types (Federal, State, Private)</option>
            <option value="Federal">Federal Universities Only</option>
            <option value="State">State Universities Only</option>
            <option value="Private">Private Universities Only</option>
          </select>

          {/* Chance Filter */}
          <select
            value={filterChance}
            onChange={(e) => setFilterChance(e.target.value)}
            className="bg-[#F5EFE0] border border-[#D5C7AA] px-2.5 py-1 text-xs font-serif text-[#1B2432]"
          >
            <option value="All">All Admission Chances</option>
            <option value="Safe">Safe (High Probability)</option>
            <option value="Match">Match (Competitive Alignment)</option>
            <option value="Reach">Reach (Aspirational Threshold)</option>
          </select>
        </div>

        {/* Sort Bar */}
        <div className="flex items-center gap-2 text-xs font-serif">
          <span className="text-[#8A8576] text-[10px] uppercase tracking-wider">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'rank' | 'score' | 'chance')}
            className="bg-[#F5EFE0] border border-[#D5C7AA] px-2.5 py-1 text-xs font-serif text-[#1B2432]"
          >
            <option value="rank">Recommended Rank (I to X)</option>
            <option value="score">Weighted Score (Highest)</option>
            <option value="chance">Admission Likelihood (Safe First)</option>
          </select>
        </div>
      </div>

      {/* Visible Mandatory Disclaimer */}
      <div className="mb-8 p-3.5 bg-[#F5EFE0] border border-[#D5C7AA] flex items-start gap-2.5 text-xs font-serif text-[#5A1A24]">
        <Info className="w-4 h-4 text-[#A98A4F] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Official Institutional Disclaimer:</strong> All cut-off marks, probability metrics, and tuition ranges are AI-assisted advisory estimations. Requirements vary annually based on senate quotas. Verify all requirements on the respective university admissions portal and the JAMB Central Admissions Processing System (CAPS).
        </p>
      </div>

      {/* University Ranked Cards */}
      <div className="space-y-6">
        {filteredAndSorted.length === 0 ? (
          <div className="p-12 text-center bg-[#FBF7EC] border border-[#E3D9C6] font-serif">
            <p className="text-sm text-[#8A8576]">No institutions match your selected filter criteria.</p>
            <button
              onClick={() => {
                setFilterType('All');
                setFilterChance('All');
              }}
              className="mt-3 text-xs font-semibold text-[#1F3D2B] underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredAndSorted.map((uni) => {
            const isSaved = savedSlugSet.has(uni.slug);
            const romanRank = toRomanNumeral(uni.rank);
            const isSubscoresOpen = Boolean(expandedSubscores[uni.slug]);

            // Badge styling
            const chanceBadgeClasses =
              uni.admissionChance === 'Safe'
                ? 'border-[#1F3D2B] text-[#1F3D2B] bg-[#1F3D2B]/10'
                : uni.admissionChance === 'Match'
                ? 'border-[#A98A4F] text-[#8F743F] bg-[#A98A4F]/10'
                : 'border-[#5A1A24] text-[#5A1A24] bg-[#5A1A24]/10';

            return (
              <div
                key={uni.slug}
                className="bg-[#FBF7EC] border border-[#D5C7AA] shadow-xs transition-shadow hover:shadow-md relative"
              >
                {/* Card Header */}
                <div className="p-5 sm:p-6 border-b border-[#E3D9C6]">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Rank & Institution Name */}
                    <div className="flex items-start gap-4">
                      {/* Roman Numeral Rank */}
                      <div className="w-11 h-11 border border-[#A98A4F] bg-[#1F3D2B] text-[#F5EFE0] font-heading font-bold text-base flex items-center justify-center shrink-0">
                        {romanRank}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#1F3D2B]">
                            {uni.name}
                          </h3>
                          <span className="font-serif text-sm font-semibold text-[#8A8576]">
                            ({uni.shortName})
                          </span>
                        </div>

                        {/* Unboxed Metadata Line with typographic separators */}
                        <div className="flex flex-wrap items-center gap-2 text-xs font-serif text-[#8A8576]">
                          <span className="font-semibold text-[#1B2432]">{uni.type} University</span>
                          <span>·</span>
                          <span>
                            {uni.city}, {uni.state} State
                          </span>
                          <span>·</span>
                          <span className="text-[#1F3D2B] font-semibold">{uni.course}</span>
                        </div>
                      </div>
                    </div>

                    {/* Score & Chance Badges */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] font-serif uppercase tracking-wider text-[#8A8576] block">
                          Weighted Score
                        </span>
                        <div className="font-heading text-2xl font-bold text-[#1F3D2B]">
                          {uni.finalScore ?? 0}
                          <span className="text-sm font-serif font-normal text-[#8A8576]">
                            /100
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-serif uppercase tracking-wider px-2 py-0.5 border ${chanceBadgeClasses}`}
                      >
                        {uni.admissionChance} Fit
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Key Metrics Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-serif bg-[#F5EFE0] border border-[#E3D9C6] p-3.5">
                    <div>
                      <span className="text-[#8A8576] block mb-0.5">Estimated Cut-off Target:</span>
                      <strong className="text-sm font-heading font-bold text-[#1F3D2B]">
                        {uni.approxCutoff}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[#8A8576] block mb-0.5">Session Fees Range:</span>
                      <strong className="text-sm font-heading font-bold text-[#1F3D2B]">
                        {uni.feesRangeNGN}
                      </strong>
                    </div>
                  </div>

                  {/* Why it Fits */}
                  <div className="font-serif text-xs leading-relaxed text-[#1B2432]">
                    <strong className="font-heading text-sm text-[#1F3D2B] block mb-0.5">
                      Vocational Rationale:
                    </strong>
                    {uni.whyItFits}
                  </div>

                  {/* Ambiance & Reviews */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-serif">
                    <div>
                      <span className="text-[#8A8576] block font-semibold mb-0.5">
                        Campus Heritage & Ambiance:
                      </span>
                      <p className="text-[#1B2432]/90 italic">{uni.ambianceSummary}</p>
                    </div>
                    <div>
                      <span className="text-[#8A8576] block font-semibold mb-0.5">
                        Reputation & Academic Standing:
                      </span>
                      <p className="text-[#1B2432]/90 italic">{uni.reviewSummary}</p>
                    </div>
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E3D9C6] text-xs font-serif">
                    <div>
                      <span className="text-[#1F3D2B] font-semibold block mb-1">
                        Distinctive Merits:
                      </span>
                      <ul className="space-y-1 list-disc list-inside text-[#1B2432]/90">
                        {uni.pros.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-[#5A1A24] font-semibold block mb-1">
                        Prudent Considerations:
                      </span>
                      <ul className="space-y-1 list-disc list-inside text-[#1B2432]/90">
                        {uni.cons.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Subscores Accordion Drawer */}
                  {isSubscoresOpen && (
                    <div className="mt-4 pt-4 border-t border-[#D5C7AA] bg-[#F5EFE0]/60 p-4">
                      <h4 className="font-heading text-xs font-bold text-[#1F3D2B] uppercase tracking-wider mb-3">
                        Weighted Factor Breakdown (30% / 25% / 15% / 10% / 10% / 10%)
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-serif">
                        <div className="border border-[#E3D9C6] bg-[#FBF7EC] p-2">
                          <span className="text-[#8A8576] block text-[11px]">Cut-off Fit (30%)</span>
                          <strong className="font-heading text-sm text-[#1F3D2B]">
                            {uni.subScores.cutoffFit} / 100
                          </strong>
                        </div>
                        <div className="border border-[#E3D9C6] bg-[#FBF7EC] p-2">
                          <span className="text-[#8A8576] block text-[11px]">Faculty Strength (25%)</span>
                          <strong className="font-heading text-sm text-[#1F3D2B]">
                            {uni.subScores.courseStrength} / 100
                          </strong>
                        </div>
                        <div className="border border-[#E3D9C6] bg-[#FBF7EC] p-2">
                          <span className="text-[#8A8576] block text-[11px]">Affordability (15%)</span>
                          <strong className="font-heading text-sm text-[#1F3D2B]">
                            {uni.subScores.tuitionAffordability} / 100
                          </strong>
                        </div>
                        <div className="border border-[#E3D9C6] bg-[#FBF7EC] p-2">
                          <span className="text-[#8A8576] block text-[11px]">Campus Ambiance (10%)</span>
                          <strong className="font-heading text-sm text-[#1F3D2B]">
                            {uni.subScores.campusAmbiance} / 100
                          </strong>
                        </div>
                        <div className="border border-[#E3D9C6] bg-[#FBF7EC] p-2">
                          <span className="text-[#8A8576] block text-[11px]">Reputation (10%)</span>
                          <strong className="font-heading text-sm text-[#1F3D2B]">
                            {uni.subScores.reviewsReputation} / 100
                          </strong>
                        </div>
                        <div className="border border-[#E3D9C6] bg-[#FBF7EC] p-2">
                          <span className="text-[#8A8576] block text-[11px]">Hostels & City (10%)</span>
                          <strong className="font-heading text-sm text-[#1F3D2B]">
                            {uni.subScores.locationAccommodation} / 100
                          </strong>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="px-5 sm:px-6 py-3.5 bg-[#F5EFE0] border-t border-[#E3D9C6] flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggleSubscore(uni.slug)}
                    className="text-xs font-serif text-[#8A8576] hover:text-[#1F3D2B] flex items-center gap-1 cursor-pointer"
                  >
                    <span>{isSubscoresOpen ? 'Hide' : 'Inspect'} Sub-Scores</span>
                    {isSubscoresOpen ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleSave(uni)}
                      className={`px-3 py-1.5 border text-xs font-serif flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isSaved
                          ? 'border-[#5A1A24] bg-[#5A1A24] text-[#F5EFE0]'
                          : 'border-[#D5C7AA] bg-[#FBF7EC] text-[#1B2432] hover:bg-[#EAE2D0]'
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5 text-[#F5EFE0]" />
                          <span>Saved to Shortlist</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5 text-[#A98A4F]" />
                          <span>Save</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectUniversity(uni)}
                      className="px-4 py-1.5 bg-[#1F3D2B] hover:bg-[#162C1F] text-[#F5EFE0] font-heading font-semibold text-xs tracking-wider uppercase border border-[#A98A4F] flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>View Details</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#A98A4F]" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
