/**
 * Military Pay Tables and Related Data
 * Updated for 2026 (based on historical patterns)
 */

export interface PayGrade {
  grade: string;
  rank: string;
  branch: string;
  basePay: number; // Monthly base pay for 20 years of service
}

export interface DisabilityRate {
  rating: number;
  monthlyRate: number;
  withSpouse: number;
  withSpouseAndChild: number;
  withSpouseAndTwoChildren: number;
}

// 2026 Military Pay Table (E-1 through O-10 at 20 years of service)
export const PAY_GRADES: PayGrade[] = [
  // Enlisted - Army, Air Force, Space Force
  { grade: 'E-1', rank: 'Private/Airman Basic', branch: 'Army/AF/SF', basePay: 2000 },
  { grade: 'E-2', rank: 'Private/Airman', branch: 'Army/AF/SF', basePay: 2240 },
  { grade: 'E-3', rank: 'Private First Class/Airman First Class', branch: 'Army/AF/SF', basePay: 2357 },
  { grade: 'E-4', rank: 'Specialist/Corporal/Senior Airman', branch: 'Army/AF/SF', basePay: 2607 },
  { grade: 'E-5', rank: 'Sergeant/Staff Sergeant', branch: 'Army/AF/SF', basePay: 3600 },
  { grade: 'E-6', rank: 'Staff Sergeant/Technical Sergeant', branch: 'Army/AF/SF', basePay: 4200 },
  { grade: 'E-7', rank: 'Sergeant First Class/Master Sergeant', branch: 'Army/AF/SF', basePay: 5100 },
  { grade: 'E-8', rank: 'Master Sergeant/Senior Master Sergeant', branch: 'Army/AF/SF', basePay: 6300 },
  { grade: 'E-9', rank: 'Sergeant Major/Chief Master Sergeant', branch: 'Army/AF/SF', basePay: 7500 },

  // Enlisted - Navy, Coast Guard
  { grade: 'E-1', rank: 'Seaman Recruit', branch: 'Navy/CG', basePay: 2000 },
  { grade: 'E-2', rank: 'Seaman Apprentice', branch: 'Navy/CG', basePay: 2240 },
  { grade: 'E-3', rank: 'Seaman', branch: 'Navy/CG', basePay: 2357 },
  { grade: 'E-4', rank: 'Petty Officer Third Class', branch: 'Navy/CG', basePay: 2607 },
  { grade: 'E-5', rank: 'Petty Officer Second Class', branch: 'Navy/CG', basePay: 3600 },
  { grade: 'E-6', rank: 'Petty Officer First Class', branch: 'Navy/CG', basePay: 4200 },
  { grade: 'E-7', rank: 'Chief Petty Officer', branch: 'Navy/CG', basePay: 5100 },
  { grade: 'E-8', rank: 'Senior Chief Petty Officer', branch: 'Navy/CG', basePay: 6300 },
  { grade: 'E-9', rank: 'Master Chief Petty Officer', branch: 'Navy/CG', basePay: 7500 },

  // Enlisted - Marines
  { grade: 'E-1', rank: 'Private', branch: 'Marines', basePay: 2000 },
  { grade: 'E-2', rank: 'Private First Class', branch: 'Marines', basePay: 2240 },
  { grade: 'E-3', rank: 'Lance Corporal', branch: 'Marines', basePay: 2357 },
  { grade: 'E-4', rank: 'Corporal', branch: 'Marines', basePay: 2607 },
  { grade: 'E-5', rank: 'Sergeant', branch: 'Marines', basePay: 3600 },
  { grade: 'E-6', rank: 'Staff Sergeant', branch: 'Marines', basePay: 4200 },
  { grade: 'E-7', rank: 'Gunnery Sergeant', branch: 'Marines', basePay: 5100 },
  { grade: 'E-8', rank: 'Master Sergeant/First Sergeant', branch: 'Marines', basePay: 6300 },
  { grade: 'E-9', rank: 'Master Gunnery Sergeant/Sergeant Major', branch: 'Marines', basePay: 7500 },

  // Warrant Officers
  { grade: 'W-1', rank: 'Warrant Officer 1', branch: 'All', basePay: 4800 },
  { grade: 'W-2', rank: 'Chief Warrant Officer 2', branch: 'All', basePay: 5500 },
  { grade: 'W-3', rank: 'Chief Warrant Officer 3', branch: 'All', basePay: 6200 },
  { grade: 'W-4', rank: 'Chief Warrant Officer 4', branch: 'All', basePay: 7000 },
  { grade: 'W-5', rank: 'Chief Warrant Officer 5', branch: 'All', basePay: 8500 },

  // Officers
  { grade: 'O-1', rank: 'Second Lieutenant/Ensign', branch: 'All', basePay: 3800 },
  { grade: 'O-2', rank: 'First Lieutenant/Lieutenant JG', branch: 'All', basePay: 4400 },
  { grade: 'O-3', rank: 'Captain/Lieutenant', branch: 'All', basePay: 6800 },
  { grade: 'O-4', rank: 'Major/Lieutenant Commander', branch: 'All', basePay: 8200 },
  { grade: 'O-5', rank: 'Lieutenant Colonel/Commander', branch: 'All', basePay: 9500 },
  { grade: 'O-6', rank: 'Colonel/Captain', branch: 'All', basePay: 11500 },
  { grade: 'O-7', rank: 'Brigadier General/Rear Admiral Lower', branch: 'All', basePay: 13000 },
  { grade: 'O-8', rank: 'Major General/Rear Admiral Upper', branch: 'All', basePay: 14500 },
  { grade: 'O-9', rank: 'Lieutenant General/Vice Admiral', branch: 'All', basePay: 16000 },
  { grade: 'O-10', rank: 'General/Admiral', branch: 'All', basePay: 17500 },
];

