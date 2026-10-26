import {
  StudentProfile,
  RecommendationResponse,
  UniversityDetail,
} from './schemas/index.ts';
import { calculateWeightedScore } from './scoring/index.ts';

export function getClientFallbackRecommendations(profile: StudentProfile): RecommendationResponse {
  const targetCourse = profile.courseIsNA || !profile.aspiringCourse
    ? (profile.classBackground === 'Science' ? 'Computer Science & Systems' : profile.classBackground === 'Arts' ? 'Law & International Diplomacy' : 'Accounting & Financial Economics')
    : profile.aspiringCourse;

  const suggestedCourses = profile.courseIsNA || !profile.aspiringCourse
    ? (profile.classBackground === 'Science'
        ? ['Computer Science', 'Software Engineering', 'Biomedical Engineering']
        : profile.classBackground === 'Arts'
        ? ['Constitutional Law', 'International Relations', 'English & Literary Studies']
        : ['Accounting & Finance', 'Business Administration', 'Economics'])
    : [];

  const rawUnis = [
    {
      rank: 1,
      name: 'University of Ibadan',
      shortName: 'UI',
      slug: 'university-of-ibadan',
      type: 'Federal' as const,
      state: 'Oyo',
      city: 'Ibadan',
      course: targetCourse,
      approxCutoff: '265-285 UTME',
      admissionChance: 'Match' as const,
      feesRangeNGN: '₦95,000 - ₦145,000 per session',
      ambianceSummary: 'Stately colonial courtyards, historic botanical gardens, and the contemplative scholarly quiet of Nigeria\'s premier foundation.',
      reviewSummary: 'Revered nationwide for rigorous academic standards, peerless research credentials, and an illustrious alumni diaspora.',
      pros: ['First and premier university in Nigeria', 'Subsidized federal tuition', 'Kenneth Dike Library archives'],
      cons: ['Highly competitive departmental cut-off', 'Ageing residential halls'],
      subScores: {
        cutoffFit: 88,
        courseStrength: 95,
        tuitionAffordability: 90,
        campusAmbiance: 84,
        reviewsReputation: 96,
        locationAccommodation: 78,
      },
      whyItFits: `Provides unmatched academic pedigree and foundational rigor for achieving excellence as a ${profile.dreamJob || 'scholar'}.`,
    },
    {
      rank: 2,
      name: 'University of Lagos',
      shortName: 'UNILAG',
      slug: 'university-of-lagos',
      type: 'Federal' as const,
      state: 'Lagos',
      city: 'Akoka, Lagos',
      course: targetCourse,
      approxCutoff: '270-290 UTME',
      admissionChance: 'Match' as const,
      feesRangeNGN: '₦110,000 - ₦175,000 per session',
      ambianceSummary: 'Scenic lagoon waterfront views, energetic cosmopolitan atmosphere, and proximity to Nigeria\'s commercial epicentre.',
      reviewSummary: 'Consistently ranks among top employers\' choices with outstanding student societies and high graduate employability.',
      pros: ['Immediate access to Lagos corporate networks & internships', 'Vibrant campus culture', 'Strong alumni leadership'],
      cons: ['Intense accommodation balloting', 'Lagos urban cost of living'],
      subScores: {
        cutoffFit: 85,
        courseStrength: 93,
        tuitionAffordability: 88,
        campusAmbiance: 82,
        reviewsReputation: 95,
        locationAccommodation: 80,
      },
      whyItFits: 'Proximity to industry leaders and corporate headquarters allows immediate career integration upon graduation.',
    },
    {
      rank: 3,
      name: 'Covenant University',
      shortName: 'CU',
      slug: 'covenant-university',
      type: 'Private' as const,
      state: 'Ogun',
      city: 'Ota',
      course: targetCourse,
      approxCutoff: '220-250 UTME',
      admissionChance: 'Safe' as const,
      feesRangeNGN: '₦1,850,000 - ₦2,400,000 per session',
      ambianceSummary: 'Immaculately manicured quadrangles, quiet residential serenity, modern architectural infrastructure, and 24/7 power provision.',
      reviewSummary: 'Ranked among Africa\'s top research universities by Times Higher Education; zero strike actions and prompt 4-year completion.',
      pros: ['Guaranteed four-year calendar with zero strikes', 'World-class laboratories & libraries', 'Mandatory on-campus accommodation'],
      cons: ['Significant private tuition fees', 'Strict regimented lifestyle and curfew code'],
      subScores: {
        cutoffFit: 96,
        courseStrength: 92,
        tuitionAffordability: 60,
        campusAmbiance: 94,
        reviewsReputation: 92,
        locationAccommodation: 94,
      },
      whyItFits: 'Guarantees on-time graduation with uninterrupted electricity and high-bandwidth fiber connectivity.',
    },
    {
      rank: 4,
      name: 'Obafemi Awolowo University',
      shortName: 'OAU',
      slug: 'obafemi-awolowo-university',
      type: 'Federal' as const,
      state: 'Osun',
      city: 'Ile-Ife',
      course: targetCourse,
      approxCutoff: '260-280 UTME',
      admissionChance: 'Match' as const,
      feesRangeNGN: '₦90,000 - ₦140,000 per session',
      ambianceSummary: 'Arieh Sharon modernist concrete architecture, sprawling verdant hills, open-air amphitheaters, and rich philosophical traditions.',
      reviewSummary: 'Celebrated for legendary intellectual debates, pioneering engineering alumni, and formidable collegiate societies.',
      pros: ['Most architecturally striking campus in West Africa', 'Vibrant peer-led scholarship', 'Low federal fees'],
      cons: ['Hostel power and water fluctuations', 'Rigorous grading system'],
      subScores: {
        cutoffFit: 86,
        courseStrength: 92,
        tuitionAffordability: 91,
        campusAmbiance: 90,
        reviewsReputation: 94,
        locationAccommodation: 72,
      },
      whyItFits: 'Fertile ground for independent critical thinking and formidable professional tenacity.',
    },
    {
      rank: 5,
      name: 'Federal University of Technology, Akure',
      shortName: 'FUTA',
      slug: 'federal-university-of-technology-akure',
      type: 'Federal' as const,
      state: 'Ondo',
      city: 'Akure',
      course: targetCourse,
      approxCutoff: '240-265 UTME',
      admissionChance: 'Safe' as const,
      feesRangeNGN: '₦85,000 - ₦130,000 per session',
      ambianceSummary: 'Focused, tech-centric campus layout surrounded by lush agricultural research fields and quiet lecture complexes.',
      reviewSummary: 'Specialized federal technology institution renowned for producing practical, industry-ready technical experts.',
      pros: ['Specialized STEM focus', 'Highly competitive technical track record', 'Affordable living in Akure'],
      cons: ['Limited humanities perspective', 'Hostel supply tight for senior levels'],
      subScores: {
        cutoffFit: 90,
        courseStrength: 90,
        tuitionAffordability: 92,
        campusAmbiance: 76,
        reviewsReputation: 88,
        locationAccommodation: 80,
      },
      whyItFits: 'Laser-focused technical curriculum without distraction, producing resilient and capable professionals.',
    },
    {
      rank: 6,
      name: 'Ahmadu Bello University',
      shortName: 'ABU',
      slug: 'ahmadu-bello-university',
      type: 'Federal' as const,
      state: 'Kaduna',
      city: 'Zaria',
      course: targetCourse,
      approxCutoff: '230-250 UTME',
      admissionChance: 'Safe' as const,
      feesRangeNGN: '₦75,000 - ₦120,000 per session',
      ambianceSummary: 'Vast northern savanna campus, serene red-brick facades, shaded tree canopies, and historic collegiate traditions.',
      reviewSummary: 'The premier university of Northern Nigeria with unmatched national political, administrative, and engineering alumni connections.',
      pros: ['Extensive federal research infrastructure', 'Very affordable living and tuition', 'Vast national reach'],
      cons: ['Distance from southern commercial hubs', 'Variable academic calendar pace'],
      subScores: {
        cutoffFit: 92,
        courseStrength: 87,
        tuitionAffordability: 95,
        campusAmbiance: 80,
        reviewsReputation: 90,
        locationAccommodation: 78,
      },
      whyItFits: 'Offers deep national network and venerable heritage with very low cost of living in historic Zaria.',
    },
    {
      rank: 7,
      name: 'University of Nigeria, Nsukka',
      shortName: 'UNN',
      slug: 'university-of-nigeria-nsukka',
      type: 'Federal' as const,
      state: 'Enugu',
      city: 'Nsukka',
      course: targetCourse,
      approxCutoff: '250-270 UTME',
      admissionChance: 'Match' as const,
      feesRangeNGN: '₦90,000 - ₦135,000 per session',
      ambianceSummary: 'Peaceful undulating hills, cool misty mornings, deep academic heritage, and Azikiwe\'s founding legacy.',
      reviewSummary: 'First indigenous Nigerian university, celebrated for science, pharmacy, and innovation in the South East.',
      pros: ['Pioneering academic history', 'Cool temperate highland climate', 'Dedicated research institutes'],
      cons: ['Nsukka town is somewhat tranquil and distant from commercial hubs', 'Hostel renovations ongoing'],
      subScores: {
        cutoffFit: 84,
        courseStrength: 88,
        tuitionAffordability: 90,
        campusAmbiance: 82,
        reviewsReputation: 91,
        locationAccommodation: 75,
      },
      whyItFits: 'A contemplative sanctuary of deep study, ideal for scholars who thrive in peaceful, distraction-free environments.',
    },
    {
      rank: 8,
      name: 'Lagos State University',
      shortName: 'LASU',
      slug: 'lagos-state-university',
      type: 'State' as const,
      state: 'Lagos',
      city: 'Ojo, Lagos',
      course: targetCourse,
      approxCutoff: '230-260 UTME',
      admissionChance: 'Safe' as const,
      feesRangeNGN: '₦130,000 - ₦220,000 per session',
      ambianceSummary: 'Revitalized modern lecture halls, green parkways, robust digital infrastructure, and proximity to Badagry expressway.',
      reviewSummary: 'Has undergone an extraordinary academic renaissance, now ranking among the most stable and reputable state universities in Nigeria.',
      pros: ['Remarkable calendar stability in recent years', 'Direct Lagos market proximity', 'High digitization of student records'],
      cons: ['Off-campus accommodation dominance', 'Lagos traffic corridors'],
      subScores: {
        cutoffFit: 89,
        courseStrength: 85,
        tuitionAffordability: 82,
        campusAmbiance: 79,
        reviewsReputation: 86,
        locationAccommodation: 76,
      },
      whyItFits: 'Top-tier state institution that combines calendar stability with the commercial agility of Lagos.',
    },
    {
      rank: 9,
      name: 'University of Ilorin',
      shortName: 'UNILORIN',
      slug: 'university-of-ilorin',
      type: 'Federal' as const,
      state: 'Kwara',
      city: 'Ilorin',
      course: targetCourse,
      approxCutoff: '255-275 UTME',
      admissionChance: 'Match' as const,
      feesRangeNGN: '₦80,000 - ₦130,000 per session',
      ambianceSummary: 'Expansive landmass, famous campus rail transit corridor, scenic dam, and a tranquil harmony between North and South.',
      reviewSummary: 'Historically celebrated as Nigeria\'s most applied-to university due to a multi-decade record of disciplined academic scheduling.',
      pros: ['High institutional stability', 'Clean and secure campus perimeter', 'Very affordable student housing'],
      cons: ['Large applicant pool makes post-UTME fiercely contested', 'Hot dry season weather'],
      subScores: {
        cutoffFit: 82,
        courseStrength: 86,
        tuitionAffordability: 93,
        campusAmbiance: 83,
        reviewsReputation: 89,
        locationAccommodation: 82,
      },
      whyItFits: 'A harmonious bridge of cultures with a well-earned reputation for disciplined, punctual academic progression.',
    },
    {
      rank: 10,
      name: 'Babcock University',
      shortName: 'BU',
      slug: 'babcock-university',
      type: 'Private' as const,
      state: 'Ogun',
      city: 'Ilishan-Remo',
      course: targetCourse,
      approxCutoff: '210-240 UTME',
      admissionChance: 'Safe' as const,
      feesRangeNGN: '₦1,200,000 - ₦1,750,000 per session',
      ambianceSummary: 'Immaculately quiet Seventh-day Adventist campus sanctuary with manicured gardens, strict decorum, and modern medical complexes.',
      reviewSummary: 'One of Nigeria\'s pioneer private universities, known for top-tier medicine, nursing, computer software, and law faculties.',
      pros: ['Predictable 4-year completion', 'High personal security and pastoral care', 'Modern residential amenities'],
      cons: ['Strict dietary and lifestyle codes', 'Substantial private tuition'],
      subScores: {
        cutoffFit: 94,
        courseStrength: 84,
        tuitionAffordability: 68,
        campusAmbiance: 88,
        reviewsReputation: 86,
        locationAccommodation: 88,
      },
      whyItFits: 'Ideal for scholars seeking complete peace of mind, continuous power, and zero administrative delays.',
    },
  ];

  const processed = rawUnis.map((u) => ({
    ...u,
    finalScore: calculateWeightedScore(u.subScores),
  }));

  processed.sort((a, b) => (b.finalScore ?? 0) - (a.finalScore ?? 0));
  processed.forEach((u, i) => {
    u.rank = i + 1;
  });

  return {
    suggestedCourses,
    counsellorNote: `Dossier evaluated for candidate ${profile.fullName || 'Scholar'}. Weighted scores calculated across cut-off fit (30%), faculty strength (25%), tuition affordability (15%), campus ambiance (10%), reputation (10%), and hostels (10%).`,
    universities: processed,
  };
}

