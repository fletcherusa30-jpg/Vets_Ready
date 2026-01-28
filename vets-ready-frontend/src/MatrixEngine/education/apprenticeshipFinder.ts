/**
 * Apprenticeship Finder
 * Finds apprenticeship programs compatible with GI Bill
 */

export interface Apprenticeship {
  id: string;
  title: string;
  industry: string;
  provider: string;
  location: string;
  duration: number; // months
  giBillApproved: boolean;
  salary: {
    starting: number;
    journeyman: number;
  };
  description: string;
  requirements: string[];
  benefits: string[];
  contactInfo: {
    website?: string;
    phone?: string;
    email?: string;
  };
}

const MOCK_APPRENTICESHIPS: Apprenticeship[] = [
  {
    id: 'app-1',
    title: 'Electrician Apprenticeship',
    industry: 'Construction/Trades',
    provider: 'International Brotherhood of Electrical Workers (IBEW)',
    location: 'Nationwide',
    duration: 48,
    giBillApproved: true,
    salary: { starting: 35000, journeyman: 75000 },
    description: 'Comprehensive electrical training combining classroom instruction with paid on-the-job training',
    requirements: ['High school diploma', 'Pass aptitude test', 'Physical ability'],
    benefits: ['Paid training', 'Union membership', 'Health insurance', 'Pension'],
    contactInfo: { website: 'https://ibew.org', phone: '202-833-7000' },
  },
  {
    id: 'app-2',
    title: 'Plumbing & Pipefitting Apprenticeship',
    industry: 'Construction/Trades',
    provider: 'United Association (UA)',
    location: 'Nationwide',
    duration: 60,
    giBillApproved: true,
    salary: { starting: 32000, journeyman: 70000 },
    description: 'Learn plumbing, pipefitting, HVAC installation and service',
    requirements: ['18+ years old', 'High school diploma or GED', 'Drug test'],
    benefits: ['Paid training', 'Healthcare', 'Retirement plan', 'Veterans program'],
    contactInfo: { website: 'https://ua.org', phone: '410-269-2000' },
  },
  {
    id: 'app-3',
    title: 'IT/Cybersecurity Apprenticeship',
    industry: 'Technology',
    provider: 'Various Tech Companies',
    location: 'Remote/Major Cities',
    duration: 12,
    giBillApproved: true,
    salary: { starting: 50000, journeyman: 95000 },
    description: 'Earn industry certifications while gaining hands-on IT experience',
    requirements: ['Basic computer skills', 'Security clearance (for some programs)'],
    benefits: ['Industry certifications', 'Paid training', 'Job placement', 'Remote options'],
    contactInfo: { website: 'https://apprenticeships.gov' },
  },
];

export function searchApprenticeships(criteria: {
  industry?: string;
  location?: string;
  giBillOnly?: boolean;
}): Apprenticeship[] {
  let results = [...MOCK_APPRENTICESHIPS];

  if (criteria.industry) {
    results = results.filter(a =>
      a.industry.toLowerCase().includes(criteria.industry!.toLowerCase())
    );
  }

  if (criteria.giBillOnly) {
    results = results.filter(a => a.giBillApproved);
  }

  return results;
}

export function getApprenticeshipBenefits(apprenticeship: Apprenticeship, giBillPercentage: number): {
  monthlyPay: number;
  giBillPayment: number;
  totalMonthlyIncome: number;
  totalProgramEarnings: number;
} {
  const monthlyPay = Math.round(apprenticeship.salary.starting / 12);
  const giBillPayment = Math.round((2210 * giBillPercentage / 100)); // MGIB rate for apprenticeships

  return {
    monthlyPay,
    giBillPayment,
    totalMonthlyIncome: monthlyPay + giBillPayment,
    totalProgramEarnings: (monthlyPay + giBillPayment) * apprenticeship.duration,
  };
}
