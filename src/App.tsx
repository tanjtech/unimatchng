import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTab } from './components/Navbar.tsx';
import { Footer } from './components/Footer.tsx';
import { LandingHero } from './components/LandingHero.tsx';
import { ProfileForm } from './components/ProfileForm.tsx';
import { RecommendationsView } from './components/RecommendationsView.tsx';
import { ShortlistView } from './components/ShortlistView.tsx';
import { UniversityDetailModal } from './components/UniversityDetailModal.tsx';
import { SkeletonCard } from './components/SkeletonCard.tsx';
import {
  StudentProfile,
  RecommendationResponse,
  UniversityRecommendation,
} from './lib/schemas/index.ts';
import {
  saveClientCache,
  getClientCache,
} from './lib/client-storage.ts';
import { getClientFallbackRecommendations } from './lib/client-fallback.ts';
import { AlertTriangle, RefreshCw, Compass } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');
  const [profile, setProfile] = useState<StudentProfile | null>(() => {
    return getClientCache<StudentProfile>('active_profile')?.data || null;
  });

  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(() => {
    return getClientCache<RecommendationResponse>('last_recommendations')?.data || null;
  });

  const [shortlist, setShortlist] = useState<UniversityRecommendation[]>(() => {
    return getClientCache<UniversityRecommendation[]>('shortlist')?.data || [];
  });

  const [isFromArchive, setIsFromArchive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedUniversity, setSelectedUniversity] = useState<UniversityRecommendation | null>(null);
  const [threadId, setThreadId] = useState<string | undefined>(() => {
    return getClientCache<string>('counsellor_thread_id')?.data;
  });

  // Keep shortlist persisted to client cache
  useEffect(() => {
    saveClientCache('shortlist', shortlist);
  }, [shortlist]);

  // Keep threadId persisted
  useEffect(() => {
    if (threadId) {
      saveClientCache('counsellor_thread_id', threadId);
    }
  }, [threadId]);

  const handleBeginEnquiry = () => {
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSave = (uni: UniversityRecommendation) => {
    setShortlist((prev) => {
      const exists = prev.some((u) => u.slug === uni.slug);
      if (exists) {
        return prev.filter((u) => u.slug !== uni.slug);
      }
      return [...prev, uni];
    });
  };

  const handleSubmitProfile = async (submittedProfile: StudentProfile, bypassCache = false) => {
    setIsLoading(true);
    setError(null);
    setProfile(submittedProfile);
    saveClientCache('active_profile', submittedProfile);
    setActiveTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: submittedProfile,
          bypassCache,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!res.ok || !contentType.includes('application/json')) {
        console.warn(`Server responded with status ${res.status}. Utilizing advisory fallback.`);
        const fallbackData = getClientFallbackRecommendations(submittedProfile);
        setRecommendations(fallbackData);
        setIsFromArchive(false);
        saveClientCache('last_recommendations', fallbackData);
        return;
      }

      const json = await res.json();
      if (json.success && json.data) {
        setRecommendations(json.data);
        setIsFromArchive(Boolean(json.fromCache));
        saveClientCache('last_recommendations', json.data);
      } else {
        const fallbackData = getClientFallbackRecommendations(submittedProfile);
        setRecommendations(fallbackData);
        saveClientCache('last_recommendations', fallbackData);
      }
    } catch (err) {
      console.warn('Network or parsing error, deploying client fallback:', err);
      const fallbackData = getClientFallbackRecommendations(submittedProfile);
      setRecommendations(fallbackData);
      saveClientCache('last_recommendations', fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshRecommendations = () => {
    if (profile) {
      handleSubmitProfile(profile, true);
    }
  };

  const handleSelectSuggestedCourse = (course: string) => {
    if (!profile) return;
    const updatedProfile: StudentProfile = {
      ...profile,
      aspiringCourse: course,
      courseIsNA: false,
    };
    handleSubmitProfile(updatedProfile, true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5EFE0] text-[#1B2432]">
      {/* Heritage Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        shortlistCount={shortlist.length}
        hasRecommendations={Boolean(recommendations)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Error Notification Banner */}
        {error && (
          <div className="max-w-4xl mx-auto px-4 mt-6">
            <div className="bg-[#FBF7EC] border border-[#5A1A24] p-4 flex items-start justify-between gap-3 font-serif text-xs text-[#5A1A24] shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#5A1A24] shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-heading text-sm text-[#5A1A24]">
                    Advisory Council Dispatch Interruption
                  </strong>
                  <p>{error}</p>
                </div>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-[#8A8576] hover:text-[#5A1A24] text-xs font-semibold px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Landing Page */}
        {activeTab === 'landing' && (
          <LandingHero onBeginEnquiry={handleBeginEnquiry} />
        )}

        {/* Tab 2: Profile Enquiry Form */}
        {activeTab === 'profile' && (
          <ProfileForm
            onSubmitProfile={handleSubmitProfile}
            isLoading={isLoading}
          />
        )}

        {/* Tab 3: Recommendations View */}
        {activeTab === 'results' && (
          <>
            {isLoading ? (
              <div className="max-w-5xl mx-auto px-4 py-12">
                <div className="text-center mb-8 font-serif">
                  <div className="w-12 h-12 border-2 border-[#1F3D2B] border-t-[#A98A4F] rounded-full animate-spin mx-auto mb-4" />
                  <h3 className="font-heading text-2xl font-bold text-[#1F3D2B]">
                    Deliberating Institutional Placements
                  </h3>
                  <p className="text-xs text-[#8A8576] mt-1 max-w-md mx-auto">
                    Evaluating cut-off benchmarks, departmental accreditation, tuition schedules, and campus life across Nigerian tertiary institutions...
                  </p>
                </div>

                <div className="space-y-6">
                  {['I', 'II', 'III', 'IV'].map((roman) => (
                    <SkeletonCard key={roman} rankRoman={roman} />
                  ))}
                </div>
              </div>
            ) : recommendations ? (
              <RecommendationsView
                data={recommendations}
                isFromArchive={isFromArchive}
                onRefresh={handleRefreshRecommendations}
                isLoading={isLoading}
                onSelectUniversity={(uni) => setSelectedUniversity(uni)}
                savedList={shortlist}
                onToggleSave={handleToggleSave}
                onSelectSuggestedCourse={handleSelectSuggestedCourse}
              />
            ) : (
              <div className="max-w-md mx-auto px-4 py-16 text-center font-serif">
                <Compass className="w-12 h-12 text-[#A98A4F] mx-auto mb-3" />
                <h3 className="font-heading text-xl font-bold text-[#1F3D2B] mb-2">
                  No Active Appraisal Record
                </h3>
                <p className="text-xs text-[#8A8576] mb-4">
                  Please submit your candidate particulars to generate your personalized ranking of Nigerian universities.
                </p>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="px-6 py-2.5 bg-[#1F3D2B] text-[#F5EFE0] font-heading font-semibold text-xs tracking-wider uppercase border border-[#A98A4F]"
                >
                  Enter Dossier
                </button>
              </div>
            )}
          </>
        )}

        {/* Tab 4: Shortlist & Ledger */}
        {activeTab === 'shortlist' && (
          <ShortlistView
            shortlist={shortlist}
            profile={profile}
            onRemove={(slug) =>
              setShortlist((prev) => prev.filter((u) => u.slug !== slug))
            }
            onViewDetails={(uni) => setSelectedUniversity(uni)}
          />
        )}
      </main>

      {/* University Detail Modal */}
      {selectedUniversity && (
        <UniversityDetailModal
          university={selectedUniversity}
          dreamJob={profile?.dreamJob || 'Undergraduate Scholar'}
          isSaved={shortlist.some((u) => u.slug === selectedUniversity.slug)}
          onToggleSave={handleToggleSave}
          onClose={() => setSelectedUniversity(null)}
          threadId={threadId}
          onThreadUpdate={(newId) => setThreadId(newId)}
        />
      )}

      {/* Heritage Footer */}
      <Footer />
    </div>
  );
}
