/**
 * CRSC Qualification Wizard
 *
 * Combat-Related Special Compensation (CRSC) Eligibility Determination
 * Guides veterans through comprehensive qualification assessment
 *
 * CRSC provides tax-free compensation for combat-related disabilities
 * that would otherwise cause pension offset under VA waiver rules.
 */

import React, { useState } from 'react';

interface CRSCWizardProps {
  onComplete: (qualifies: boolean, data: CRSCQualificationData) => void;
  onCancel: () => void;
  initialData?: Partial<CRSCQualificationData>;
}

export interface CRSCQualificationData {
  // Step 1: Service & Retirement
  yearsOfService: number;
  receivesRetirementPay: boolean;
  retirementType: 'chapter-61' | 'chapter-61-tera' | '20-year' | 'reserve' | 'none';
  retiredBeforeAge60: boolean;

  // Step 2: VA Disability
  hasVADisability: boolean;
  disabilityRating: number;
  hasServiceConnectedConditions: boolean;

  // Step 3: Combat Relation
  hasCombatDeployment: boolean;
  deploymentLocations: string[];
  combatZones: string[];
  combatAwards: string[];
  injuryOccurredInCombat: boolean;

  // Step 4: Disability Details
  disabilityTypes: string[];
  hasDocumentation: boolean;
  documentationTypes: string[];

  // Step 5: CRDP vs CRSC
  crdpEligible: boolean;
  understandsDifference: boolean;

  // Qualification Result
  qualifies: boolean;
  qualificationReasons: string[];
  nextSteps: string[];
  estimatedBenefit: number;
}

const COMBAT_ZONES = [
  'Iraq (OIF/OND)',
  'Afghanistan (OEF/OFS)',
  'Kuwait (Desert Storm/Shield)',
  'Vietnam',
  'Korea (Korean War)',
  'Somalia',
  'Kosovo',
  'Syria (Operation Inherent Resolve)',
  'Persian Gulf',
  'Other hostile fire zone'
];

const COMBAT_AWARDS = [
  'Purple Heart',
  'Bronze Star with "V" device',
  'Silver Star',
  'Combat Action Badge (CAB)',
  'Combat Action Ribbon (CAR)',
  'Combat Infantryman Badge (CIB)',
  'Combat Medical Badge (CMB)',
  'Air Force Combat Action Medal',
  'Navy/Marine Corps Commendation Medal with "V"',
  'None of the above'
];

const DISABILITY_TYPES = [
  'Combat injury (IED, gunshot, shrapnel, etc.)',
  'Combat-related PTSD',
  'Traumatic brain injury (TBI) from combat',
  'Hearing loss from combat operations',
  'Vision/eye injury from combat operations',
  'Back/spine injury from combat operations',
  'Amputation from combat',
  'Multiple amputations from combat',
  'Loss of extremity function/mobility from combat',
  'Burns from combat',
  'Other combat-related service-connected condition'
];

const DOCUMENTATION_TYPES = [
  'Purple Heart award citation',
  'Combat casualty care records',
  'Field medical records',
  'After-action reports',
  'Unit deployment records',
  'Combat awards documentation',
  'Witness statements (buddy statements)',
  'VA rating decision mentioning combat',
  'Service treatment records (STRs) showing combat injury'
];

