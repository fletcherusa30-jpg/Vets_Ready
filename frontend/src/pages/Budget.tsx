import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BudgetSummary, IncomeSource, ExpenseItem, SavingsGoal, Insights, IncomeSourceType, ExpenseCategory } from '../types/budget';
import './Budget.css';

const Budget: React.FC = () => {
  const [veteranId] = useState<number>(1); // In production, get from auth context
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'income' | 'expenses' | 'goals' | 'subscriptions' | 'scenarios'>('overview');

  useEffect(() => {
    fetchBudgetData();
  }, [veteranId]);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      // Ensure budget exists
      await axios.post(`${API_URL}/api/budgets`, { veteran_id: veteranId });

      // Fetch summary and insights
      const [summaryRes, insightsRes] = await Promise.all([
        axios.get(`${API_URL}/api/budget/summary/${veteranId}`),
        axios.get(`${API_URL}/api/budget/insights/${veteranId}`)
      ]);

      setSummary(summaryRes.data);
      setInsights(insightsRes.data);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="budget-container"><p>Loading budget data...</p></div>;
  }

  return (
    <div className="budget-container">
      <div className="budget-header">
        <h1>Financial Command Center</h1>
        <p className="subtitle">Professional budget management for veterans</p>
      </div>

      <div className="budget-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'income' ? 'active' : ''}`}
          onClick={() => setActiveTab('income')}
        >
          Income
        </button>
        <button
          className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses
        </button>
        <button
          className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          Goals
        </button>
        <button
          className={`tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          Subscriptions
        </button>
        <button
          className={`tab-btn ${activeTab === 'scenarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('scenarios')}
        >
          Scenarios
        </button>
      </div>

      {activeTab === 'overview' && summary && insights && (
        <OverviewTab summary={summary} insights={insights} />
      )}

      {activeTab === 'income' && (
        <IncomeTab veteranId={veteranId} onDataChange={fetchBudgetData} />
      )}

      {activeTab === 'expenses' && (
        <ExpensesTab veteranId={veteranId} onDataChange={fetchBudgetData} />
      )}

      {activeTab === 'goals' && (
        <GoalsTab veteranId={veteranId} onDataChange={fetchBudgetData} />
      )}

      {activeTab === 'subscriptions' && (
        <SubscriptionsTab veteranId={veteranId} onDataChange={fetchBudgetData} />
      )}

      {activeTab === 'scenarios' && (
        <ScenariosTab veteranId={veteranId} />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ summary: BudgetSummary; insights: Insights }> = ({ summary, insights }) => {
  const incomeColor = '#10b981'; // Green
  const expenseColor = '#ef4444'; // Red
  const savingsColor = '#3b82f6'; // Blue

  return (
    <div className="tab-content">
      <div className="dashboard-grid">
        {/* Key Metrics Cards */}
        <div className="metric-card income-card">
          <div className="metric-header">Monthly Income</div>
          <div className="metric-value" style={{ color: incomeColor }}>
            ${summary.monthly_income.toFixed(2)}
          </div>
        </div>

        <div className="metric-card expense-card">
          <div className="metric-header">Monthly Expenses</div>
          <div className="metric-value" style={{ color: expenseColor }}>
            ${summary.monthly_expenses.toFixed(2)}
          </div>
        </div>

        <div className="metric-card savings-card">
          <div className="metric-header">Net Cashflow</div>
          <div className="metric-value" style={{ color: summary.net_cashflow >= 0 ? incomeColor : expenseColor }}>
            ${summary.net_cashflow.toFixed(2)}
          </div>
        </div>

        <div className="metric-card rate-card">
          <div className="metric-header">Savings Rate</div>
          <div className="metric-value" style={{ color: savingsColor }}>
            {summary.savings_rate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Spending Alerts */}
      {insights.spending_alerts.length > 0 && (
        <div className="alerts-section">
          <h3>Financial Alerts</h3>
          <div className="alerts-list">
            {insights.spending_alerts.map((alert, idx) => (
              <div key={idx} className={`alert alert-${alert.severity}`}>
                <div className="alert-title">{alert.message}</div>
                {alert.amount && <div className="alert-amount">${alert.amount.toFixed(2)}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="breakdown-section">
        <h3>Spending by Category</h3>
        <div className="category-list">
          {summary.category_breakdown.map((cat, idx) => (
            <div key={idx} className="category-item">
              <div className="category-name">{cat.category}</div>
              <div className="category-bar">
                <div
                  className="category-fill"
                  style={{ width: `${cat.percentage}%` }}
                ></div>
              </div>
              <div className="category-amount">
                ${cat.amount.toFixed(2)} ({cat.percentage.toFixed(1)}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Goals Progress */}
      <div className="goals-section">
        <h3>Goals Progress</h3>
        <div className="goals-summary">
          <div className="goal-stat">
            <span className="label">Active Goals:</span>
            <span className="value">{summary.active_goals}</span>
          </div>
          <div className="goal-stat">
            <span className="label">Total Goal Amount:</span>
            <span className="value">${summary.total_goal_amount.toFixed(2)}</span>
          </div>
          <div className="goal-stat">
            <span className="label">Current Progress:</span>
            <span className="value">${summary.current_goal_progress.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <div className="recommendations-section">
          <h3>Financial Recommendations</h3>
          <div className="recommendations-list">
            {insights.recommendations.map((rec, idx) => (
              <div key={idx} className={`recommendation recommendation-${rec.priority}`}>
                <div className="rec-header">
                  <span className="rec-title">{rec.title}</span>
                  <span className="rec-priority">{rec.priority}</span>
                </div>
                <div className="rec-description">{rec.description}</div>
                <div className="rec-action">{rec.action}</div>
                {rec.potential_savings && (
                  <div className="rec-savings">
                    Potential Savings: ${rec.potential_savings.toFixed(2)}/month
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Veteran-Specific Insights */}
      {insights.veteran_specific_insights.length > 0 && (
        <div className="veteran-insights-section">
          <h3>Veteran-Specific Guidance</h3>
          <div className="insights-list">
            {insights.veteran_specific_insights.map((insight, idx) => (
              <div key={idx} className="veteran-insight">
                <div className="insight-title">{insight.title}</div>
                <div className="insight-description">{insight.description}</div>
                <div className="insight-action">{insight.action}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Income Tab Component
const IncomeTab: React.FC<{ veteranId: number; onDataChange: () => void }> = ({ veteranId, onDataChange }) => {
  const [incomes, setIncomes] = useState<IncomeSource[]>([]);
  const [newIncome, setNewIncome] = useState({
    source_type: IncomeSourceType.PRIMARY_EMPLOYMENT,
    monthly_amount: 0,
    is_irregular: false,
    description: ''
  });

  useEffect(() => {
    fetchIncomes();
  }, [veteranId]);

  const fetchIncomes = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.get(`${API_URL}/api/income/${veteranId}`);
      setIncomes(res.data);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    }
  };

  const handleAddIncome = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await axios.post(`${API_URL}/api/income`, { veteran_id: veteranId, ...newIncome });
      setNewIncome({
        source_type: IncomeSourceType.PRIMARY_EMPLOYMENT,
        monthly_amount: 0,
        is_irregular: false,
        description: ''
      });
      fetchIncomes();
      onDataChange();
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };

  const handleDelete = async (incomeId: number) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await axios.delete(`${API_URL}/api/income/${incomeId}`);
      fetchIncomes();
      onDataChange();
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  const totalIncome = incomes.reduce((sum, inc) => sum + inc.monthly_amount, 0);

  return (
    <div className="tab-content">
      <div className="form-section">
        <h3>Add Income Source</h3>
        <div className="form-group">
          <label>Source Type</label>
          <select
            value={newIncome.source_type}
            onChange={(e) => setNewIncome({ ...newIncome, source_type: e.target.value as IncomeSourceType })}
          >
            {Object.values(IncomeSourceType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Monthly Amount</label>
          <input
            type="number"
            value={newIncome.monthly_amount}
            onChange={(e) => setNewIncome({ ...newIncome, monthly_amount: parseFloat(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            value={newIncome.description}
            onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
          />
        </div>
        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={newIncome.is_irregular}
              onChange={(e) => setNewIncome({ ...newIncome, is_irregular: e.target.checked })}
            />
            Irregular (Annual Amount)
          </label>
        </div>
        <button className="btn btn-primary" onClick={handleAddIncome}>
          Add Income Source
        </button>
      </div>

      <div className="list-section">
        <h3>Income Sources (Total: ${totalIncome.toFixed(2)}/month)</h3>
        <div className="income-list">
          {incomes.map((income) => (
            <div key={income.id} className="income-item">
              <div className="item-header">
                <div className="item-title">{income.source_type}</div>
                <div className="item-amount">${income.monthly_amount.toFixed(2)}/month</div>
              </div>
              {income.description && <div className="item-description">{income.description}</div>}
              {income.is_irregular && <div className="item-badge">Irregular</div>}
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(income.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Expenses Tab Component
const ExpensesTab: React.FC<{ veteranId: number; onDataChange: () => void }> = ({ veteranId, onDataChange }) => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [newExpense, setNewExpense] = useState({
    category: ExpenseCategory.OTHER,
    description: '',
    monthly_amount: 0,
    is_debt_payment: false
  });

  useEffect(() => {
    fetchExpenses();
  }, [veteranId]);

  const fetchExpenses = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.get(`${API_URL}/api/expenses/${veteranId}`);
      setExpenses(res.data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const handleAddExpense = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await axios.post(`${API_URL}/api/expenses`, { veteran_id: veteranId, ...newExpense });
      setNewExpense({
        category: ExpenseCategory.OTHER,
        description: '',
        monthly_amount: 0,
        is_debt_payment: false
      });
      fetchExpenses();
      onDataChange();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleDelete = async (expenseId: number) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await axios.delete(`${API_URL}/api/expenses/${expenseId}`);
      fetchExpenses();
      onDataChange();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.monthly_amount, 0);
  const debtPayments = expenses
    .filter((exp) => exp.is_debt_payment)
    .reduce((sum, exp) => sum + exp.monthly_amount, 0);

  return (
    <div className="tab-content">
      <div className="form-section">
        <h3>Add Expense</h3>
        <div className="form-group">
          <label>Category</label>
          <select
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })}
          >
            {Object.values(ExpenseCategory).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            value={newExpense.description}
            onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Monthly Amount</label>
          <input
            type="number"
            value={newExpense.monthly_amount}
            onChange={(e) => setNewExpense({ ...newExpense, monthly_amount: parseFloat(e.target.value) })}
          />
        </div>
        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={newExpense.is_debt_payment}
              onChange={(e) => setNewExpense({ ...newExpense, is_debt_payment: e.target.checked })}
            />
            Is Debt Payment
          </label>
        </div>
        <button className="btn btn-primary" onClick={handleAddExpense}>
          Add Expense
        </button>
      </div>

      <div className="list-section">
        <h3>
          Expenses (Total: ${totalExpenses.toFixed(2)}/month
          {debtPayments > 0 && ` - Debt: ${debtPayments.toFixed(2)}/month`})
        </h3>
        <div className="expense-list">
          {expenses.map((expense) => (
            <div key={expense.id} className="expense-item">
              <div className="item-header">
                <div className="item-title">{expense.category}</div>
                <div className="item-amount">${expense.monthly_amount.toFixed(2)}</div>
              </div>
              <div className="item-description">{expense.description}</div>
              {expense.is_debt_payment && <div className="item-badge debt-badge">Debt Payment</div>}
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(expense.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Goals Tab Component
const GoalsTab: React.FC<{ veteranId: number; onDataChange: () => void }> = ({ veteranId, onDataChange }) => {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  useEffect(() => {
    fetchGoals();
  }, [veteranId]);

  const fetchGoals = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.get(`${API_URL}/api/goals/${veteranId}`);
      setGoals(res.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  return (
    <div className="tab-content">
      <div className="goals-grid">
        {goals.map((goal) => {
          const progress = (goal.current_amount / goal.target_amount) * 100;
          return (
            <div key={goal.id} className="goal-card">
              <h4>{goal.name}</h4>
              <p className="goal-type">{goal.goal_type}</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
              </div>
              <div className="progress-text">
                ${goal.current_amount.toFixed(2)} of ${goal.target_amount.toFixed(2)} ({Math.round(progress)}%)
              </div>
              <div className="goal-status" style={{ color: progress >= 100 ? '#10b981' : goal.status === 'On Track' ? '#3b82f6' : '#f59e0b' }}>
                {goal.status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Subscriptions Tab Component
const SubscriptionsTab: React.FC<{ veteranId: number; onDataChange: () => void }> = ({ veteranId, onDataChange }) => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    fetchSubscriptions();
  }, [veteranId]);

  const fetchSubscriptions = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.get(`${API_URL}/api/subscriptions/${veteranId}`);
      setSubscriptions(res.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const totalCost = subscriptions.reduce((sum, sub) => sum + sub.monthly_cost, 0);
  const lowUsage = subscriptions.filter((s) => s.usage_level === 'Low' || s.usage_level === 'None');

  return (
    <div className="tab-content">
      <div className="subscription-summary">
        <div className="summary-stat">
          <span className="label">Total Monthly Cost:</span>
          <span className="value">${totalCost.toFixed(2)}</span>
        </div>
        <div className="summary-stat">
          <span className="label">Low Usage Subscriptions:</span>
          <span className="value">{lowUsage.length}</span>
        </div>
      </div>

      <div className="subscription-list">
        {subscriptions.map((sub) => (
          <div key={sub.id} className={`subscription-item usage-${sub.usage_level.toLowerCase()}`}>
            <div className="sub-header">
              <div className="sub-name">{sub.name}</div>
              <div className="sub-cost">${sub.monthly_cost.toFixed(2)}/month</div>
            </div>
            <div className="sub-details">
              <span className="sub-cycle">{sub.billing_cycle}</span>
              <span className={`usage-badge usage-${sub.usage_level.toLowerCase()}`}>{sub.usage_level} Usage</span>
            </div>
            {sub.cancellation_url && (
              <a href={sub.cancellation_url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-link">
                Manage Subscription
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Scenarios Tab Component
const ScenariosTab: React.FC<{ veteranId: number }> = ({ veteranId }) => {
  const [scenario, setScenario] = useState({ income_change: 0, expense_change: 0 });
  const [result, setResult] = useState<any>(null);

  const handleSimulate = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await axios.post(`${API_URL}/api/budget/simulate/${veteranId}`, scenario);
      setResult(res.data);
    } catch (error) {
      console.error('Error simulating scenario:', error);
    }
  };

  return (
    <div className="tab-content">
      <div className="scenario-form">
        <h3>What-If Scenario Simulator</h3>
        <div className="form-group">
          <label>Income Change (+ or -)</label>
          <input
            type="number"
            value={scenario.income_change}
            onChange={(e) => setScenario({ ...scenario, income_change: parseFloat(e.target.value) })}
          />
        </div>
        <div className="form-group">
          <label>Expense Change (+ or -)</label>
          <input
            type="number"
            value={scenario.expense_change}
            onChange={(e) => setScenario({ ...scenario, expense_change: parseFloat(e.target.value) })}
          />
        </div>
        <button className="btn btn-primary" onClick={handleSimulate}>
          Simulate Scenario
        </button>
      </div>

      {result && (
        <div className="scenario-results">
          <h3>Scenario Results</h3>
          <p className="scenario-description">{result.scenario_description}</p>
          <div className="results-grid">
            <div className="result-card">
              <div className="result-label">Simulated Monthly Income</div>
              <div className="result-value">${result.simulated_monthly_income.toFixed(2)}</div>
            </div>
            <div className="result-card">
              <div className="result-label">Simulated Monthly Expenses</div>
              <div className="result-value">${result.simulated_monthly_expenses.toFixed(2)}</div>
            </div>
            <div className="result-card">
              <div className="result-label">Simulated Net Cashflow</div>
              <div className="result-value" style={{ color: result.simulated_net_cashflow >= 0 ? '#10b981' : '#ef4444' }}>
                ${result.simulated_net_cashflow.toFixed(2)}
              </div>
            </div>
            <div className="result-card">
              <div className="result-label">Simulated Savings Rate</div>
              <div className="result-value">{result.simulated_savings_rate.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;
