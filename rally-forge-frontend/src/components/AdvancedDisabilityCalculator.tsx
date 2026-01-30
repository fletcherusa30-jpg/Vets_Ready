import React, { useState, useEffect } from 'react';
import { useDisabilityContext, ServiceConnectedCondition } from '../contexts/DisabilityContext';

interface Condition {
  id: string;
  name: string;
  rating: number;
  isBilateral: boolean;
  bodyPart: 'arm' | 'leg' | 'other' | '';
}

interface SMCQualifier {
  lossOfUse: boolean;
  anatomicalLoss: boolean;
  blindness: boolean;
  aidAndAttendance: boolean;
  housebound: boolean;
  additionalInfo: string;
}

export const AdvancedDisabilityCalculator: React.FC = () => {
  // Connect to shared context
  const { setServiceConnectedConditions, setCombinedRating: setContextCombinedRating } = useDisabilityContext();

  const [conditions, setConditions] = useState<Condition[]>([
    { id: '1', name: '', rating: 0, isBilateral: false, bodyPart: '' }
  ]);
  const [smcQualifiers, setSMCQualifiers] = useState<SMCQualifier>({
    lossOfUse: false,
    anatomicalLoss: false,
    blindness: false,
    aidAndAttendance: false,
    housebound: false,
    additionalInfo: ''
  });
  const [combinedRating, setCombinedRating] = useState(0);
  const [smcLevel, setSMCLevel] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [calculationSteps, setCalculationSteps] = useState<string[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [dependents, setDependents] = useState({ spouse: false, children: 0, parents: 0 });

  // 2026 VA Payment Rates (38 CFR § 4.26)
  const paymentRates: { [key: number]: { alone: number; withSpouse: number; perChild: number } } = {
    0: { alone: 0, withSpouse: 0, perChild: 0 },
    10: { alone: 171, withSpouse: 171, perChild: 0 },
    20: { alone: 338, withSpouse: 338, perChild: 0 },
    30: { alone: 524, withSpouse: 573, perChild: 27 },
    40: { alone: 755, withSpouse: 829, perChild: 38 },
    50: { alone: 1075, withSpouse: 1171, perChild: 54 },
    60: { alone: 1361, withSpouse: 1478, perChild: 68 },
    70: { alone: 1716, withSpouse: 1861, perChild: 86 },
    80: { alone: 1995, withSpouse: 2161, perChild: 99 },
    90: { alone: 2241, withSpouse: 2428, perChild: 112 },
    100: { alone: 3737, withSpouse: 3946, perChild: 122 }
  };

  // SMC Rates (2026) - 38 CFR § 3.350
  const smcRates: { [key: string]: number } = {
    'k': 127,  // SMC-K (Loss of one limb or creative organ)
    'l': 4194, // SMC-L (Loss of use of both feet or hands)
    'm': 4599, // SMC-M (Requires aid and attendance)
    'n': 5196, // SMC-N (Blind in both eyes)
    'o': 7711, // SMC-O (Multiple severe disabilities)
    'r': 3946  // SMC-R (Housebound, 100% rating)
  };

  const addCondition = () => {
    setConditions([...conditions, { id: Date.now().toString(), name: '', rating: 0, isBilateral: false, bodyPart: '' }]);
  };

  const removeCondition = (id: string) => {
    setConditions(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, field: keyof Condition, value: any) => {
    setConditions(conditions.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const calculateCombinedRating = () => {
    const steps: string[] = [];
    let validConditions = conditions.filter(c => c.rating > 0);

    if (validConditions.length === 0) {
      setCombinedRating(0);
      setCalculationSteps(['No disabilities entered. Combined rating: 0%']);
      return;
    }

    steps.push('📊 **VA Combined Rating Calculation (38 CFR § 4.26)**');
    steps.push('');

    // Apply Bilateral Factor (38 CFR § 4.26)
    const bilateralConditions = validConditions.filter(c => c.isBilateral && (c.bodyPart === 'arm' || c.bodyPart === 'leg'));
    if (bilateralConditions.length >= 2) {
      const bilateralSum = bilateralConditions.reduce((sum, c) => sum + c.rating, 0);
      const bilateralFactor = Math.round(bilateralSum * 0.1);

      steps.push(`🔗 **Bilateral Factor Applied (38 CFR § 4.26)**`);
      steps.push(`When you have disabilities affecting both arms or both legs, VA adds 10% of the combined value of these ratings.`);
      steps.push(`Bilateral disabilities: ${bilateralConditions.map(c => `${c.name} (${c.rating}%)`).join(', ')}`);
      steps.push(`Sum: ${bilateralSum}% × 10% = ${bilateralFactor}% additional`);
      steps.push('');

      validConditions.push({ id: 'bilateral', name: 'Bilateral Factor', rating: bilateralFactor, isBilateral: false, bodyPart: '' });
    }

    // Sort ratings highest to lowest
    const sortedRatings = validConditions.map(c => ({ name: c.name, rating: c.rating })).sort((a, b) => b.rating - a.rating);

    steps.push('**Step 1: Sort disabilities from highest to lowest**');
    sortedRatings.forEach((c, i) => {
      steps.push(`${i + 1}. ${c.name || 'Unnamed condition'}: ${c.rating}%`);
    });
    steps.push('');

    // Calculate using VA Math
    steps.push('**Step 2: Apply VA Math (Efficiency Method)**');
    steps.push('VA uses "percentages of percentages" - each additional rating is applied to the remaining efficiency.');
    steps.push('');

    let combined = sortedRatings[0].rating;
    steps.push(`Start with highest rating: ${combined}%`);
    steps.push(`Remaining efficiency: ${100 - combined}%`);
    steps.push('');

    for (let i = 1; i < sortedRatings.length; i++) {
      const efficiency = 100 - combined;
      const addition = (sortedRatings[i].rating * efficiency) / 100;
      const oldCombined = combined;
      combined = combined + addition;

      steps.push(`Add ${sortedRatings[i].name || 'condition'} (${sortedRatings[i].rating}%):`);
      steps.push(`  ${sortedRatings[i].rating}% of ${efficiency}% efficiency = ${addition.toFixed(2)}%`);
      steps.push(`  ${oldCombined}% + ${addition.toFixed(2)}% = ${combined.toFixed(2)}%`);
      steps.push('');
    }

    // Round to nearest 10
    const rounded = Math.round(combined / 10) * 10;
    steps.push('**Step 3: Round to nearest 10% (38 CFR § 4.26)**');
    steps.push(`Exact combined: ${combined.toFixed(2)}%`);
    steps.push(`Rounded to: **${rounded}%**`);
    steps.push('');
    steps.push(`📌 **Final Combined Rating: ${rounded}%**`);

    setCombinedRating(rounded);
    setCalculationSteps(steps);
  };

  const calculateSMC = () => {
    let smc = '';
    let smcPayment = 0;
    const steps: string[] = [];

    steps.push('');
    steps.push('💰 **Special Monthly Compensation (SMC) Analysis**');
    steps.push('Reference: 38 CFR § 3.350');
    steps.push('');

    // Check for SMC qualifications
    if (smcQualifiers.anatomicalLoss || smcQualifiers.lossOfUse) {
      if (smcQualifiers.anatomicalLoss && smcQualifiers.lossOfUse) {
        smc = 'SMC-L or higher';
        smcPayment = smcRates['l'];
        steps.push('✅ **Qualifies for SMC-L**: Loss of use of both feet or both hands');
        steps.push(`Additional payment: $${smcPayment.toLocaleString()}/month`);
      } else {
        smc = 'SMC-K';
        smcPayment = smcRates['k'];
        steps.push('✅ **Qualifies for SMC-K**: Loss of use of one limb or creative organ');
        steps.push(`Additional payment: $${smcPayment.toLocaleString()}/month`);
      }
    }

    if (smcQualifiers.blindness) {
      if (smc) {
        smc = 'SMC-N or higher';
        smcPayment = Math.max(smcPayment, smcRates['n']);
      } else {
        smc = 'SMC-N';
        smcPayment = smcRates['n'];
      }
      steps.push('✅ **Qualifies for SMC-N**: Blind in both eyes');
      steps.push(`Payment: $${smcRates['n'].toLocaleString()}/month`);
    }

    if (smcQualifiers.aidAndAttendance) {
      if (combinedRating === 100) {
        smc = 'SMC-M or higher';
        smcPayment = Math.max(smcPayment, smcRates['m']);
        steps.push('✅ **Qualifies for SMC-M**: 100% rating + requires aid and attendance');
        steps.push(`Payment: $${smcRates['m'].toLocaleString()}/month`);
      }
    }

    if (smcQualifiers.housebound && combinedRating === 100) {
      smc = 'SMC-R';
      smcPayment = Math.max(smcPayment, smcRates['r']);
      steps.push('✅ **Qualifies for SMC-R**: 100% rating + housebound');
      steps.push(`Payment: $${smcRates['r'].toLocaleString()}/month`);
    }

    if (!smc) {
      steps.push('ℹ️ Based on the information provided, you do not currently qualify for SMC.');
      steps.push('SMC is available for severe disabilities such as:');
      steps.push('  • Loss of use of limbs');
      steps.push('  • Blindness');
      steps.push('  • Need for aid and attendance');
      steps.push('  • Housebound status');
    }

    setSMCLevel(smc);
    setCalculationSteps([...calculationSteps, ...steps]);
    return smcPayment;
  };

  const calculateTotalPayment = () => {
    if (combinedRating === 0) {
      setMonthlyPayment(0);
      return;
    }

    const rate = paymentRates[combinedRating];
    if (!rate) {
      setMonthlyPayment(0);
      return;
    }

    let payment = dependents.spouse ? rate.withSpouse : rate.alone;
    payment += rate.perChild * dependents.children;

    // Add SMC if applicable
    const smcPayment = calculateSMC();
    payment += smcPayment;

    const steps: string[] = [];
    steps.push('');
    steps.push('💵 **Monthly Compensation Breakdown**');
    steps.push('');
    steps.push(`Base rate (${combinedRating}%): $${(dependents.spouse ? rate.withSpouse : rate.alone).toLocaleString()}`);
    if (dependents.spouse) {
      steps.push(`  Includes spouse dependent`);
    }
    if (dependents.children > 0) {
      steps.push(`Children (${dependents.children} × $${rate.perChild}): $${(rate.perChild * dependents.children).toLocaleString()}`);
    }
    if (smcPayment > 0) {
      steps.push(`SMC (${smcLevel}): $${smcPayment.toLocaleString()}`);
    }
    steps.push('');
    steps.push(`📌 **Total Monthly Compensation: $${payment.toLocaleString()}**`);
    steps.push('');
    steps.push('---');
    steps.push('📚 **References:**');
    steps.push('• 38 CFR § 4.26 - Combined ratings table');
    steps.push('• 38 CFR § 3.350 - Special monthly compensation (SMC)');
    steps.push('• VA.gov: https://www.va.gov/disability/compensation-rates/');
    steps.push('• Cornell Law: https://www.law.cornell.edu/cfr/text/38/4.26');

    setCalculationSteps([...calculationSteps, ...steps]);
    setMonthlyPayment(payment);
  };

  useEffect(() => {
    calculateCombinedRating();
  }, [conditions]);

  useEffect(() => {
    if (combinedRating > 0) {
      calculateTotalPayment();
    }
  }, [combinedRating, dependents, smcQualifiers]);

  // Sync to shared context whenever conditions or combined rating change
  useEffect(() => {
    const validConditions = conditions.filter(c => c.name && c.rating > 0);
    const serviceConnected: ServiceConnectedCondition[] = validConditions.map(c => ({
      id: c.id,
      name: c.name,
      rating: c.rating,
      isBilateral: c.isBilateral,
      bodyPart: c.bodyPart,
      description: `${c.rating}% rating${c.isBilateral ? ' (Bilateral)' : ''}`
    }));

    setServiceConnectedConditions(serviceConnected);
    setContextCombinedRating(combinedRating);
  }, [conditions, combinedRating]);

  return (
    <div className="bg-white rounded-lg shadow-2xl p-8 border-t-4 border-purple-600">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">🎖️</span>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Advanced VA Disability Calculator</h2>
          <p className="text-gray-600">With SMC, Bilateral Factor, and Full Policy Citations</p>
        </div>
      </div>

      {/* Conditions Input */}
      <div className="space-y-4 mb-6">
        <h3 className="text-xl font-bold text-gray-800">Your Service-Connected Disabilities</h3>
        {conditions.map((condition, index) => (
          <div key={condition.id} className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition Name</label>
                <input
                  type="text"
                  value={condition.name}
                  onChange={(e) => updateCondition(condition.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., PTSD, Lower Back Pain"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating %</label>
                <select
                  value={condition.rating}
                  onChange={(e) => updateCondition(condition.id, 'rating', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value={0}>0%</option>
                  <option value={10}>10%</option>
                  <option value={20}>20%</option>
                  <option value={30}>30%</option>
                  <option value={40}>40%</option>
                  <option value={50}>50%</option>
                  <option value={60}>60%</option>
                  <option value={70}>70%</option>
                  <option value={80}>80%</option>
                  <option value={90}>90%</option>
                  <option value={100}>100%</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Body Part</label>
                <select
                  value={condition.bodyPart}
                  onChange={(e) => updateCondition(condition.id, 'bodyPart', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Other</option>
                  <option value="arm">Arm</option>
                  <option value="leg">Leg</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bilateral?</label>
                <input
                  type="checkbox"
                  checked={condition.isBilateral}
                  onChange={(e) => updateCondition(condition.id, 'isBilateral', e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  disabled={condition.bodyPart !== 'arm' && condition.bodyPart !== 'leg'}
                />
                <span className="ml-2 text-sm text-gray-600">Paired limb</span>
              </div>
              <div className="md:col-span-2">
                {conditions.length > 1 && (
                  <button
                    onClick={() => removeCondition(condition.id)}
                    className="w-full bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 font-bold"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <button
          onClick={addCondition}
          className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-bold"
        >
          + Add Another Disability
        </button>
      </div>

      {/* Dependents */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Dependents</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="spouse"
              checked={dependents.spouse}
              onChange={(e) => setDependents({ ...dependents, spouse: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="spouse" className="ml-2 text-gray-700 font-medium">Spouse</label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Children under 18</label>
            <input
              type="number"
              min="0"
              max="10"
              value={dependents.children}
              onChange={(e) => setDependents({ ...dependents, children: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* SMC Qualifiers */}
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Special Monthly Compensation (SMC) Qualifiers</h3>
        <p className="text-sm text-gray-600 mb-4">Check all that apply to your situation</p>
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="lossOfUse"
              checked={smcQualifiers.lossOfUse}
              onChange={(e) => setSMCQualifiers({ ...smcQualifiers, lossOfUse: e.target.checked })}
              className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
            />
            <label htmlFor="lossOfUse" className="ml-2 text-gray-700">Loss of use of one or more limbs</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="anatomicalLoss"
              checked={smcQualifiers.anatomicalLoss}
              onChange={(e) => setSMCQualifiers({ ...smcQualifiers, anatomicalLoss: e.target.checked })}
              className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
            />
            <label htmlFor="anatomicalLoss" className="ml-2 text-gray-700">Anatomical loss or loss of creative organ</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="blindness"
              checked={smcQualifiers.blindness}
              onChange={(e) => setSMCQualifiers({ ...smcQualifiers, blindness: e.target.checked })}
              className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
            />
            <label htmlFor="blindness" className="ml-2 text-gray-700">Blind in both eyes (5/200 or worse)</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="aidAndAttendance"
              checked={smcQualifiers.aidAndAttendance}
              onChange={(e) => setSMCQualifiers({ ...smcQualifiers, aidAndAttendance: e.target.checked })}
              className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
            />
            <label htmlFor="aidAndAttendance" className="ml-2 text-gray-700">Require aid and attendance of another person</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="housebound"
              checked={smcQualifiers.housebound}
              onChange={(e) => setSMCQualifiers({ ...smcQualifiers, housebound: e.target.checked })}
              className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
            />
            <label htmlFor="housebound" className="ml-2 text-gray-700">Permanently housebound</label>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-8 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-6xl font-bold mb-2">{combinedRating}%</div>
            <div className="text-xl">Combined Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{smcLevel || 'None'}</div>
            <div className="text-xl">SMC Level</div>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">${monthlyPayment.toLocaleString()}</div>
            <div className="text-xl">Monthly Payment</div>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <button
        onClick={() => setShowExplanation(!showExplanation)}
        className="w-full bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 font-bold mb-4"
      >
        {showExplanation ? '▼ Hide' : '▶'} Step-by-Step Calculation & Policy Citations
      </button>

      {showExplanation && (
        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
          <div className="prose max-w-none">
            {calculationSteps.map((step, index) => (
              <div key={index} className="mb-2">
                {step.startsWith('**') ? (
                  <p className="font-bold text-lg text-gray-900 mt-4 mb-2">{step.replace(/\*\*/g, '')}</p>
                ) : step.startsWith('📌') || step.startsWith('✅') || step.startsWith('🔗') || step.startsWith('ℹ️') ? (
                  <p className="font-bold text-blue-900 bg-blue-50 p-3 rounded">{step}</p>
                ) : step === '---' ? (
                  <hr className="my-4 border-gray-300" />
                ) : step === '' ? (
                  <br />
                ) : (
                  <p className="text-gray-700">{step}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
