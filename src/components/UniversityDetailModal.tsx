import React, { useState, useEffect } from 'react';
import { UniversityRecommendation, UniversityDetail } from '../lib/schemas/index.ts';
import { getClientCache, saveClientCache } from '../lib/client-storage.ts';
import { CounsellorChatBox } from './CounsellorChatBox.tsx';
import { Crest } from './Crest.tsx';
import { X, Bookmark, BookmarkCheck, RefreshCw, Archive, CheckCircle, GraduationCap, Building, DollarSign, Home, Compass } from 'lucide-react';

interface UniversityDetailModalProps {
  university: UniversityRecommendation;
  dreamJob: string;
  isSaved: boolean;
  onToggleSave: (uni: UniversityRecommendation) => void;
  onClose: () => void;
  threadId?: string;
  onThreadUpdate?: (newThreadId: string) => void;
}

export const UniversityDetailModal: React.FC<UniversityDetailModalProps> = ({
  university,
  dreamJob,
  isSaved,
  onToggleSave,
  onClose,
  threadId,
  onThreadUpdate,
}) => {
  const [detail, setDetail] = useState<UniversityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFromArchive, setIsFromArchive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async (bypassCache = false) => {
    setLoading(true);
    setError(null);

    // 1. Check client cache first if not bypassing
    if (!bypassCache) {
      const clientCached = getClientCache<UniversityDetail>(`detail_${university.slug}`);
      if (clientCached) {
        setDetail(clientCached.data);
        setIsFromArchive(true);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/university/detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: university.slug,
          name: university.name,
          dreamJob,
          bypassCache,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setDetail(json.data);
        setIsFromArchive(Boolean(json.fromCache));
        saveClientCache(`detail_${university.slug}`, json.data);
        if (json.threadId && onThreadUpdate) {
          onThreadUpdate(json.threadId);
        }
      } else {
        throw new Error(json.error || 'Unable to retrieve university archives.');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [university.slug]);

  return (
    <div className="fixed inset-0 z-50 bg-[#1B2432]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FBF7EC] border border-[#A98A4F] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative my-auto">
        {/* Header Ribbon */}
        <div className="bg-[#1F3D2B] text-[#F5EFE0] px-6 py-4 flex items-center justify-between border-b border-[#A98A4F]">
          <div className="flex items-center gap-3">
            <Crest size="md" className="bg-[#162C1F]" />
            <div>
              <span className="text-[10px] uppercase font-serif tracking-widest text-[#A98A4F]">
                Institutional Archive
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold leading-tight">
                {university.name} ({university.shortName})
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleSave(university)}
              className="px-3 py-1.5 border border-[#A98A4F] text-xs font-serif flex items-center gap-1.5 bg-[#162C1F] hover:bg-[#122319] text-[#F5EFE0]"
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-[#A98A4F]" />
                  <span>Shortlisted</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Save to Shortlist</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-[#F5EFE0]/80 hover:text-[#F5EFE0] hover:bg-[#162C1F] border border-transparent hover:border-[#A98A4F]"
              title="Close Archive"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header Status Bar */}
        <div className="bg-[#F5EFE0] border-b border-[#E3D9C6] px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-serif">
          <div className="flex items-center gap-3 text-[#1B2432]">
            <span><strong>Location:</strong> {university.city}, {university.state} State</span>
            <span>·</span>
            <span><strong>Classification:</strong> {university.type} University</span>
            <span>·</span>
            <span><strong>Target Course:</strong> {university.course}</span>
          </div>

          <div className="flex items-center gap-3">
            {isFromArchive && (
              <span className="flex items-center gap-1 text-[#8A8576]">
                <Archive className="w-3 h-3 text-[#A98A4F]" />
                <span>From archive</span>
              </span>
            )}

            <button
              onClick={() => fetchDetail(true)}
              disabled={loading}
              className="flex items-center gap-1 text-[#1F3D2B] hover:text-[#5A1A24] font-semibold"
              title="Query fresh live web figures"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Records</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center space-y-4 font-serif">
              <div className="w-10 h-10 border-2 border-[#1F3D2B] border-t-[#A98A4F] rounded-full animate-spin mx-auto" />
              <p className="text-sm text-[#1B2432]">
                Consulting academic registries, National Universities Commission records, and recent departmental cut-offs...
              </p>
              <p className="text-xs text-[#8A8576] italic">
                Verifying contemporary tuition schedules and hall accommodations
              </p>
            </div>
          ) : error ? (
            <div className="p-6 bg-[#F5EFE0] border border-[#5A1A24] text-center space-y-3 font-serif">
              <h3 className="font-heading text-lg font-bold text-[#5A1A24]">
                Admissions Record Interruption
              </h3>
              <p className="text-sm text-[#1B2432]">{error}</p>
              <button
                onClick={() => fetchDetail(true)}
                className="px-4 py-2 bg-[#1F3D2B] text-[#F5EFE0] text-xs font-heading font-semibold"
              >
                Re-attempt Archive Query
              </button>
            </div>
          ) : detail ? (
            <>
              {/* Motto & Overview */}
              <div className="bg-[#F5EFE0] border border-[#D5C7AA] p-5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-heading text-lg font-bold text-[#1F3D2B]">
                    Institutional Overview
                  </h3>
                  {detail.motto && (
                    <span className="font-serif italic text-xs text-[#8A8576]">
                      &ldquo;{detail.motto}&rdquo;
                    </span>
                  )}
                </div>
                <p className="font-serif text-sm text-[#1B2432] leading-relaxed">
                  {detail.overview}
                </p>
              </div>

              {/* Vocational Dream Job Fit */}
              <div className="bg-[#1F3D2B]/5 border-l-4 border-[#1F3D2B] p-4 font-serif">
                <h4 className="font-heading text-sm font-bold text-[#1F3D2B] uppercase tracking-wider mb-1">
                  Vocational Alignment: {dreamJob}
                </h4>
                <p className="text-xs text-[#1B2432] leading-relaxed">
                  {detail.dreamJobFitAnalysis}
                </p>
              </div>

              {/* Grid: Requirements & Fees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Admission & Post-UTME */}
                <div className="border border-[#D5C7AA] bg-[#F5EFE0] p-4">
                  <h4 className="font-heading text-base font-bold text-[#1F3D2B] flex items-center gap-2 mb-3">
                    <GraduationCap className="w-4 h-4 text-[#A98A4F]" />
                    <span>Admission & Post-UTME Details</span>
                  </h4>
                  <div className="space-y-3 text-xs font-serif">
                    <div>
                      <strong className="block text-[#1B2432] mb-0.5">Post-UTME Screening:</strong>
                      <p className="text-[#1B2432]/90">{detail.admissionRequirements.postUtmeDetails}</p>
                    </div>
                    <div>
                      <strong className="block text-[#1B2432] mb-0.5">Required JAMB Combination:</strong>
                      <p className="text-[#1B2432]/90">
                        {detail.admissionRequirements.jambSubjectCombination.join(', ')}
                      </p>
                    </div>
                    <div>
                      <strong className="block text-[#1B2432] mb-0.5">O&apos;Level Subject Benchmark:</strong>
                      <p className="text-[#1B2432]/90">
                        {detail.admissionRequirements.olevelSubjectCombination.join(', ')}
                      </p>
                    </div>
                    <div>
                      <strong className="block text-[#1B2432] mb-0.5">Institutional Benchmark:</strong>
                      <p className="text-[#8A8576] italic">{detail.admissionRequirements.minimumCutoffNote}</p>
                    </div>
                  </div>
                </div>

                {/* Estimated Fees Breakdown in Naira */}
                <div className="border border-[#D5C7AA] bg-[#F5EFE0] p-4">
                  <h4 className="font-heading text-base font-bold text-[#1F3D2B] flex items-center gap-2 mb-3">
                    <DollarSign className="w-4 h-4 text-[#A98A4F]" />
                    <span>Fees Breakdown (Naira)</span>
                  </h4>
                  <div className="space-y-2 text-xs font-serif">
                    <div className="flex justify-between py-1 border-b border-[#E3D9C6]">
                      <span className="text-[#8A8576]">One-Off Acceptance Fee:</span>
                      <span className="font-semibold text-[#1B2432]">{detail.feesBreakdown.acceptanceFee}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E3D9C6]">
                      <span className="text-[#8A8576]">Tuition (Session):</span>
                      <span className="font-semibold text-[#1B2432]">{detail.feesBreakdown.tuitionSession}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E3D9C6]">
                      <span className="text-[#8A8576]">Faculty & Dept Dues:</span>
                      <span className="font-semibold text-[#1B2432]">{detail.feesBreakdown.facultyDues}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E3D9C6]">
                      <span className="text-[#8A8576]">Estimated Accommodation:</span>
                      <span className="font-semibold text-[#1B2432]">{detail.feesBreakdown.accommodationEstimated}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-sm font-heading font-bold text-[#1F3D2B]">
                      <span>Estimated Year One Total:</span>
                      <span>{detail.feesBreakdown.totalEstimatedYearOne}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hostels & Campus Life */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-[#D5C7AA] bg-[#F5EFE0] p-4">
                  <h4 className="font-heading text-base font-bold text-[#1F3D2B] flex items-center gap-2 mb-2">
                    <Home className="w-4 h-4 text-[#A98A4F]" />
                    <span>Hostels & Accommodation</span>
                  </h4>
                  <p className="text-xs font-serif text-[#1B2432] mb-2">
                    <strong>On-Campus:</strong> {detail.hostelsAndAccommodation.onCampusAvailability}
                  </p>
                  <p className="text-xs font-serif text-[#1B2432] mb-2">
                    <strong>Off-Campus Rent:</strong> {detail.hostelsAndAccommodation.offCampusAverageRent}
                  </p>
                  <p className="text-xs font-serif text-[#8A8576] italic">
                    {detail.hostelsAndAccommodation.qualityDescription}
                  </p>
                </div>

                <div className="border border-[#D5C7AA] bg-[#F5EFE0] p-4">
                  <h4 className="font-heading text-base font-bold text-[#1F3D2B] flex items-center gap-2 mb-2">
                    <Compass className="w-4 h-4 text-[#A98A4F]" />
                    <span>Campus Life & Traditions</span>
                  </h4>
                  <p className="text-xs font-serif text-[#1B2432] mb-2">
                    <strong>Traditions:</strong> {detail.campusLife.traditions}
                  </p>
                  <p className="text-xs font-serif text-[#1B2432] mb-2">
                    <strong>Environment & Safety:</strong> {detail.campusLife.securityAndEnvironment}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {detail.campusLife.associationsAndClubs.map((club, i) => (
                      <span key={i} className="text-[11px] font-serif bg-[#FBF7EC] border border-[#D5C7AA] px-2 py-0.5 text-[#1B2432]">
                        {club}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notable Faculties & Scholarships */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-[#D5C7AA] bg-[#F5EFE0] p-4">
                  <h4 className="font-heading text-base font-bold text-[#1F3D2B] mb-2">
                    Notable Faculties
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs font-serif text-[#1B2432]">
                    {detail.notableFaculties.map((fac, i) => (
                      <li key={i}>{fac}</li>
                    ))}
                  </ul>
                </div>

                <div className="border border-[#D5C7AA] bg-[#F5EFE0] p-4">
                  <h4 className="font-heading text-base font-bold text-[#1F3D2B] mb-2">
                    Scholarships & Financial Aid
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs font-serif text-[#1B2432]">
                    {detail.scholarshipsAndAid.map((sch, i) => (
                      <li key={i}>{sch}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* How to Apply */}
              <div className="border border-[#D5C7AA] bg-[#F5EFE0] p-5">
                <h4 className="font-heading text-base font-bold text-[#1F3D2B] mb-3">
                  Matriculation & Application Protocol
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-xs font-serif text-[#1B2432]">
                  {detail.howToApply.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Integrated Counsellor Chat Box */}
              <div className="pt-4 border-t border-[#D5C7AA]">
                <CounsellorChatBox
                  universityName={university.name}
                  universitySlug={university.slug}
                  threadId={threadId}
                  onThreadUpdate={onThreadUpdate}
                />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
