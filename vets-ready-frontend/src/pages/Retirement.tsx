/**
 * Enhanced Retirement Planning Page
 * Features: Multiple Investment Accounts, Pre-Retirement Income, Budget Planning, BRS/High-3, COLA, SBP, Tax calculations, Charts
 */

import React, { useState, useEffect } from 'react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  PAY_GRADES,
  RETIREMENT_SYSTEMS,
  STATE_TAX_RATES,
  TRICARE_PREMIUMS,
  getPayByGrade,
  getDisabilityPay,
  calculateCOLA,
  calculateFederalTax,
  BRANCHES
} from '../data/payTables';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';
import CRSCQualificationWizard, { CRSCQualificationData } from '../components/CRSCQualificationWizard';

interface InvestmentAccount {
  id: string;
  name: string;
  provider: string; // TSP, Edward Jones, Fidelity, Vanguard, etc.
  accountType: 'TSP' | '401k' | 'IRA' | 'Roth IRA' | 'Brokerage' | 'Other';
  balance: number;
  monthlyContribution: number;
  annualReturn: number;
}

interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  isEssential: boolean;
}

interface RetirementFormData {
  // Personal Info
  branch: string;
  payGrade: string;
  yearsOfService: number;
  currentAge: number;
  retirementSystem: 'HIGH_3' | 'BRS';

  // Military Retirement (Optional - for 20+ year retirees)
  isRetiree: boolean;
  useMilitaryPension: boolean;
  monthlyPension: number; // Manual pension input when not using auto-calc

  // Pre-Retirement Income
  currentWorkIncome: number;
  spouseIncome: number;
  otherIncome: number;
  yearsUntilRetirement: number;

  // Disability
  disabilityRating: number;
  hasSpouse: boolean;
  numChildren: number;
  hasCombatRelatedDisability: boolean; // For CRSC eligibility

  // Investment Accounts (multiple)
  investmentAccounts: InvestmentAccount[];

  // SBP
  enrollInSBP: boolean;

  // Location
  stateOfResidence: string;

  // Healthcare
  tricareType: 'select' | 'prime' | 'forLife';
  isFamilyCoverage: boolean;

  // Budget
  budgetCategories: BudgetCategory[];
}

interface CalculationResult {
  // Pension
  monthlyPension: number;
  annualPension: number;

  // Disability
  monthlyDisability: number;
  annualDisability: number;

  // CRDP (Concurrent Retirement and Disability Pay)
  isCRDPEligible: boolean;
  crdpOffsetAvoided: number;

  // CRSC (Combat-Related Special Compensation)
  isCRSCEligible: boolean;
  crscAmount: number;
  canChooseCRSC: boolean; // Can choose between CRDP and CRSC

  // Investment Income (from all accounts)
  totalInvestmentBalance: number;
  monthlyInvestmentIncome: number;
  annualInvestmentIncome: number;
  investmentBreakdown: Array<{ name: string; balance: number; monthlyIncome: number }>;

  // Pre-Retirement Income
  currentMonthlyIncome: number;
  currentAnnualIncome: number;

  // Budget
  totalMonthlyExpenses: number;
  totalAnnualExpenses: number;
  monthlySurplus: number;
  annualSurplus: number;
  budgetStatus: 'surplus' | 'balanced' | 'deficit';
  essentialExpenses: number;
  discretionaryExpenses: number;

  // Total Retirement Income
  totalMonthlyIncome: number;
  totalAnnualIncome: number;

  // SBP
  sbpCost: number;
  spouseBenefit: number;

  // Taxes
  federalTax: number;
  stateTax: number;
  totalTax: number;
  monthlyNet: number;

  // Healthcare
  tricareCost: number;

  // Projections
  colaProjection: Array<{ year: number; pension: number; disability: number; total: number }>;
  investmentGrowthProjection: Array<{ age: number; year: number; balance: number }>;
  transitionTimeline: Array<{ age: number; year: number; workIncome: number; retirementIncome: number; total: number }>;
}

const DEFAULT_INVESTMENT_ACCOUNTS: InvestmentAccount[] = [
  {
    id: '1',
    name: 'TSP',
    provider: 'Thrift Savings Plan',
    accountType: 'TSP',
    balance: 50000,
    monthlyContribution: 500,
    annualReturn: 7.0
  }
];

const DEFAULT_BUDGET_CATEGORIES: BudgetCategory[] = [
  { id: '1', name: 'Housing (Mortgage/Rent)', amount: 1500, isEssential: true },
  { id: '2', name: 'Utilities', amount: 250, isEssential: true },
  { id: '3', name: 'Food/Groceries', amount: 600, isEssential: true },
  { id: '4', name: 'Transportation', amount: 400, isEssential: true },
  { id: '5', name: 'Medical/Healthcare', amount: 200, isEssential: true },
  { id: '6', name: 'Insurance (Life, Home, Auto)', amount: 300, isEssential: true },
  { id: '7', name: 'Debt Payments', amount: 200, isEssential: true },
  { id: '8', name: 'Entertainment/Hobbies', amount: 300, isEssential: false },
  { id: '9', name: 'Travel', amount: 200, isEssential: false },
  { id: '10', name: 'Savings/Emergency Fund', amount: 400, isEssential: false },
];

