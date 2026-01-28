// frontend/src/pages/RetirementTool.tsx
import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import Page from '../components/layout/Page';
import { retirementAPI } from '../services/api';
import { useAppStore } from '../store/appStore';
import './RetirementTool.css';
import type {
  InvestmentAccountInputModel,
  RetirementBudgetRequest,
  RetirementBudgetResponse,
} from '../types/models';

const defaultAccounts: InvestmentAccountInputModel[] = [
  { name: 'TSP', balance: 65000, monthly_contribution: 750, annual_growth_rate: 7 },
  { name: 'IRA', balance: 28000, monthly_contribution: 300, annual_growth_rate: 6.5 },
  { name: 'Roth IRA', balance: 22000, monthly_contribution: 250, annual_growth_rate: 7.5 },
  { name: 'Brokerage', balance: 12000, monthly_contribution: 150, annual_growth_rate: 6 },
];

const RetirementTool = () => {
  const user = useAppStore((s) => s.user);
  const [manualVeteranId, setManualVeteranId] = useState('');
  const veteranId = user?.id || manualVeteranId.trim() || null;

  const [currentAge, setCurrentAge] = useState(38);
  const [retirementAge, setRetirementAge] = useState(62);
  const [inflationRate, setInflationRate] = useState(2.5);
  const [incomeGoal, setIncomeGoal] = useState(6500);
  const [vaIncome, setVaIncome] = useState(1800);
  const [militaryIncome, setMilitaryIncome] = useState(900);
  const [socialIncome, setSocialIncome] = useState(1600);
  const [budgetSurplus, setBudgetSurplus] = useState(450);
  const [savingsRate, setSavingsRate] = useState(12);
  const [accounts, setAccounts] = useState<InvestmentAccountInputModel[]>(defaultAccounts);

  const [result, setResult] = useState<RetirementBudgetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const yearsToRetirement = Math.max(retirementAge - currentAge, 0);

  const handleAccountChange = (index: number, key: keyof InvestmentAccountInputModel, value: number) => {
    setAccounts((prev) =>
      prev.map((account, idx) =>
        idx === index
          ? { ...account, [key]: Number.isNaN(value) ? 0 : value }
          : account
      )
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!veteranId) {
      setError('Provide a Veteran ID to run the projection.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const payload: RetirementBudgetRequest = {
        current_age: currentAge,
        retirement_age: retirementAge,
        inflation_rate: inflationRate,
        retirement_income_goal: incomeGoal,
        accounts,
        va_disability_income: vaIncome,
        military_retirement_income: militaryIncome,
        social_security_income: socialIncome,
        monthly_budget_surplus: budgetSurplus,
        savings_rate,
      };
      const data = await retirementAPI.planBudget(veteranId, payload);
      setResult(data);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Unable to build plan';
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  const readinessColor = useMemo(() => {
    if (!result) return '#94a3b8';
    if (result.summary.readiness_score >= 85) return '#4ade80';
    if (result.summary.readiness_score >= 70) return '#facc15';
    return '#f97316';
  }, [result]);

  return (
    <Page title="Retirement & Budget Fusion">
      <div className="retirement-grid">
        <form className="retirement-form" onSubmit={handleSubmit}>
          <h2>Retirement Flight Plan</h2>
          <p>Blend your budget surplus, accounts, and guaranteed income into one mission plan.</p>

          {!user?.id && (
            <div className="form-group">
              <label htmlFor="vet-id">Veteran ID</label>
              <input
                id="vet-id"
                type="text"
                placeholder="VET_001"
                value={manualVeteranId}
                onChange={(event) => setManualVeteranId(event.target.value)}
              />
            </div>
          )}

          <div className="form-grid">
            <label>
              Current Age
              <input type="number" value={currentAge} onChange={(e) => setCurrentAge(Number(e.target.value))} />
            </label>
            <label>
              Retirement Age
              <input type="number" value={retirementAge} onChange={(e) => setRetirementAge(Number(e.target.value))} />
            </label>
            <label>
              Inflation %
              <input type="number" value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} step="0.1" />
            </label>
            <label>
              Monthly Goal ($)
              <input type="number" value={incomeGoal} onChange={(e) => setIncomeGoal(Number(e.target.value))} />
            </label>
            <label>
              Budget Surplus ($)
              <input type="number" value={budgetSurplus} onChange={(e) => setBudgetSurplus(Number(e.target.value))} />
            </label>
            <label>
              Savings Rate %
              <input type="number" value={savingsRate} onChange={(e) => setSavingsRate(Number(e.target.value))} step="0.5" />
            </label>
          </div>

          <div className="income-grid">
            <label>
              VA Disability (monthly)
              <input type="number" value={vaIncome} onChange={(e) => setVaIncome(Number(e.target.value))} />
            </label>
            <label>
              Military Retirement (monthly)
              <input type="number" value={militaryIncome} onChange={(e) => setMilitaryIncome(Number(e.target.value))} />
            </label>
            <label>
              Social Security (monthly)
              <input type="number" value={socialIncome} onChange={(e) => setSocialIncome(Number(e.target.value))} />
            </label>
          </div>

          <section>
            <h3>Investment Accounts</h3>
            {accounts.map((account, index) => (
              <div className="account-row" key={account.name}>
                <strong>{account.name}</strong>
                <div>
                  <label>
                    Balance
                    <input
                      type="number"
                      value={account.balance}
                      onChange={(e) => handleAccountChange(index, 'balance', Number(e.target.value))}
                    />
                  </label>
                  <label>
                    Monthly Contribution
                    <input
                      type="number"
                      value={account.monthly_contribution}
                      onChange={(e) => handleAccountChange(index, 'monthly_contribution', Number(e.target.value))}
                    />
                  </label>
                  <label>
                    Growth %
                    <input
                      type="number"
                      step="0.1"
                      value={account.annual_growth_rate}
                      onChange={(e) => handleAccountChange(index, 'annual_growth_rate', Number(e.target.value))}
                    />
                  </label>
                </div>
              </div>
            ))}
          </section>

          {error && <div className="error-banner">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Calculating…' : `Project ${yearsToRetirement} Year Plan`}
          </button>
        </form>

        <section className="retirement-results">
          {result ? (
            <>
              <div className="summary-grid">
                <article className="summary-card">
                  <p>Readiness Score</p>
                  <h3 style={{ color: readinessColor }}>{result.summary.readiness_score}</h3>
                  <span>{result.summary.readiness_band.replace('_', ' ').toUpperCase()}</span>
                </article>
                <article className="summary-card">
                  <p>Monthly Income vs Goal</p>
                  <h3>${result.summary.monthly_income.toLocaleString()}</h3>
                  <span>Goal ${result.summary.monthly_goal.toLocaleString()}</span>
                  <progress value={result.summary.goal_progress} max={1} />
                </article>
                <article className="summary-card">
                  <p>Projected Nest Egg</p>
                  <h3>${result.summary.projected_savings_real.toLocaleString()}</h3>
                  <span>Real dollars after inflation</span>
                </article>
              </div>

              <div className="budget-link">
                <div>
                  <p>Budget Surplus</p>
                  <strong>${result.budget_link.monthly_net_cashflow.toLocaleString()}</strong>
                </div>
                <div>
                  <p>Savings Rate</p>
                  <strong>{result.budget_link.savings_rate ?? '—'}%</strong>
                </div>
                <div>
                  <p>Years to Retirement</p>
                  <strong>{result.years_to_retirement}</strong>
                </div>
              </div>

              <div className="charts">
                <div className="chart-card">
                  <h4>Projected Savings Curve</h4>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={result.chart_data.savings_curve}>
                      <XAxis dataKey="age" tick={{ fill: '#cbd5f5' }} stroke="#94a3b8" />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} stroke="#94a3b8" />
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} labelFormatter={(label) => `Age ${label}`} />
                      <Line type="monotone" dataKey="balance" stroke="#38bdf8" strokeWidth={3} dot={false} />
                      <Line type="monotone" dataKey="inflation_adjusted_balance" stroke="#f472b6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-card">
                  <h4>Income Mix</h4>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={result.chart_data.income_mix}>
                      <XAxis dataKey="label" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="value" fill="#34d399" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="accounts-grid">
                {result.accounts.map((account) => (
                  <article key={account.name} className="account-card">
                    <header>
                      <h4>{account.name}</h4>
                      <span>{(account.share_of_total * 100).toFixed(1)}% of total</span>
                    </header>
                    <p>Projected: ${account.inflation_adjusted_balance.toLocaleString()}</p>
                    <p>Contributions: ${account.contribution_component.toLocaleString()}</p>
                    <p>Growth on current savings: ${account.current_component.toLocaleString()}</p>
                  </article>
                ))}
              </div>

              <div className="insights-grid">
                <div>
                  <h4>Goals</h4>
                  <ul>
                    {result.goals.map((goal) => (
                      <li key={goal}>{goal}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>Insights</h4>
                  <ul>
                    {result.insights.map((insight) => (
                      <li key={insight}>{insight}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="placeholder-card">
              <p>Run the projection to see personalized readiness, charts, and goals.</p>
            </div>
          )}
        </section>
      </div>
    </Page>
  );
};

export default RetirementTool;
