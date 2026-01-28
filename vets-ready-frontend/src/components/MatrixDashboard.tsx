/**
 * Matrix-Driven Claims Dashboard
 *
 * Unified dashboard where all modules are views of the same veteran profile data.
 * Replaces standalone wizard - everything updates dynamically.
 */

import React, { useState, useEffect } from 'react';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';
import { evaluateMatrix, MatrixOutput } from '../services/MatrixEngine';
import { getBranchTheme, getBranchIcon } from '../services/BranchThemes';
import {
  Shield,
  Award,
  FileText,
  Scale,
  Link2,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Download,
  ExternalLink
} from 'lucide-react';

type TabType = 'profile' | 'benefits' | 'theories' | 'evidence' | 'cfr' | 'secondary' | 'strategy' | 'summary';

const MatrixDashboard: React.FC = () => {
  const { profile, updateProfile } = useVeteranProfile();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [matrixData, setMatrixData] = useState<MatrixOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const theme = getBranchTheme(profile.branch || 'Army');
  const branchIcon = getBranchIcon(profile.branch || 'Army');

  // Evaluate matrix whenever profile changes
  useEffect(() => {
    if (profile.branch && profile.vaDisabilityRating >= 0) {
      setIsLoading(true);
      // Simulate brief processing time for smooth UX
      setTimeout(() => {
        const result = evaluateMatrix(profile);
        setMatrixData(result);
        setIsLoading(false);
      }, 300);
    }
  }, [profile]);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: Shield, count: `${matrixData?.profileScore || 0}%` },
    { id: 'benefits', name: 'Benefits', icon: Award, count: matrixData?.benefits.totalCount || 0 },
    { id: 'theories', name: 'Theories', icon: Scale, count: matrixData?.theories.filter(t => t.applies).length || 0 },
    { id: 'evidence', name: 'Evidence', icon: FileText, count: null },
    { id: 'cfr', name: 'CFR Codes', icon: BookOpen, count: matrixData?.cfrCodes.length || 0 },
    { id: 'secondary', name: 'Secondary', icon: Link2, count: matrixData?.secondaryConditions.length || 0 },
    { id: 'strategy', name: 'Strategy', icon: TrendingUp, count: null },
    { id: 'summary', name: 'Summary', icon: CheckCircle, count: null }
  ] as const;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">

        {/* Header */}
        <div
          className="rounded-2xl shadow-2xl p-8 mb-8 border-4"
          style={{
            background: theme.gradient,
            borderColor: theme.colors.border
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">{branchIcon}</div>
            <div>
              <h1
                className="text-5xl font-bold mb-2"
                style={{
                  color: theme.colors.text,
                  textShadow: theme.textShadow
                }}
              >
                Claims Matrix Dashboard
              </h1>
              <p className="text-xl opacity-90" style={{ color: theme.colors.text }}>
                All modules connected to your veteran profile
              </p>
            </div>
          </div>

          {/* Profile Completeness Bar */}
          {matrixData && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold" style={{ color: theme.colors.text }}>
                  Profile Completeness
                </span>
                <span className="font-bold text-lg" style={{ color: theme.colors.accent }}>
                  {matrixData.profileScore}%
                </span>
              </div>
              <div
                className="h-4 rounded-full overflow-hidden"
                style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${matrixData.profileScore}%`,
                    backgroundColor: matrixData.profileScore === 100 ? '#22C55E' : theme.colors.accent
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition transform hover:scale-105 relative"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
                    : 'rgba(0,0,0,0.3)',
                  color: theme.colors.text,
                  border: `2px solid ${isActive ? theme.colors.border : 'transparent'}`
                }}
              >
                <Icon size={20} />
                {tab.name}
                {tab.count !== null && (
                  <span
                    className="ml-2 px-2 py-1 rounded-full text-xs font-bold"
                    style={{
                      backgroundColor: theme.colors.accent,
                      color: '#000'
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div
          className="rounded-2xl shadow-2xl p-8"
          style={{
            background: theme.cardStyle,
            borderColor: theme.colors.border
          }}
        >
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin text-6xl mb-4" style={{ color: theme.colors.accent }}>
                ⚙️
              </div>
              <p className="text-xl font-semibold" style={{ color: theme.colors.text }}>
                Evaluating Matrix...
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'profile' && <ProfileTab profile={profile} updateProfile={updateProfile} matrixData={matrixData} theme={theme} />}
              {activeTab === 'benefits' && <BenefitsTab matrixData={matrixData} theme={theme} />}
              {activeTab === 'theories' && <TheoriesTab matrixData={matrixData} theme={theme} />}
              {activeTab === 'evidence' && <EvidenceTab matrixData={matrixData} theme={theme} />}
              {activeTab === 'cfr' && <CFRTab matrixData={matrixData} theme={theme} />}
              {activeTab === 'secondary' && <SecondaryTab matrixData={matrixData} theme={theme} />}
              {activeTab === 'strategy' && <StrategyTab matrixData={matrixData} theme={theme} />}
              {activeTab === 'summary' && <SummaryTab matrixData={matrixData} profile={profile} theme={theme} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Profile Tab Component
const ProfileTab: React.FC<any> = ({ profile, updateProfile, matrixData, theme }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-6" style={{ color: theme.colors.text }}>
        Veteran Profile
      </h2>

      {matrixData && matrixData.missingFields.length > 0 && (
        <div
          className="p-4 rounded-lg border-2 mb-6"
          style={{
            backgroundColor: 'rgba(255,165,0,0.1)',
            borderColor: '#FFA500'
          }}
        >
          <h3 className="font-bold text-lg mb-2" style={{ color: theme.colors.text }}>
            Missing Information
          </h3>
          <ul className="space-y-1" style={{ color: theme.colors.text }}>
            {matrixData.missingFields.map((field: string) => (
              <li key={field} className="flex items-center gap-2">
                <AlertCircle size={16} className="text-orange-500" />
                {field}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Branch Selection */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: theme.colors.text }}>
            Branch of Service
          </label>
          <select
            value={profile.branch}
            onChange={(e) => updateProfile({ branch: e.target.value as any })}
            className="w-full px-4 py-3 rounded-lg font-semibold"
            style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              color: theme.colors.text,
              border: `2px solid ${theme.colors.border}`
            }}
          >
            <option value="">Select Branch</option>
            <option value="Army">🪖 U.S. Army</option>
            <option value="Navy">⚓ U.S. Navy</option>
            <option value="Air Force">✈️ U.S. Air Force</option>
            <option value="Marine Corps">🦅 U.S. Marine Corps</option>
            <option value="Coast Guard">🛟 U.S. Coast Guard</option>
            <option value="Space Force">🚀 U.S. Space Force</option>
          </select>
        </div>

        {/* VA Rating */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: theme.colors.text }}>
            Current VA Disability Rating: {profile.vaDisabilityRating}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="10"
            value={profile.vaDisabilityRating}
            onChange={(e) => updateProfile({ vaDisabilityRating: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-sm mt-1" style={{ color: theme.colors.text }}>
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* State */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: theme.colors.text }}>
            State of Residence
          </label>
          <input
            type="text"
            value={profile.state || ''}
            onChange={(e) => updateProfile({ state: e.target.value })}
            placeholder="e.g., Idaho"
            className="w-full px-4 py-3 rounded-lg"
            style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              color: theme.colors.text,
              border: `2px solid ${theme.colors.border}`
            }}
          />
        </div>

        {/* Marital Status */}
        <div>
          <label className="flex items-center gap-3 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={profile.isMarried}
              onChange={(e) => updateProfile({ isMarried: e.target.checked })}
              className="w-6 h-6"
            />
            <span style={{ color: theme.colors.text }}>Married</span>
          </label>
        </div>

        {/* Children */}
        <div>
          <label className="block font-semibold mb-2" style={{ color: theme.colors.text }}>
            Number of Children
          </label>
          <input
            type="number"
            min="0"
            value={profile.numberOfChildren}
            onChange={(e) => updateProfile({ numberOfChildren: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-3 rounded-lg"
            style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              color: theme.colors.text,
              border: `2px solid ${theme.colors.border}`
            }}
          />
        </div>

        {/* Combat Service */}
        <div>
          <label className="flex items-center gap-3 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={profile.hasCombatService}
              onChange={(e) => updateProfile({ hasCombatService: e.target.checked })}
              className="w-6 h-6"
            />
            <span style={{ color: theme.colors.text }}>Combat Service</span>
          </label>
        </div>

        {/* P&T */}
        <div>
          <label className="flex items-center gap-3 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={profile.isPermanentAndTotal || false}
              onChange={(e) => updateProfile({ isPermanentAndTotal: e.target.checked })}
              className="w-6 h-6"
            />
            <span style={{ color: theme.colors.text }}>Permanent & Total (P&T)</span>
          </label>
        </div>

        {/* TDIU */}
        <div>
          <label className="flex items-center gap-3 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={profile.isTDIU || false}
              onChange={(e) => updateProfile({ isTDIU: e.target.checked })}
              className="w-6 h-6"
            />
            <span style={{ color: theme.colors.text }}>TDIU (Individual Unemployability)</span>
          </label>
        </div>
      </div>
    </div>
  );
};

// Benefits Tab Component
const BenefitsTab: React.FC<any> = ({ matrixData, theme }) => {
  if (!matrixData) return <div style={{ color: theme.colors.text }}>Complete your profile to see benefits.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-6" style={{ color: theme.colors.text }}>
        Benefits Matrix ({matrixData.benefits.totalCount} Total)
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Federal Benefits */}
        <div>
          <h3 className="text-2xl font-bold mb-4" style={{ color: theme.colors.accent }}>
            Federal Benefits ({matrixData.benefits.federal.length})
          </h3>
          <div className="space-y-3">
            {matrixData.benefits.federal.map((benefit: any, index: number) => (
              <div
                key={index}
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'rgba(34,139,34,0.2)' }}
              >
                <h4 className="font-bold mb-1" style={{ color: theme.colors.text }}>
                  {benefit.name}
                </h4>
                <p className="text-sm opacity-90" style={{ color: theme.colors.text }}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* State Benefits */}
        <div>
          <h3 className="text-2xl font-bold mb-4" style={{ color: theme.colors.accent }}>
            State Benefits ({matrixData.benefits.state.length})
          </h3>
          <div className="space-y-3">
            {matrixData.benefits.state.map((benefit: any, index: number) => (
              <div
                key={index}
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'rgba(34,139,34,0.2)' }}
              >
                <h4 className="font-bold mb-1" style={{ color: theme.colors.text }}>
                  {benefit.name}
                </h4>
                <p className="text-sm opacity-90" style={{ color: theme.colors.text }}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Theories Tab Component (reuses existing theories from MatrixEngine)
const TheoriesTab: React.FC<any> = ({ matrixData, theme }) => {
  if (!matrixData) return <div style={{ color: theme.colors.text }}>Complete your profile to see theories.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-6" style={{ color: theme.colors.text }}>
        Theories of Entitlement
      </h2>
      <div className="space-y-4">
        {matrixData.theories.map((theory: any) => (
          <div
            key={theory.id}
            className="p-6 rounded-lg"
            style={{
              backgroundColor: theory.applies ? 'rgba(34,139,34,0.2)' : 'rgba(139,139,139,0.2)',
              border: `2px solid ${theory.applies ? theme.colors.accent : 'transparent'}`
            }}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold" style={{ color: theme.colors.text }}>
                {theory.name}
              </h3>
              <span
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor:
                    theory.strength === 'strong' ? '#228B22' :
                    theory.strength === 'moderate' ? '#FFA500' : '#999',
                  color: '#FFF'
                }}
              >
                {theory.strength}
              </span>
            </div>
            <p className="text-sm mb-2 opacity-90" style={{ color: theme.colors.text }}>
              {theory.description}
            </p>
            <p className="text-sm mb-3" style={{ color: theme.colors.text }}>
              <strong>Applies:</strong> {theory.reason}
            </p>
            <div className="mb-2">
              <p className="text-sm font-semibold mb-1" style={{ color: theme.colors.text }}>
                Required Evidence:
              </p>
              <ul className="text-sm space-y-1 pl-4">
                {theory.requiredEvidence.map((ev: string, i: number) => (
                  <li key={i} style={{ color: theme.colors.text }}>• {ev}</li>
                ))}
              </ul>
            </div>
            <p className="text-xs opacity-70" style={{ color: theme.colors.text }}>
              Legal Basis: {theory.cfr}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Evidence Tab Component
const EvidenceTab: React.FC<any> = ({ matrixData, theme }) => {
  if (!matrixData) return <div style={{ color: theme.colors.text }}>Complete your profile to see evidence requirements.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-6" style={{ color: theme.colors.text }}>
        Evidence Checklist
      </h2>
      {Object.entries(matrixData.evidence).map(([category, items]: [string, any]) => (
        <div key={category}>
          <h3
            className="text-xl font-bold mb-3 capitalize"
            style={{ color: theme.colors.accent }}
          >
            {category.replace(/([A-Z])/g, ' $1').trim()}
          </h3>
          <ul className="space-y-2">
            {items.map((item: any, index: number) => (
              <li
                key={index}
                className="flex items-center gap-2 p-3 rounded"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <CheckCircle
                  size={20}
                  style={{ color: item.required ? '#FFD700' : '#999' }}
                />
                <span style={{ color: theme.colors.text }}>
                  {item.item}
                  {item.required && <span className="text-yellow-400 ml-2">*Required</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

// CFR Tab Component
const CFRTab: React.FC<any> = ({ matrixData, theme }) => {
  if (!matrixData) return <div style={{ color: theme.colors.text }}>Add service-connected conditions to see CFR codes.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-6" style={{ color: theme.colors.text }}>
        CFR Diagnostic Codes (38 CFR Part 4)
      </h2>
      <div className="space-y-4">
        {matrixData.cfrCodes.map((code: any, index: number) => (
          <div
            key={index}
            className="p-6 rounded-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold" style={{ color: theme.colors.accent }}>
                  {code.condition}
                </h3>
                <p className="text-sm opacity-70" style={{ color: theme.colors.text }}>
                  CFR Code: {code.code} | {code.bodySystem}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold" style={{ color: theme.colors.accent }}>
                  {code.currentRating}%
                </p>
                {code.nextRating && (
                  <p className="text-sm" style={{ color: theme.colors.text }}>
                    Next: {code.nextRating}%
                  </p>
                )}
              </div>
            </div>
            <div
              className="p-4 rounded mt-3"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: theme.colors.text }}>
                Current Rating Criteria:
              </p>
              <p className="text-sm" style={{ color: theme.colors.text }}>
                {code.criteria}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Secondary Tab Component
const SecondaryTab: React.FC<any> = ({ matrixData, theme }) => {
  if (!matrixData) return <div style={{ color: theme.colors.text }}>Add service-connected conditions to see secondary conditions.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-6" style={{ color: theme.colors.text }}>
        Secondary Conditions
      </h2>
      <div className="space-y-4">
        {matrixData.secondaryConditions.map((sc: any, index: number) => (
          <div
            key={index}
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <h3 className="font-bold mb-2" style={{ color: theme.colors.accent }}>
              {sc.primary} → {sc.secondary}
            </h3>
            <p className="text-sm mb-2" style={{ color: theme.colors.text }}>
              {sc.nexus}
            </p>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor:
                  sc.strength === 'strong' ? '#228B22' :
                  sc.strength === 'moderate' ? '#FFA500' : '#999',
                color: '#FFF'
              }}
            >
              {sc.strength} medical nexus
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Strategy Tab Component
const StrategyTab: React.FC<any> = ({ matrixData, theme }) => {
  if (!matrixData) return <div style={{ color: theme.colors.text }}>Complete your profile to see claim strategy.</div>;

  const { strategy } = matrixData;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-6" style={{ color: theme.colors.text }}>
        Claim Strategy
      </h2>

      <div
        className="p-6 rounded-lg"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
      >
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm opacity-70 mb-1" style={{ color: theme.colors.text }}>Claim Type</p>
            <p className="text-2xl font-bold capitalize" style={{ color: theme.colors.accent }}>
              {strategy.claimType}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-70 mb-1" style={{ color: theme.colors.text }}>Primary Condition</p>
            <p className="text-2xl font-bold" style={{ color: theme.colors.accent }}>
              {strategy.primaryCondition}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-70 mb-1" style={{ color: theme.colors.text }}>Current Rating</p>
            <p className="text-2xl font-bold" style={{ color: theme.colors.accent }}>
              {strategy.currentRating}%
            </p>
          </div>
          <div>
            <p className="text-sm opacity-70 mb-1" style={{ color: theme.colors.text }}>Target Rating</p>
            <p className="text-2xl font-bold" style={{ color: theme.colors.accent }}>
              {strategy.targetRating}%
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold mb-3" style={{ color: theme.colors.text }}>
            Steps to Take
          </h3>
          <ol className="space-y-2">
            {strategy.steps.map((step: string, index: number) => (
              <li
                key={index}
                className="flex items-start gap-3 p-3 rounded"
                style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
              >
                <span
                  className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: theme.colors.accent, color: '#000' }}
                >
                  {index + 1}
                </span>
                <span style={{ color: theme.colors.text }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-bold mb-3" style={{ color: theme.colors.text }}>
            Key Evidence
          </h3>
          <div className="flex flex-wrap gap-2">
            {strategy.keyEvidence.map((evidence: string, index: number) => (
              <span
                key={index}
                className="px-4 py-2 rounded-full font-semibold"
                style={{ backgroundColor: theme.colors.accent, color: '#000' }}
              >
                {evidence}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm opacity-70" style={{ color: theme.colors.text }}>
            <strong>Estimated Timeline:</strong> {strategy.timeline}
          </p>
        </div>
      </div>
    </div>
  );
};

// Summary Tab Component
const SummaryTab: React.FC<any> = ({ matrixData, profile, theme }) => {
  if (!matrixData) return <div style={{ color: theme.colors.text }}>Complete your profile to see summary.</div>;

  const downloadSummary = () => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>VetsReady Claim Preparation Summary</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
    h1 { color: #1a472a; }
    h2 { color: #2d6a3e; border-bottom: 2px solid #2d6a3e; padding-bottom: 5px; }
    .section { margin-bottom: 30px; }
    ul { line-height: 1.8; }
  </style>
</head>
<body>
  <h1>VetsReady Claim Preparation Summary</h1>
  <p><strong>Branch:</strong> ${profile.branch}</p>
  <p><strong>Rating:</strong> ${profile.vaDisabilityRating}%</p>
  <p><strong>Profile Completeness:</strong> ${matrixData.profileScore}%</p>

  <div class="section">
    <h2>Benefits (${matrixData.benefits.totalCount} Total)</h2>
    <p>Federal: ${matrixData.benefits.federal.length} | State: ${matrixData.benefits.state.length}</p>
  </div>

  <div class="section">
    <h2>Theories of Entitlement</h2>
    <ul>
      ${matrixData.theories.filter((t: any) => t.applies).map((t: any) => `<li><strong>${t.name}</strong> (${t.strength})</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <h2>Claim Strategy</h2>
    <p><strong>Type:</strong> ${matrixData.strategy.claimType}</p>
    <p><strong>Condition:</strong> ${matrixData.strategy.primaryCondition}</p>
    <p><strong>Timeline:</strong> ${matrixData.strategy.timeline}</p>
  </div>

  <div class="section">
    <p><strong>Disclaimer:</strong> This is an educational tool only. VetsReady does not file claims. Submit your claim at <a href="https://www.va.gov">VA.gov</a>.</p>
  </div>
</body>
</html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VetsReady_Claim_Summary.html';
    a.click();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold mb-6" style={{ color: theme.colors.text }}>
        Claim Preparation Summary
      </h2>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div
          className="p-6 rounded-lg text-center"
          style={{ backgroundColor: 'rgba(34,139,34,0.2)' }}
        >
          <p className="text-4xl font-bold mb-2" style={{ color: theme.colors.accent }}>
            {matrixData.benefits.totalCount}
          </p>
          <p style={{ color: theme.colors.text }}>Total Benefits</p>
        </div>
        <div
          className="p-6 rounded-lg text-center"
          style={{ backgroundColor: 'rgba(34,139,34,0.2)' }}
        >
          <p className="text-4xl font-bold mb-2" style={{ color: theme.colors.accent }}>
            {matrixData.theories.filter((t: any) => t.applies).length}
          </p>
          <p style={{ color: theme.colors.text }}>Active Theories</p>
        </div>
        <div
          className="p-6 rounded-lg text-center"
          style={{ backgroundColor: 'rgba(34,139,34,0.2)' }}
        >
          <p className="text-4xl font-bold mb-2" style={{ color: theme.colors.accent }}>
            {matrixData.profileScore}%
          </p>
          <p style={{ color: theme.colors.text }}>Profile Complete</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={downloadSummary}
          className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition"
          style={{
            backgroundColor: theme.colors.accent,
            color: '#000'
          }}
        >
          <Download size={24} />
          Download Summary
        </button>

        <a
          href="https://www.va.gov/disability/file-disability-claim-form-21-526ez/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition"
          style={{
            backgroundColor: '#1a472a',
            color: '#FFFFFF'
          }}
        >
          File on VA.gov <ExternalLink size={24} />
        </a>
      </div>
    </div>
  );
};

export default MatrixDashboard;
