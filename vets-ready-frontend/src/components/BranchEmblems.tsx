/**
 * OFFICIAL BRANCH LOGOS
 * Using authorized JPG images from C:\Dev\Vets Ready
 *
 * ✅ AUTHORITATIVE ASSETS
 * ✅ PROFESSIONAL MILITARY BRANDING
 * ✅ USED ACROSS ALL PLATFORM FLOWS
 */

import React from 'react';

// Branch logo paths mapped to official JPG assets
const BRANCH_LOGO_PATHS: Record<string, string> = {
  army: '/assets/branch-logos/Army.jpg',
  navy: '/assets/branch-logos/Navy.jpg',
  airforce: '/assets/branch-logos/Air Force.jpg',
  marines: '/assets/branch-logos/Marine.jpg',
  coastguard: '/assets/branch-logos/Coast Guard.jpg',
  spaceforce: '/assets/branch-logos/Space Force.jpg'
};

// Component that returns the appropriate emblem based on branch
export const BranchEmblem: React.FC<{ branch: string; className?: string; size?: number }> = ({
  branch,
  className = '',
  size = 64
}) => {
  const normalized = branch.toLowerCase().replace(/\s+/g, '');

  let logoKey = '';
  switch (normalized) {
    case 'army':
    case 'usarmy':
      logoKey = 'army';
      break;
    case 'navy':
    case 'usnavy':
      logoKey = 'navy';
      break;
    case 'airforce':
    case 'usaf':
    case 'usairforce':
      logoKey = 'airforce';
      break;
    case 'marines':
    case 'marinecorps':
    case 'usmc':
    case 'usmarinecorps':
      logoKey = 'marines';
      break;
    case 'coastguard':
    case 'uscg':
    case 'uscoastguard':
      logoKey = 'coastguard';
      break;
    case 'spaceforce':
    case 'ussf':
    case 'usspaceforce':
      logoKey = 'spaceforce';
      break;
    default:
      return null;
  }

  const logoPath = BRANCH_LOGO_PATHS[logoKey];
  if (!logoPath) return null;

  return (
    <img
      src={logoPath}
      alt={`${branch} Logo`}
      className={`object-contain ${className}`}
      width={size}
      height={size}
    />
  );
};
