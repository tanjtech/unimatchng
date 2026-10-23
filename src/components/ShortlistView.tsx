import React, { useState, useEffect } from 'react';
import { UniversityRecommendation, StudentProfile } from '../lib/schemas/index.ts';
import { toRomanNumeral } from '../lib/scoring/index.ts';
import { saveClientCache, getClientCache } from '../lib/client-storage.ts';
import { Crest } from './Crest.tsx';
import {
  Trash2,
  Printer,
  Download,
  ExternalLink,
  Edit3,
  Check,
  Columns,
  BookmarkX,
  FileSpreadsheet,
} from 'lucide-react';

interface ShortlistViewProps {
  shortlist: UniversityRecommendation[];
  profile: StudentProfile | null;
  onRemove: (slug: string) => void;
  onViewDetails: (uni: UniversityRecommendation) => void;
}

export const ShortlistView: React.FC<ShortlistViewProps> = ({
  shortlist,
  profile,
  onRemove,
  onViewDetails,
}) => {
  // Personal notes per university
  const [notes, setNotes] = useState<Record<string, string>>(() => {
    const cached = getClientCache<Record<string, string>>('shortlist_notes');
    return cached?.data || {};
  });

  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState('');

  // Selected for comparison (up to 3)
  const [selectedSlugsForComparison, setSelectedSlugsForComparison] = useState<string[]>(() => {
    return shortlist.slice(0, 3).map((u) => u.slug);
  });

  // Save notes whenever changed
  useEffect(() => {
    saveClientCache('shortlist_notes', notes);
  }, [notes]);

  // Keep comparison in sync if items removed
  useEffect(() => {
    setSelectedSlugsForComparison((prev) =>
      prev.filter((slug) => shortlist.some((u) => u.slug === slug))
    );
  }, [shortlist]);

  const handleToggleCompare = (slug: string) => {
    if (selectedSlugsForComparison.includes(slug)) {
      setSelectedSlugsForComparison((prev) => prev.filter((s) => s !== slug));
    } else {
      if (selectedSlugsForComparison.length >= 3) {
        // Replace oldest or cap at 3
        setSelectedSlugsForComparison((prev) => [...prev.slice(1), slug]);
      } else {
        setSelectedSlugsForComparison((prev) => [...prev, slug]);
      }
    }
  };

  const startEditNote = (slug: string) => {
    setEditingSlug(slug);
    setDraftNote(notes[slug] || '');
  };

  const saveNote = (slug: string) => {
    setNotes((prev) => ({
      ...prev,
      [slug]: draftNote.trim(),
    }));
    setEditingSlug(null);
  };

  const comparedUniversities = shortlist.filter((u) =>
    selectedSlugsForComparison.includes(u.slug)
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const exportDossier = {
      app: 'UniMatch NG',
      exportDate: new Date().toISOString(),
      studentProfile: profile,
      shortlistedInstitutions: shortlist.map((u) => ({
        rank: u.rank,
        name: u.name,
        shortName: u.shortName,
        type: u.type,
        location: `${u.city}, ${u.state} State`,
        course: u.course,
        approxCutoff: u.approxCutoff,
        admissionChance: u.admissionChance,
        feesRangeNGN: u.feesRangeNGN,
        finalScore: u.finalScore,
        subScores: u.subScores,
        whyItFits: u.whyItFits,
        pros: u.pros,
        cons: u.cons,
        personalNote: notes[u.slug] || '',
      })),
    };

    const blob = new Blob([JSON.stringify(exportDossier, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UniMatch_Shortlist_${profile?.fullName ? profile.fullName.replace(/\s+/g, '_') : 'Scholar'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (shortlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-serif">
        <div className="w-16 h-16 border border-[#A98A4F] bg-[#FBF7EC] rounded-full flex items-center justify-center mx-auto mb-4">
          <BookmarkX className="w-8 h-8 text-[#A98A4F]" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-[#1F3D2B] mb-2">
          Your Shortlist Ledger is Vacant
        </h2>
        <p className="text-sm text-[#8A8576] max-w-md mx-auto mb-6">
          You have not yet marked any institutions for archival. Explore your recommendations and click &ldquo;Save&rdquo; on any institution to begin comparison.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header & Export Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#D5C7AA] mb-8">
        <div>
          <span className="text-xs font-serif tracking-widest uppercase text-[#A98A4F]">
            Archived Ledger
          </span>
          <h2 className="font-heading text-3xl font-bold text-[#1F3D2B] mt-0.5">
            Your University Shortlist ({shortlist.length})
          </h2>
          <p className="font-serif text-xs text-[#8A8576] mt-1">
            Compare institutions side by side, append personal notes, and export your official admissions ledger.
          </p>
        </div>

        {/* Export Actions (Hidden in Print) */}
        <div className="flex items-center gap-2 no-print self-end sm:self-auto">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 bg-[#FBF7EC] hover:bg-[#F5EFE0] border border-[#D5C7AA] text-xs font-serif text-[#1F3D2B] font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Download JSON dossier"
          >
            <Download className="w-3.5 h-3.5 text-[#A98A4F]" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-[#1F3D2B] hover:bg-[#162C1F] text-[#F5EFE0] border border-[#A98A4F] text-xs font-heading font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-xs"
            title="Export as official PDF via browser print stylesheet"
          >
            <Printer className="w-3.5 h-3.5 text-[#A98A4F]" />
            <span>Export as PDF</span>
          </button>
        </div>
      </div>

      {/* Print-Only Header */}
      <div className="hidden print:block pb-6 mb-6 border-b-2 border-black">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">UniMatch NG — Official Shortlist Ledger</h1>
            <p className="text-xs">Candidate: {profile?.fullName || 'Candidate Scholar'} · Exported {new Date().toLocaleDateString()}</p>
          </div>
          <div className="text-right text-xs">
            <p>Target Track: {profile?.classBackground}</p>
            <p>JAMB UTME: {profile?.jambScore ?? 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Comparative Ledger Table (Up to 3 Institutions) */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-xl font-bold text-[#1F3D2B] flex items-center gap-2">
            <Columns className="w-4 h-4 text-[#A98A4F]" />
            <span>Comparative Ledger (Select up to 3)</span>
          </h3>
          <span className="text-xs font-serif text-[#8A8576]">
            {comparedUniversities.length} of 3 selected for comparative analysis
          </span>
        </div>

        {/* Selection Checkbox Pills */}
        <div className="flex flex-wrap gap-2 mb-4 no-print">
          {shortlist.map((u) => {
            const isChecked = selectedSlugsForComparison.includes(u.slug);
            return (
              <button
                key={u.slug}
                type="button"
                onClick={() => handleToggleCompare(u.slug)}
                className={`px-3 py-1 text-xs font-serif border flex items-center gap-1.5 cursor-pointer ${
                  isChecked
                    ? 'border-[#1F3D2B] bg-[#1F3D2B] text-[#F5EFE0]'
                    : 'border-[#D5C7AA] bg-[#FBF7EC] text-[#1B2432]'
                }`}
              >
                <span>{isChecked ? '✓' : '+'}</span>
                <span>{u.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Comparative Ledger Table */}
        {comparedUniversities.length > 0 ? (
          <div className="overflow-x-auto border border-[#D5C7AA] bg-[#FBF7EC]">
            <table className="w-full text-left border-collapse text-xs font-serif">
              <thead>
                <tr className="bg-[#1F3D2B] text-[#F5EFE0] border-b border-[#A98A4F]">
                  <th className="p-3 w-36 font-heading font-semibold uppercase tracking-wider text-[11px]">
                    Attribute
                  </th>
                  {comparedUniversities.map((uni) => (
                    <th key={uni.slug} className="p-3 border-l border-[#A98A4F]/40 font-heading">
                      <div className="text-sm font-bold text-[#F5EFE0]">{uni.name}</div>
                      <span className="text-[10px] text-[#A98A4F] uppercase tracking-widest font-serif">
                        Rank {toRomanNumeral(uni.rank)} · {uni.shortName}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3D9C6]">
                <tr>
                  <td className="p-3 font-semibold bg-[#F5EFE0]/60 text-[#1B2432]">Classification</td>
                  {comparedUniversities.map((uni) => (
                    <td key={uni.slug} className="p-3 border-l border-[#E3D9C6]">
                      {uni.type} University
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold bg-[#F5EFE0]/60 text-[#1B2432]">Geographic Location</td>
                  {comparedUniversities.map((uni) => (
                    <td key={uni.slug} className="p-3 border-l border-[#E3D9C6]">
                      {uni.city}, {uni.state} State
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold bg-[#F5EFE0]/60 text-[#1B2432]">Weighted Score</td>
                  {comparedUniversities.map((uni) => (
                    <td key={uni.slug} className="p-3 border-l border-[#E3D9C6] font-heading font-bold text-sm text-[#1F3D2B]">
                      {uni.finalScore} / 100
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold bg-[#F5EFE0]/60 text-[#1B2432]">Admission Chance</td>
                  {comparedUniversities.map((uni) => (
                    <td key={uni.slug} className="p-3 border-l border-[#E3D9C6]">
                      <span className="font-semibold">{uni.admissionChance} Fit</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold bg-[#F5EFE0]/60 text-[#1B2432]">Estimated Cut-off</td>
                  {comparedUniversities.map((uni) => (
                    <td key={uni.slug} className="p-3 border-l border-[#E3D9C6]">
                      {uni.approxCutoff}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold bg-[#F5EFE0]/60 text-[#1B2432]">Tuition / Session</td>
                  {comparedUniversities.map((uni) => (
                    <td key={uni.slug} className="p-3 border-l border-[#E3D9C6]">
                      {uni.feesRangeNGN}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold bg-[#F5EFE0]/60 text-[#1B2432]">Distinctive Pros</td>
                  {comparedUniversities.map((uni) => (
                    <td key={uni.slug} className="p-3 border-l border-[#E3D9C6]">
                      <ul className="list-disc list-inside space-y-0.5">
                        {uni.pros.slice(0, 2).map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold bg-[#F5EFE0]/60 text-[#1B2432]">Considerations</td>
                  {comparedUniversities.map((uni) => (
                    <td key={uni.slug} className="p-3 border-l border-[#E3D9C6]">
                      <ul className="list-disc list-inside space-y-0.5 text-[#5A1A24]">
                        {uni.cons.slice(0, 2).map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs font-serif text-[#8A8576] italic">
            Check one or more institutions above to populate the ledger comparison.
          </p>
        )}
      </div>

      {/* Shortlist Cards with Notes */}
      <div className="space-y-6">
        <h3 className="font-heading text-xl font-bold text-[#1F3D2B]">
          Archived Institutions & Candidate Notes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shortlist.map((uni) => {
            const hasNote = Boolean(notes[uni.slug]);
            const isEditing = editingSlug === uni.slug;

            return (
              <div
                key={uni.slug}
                className="bg-[#FBF7EC] border border-[#D5C7AA] p-5 flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 border border-[#A98A4F] bg-[#1F3D2B] text-[#F5EFE0] font-heading font-bold text-xs flex items-center justify-center shrink-0">
                        {toRomanNumeral(uni.rank)}
                      </div>
                      <div>
                        <h4 className="font-heading text-lg font-bold text-[#1F3D2B]">
                          {uni.name}
                        </h4>
                        <span className="text-xs font-serif text-[#8A8576]">
                          {uni.city}, {uni.state} · {uni.type}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemove(uni.slug)}
                      className="text-[#8A8576] hover:text-[#5A1A24] p-1 no-print"
                      title="Remove from shortlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="my-3 text-xs font-serif bg-[#F5EFE0] p-2.5 border border-[#E3D9C6] flex justify-between">
                    <span>Target: <strong>{uni.course}</strong></span>
                    <span>Score: <strong>{uni.finalScore}/100</strong></span>
                    <span>Likelihood: <strong>{uni.admissionChance}</strong></span>
                  </div>

                  {/* Personal Note Section */}
                  <div className="mt-3 pt-3 border-t border-[#E3D9C6]">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-serif uppercase tracking-wider font-semibold text-[#8A8576]">
                        Personal Candidate Note:
                      </span>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => startEditNote(uni.slug)}
                          className="text-[11px] font-serif text-[#1F3D2B] hover:underline flex items-center gap-1 no-print"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>{hasNote ? 'Edit note' : 'Append note'}</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 no-print">
                        <textarea
                          value={draftNote}
                          onChange={(e) => setDraftNote(e.target.value)}
                          placeholder="e.g. Discuss post-UTME screening date with uncle in Ibadan; verify faculty accreditation..."
                          rows={3}
                          className="w-full bg-[#F5EFE0] border border-[#D5C7AA] p-2 text-xs font-serif text-[#1B2432] focus:outline-hidden"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingSlug(null)}
                            className="px-2 py-1 text-xs font-serif text-[#8A8576]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveNote(uni.slug)}
                            className="px-3 py-1 bg-[#1F3D2B] text-[#F5EFE0] text-xs font-serif flex items-center gap-1"
                          >
                            <Check className="w-3 h-3 text-[#A98A4F]" />
                            <span>Save Note</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs font-serif italic text-[#1B2432]/90 min-h-6">
                        {notes[uni.slug] || '(No personal note recorded yet)'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E3D9C6] flex justify-end no-print">
                  <button
                    type="button"
                    onClick={() => onViewDetails(uni)}
                    className="text-xs font-heading font-semibold text-[#1F3D2B] hover:text-[#5A1A24] flex items-center gap-1"
                  >
                    <span>Inspect Full Archive</span>
                    <ExternalLink className="w-3 h-3 text-[#A98A4F]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
