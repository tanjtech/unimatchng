import React from 'react';
import { Crest } from './Crest.tsx';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-[#D5C7AA] bg-[#FBF7EC] text-[#1B2432] pt-12 pb-10 no-print">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#E3D9C6]">
          <div className="flex items-center gap-4">
            <Crest size="lg" />
            <div>
              <h3 className="font-heading text-xl font-bold text-[#1F3D2B]">
                UniMatch NG
              </h3>
              <p className="font-serif italic text-sm text-[#8A8576]">
                &ldquo;Find your place among Nigeria&apos;s finest institutions&rdquo;
              </p>
            </div>
          </div>

          <div className="text-xs font-serif text-[#8A8576] md:text-right max-w-md">
            <p className="font-semibold text-[#1B2432] uppercase tracking-wider mb-1">
              Admissions Integrity & Verification Notice
            </p>
            <p>
              Admissions criteria, UTME cut-offs, and tuition schedules are subject to Senate approvals and National Universities Commission (NUC) circulars. Always confirm formal placements on the JAMB CAPS portal.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-serif text-[#8A8576] gap-4">
          <p>© {new Date().getFullYear()} UniMatch NG. Dedicated to Nigerian undergraduate scholarship.</p>
          <div className="flex items-center gap-6">
            <span>Federal, State & Premier Private Institutions</span>
            <span>·</span>
            <span>Advisory Version 1.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