// 2026 VA Disability Compensation Rates
export const DISABILITY_RATES: DisabilityRate[] = [
  { rating: 10, monthlyRate: 171, withSpouse: 171, withSpouseAndChild: 171, withSpouseAndTwoChildren: 171 },
  { rating: 20, monthlyRate: 338, withSpouse: 338, withSpouseAndChild: 338, withSpouseAndTwoChildren: 338 },
  { rating: 30, monthlyRate: 524, withSpouse: 577, withSpouseAndChild: 621, withSpouseAndTwoChildren: 660 },
  { rating: 40, monthlyRate: 755, withSpouse: 832, withSpouseAndChild: 891, withSpouseAndTwoChildren: 945 },
  { rating: 50, monthlyRate: 1075, withSpouse: 1161, withSpouseAndChild: 1235, withSpouseAndTwoChildren: 1304 },
  { rating: 60, monthlyRate: 1361, withSpouse: 1486, withSpouseAndChild: 1575, withSpouseAndTwoChildren: 1659 },
  { rating: 70, monthlyRate: 1716, withSpouse: 1861, withSpouseAndChild: 1969, withSpouseAndTwoChildren: 2072 },
  { rating: 80, monthlyRate: 1995, withSpouse: 2161, withSpouseAndChild: 2288, withSpouseAndTwoChildren: 2410 },
  { rating: 90, monthlyRate: 2241, withSpouse: 2428, withSpouseAndChild: 2575, withSpouseAndTwoChildren: 2717 },
  { rating: 100, monthlyRate: 3737, withSpouse: 3946, withSpouseAndChild: 4125, withSpouseAndTwoChildren: 4297 },
];

// TRICARE Premiums (2026 estimates)
export const TRICARE_PREMIUMS = {
  select: {
    individual: 230,
    family: 460,
  },
  prime: {
    individual: 300,
    family: 600,
  },
  forLife: {
    individual: 0, // Free for Medicare-eligible retirees
    family: 0,
  },
};

