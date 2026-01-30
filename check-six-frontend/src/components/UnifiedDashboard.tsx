/**
 * Unified Dashboard Component
 *
 * Central hub displaying ALL Matrix Engine outputs in one view.
 * Updates dynamically whenever ANY input changes.
 *
 * Required Sections (per instructions):
 * 1. Profile Overview
 * 2. Disabilities & Ratings Summary
 * 3. Benefits Matrix
 * 4. Theories of Entitlement
 * 5. Evidence & Tasks
 * 6. CFR Diagnostic Criteria
 * 7. Secondary Condition Finder
 * 8. Summary + VA.gov Redirect
 *
 * Legal Compliance:
 * - Does NOT file claims
 * - Educational and preparatory only
 * - Redirects to VA.gov for filing
 */

import React, { useEffect, useState } from 'react';
import { useVeteranProfile } from '../context/VeteranProfileContext';
import { evaluateMatrix, MatrixOutput } from '../services/MatrixEngine';
import { getBranchTheme, applyBranchTheme } from '../services/BranchThemes';
import { evaluateTransitionStatus, getTransitionBenefits } from '../services/TransitionEngine';
import { calculateCombinedRating } from '../utils/VAMath';
import { analyzeRatingDecision, generateAppealsChecklist } from '../services/AppealsEngine';
import { DischargeUpgradeHelper } from './DischargeUpgradeHelper';

