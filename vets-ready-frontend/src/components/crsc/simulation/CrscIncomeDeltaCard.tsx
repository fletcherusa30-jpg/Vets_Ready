import React from 'react';

interface Props {
  before: number;
  after: number;
  crscPayment: number;
}

export const CrscIncomeDeltaCard: React.FC<Props> = ({ before, after, crscPayment }) => {
  return (
    <div className="p-4 border rounded">
      <p className="text-sm text-gray-700 font-semibold">Income Change</p>
      <p className="text-3xl font-bold text-green-700">+${(after - before).toFixed(2)}/mo</p>
      <p className="text-xs text-gray-500">Includes CRSC ${crscPayment.toFixed(2)}/mo (tax-free)</p>
    </div>
  );
};
