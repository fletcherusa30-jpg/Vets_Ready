/**
 * Claims Page - Central Hub for VA Disability Claim Preparation
 *
 * Educational and preparatory tool only - does NOT file claims.
 * All claim filing happens on VA.gov.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVeteranProfile } from '../contexts/VeteranProfileContext';
import { evaluateMatrix } from '../services/MatrixEngine';
import { getBranchTheme, getBranchIcon, applyBranchTheme } from '../services/BranchThemes';
import {
  FileText,
  CheckCircle,
  ExternalLink,
  PlayCircle,
  RefreshCw,
  Calculator,
  BookOpen,
  ClipboardList,
  MessageSquare,
  Link2,
  Scale,
  AlertCircle,
  Info,
  ChevronRight,
  Award
} from 'lucide-react';

const ClaimsHub: React.FC = () => {
  const { profile } = useVeteranProfile();
  const [matrixData, setMatrixData] = useState<any>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [wizardProgress, setWizardProgress] = useState<any>(null);

  // Apply branch theme
  useEffect(() => {
    if (profile.branch) {
      applyBranchTheme(profile.branch);
    }
  }, [profile.branch]);

  // Load matrix data
  useEffect(() => {
    if (profile.branch && profile.vaDisabilityRating >= 0) {
      const matrix = evaluateMatrix(profile);
      setMatrixData(matrix);
    }
  }, [profile]);

  // Load wizard progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('claimWizardProgress');
    if (saved) {
      setWizardProgress(JSON.parse(saved));
    }
  }, []);

  const theme = getBranchTheme(profile.branch || 'Army');
  // Branch icon removed - no longer displaying

  const quickTools = [
    {
      id: 'calculator',
      name: 'Disability Rating Calculator',
      description: 'Calculate combined VA disability rating',
      icon: Calculator,
      route: '/calculator',
      color: theme.colors.accent
    },
    {
      id: 'cfr',
      name: 'CFR Diagnostic Codes',
      description: 'View 38 CFR Part 4 rating criteria',
      icon: BookOpen,
      action: () => setSelectedTool('cfr'),
      color: theme.colors.accent
    },
    {
      id: 'evidence',
      name: 'Evidence Checklist',
      description: 'Organize your claim evidence',
      icon: ClipboardList,
      action: () => setSelectedTool('evidence'),
      color: theme.colors.accent
    },
    {
      id: 'lay-statement',
      name: 'Lay Statement Builder',
      description: 'Write your veteran statement',
      icon: MessageSquare,
      action: () => setSelectedTool('lay-statement'),
      color: theme.colors.accent
    },
    {
      id: 'secondary',
      name: 'Secondary Condition Finder',
      description: 'Identify related conditions',
      icon: Link2,
      action: () => setSelectedTool('secondary'),
      color: theme.colors.accent
    },
    {
      id: 'theories',
      name: 'Theories of Entitlement',
      description: 'Legal theories for your claim',
      icon: Scale,
      action: () => setSelectedTool('theories'),
      color: theme.colors.accent
    }
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-7xl">

        {/* Hero Section */}
        <div
          className="rounded-2xl shadow-2xl p-8 mb-8 border-4"
          style={{
            background: theme.colors.background,
            borderColor: theme.colors.border
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1
                className="text-5xl font-bold mb-2"
                style={{
                  color: theme.colors.text,
                  textShadow: theme.textShadow
                }}
              >
                Prepare Your VA Disability Claim
              </h1>
              <p className="text-xl opacity-90" style={{ color: theme.colors.text }}>
                We help you organize, understand, and prepare your claim.
                <br />
                <strong>When ready, you will file on VA.gov.</strong>
              </p>
            </div>
          </div>

          {/* Profile Completeness Alert */}
          {matrixData && matrixData.profileScore < 100 && (
            <div
              className="mt-4 p-4 rounded-lg border-2 flex items-start gap-3"
              style={{
                backgroundColor: 'rgba(255,165,0,0.1)',
                borderColor: '#FFA500'
              }}
            >
              <AlertCircle className="text-orange-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-bold text-lg mb-1" style={{ color: theme.colors.text }}>
                  Complete Your Profile ({matrixData.profileScore}%)
                </h3>
                <p className="text-sm opacity-90 mb-2" style={{ color: theme.colors.text }}>
                  Missing: {matrixData.missingFields.join(', ')}
                </p>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition"
                  style={{ backgroundColor: theme.colors.accent, color: '#000' }}
                >
                  Complete Profile <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mt-6">
            {wizardProgress ? (
              <Link
                to="/wizard"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  color: theme.colors.text,
                  border: `2px solid ${theme.colors.border}`
                }}
              >
                <RefreshCw size={24} />
                Resume Claim Preparation
              </Link>
            ) : (
              <Link
                to="/wizard"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                  color: theme.colors.text,
                  border: `2px solid ${theme.colors.border}`
                }}
              >
                <PlayCircle size={24} />
                Start Claim Preparation
              </Link>
            )}

            <a
              href="https://www.va.gov/disability/file-disability-claim-form-21-526ez/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition"
              style={{
                backgroundColor: '#1a472a',
                color: '#FFFFFF',
                border: '2px solid #2d6a3e'
              }}
            >
              File on VA.gov <ExternalLink size={24} />
            </a>
          </div>
        </div>

        {/* What This Page Does */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div
            className="rounded-xl p-6 shadow-lg"
            style={{
              background: theme.cardStyle,
              borderColor: theme.colors.border
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-green-500" size={32} />
              <h2 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
                What This Page Does
              </h2>
            </div>
            <ul className="space-y-2" style={{ color: theme.colors.text }}>
              <li className="flex items-start gap-2">
                <ChevronRight className="flex-shrink-0 mt-1" size={20} />
                <span>Guides you through 6-step claim preparation process</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="flex-shrink-0 mt-1" size={20} />
                <span>Provides CFR rating criteria for your conditions</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="flex-shrink-0 mt-1" size={20} />
                <span>Generates comprehensive evidence checklists</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="flex-shrink-0 mt-1" size={20} />
                <span>Identifies potential secondary conditions</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="flex-shrink-0 mt-1" size={20} />
                <span>Shows benefits you may qualify for</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="flex-shrink-0 mt-1" size={20} />
                <span>Exports complete claim preparation summary</span>
              </li>
            </ul>
          </div>

          <div
            className="rounded-xl p-6 shadow-lg border-2"
            style={{
              background: 'rgba(220,53,69,0.1)',
              borderColor: '#dc3545'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-500" size={32} />
              <h2 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
                Legal Compliance
              </h2>
            </div>
            <div className="space-y-3" style={{ color: theme.colors.text }}>
              <p className="font-semibold">
                ⚠️ rallyforge does NOT file VA claims
              </p>
              <p className="text-sm">
                This is an educational and preparatory tool only. We help you organize and understand your claim, but you must submit it yourself on VA.gov.
              </p>
              <p className="text-sm">
                We do not provide legal or medical advice. We do not generate VA forms. We are not affiliated with the U.S. Department of Veterans Affairs.
              </p>
            </div>
          </div>
        </div>

        {/* Quick-Access Tools */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6" style={{ color: theme.colors.text }}>
            Quick-Access Tools
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickTools.map(tool => {
              // If tool has route, use Link; otherwise use action
              if (tool.route) {
                return (
                  <Link
                    key={tool.id}
                    to={tool.route}
                    className="rounded-xl p-6 shadow-lg cursor-pointer hover:shadow-2xl transition transform hover:scale-105 block"
                    style={{
                      background: theme.cardStyle,
                      borderColor: theme.colors.border
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <tool.icon size={32} style={{ color: tool.color }} />
                      <h3 className="text-xl font-bold" style={{ color: theme.colors.text }}>
                        {tool.name}
                      </h3>
                    </div>
                    <p className="text-sm opacity-80" style={{ color: theme.colors.text }}>
                      {tool.description}
                    </p>
                  </Link>
                );
              }

              return (
                <div
                  key={tool.id}
                  onClick={tool.action}
                  className="rounded-xl p-6 shadow-lg cursor-pointer hover:shadow-2xl transition transform hover:scale-105"
                  style={{
                    background: theme.cardStyle,
                    borderColor: theme.colors.border
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <tool.icon size={32} style={{ color: tool.color }} />
                    <h3 className="text-xl font-bold" style={{ color: theme.colors.text }}>
                      {tool.name}
                    </h3>
                  </div>
                  <p className="text-sm opacity-80" style={{ color: theme.colors.text }}>
                    {tool.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Benefits Matrix Preview */}
        {matrixData && matrixData.benefits.totalCount > 0 && (
          <div
            className="rounded-xl p-6 shadow-lg mb-8"
            style={{
              background: theme.cardStyle,
              borderColor: theme.colors.border
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Award size={32} style={{ color: theme.colors.accent }} />
                <h2 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
                  Benefits You May Qualify For
                </h2>
              </div>
              <Link
                to="/benefits-matrix"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition"
                style={{ backgroundColor: theme.colors.accent, color: '#000' }}
              >
                View Full Matrix <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(34,139,34,0.2)' }}>
                <p className="text-4xl font-bold mb-1" style={{ color: theme.colors.accent }}>
                  {matrixData.benefits.federal.length}
                </p>
                <p style={{ color: theme.colors.text }}>Federal Benefits</p>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(34,139,34,0.2)' }}>
                <p className="text-4xl font-bold mb-1" style={{ color: theme.colors.accent }}>
                  {matrixData.benefits.state.length}
                </p>
                <p style={{ color: theme.colors.text }}>State Benefits</p>
              </div>
            </div>
          </div>
        )}

        {/* Educational Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6" style={{ color: theme.colors.text }}>
            Common Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: 'What type of claim do I need?',
                a: 'New claim for initial service connection, Increase for worsening condition, Secondary for condition caused by service-connected condition, or Supplemental for new evidence.'
              },
              {
                q: 'What evidence helps my claim?',
                a: 'Service medical records, current diagnosis, nexus letter linking condition to service, DBQ (Disability Benefits Questionnaire), and lay statements from you or witnesses.'
              },
              {
                q: 'What is a nexus?',
                a: 'A medical nexus is a doctor\'s opinion linking your current condition to your military service. It\'s one of the most important pieces of evidence for service connection.'
              },
              {
                q: 'What is P&T status?',
                a: 'Permanent & Total (P&T) means the VA considers your disabilities permanent with no future exams required. It unlocks additional benefits like ChampVA and DEA.'
              },
              {
                q: 'What is secondary service connection?',
                a: 'A condition caused or aggravated by an existing service-connected condition. Example: sleep apnea caused by PTSD, or back pain caused by knee injury.'
              },
              {
                q: 'How long does a claim take?',
                a: 'Average processing time is 3-6 months, but varies by claim type and complexity. Fully Developed Claims (FDC) with all evidence upfront may process faster.'
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="rounded-xl p-6 shadow-lg"
                style={{
                  background: theme.cardStyle,
                  borderColor: theme.colors.border
                }}
              >
                <div className="flex items-start gap-3 mb-2">
                  <Info size={24} style={{ color: theme.colors.accent }} className="flex-shrink-0 mt-1" />
                  <h3 className="text-lg font-bold" style={{ color: theme.colors.text }}>
                    {faq.q}
                  </h3>
                </div>
                <p className="text-sm opacity-90 pl-9" style={{ color: theme.colors.text }}>
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tool Modals/Details */}
        {selectedTool && (
          <ToolModal
            tool={selectedTool}
            matrixData={matrixData}
            theme={theme}
            onClose={() => setSelectedTool(null)}
          />
        )}
      </div>
    </div>
  );
};

interface ToolModalProps {
  tool: string;
  matrixData: any;
  theme: any;
  onClose: () => void;
}

const ToolModal: React.FC<ToolModalProps> = ({ tool, matrixData, theme, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ backgroundColor: theme.colors.primary }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold" style={{ color: theme.colors.text }}>
            {tool === 'cfr' && 'CFR Diagnostic Codes'}
            {tool === 'evidence' && 'Evidence Checklist'}
            {tool === 'lay-statement' && 'Lay Statement Builder'}
            {tool === 'secondary' && 'Secondary Conditions'}
            {tool === 'theories' && 'Theories of Entitlement'}
          </h2>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-semibold hover:opacity-90"
            style={{ backgroundColor: theme.colors.accent, color: '#000' }}
          >
            Close
          </button>
        </div>

        {tool === 'theories' && matrixData && (
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
                  <strong>Reason:</strong> {theory.reason}
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
        )}

        {tool === 'secondary' && matrixData && (
          <div className="space-y-4">
            <p className="mb-4" style={{ color: theme.colors.text }}>
              Based on your service-connected conditions, these secondary conditions may apply:
            </p>
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
        )}

        {tool === 'evidence' && matrixData && (
          <div className="space-y-6">
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
                      className="flex items-center gap-2 p-2 rounded"
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
        )}

        {tool === 'cfr' && matrixData && (
          <div className="space-y-4">
            {/* POLICY-COMPLIANT: Educational disclaimer (REQUIRED) */}
            <div
              className="p-4 rounded-lg border-l-4"
              style={{
                backgroundColor: 'rgba(255, 193, 7, 0.15)',
                borderLeftColor: theme.colors.accent
              }}
            >
              <p className="text-sm" style={{ color: theme.colors.text }}>
                <strong>⚠️ Educational Information Only</strong><br />
                This tool provides educational information based on CFR Part 4 (38 CFR §4.1-4.150).
                It does <strong>not</strong> predict ratings, provide medical advice, or assist with claims.
                All rating decisions are made by the VA based on your medical evidence and examinations.
              </p>
            </div>

            {matrixData.cfrCodes.map((code: any, index: number) => (
              <div
                key={index}
                className="p-6 rounded-lg"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold" style={{ color: theme.colors.accent }}>
                      {code.condition}
                    </h3>
                    <p className="text-sm opacity-70" style={{ color: theme.colors.text }}>
                      CFR Code: {code.code} | {code.bodySystem}
                    </p>
                  </div>
                </div>

                {/* POLICY-COMPLIANT: Show all rating levels, not predictions */}
                <div
                  className="p-4 rounded mt-3"
                  style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
                >
                  <p className="text-sm font-semibold mb-3" style={{ color: theme.colors.text }}>
                    📋 CFR Rating Criteria (Educational Reference):
                  </p>
                  {code.ratingCriteria && typeof code.ratingCriteria === 'object' ? (
                    <div className="space-y-2">
                      {Object.entries(code.ratingCriteria)
                        .sort(([a], [b]) => Number(b) - Number(a)) // Sort highest to lowest
                        .map(([percentage, criteria]: [string, any]) => (
                          <div
                            key={percentage}
                            className="p-3 rounded"
                            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                          >
                            <div className="flex items-start gap-2">
                              <span
                                className="font-bold px-2 py-1 rounded"
                                style={{
                                  backgroundColor: theme.colors.accent,
                                  color: '#000',
                                  fontSize: '0.875rem',
                                  minWidth: '3rem',
                                  textAlign: 'center'
                                }}
                              >
                                {percentage}%
                              </span>
                              <p className="text-sm flex-1" style={{ color: theme.colors.text }}>
                                {criteria}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: theme.colors.text }}>
                      {code.criteria || 'Rating criteria not available for this condition.'}
                    </p>
                  )}
                </div>

                {/* Show special rules if available */}
                {code.specialRules && code.specialRules.length > 0 && (
                  <div
                    className="p-4 rounded mt-3"
                    style={{ backgroundColor: 'rgba(33, 150, 243, 0.1)' }}
                  >
                    <p className="text-sm font-semibold mb-2" style={{ color: theme.colors.text }}>
                      ℹ️ Special Considerations:
                    </p>
                    <ul className="text-sm space-y-1" style={{ color: theme.colors.text }}>
                      {code.specialRules.map((rule: string, idx: number) => (
                        <li key={idx}>• {rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tool === 'lay-statement' && (
          <div style={{ color: theme.colors.text }}>
            <p className="mb-4">
              A lay statement is your personal account of how your condition affects your daily life. It should:
            </p>
            <ul className="space-y-2 mb-6 pl-4">
              <li>• Describe specific symptoms and when they occur</li>
              <li>• Explain how symptoms impact work, relationships, and daily activities</li>
              <li>• Include dates and progression of symptoms</li>
              <li>• Be honest and detailed</li>
              <li>• Connect symptoms to your military service</li>
            </ul>
            <div
              className="p-4 rounded-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <p className="font-semibold mb-2">Template:</p>
              <p className="text-sm font-mono whitespace-pre-line">
{`I, [Your Name], declare under penalty of perjury that the following is true and correct:

I served in the [Branch] from [Start Date] to [End Date].

During my service, I [describe in-service event/exposure/injury].

Since that time, I have experienced the following symptoms:
- [Symptom 1]: [Frequency and severity]
- [Symptom 2]: [Frequency and severity]
- [Symptom 3]: [Frequency and severity]

These symptoms affect my daily life by [describe impact on work, relationships, activities].

I am filing this claim to receive benefits for [condition].

Signed: _______________
Date: _______________`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaimsHub;

