import React from 'react';

export const SkeletonCard: React.FC<{ rankRoman: string }> = ({ rankRoman }) => {
  return (
    <div className="bg-[#FBF7EC] border border-[#E3D9C6] p-6 shadow-xs animate-pulse">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-[#D5C7AA] bg-[#F5EFE0] flex items-center justify-center font-heading font-bold text-[#A98A4F]">
            {rankRoman}
          </div>
          <div className="space-y-2">
            <div className="h-5 w-48 bg-[#EAE2D0]" />
            <div className="h-3 w-32 bg-[#EAE2D0]" />
          </div>
        </div>
        <div className="h-6 w-20 bg-[#EAE2D0]" />
      </div>

      <div className="space-y-2 mb-4">
        <div className="h-3 w-full bg-[#EAE2D0]" />
        <div className="h-3 w-4/5 bg-[#EAE2D0]" />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[#E3D9C6]">
        <div className="h-4 w-28 bg-[#EAE2D0]" />
        <div className="h-8 w-24 bg-[#EAE2D0]" />
      </div>
    </div>
  );
};
