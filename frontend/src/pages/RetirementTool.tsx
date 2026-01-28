// frontend/src/pages/RetirementTool.tsx
import React, { useState } from 'react';
import Page from '../components/layout/Page';

const RetirementTool = () => {
  const [current, setCurrent] = useState(0);
  const [monthly, setMonthly] = useState(0);
  const [years, setYears] = useState(20);
  const future = current + (monthly * 12 * years);

  return (
    <Page title="Retirement Tool">
      <div style={{ maxWidth: 400 }}>
        <label>Current Savings</label>
        <input type="number" value={current} onChange={e => setCurrent(Number(e.target.value))} style={{ width: '100%', marginBottom: 12 }} />
        <label>Monthly Contribution</label>
        <input type="number" value={monthly} onChange={e => setMonthly(Number(e.target.value))} style={{ width: '100%', marginBottom: 12 }} />
        <label>Years to Grow</label>
        <input type="number" value={years} onChange={e => setYears(Number(e.target.value))} style={{ width: '100%', marginBottom: 12 }} />
        <div style={{ marginTop: 16 }}>
          <strong>Projected Savings: ${future}</strong>
        </div>
      </div>
    </Page>
  );
};

export default RetirementTool;