export function getClientFallbackDetail(slug: string, name: string, dreamJob?: string): UniversityDetail {
  const isCovenant = slug.includes('covenant');
  const isUnilag = slug.includes('lagos');

  return {
    slug,
    name,
    motto: isCovenant ? 'Raising a New Generation of Leaders' : isUnilag ? 'In Deed and in Truth' : 'Recte Sapere Fons',
    foundedYear: isCovenant ? 2002 : isUnilag ? 1962 : 1948,
    overview: `${name} is an esteemed tertiary institution in Nigeria recognized for rigorous academic scholarship, accredited faculties, and distinguished alumni leadership.`,
    admissionRequirements: {
      postUtmeDetails: 'Online computer-based post-UTME screening consisting of English, General Paper, and departmental subjects. Minimum screening aggregate threshold required.',
      olevelSubjectCombination: ['English Language', 'Mathematics', 'Physics / Literature', 'Chemistry / Government', 'Biology / Economics'],
      jambSubjectCombination: ['English', 'Core Subject 1', 'Core Subject 2', 'Core Subject 3'],
      minimumCutoffNote: 'Institutional benchmark of 200+ in UTME required for screening eligibility.',
    },
    feesBreakdown: {
      acceptanceFee: isCovenant ? '₦120,000' : '₦55,000',
      tuitionSession: isCovenant ? '₦1,850,000 - ₦2,400,000' : '₦95,000 - ₦150,000',
      facultyDues: '₦15,000 - ₦25,000',
      accommodationEstimated: isCovenant ? 'Included in fees (Mandatory Hall)' : '₦45,000 - ₦90,000',
      totalEstimatedYearOne: isCovenant ? '₦2,100,000 - ₦2,650,000' : '₦210,000 - ₦320,000',
    },
    hostelsAndAccommodation: {
      onCampusAvailability: 'Bed spaces allocated via central portal balloting for freshmen; priority given to first-year admits.',
      offCampusAverageRent: '₦180,000 - ₦450,000 per annum depending on proximity to gate and power inverter access.',
      qualityDescription: 'Gated halls with student executive leadership, continuous security patrols, and library annexes.',
    },
    notableFaculties: ['College of Medicine / Health Sciences', 'Faculty of Engineering & Technology', 'Faculty of Law', 'Faculty of Science & Computing'],
    campusLife: {
      associationsAndClubs: ['Literary & Debating Society', 'Junior Chamber International (JCI)', 'Rotaract Club', 'Developer Student Club'],
      securityAndEnvironment: 'Strict vehicular gating, internal transit shuttles, and green collegiate quadrangles.',
      traditions: 'Inter-hall debate championships, annual matriculation gowns ceremony, and alumni induction.',
    },
    scholarshipsAndAid: ['Federal Government Bilateral Scholarship Scheme', 'MTN Foundation Science & Tech Scholarship', 'Alumni Trust Fund Grants'],
    howToApply: [
      'Select institution as First Choice on JAMB UTME portal',
      'Attain minimum benchmark score of 200+ in UTME',
      'Register on the university post-UTME admissions screening portal',
      'Upload verified O\'Level results to JAMB CAPS platform',
      'Monitor provisional admission offer on JAMB Central Admissions Processing System'
    ],
    dreamJobFitAnalysis: `The institution maintains strong corporate linkages with leading organizations in Nigeria, providing exceptional leverage for aspiring to become a ${dreamJob || 'leading professional'}.`,
    webSourcesConsulted: ['Official University Admissions Portal', 'National Universities Commission (NUC) Bulletin', 'JAMB CAPS Official Brochure']
  };
}

export function getClientFallbackChat(query: string, universityName?: string): string {
  const q = query.toLowerCase();
  if (q.includes('hostel') || q.includes('accommodation')) {
    return `First-year undergraduate halls at ${universityName || 'Nigerian universities'} prioritize freshers via central portal balloting once acceptance fees are verified. Most halls enforce a 10:00 PM quiet hour, executive porter registries for security, and strict rules on high-wattage electrical appliances. Complete your hall application promptly upon provisional admission notice.`;
  }
  if (q.includes('post-utme') || q.includes('screening') || q.includes('exam')) {
    return `For Post-UTME screening, ${universityName || 'most federal institutions'} deploy computer-based assessments covering English Language, General Knowledge, and your three core UTME subjects. Several institutions also incorporate an aggregate weighting formula: 50% UTME score, 30% Post-UTME score, and 20% O'Level grades (A1=4.0, B2=3.6, B3=3.2, etc.).`;
  }
  return `Greetings, scholar. Your inquiry regarding ${universityName || 'university admission'} is well taken. Ensure your O'Level credits and UTME combination precisely match the JAMB brochure requirements for your target department. Feel free to present any further questions.`;
}
