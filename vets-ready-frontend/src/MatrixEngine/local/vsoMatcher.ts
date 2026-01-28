/**
 * VSO (Veterans Service Organization) Matcher
 * Finds local VSOs to help with claims and benefits
 */

export interface VSO {
  id: string;
  name: string;
  type: 'National' | 'State' | 'Local';
  description: string;
  services: string[];
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  hours: string;
  appointmentRequired: boolean;
  walkInsAccepted: boolean;
  website?: string;
  specializations?: string[];
}

const MOCK_VSOS: VSO[] = [
  {
    id: 'vso-1',
    name: 'Disabled American Veterans (DAV)',
    type: 'National',
    description: 'Free claims assistance for all veterans',
    services: ['Claims filing', 'Appeals', 'Benefits counseling', 'Transportation'],
    location: {
      address: '123 Veterans Blvd',
      city: 'Anytown',
      state: 'ST',
      zipCode: '12345',
      phone: '555-1234',
    },
    hours: 'Mon-Fri 9AM-5PM',
    appointmentRequired: true,
    walkInsAccepted: true,
    website: 'https://dav.org',
    specializations: ['Disability claims', 'Transportation', 'Employment'],
  },
  {
    id: 'vso-2',
    name: 'Veterans of Foreign Wars (VFW)',
    type: 'National',
    description: 'Full-service VSO with local posts nationwide',
    services: ['Claims assistance', 'Financial assistance', 'Community events'],
    location: {
      address: '456 Post Road',
      city: 'Anytown',
      state: 'ST',
      zipCode: '12345',
      phone: '555-5678',
    },
    hours: 'Mon-Fri 10AM-6PM, Sat 10AM-2PM',
    appointmentRequired: false,
    walkInsAccepted: true,
    website: 'https://vfw.org',
    specializations: ['Benefits claims', 'Community support'],
  },
];

export function findNearbyVSOs(zipCode: string, radius: number = 25): VSO[] {
  // In production, would use geolocation API
  return MOCK_VSOS;
}

export function matchVSOToNeed(need: 'Claims' | 'Appeals' | 'Employment' | 'Housing' | 'General'): VSO[] {
  return MOCK_VSOS.filter(vso => {
    if (need === 'Claims') return vso.services.includes('Claims filing');
    if (need === 'Appeals') return vso.services.includes('Appeals');
    return true;
  });
}

export function getVSOTips(): string[] {
  return [
    'VSO services are 100% free - never pay for claims help',
    'Can switch VSOs at any time',
    'VSO can access your records with signed authorization',
    'Many VSOs offer transportation to VA appointments',
    'National VSOs (DAV, VFW, American Legion) have offices at VA facilities',
    'State-specific VSOs often have shorter wait times',
  ];
}
