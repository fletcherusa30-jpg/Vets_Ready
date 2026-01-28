// frontend/src/pages/BudgetTool.tsx
import React, { useState } from 'react';
import Page from '../components/layout/Page';

const BudgetTool = () => {
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const total = income - expenses;

  return (
    <Page title="Budget Tool">
      <div style={{ maxWidth: 400 }}>
        <label>Monthly Income</label>
        <input type="number" value={income} onChange={e => setIncome(Number(e.target.value))} style={{ width: '100%', marginBottom: 12 }} />
        <label>Monthly Expenses</label>
        <input type="number" value={expenses} onChange={e => setExpenses(Number(e.target.value))} style={{ width: '100%', marginBottom: 12 }} />
        <div style={{ marginTop: 16 }}>
          <strong>Net: ${total}</strong>
        </div>
      </div>
    </Page>
  );
};

export default BudgetTool;
