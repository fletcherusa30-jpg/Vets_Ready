import React, { useState, useEffect } from 'react';

type ClaimType = 'original' | 'increased' | 'reopened' | 'presumptive' | 'supplemental' | 'dro' | 'intent_to_file';

interface CalculationResult {
  effectiveDate: string;
  explanation: string[];
  policyReferences: string[];
}

export const EffectiveDateCalculator: React.FC = () => {
  const [claimDate, setClaimDate] = useState('');
  const [entitlementDate, setEntitlementDate] = useState('');
  const [separationDate, setSeparationDate] = useState('');
  const [claimType, setClaimType] = useState<ClaimType>('original');
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [intentToFileDate, setIntentToFileDate] = useState('');
  const [priorDecisionDate, setPriorDecisionDate] = useState('');
  const [newEvidenceDate, setNewEvidenceDate] = useState('');

  const calculateEffectiveDate = () => {
    const explanation: string[] = [];
    const policyReferences: string[] = [];
    let effectiveDate = '';

    explanation.push('📅 **Effective Date Calculation**');
    explanation.push('');

    // Parse dates
    const claim = claimDate ? new Date(claimDate) : null;
    const entitlement = entitlementDate ? new Date(entitlementDate) : null;
    const separation = separationDate ? new Date(separationDate) : null;
    const intentFile = intentToFileDate ? new Date(intentToFileDate) : null;
    const priorDecision = priorDecisionDate ? new Date(priorDecisionDate) : null;
    const newEvidence = newEvidenceDate ? new Date(newEvidenceDate) : null;

    // Basic validation
    if (!claim) {
      explanation.push('⚠️ Please enter a claim date to calculate the effective date.');
      setResult({ effectiveDate: 'N/A', explanation, policyReferences });
      return;
    }

    explanation.push(`**Claim Type:** ${getClaimTypeName(claimType)}`);
    explanation.push(`**Claim Date:** ${formatDate(claim)}`);
    if (entitlement) explanation.push(`**Entitlement Date:** ${formatDate(entitlement)}`);
    if (separation) explanation.push(`**Separation Date:** ${formatDate(separation)}`);
    explanation.push('');

    switch (claimType) {
      case 'original':
        explanation.push('📋 **Original Claim Analysis (38 CFR § 3.400(b))**');
        explanation.push('');

        // Check if filed within 1 year of separation
        if (separation) {
          const oneYearAfterSeparation = new Date(separation);
          oneYearAfterSeparation.setFullYear(oneYearAfterSeparation.getFullYear() + 1);

          explanation.push('**Rule 1: Within One Year of Separation**');
          explanation.push('If you file within one year of separation, the effective date is the day after your separation date.');
          explanation.push('');

          if (claim <= oneYearAfterSeparation) {
            const dayAfterSeparation = new Date(separation);
            dayAfterSeparation.setDate(dayAfterSeparation.getDate() + 1);
            effectiveDate = formatDate(dayAfterSeparation);

            explanation.push(`✅ **Claim filed within 1 year of separation**`);
            explanation.push(`Separation date: ${formatDate(separation)}`);
            explanation.push(`Claim date: ${formatDate(claim)}`);
            explanation.push(`Days between: ${Math.floor((claim.getTime() - separation.getTime()) / (1000 * 60 * 60 * 24))} days`);
            explanation.push('');
            explanation.push(`🎯 **Effective Date: ${effectiveDate}** (day after separation)`);

            policyReferences.push('38 CFR § 3.400(b)(2)(i) - Claims filed within one year of separation');
          } else {
            explanation.push(`❌ Claim was filed MORE than 1 year after separation`);
            explanation.push(`One year deadline: ${formatDate(oneYearAfterSeparation)}`);
            explanation.push(`Your claim date: ${formatDate(claim)}`);
            explanation.push('');
            explanation.push('Applying standard effective date rules instead...');
            explanation.push('');
            effectiveDate = calculateStandardEffectiveDate(claim, entitlement, explanation);
            policyReferences.push('38 CFR § 3.400(b)(1) - Standard effective date rules');
          }
        } else {
          explanation.push('**Standard Effective Date Rule**');
          explanation.push('For most original claims, the effective date is the later of:');
          explanation.push('  • The date you filed your claim, OR');
          explanation.push('  • The date you became entitled to benefits');
          explanation.push('');
          effectiveDate = calculateStandardEffectiveDate(claim, entitlement, explanation);
          policyReferences.push('38 CFR § 3.400(b)(1) - Standard effective date');
        }

        // Check for Intent to File
        if (intentFile && intentFile < claim) {
          const oneYearAfterIntent = new Date(intentFile);
          oneYearAfterIntent.setFullYear(oneYearAfterIntent.getFullYear() + 1);

          if (claim <= oneYearAfterIntent) {
            explanation.push('');
            explanation.push('🎯 **Intent to File Submitted**');
            explanation.push('An Intent to File (ITF) can protect your effective date if you file the complete claim within 1 year.');
            explanation.push(`Intent to file date: ${formatDate(intentFile)}`);
            explanation.push(`Complete claim filed: ${formatDate(claim)}`);
            explanation.push(`✅ Filed within 1 year - effective date can be ITF date`);
            effectiveDate = formatDate(intentFile);
            policyReferences.push('38 CFR § 3.155 - Intent to file a claim');
          }
        }
        break;

      case 'increased':
        explanation.push('📈 **Increased Rating Claim (38 CFR § 3.400(o))**');
        explanation.push('');
        explanation.push('For claims to increase an existing rating, the effective date is:');
        explanation.push('  • The date you filed the increase claim, OR');
        explanation.push('  • The date medical evidence shows the worsening, if filed within 1 year');
        explanation.push('');

        if (entitlement && entitlement < claim) {
          const oneYearAfterWorsening = new Date(entitlement);
          oneYearAfterWorsening.setFullYear(oneYearAfterWorsening.getFullYear() + 1);

          if (claim <= oneYearAfterWorsening) {
            effectiveDate = formatDate(entitlement);
            explanation.push(`✅ Medical evidence shows worsening on: ${formatDate(entitlement)}`);
            explanation.push(`Claim filed within 1 year: ${formatDate(claim)}`);
            explanation.push(`🎯 **Effective Date: ${effectiveDate}** (date of worsening)`);
          } else {
            effectiveDate = formatDate(claim);
            explanation.push(`Medical evidence shows worsening on: ${formatDate(entitlement)}`);
            explanation.push(`❌ But claim filed MORE than 1 year after worsening`);
            explanation.push(`🎯 **Effective Date: ${effectiveDate}** (claim date)`);
          }
        } else {
          effectiveDate = formatDate(claim);
          explanation.push(`🎯 **Effective Date: ${effectiveDate}** (claim date)`);
        }

        policyReferences.push('38 CFR § 3.400(o)(1) - Increased rating claims');
        break;

      case 'reopened':
        explanation.push('🔄 **Reopened Claim (38 CFR § 3.400(q))**');
        explanation.push('');
        explanation.push('When you reopen a previously denied claim with new and material evidence:');
        explanation.push('  • Effective date is the date you filed to reopen, OR');
        explanation.push('  • Date the new evidence came into existence, if submitted within 1 year');
        explanation.push('');

        if (newEvidence) {
          const evidenceDate = new Date(newEvidenceDate);
          const oneYearAfterEvidence = new Date(evidenceDate);
          oneYearAfterEvidence.setFullYear(oneYearAfterEvidence.getFullYear() + 1);

          explanation.push(`New evidence dated: ${formatDate(evidenceDate)}`);
          explanation.push(`Reopened claim filed: ${formatDate(claim)}`);

          if (claim <= oneYearAfterEvidence) {
            effectiveDate = formatDate(evidenceDate);
            explanation.push(`✅ Filed within 1 year of new evidence`);
            explanation.push(`🎯 **Effective Date: ${effectiveDate}** (date of new evidence)`);
          } else {
            effectiveDate = formatDate(claim);
            explanation.push(`❌ Filed MORE than 1 year after new evidence`);
            explanation.push(`🎯 **Effective Date: ${effectiveDate}** (claim date)`);
          }
        } else {
          effectiveDate = formatDate(claim);
          explanation.push(`🎯 **Effective Date: ${effectiveDate}** (claim date)`);
        }

        policyReferences.push('38 CFR § 3.400(q) - Reopened claims');
        break;

      case 'presumptive':
        explanation.push('✨ **Presumptive Service Connection (38 CFR § 3.400(b)(2))**');
        explanation.push('');
        explanation.push('For presumptive conditions (Agent Orange, Gulf War, PACT Act):');
        explanation.push('  • If filed within 1 year of diagnosis: date condition began');
        explanation.push('  • If filed after 1 year: date of claim');
        explanation.push('');

        if (entitlement) {
          const oneYearAfterDiagnosis = new Date(entitlement);
          oneYearAfterDiagnosis.setFullYear(oneYearAfterDiagnosis.getFullYear() + 1);

          explanation.push(`Date condition began/diagnosed: ${formatDate(entitlement)}`);
          explanation.push(`Claim date: ${formatDate(claim)}`);

          if (claim <= oneYearAfterDiagnosis) {
            effectiveDate = formatDate(entitlement);
            explanation.push(`✅ Filed within 1 year of diagnosis`);
            explanation.push(`🎯 **Effective Date: ${effectiveDate}** (date condition began)`);
          } else {
            effectiveDate = formatDate(claim);
            explanation.push(`❌ Filed MORE than 1 year after diagnosis`);
            explanation.push(`🎯 **Effective Date: ${effectiveDate}** (claim date)`);
          }
        } else {
          effectiveDate = formatDate(claim);
          explanation.push(`🎯 **Effective Date: ${effectiveDate}** (claim date)`);
        }

        policyReferences.push('38 CFR § 3.400(b)(2) - Presumptive service connection');
        break;

      case 'supplemental':
        explanation.push('📎 **Supplemental Claim (AMA) (38 CFR § 3.2400)**');
        explanation.push('');
        explanation.push('**AMA Supplemental Claim Rules:**');
        explanation.push('Under 38 CFR § 3.2400, the effective date depends on whether new evidence supports an earlier entitlement date.');
        explanation.push('');
        explanation.push('🔍 **Key Principle:**');
        explanation.push('  • If new evidence shows entitlement from an earlier date → use that earlier date');
        explanation.push('  • If new evidence only supports current entitlement → use supplemental claim date');
        explanation.push('  • New evidence must be "new and relevant" per AMA standards');
        explanation.push('');

        // Analyze the evidence and dates
        if (priorDecision && entitlement && newEvidence) {
          const decisionDate = new Date(priorDecision);
          const oneYearAfterDecision = new Date(decisionDate);
          oneYearAfterDecision.setFullYear(oneYearAfterDecision.getFullYear() + 1);

          explanation.push('📋 **Your Supplemental Claim Details:**');
          explanation.push(`  • Prior decision date: ${formatDate(decisionDate)}`);
          explanation.push(`  • Supplemental claim filed: ${formatDate(claim)}`);
          explanation.push(`  • Entitlement/diagnosis date: ${formatDate(entitlement)}`);
          explanation.push(`  • New evidence created: ${formatDate(newEvidence)}`);
          explanation.push('');

          // Check if new evidence supports earlier entitlement
          if (entitlement < claim && entitlement >= decisionDate) {
            // Evidence shows entitlement between denial and supplemental claim
            effectiveDate = formatDate(entitlement);
            explanation.push('✅ **Earlier Effective Date Granted**');
            explanation.push('Your new evidence demonstrates entitlement from an earlier date.');
            explanation.push(`The condition/worsening occurred on: ${formatDate(entitlement)}`);
            explanation.push(`This is AFTER the prior decision (${formatDate(decisionDate)})`);
            explanation.push(`Therefore, the effective date can be backdated to: ${formatDate(entitlement)}`);
            explanation.push('');
            explanation.push(`🎯 **Effective Date: ${effectiveDate}** (entitlement date)`);
            explanation.push('');
            explanation.push('💰 **Back Pay Impact:**');
            const monthsBackPay = Math.floor((claim.getTime() - entitlement.getTime()) / (1000 * 60 * 60 * 24 * 30));
            explanation.push(`This grants you approximately ${monthsBackPay} months of retroactive benefits.`);
          } else if (entitlement < decisionDate) {
            // Evidence shows entitlement before original decision - check 1-year rule
            if (claim <= oneYearAfterDecision) {
              effectiveDate = formatDate(claim);
              explanation.push('⚠️ **Original Claim Date May Apply**');
              explanation.push('Your evidence shows the condition existed BEFORE the prior decision.');
              explanation.push('Filed within 1 year of decision - you may be able to argue for original claim effective date.');
              explanation.push('This requires showing the new evidence was not previously available.');
              explanation.push('');
              explanation.push(`🎯 **Effective Date: ${effectiveDate}** (supplemental claim date)`);
              explanation.push('**Note:** Consult VSO about potential for earlier date based on original claim.');
            } else {
              effectiveDate = formatDate(claim);
              explanation.push('❌ **Filed More Than 1 Year After Decision**');
              explanation.push('One-year deadline: ' + formatDate(oneYearAfterDecision));
              explanation.push('Effective date defaults to supplemental claim date.');
              explanation.push('');
              explanation.push(`🎯 **Effective Date: ${effectiveDate}** (supplemental claim date)`);
            }
          } else {
            // Entitlement date is same as or after claim date
            effectiveDate = formatDate(claim);
            explanation.push('📅 **Standard Supplemental Claim Date**');
            explanation.push('Entitlement date is on or after the supplemental claim date.');
            explanation.push('Effective date is the date you filed the supplemental claim.');
            explanation.push('');
            explanation.push(`🎯 **Effective Date: ${effectiveDate}** (supplemental claim date)`);
          }
        } else if (priorDecision) {
          // Only prior decision provided, no entitlement/evidence dates
          effectiveDate = formatDate(claim);
          explanation.push('📅 **Supplemental Claim Details:**');
          explanation.push(`  • Prior decision: ${formatDate(new Date(priorDecision))}`);
          explanation.push(`  • Supplemental claim filed: ${formatDate(claim)}`);
          explanation.push('');
          explanation.push('💡 **Tip:** Enter the entitlement/diagnosis date and new evidence date for more accurate calculation.');
          explanation.push('');
          explanation.push(`🎯 **Effective Date: ${effectiveDate}** (supplemental claim date - default)`);
        } else {
          effectiveDate = formatDate(claim);
          explanation.push('⚠️ **Missing Information**');
          explanation.push('To accurately calculate your supplemental claim effective date, please provide:');
          explanation.push('  • Prior decision date');
          explanation.push('  • Entitlement/diagnosis date (when condition began or worsened)');
          explanation.push('  • Date new evidence was created');
          explanation.push('');
          explanation.push(`🎯 **Effective Date: ${effectiveDate}** (supplemental claim date - default)`);
        }

        explanation.push('');
        explanation.push('📚 **AMA Supplemental Claim Requirements:**');
        explanation.push('  1. New and Relevant Evidence - Evidence not previously submitted');
        explanation.push('  2. Direct Relationship - Evidence must directly relate to the issue decided');
        explanation.push('  3. Material Evidence - Evidence must be capable of changing the decision');
        explanation.push('');
        explanation.push('⚖️ **M21-1 Guidance:**');
        explanation.push('Per VA M21-1, Part III, Subpart v, Section 2.G:');
        explanation.push('"The effective date of an award on a supplemental claim is the date');
        explanation.push('entitlement arose or the date the supplemental claim was filed, whichever is later."');

        policyReferences.push('38 CFR § 3.2400 - Supplemental claims (AMA)');
        policyReferences.push('VA M21-1, Part III, Subpart v, 2.G - Effective dates for supplemental claims');
        policyReferences.push('38 CFR § 3.400(b)(1) - Date entitlement arose');
        break;

      case 'dro':
        explanation.push('👨‍⚖️ **Higher-Level Review / DRO Review (38 CFR § 3.2500)**');
        explanation.push('');
        explanation.push('A Higher-Level Review (formerly DRO review) does not change the effective date.');
        explanation.push('The effective date remains the same as the original claim.');
        explanation.push('');
        effectiveDate = 'Same as original claim';
        explanation.push(`🎯 **Effective Date: ${effectiveDate}**`);
        explanation.push('');
        explanation.push('Note: If the Higher-Level Review results in a favorable decision, you receive:');
        explanation.push('  • Back pay from the original effective date');
        explanation.push('  • Increased monthly compensation going forward');

        policyReferences.push('38 CFR § 3.2500 - Higher-level review');
        break;

      case 'intent_to_file':
        explanation.push('📝 **Intent to File (ITF) (38 CFR § 3.155)**');
        explanation.push('');
        explanation.push('An Intent to File is a notice that preserves your potential effective date.');
        explanation.push('You must file the complete claim within 1 year of the ITF.');
        explanation.push('');

        if (intentFile) {
          const oneYearAfterIntent = new Date(intentFile);
          oneYearAfterIntent.setFullYear(oneYearAfterIntent.getFullYear() + 1);

          explanation.push(`Intent to File date: ${formatDate(intentFile)}`);
          explanation.push(`Deadline to file complete claim: ${formatDate(oneYearAfterIntent)}`);

          if (claim <= oneYearAfterIntent) {
            effectiveDate = formatDate(intentFile);
            explanation.push(`Complete claim filed: ${formatDate(claim)}`);
            explanation.push(`✅ Filed within 1 year`);
            explanation.push(`🎯 **Effective Date: ${effectiveDate}** (ITF date)`);
          } else {
            effectiveDate = formatDate(claim);
            explanation.push(`Complete claim filed: ${formatDate(claim)}`);
            explanation.push(`❌ Filed MORE than 1 year after ITF - ITF expired`);
            explanation.push(`🎯 **Effective Date: ${effectiveDate}** (actual claim date)`);
          }
        } else {
          explanation.push('Please enter your Intent to File date above.');
          effectiveDate = 'N/A';
        }

        policyReferences.push('38 CFR § 3.155 - Intent to file a claim');
        break;
    }

    // Add general references
    explanation.push('');
    explanation.push('---');
    explanation.push('');
    explanation.push('📚 **Policy References:**');
    policyReferences.forEach(ref => {
      explanation.push(`• ${ref}`);
    });

    explanation.push('');
    explanation.push('🔗 **Additional Resources:**');
    explanation.push('• VA.gov Effective Dates: https://www.va.gov/disability/effective-date/');
    explanation.push('• 38 CFR § 3.400 (Full regulation): https://www.law.cornell.edu/cfr/text/38/3.400');
    explanation.push('• VA Claims Insider Guide: https://www.vaclaimsinsider.com/effective-dates/');
    explanation.push('');
    explanation.push('⚠️ **Important Notes:**');
    explanation.push('• This calculator provides estimates based on typical scenarios');
    explanation.push('• Individual circumstances may vary');
    explanation.push('• Consult with a VSO or VA-accredited attorney for your specific case');
    explanation.push('• Effective dates can impact years of back pay - understanding them is critical');

    setResult({ effectiveDate, explanation, policyReferences });
  };

  const calculateStandardEffectiveDate = (claim: Date, entitlement: Date | null, explanation: string[]): string => {
    if (!entitlement) {
      explanation.push(`No entitlement date provided - using claim date`);
      explanation.push(`🎯 **Effective Date: ${formatDate(claim)}**`);
      return formatDate(claim);
    }

    const laterDate = claim > entitlement ? claim : entitlement;

    explanation.push(`Claim date: ${formatDate(claim)}`);
    explanation.push(`Entitlement date: ${formatDate(entitlement)}`);
    explanation.push(`Using the LATER of the two dates`);
    explanation.push(`🎯 **Effective Date: ${formatDate(laterDate)}**`);

    return formatDate(laterDate);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getClaimTypeName = (type: ClaimType): string => {
    const names: { [key in ClaimType]: string } = {
      'original': 'Original Claim',
      'increased': 'Increased Rating Claim',
      'reopened': 'Reopened Claim',
      'presumptive': 'Presumptive Service Connection',
      'supplemental': 'Supplemental Claim (AMA)',
      'dro': 'Higher-Level Review',
      'intent_to_file': 'Intent to File'
    };
    return names[type];
  };

  useEffect(() => {
    if (claimDate) {
      calculateEffectiveDate();
    }
  }, [claimDate, entitlementDate, separationDate, claimType, intentToFileDate, priorDecisionDate, newEvidenceDate]);

  return (
    <div className="bg-white rounded-lg shadow-2xl p-8 border-t-4 border-green-600">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">📅</span>
        <div>
          <h2 className="text-3xl font-bold text-gray-800">VA Effective Date Calculator</h2>
          <p className="text-gray-600">Calculate your effective date with full policy explanations</p>
        </div>
      </div>

      {/* Claim Type Selection */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
        <label className="block text-lg font-bold text-gray-800 mb-3">Claim Type</label>
        <select
          value={claimType}
          onChange={(e) => setClaimType(e.target.value as ClaimType)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
        >
          <option value="original">Original Claim (First time filing)</option>
          <option value="increased">Increased Rating Claim</option>
          <option value="reopened">Reopened Claim (Previously denied)</option>
          <option value="presumptive">Presumptive Service Connection</option>
          <option value="supplemental">Supplemental Claim (AMA - with new evidence)</option>
          <option value="dro">Higher-Level Review</option>
          <option value="intent_to_file">Intent to File</option>
        </select>
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Claim Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={claimDate}
            onChange={(e) => setClaimDate(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Date you filed your claim with VA</p>
        </div>

        {claimType !== 'dro' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Entitlement/Diagnosis Date
            </label>
            <input
              type="date"
              value={entitlementDate}
              onChange={(e) => setEntitlementDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Date you became entitled or condition began</p>
          </div>
        )}

        {(claimType === 'original' || claimType === 'presumptive') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Separation/Discharge Date
            </label>
            <input
              type="date"
              value={separationDate}
              onChange={(e) => setSeparationDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Date you separated from service (DD-214)</p>
          </div>
        )}

        {(claimType === 'original' || claimType === 'intent_to_file') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intent to File Date
            </label>
            <input
              type="date"
              value={intentToFileDate}
              onChange={(e) => setIntentToFileDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">If you filed an Intent to File (ITF)</p>
          </div>
        )}

        {claimType === 'supplemental' && (
          <>
            <div className="col-span-1 md:col-span-2 bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
              <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                <span>📎</span>
                Supplemental Claim (AMA) - Required Information
              </h4>
              <p className="text-sm text-purple-800 mb-4">
                For accurate effective date calculation, provide all dates below. The effective date can be backdated if your new evidence supports an earlier entitlement date.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prior Decision Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={priorDecisionDate}
                    onChange={(e) => setPriorDecisionDate(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">Date of original denial decision</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Evidence Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newEvidenceDate}
                    onChange={(e) => setNewEvidenceDate(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-xs text-gray-600 mt-1">Date new evidence was created (e.g., nexus letter date)</p>
                </div>
              </div>

              <div className="mt-3 p-3 bg-blue-100 rounded border border-blue-300">
                <p className="text-xs text-blue-900">
                  <strong>💡 Tip:</strong> The "Entitlement/Diagnosis Date" above should be when your condition actually began or worsened.
                  This is different from when the evidence was created. If your new medical evidence shows your condition started in 2020,
                  enter 2020 as the entitlement date even if the evidence was created in 2024.
                </p>
              </div>
            </div>
          </>
        )}

        {(claimType === 'reopened' || claimType === 'dro') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prior Decision Date
            </label>
            <input
              type="date"
              value={priorDecisionDate}
              onChange={(e) => setPriorDecisionDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Date of original decision</p>
          </div>
        )}

        {claimType === 'supplemental' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prior Decision Date
            </label>
            <input
              type="date"
              value={priorDecisionDate}
              onChange={(e) => setPriorDecisionDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Date of the decision you're supplementing</p>
          </div>
        )}

        {claimType === 'reopened' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Evidence Date
            </label>
            <input
              type="date"
              value={newEvidenceDate}
              onChange={(e) => setNewEvidenceDate(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Date the new evidence was created</p>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <>
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-8 mb-6">
            <div className="text-center">
              <div className="text-2xl mb-2">Your Calculated Effective Date</div>
              <div className="text-5xl font-bold">{result.effectiveDate}</div>
            </div>
          </div>

          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">📖 Detailed Explanation</h3>
            <div className="prose max-w-none">
              {result.explanation.map((line, index) => (
                <div key={index} className="mb-2">
                  {line.startsWith('**') ? (
                    <p className="font-bold text-lg text-gray-900 mt-4 mb-2">{line.replace(/\*\*/g, '')}</p>
                  ) : line.startsWith('🎯') || line.startsWith('✅') || line.startsWith('❌') ? (
                    <p className="font-bold text-blue-900 bg-blue-50 p-3 rounded my-2">{line}</p>
                  ) : line.startsWith('⚠️') ? (
                    <p className="font-bold text-yellow-900 bg-yellow-50 p-3 rounded my-2">{line}</p>
                  ) : line === '---' ? (
                    <hr className="my-4 border-gray-300" />
                  ) : line === '' ? (
                    <br />
                  ) : (
                    <p className="text-gray-700">{line}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
