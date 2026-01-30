/**
 * Organization Matcher
 * Finds local veteran organizations and support groups
 */

export interface VeteranOrganization {
  id: string;
  name: string;
  category: 'Support' | 'Employment' | 'Recreation' | 'Service' | 'Social';
  description: string;
  services: string[];
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  meetingSchedule?: string;
  cost: 'Free' | 'Membership fee' | 'Per event';
  virtualOptions: boolean;
}

const MOCK_ORGS: VeteranOrganization[] = [
  {
    id: 'org-1',
    name: 'Team Rubicon',
    category: 'Service',
    description: 'Disaster response and service opportunities',
    services: ['Disaster relief', 'Skill development', 'Team building'],
    location: { address: 'Virtual', city: 'Nationwide', state: 'All', zipCode: '00000' },
    contact: { website: 'https://teamrubicon.org', email: 'info@teamrubicon.org' },
    cost: 'Free',
    virtualOptions: true,
  },
  {
    id: 'org-2',
    name: 'Team RWB (Red, White & Blue)',
    category: 'Recreation',
    description: 'Social and fitness activities for veterans',
    services: ['Group runs', 'Social events', 'Community building'],
    location: { address: 'Local chapters', city: 'Nationwide', state: 'All', zipCode: '00000' },
    contact: { website: 'https://teamrwb.org' },
    cost: 'Free',
    virtualOptions: true,
  },
];

export function searchOrganizations(criteria: {
  category?: string;
  zipCode?: string;
  virtualOnly?: boolean;
}): VeteranOrganization[] {
  let results = [...MOCK_ORGS];

  if (criteria.category) {
    results = results.filter(org => org.category === criteria.category);
  }

  if (criteria.virtualOnly) {
    results = results.filter(org => org.virtualOptions);
  }

  return results;
}
