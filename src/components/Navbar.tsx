import React from 'react';
import { Crest } from './Crest.tsx';
import { Bookmark, Compass, FileText, Sparkles } from 'lucide-react';

export type ActiveTab = 'landing' | 'profile' | 'results' | 'shortlist';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  shortlistCount: number;
  hasRecommendations: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  shortlistCount,
  hasRecommendations,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FBF7EC]/95 backdrop-blur-xs border-b border-[#E3D9C6] shadow-xs">
      {/* Top Hairline Brass Accent */}
      <div className="h-[2px] bg-[#A98A4F]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <button
          onClick={() => onSelectTab('landing')}
          className="flex items-center gap-3 text-left group focus:outline-hidden"
        >
          <Crest size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-xl font-bold tracking-tight text-[#1F3D2B]">
                UniMatch NG
              </span>
              <span className="hidden sm:inline-block text-[10px] tracking-widest uppercase font-serif text-[#A98A4F] border border-[#A98A4F]/40 px-1 py-0.2">
                Prospectus
              </span>
            </div>
            <p className="text-[11px] font-serif tracking-wide text-[#8A8576] hidden md:block">
              Nigeria&apos;s Academic Admissions Advisory
            </p>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('landing')}
            className={`px-3 py-1.5 text-xs font-serif tracking-wider uppercase transition-colors rounded-xs ${
              activeTab === 'landing'
                ? 'text-[#1F3D2B] font-semibold border-b-2 border-[#1F3D2B]'
                : 'text-[#8A8576] hover:text-[#1B2432]'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => onSelectTab('profile')}
            className={`px-3 py-1.5 text-xs font-serif tracking-wider uppercase transition-colors rounded-xs flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'text-[#1F3D2B] font-semibold border-b-2 border-[#1F3D2B]'
                : 'text-[#8A8576] hover:text-[#1B2432]'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#A98A4F]" />
            <span>Enquiry Dossier</span>
          </button>

          {hasRecommendations && (
            <button
              onClick={() => onSelectTab('results')}
              className={`px-3 py-1.5 text-xs font-serif tracking-wider uppercase transition-colors rounded-xs flex items-center gap-1.5 ${
                activeTab === 'results'
                  ? 'text-[#1F3D2B] font-semibold border-b-2 border-[#1F3D2B]'
                  : 'text-[#8A8576] hover:text-[#1B2432]'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#A98A4F]" />
              <span>Recommendations</span>
            </button>
          )}

          <button
            onClick={() => onSelectTab('shortlist')}
            className={`px-3 py-1.5 text-xs font-serif tracking-wider uppercase transition-colors rounded-xs flex items-center gap-1.5 ${
              activeTab === 'shortlist'
                ? 'text-[#1F3D2B] font-semibold border-b-2 border-[#1F3D2B]'
                : 'text-[#8A8576] hover:text-[#1B2432]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-[#A98A4F]" />
            <span>Shortlist</span>
            {shortlistCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 bg-[#5A1A24] text-[#F5EFE0] text-[10px] font-sans font-semibold rounded-xs">
                {shortlistCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