export const Retirement: React.FC = () => {
  // Get veteran profile
  const { profile } = useVeteranProfile();

  // Retirement Mode: Already Retired vs Road to Retirement
  const [retirementMode, setRetirementMode] = useState<'already-retired' | 'road-to-retirement'>('road-to-retirement');

  // CRSC Wizard State
  const [showCRSCWizard, setShowCRSCWizard] = useState(false);
  const [crscQualifies, setCrscQualifies] = useState(false);
  const [crscWizardStep, setCrscWizardStep] = useState(1);
  const [crscData, setCrscData] = useState({
    hasRetirementPay: false,
    hasDisabilityRating: false,
    disabilityIsCombatRelated: false,
    disabilityPercentage: 0,
    yearsOfService: 0,
    hasMedicalDocumentation: false,
    injuryDate: '',
    deploymentInfo: ''
  });

  const [formData, setFormData] = useState<RetirementFormData>({
    branch: profile.branch || 'Army',
    payGrade: 'E-7',
    yearsOfService: profile.yearsOfService || 20,
    currentAge: 42,
    retirementSystem: 'BRS',
    isRetiree: true,
    useMilitaryPension: true,
    monthlyPension: 0,
    currentWorkIncome: 75000,
    spouseIncome: 0,
    otherIncome: 0,
    yearsUntilRetirement: 0,
    disabilityRating: profile.disabilityRating || 0,
    hasSpouse: profile.maritalStatus === 'married',
    numChildren: profile.numberOfChildren || 0,
    hasCombatRelatedDisability: false,
    investmentAccounts: DEFAULT_INVESTMENT_ACCOUNTS,
    enrollInSBP: false,
    stateOfResidence: 'Texas',
    tricareType: 'select',
    isFamilyCoverage: false,
    budgetCategories: DEFAULT_BUDGET_CATEGORIES,
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showInvestmentForm, setShowInvestmentForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<InvestmentAccount | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'investments' | 'budget' | 'projections'>('overview');
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Progressive workflow stages
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());

  // Helper to mark stage as complete and move to next
  const completeStage = (stageNum: number) => {
    setCompletedStages(prev => new Set(prev).add(stageNum));
    if (stageNum < 5) {
      setCurrentStage(stageNum + 1);
    }
  };

  // Helper to check if stage is accessible
  const isStageAccessible = (stageNum: number) => {
    if (stageNum === 1) return true;
    return completedStages.has(stageNum - 1);
  };

  // Real-time calculation
  useEffect(() => {
    calculateRetirement();
  }, [formData]);

  const calculateRetirement = () => {
    try {
      setIsCalculating(true);
      setError(null);

      // Validation
      if (formData.yearsOfService < 0 || formData.yearsOfService > 50) {
        setError('Years of service must be between 0 and 50');
        return;
      }

      if (formData.currentAge < 18 || formData.currentAge > 100) {
        setError('Age must be between 18 and 100');
        return;
      }

      if (formData.disabilityRating < 0 || formData.disabilityRating > 100) {
        setError('Disability rating must be between 0 and 100');
        return;
      }

      // Base pension calculation (only if using military pension)
      let monthlyPension = 0;
      if (formData.useMilitaryPension && formData.yearsOfService >= 20) {
        const basePay = getPayByGrade(formData.payGrade, formData.branch);
        if (basePay === 0) {
          setError('Invalid pay grade selected');
          return;
        }
        const multiplier = RETIREMENT_SYSTEMS[formData.retirementSystem].multiplier;
        monthlyPension = basePay * (multiplier / 100) * formData.yearsOfService;
      }

    // Disability compensation
    const monthlyDisability = getDisabilityPay(
      formData.disabilityRating,
      formData.hasSpouse,
      formData.numChildren
    );

    // CRDP (Concurrent Retirement and Disability Pay)
    // Veterans with 20+ years AND 50%+ disability receive both full retirement and full VA disability
    const isCRDPEligible = formData.yearsOfService >= 20 && formData.disabilityRating >= 50;
    const crdpOffsetAvoided = isCRDPEligible ? monthlyDisability : 0;

    // CRSC (Combat-Related Special Compensation)
    // Alternative to CRDP for combat-related disabilities, can be elected instead of CRDP
    // Must have combat-related disability and meet VA requirements
    const isCRSCEligible = formData.yearsOfService >= 20 &&
                           formData.disabilityRating >= 10 &&
                           formData.hasCombatRelatedDisability;

    // CRSC amount is typically the VA disability amount (can vary based on award letter)
    const crscAmount = isCRSCEligible ? monthlyDisability : 0;

    // Veterans can choose between CRDP and CRSC (whichever is more beneficial)
    const canChooseCRSC = isCRDPEligible && isCRSCEligible;

    // Investment calculations - ALL accounts
    const totalInvestmentBalance = formData.investmentAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalMonthlyContribution = formData.investmentAccounts.reduce((sum, acc) => sum + acc.monthlyContribution, 0);

    // 4% withdrawal rule for retirement income from investments
    const monthlyInvestmentIncome = (totalInvestmentBalance * 0.04) / 12;

    const investmentBreakdown = formData.investmentAccounts.map(acc => ({
      name: `${acc.provider} - ${acc.name}`,
      balance: acc.balance,
      monthlyIncome: (acc.balance * 0.04) / 12
    }));

    // Pre-retirement income
    const currentMonthlyIncome = (formData.currentWorkIncome + formData.spouseIncome + formData.otherIncome) / 12;

    // Budget calculations
    const essentialExpenses = formData.budgetCategories
      .filter(cat => cat.isEssential)
      .reduce((sum, cat) => sum + cat.amount, 0);

    const discretionaryExpenses = formData.budgetCategories
      .filter(cat => !cat.isEssential)
      .reduce((sum, cat) => sum + cat.amount, 0);

    const totalMonthlyExpenses = essentialExpenses + discretionaryExpenses;

    // SBP calculations (based on actual pension)
    const sbpCost = formData.enrollInSBP ? actualMonthlyPension * 0.065 : 0;
    const spouseBenefit = formData.enrollInSBP ? actualMonthlyPension * 0.55 : 0;

    // TRICARE costs
    const tricareCost = formData.tricareType === 'forLife' ? 0 :
      formData.isFamilyCoverage ? TRICARE_PREMIUMS[formData.tricareType].family :
      TRICARE_PREMIUMS[formData.tricareType].individual;

    // Total retirement income
    // If using military pension, use the calculated pension; otherwise use manual input
    const actualMonthlyPension = formData.useMilitaryPension ? monthlyPension : formData.monthlyPension;
    const totalMonthlyIncome = actualMonthlyPension + monthlyDisability + monthlyInvestmentIncome;
    const totalAnnualIncome = totalMonthlyIncome * 12;

    // Tax calculations
    const totalTaxableIncome = totalAnnualIncome - (formData.disabilityRating > 0 ? monthlyDisability * 12 : 0);
    const federalTax = calculateFederalTax(totalTaxableIncome, formData.hasSpouse);
    const stateTaxRate = STATE_TAX_RATES.find(s => s.state === formData.stateOfResidence)?.rate || 0;
    const stateTax = totalTaxableIncome * (stateTaxRate / 100);
    const totalTax = federalTax + stateTax;

    const monthlyNet = totalMonthlyIncome - (totalTax / 12) - sbpCost - tricareCost;

    // Budget status
    const monthlySurplus = monthlyNet - totalMonthlyExpenses;
    const budgetStatus: 'surplus' | 'balanced' | 'deficit' =
      monthlySurplus > 100 ? 'surplus' :
      monthlySurplus < -100 ? 'deficit' : 'balanced';

    // COLA Projections (30 years)
    const colaProjection = Array.from({ length: 31 }, (_, i) => {
      const year = new Date().getFullYear() + i;
      const colaFactor = calculateCOLA(i);
      return {
        year,
        pension: actualMonthlyPension * colaFactor,
        disability: monthlyDisability * colaFactor,
        total: (actualMonthlyPension + monthlyDisability) * colaFactor
      };
    });

    // Investment Growth Projections (30 years)
    const investmentGrowthProjection = Array.from({ length: 31 }, (_, i) => {
      const age = formData.currentAge + i;
      const year = new Date().getFullYear() + i;
      let balance = totalInvestmentBalance;

      // Calculate growth year by year
      for (let j = 0; j < i; j++) {
        // If still working (before retirement), add contributions
        if (j < formData.yearsUntilRetirement) {
          balance = balance * (1 + (formData.investmentAccounts[0]?.annualReturn || 7) / 100) +
                   (totalMonthlyContribution * 12);
        } else {
          // After retirement, just growth (no contributions)
          balance = balance * (1 + (formData.investmentAccounts[0]?.annualReturn || 7) / 100);
        }
      }

      return { age, year, balance };
    });

    // Transition Timeline (shows income change from working to retirement)
    const transitionTimeline = Array.from({ length: 11 }, (_, i) => {
      const yearsFromNow = i;
      const age = formData.currentAge + yearsFromNow;
      const year = new Date().getFullYear() + yearsFromNow;

      const stillWorking = yearsFromNow < formData.yearsUntilRetirement;
      const workIncome = stillWorking ? currentMonthlyIncome : 0;
      const retirementIncome = stillWorking ? 0 : totalMonthlyIncome;

      return {
        age,
        year,
        workIncome,
        retirementIncome,
        total: workIncome + retirementIncome
      };
    });

    setResult({
      monthlyPension: actualMonthlyPension,
      annualPension: actualMonthlyPension * 12,
      monthlyDisability,
      annualDisability: monthlyDisability * 12,
      isCRDPEligible,
      crdpOffsetAvoided,
      isCRSCEligible,
      crscAmount,
      canChooseCRSC,
      totalInvestmentBalance,
      monthlyInvestmentIncome,
      annualInvestmentIncome: monthlyInvestmentIncome * 12,
      investmentBreakdown,
      currentMonthlyIncome,
      currentAnnualIncome: currentMonthlyIncome * 12,
      totalMonthlyExpenses,
      totalAnnualExpenses: totalMonthlyExpenses * 12,
      monthlySurplus,
      annualSurplus: monthlySurplus * 12,
      budgetStatus,
      essentialExpenses,
      discretionaryExpenses,
      totalMonthlyIncome,
      totalAnnualIncome,
      sbpCost,
      spouseBenefit,
      federalTax,
      stateTax,
      totalTax,
      monthlyNet,
      tricareCost,
      colaProjection,
      investmentGrowthProjection,
      transitionTimeline
    });
    } catch (err) {
      console.error('Retirement calculation error:', err);
      setError('An error occurred while calculating retirement. Please check your inputs.');
    } finally {
      setIsCalculating(false);
    }
  };

  const addInvestmentAccount = () => {
    const newAccount: InvestmentAccount = {
      id: Date.now().toString(),
      name: 'New Account',
      provider: 'Provider',
      accountType: 'Brokerage',
      balance: 0,
      monthlyContribution: 0,
      annualReturn: 7.0
    };
    setEditingAccount(newAccount);
    setShowInvestmentForm(true);
  };

  const saveInvestmentAccount = (account: InvestmentAccount) => {
    if (formData.investmentAccounts.find(a => a.id === account.id)) {
      // Update existing
      setFormData({
        ...formData,
        investmentAccounts: formData.investmentAccounts.map(a =>
          a.id === account.id ? account : a
        )
      });
    } else {
      // Add new
      setFormData({
        ...formData,
        investmentAccounts: [...formData.investmentAccounts, account]
      });
    }
    setShowInvestmentForm(false);
    setEditingAccount(null);
  };

  const deleteInvestmentAccount = (id: string) => {
    setFormData({
      ...formData,
      investmentAccounts: formData.investmentAccounts.filter(a => a.id !== id)
    });
  };

  const updateBudgetCategory = (id: string, amount: number) => {
    setFormData({
      ...formData,
      budgetCategories: formData.budgetCategories.map(cat =>
        cat.id === id ? { ...cat, amount } : cat
      )
    });
  };

  const addBudgetCategory = () => {
    const newCategory: BudgetCategory = {
      id: Date.now().toString(),
      name: 'New Category',
      amount: 0,
      isEssential: false
    };
    setFormData({
      ...formData,
      budgetCategories: [...formData.budgetCategories, newCategory]
    });
  };

  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Main Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 mb-6 text-white">
        <h1 className="text-4xl font-bold mb-2">💰 Financial Planning & Retirement</h1>
        <p className="text-blue-100 text-lg">
          Comprehensive budget planning, retirement projections, and financial readiness tools
        </p>
      </div>

      {/* CRSC Guide & Wizard */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🏅</span>
            <div>
              <h2 className="text-2xl font-bold">Combat-Related Special Compensation (CRSC)</h2>
              <p className="text-yellow-100">Receive both retirement pay and disability compensation for combat-related injuries</p>
            </div>
          </div>
          <button
            onClick={() => setShowCRSCWizard(!showCRSCWizard)}
            className="px-6 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-yellow-50 shadow-md transition-all"
          >
            {showCRSCWizard ? 'Close Guide' : 'Open CRSC Guide'}
          </button>
        </div>

        {/* CRSC Quick Check */}
        {!showCRSCWizard && (
          <div className="bg-white/20 backdrop-blur rounded-lg p-4">
            <p className="font-semibold mb-2">Quick Qualification Check:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className={formData.hasCombatRelatedDisability ? "text-green-300" : "text-yellow-200"}>
                  {formData.hasCombatRelatedDisability ? "✓" : "○"}
                </span>
                <span>Combat-related disability</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={formData.disabilityRating >= 10 ? "text-green-300" : "text-yellow-200"}>
                  {formData.disabilityRating >= 10 ? "✓" : "○"}
                </span>
                <span>VA disability rating (10%+)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={formData.useMilitaryPension ? "text-green-300" : "text-yellow-200"}>
                  {formData.useMilitaryPension ? "✓" : "○"}
                </span>
                <span>Military retirement pay</span>
              </div>
            </div>
          </div>
        )}

        {/* CRSC Wizard */}
        {showCRSCWizard && (
          <div className="bg-white rounded-lg p-6 text-gray-800 mt-4">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`bg-orange-500 h-2 rounded-full transition-all ${
                      crscWizardStep === 1 ? 'w-1/4' : crscWizardStep === 2 ? 'w-2/4' : crscWizardStep === 3 ? 'w-3/4' : 'w-full'
                    }`}
                    role="progressbar"
                    aria-label="CRSC Wizard Progress"
                  />
                </div>
                <span className="text-sm font-semibold text-gray-600">Step {crscWizardStep} of 4</span>
              </div>
            </div>

            {/* Step 1: Basic Qualification */}
            {crscWizardStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Step 1: Basic Qualification</h3>
                <p className="text-gray-600 mb-4">Let's determine if you're eligible for CRSC benefits.</p>

                <div className="space-y-4">
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300">
                    <input
                      type="checkbox"
                      checked={crscData.hasRetirementPay}
                      onChange={(e) => setCrscData({ ...crscData, hasRetirementPay: e.target.checked })}
                      className="w-5 h-5 text-orange-600 mt-1"
                    />
                    <div>
                      <span className="font-semibold text-gray-900">I receive military retirement pay</span>
                      <p className="text-sm text-gray-600 mt-1">You must be receiving retired pay (20+ years of service or medically retired)</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300">
                    <input
                      type="checkbox"
                      checked={crscData.hasDisabilityRating}
                      onChange={(e) => setCrscData({ ...crscData, hasDisabilityRating: e.target.checked })}
                      className="w-5 h-5 text-orange-600 mt-1"
                    />
                    <div>
                      <span className="font-semibold text-gray-900">I have a VA disability rating of 10% or higher</span>
                      <p className="text-sm text-gray-600 mt-1">Required to qualify for CRSC</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300">
                    <input
                      type="checkbox"
                      checked={crscData.disabilityIsCombatRelated}
                      onChange={(e) => setCrscData({ ...crscData, disabilityIsCombatRelated: e.target.checked })}
                      className="w-5 h-5 text-orange-600 mt-1"
                    />
                    <div>
                      <span className="font-semibold text-gray-900">My disability is combat-related</span>
                      <p className="text-sm text-gray-600 mt-1">Includes: armed conflict, hazardous duty (parachuting, airborne, diving, flight ops, EOD), simulated war exercises/field training, or instrumentality of war</p>
                    </div>
                  </label>

                  {crscData.hasDisabilityRating && (
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="crsc-disability-rating">Your VA Disability Rating (%)</label>
                      <input
                        type="range"
                        id="crsc-disability-rating"
                        name="crsc-disability-rating"
                        min="0"
                        max="100"
                        step="10"
                        value={crscData.disabilityPercentage}
                        onChange={(e) => setCrscData({ ...crscData, disabilityPercentage: parseInt(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center text-2xl font-bold text-orange-600 mt-2">{crscData.disabilityPercentage}%</div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => {
                      const qualifies = crscData.hasRetirementPay && crscData.hasDisabilityRating && crscData.disabilityIsCombatRelated && crscData.disabilityPercentage >= 10;
                      setCrscQualifies(qualifies);
                      setCrscWizardStep(2);
                    }}
                    className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Combat Documentation */}
            {crscWizardStep === 2 && (
              <div className="space-y-6">
                {crscQualifies ? (
                  <>
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                      <p className="font-semibold text-green-900">✓ You appear to qualify for CRSC!</p>
                      <p className="text-sm text-green-800 mt-1">Let's gather the documentation you'll need.</p>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800">Step 2: Combat Documentation</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="crsc-injury-date">When did your combat-related injury occur?</label>
                        <input
                          type="date"
                          id="crsc-injury-date"
                          name="crsc-injury-date"
                          value={crscData.injuryDate}
                          onChange={(e) => setCrscData({ ...crscData, injuryDate: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Deployment/Combat Information</label>
                        <textarea
                          value={crscData.deploymentInfo}
                          onChange={(e) => setCrscData({ ...crscData, deploymentInfo: e.target.value })}
                          placeholder="E.g., Deployed to Iraq 2005-2006, injured during convoy operations..."
                          className="w-full p-3 border border-gray-300 rounded-lg h-24"
                        />
                      </div>

                      <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-orange-300" htmlFor="crsc-medical-docs">
                        <input
                          type="checkbox"
                          id="crsc-medical-docs"
                          name="crsc-medical-docs"
                          checked={crscData.hasMedicalDocumentation}
                          onChange={(e) => setCrscData({ ...crscData, hasMedicalDocumentation: e.target.checked })}
                          className="w-5 h-5 text-orange-600 mt-1"
                        />
                        <div>
                          <span className="font-semibold text-gray-900">I have medical documentation linking my disability to combat</span>
                          <p className="text-sm text-gray-600 mt-1">Required: Medical records, DD Form 214, VA rating decision, deployment records</p>
                        </div>
                      </label>
                    </div>
                  </>
                ) : (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                    <p className="font-semibold text-red-900">Based on your answers, you may not qualify for CRSC.</p>
                    <p className="text-sm text-red-800 mt-2">Requirements:</p>
                    <ul className="text-sm text-red-800 mt-2 ml-4 list-disc">
                      <li>Must receive military retirement pay</li>
                      <li>Must have VA disability rating of 10% or higher</li>
                      <li>Disability must be combat-related</li>
                    </ul>
                  </div>
                )}

                <div className="flex justify-between gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => setCrscWizardStep(1)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  {crscQualifies && (
                    <button
                      onClick={() => setCrscWizardStep(3)}
                      className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600"
                    >
                      Continue →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Filing Process */}
            {crscWizardStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800">Step 3: How to File for CRSC</h3>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="font-semibold text-blue-900">Filing Instructions</p>
                  <p className="text-sm text-blue-800 mt-2">Follow these steps to apply for CRSC:</p>
                </div>

                <div className="space-y-4">
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-gray-900">1. Gather Required Documents</h4>
                    <ul className="text-sm text-gray-700 mt-2 space-y-1">
                      <li>• DD Form 214 (Discharge papers)</li>
                      <li>• VA rating decision letter</li>
                      <li>• Medical records showing combat-related injury</li>
                      <li>• Deployment orders and records</li>
                      <li>• Any Purple Heart or combat award documentation</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-gray-900">2. Complete Application</h4>
                    <p className="text-sm text-gray-700 mt-2">Submit your application to your branch's retirement office:</p>
                    <ul className="text-sm text-gray-700 mt-2 space-y-1">
                      <li>• <strong>Army:</strong> DFAS - U.S. Army, 8899 E 56th Street, Indianapolis, IN 46249-1200</li>
                      <li>• <strong>Navy:</strong> DFAS - U.S. Navy, 8899 E 56th Street, Indianapolis, IN 46249-1300</li>
                      <li>• <strong>Air Force:</strong> DFAS - U.S. Air Force, 8899 E 56th Street, Indianapolis, IN 46249-1500</li>
                      <li>• <strong>Marine Corps:</strong> DFAS - USMC, 8899 E 56th Street, Indianapolis, IN 46249-1400</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-gray-900">3. Processing Timeline</h4>
                    <p className="text-sm text-gray-700 mt-2">Typical processing time: 6-12 months. You'll receive a decision letter explaining approval or denial.</p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-gray-900">4. CRSC vs CRDP</h4>
                    <p className="text-sm text-gray-700 mt-2">If you have 20+ years and 50%+ disability rating, you may qualify for CRDP (Concurrent Retirement Disability Pay) instead. CRDP is automatic, while CRSC requires application. You cannot receive both - choose the one with higher benefit.</p>
                  </div>
                </div>

                <div className="flex justify-between gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => setCrscWizardStep(2)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setCrscWizardStep(4)}
                    className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600"
                  >
                    Generate Application Guide →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Generate PDF */}
            {crscWizardStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800">Step 4: Your Personalized CRSC Application Guide</h3>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-500 p-6 rounded-lg">
                  <h4 className="font-semibold text-green-900 text-lg mb-4">✓ Ready to Apply!</h4>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <p className="text-sm text-gray-600">Your Disability Rating</p>
                      <p className="text-2xl font-bold text-gray-900">{crscData.disabilityPercentage}%</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                      <p className="text-sm text-gray-600">Estimated Monthly CRSC</p>
                      <p className="text-2xl font-bold text-gray-900">${Math.round(getDisabilityPay(crscData.disabilityPercentage, false, 0))}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      // Generate PDF (simplified - in production would use jsPDF or similar)
                      const pdfContent = `
CRSC Application Guide - Generated ${new Date().toLocaleDateString()}

PERSONAL INFORMATION:
- VA Disability Rating: ${crscData.disabilityPercentage}%
- Injury Date: ${crscData.injuryDate}
- Deployment Info: ${crscData.deploymentInfo}

REQUIRED DOCUMENTS CHECKLIST:
□ DD Form 214 (Discharge papers)
□ VA rating decision letter
□ Medical records linking injury to combat
□ Deployment orders/records
□ Purple Heart or combat award documentation (if applicable)

FILING INSTRUCTIONS:
1. Complete all required forms from your branch
2. Attach all supporting documentation
3. Mail to appropriate DFAS address for your branch
4. Keep copies of everything you submit
5. Expect 6-12 month processing time

ESTIMATED BENEFIT:
Monthly CRSC Payment: $${Math.round(getDisabilityPay(crscData.disabilityPercentage, false, 0))}

This is an educational guide only and does not constitute legal or financial advice.
Contact your base legal assistance office or VSO for help with your application.
                      `;
                      const blob = new Blob([pdfContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'CRSC-Application-Guide.txt';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="w-full px-6 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-lg flex items-center justify-center gap-3"
                  >
                    <span className="text-2xl">📄</span>
                    <span>Download Your CRSC Application Guide (PDF)</span>
                  </button>

                  <p className="text-sm text-gray-600 mt-4 text-center">
                    This personalized guide includes your specific information, required documents, and filing instructions.
                  </p>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="font-semibold text-yellow-900">⚠️ Important Reminders</p>
                  <ul className="text-sm text-yellow-800 mt-2 space-y-1">
                    <li>• CRSC is tax-free (unlike retirement pay)</li>
                    <li>• You cannot receive both CRSC and CRDP - choose the higher benefit</li>
                    <li>• If denied, you can appeal or reapply with additional evidence</li>
                    <li>• Contact a Veterans Service Officer (VSO) for free assistance</li>
                  </ul>
                </div>

                <div className="flex justify-between gap-3 mt-6 pt-6 border-t">
                  <button
                    onClick={() => setCrscWizardStep(3)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => {
                      setShowCRSCWizard(false);
                      setCrscWizardStep(1);
                      // Update form data with CRSC status
                      setFormData({ ...formData, hasCombatRelatedDisability: true, disabilityRating: crscData.disabilityPercentage });
                    }}
                    className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                  >
                    Apply to My Financial Plan
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mode Selector: Already Retired vs Road to Retirement */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Choose Your Planning Path</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Already Retired Path */}
          <button
            onClick={() => {
              setRetirementMode('already-retired');
              setFormData(prev => ({ ...prev, isRetiree: true, yearsOfService: 20, yearsUntilRetirement: 0 }));
            }}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              retirementMode === 'already-retired'
                ? 'border-green-500 bg-green-50 shadow-xl'
                : 'border-gray-300 bg-white hover:border-green-300 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">🎖️</span>
              <h3 className="text-2xl font-bold text-gray-800">Already Retired</h3>
              {retirementMode === 'already-retired' && (
                <span className="ml-auto bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Active</span>
              )}
            </div>
            <p className="text-gray-600 mb-4">
              You're already receiving retirement benefits. Use this path to:
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Manage your retirement income and budget</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Project long-term retirement stability</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Optimize withdrawal strategies</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Plan for healthcare and living expenses</span>
              </li>
            </ul>
          </button>

          {/* Road to Retirement Path */}
          <button
            onClick={() => {
              setRetirementMode('road-to-retirement');
              setFormData(prev => ({ ...prev, isRetiree: false, yearsUntilRetirement: 10 }));
            }}
            className={`p-6 rounded-lg border-2 transition-all text-left ${
              retirementMode === 'road-to-retirement'
                ? 'border-blue-500 bg-blue-50 shadow-xl'
                : 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-lg'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl">🛤️</span>
              <h3 className="text-2xl font-bold text-gray-800">Road to Retirement</h3>
              {retirementMode === 'road-to-retirement' && (
                <span className="ml-auto bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Active</span>
              )}
            </div>
            <p className="text-gray-600 mb-4">
              You're still working toward retirement. Use this path to:
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Calculate your retirement readiness</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Project future retirement income</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Plan savings and contributions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">✓</span>
                <span>Build a timeline to financial freedom</span>
              </li>
            </ul>
          </button>
        </div>
      </div>

      {/* Dynamic Title Based on Mode */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          {retirementMode === 'already-retired' ? '🎖️ Retirement Stability Plan' : '🛤️ Road to Retirement Plan'}
        </h2>
        <p className="text-gray-600">
          {retirementMode === 'already-retired'
            ? "Build your comprehensive retirement plan in 4 simple stages"
            : "Plan your path to retirement - complete each stage to build your future"}
        </p>
      </div>

      {/* Progress Roadmap */}
      <div className="mb-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Your Journey</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { num: 1, name: 'Profile', icon: '👤', desc: 'Personal & Service' },
            { num: 2, name: 'Income', icon: '💰', desc: 'Benefits & pay' },
            { num: 3, name: 'Planning', icon: '📊', desc: 'Investments' },
            { num: 4, name: 'Results', icon: '🎯', desc: 'Your plan' }
          ].map((stage) => (
            <button
              key={stage.num}
              onClick={() => isStageAccessible(stage.num) && setCurrentStage(stage.num)}
              disabled={!isStageAccessible(stage.num)}
              className={`relative p-4 rounded-lg border-2 transition-all ${
                currentStage === stage.num
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : completedStages.has(stage.num)
                  ? 'border-green-500 bg-green-50 hover:shadow-md'
                  : isStageAccessible(stage.num)
                  ? 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-md'
                  : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="text-3xl mb-2">{stage.icon}</div>
              <div className="font-semibold text-sm">{stage.name}</div>
              <div className="text-xs text-gray-600">{stage.desc}</div>
              {completedStages.has(stage.num) && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              )}
              {currentStage === stage.num && (
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4 flex items-start">
          <span className="mr-2">⚠️</span>
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 hover:text-red-800"
            aria-label="Close error message"
          >
            ✕
          </button>
        </div>
      )}

      {/* Loading Indicator */}
      {isCalculating && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
          <p className="text-sm">Calculating retirement projections...</p>
        </div>
      )}

      {/* STAGE 1: PROFILE */}
      {currentStage === 1 && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">👤 Step 1: Your Profile</h2>
            <p className="text-gray-600">Let's start with some basic information about you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Current Age</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="18"
                  max="70"
                  value={formData.currentAge}
                  onChange={(e) => setFormData({ ...formData, currentAge: parseInt(e.target.value) })}
                  className="flex-1"
                  aria-label="Current Age"
                />
                <span className="text-2xl font-bold text-blue-600 w-16 text-center">{formData.currentAge}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">State of Residence</label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.stateOfResidence}
                onChange={(e) => setFormData({ ...formData, stateOfResidence: e.target.value })}
                aria-label="State of Residence"
              >
                {STATE_TAX_RATES.map(s => (
                  <option key={s.state} value={s.state}>{s.state}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Marital Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!formData.hasSpouse}
                    onChange={() => setFormData({ ...formData, hasSpouse: false })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Single</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.hasSpouse}
                    onChange={() => setFormData({ ...formData, hasSpouse: true })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Married</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Number of Dependents {profile.numberOfChildren !== undefined && <span className="text-green-600 text-xs ml-2">✓ From profile</span>}
              </label>
              <input
                type="number"
                min="0"
                max="10"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.numChildren}
                onChange={(e) => setFormData({ ...formData, numChildren: parseInt(e.target.value) || 0 })}
                aria-label="Number of Dependents"
              />
            </div>
          </div>

          {/* Military Retiree Option */}
          <div className="mt-8 border-t pt-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Military Service Information</h3>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.useMilitaryPension}
                  onChange={(e) => setFormData({
                    ...formData,
                    useMilitaryPension: e.target.checked,
                    yearsOfService: e.target.checked ? Math.max(formData.yearsOfService, 20) : formData.yearsOfService
                  })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <div>
                  <span className="font-semibold text-blue-900">I am a military retiree (20+ years of service)</span>
                  <p className="text-sm text-blue-800 mt-1">Check this if you receive or will receive military retirement pay</p>
                </div>
              </label>
            </div>

            {/* Show military details if checked */}
            {formData.useMilitaryPension && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
                {/* Show auto-loaded indicator if data came from profile */}
                {profile.branch && (
                  <div className="md:col-span-2 mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      ✅ <strong>Auto-loaded from your profile:</strong> Branch, Years of Service, and Dependents are pre-filled. You can adjust them below if needed.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="branch-of-service">
                    Branch of Service {profile.branch && <span className="text-green-600 text-xs ml-2">✓ From profile</span>}
                  </label>
                  <select
                    id="branch-of-service"
                    name="branch-of-service"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  >
                    {BRANCHES.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="pay-grade">Retirement Rank/Pay Grade</label>
                  <select
                    id="pay-grade"
                    name="pay-grade"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.payGrade}
                    onChange={(e) => setFormData({ ...formData, payGrade: e.target.value })}
                  >
                    {PAY_GRADES.map(grade => (
                      <option key={grade.grade} value={grade.grade}>{grade.grade}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="years-of-service">
                    Years of Service: <span className="text-2xl font-bold text-blue-600 ml-2">{formData.yearsOfService}</span>
                    {profile.yearsOfService && <span className="text-green-600 text-xs ml-2">✓ From profile</span>}
                  </label>
                  <input
                    type="range"
                    id="years-of-service"
                    name="years-of-service"
                    min="20"
                    max="40"
                    value={formData.yearsOfService}
                    onChange={(e) => setFormData({ ...formData, yearsOfService: parseInt(e.target.value) })}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>20 years</span>
                    <span className="font-semibold">Retirement Eligible</span>
                    <span>40 years</span>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Retirement System</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, retirementSystem: 'BRS' })}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.retirementSystem === 'BRS'
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-semibold">BRS (Blended Retirement System)</div>
                      <div className="text-sm text-gray-600">2.0% per year of service</div>
                      <div className="text-xs text-gray-500 mt-1">Joined after 2018</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, retirementSystem: 'HIGH_3' })}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        formData.retirementSystem === 'HIGH_3'
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-semibold">High-3</div>
                      <div className="text-sm text-gray-600">2.5% per year of service</div>
                      <div className="text-xs text-gray-500 mt-1">Joined before 2018</div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CRSC Option - Independent Section */}
          <div className="mt-8 border-t pt-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Combat-Related Special Compensation (CRSC)</h3>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasCombatRelatedDisability}
                  onChange={(e) => setFormData({ ...formData, hasCombatRelatedDisability: e.target.checked })}
                  className="w-5 h-5 text-yellow-600 rounded"
                />
                <div>
                  <span className="font-semibold text-yellow-900">I receive or am eligible for CRSC (Combat-Related Special Compensation)</span>
                  <p className="text-sm text-yellow-800 mt-1">For combat-related disabilities - allows you to receive both retirement and disability pay</p>
                </div>
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-900 font-semibold mb-2">📋 Need help with CRSC?</p>
              <p className="text-sm text-blue-800 mb-3">
                Use our CRSC Guide at the top of this page to check your qualification and get a personalized application guide.
              </p>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setShowCRSCWizard(true);
                }}
                className="text-sm text-blue-600 font-semibold hover:text-blue-800 underline"
              >
                Open CRSC Guide ↑
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => completeStage(1)}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md transition-all"
            >
              Continue to Income & Benefits →
            </button>
          </div>
        </div>
      )}

      {/* STAGE 2: INCOME & BENEFITS */}
      {currentStage === 2 && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">💰 Step 2: Income & Benefits</h2>
            <p className="text-gray-600">Help us understand your income and VA benefits</p>
          </div>

          <div className="space-y-8 max-w-4xl">
            {/* Current Status */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h3 className="font-semibold text-blue-900 mb-2">Are you currently retired from the military?</h3>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.yearsOfService >= 20 && formData.yearsUntilRetirement === 0}
                    onChange={() => setFormData({ ...formData, yearsUntilRetirement: 0, isRetiree: true })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>Yes, I'm retired</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.yearsUntilRetirement > 0 || formData.yearsOfService < 20}
                    onChange={() => setFormData({ ...formData, yearsUntilRetirement: formData.yearsOfService < 20 ? 5 : 1, isRetiree: false })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>No, planning for retirement</span>
                </label>
              </div>
            </div>

            {/* If not retired yet */}
            {formData.yearsUntilRetirement > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Years Until Retirement: <span className="text-2xl font-bold text-blue-600 ml-2">{formData.yearsUntilRetirement}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={formData.yearsUntilRetirement}
                  onChange={(e) => setFormData({ ...formData, yearsUntilRetirement: parseInt(e.target.value) })}
                  className="w-full h-3 bg-gray-200 rounded-lg"
                  aria-label="Years Until Retirement"
                />
                <p className="text-sm text-gray-600 mt-2">
                  You'll retire at age {formData.currentAge + formData.yearsUntilRetirement}
                </p>
              </div>
            )}

            {/* Current Income (if not retired) */}
            {formData.yearsUntilRetirement > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Your Current Annual Salary</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      className="w-full pl-8 p-3 border border-gray-300 rounded-lg"
                      value={formData.currentWorkIncome}
                      onChange={(e) => setFormData({ ...formData, currentWorkIncome: parseFloat(e.target.value) || 0 })}
                      placeholder="75,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Spouse Annual Income</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      className="w-full pl-8 p-3 border border-gray-300 rounded-lg"
                      value={formData.spouseIncome}
                      onChange={(e) => setFormData({ ...formData, spouseIncome: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Military Pension (if 20+ years) */}
            {formData.yearsOfService >= 20 && (
              <div className="border-2 border-blue-300 rounded-lg p-6 bg-blue-50">
                <h3 className="font-semibold text-blue-900 mb-4">🎖️ Military Retirement Pension</h3>
                <label className="flex items-center gap-3 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.useMilitaryPension}
                    onChange={(e) => setFormData({ ...formData, useMilitaryPension: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="font-medium">Auto-calculate my pension from rank and years</span>
                </label>

                {formData.useMilitaryPension && result && (
                  <div className="bg-white p-4 rounded shadow-sm">
                    <p className="text-sm text-gray-600">Estimated Monthly Pension</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${result.monthlyPension.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Based on {formData.payGrade}, {formData.yearsOfService} years, {formData.retirementSystem}
                    </p>
                  </div>
                )}

                {!formData.useMilitaryPension && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Expected Monthly Pension</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">$</span>
                      <input
                        type="number"
                        className="w-full pl-8 p-3 border border-gray-300 rounded-lg"
                        value={formData.monthlyPension}
                        onChange={(e) => setFormData({ ...formData, monthlyPension: parseFloat(e.target.value) || 0 })}
                        placeholder="3,500"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VA Disability */}
            <div className="border-2 border-purple-300 rounded-lg p-6 bg-purple-50">
              <h3 className="font-semibold text-purple-900 mb-4">🏥 VA Disability Rating</h3>
              <label className="block text-sm font-medium mb-3" htmlFor="disability-rating">
                Current Rating: <span className="text-3xl font-bold text-purple-600 ml-2">{formData.disabilityRating}%</span>
              </label>
              <input
                type="range"
                id="disability-rating"
                name="disability-rating"
                min="0"
                max="100"
                step="10"
                value={formData.disabilityRating}
                onChange={(e) => setFormData({ ...formData, disabilityRating: parseInt(e.target.value) })}
                className="w-full h-3 bg-purple-200 rounded-lg"
              />

              {formData.disabilityRating >= 10 && result && (
                <div className="mt-4 bg-white p-4 rounded shadow-sm">
                  <p className="text-sm text-gray-600">Estimated Monthly VA Compensation</p>
                  <p className="text-3xl font-bold text-purple-600">
                    ${result.monthlyDisability.toLocaleString()}
                  </p>
                </div>
              )}

              {/* CRSC Qualification Wizard */}
              {formData.yearsOfService >= 20 && formData.disabilityRating >= 10 && (
                <div className="mt-4">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl">⚔️</span>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1">Combat-Related Special Compensation (CRSC)</h4>
                        <p className="text-sm text-gray-700 mb-3">
                          CRSC provides tax-free compensation for combat-related disabilities. Not sure if you qualify?
                          Take our comprehensive eligibility wizard to find out.
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setShowCRSCWizard(true)}
                            className="px-6 py-2.5 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition shadow-md flex items-center gap-2"
                          >
                            <span>Check CRSC Eligibility</span>
                            <span className="text-lg">→</span>
                          </button>
                          {formData.hasCombatRelatedDisability && (
                            <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-300">
                              <span className="text-xl">✓</span>
                              <span className="font-semibold text-sm">CRSC Qualified</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="mt-3 pt-3 border-t border-yellow-300">
                      <p className="text-xs text-gray-600 mb-2 font-semibold">CRSC Quick Facts:</p>
                      <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                        <li>Tax-free compensation for combat-related disabilities</li>
                        <li>Requires combat service and service-connected VA rating</li>
                        <li>Cannot receive both CRSC and CRDP (you choose higher benefit)</li>
                        <li>Must apply through your military branch</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Healthcare */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">🏥 TRICARE Coverage</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="tricare-type">TRICARE Type</label>
                  <select
                    id="tricare-type"
                    name="tricare-type"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    value={formData.tricareType}
                    onChange={(e) => setFormData({ ...formData, tricareType: e.target.value as any })}
                  >
                    <option value="select">TRICARE Select</option>
                    <option value="prime">TRICARE Prime</option>
                    <option value="forLife">TRICARE For Life (Free)</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-3 h-full cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFamilyCoverage}
                      onChange={(e) => setFormData({ ...formData, isFamilyCoverage: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span>Family Coverage</span>
                  </label>
                </div>
              </div>
            </div>

            {/* SBP */}
            {formData.yearsOfService >= 20 && formData.hasSpouse && (
              <div>
                <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.enrollInSBP}
                    onChange={(e) => setFormData({ ...formData, enrollInSBP: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <span className="font-medium">Enroll in Survivor Benefit Plan (SBP)</span>
                    <p className="text-sm text-gray-600">Provides 55% of pension to spouse if you pass away</p>
                  </div>
                </label>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setCurrentStage(1)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              onClick={() => completeStage(2)}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md"
            >
              Continue to Planning →
            </button>
          </div>
        </div>
      )}

      {/* STAGE 3: INVESTMENTS & BUDGET */}
      {currentStage === 3 && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 Step 3: Investments & Budget</h2>
            <p className="text-gray-600">Let's plan your financial future</p>
          </div>

          <div className="space-y-8">
            {/* Investment Accounts Summary */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">💵 Investment Accounts</h3>
              </div>

              {formData.investmentAccounts.length > 0 ? (
                <div className="grid gap-4">
                  {formData.investmentAccounts.map(account => (
                    <div key={account.id} className="border-2 border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-800">{account.name}</h4>
                      <p className="text-sm text-gray-600">{account.provider} - {account.accountType}</p>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Balance:</span>
                          <p className="font-semibold">${account.balance.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Monthly:</span>
                          <p className="font-semibold">${account.monthlyContribution.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Return:</span>
                          <p className="font-semibold">{account.annualReturn}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {result && (
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                      <p className="text-sm text-gray-700">Total Portfolio Value</p>
                      <p className="text-3xl font-bold text-green-600">
                        ${result.totalInvestmentBalance.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-600">No investments configured yet - that's okay!</p>
                </div>
              )}
            </div>

            {/* Budget Summary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Monthly Budget Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border-2 border-orange-300 bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">Essential Expenses</p>
                  <p className="text-2xl font-bold text-orange-600">
                    ${formData.budgetCategories.filter(c => c.isEssential).reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                  </p>
                </div>
                <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">Discretionary</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${formData.budgetCategories.filter(c => !c.isEssential).reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-between">
            <button
              onClick={() => setCurrentStage(2)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
            >
              ← Back
            </button>
            <button
              onClick={() => completeStage(3)}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md"
            >
              See Your Retirement Plan →
            </button>
          </div>
        </div>
      )}

      {/* STAGE 4: YOUR RETIREMENT PLAN */}
      {currentStage === 4 && result && (
        <div className="space-y-6">
          {/* Overview Card */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">🎯 Your Retirement Plan</h2>
            <p className="text-green-100 mb-6">Here's your complete financial picture</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
                <p className="text-sm text-green-100">Monthly Retirement Income</p>
                <p className="text-4xl font-bold">${result.totalMonthlyIncome.toLocaleString()}</p>
                <p className="text-sm text-green-100 mt-1">${result.totalAnnualIncome.toLocaleString()}/year</p>
              </div>

              <div className="bg-white/20 rounded-lg p-4 backdrop-blur">
                <p className="text-sm text-green-100">Monthly Expenses</p>
                <p className="text-4xl font-bold">${result.totalMonthlyExpenses.toLocaleString()}</p>
                <p className="text-sm text-green-100 mt-1">${result.totalAnnualExpenses.toLocaleString()}/year</p>
              </div>

              <div className={`rounded-lg p-4 backdrop-blur ${
                result.monthlySurplus > 0 ? 'bg-white/20' : 'bg-red-500/40'
              }`}>
                <p className="text-sm text-green-100">Monthly {result.monthlySurplus > 0 ? 'Surplus' : 'Deficit'}</p>
                <p className="text-4xl font-bold">
                  {result.monthlySurplus > 0 ? '+' : ''}${result.monthlySurplus.toLocaleString()}
                </p>
                <p className="text-sm text-green-100 mt-1">
                  {result.budgetStatus === 'surplus' ? '✓ On track!' : result.budgetStatus === 'deficit' ? '⚠️ Review budget' : '⚖️ Balanced'}
                </p>
              </div>
            </div>
          </div>

          {/* Income Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">💰 Income Sources</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formData.yearsOfService >= 20 && result.monthlyPension > 0 && (
                <div className="border-2 border-blue-300 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎖️</span>
                    <span className="font-semibold text-gray-800">Military Pension</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">${result.monthlyPension.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">${result.annualPension.toLocaleString()}/year</p>
                </div>
              )}

              {result.monthlyDisability > 0 && (
                <div className="border-2 border-purple-300 bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🏥</span>
                    <span className="font-semibold text-gray-800">VA Disability</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">${result.monthlyDisability.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">${result.annualDisability.toLocaleString()}/year (tax-free)</p>
                </div>
              )}

              {result.monthlyInvestmentIncome > 0 && (
                <div className="border-2 border-green-300 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📈</span>
                    <span className="font-semibold text-gray-800">Investments</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600">${result.monthlyInvestmentIncome.toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">From ${result.totalInvestmentBalance.toLocaleString()} portfolio</p>
                </div>
              )}
            </div>

            {/* CRDP/CRSC Benefits */}
            {(result.isCRDPEligible || result.isCRSCEligible) && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.isCRDPEligible && (
                  <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                    <p className="font-semibold text-blue-800">✓ CRDP Eligible</p>
                    <p className="text-sm text-gray-600">Receiving full disability without pension offset</p>
                  </div>
                )}
                {result.isCRSCEligible && (
                  <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
                    <p className="font-semibold text-purple-800">⭐ CRSC Eligible</p>
                    <p className="text-sm text-gray-600">${result.crscAmount.toLocaleString()}/month available</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Budget Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">📝 Budget Overview</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Essential Expenses</p>
                <p className="text-2xl font-bold text-orange-600">${result.essentialExpenses.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Discretionary</p>
                <p className="text-2xl font-bold text-blue-600">${result.discretionaryExpenses.toLocaleString()}</p>
              </div>
            </div>

            {result.monthlySurplus < 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                <p className="font-semibold text-yellow-800">💡 Budget Recommendation</p>
                <p className="text-sm text-gray-700">
                  Consider reducing discretionary spending by ${Math.abs(result.monthlySurplus).toLocaleString()}/month to balance your budget.
                </p>
              </div>
            )}
          </div>

          {/* Timeline Preview */}
          {formData.yearsUntilRetirement > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">📅 Your Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">Current Age</p>
                    <p className="text-sm text-gray-600">Today</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{formData.currentAge}</p>
                </div>

                <div className="flex items-center justify-center">
                  <div className="h-12 w-1 bg-blue-300"></div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-semibold">Retirement Age</p>
                    <p className="text-sm text-gray-600">In {formData.yearsUntilRetirement} years</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">{formData.currentAge + formData.yearsUntilRetirement}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-6">
            <button
              onClick={() => setCurrentStage(4)}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
            >
              ← Back to Planning
            </button>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setCompletedStages(new Set());
                  setCurrentStage(1);
                }}
                className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50"
              >
                🔄 Start Over
              </button>

              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
              >
                🖨️ Print Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Investment Account Form Modal */}
      {showInvestmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              {editingAccount ? 'Edit' : 'Add'} Investment Account
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="account-name">Account Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  defaultValue={editingAccount?.name || ''}
                  id="account-name"
                  name="account-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="account-provider">Provider</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  defaultValue={editingAccount?.provider || ''}
                  id="account-provider"
                  name="account-provider"
                  placeholder="TSP, Fidelity, Vanguard, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="account-type">Account Type</label>
                <select className="w-full p-2 border rounded" id="account-type" name="account-type" defaultValue={editingAccount?.accountType || 'TSP'}>
                  <option value="TSP">TSP</option>
                  <option value="401k">401(k)</option>
                  <option value="IRA">IRA</option>
                  <option value="Roth IRA">Roth IRA</option>
                  <option value="Brokerage">Brokerage</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="account-balance">Current Balance</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  defaultValue={editingAccount?.balance || 0}
                  id="account-balance"
                  name="account-balance"
                  min="0"
                  step="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="account-contribution">Monthly Contribution</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  defaultValue={editingAccount?.monthlyContribution || 0}
                  id="account-contribution"
                  name="account-contribution"
                  min="0"
                  step="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="account-annual-return">Expected Annual Return (%)</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  id="account-annual-return"
                  name="account-annual-return"
                  defaultValue={editingAccount?.annualReturn || 7}
                  min="0"
                  max="20"
                  step="0.5"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowInvestmentForm(false);
                  setEditingAccount(null);
                }}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const name = (document.getElementById('account-name') as HTMLInputElement).value;
                  const provider = (document.getElementById('account-provider') as HTMLInputElement).value;
                  const accountType = (document.getElementById('account-type') as HTMLSelectElement).value as any;
                  const balance = parseFloat((document.getElementById('account-balance') as HTMLInputElement).value) || 0;
                  const monthlyContribution = parseFloat((document.getElementById('account-contribution') as HTMLInputElement).value) || 0;
                  const annualReturn = parseFloat((document.getElementById('account-return') as HTMLInputElement).value) || 7;

                  if (editingAccount) {
                    setFormData({
                      ...formData,
                      investmentAccounts: formData.investmentAccounts.map(a =>
                        a.id === editingAccount.id
                          ? { ...a, name, provider, accountType, balance, monthlyContribution, annualReturn }
                          : a
                      )
                    });
                  } else {
                    const newAccount: InvestmentAccount = {
                      id: Date.now().toString(),
                      name,
                      provider,
                      accountType,
                      balance,
                      monthlyContribution,
                      annualReturn
                    };
                    setFormData({
                      ...formData,
                      investmentAccounts: [...formData.investmentAccounts, newAccount]
                    });
                  }
                  setShowInvestmentForm(false);
                  setEditingAccount(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingAccount ? 'Save Changes' : 'Add Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CRSC Qualification Wizard Modal */}
      {showCRSCWizard && (
        <CRSCQualificationWizard
          initialData={{
            yearsOfService: formData.yearsOfService,
            receivesRetirementPay: formData.yearsOfService >= 20,
            hasVADisability: formData.disabilityRating > 0,
            disabilityRating: formData.disabilityRating
          }}
          onComplete={(qualifies, data) => {
            setFormData({
              ...formData,
              hasCombatRelatedDisability: qualifies
            });
            setCrscData(data);
            setCrscQualifies(qualifies);
            setShowCRSCWizard(false);
          }}
          onCancel={() => setShowCRSCWizard(false)}
        />
      )}
    </div>
  );
};

export default Retirement;