export const CRSCQualificationWizard: React.FC<CRSCWizardProps> = ({
  onComplete,
  onCancel,
  initialData
}) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<CRSCQualificationData>({
    yearsOfService: initialData?.yearsOfService || 0,
    receivesRetirementPay: initialData?.receivesRetirementPay || false,
    retirementType: initialData?.retirementType || 'none',
    retiredBeforeAge60: initialData?.retiredBeforeAge60 || false,
    hasVADisability: initialData?.hasVADisability || false,
    disabilityRating: initialData?.disabilityRating || 0,
    hasServiceConnectedConditions: initialData?.hasServiceConnectedConditions || false,
    hasCombatDeployment: initialData?.hasCombatDeployment || false,
    deploymentLocations: initialData?.deploymentLocations || [],
    combatZones: initialData?.combatZones || [],
    combatAwards: initialData?.combatAwards || [],
    injuryOccurredInCombat: initialData?.injuryOccurredInCombat || false,
    disabilityTypes: initialData?.disabilityTypes || [],
    hasDocumentation: initialData?.hasDocumentation || false,
    documentationTypes: initialData?.documentationTypes || [],
    crdpEligible: initialData?.crdpEligible || false,
    understandsDifference: initialData?.understandsDifference || false,
    qualifies: false,
    qualificationReasons: [],
    nextSteps: [],
    estimatedBenefit: 0
  });

  const updateData = (updates: Partial<CRSCQualificationData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const goNext = () => setStep(step + 1);
  const goBack = () => setStep(step - 1);

  const calculateQualification = (): CRSCQualificationData => {
    const reasons: string[] = [];
    const nextSteps: string[] = [];
    let qualifies = true;

    // Check basic eligibility
    // CRSC requires: Military/Medical retirement + VA rating 10%+ + Combat-related disability
    const isMilitaryRetired = data.retirementType === '20-year' || data.retirementType === 'reserve';
    const isMedicallyRetired = data.retirementType === 'chapter-61' || data.retirementType === 'chapter-61-tera';

    if (!isMilitaryRetired && !isMedicallyRetired) {
      qualifies = false;
      reasons.push('❌ Must be military retired (20+ years) OR medically retired to qualify for CRSC');
      nextSteps.push('CRSC is for military retirees whose VA disability compensation causes retirement pay offset.');
    }

    if (!data.hasVADisability || data.disabilityRating < 10) {
      qualifies = false;
      reasons.push('❌ Must have VA service-connected disability rating of at least 10% to qualify');
      nextSteps.push('File for VA disability compensation if you have service-connected conditions');
    }

    if (!data.hasCombatDeployment) {
      qualifies = false;
      reasons.push('❌ Must have combat deployment or hostile fire zone service');
      nextSteps.push('If you served in a combat zone but it\'s not documented, gather deployment orders and unit records');
    }

    if (data.combatAwards.length === 0 || data.combatAwards.includes('None of the above')) {
      reasons.push('⚠️ Combat awards strengthen your claim (Purple Heart, Bronze Star with V, etc.)');
      nextSteps.push('Request copies of all awards and decorations from National Personnel Records Center');
    }

    if (!data.injuryOccurredInCombat) {
      qualifies = false;
      reasons.push('❌ Disability must be combat-related (occurred during combat operations)');
      nextSteps.push('Gather evidence linking your disability to specific combat events');
    }

    if (!data.hasDocumentation) {
      reasons.push('⚠️ Strong documentation is critical for CRSC approval');
      nextSteps.push('Collect all available medical records, combat casualty care records, and deployment documents');
    }

    // Positive indicators
    if (qualifies) {
      reasons.push('✅ You receive military retirement pay');
      reasons.push(`✅ You have ${data.disabilityRating}% VA disability rating`);
      reasons.push('✅ You deployed to combat zone(s)');
      reasons.push('✅ Your disability is documented as combat-related');

      nextSteps.push('1. File DD Form 149 (Application for CRSC) with your branch');
      nextSteps.push('2. Include all combat-related medical documentation');
      nextSteps.push('3. Provide deployment orders and combat awards');
      nextSteps.push('4. Include buddy statements if available');
      nextSteps.push('5. Processing typically takes 6-12 months');
    }

    // CRDP vs CRSC comparison
    if (data.yearsOfService >= 20 && data.disabilityRating >= 50) {
      data.crdpEligible = true;
      reasons.push('ℹ️ You also qualify for CRDP (Concurrent Retirement and Disability Pay)');
      nextSteps.push('Compare CRDP vs CRSC - you can only receive one, choose the higher benefit');
    }

    // Estimate benefit
    const estimatedBenefit = data.disabilityRating > 0 ?
      Math.round(data.disabilityRating * 40) : 0; // Rough estimate

    return {
      ...data,
      qualifies,
      qualificationReasons: reasons,
      nextSteps,
      estimatedBenefit,
      crdpEligible: data.yearsOfService >= 20 && data.disabilityRating >= 50
    };
  };

  const handleComplete = () => {
    const result = calculateQualification();
    onComplete(result.qualifies, result);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 text-white p-6 rounded-t-xl">
          <h2 className="text-2xl font-bold mb-2">CRSC Qualification Wizard</h2>
          <p className="text-yellow-100">Combat-Related Special Compensation Eligibility Assessment</p>
          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6].map(num => (
              <div
                key={num}
                className={`h-2 flex-1 rounded ${
                  num < step ? 'bg-green-400' :
                  num === step ? 'bg-white' :
                  'bg-yellow-800'
                }`}
              />
            ))}
          </div>
          <p className="text-sm mt-2 text-yellow-100">Step {step} of 6</p>
        </div>

        <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* STEP 1: Service & Retirement */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-bold text-blue-900 mb-2">📋 Service & Retirement Status</h3>
                <p className="text-sm text-blue-800">
                  CRSC is available to military retirees whose retirement pay is reduced by VA disability compensation.
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-3 text-gray-800">
                  How many years of active duty service do you have?
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={data.yearsOfService}
                  onChange={(e) => updateData({ yearsOfService: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg font-semibold"
                />
                <p className="text-sm text-gray-600 mt-1">Include all active duty time (not reserve drill time)</p>
              </div>

              <div>
                <label className="block font-semibold mb-3 text-gray-800">
                  Do you currently receive military retirement pay?
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="retirement-pay"
                      checked={data.receivesRetirementPay === true}
                      onChange={() => updateData({ receivesRetirementPay: true })}
                      className="mt-1 w-5 h-5 text-yellow-600"
                    />
                    <div>
                      <span className="font-semibold">Yes, I receive retirement pay</span>
                      <p className="text-sm text-gray-600">Monthly pension from military retirement</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="retirement-pay"
                      checked={data.receivesRetirementPay === false}
                      onChange={() => updateData({ receivesRetirementPay: false })}
                      className="mt-1 w-5 h-5 text-yellow-600"
                    />
                    <div>
                      <span className="font-semibold">No, I don't receive retirement pay</span>
                      <p className="text-sm text-gray-600">Less than 20 years or other reason</p>
                    </div>
                  </label>
                </div>
              </div>

              {data.receivesRetirementPay && (
                <div>
                  <label className="block font-semibold mb-3 text-gray-800">
                    What type of retirement do you have?
                  </label>
                  <select
                    value={data.retirementType}
                    onChange={(e) => updateData({ retirementType: e.target.value as any })}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg"
                  >
                    <option value="none">Select retirement type...</option>
                    <option value="20-year">20+ Year Regular Retirement</option>
                    <option value="reserve">Reserve Retirement (Age 60+)</option>
                    <option value="chapter-61">Chapter 61 Medical Retirement</option>
                    <option value="chapter-61-tera">Temporary Early Retirement Authority (TERA)</option>
                  </select>
                  <p className="text-sm text-gray-600 mt-2">
                    Chapter 61 retirees with less than 20 years may qualify if disability is combat-related
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: VA Disability */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <h3 className="font-bold text-purple-900 mb-2">🏥 VA Disability Status</h3>
                <p className="text-sm text-purple-800">
                  You must have a VA service-connected disability rating to qualify for CRSC.
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-3 text-gray-800">
                  Do you have a VA disability rating?
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="has-disability"
                      checked={data.hasVADisability === true}
                      onChange={() => updateData({ hasVADisability: true })}
                      className="mt-1 w-5 h-5 text-purple-600"
                    />
                    <div>
                      <span className="font-semibold">Yes, I have a VA disability rating</span>
                      <p className="text-sm text-gray-600">Service-connected disability compensation</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="has-disability"
                      checked={data.hasVADisability === false}
                      onChange={() => updateData({ hasVADisability: false, disabilityRating: 0 })}
                      className="mt-1 w-5 h-5 text-purple-600"
                    />
                    <div>
                      <span className="font-semibold">No, I don't have a VA rating</span>
                      <p className="text-sm text-gray-600">Have not filed or claim was denied</p>
                    </div>
                  </label>
                </div>
              </div>

              {data.hasVADisability && (
                <>
                  <div>
                    <label className="block font-semibold mb-3 text-gray-800">
                      What is your VA combined disability rating?
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={data.disabilityRating}
                        onChange={(e) => updateData({ disabilityRating: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <div className="text-4xl font-bold text-purple-600 w-24 text-center">
                        {data.disabilityRating}%
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      This is your combined rating from your VA rating decision letter
                    </p>
                  </div>

                  <div>
                    <label className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={data.hasServiceConnectedConditions}
                        onChange={(e) => updateData({ hasServiceConnectedConditions: e.target.checked })}
                        className="mt-1 w-5 h-5 text-purple-600"
                      />
                      <div>
                        <span className="font-semibold">I have service-connected conditions</span>
                        <p className="text-sm text-gray-600">VA has determined these conditions are related to my military service</p>
                      </div>
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 3: Combat Service */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h3 className="font-bold text-red-900 mb-2">⚔️ Combat & Deployment History</h3>
                <p className="text-sm text-red-800 mb-3">
                  CRSC requires that your disability be combat-related. This means it resulted from:
                </p>
                <ul className="text-xs text-red-800 space-y-1 ml-4 list-disc">
                  <li><strong>Armed Conflict:</strong> Direct combat operations, enemy fire, IED attacks</li>
                  <li><strong>Hazardous Duty:</strong> Parachuting, airborne operations, flight operations, diving, demolition, EOD (Explosive Ordnance Disposal), special operations assignments</li>
                  <li><strong>Simulated War Exercises:</strong> Combat training, field exercises, war games, live-fire drills</li>
                  <li><strong>Instrumentality of War:</strong> Injuries from weapons, vehicles, or military equipment during wartime</li>
                </ul>
                <p className="text-xs text-red-800 mt-3 italic">
                  ℹ️ Many veterans don't realize their disabilities qualify as "combat-related" even if they never saw direct combat. Parachuting injuries, training accidents, and field exercises ALL count!
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
                <p className="text-sm text-blue-900">
                  <strong>Important:</strong> You do NOT need to have deployed to a combat zone to qualify for CRSC. Combat-related disabilities include hazardous duty assignments, training accidents, and service-connected injuries even without deployment.
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-3 text-gray-800">
                  How did you incur your combat-related disability?
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="combat-deployment"
                      checked={data.hasCombatDeployment === true}
                      onChange={() => updateData({ hasCombatDeployment: true })}
                      className="mt-1 w-5 h-5 text-red-600"
                    />
                    <div>
                      <span className="font-semibold">Combat zone deployment or hostile fire</span>
                      <p className="text-sm text-gray-600">Injured during deployment to a designated combat or hostile fire zone</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="combat-deployment"
                      checked={data.hasCombatDeployment === false && data.combatDeploymentType === 'hazardous'}
                      onChange={() => updateData({ hasCombatDeployment: false, combatZones: [], combatDeploymentType: 'hazardous' })}
                      className="mt-1 w-5 h-5 text-red-600"
                    />
                    <div>
                      <span className="font-semibold">Hazardous duty or training injury</span>
                      <p className="text-sm text-gray-600">Parachuting, EOD, flight training, airborne operations, or combat training accidents</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="combat-deployment"
                      checked={data.hasCombatDeployment === false && data.combatDeploymentType === 'other'}
                      onChange={() => updateData({ hasCombatDeployment: false, combatZones: [], combatDeploymentType: 'other' })}
                      className="mt-1 w-5 h-5 text-red-600"
                    />
                    <div>
                      <span className="font-semibold">Other service-connected combat injury</span>
                      <p className="text-sm text-gray-600">Service-connected injury from combat-related circumstances (simulated exercises, instrumentality of war, or other)</p>
                    </div>
                  </label>
                </div>
              </div>

              {data.hasCombatDeployment && (
                <>
                  <div>
                    <label className="block font-semibold mb-3 text-gray-800">
                      Select all combat zones where you served:
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {COMBAT_ZONES.map(zone => (
                        <label key={zone} className="flex items-start gap-2 p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={data.combatZones.includes(zone)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateData({ combatZones: [...data.combatZones, zone] });
                              } else {
                                updateData({ combatZones: data.combatZones.filter(z => z !== zone) });
                              }
                            }}
                            className="mt-1 w-4 h-4 text-red-600"
                          />
                          <span className="text-sm">{zone}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-3 text-gray-800">
                      Select all combat-related awards you've received:
                    </label>
                    <div className="space-y-2">
                      {COMBAT_AWARDS.map(award => (
                        <label key={award} className="flex items-start gap-2 p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={data.combatAwards.includes(award)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateData({ combatAwards: [...data.combatAwards.filter(a => a !== 'None of the above'), award] });
                              } else {
                                updateData({ combatAwards: data.combatAwards.filter(a => a !== award) });
                              }
                            }}
                            className="mt-1 w-4 h-4 text-red-600"
                          />
                          <span className="text-sm font-medium">{award}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 4: Disability Connection to Combat */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <h3 className="font-bold text-orange-900 mb-2">🩹 Combat-Related Disability</h3>
                <p className="text-sm text-orange-800">
                  Your disability must be directly related to combat operations, hazardous duty, or an instrumentality of war.
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-3 text-gray-800">
                  Did your disability occur during or result from combat operations?
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="combat-injury"
                      checked={data.injuryOccurredInCombat === true}
                      onChange={() => updateData({ injuryOccurredInCombat: true })}
                      className="mt-1 w-5 h-5 text-orange-600"
                    />
                    <div>
                      <span className="font-semibold">Yes, my disability is combat-related</span>
                      <p className="text-sm text-gray-600">Occurred during combat, hostile fire, or hazardous duty</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="combat-injury"
                      checked={data.injuryOccurredInCombat === false}
                      onChange={() => updateData({ injuryOccurredInCombat: false })}
                      className="mt-1 w-5 h-5 text-orange-600"
                    />
                    <div>
                      <span className="font-semibold">No, not directly from combat</span>
                      <p className="text-sm text-gray-600">Occurred during peacetime or non-combat duty</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-3 text-gray-800">
                  Select all that apply to your disability:
                </label>
                <p className="text-xs text-gray-600 mb-3 italic">
                  Check all conditions that resulted from your combat service. You can select multiple conditions.
                </p>
                <div className="space-y-2">
                  {DISABILITY_TYPES.map(type => (
                    <label key={type} className="flex items-start gap-2 p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={data.disabilityTypes.includes(type)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateData({ disabilityTypes: [...data.disabilityTypes, type] });
                          } else {
                            updateData({ disabilityTypes: data.disabilityTypes.filter(t => t !== type) });
                          }
                        }}
                        className="mt-1 w-4 h-4 text-orange-600"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Documentation */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <h3 className="font-bold text-green-900 mb-2">📄 Supporting Documentation</h3>
                <p className="text-sm text-green-800">
                  Strong documentation is critical for CRSC approval. You'll need evidence linking your disability to combat service.
                </p>
              </div>

              <div>
                <label className="block font-semibold mb-3 text-gray-800">
                  Select all documentation you currently have:
                </label>
                <p className="text-xs text-gray-600 mb-3 italic">
                  Check all that apply. Even partial documentation strengthens your CRSC application.
                </p>
                <div className="space-y-2">
                  {DOCUMENTATION_TYPES.map(doc => (
                    <label key={doc} className="flex items-start gap-2 p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={data.documentationTypes.includes(doc)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateData({ documentationTypes: [...data.documentationTypes, doc] });
                          } else {
                            updateData({ documentationTypes: data.documentationTypes.filter(d => d !== doc) });
                          }
                        }}
                        className="mt-1 w-4 h-4 text-green-600"
                      />
                      <span className="text-sm">{doc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 font-semibold mb-3">💡 Resources to Find Your CRSC Documents:</p>

                    <div className="space-y-3 text-sm text-yellow-800">
                      <div className="border-b border-yellow-200 pb-2">
                        <p className="font-semibold text-yellow-900">Military Service Records (Deployment, Orders, Awards)</p>
                        <ul className="list-disc ml-5 mt-1 space-y-1">
                          <li><strong>DPRIS (Defense Personnel Records Information Retrieval System)</strong>: <a href="https://www.dpris.dod.mil" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">dpris.dod.mil</a> - Search for deployment orders, service records, awards</li>
                          <li><strong>NPRC (National Personnel Records Center)</strong>: Call 1-314-801-0800 or submit SF Form 180 at <a href="https://www.archives.gov/veterans/military-service-records" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">archives.gov/veterans</a></li>
                          <li><strong>Service Branch Records</strong>: Contact your service branch's awards/records office directly</li>
                        </ul>
                      </div>

                      <div className="border-b border-yellow-200 pb-2">
                        <p className="font-semibold text-yellow-900">Combat Medical Records & VA Ratings</p>
                        <ul className="list-disc ml-5 mt-1 space-y-1">
                          <li><strong>VA eBenefits</strong>: <a href="https://www.va.gov/ebenefits" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">va.gov/ebenefits</a> - View your VA rating, medical records, and claim status</li>
                          <li><strong>VA Form 21-0995</strong>: Decision Review Request (appeal if initially denied CRSC)</li>
                          <li><strong>Combat Medical Records</strong>: Available through VA or NPRC - show combat-related injury treatment</li>
                          <li><strong>VA Rating Decision Letter</strong>: Your official service-connection documentation</li>
                        </ul>
                      </div>

                      <div className="border-b border-yellow-200 pb-2">
                        <p className="font-semibold text-yellow-900">CRSC-Specific Documents</p>
                        <ul className="list-disc ml-5 mt-1 space-y-1">
                          <li><strong>Purple Heart Award Citation</strong>: Request from National Personnel Records Center or service branch</li>
                          <li><strong>Combat Action Badge/Medal Documentation</strong>: Awarded for direct enemy contact</li>
                          <li><strong>After-Action Reports (AAR)</strong>: Unit records showing combat operations where injured</li>
                          <li><strong>Buddy Statements</strong>: Written testimony from fellow service members confirming combat-related injury</li>
                        </ul>
                      </div>

                      <div>
                        <p className="font-semibold text-yellow-900">Direct Contact</p>
                        <ul className="list-disc ml-5 mt-1 space-y-1">
                          <li><strong>VA Benefits Hotline</strong>: 1-800-827-1000</li>
                          <li><strong>CRSC Program Office</strong>: Ask for Combat-Related Special Compensation benefits</li>
                          <li><strong>VA Regional Office</strong>: Visit <a href="https://www.va.gov/find-locations" target="_blank" rel="noopener noreferrer" className="underline text-blue-700">va.gov/find-locations</a> to find your nearest office</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
            </div>
          )}

          {/* STEP 6: Results */}
          {step === 6 && (
            <div className="space-y-6">
              {(() => {
                const result = calculateQualification();
                return (
                  <>
                    {result.qualifies ? (
                      <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="text-5xl">✅</div>
                          <div>
                            <h3 className="text-2xl font-bold text-green-900">You Likely Qualify for CRSC!</h3>
                            <p className="text-green-800">Based on your responses, you meet the basic eligibility criteria</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="text-5xl">⚠️</div>
                          <div>
                            <h3 className="text-2xl font-bold text-red-900">Additional Requirements Needed</h3>
                            <p className="text-red-800">You may not currently qualify for CRSC, but there are steps you can take</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
                      <h4 className="font-bold text-gray-900 mb-4">📋 Qualification Summary:</h4>
                      <ul className="space-y-2">
                        {result.qualificationReasons.map((reason, idx) => (
                          <li key={idx} className="text-sm text-gray-700">{reason}</li>
                        ))}
                      </ul>
                    </div>

                    {result.estimatedBenefit > 0 && (
                      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                        <h4 className="font-bold text-blue-900 mb-2">💰 Estimated Monthly Benefit:</h4>
                        <p className="text-4xl font-bold text-blue-600">${result.estimatedBenefit}</p>
                        <p className="text-sm text-blue-800 mt-2">
                          This is a rough estimate. Actual CRSC amount is determined by branch review boards.
                        </p>
                      </div>
                    )}

                    {result.crdpEligible && (
                      <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6">
                        <h4 className="font-bold text-purple-900 mb-2">ℹ️ CRDP vs CRSC:</h4>
                        <p className="text-sm text-purple-800 mb-3">
                          You qualify for both CRDP and CRSC. You can only receive ONE (not both). Here's the difference:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded border border-purple-200">
                            <h5 className="font-semibold text-purple-900 mb-2">CRDP (Automatic)</h5>
                            <ul className="text-xs text-purple-800 space-y-1 ml-4 list-disc">
                              <li>Automatic for 20+ years, 50%+ rating</li>
                              <li>No application needed</li>
                              <li>Full retirement + full VA disability</li>
                              <li>Faster to receive</li>
                            </ul>
                          </div>
                          <div className="bg-white p-4 rounded border border-purple-200">
                            <h5 className="font-semibold text-purple-900 mb-2">CRSC (Must Apply)</h5>
                            <ul className="text-xs text-purple-800 space-y-1 ml-4 list-disc">
                              <li>Requires application & approval</li>
                              <li>Only combat-related portion</li>
                              <li>Tax-free (CRDP is taxable)</li>
                              <li>May be higher if all conditions combat-related</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                      <h4 className="font-bold text-yellow-900 mb-4">🎯 Next Steps:</h4>
                      <ol className="space-y-3">
                        {result.nextSteps.map((step, idx) => (
                          <li key={idx} className="text-sm text-yellow-900">
                            <span className="font-semibold">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                      <p className="text-xs text-gray-600">
                        <strong>Disclaimer:</strong> This is an educational tool only. Final CRSC eligibility is determined by your military branch's Physical Disability Board of Review (PDBR) or equivalent. Consult with a Veterans Service Officer (VSO) or legal advisor for personalized guidance.
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="bg-gray-100 p-6 rounded-b-xl flex justify-between">
          <button
            onClick={step === 1 ? onCancel : goBack}
            className="px-6 py-3 border-2 border-gray-400 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition"
          >
            {step === 1 ? 'Cancel' : '← Previous'}
          </button>
          <div className="text-sm text-gray-600 self-center">
            Step {step} of 6
          </div>
          {step < 6 ? (
            <button
              onClick={goNext}
              className="px-6 py-3 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700 transition shadow-md"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition shadow-md"
            >
              Complete Assessment ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRSCQualificationWizard;