export const UnifiedDashboard: React.FC = () => {
  const { profile } = useVeteranProfile();
  const [matrixOutput, setMatrixOutput] = useState<MatrixOutput | null>(null);
  const [activeSection, setActiveSection] = useState<string>('profile');

  // Re-evaluate matrix whenever profile changes
  useEffect(() => {
    const output = evaluateMatrix(profile);
    setMatrixOutput(output);

    // Apply branch theming
    if (profile.branch) {
      applyBranchTheme(profile.branch);
    }
  }, [profile]);

  if (!matrixOutput) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  const branchTheme = getBranchTheme(profile.branch || 'Army');
  const transitionStatus = evaluateTransitionStatus(profile);
  const transitionBenefits = getTransitionBenefits(profile);
  const vamath = calculateCombinedRating(profile.disabilities || []);
  const appealsAnalysis = analyzeRatingDecision(profile);

  const sections = [
    { id: 'profile', icon: '👤', label: 'Profile' },
    { id: 'disabilities', icon: '📋', label: 'Disabilities' },
    { id: 'benefits', icon: '🎖️', label: 'Benefits' },
    { id: 'housing', icon: '🏠', label: 'Housing' },
    { id: 'retirement', icon: '🎯', label: 'Retirement' },
    { id: 'theories', icon: '⚖️', label: 'Theories' },
    { id: 'evidence', icon: '📄', label: 'Evidence' },
    { id: 'cfr', icon: '📖', label: 'CFR Codes' },
    { id: 'secondary', icon: '🔗', label: 'Secondary' },
    { id: 'appeals', icon: '⚠️', label: 'Appeals' },
    { id: 'discharge-upgrade', icon: '🎖️', label: 'Discharge Upgrade' },
    ...(transitionStatus.isTransitioning ? [{ id: 'transition', icon: '🎓', label: 'Transition' }] : []),
    { id: 'summary', icon: '✅', label: 'Summary' }
  ];

  return (
    <div className="unified-dashboard">
      {/* Header */}
      <div className="dashboard-header" style={{ background: branchTheme.gradient }}>
        <div className="header-content">
          <div className="branch-emblem">
            <div style={{
              fontSize: '60px',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'white',
              borderRadius: '50%',
              border: `4px solid ${branchTheme.accent}`,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
            }}>
              {branchTheme.icon}
            </div>
          </div>
          <div className="header-info">
            <h1>Your Veterans Benefits Dashboard</h1>
            <p className="header-subtitle">{profile.branch || 'U.S. Armed Forces'}</p>
            {profile.rating && (
              <div className="rating-badge">
                {profile.rating}% Service-Connected
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-nav">
        {sections.map(section => (
          <button
            key={section.id}
            className={`nav-tab ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-label">{section.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* SECTION 1: PROFILE OVERVIEW */}
        {activeSection === 'profile' && (
          <div className="section">
            <h2>📊 Profile Overview</h2>
            <div className="profile-grid">
              <div className="profile-card">
                <div className="card-label">Branch of Service</div>
                <div className="card-value">{profile.branch || 'Not specified'}</div>
              </div>
              <div className="profile-card">
                <div className="card-label">Service Dates</div>
                <div className="card-value">
                  {profile.serviceStartDate || 'Not specified'} - {profile.serviceEndDate || 'Not specified'}
                </div>
              </div>
              <div className="profile-card">
                <div className="card-label">Discharge Type</div>
                <div className="card-value">{profile.dischargeType || 'Not specified'}</div>
              </div>
              <div className="profile-card">
                <div className="card-label">Combat Service</div>
                <div className="card-value">{profile.hasCombatService ? '✓ Yes' : 'No'}</div>
              </div>
              <div className="profile-card">
                <div className="card-label">State of Residence</div>
                <div className="card-value">{profile.state || 'Not specified'}</div>
              </div>
              <div className="profile-card">
                <div className="card-label">Dependents</div>
                <div className="card-value">{profile.dependents || 0}</div>
              </div>
              <div className="profile-card">
                <div className="card-label">P&T Status</div>
                <div className="card-value">{profile.isPermanentAndTotal ? '✓ Yes' : 'No'}</div>
              </div>
              <div className="profile-card">
                <div className="card-label">TDIU</div>
                <div className="card-value">{profile.hasTDIU ? '✓ Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: DISABILITIES & RATINGS */}
        {activeSection === 'disabilities' && (
          <div className="section">
            <h2>📋 Disabilities & Ratings</h2>

            <div className="combined-rating-display">
              <div className="rating-circle">
                <div className="rating-number">{vamath.roundedRating}%</div>
                <div className="rating-label">Combined Rating</div>
              </div>
              {vamath.bilateralFactor > 0 && (
                <div className="bilateral-badge">
                  +{vamath.bilateralFactor}% Bilateral Factor
                </div>
              )}
            </div>

            <div className="conditions-list">
              {(profile.disabilities || []).map((disability: any, index: number) => (
                <div key={index} className="condition-item">
                  <div className="condition-name">{disability.conditionName}</div>
                  <div className="condition-rating">{disability.rating}%</div>
                  {disability.extremity && (
                    <div className="condition-detail">Extremity: {disability.extremity}</div>
                  )}
                  {disability.diagnosticCode && (
                    <div className="condition-detail">Code: {disability.diagnosticCode}</div>
                  )}
                </div>
              ))}
              {(profile.disabilities || []).length === 0 && (
                <p className="empty-message">No disabilities recorded yet.</p>
              )}
            </div>

            <details className="math-details">
              <summary>View VA Math Calculation</summary>
              <pre>{vamath.calculations.join('\n')}</pre>
            </details>
          </div>
        )}

        {/* SECTION 3: BENEFITS MATRIX */}
        {activeSection === 'benefits' && (
          <div className="section">
            <h2>🎖️ Benefits Matrix</h2>

            <div className="benefits-stats">
              <div className="stat-card">
                <div className="stat-number">{matrixOutput.benefits.eligible.length}</div>
                <div className="stat-label">Total Benefits</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {matrixOutput.benefits.eligible.filter(b => b.category === 'Federal').length}
                </div>
                <div className="stat-label">Federal Benefits</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {matrixOutput.benefits.eligible.filter(b => b.category === 'State').length}
                </div>
                <div className="stat-label">State Benefits</div>
              </div>
            </div>

            <div className="benefits-grid">
              {matrixOutput.benefits.eligible.map((benefit, index) => (
                <div key={index} className="benefit-card">
                  <div className="benefit-header">
                    <h4>{benefit.name}</h4>
                    <span className="benefit-category">{benefit.category}</span>
                  </div>
                  <p className="benefit-description">{benefit.description}</p>
                  {benefit.link && (
                    <a href={benefit.link} target="_blank" rel="noopener noreferrer" className="benefit-link">
                      Learn More →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: THEORIES OF ENTITLEMENT */}
        {activeSection === 'theories' && (
          <div className="section">
            <h2>⚖️ Theories of Entitlement</h2>
            <p className="section-intro">
              Educational overview of legal theories that may support your claim.
              These are <strong>educational only</strong> and not legal advice.
            </p>

            <div className="theories-list">
              {matrixOutput.theories.map((theory, index) => (
                <div key={index} className="theory-card">
                  <div className="theory-header">
                    <h3>{theory.name}</h3>
                    <span className={`theory-badge ${theory.applies ? 'applies' : 'may-apply'}`}>
                      {theory.applies ? '✓ Applies' : '○ May Apply'}
                    </span>
                  </div>
                  <p className="theory-reason">{theory.reason}</p>
                  {theory.evidence && theory.evidence.length > 0 && (
                    <div className="theory-evidence">
                      <strong>Evidence needed:</strong>
                      <ul>
                        {theory.evidence.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {theory.cfrReference && (
                    <div className="theory-cfr">
                      <strong>Legal Reference:</strong> {theory.cfrReference}
                    </div>
                  )}
                  <div className="theory-strength">
                    Strength: {theory.strength}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: EVIDENCE & TASKS */}
        {activeSection === 'evidence' && (
          <div className="section">
            <h2>📄 Evidence & Tasks Checklist</h2>

            {Object.entries(matrixOutput.evidence).map(([category, items]: [string, any]) => (
              <div key={category} className="evidence-category">
                <h3>{category.replace(/([A-Z])/g, ' $1').trim()}</h3>
                <div className="evidence-items">
                  {items.required && items.required.length > 0 && (
                    <div className="evidence-section">
                      <h4>Required Evidence</h4>
                      <ul>
                        {items.required.map((item: string, i: number) => (
                          <li key={i} className="required-item">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {items.optional && items.optional.length > 0 && (
                    <div className="evidence-section">
                      <h4>Optional (Strengthens Claim)</h4>
                      <ul>
                        {items.optional.map((item: string, i: number) => (
                          <li key={i} className="optional-item">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SECTION 6: CFR DIAGNOSTIC CODES */}
        {activeSection === 'cfr' && (
          <div className="section">
            <h2>📖 CFR Diagnostic Codes</h2>
            <p className="section-intro">
              38 CFR Part 4 diagnostic codes for your conditions.
            </p>

            <div className="cfr-list">
              {matrixOutput.cfrCodes.map((code, index) => (
                <div key={index} className="cfr-card">
                  <div className="cfr-header">
                    <h3>{code.condition}</h3>
                    <span className="cfr-code">{code.diagnosticCode}</span>
                  </div>
                  <div className="cfr-ratings">
                    <div className="rating-row">
                      <span>Current Rating:</span>
                      <strong>{code.currentRating}%</strong>
                    </div>
                    {code.nextRating && (
                      <div className="rating-row">
                        <span>Next Rating Level:</span>
                        <strong>{code.nextRating}%</strong>
                      </div>
                    )}
                  </div>
                  <div className="cfr-criteria">
                    <strong>Criteria for {code.currentRating}%:</strong>
                    <p>{code.criteria}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 7: SECONDARY CONDITIONS */}
        {activeSection === 'secondary' && (
          <div className="section">
            <h2>🔗 Secondary Condition Finder</h2>
            <p className="section-intro">
              Conditions that may be caused or aggravated by your service-connected disabilities.
            </p>

            <div className="secondary-list">
              {matrixOutput.secondaryConditions.map((pair, index) => (
                <div key={index} className="secondary-card">
                  <div className="secondary-header">
                    <div className="primary-condition">{pair.primary}</div>
                    <div className="arrow">→</div>
                    <div className="secondary-condition">{pair.secondary}</div>
                  </div>
                  <div className="nexus-explanation">
                    <strong>Medical Nexus:</strong> {pair.nexus}
                  </div>
                  <div className="nexus-strength">
                    Strength: <span className={`strength-${pair.strength.toLowerCase()}`}>{pair.strength}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 8: HOUSING BENEFITS WIZARD */}
        {activeSection === 'housing' && (
          <div className="section">
            <h2>🏠 Housing Benefits</h2>
            <p className="section-intro">
              Federal, state, and local housing benefits based on your service, rating, and location.
            </p>

            {/* Federal Housing Benefits */}
            <div className="housing-category">
              <h3>Federal Housing Benefits</h3>
              <div className="benefits-grid">
                {/* VA Home Loan */}
                <div className="benefit-card">
                  <div className="benefit-header">
                    <h4>VA Home Loan</h4>
                    <span className="benefit-category">Federal</span>
                  </div>
                  <p className="benefit-description">
                    No down payment, no PMI, competitive interest rates. Available to veterans with qualifying service.
                  </p>
                  <div className="benefit-why">
                    <strong>Why you qualify:</strong> You have served in the {profile.branch} with {profile.dischargeType || 'qualifying'} discharge.
                  </div>
                  <a href="https://www.va.gov/housing-assistance/home-loans/" target="_blank" rel="noopener noreferrer" className="benefit-link">
                    Learn More & Apply →
                  </a>
                </div>

                {/* SAH/SHA Grants (if rating >= 50 or specific conditions) */}
                {profile.rating && profile.rating >= 50 && (
                  <div className="benefit-card">
                    <div className="benefit-header">
                      <h4>Specially Adapted Housing (SAH/SHA) Grant</h4>
                      <span className="benefit-category">Federal</span>
                    </div>
                    <p className="benefit-description">
                      Grants to help purchase or modify a home for accessibility needs (up to $101,754 for SAH, $20,387 for SHA).
                    </p>
                    <div className="benefit-why">
                      <strong>Why you may qualify:</strong> You have a {profile.rating}% rating. Available if you have qualifying disabilities affecting mobility.
                    </div>
                    <a href="https://www.va.gov/housing-assistance/disability-housing-grants/" target="_blank" rel="noopener noreferrer" className="benefit-link">
                      Learn More & Apply →
                    </a>
                  </div>
                )}

                {/* HUD-VASH (if homeless or at-risk) */}
                <div className="benefit-card">
                  <div className="benefit-header">
                    <h4>HUD-VASH (Housing Choice Voucher)</h4>
                    <span className="benefit-category">Federal</span>
                  </div>
                  <p className="benefit-description">
                    Rental assistance for veterans experiencing homelessness. Combines HUD vouchers with VA case management.
                  </p>
                  <a href="https://www.va.gov/homeless/hud-vash.asp" target="_blank" rel="noopener noreferrer" className="benefit-link">
                    Learn More →
                  </a>
                </div>

                {/* Native American Direct Loan (if applicable) */}
                <div className="benefit-card">
                  <div className="benefit-header">
                    <h4>Native American Direct Loan (NADL)</h4>
                    <span className="benefit-category">Federal</span>
                  </div>
                  <p className="benefit-description">
                    Home loans for eligible Native American veterans to purchase, build, or improve homes on Federal Trust Land.
                  </p>
                  <a href="https://www.va.gov/housing-assistance/native-american-direct-loan/" target="_blank" rel="noopener noreferrer" className="benefit-link">
                    Learn More →
                  </a>
                </div>
              </div>
            </div>

            {/* State Housing Benefits (Idaho example) */}
            {profile.state === 'Idaho' && (
              <div className="housing-category">
                <h3>Idaho State Housing Benefits</h3>
                <div className="benefits-grid">
                  <div className="benefit-card">
                    <div className="benefit-header">
                      <h4>Idaho Disabled Veteran Property Tax Exemption</h4>
                      <span className="benefit-category">State</span>
                    </div>
                    <p className="benefit-description">
                      Property tax reduction for disabled veterans owning and occupying a primary residence in Idaho.
                    </p>
                    <div className="benefit-why">
                      <strong>Why you qualify:</strong> Idaho resident with VA disability rating.
                    </div>
                    <a href="https://veterans.idaho.gov/benefits/property-tax-exemption/" target="_blank" rel="noopener noreferrer" className="benefit-link">
                      Learn More →
                    </a>
                  </div>

                  <div className="benefit-card">
                    <div className="benefit-header">
                      <h4>Idaho State Veterans Home</h4>
                      <span className="benefit-category">State</span>
                    </div>
                    <p className="benefit-description">
                      Long-term nursing care facility in Boise for eligible Idaho veterans.
                    </p>
                    <a href="https://veterans.idaho.gov/state-veterans-home/" target="_blank" rel="noopener noreferrer" className="benefit-link">
                      Learn More →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Evidence Checklist */}
            <div className="evidence-checklist">
              <h3>📄 Required Documents for Housing Benefits</h3>
              <ul>
                <li>DD214 (Certificate of Release or Discharge from Active Duty)</li>
                <li>VA disability rating letter (if applying for adapted housing)</li>
                <li>Proof of residency (for state benefits)</li>
                <li>Certificate of Eligibility (COE) for VA home loan</li>
              </ul>
            </div>
          </div>
        )}

        {/* SECTION 9: RETIREMENT & MILITARY PAY */}
        {activeSection === 'retirement' && (
          <div className="section">
            <h2>🎯 Retirement & Military Pay Benefits</h2>
            <p className="section-intro">
              Retirement pay, concurrent receipt, survivor benefits, and healthcare for military retirees.
            </p>

            {/* Retirement Pay Benefits */}
            <div className="retirement-category">
              <h3>Concurrent Receipt (CRDP & CRSC)</h3>
              <div className="benefits-grid">
                <div className="benefit-card">
                  <div className="benefit-header">
                    <h4>Concurrent Retirement and Disability Pay (CRDP)</h4>
                    <span className="benefit-category">Federal</span>
                  </div>
                  <p className="benefit-description">
                    Allows military retirees to receive both full military retired pay and VA disability compensation.
                  </p>
                  <div className="benefit-why">
                    <strong>Eligibility:</strong>
                    <ul>
                      <li>Retired from active duty with 20+ years OR medically retired</li>
                      <li>VA disability rating of 50% or higher</li>
                    </ul>
                  </div>
                  <a href="https://www.dfas.mil/retiredmilitary/disability/crdp/" target="_blank" rel="noopener noreferrer" className="benefit-link">
                    Learn More at DFAS →
                  </a>
                </div>

                <div className="benefit-card">
                  <div className="benefit-header">
                    <h4>Combat-Related Special Compensation (CRSC)</h4>
                    <span className="benefit-category">Federal</span>
                  </div>
                  <p className="benefit-description">
                    Tax-free monthly payment for combat-related disabilities. Alternative to CRDP.
                  </p>
                  <div className="benefit-why">
                    <strong>Eligibility:</strong>
                    <ul>
                      <li>Retired from military service OR medically retired</li>
                      <li>VA disability rating of 10% or higher</li>
                      <li>Disabilities must be combat-related</li>
                    </ul>
                  </div>
                  <a href="https://www.dfas.mil/retiredmilitary/disability/crsc/" target="_blank" rel="noopener noreferrer" className="benefit-link">
                    Learn More at DFAS →
                  </a>
                </div>
              </div>
            </div>

            {/* Survivor Benefits */}
            <div className="retirement-category">
              <h3>Survivor & Family Benefits</h3>
              <div className="benefits-grid">
                <div className="benefit-card">
                  <div className="benefit-header">
                    <h4>Survivor Benefit Plan (SBP)</h4>
                    <span className="benefit-category">Federal</span>
                  </div>
                  <p className="benefit-description">
                    Monthly annuity for eligible survivors after military retiree's death (up to 55% of retired pay).
                  </p>
                  <a href="https://www.dfas.mil/retiredmilitary/survivors/Survivor-Benefit-Program/" target="_blank" rel="noopener noreferrer" className="benefit-link">
                    Learn More →
                  </a>
                </div>

                <div className="benefit-card">
                  <div className="benefit-header">
                    <h4>Dependency and Indemnity Compensation (DIC)</h4>
                    <span className="benefit-category">Federal</span>
                  </div>
                  <p className="benefit-description">
                    Tax-free monthly benefit for surviving spouses, children, and parents of service members who died in service or from service-connected conditions.
                  </p>
                  <a href="https://www.va.gov/disability/dependency-indemnity-compensation/" target="_blank" rel="noopener noreferrer" className="benefit-link">
                    Learn More →
                  </a>
                </div>
              </div>
            </div>

            {/* TRICARE */}
            <div className="retirement-category">
              <h3>Healthcare Benefits</h3>
              <div className="benefits-grid">
                <div className="benefit-card">
                  <div className="benefit-header">
                    <h4>TRICARE for Retirees</h4>
                    <span className="benefit-category">Federal</span>
                  </div>
                  <p className="benefit-description">
                    Healthcare coverage for military retirees and families. Options include TRICARE Prime, Select, and For Life (age 65+).
                  </p>
                  <div className="benefit-why">
                    <strong>Eligibility:</strong> Retired from active duty with 20+ years OR medically retired.
                  </div>
                  <a href="https://www.tricare.mil/Plans/Eligibility" target="_blank" rel="noopener noreferrer" className="benefit-link">
                    Learn More →
                  </a>
                </div>
              </div>
            </div>

            {/* State Retirement Benefits */}
            {profile.state === 'Idaho' && (
              <div className="retirement-category">
                <h3>Idaho State Retirement Benefits</h3>
                <div className="benefits-grid">
                  <div className="benefit-card">
                    <div className="benefit-header">
                      <h4>Idaho Military Retirement Tax Exemption</h4>
                      <span className="benefit-category">State</span>
                    </div>
                    <p className="benefit-description">
                      Idaho does NOT tax military retirement pay. Your military pension is fully exempt from Idaho state income tax.
                    </p>
                    <a href="https://tax.idaho.gov/i-1091.cfm" target="_blank" rel="noopener noreferrer" className="benefit-link">
                      Learn More →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 10: APPEALS WIZARD (RATING DECISION LOGIC) */}
        {activeSection === 'appeals' && (
          <div className="section">
            <h2>⚠️ Appeals & Decision Review</h2>
            <p className="section-intro">
              <strong>Educational tool only. Not legal advice.</strong> Analyze your VA decision and learn about appeal options based on your rating narrative.
            </p>

            {/* Appeals Analysis Summary */}
            <div className="appeals-summary">
              <h3>Your Rating Decision Analysis</h3>
              <div className="analysis-stats">
                <div className="stat-card">
                  <div className="stat-number">{appealsAnalysis.totalIssues}</div>
                  <div className="stat-label">Total Issues</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number denied">{appealsAnalysis.deniedConditions}</div>
                  <div className="stat-label">Denied Conditions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number warning">{appealsAnalysis.lowRatedConditions}</div>
                  <div className="stat-label">Potentially Low-Rated</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{appealsAnalysis.effectiveDateIssues}</div>
                  <div className="stat-label">Effective Date Concerns</div>
                </div>
              </div>

              <button
                onClick={() => {
                  const checklist = generateAppealsChecklist(appealsAnalysis);
                  const blob = new Blob([checklist], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'appeals-evidence-checklist.txt';
                  a.click();
                }}
                className="download-button"
              >
                📥 Download Issues & Evidence Checklist
              </button>
            </div>

            {/* Issue Cards (Per Condition) */}
            <div className="issue-cards">
              <h3>Identified Issues (Per Condition)</h3>

              {appealsAnalysis.issueCards.length === 0 && (
                <div className="no-issues">
                  <p>No conditions found in your profile. Add disabilities to see potential appeal issues.</p>
                </div>
              )}

              {appealsAnalysis.issueCards.map((issue, index) => (
                <div key={index} className="issue-card-detailed">
                  {/* Issue Header */}
                  <div className="issue-header">
                    <h4>
                      {issue.currentStatus === 'denied' ? '❌' : '✅'} {issue.conditionName}
                    </h4>
                    <div className="issue-meta">
                      <span className={`status-badge ${issue.currentStatus}`}>
                        {issue.currentStatus === 'denied' ? 'DENIED' : `${issue.rating}% Granted`}
                      </span>
                      {issue.diagnosticCode && (
                        <span className="diagnostic-code">CFR {issue.diagnosticCode}</span>
                      )}
                    </div>
                  </div>

                  {/* VA Reason */}
                  <div className="va-reason">
                    <strong>VA's Decision:</strong> {issue.vaReason}
                  </div>

                  {/* Potential Concerns */}
                  {(issue.potentialConcerns.ratingTooLow ||
                    issue.potentialConcerns.denialReasonType ||
                    issue.potentialConcerns.effectiveDateConcern ||
                    issue.potentialConcerns.missedSecondaryOrPresumptive) && (
                    <div className="potential-concerns">
                      <strong>Potential Concerns:</strong>
                      <ul>
                        {issue.potentialConcerns.ratingTooLow && (
                          <li className="concern-item rating">
                            📉 <strong>Rating May Be Too Low:</strong> {issue.potentialConcerns.ratingTooLowExplanation}
                          </li>
                        )}
                        {issue.potentialConcerns.denialReasonType && (
                          <li className="concern-item denial">
                            ❌ <strong>Denial Type:</strong> {issue.potentialConcerns.denialReasonType.replace(/-/g, ' ')}
                          </li>
                        )}
                        {issue.potentialConcerns.effectiveDateConcern && (
                          <li className="concern-item date">
                            📅 <strong>Effective Date:</strong> {issue.potentialConcerns.effectiveDateExplanation}
                          </li>
                        )}
                        {issue.potentialConcerns.missedSecondaryOrPresumptive && (
                          <li className="concern-item secondary">
                            🔗 <strong>Missed Angle:</strong> {issue.potentialConcerns.missedSecondaryExplanation}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Evidence Suggestions */}
                  <div className="evidence-suggestions">
                    <strong>Evidence That May Help:</strong>
                    <ul>
                      {issue.evidenceSuggestions.map((ev, i) => (
                        <li key={i}>• {ev}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Appeal Options (Educational) */}
                  <div className="appeal-options-compact">
                    <strong>Your Appeal Options (Educational):</strong>
                    <div className="options-grid">
                      <div className="option-compact">
                        <div className="option-name">HLR</div>
                        <div className="option-timeline">{issue.appealOptions.hlr.timeline}</div>
                      </div>
                      <div className="option-compact">
                        <div className="option-name">Supplemental</div>
                        <div className="option-timeline">{issue.appealOptions.supplemental.timeline}</div>
                      </div>
                      <div className="option-compact">
                        <div className="option-name">Board</div>
                        <div className="option-timeline">{issue.appealOptions.board.timeline}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Appeal Options Reference (Educational) */}
            <div className="appeals-options-reference">
              <h3>Understanding Your Appeal Options</h3>
              <div className="appeals-options">
                <div className="appeal-option-card">
                  <h4>1️⃣ Higher-Level Review (HLR)</h4>
                  <p><strong>No new evidence allowed.</strong> Senior reviewer re-examines existing evidence.</p>
                  <a href="https://www.va.gov/decision-reviews/higher-level-review/" target="_blank" rel="noopener noreferrer">
                    Learn More on VA.gov →
                  </a>
                </div>

                <div className="appeal-option-card">
                  <h4>2️⃣ Supplemental Claim</h4>
                  <p><strong>New evidence REQUIRED.</strong> Submit new medical records, nexus opinions, or buddy statements.</p>
                  <a href="https://www.va.gov/decision-reviews/supplemental-claim/" target="_blank" rel="noopener noreferrer">
                    Learn More on VA.gov →
                  </a>
                </div>

                <div className="appeal-option-card">
                  <h4>3️⃣ Board Appeal</h4>
                  <p><strong>Veterans Law Judge review.</strong> Three dockets: Direct, Evidence, Hearing.</p>
                  <a href="https://www.va.gov/decision-reviews/board-appeal/" target="_blank" rel="noopener noreferrer">
                    Learn More on VA.gov →
                  </a>
                </div>
              </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="appeals-disclaimer">
              <h3>⚖️ Legal Disclaimer</h3>
              <p>rallyforge provides <strong>educational information only</strong>. We do NOT:</p>
              <ul>
                <li>Tell you which appeal option to choose</li>
                <li>Guarantee appeal outcomes</li>
                <li>Provide legal advice or representation</li>
                <li>File appeals on your behalf</li>
              </ul>
              <p>
                For legal representation, contact an accredited VA attorney, claims agent, or Veterans Service Organization (VSO).
              </p>
              <a href="https://www.va.gov/ogc/apps/accreditation/" target="_blank" rel="noopener noreferrer" className="benefit-link">
                Find Accredited Representatives →
              </a>
            </div>
          </div>
        )}

        {/* SECTION 11: TRANSITION RESOURCES */}
        {activeSection === 'transition' && transitionStatus.isTransitioning && (
          <div className="section">
            <h2>🎯 Transition & Separation Resources</h2>

            <div className="transition-status">
              {transitionStatus.daysUntilSeparation && (
                <div className="days-remaining">
                  <div className="days-number">{transitionStatus.daysUntilSeparation}</div>
                  <div className="days-label">Days Until Separation</div>
                </div>
              )}
              <div className="completion-bar">
                <div className="bar-label">TAP Checklist Progress</div>
                <div className="bar-container">
                  <div
                    className="bar-fill"
                    style={{ width: `${transitionStatus.completionPercentage}%` }}
                  ></div>
                </div>
                <div className="bar-text">
                  {transitionStatus.completedTasks} of {transitionStatus.totalTasks} tasks completed
                </div>
              </div>
            </div>

            <h3>Transition Benefits</h3>
            <div className="benefits-grid">
              {transitionBenefits.map(benefit => (
                <div key={benefit.id} className="benefit-card">
                  <div className="benefit-header">
                    <h4>{benefit.name}</h4>
                    <span className="benefit-category">{benefit.category}</span>
                  </div>
                  <p className="benefit-description">{benefit.description}</p>
                  <a href={benefit.officialUrl} target="_blank" rel="noopener noreferrer" className="benefit-link">
                    Learn More →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 11: DISCHARGE UPGRADE HELPER */}
        {activeSection === 'discharge-upgrade' && (
          <DischargeUpgradeHelper />
        )}

        {/* SECTION 12: SUMMARY + VA.GOV REDIRECT */}
        {activeSection === 'summary' && (
          <div className="section">
            <h2>✅ Claim Preparation Summary</h2>

            <div className="summary-overview">
              <h3>Your Profile</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <strong>Branch:</strong> {profile.branch}
                </div>
                <div className="summary-item">
                  <strong>Combined Rating:</strong> {vamath.roundedRating}%
                </div>
                <div className="summary-item">
                  <strong>Conditions:</strong> {(profile.disabilities || []).length}
                </div>
                <div className="summary-item">
                  <strong>Benefits:</strong> {matrixOutput.benefits.eligible.length}
                </div>
              </div>

              <h3>Next Steps</h3>
              <ol className="next-steps">
                <li>Review all sections of this dashboard</li>
                <li>Gather required evidence</li>
                <li>Download your summary (optional)</li>
                <li>File your claim on VA.gov</li>
              </ol>

              <div className="va-redirect-section">
                <h3>Ready to File?</h3>
                <p>
                  This platform has prepared your information. Now it's time to file your claim
                  on the official VA website.
                </p>
                <a
                  href="https://www.va.gov/disability/file-disability-claim/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="va-button"
                >
                  File Your Claim on VA.gov →
                </a>
                <p className="disclaimer">
                  <strong>Important:</strong> rallyforge does not file claims. We prepare and educate only.
                  You must file your claim directly with the VA.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .unified-dashboard {
          min-height: 100vh;
          background: #f7fafc;
        }

        .dashboard-header {
          color: white;
          padding: 3rem 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .header-info h1 {
          margin: 0 0 0.5rem 0;
          font-size: 2.5rem;
        }

        .header-subtitle {
          margin: 0;
          opacity: 0.9;
        }

        .rating-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          margin-top: 0.5rem;
          font-weight: bold;
        }

        .dashboard-nav {
          background: white;
          border-bottom: 2px solid #e2e8f0;
          display: flex;
          gap: 0.5rem;
          padding: 0 1rem;
          overflow-x: auto;
        }

        .nav-tab {
          background: none;
          border: none;
          padding: 1rem 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .nav-tab:hover {
          background: #f7fafc;
        }

        .nav-tab.active {
          border-bottom-color: #667eea;
          color: #667eea;
          font-weight: 600;
        }

        .nav-icon {
          font-size: 1.2rem;
        }

        .dashboard-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .section h2 {
          margin-top: 0;
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
        }

        .section-intro {
          color: #718096;
          margin-bottom: 1.5rem;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
        }

        .profile-card {
          background: #f7fafc;
          padding: 1.5rem;
          border-radius: 8px;
        }

        .card-label {
          color: #718096;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .card-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2d3748;
        }

        .combined-rating-display {
          text-align: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
        }

        .rating-circle {
          margin-bottom: 1rem;
        }

        .rating-number {
          font-size: 4rem;
          font-weight: bold;
        }

        .rating-label {
          font-size: 1.2rem;
        }

        .bilateral-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          display: inline-block;
        }

        .conditions-list {
          margin-bottom: 1rem;
        }

        .condition-item {
          background: #f7fafc;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 0.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .condition-name {
          font-weight: 600;
          flex: 1;
        }

        .condition-rating {
          background: #667eea;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-weight: bold;
        }

        .math-details summary {
          cursor: pointer;
          padding: 0.75rem;
          background: #f7fafc;
          border-radius: 8px;
          margin-top: 1rem;
        }

        .math-details pre {
          background: #2d3748;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          margin-top: 0.5rem;
        }

        .benefits-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #f7fafc;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: bold;
          color: #667eea;
        }

        .stat-label {
          color: #718096;
          margin-top: 0.5rem;
        }

        .benefits-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }

        .benefit-card {
          background: #f7fafc;
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .benefit-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 1rem;
        }

        .benefit-header h4 {
          margin: 0;
          flex: 1;
        }

        .benefit-category {
          background: #667eea;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
        }

        .benefit-description {
          color: #4a5568;
          margin-bottom: 1rem;
        }

        .benefit-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .theories-list,
        .cfr-list,
        .secondary-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .theory-card,
        .cfr-card,
        .secondary-card {
          background: #f7fafc;
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .theory-header,
        .cfr-header,
        .secondary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .theory-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .theory-badge.applies {
          background: #48bb78;
          color: white;
        }

        .theory-badge.may-apply {
          background: #ecc94b;
          color: #744210;
        }

        .evidence-category {
          margin-bottom: 2rem;
        }

        .evidence-items {
          background: #f7fafc;
          padding: 1.5rem;
          border-radius: 8px;
        }

        .evidence-section h4 {
          margin-top: 0;
        }

        .required-item::marker {
          color: #e53e3e;
        }

        .optional-item::marker {
          color: #48bb78;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .summary-item {
          background: #f7fafc;
          padding: 1rem;
          border-radius: 8px;
        }

        .next-steps {
          background: #f7fafc;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .va-redirect-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 12px;
          text-align: center;
        }

        .va-button {
          display: inline-block;
          background: white;
          color: #667eea;
          padding: 1rem 2rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: bold;
          font-size: 1.1rem;
          margin: 1rem 0;
        }

        .disclaimer {
          font-size: 0.875rem;
          opacity: 0.9;
          margin-top: 1rem;
        }

        /* Appeals Wizard Styles */
        .appeals-summary {
          background: #f7fafc;
          padding: 2rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .analysis-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: bold;
          color: #667eea;
        }

        .stat-number.denied {
          color: #e53e3e;
        }

        .stat-number.warning {
          color: #ed8936;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #718096;
          margin-top: 0.5rem;
        }

        .download-button {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: block;
          margin: 1.5rem auto 0;
          transition: background 0.2s;
        }

        .download-button:hover {
          background: #5a67d8;
        }

        .issue-cards {
          margin-bottom: 2rem;
        }

        .issue-card-detailed {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .issue-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f7fafc;
        }

        .issue-header h4 {
          margin: 0;
          font-size: 1.25rem;
          color: #2d3748;
        }

        .issue-meta {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: bold;
          text-transform: uppercase;
        }

        .status-badge.denied {
          background: #fed7d7;
          color: #c53030;
        }

        .status-badge.granted {
          background: #c6f6d5;
          color: #22543d;
        }

        .diagnostic-code {
          background: #edf2f7;
          color: #4a5568;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .va-reason {
          background: #f7fafc;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          color: #2d3748;
          font-size: 0.95rem;
        }

        .potential-concerns {
          margin-bottom: 1rem;
        }

        .potential-concerns ul {
          margin: 0.5rem 0 0 0;
          padding: 0;
          list-style: none;
        }

        .concern-item {
          background: #fffaf0;
          border-left: 4px solid #ed8936;
          padding: 0.75rem 1rem;
          margin-bottom: 0.5rem;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .concern-item.denial {
          background: #fff5f5;
          border-left-color: #e53e3e;
        }

        .concern-item.rating {
          background: #fffaf0;
          border-left-color: #ed8936;
        }

        .concern-item.date {
          background: #ebf8ff;
          border-left-color: #3182ce;
        }

        .concern-item.secondary {
          background: #f0fff4;
          border-left-color: #38a169;
        }

        .evidence-suggestions {
          background: #ebf4ff;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .evidence-suggestions ul {
          margin: 0.5rem 0 0 0;
          padding-left: 1rem;
          color: #2c5282;
        }

        .evidence-suggestions li {
          margin-bottom: 0.25rem;
        }

        .appeal-options-compact {
          border-top: 1px solid #e2e8f0;
          padding-top: 1rem;
        }

        .options-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-top: 0.75rem;
        }

        .option-compact {
          background: #f7fafc;
          padding: 0.75rem;
          border-radius: 6px;
          text-align: center;
        }

        .option-name {
          font-weight: bold;
          color: #2d3748;
          margin-bottom: 0.25rem;
          font-size: 0.9rem;
        }

        .option-timeline {
          font-size: 0.75rem;
          color: #718096;
        }

        .appeals-options-reference {
          background: #f7fafc;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
        }

        .no-issues {
          background: #f7fafc;
          padding: 2rem;
          border-radius: 8px;
          text-align: center;
          color: #718096;
        }

        @media (max-width: 768px) {
          .dashboard-nav {
            padding: 0;
          }

          .nav-label {
            display: none;
          }

          .profile-grid,
          .benefits-grid {
            grid-template-columns: 1fr;
          }

          .rating-number {
            font-size: 3rem;
          }

          .analysis-stats {
            grid-template-columns: 1fr 1fr;
          }

          .options-grid {
            grid-template-columns: 1fr;
          }

          .issue-header {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UnifiedDashboard;

