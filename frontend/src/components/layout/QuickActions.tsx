import React from 'react';
import { useNavigate } from 'react-router-dom';

const actions = [
  { label: 'Scan Documents', icon: '📄', to: '/scanner' },
  { label: 'Build Resume', icon: '📝', to: '/resume' },
  { label: 'Job Matches', icon: '💼', to: '/jobs' },
  { label: 'Budget Tool', icon: '💰', to: '/budget' },
  { label: 'Retirement Planner', icon: '🏖️', to: '/retirement' },
  { label: 'Profile', icon: '👤', to: '/profile' },
  { label: 'Quick Disability Calculator', icon: '🦾', quickTool: true },
];

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const [showCalc, setShowCalc] = React.useState(false);
  const [ratings, setRatings] = React.useState<number[]>([0]);

  const handleAction = (action: any) => {
    if (action.quickTool) {
      setShowCalc(true);
    } else {
      navigate(action.to);
    }
  };

  const handleRatingChange = (idx: number, value: number) => {
    const newRatings = [...ratings];
    newRatings[idx] = value;
    setRatings(newRatings);
  };

  const addRating = () => setRatings([...ratings, 0]);
  const removeRating = (idx: number) => setRatings(ratings.length > 1 ? ratings.filter((_, i) => i !== idx) : ratings);

  // VA combined rating calculation
  const getCombined = () => {
    let result = 0;
    let remaining = 100;
    ratings
      .filter(r => r > 0)
      .sort((a, b) => b - a)
      .forEach(r => {
        result += remaining * (r / 100);
        remaining -= remaining * (r / 100);
      });
    return Math.round(result);
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {actions.map(action => (
          <div
            key={action.label}
            onClick={() => handleAction(action)}
            style={{
              cursor: 'pointer',
              background: '#fff',
              borderRadius: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              padding: 24,
              minWidth: 160,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'box-shadow 0.2s',
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              marginBottom: 12,
            }}>{action.icon}</div>
            <span style={{ fontWeight: 600, fontSize: 16 }}>{action.label}</span>
          </div>
        ))}
      </div>
      {showCalc && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowCalc(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, minWidth: 320 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 16 }}>Quick Disability Rating Calculator</h3>
            {ratings.map((r, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={r}
                  onChange={e => handleRatingChange(idx, Number(e.target.value))}
                  style={{ width: 60, marginRight: 8 }}
                />
                <span>%</span>
                {ratings.length > 1 && (
                  <button onClick={() => removeRating(idx)} style={{ marginLeft: 8 }}>Remove</button>
                )}
              </div>
            ))}
            <button onClick={addRating} style={{ marginBottom: 16 }}>Add Condition</button>
            <div style={{ marginTop: 16 }}>
              <strong>Combined Rating: {getCombined()}%</strong>
            </div>
            <button onClick={() => setShowCalc(false)} style={{ marginTop: 16 }}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;
