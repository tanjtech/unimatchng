export interface FallbackUniversity {
  id: string;
  name: string;
  shortName: string;
  type: 'Federal' | 'State' | 'Private';
  state: string;
  city: string;
  officialWebsite: string;
  founded: number;
}

export const ESTEEMED_NIGERIAN_UNIVERSITIES_FALLBACK: FallbackUniversity[] = [
  {
    id: 'ui',
    name: 'University of Ibadan',
    shortName: 'UI',
    type: 'Federal',
    state: 'Oyo',
    city: 'Ibadan',
    officialWebsite: 'https://ui.edu.ng',
    founded: 1948,
  },
  {
    id: 'unilag',
    name: 'University of Lagos',
    shortName: 'UNILAG',
    type: 'Federal',
    state: 'Lagos',
    city: 'Akoka, Lagos',
    officialWebsite: 'https://unilag.edu.ng',
    founded: 1962,
  },
  {
    id: 'oau',
    name: 'Obafemi Awolowo University',
    shortName: 'OAU',
    type: 'Federal',
    state: 'Osun',
    city: 'Ile-Ife',
    officialWebsite: 'https://oauife.edu.ng',
    founded: 1961,
  },
  {
    id: 'abu',
    name: 'Ahmadu Bello University',
    shortName: 'ABU',
    type: 'Federal',
    state: 'Kaduna',
    city: 'Zaria',
    officialWebsite: 'https://abu.edu.ng',
    founded: 1962,
  },
  {
    id: 'unn',
    name: 'University of Nigeria, Nsukka',
    shortName: 'UNN',
    type: 'Federal',
    state: 'Enugu',
    city: 'Nsukka',
    officialWebsite: 'https://unn.edu.ng',
    founded: 1960,
  },
  {
    id: 'covenant',
    name: 'Covenant University',
    shortName: 'CU',
    type: 'Private',
    state: 'Ogun',
    city: 'Ota',
    officialWebsite: 'https://covenantuniversity.edu.ng',
    founded: 2002,
  },
  {
    id: 'futa',
    name: 'Federal University of Technology, Akure',
    shortName: 'FUTA',
    type: 'Federal',
    state: 'Ondo',
    city: 'Akure',
    officialWebsite: 'https://futa.edu.ng',
    founded: 1981,
  },
  {
    id: 'unilorin',
    name: 'University of Ilorin',
    shortName: 'UNILORIN',
    type: 'Federal',
    state: 'Kwara',
    city: 'Ilorin',
    officialWebsite: 'https://unilorin.edu.ng',
    founded: 1975,
  },
  {
    id: 'lasu',
    name: 'Lagos State University',
    shortName: 'LASU',
    type: 'State',
    state: 'Lagos',
    city: 'Ojo, Lagos',
    officialWebsite: 'https://lasu.edu.ng',
    founded: 1983,
  },
  {
    id: 'babcock',
    name: 'Babcock University',
    shortName: 'BU',
    type: 'Private',
    state: 'Ogun',
    city: 'Ilishan-Remo',
    officialWebsite: 'https://babcock.edu.ng',
    founded: 1999,
  },
];
