import React, { useState, useEffect } from 'react';

export const Calculator: React.FC = () => {
  const [conditions, setConditions] = useState<Array<{ name: string; rating: number }>>([
    { name: '', rating: 0 }
  ]);
  const [combinedRating, setCombinedRating] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [dependents, setDependents] = useState({ spouse: false, children: 0 });

  // VA payment rates for 2026 (example values)
  const paymentRates: { [key: number]: { alone: number; withSpouse: number; perChild: number } } = {
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

  const calculateCombinedRating = () => {
    if (conditions.length === 0 || conditions.every(c => c.rating === 0)) {
      setCombinedRating(0);
      return;
    }

    const validRatings = conditions
      .filter(c => c.rating > 0)
      .map(c => c.rating)
      .sort((a, b) => b - a);

    if (validRatings.length === 0) {
      setCombinedRating(0);
      return;
    }

    let combined = validRatings[0];
    for (let i = 1; i < validRatings.length; i++) {
      const efficiency = 100 - combined;
      combined = combined + (validRatings[i] * efficiency) / 100;
    }

    // Round to nearest 10
    const rounded = Math.round(combined / 10) * 10;
    setCombinedRating(rounded);
  };

  const calculatePayment = () => {
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
    setMonthlyPayment(payment);
  };

  useEffect(() => {
    calculateCombinedRating();
  }, [conditions]);

  useEffect(() => {
    calculatePayment();
  }, [combinedRating, dependents]);

  const addCondition = () => {
    setConditions([...conditions, { name: '', rating: 0 }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: 'name' | 'rating', value: string | number) => {
    const updated = [...conditions];
    if (field === 'name') {
      updated[index].name = value as string;
    } else {
      updated[index].rating = Number(value);
    }
    setConditions(updated);
  };

  return (
    <div className="bg-white rounded-lg shadow-2xl p-8 border-t-4 border-blue-600">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">🎖️</span>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">VA Disability Calculator</h2>
          <p className="text-gray-600">Calculate your combined disability rating and estimated monthly payment</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Conditions */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Service-Connected Conditions</h3>
          {conditions.map((condition, index) => (
            <div key={index} className="flex gap-3 mb-3 items-center animate-fadeIn">
              <input
                type="text"
                placeholder="Condition (e.g., PTSD, Tinnitus)"
                value={condition.name}
                onChange={(e) => updateCondition(index, 'name', e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={condition.rating}
                onChange={(e) => updateCondition(index, 'rating', e.target.value)}
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="0">0%</option>
                <option value="10">10%</option>
                <option value="20">20%</option>
                <option value="30">30%</option>
                <option value="40">40%</option>
                <option value="50">50%</option>
                <option value="60">60%</option>
                <option value="70">70%</option>
                <option value="80">80%</option>
                <option value="90">90%</option>
                <option value="100">100%</option>
              </select>
              {conditions.length > 1 && (
                <button
                  onClick={() => removeCondition(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addCondition}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            + Add Condition
          </button>
        </div>

        {/* Dependents */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Dependents</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={dependents.spouse}
                onChange={(e) => setDependents({ ...dependents, spouse: e.target.checked })}
                className="w-5 h-5 text-blue-600"
              />
              <span className="text-gray-700">Spouse</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="text-gray-700">Children under 18:</label>
              <input
                type="number"
                min="0"
                max="10"
                value={dependents.children}
                onChange={(e) => setDependents({ ...dependents, children: Number(e.target.value) })}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="border-t pt-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2">Combined Disability Rating</p>
                <p className="text-5xl font-bold text-blue-900 animate-pulse">{combinedRating}%</p>
              </div>
              <div className="text-center">
                <p className="text-gray-600 text-sm mb-2">Estimated Monthly Payment</p>
                <p className="text-5xl font-bold text-green-700 animate-pulse">
                  ${monthlyPayment.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-3xl font-bold text-gray-800">
                Annual: ${(monthlyPayment * 12).toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                * Rates are estimates based on 2026 VA payment schedule
              </p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> The VA uses a special formula to combine multiple disability ratings.
            This calculator provides an estimate based on current VA payment rates. Actual payments may vary
            based on additional factors.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>
    </div>
  );
};
