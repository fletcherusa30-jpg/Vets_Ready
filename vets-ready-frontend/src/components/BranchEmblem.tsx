import React from 'react';
import { BranchTheme } from '../data/branchThemes';

interface BranchEmblemProps {
  theme: BranchTheme;
  size?: number;
  className?: string;
  showBorder?: boolean;
}

/**
 * BranchEmblem Component
 * Displays the official military branch emblem as a JPG image
 * with proper styling and border based on branch theme
 */
export const BranchEmblem: React.FC<BranchEmblemProps> = ({
  theme,
  size = 80,
  className = '',
  showBorder = true
}) => {
  return (
    <img
      src={theme.emblemPath}
      alt={`${theme.name} emblem`}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        border: showBorder ? `4px solid ${theme.colors.accent}` : 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        objectFit: 'cover',
        backgroundColor: theme.colors.primary
      }}
    />
  );
};

export default BranchEmblem;
