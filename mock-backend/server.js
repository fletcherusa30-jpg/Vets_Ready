const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Mock data
const mockClaims = [];
let claimIdCounter = 1;

// Mock user ID (normally from JWT)
const MOCK_USER_ID = 'mock-user-123';

// Helper: Calculate combined rating using VA math
function calculateCombinedRating(ratings) {
  if (ratings.length === 0) return 0;

  const sorted = ratings.sort((a, b) => b - a);
  let combined = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    combined = combined + (100 - combined) * sorted[i] / 100;
  }

  // Round to nearest 10
  return Math.round(combined / 10) * 10;
}

// Helper: Calculate individual condition rating
function calculateConditionRating(code, evidence) {
  const baseRatings = {
    'F4310': 50,  // PTSD
    'F3229': 30,  // Depression
    'S06': 40,    // TBI
    'H9311': 10,  // Tinnitus
    'G89.29': 20  // Pain
  };

  let rating = baseRatings[code] || 10;

  // Adjustments based on evidence
  if (evidence.hospitalizations && evidence.hospitalizations.length > 0) {
    rating = Math.min(rating + 10, 100);
  }
  if (evidence.medications && evidence.medications.length > 2) {
    rating = Math.min(rating + 5, 100);
  }
  if (evidence.severity_notes && evidence.severity_notes.toLowerCase().includes('severe')) {
    rating = Math.min(rating + 10, 100);
  }

  return rating;
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0 (Mock)',
    environment: 'development',
    services: ['claims-analysis', 'mock-backend']
  });
});

// ==================== REMOVED CLAIM SUBMISSION ENDPOINTS ====================
// All claim submission functionality has been removed per compliance requirements.
// This application is educational only and does not file, submit, or transmit
// any information to the VA. All endpoints below are for educational analysis only.

// POST /api/claims/educational-analysis - Educational rating analysis (NOT a claim submission)
app.post('/api/claims/educational-analysis', (req, res) => {
  const { title, condition_codes, medical_evidence } = req.body;

  if (!title || !condition_codes || condition_codes.length === 0) {
    return res.status(400).json({
      detail: 'Title and at least one condition code are required',
      educational_note: 'This is an educational analysis tool only - not an official VA claim submission.'
    });
  }

  // Calculate ratings for each condition
  const conditionRatings = condition_codes.map(code => {
    const conditionNames = {
      'F4310': 'PTSD',
      'F3229': 'Depression',
      'S06': 'TBI',
      'H9311': 'Tinnitus',
      'G89.29': 'Chronic Pain'
    };

    const rating = calculateConditionRating(code, medical_evidence);

    return {
      code,
      name: conditionNames[code] || `Condition ${code}`,
      rating,
      justification: `Educational Estimate: ${conditionNames[code] || code} estimated at ${rating}% based on typical medical evidence patterns. Actual VA rating determined by C&P exam.`
    };
  });

  // Calculate combined rating
  const combinedRating = calculateCombinedRating(conditionRatings.map(cr => cr.rating));

  // Generate educational recommendations (NOT official VA guidance)
  const recommendations = [
    '📚 EDUCATIONAL INFORMATION ONLY - Not official VA advice:',
  ];
  if (combinedRating >= 50) {
    recommendations.push('• Learn about Special Monthly Compensation (SMC) eligibility criteria');
    recommendations.push('• Research additional benefits available at 50%+ rating');
  }
  if (combinedRating >= 70) {
    recommendations.push('• Research TDIU (Total Disability Individual Unemployability) requirements');
    recommendations.push('• Learn about Vocational Rehabilitation & Employment benefits');
  }
  if (combinedRating < 50) {
    recommendations.push('• Understand the importance of ongoing medical documentation');
    recommendations.push('• Learn when and how to request re-evaluations');
  }
  recommendations.push('• Consult with an accredited VSO for personalized claim strategy');

  // Educational next steps (NOT a filing guide)
  const nextSteps = [
    '⚠️ TO FILE AN OFFICIAL CLAIM, YOU MUST:',
    '1. Visit VA.gov to file online (https://www.va.gov/disability/how-to-file-claim/)',
    '2. Work with a Veterans Service Officer (VSO) for free accredited assistance',
    '3. Submit VA Form 21-526EZ through official channels',
    '4. Gather all medical evidence and service records before filing',
    '5. Schedule C&P exam through VA (not through this tool)',
    '',
    '📋 This tool does NOT file claims - it only provides educational estimates.'
  ];

  // Create educational analysis response (NOT stored as official claim)
  const analysis = {
    educational_disclaimer: '⚠️ EDUCATIONAL ANALYSIS ONLY - NOT AN OFFICIAL VA CLAIM OR SUBMISSION',
    estimated_ratings: conditionRatings,
    estimated_combined_rating: combinedRating,
    educational_recommendations: recommendations,
    filing_information: nextSteps,
    analysis_timestamp: new Date().toISOString(),
    important_note: 'This analysis is saved locally in your browser only. It is NOT transmitted to the VA. To file an official claim, visit VA.gov or contact a VSO.'
  };

  // Return educational analysis (do NOT store as claim)
  res.status(200).json(analysis);
});

