import React from 'react';

interface CrestProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Crest: React.FC<CrestProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base',
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full border border-[#A98A4F] bg-[#1F3D2B] text-[#F5EFE0] font-crest tracking-widest shadow-xs select-none ${sizeClasses[size]} ${className}`}
      title="UniMatch NG Monogram"
      aria-label="UniMatch Monogram"
    >
      <span className="font-semibold text-[#A98A4F]">UM</span>
    </div>
  );
};
