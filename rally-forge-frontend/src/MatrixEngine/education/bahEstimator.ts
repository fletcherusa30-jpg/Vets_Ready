/**
 * BAH (Basic Allowance for Housing) Estimator
 * Calculates expected BAH for GI Bill students
 */

export interface BAHRate {
  zipCode: string;
  city: string;
  state: string;
  rate: number;
  effectiveDate: string;
}

// Mock BAH rates - in production, would fetch from VA API
const MOCK_BAH_RATES: Record<string, number> = {
  '10001': 3450, // NYC
  '90001': 2850, // LA
  '60601': 2400, // Chicago
  '02101': 2900, // Boston
  '33101': 2100, // Miami
  '75201': 1850, // Dallas
  '94102': 3700, // San Francisco
  '20001': 2650, // DC
  '98101': 2550, // Seattle
  '30301': 1750, // Atlanta
};

export function calculateBAH(
  zipCode: string,
  enrollmentStatus: 'Full-time' | 'Three-quarter' | 'Half-time' | 'Online-only',
  giBillPercentage: number
): {
  monthlyRate: number;
  annualAmount: number;
  enrollmentFactor: number;
  percentageFactor: number;
} {
  // Get base BAH rate for ZIP code
  const baseRate = MOCK_BAH_RATES[zipCode] || 1800; // Default national average

  // Enrollment multiplier
  const enrollmentFactors = {
    'Full-time': 1.0,
    'Three-quarter': 0.8,
    'Half-time': 0.5,
    'Online-only': 0.5, // Online gets half of national average ($916.50 in 2024)
  };

  const enrollmentFactor = enrollmentFactors[enrollmentStatus];
  const percentageFactor = giBillPercentage / 100;

  // Calculate final rate
  const effectiveRate = enrollmentStatus === 'Online-only'
    ? 916.50 * percentageFactor
    : baseRate * enrollmentFactor * percentageFactor;

  return {
    monthlyRate: Math.round(effectiveRate),
    annualAmount: Math.round(effectiveRate * 9), // 9-month academic year
    enrollmentFactor,
    percentageFactor,
  };
}

export function compareBAHRates(zipCodes: string[]): {
  zipCode: string;
  monthlyRate: number;
  annualSavings: number;
}[] {
  const rates = zipCodes.map(zip => ({
    zipCode: zip,
    monthlyRate: MOCK_BAH_RATES[zip] || 1800,
    annualSavings: 0,
  }));

  // Calculate savings compared to lowest
  const lowestRate = Math.min(...rates.map(r => r.monthlyRate));
  rates.forEach(r => {
    r.annualSavings = (r.monthlyRate - lowestRate) * 9;
  });

  return rates.sort((a, b) => b.monthlyRate - a.monthlyRate);
}

export function getBAHTips(): string[] {
  return [
    'BAH is based on the school\'s ZIP code, not where you live',
    'Online-only students get half the national average ($916.50)',
    'Part-time students get prorated BAH',
    'BAH is tax-free',
    'Not paid during winter/summer breaks',
    'Paid directly to you, not the school',
    'Can live anywhere while attending online (still get school ZIP BAH rate for hybrid)',
    'Compare BAH rates when choosing between similar schools',
  ];
}