// ==================== RETIREMENT ENDPOINTS ====================

// POST /api/retirement/pension - Calculate pension (legacy endpoint)
app.post('/api/retirement/pension', (req, res) => {
  const { base_pay, years_of_service, disability_rating } = req.body;

  if (!base_pay || !years_of_service) {
    return res.status(400).json({ detail: 'base_pay and years_of_service required' });
  }

  // Basic calculation (High-3 system, 2.5% per year)
  const monthlyPension = base_pay * 0.025 * years_of_service;

  // Disability rates (simplified)
  const disabilityRates = {
    0: 0, 10: 171, 20: 338, 30: 524, 40: 755, 50: 1075,
    60: 1361, 70: 1716, 80: 1995, 90: 2241, 100: 3737
  };
  const disabilityPay = disabilityRates[disability_rating || 0] || 0;

  res.json({
    monthly_pension: Math.round(monthlyPension),
    annual_pension: Math.round(monthlyPension * 12),
    disability_pay: disabilityPay,
    total_monthly: Math.round(monthlyPension + disabilityPay),
    total_annual: Math.round((monthlyPension + disabilityPay) * 12),
    breakdown: {
      base_pension: Math.round(monthlyPension),
      disability_compensation: disabilityPay
    }
  });
});

// POST /api/retirement/enhanced - Enhanced retirement calculation
app.post('/api/retirement/enhanced', (req, res) => {
  const data = req.body;

  // Pay grade mapping (2026 pay at 20 years)
  const payGrades = {
    'E-1': 2000, 'E-2': 2240, 'E-3': 2357, 'E-4': 2607, 'E-5': 3600,
    'E-6': 4200, 'E-7': 5100, 'E-8': 6300, 'E-9': 7500,
    'W-1': 4800, 'W-2': 5500, 'W-3': 6200, 'W-4': 7000, 'W-5': 8500,
    'O-1': 3800, 'O-2': 4400, 'O-3': 6800, 'O-4': 8200, 'O-5': 9500,
    'O-6': 11500, 'O-7': 13000, 'O-8': 14500, 'O-9': 16000, 'O-10': 17500
  };

  const basePay = payGrades[data.payGrade] || 5000;
  const multiplier = data.retirementSystem === 'HIGH_3' ? 2.5 : 2.0;
  const monthlyPension = basePay * (multiplier / 100) * data.yearsOfService;

  // Disability rates
  const disabilityRates = {
    0: [0, 0, 0, 0], 10: [171, 171, 171, 171], 20: [338, 338, 338, 338],
    30: [524, 577, 621, 660], 40: [755, 832, 891, 945],
    50: [1075, 1161, 1235, 1304], 60: [1361, 1486, 1575, 1659],
    70: [1716, 1861, 1969, 2072], 80: [1995, 2161, 2288, 2410],
    90: [2241, 2428, 2575, 2717], 100: [3737, 3946, 4125, 4297]
  };

  const rates = disabilityRates[data.disabilityRating] || [0, 0, 0, 0];
  let monthlyDisability = rates[0];
  if (data.hasSpouse && data.numChildren >= 2) monthlyDisability = rates[3];
  else if (data.hasSpouse && data.numChildren === 1) monthlyDisability = rates[2];
  else if (data.hasSpouse) monthlyDisability = rates[1];
  else if (data.numChildren > 0) monthlyDisability = rates[0] + (data.numChildren * 40);

  // CRDP
  const crdpEligible = data.yearsOfService >= 20 && data.disabilityRating >= 50;

  // SBP
  const monthlySBPCost = data.enrollInSBP ? monthlyPension * 0.065 : 0;

  // TRICARE
  const tricarePremiums = {
    select: { individual: 230, family: 460 },
    prime: { individual: 300, family: 600 },
    forLife: { individual: 0, family: 0 }
  };
  const monthlyTricareCost = tricarePremiums[data.tricareType][
    data.isFamilyCoverage ? 'family' : 'individual'
  ];

  // TSP
  const monthlyTSPWithdrawal = (data.tspBalance * 0.04) / 12;

  // Gross total
  const totalMonthlyGross = monthlyPension + monthlyDisability + monthlyTSPWithdrawal;

  // Federal tax (simplified brackets)
  const annualTaxableIncome = (monthlyPension + monthlyTSPWithdrawal) * 12;
  let federalTax = 0;
  if (annualTaxableIncome > 609350) {
    federalTax = 183647.25 + (annualTaxableIncome - 609350) * 0.37;
  } else if (annualTaxableIncome > 243725) {
    federalTax = 55678.50 + (annualTaxableIncome - 243725) * 0.35;
  } else if (annualTaxableIncome > 191950) {
    federalTax = 39110.50 + (annualTaxableIncome - 191950) * 0.32;
  } else if (annualTaxableIncome > 100525) {
    federalTax = 17168.50 + (annualTaxableIncome - 100525) * 0.24;
  } else if (annualTaxableIncome > 47150) {
    federalTax = 5426 + (annualTaxableIncome - 47150) * 0.22;
  } else if (annualTaxableIncome > 11600) {
    federalTax = 1160 + (annualTaxableIncome - 11600) * 0.12;
  } else {
    federalTax = annualTaxableIncome * 0.10;
  }

  // State tax
  const stateTaxRates = {
    'Texas': 0, 'Florida': 0, 'Nevada': 0, 'Alaska': 0, 'Wyoming': 0,
    'California': 9.3, 'New York': 6.85, 'Virginia': 5.75, 'Hawaii': 8.25,
    'No State Tax': 0
  };
  const stateTaxRate = stateTaxRates[data.stateOfResidence] || 0;
  const stateTax = annualTaxableIncome * (stateTaxRate / 100);

  const totalTax = federalTax + stateTax;
  const totalMonthlyNet = totalMonthlyGross - (totalTax / 12) - monthlySBPCost - monthlyTricareCost;

  // COLA projections (2.8% annual)
  const colaProjections = [];
  for (let year = 0; year <= 30; year += 5) {
    const amount = Math.round(totalMonthlyGross * Math.pow(1.028, year));
    colaProjections.push({ year, amount });
  }

  // TSP growth
  const tspGrowth = [];
  let balance = data.tspBalance;
  for (let year = 0; year <= 30; year += 5) {
    tspGrowth.push({ year, balance: Math.round(balance) });
    for (let i = 0; i < 5; i++) {
      balance = balance * (1 + data.tspAnnualReturn / 100) + (data.tspMonthlyContribution * 12);
    }
  }

  res.json({
    monthlyPension: Math.round(monthlyPension),
    monthlyDisability: Math.round(monthlyDisability),
    monthlySBPCost: Math.round(monthlySBPCost),
    monthlyTricareCost: Math.round(monthlyTricareCost),
    monthlyTSPWithdrawal: Math.round(monthlyTSPWithdrawal),
    totalMonthlyGross: Math.round(totalMonthlyGross),
    totalMonthlyNet: Math.round(totalMonthlyNet),
    annualPension: Math.round(monthlyPension * 12),
    annualDisability: Math.round(monthlyDisability * 12),
    annualTSP: Math.round(monthlyTSPWithdrawal * 12),
    annualGross: Math.round(totalMonthlyGross * 12),
    annualNet: Math.round(totalMonthlyNet * 12),
    federalTax: Math.round(federalTax),
    stateTax: Math.round(stateTax),
    totalTax: Math.round(totalTax),
    crdpEligible,
    crdpAmount: crdpEligible ? Math.round(monthlyDisability) : 0,
    colaProjections,
    tspGrowth
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Vets Ready Educational Backend API',
    version: '1.0.0 (Educational/Advisory Only)',
    compliance: {
      purpose: 'Educational and advisory tool only',
      disclaimer: 'Does NOT file, submit, or transmit claims to the VA',
      claim_filing: 'Visit VA.gov or contact a VSO to file official claims'
    },
    endpoints: {
      health: 'GET /health',
      educational_analysis: 'POST /api/claims/educational-analysis (Educational estimates only)',
      retirement_pension: 'POST /api/retirement/pension (Educational calculator)',
      retirement_enhanced: 'POST /api/retirement/enhanced (Educational planner)'
    },
    removed_endpoints: {
      note: 'Claim submission endpoints removed for compliance',
      reason: 'This tool is educational only and does not file VA claims',
      how_to_file: 'Visit https://www.va.gov/disability/how-to-file-claim/ to file official claims'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  🎖️  Vets Ready - Educational Backend Server              ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  Status: ✓ Running on http://localhost:${PORT}              ║`);
  console.log('║  Mode:   Educational/Advisory Only                        ║');
  console.log('║  CORS:   Enabled for http://localhost:5173                ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  ⚠️  COMPLIANCE NOTICE:                                   ║');
  console.log('║  This server provides EDUCATIONAL tools only.             ║');
  console.log('║  It does NOT file, submit, or transmit claims to the VA.  ║');
  console.log('║  All outputs are for planning and learning purposes.      ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  Available Educational Endpoints:                         ║');
  console.log('║  • GET  /health                                           ║');
  console.log('║  • POST /api/claims/educational-analysis                  ║');
  console.log('║  • POST /api/retirement/pension                           ║');
  console.log('║  • POST /api/retirement/enhanced                          ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  📝 To file official VA claims:                           ║');
  console.log('║  Visit: https://www.va.gov/disability/how-to-file-claim/  ║');
  console.log('║  Or contact a Veterans Service Officer (VSO)              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('✓ Ready to accept requests...\n');
});