// State tax rates (simplified - for retirement income)
export const STATE_TAX_RATES: Array<{ state: string; rate: number }> = [
  { state: 'Alaska', rate: 0 },
  { state: 'Florida', rate: 0 },
  { state: 'Nevada', rate: 0 },
  { state: 'South Dakota', rate: 0 },
  { state: 'Tennessee', rate: 0 },
  { state: 'Texas', rate: 0 },
  { state: 'Washington', rate: 0 },
  { state: 'Wyoming', rate: 0 },
  { state: 'Alabama', rate: 5.0 },
  { state: 'Arizona', rate: 2.5 },
  { state: 'Arkansas', rate: 4.9 },
  { state: 'California', rate: 9.3 },
  { state: 'Colorado', rate: 4.4 },
  { state: 'Connecticut', rate: 5.0 },
  { state: 'Delaware', rate: 6.6 },
  { state: 'Georgia', rate: 5.75 },
  { state: 'Hawaii', rate: 8.25 },
  { state: 'Idaho', rate: 5.8 },
  { state: 'Illinois', rate: 4.95 },
  { state: 'Indiana', rate: 3.15 },
  { state: 'Iowa', rate: 6.0 },
  { state: 'Kansas', rate: 5.7 },
  { state: 'Kentucky', rate: 4.5 },
  { state: 'Louisiana', rate: 4.25 },
  { state: 'Maine', rate: 7.15 },
  { state: 'Maryland', rate: 5.75 },
  { state: 'Massachusetts', rate: 5.0 },
  { state: 'Michigan', rate: 4.25 },
  { state: 'Minnesota', rate: 7.05 },
  { state: 'Mississippi', rate: 5.0 },
  { state: 'Missouri', rate: 4.95 },
  { state: 'Montana', rate: 6.75 },
  { state: 'Nebraska', rate: 5.84 },
  { state: 'New Hampshire', rate: 0 },
  { state: 'New Jersey', rate: 8.97 },
  { state: 'New Mexico', rate: 5.9 },
  { state: 'New York', rate: 6.85 },
  { state: 'North Carolina', rate: 4.75 },
  { state: 'North Dakota', rate: 2.9 },
  { state: 'Ohio', rate: 3.99 },
  { state: 'Oklahoma', rate: 4.75 },
  { state: 'Oregon', rate: 9.9 },
  { state: 'Pennsylvania', rate: 3.07 },
  { state: 'Rhode Island', rate: 5.99 },
  { state: 'South Carolina', rate: 6.5 },
  { state: 'Utah', rate: 4.85 },
  { state: 'Vermont', rate: 8.75 },
  { state: 'Virginia', rate: 5.75 },
  { state: 'West Virginia', rate: 6.5 },
  { state: 'Wisconsin', rate: 6.27 },
  { state: 'District of Columbia', rate: 8.95 },
];

export const BRANCHES = ['Army', 'Navy', 'Air Force', 'Marines', 'Coast Guard', 'Space Force'];

export const RETIREMENT_SYSTEMS = {
  HIGH_3: {
    name: 'High-3 (Legacy)',
    description: 'Entered service before 2018',
    multiplier: 2.5, // 2.5% per year of service
  },
  BRS: {
    name: 'Blended Retirement System (BRS)',
    description: 'Entered service after 2018',
    multiplier: 2.0, // 2.0% per year of service + TSP match
  },
};

// Helper functions
export function getPayByGrade(grade: string, branch?: string): number {
  const matchingGrades = PAY_GRADES.filter(p =>
    p.grade === grade && (!branch || p.branch === 'All' || p.branch.includes(branch))
  );
  return matchingGrades.length > 0 ? matchingGrades[0].basePay : 0;
}

export function getDisabilityPay(rating: number, hasSpouse: boolean = false, numChildren: number = 0): number {
  const rateData = DISABILITY_RATES.find(r => r.rating === rating);
  if (!rateData) return 0;

  if (!hasSpouse && numChildren === 0) return rateData.monthlyRate;
  if (hasSpouse && numChildren === 0) return rateData.withSpouse;
  if (hasSpouse && numChildren === 1) return rateData.withSpouseAndChild;
  if (hasSpouse && numChildren >= 2) return rateData.withSpouseAndTwoChildren;

  // Spouse deceased but has children
  return rateData.monthlyRate + (numChildren * 40);
}

export function calculateCOLA(years: number, annualRate: number = 2.8): number {
  return Math.pow(1 + annualRate / 100, years);
}

export function calculateFederalTax(income: number, hasSpouse: boolean = false): number {
  if (hasSpouse) {
    // 2026 simplified federal tax brackets (married filing jointly)
    if (income <= 23200) return income * 0.10;
    if (income <= 94300) return 2320 + (income - 23200) * 0.12;
    if (income <= 201050) return 10852 + (income - 94300) * 0.22;
    if (income <= 383900) return 34337 + (income - 201050) * 0.24;
    if (income <= 487450) return 78221 + (income - 383900) * 0.32;
    if (income <= 731200) return 111357 + (income - 487450) * 0.35;
    return 197669.50 + (income - 731200) * 0.37;
  } else {
    // 2026 simplified federal tax brackets (single filer)
    if (income <= 11600) return income * 0.10;
    if (income <= 47150) return 1160 + (income - 11600) * 0.12;
    if (income <= 100525) return 5426 + (income - 47150) * 0.22;
    if (income <= 191950) return 17168.50 + (income - 100525) * 0.24;
    if (income <= 243725) return 39110.50 + (income - 191950) * 0.32;
    if (income <= 609350) return 55678.50 + (income - 243725) * 0.35;
    return 183647.25 + (income - 609350) * 0.37;
  }
}
