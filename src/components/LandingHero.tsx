import React from 'react';
import { ArrowRight, BookOpen, Compass, Award, Building2 } from 'lucide-react';
import { Crest } from './Crest.tsx';

interface LandingHeroProps {
  onBeginEnquiry: () => void;
  onExploreCatalog?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onBeginEnquiry }) => {
  return (
    <div className="py-12 sm:py-16 md:py-20">
      {/* Hero Header */}
      <div className="max-w-4xl mx-auto text-center px-4">
        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 border border-[#A98A4F]/40 bg-[#FBF7EC] text-xs font-serif tracking-widest uppercase text-[#5A1A24]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5A1A24]" />
          <span>The Undergraduate Admissions Prospectus</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold text-[#1F3D2B] leading-tight mb-6">
          Find your place among <br className="hidden sm:block" />
          Nigeria&apos;s finest institutions.
        </h1>

        <div className="w-24 h-0.5 bg-[#A98A4F] mx-auto mb-6" />

        <p className="font-serif text-lg sm:text-xl text-[#1B2432]/90 max-w-2xl mx-auto leading-relaxed mb-10">
          Whether you seek the venerable quadrangles of Ibadan, the architectural majesty of Ife, the rigorous halls of Zaria, or the focused scholarship of premier private foundations, UniMatch NG aligns your UTME scores, O&apos;level credits, and career ambitions with institutional excellence.
        </p>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button
            onClick={onBeginEnquiry}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#1F3D2B] hover:bg-[#162C1F] text-[#F5EFE0] font-heading font-semibold text-base sm:text-lg tracking-wide border border-[#A98A4F] shadow-sm transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            <span>Begin your enquiry</span>
            <ArrowRight className="w-4 h-4 text-[#A98A4F] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Decorative Divider */}
      <div className="max-w-4xl mx-auto px-4 mb-16">
        <div className="double-rule" />
      </div>

      {/* Methodological Process (Steps I - IV) */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl font-bold text-[#1F3D2B] tracking-tight">
            How The Appraisal Functions
          </h2>
          <p className="font-serif text-sm text-[#8A8576] mt-1">
            A methodical four-stage evaluation grounded in empirical Nigerian admissions criteria
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[#FBF7EC] border border-[#E3D9C6] p-6 text-left relative">
            <span className="font-heading text-2xl font-bold text-[#A98A4F] block mb-2">
              I.
            </span>
            <h3 className="font-heading text-lg font-bold text-[#1F3D2B] mb-2">
              Your Dossier
            </h3>
            <p className="font-serif text-sm text-[#1B2432]/80 leading-relaxed">
              Record your UTME performance, WAEC/NECO grades, academic track (Science, Arts, Commercial, Social Science), and career vocation.
            </p>
          </div>

          <div className="bg-[#FBF7EC] border border-[#E3D9C6] p-6 text-left relative">
            <span className="font-heading text-2xl font-bold text-[#A98A4F] block mb-2">
              II.
            </span>
            <h3 className="font-heading text-lg font-bold text-[#1F3D2B] mb-2">
              Weighted Analysis
            </h3>
            <p className="font-serif text-sm text-[#1B2432]/80 leading-relaxed">
              Our advisory engine calculates cut-off alignments, department accreditation, fee sustainability, and campus security.
            </p>
          </div>

          <div className="bg-[#FBF7EC] border border-[#E3D9C6] p-6 text-left relative">
            <span className="font-heading text-2xl font-bold text-[#A98A4F] block mb-2">
              III.
            </span>
            <h3 className="font-heading text-lg font-bold text-[#1F3D2B] mb-2">
              Ten Esteemed Ranks
            </h3>
            <p className="font-serif text-sm text-[#1B2432]/80 leading-relaxed">
              Receive ten ranked Nigerian universities with Reach, Match, and Safe classifications, financial estimates, and pros/cons.
            </p>
          </div>

          <div className="bg-[#FBF7EC] border border-[#E3D9C6] p-6 text-left relative">
            <span className="font-heading text-2xl font-bold text-[#A98A4F] block mb-2">
              IV.
            </span>
            <h3 className="font-heading text-lg font-bold text-[#1F3D2B] mb-2">
              Shortlist & Ledger
            </h3>
            <p className="font-serif text-sm text-[#1B2432]/80 leading-relaxed">
              Compare your top choices side by side, record personal notes, consult the counsellor via chat, and export as PDF or JSON.
            </p>
          </div>
        </div>
      </div>

      {/* Institutional Standards Banner */}
      <div className="max-w-4xl mx-auto px-4 mt-16">
        <div className="bg-[#1F3D2B] text-[#F5EFE0] p-8 border border-[#A98A4F] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Crest size="lg" className="shrink-0 bg-[#162C1F]" />
            <div>
              <h3 className="font-heading text-xl font-bold text-[#F5EFE0]">
                Rigorous Evaluation Standards
              </h3>
              <p className="font-serif text-sm text-[#D5C7AA] mt-0.5">
                Calculated across cut-off fit (30%), faculty strength (25%), fees (15%), ambiance (10%), reputation (10%), and hostels (10%).
              </p>
            </div>
          </div>
          <button
            onClick={onBeginEnquiry}
            className="shrink-0 px-6 py-2.5 bg-[#A98A4F] hover:bg-[#8F743F] text-[#1B2432] font-heading font-semibold text-sm tracking-wider uppercase transition-colors cursor-pointer"
          >
            Enter Enquiry
          </button>
        </div>
      </div>
    </div>
  );
};
