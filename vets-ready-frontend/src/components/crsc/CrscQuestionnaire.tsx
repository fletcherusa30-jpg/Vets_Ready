import React, { useMemo, useState } from 'react';
import { useVeteranProfile } from '../../contexts/VeteranProfileContext';
import {
  buildCRSCQuestionnaire,
  mergeCRSCResponsesIntoProfile
} from '../../services/crsc/CRSCQuestionnaire';
import { recordAuditEvent, recordLineage } from '../../services/crsc/CrscLineageService';
import { CRSCProfileData, CombatFlags } from '../../types/crscTypes';

interface CombatFlagSelection {
  [conditionId: string]: CombatFlags;
}

export const CrscQuestionnaire: React.FC = () => {
  const { profile, updateProfile } = useVeteranProfile();
  const [vaRating, setVaRating] = useState<number>(profile.vaDisabilityRating || 0);
  const [vaWaiver, setVaWaiver] = useState<number>(profile.crscData?.vaWaiver || 0);
  const [retirementType, setRetirementType] = useState<string>(profile.crscData?.retirementType || '');
  const [documentationAvailable, setDocumentationAvailable] = useState<string[]>(profile.crscData?.documentationAvailable || []);
  const [combatFlags, setCombatFlags] = useState<CombatFlagSelection>(profile.crscData?.combatFlagsPerCondition || {});

  const conditionNames = useMemo(
    () => (profile.serviceConnectedConditions || []).map(c => c.name || ''),
    [profile.serviceConnectedConditions]
  );

  const sections = useMemo(() => buildCRSCQuestionnaire(conditionNames), [conditionNames]);

  const flagKeyMap: Record<string, keyof CombatFlags> = {
    armed_conflict: 'armedConflict',
    hazardous_service: 'hazardousService',
    simulated_war: 'simulatedWar',
    instrumentality_of_war: 'instrumentalityOfWar',
    purple_heart: 'purpleHeart',
    not_combat_related: 'notCombatRelated'
  };

  const toggleDocumentation = (value: string) => {
    setDocumentationAvailable(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const toggleCombatFlag = (conditionName: string, rawFlag: string) => {
    const flag = flagKeyMap[rawFlag] || (rawFlag as keyof CombatFlags);
    setCombatFlags(prev => {
      const existing = prev[conditionName] || {};
      return {
        ...prev,
        [conditionName]: {
          ...existing,
          [flag]: !existing[flag]
        }
      };
    });
  };

  const handleSave = async () => {
    const payload: Partial<CRSCProfileData> = {
      retirementType: retirementType || undefined,
      vaRating,
      vaWaiver,
      combatFlagsPerCondition: combatFlags,
      documentationAvailable
    };

    const merged = mergeCRSCResponsesIntoProfile({ crscData: profile.crscData }, payload);
    updateProfile({ crscData: merged, vaDisabilityRating: vaRating });

    await recordAuditEvent({
      actorType: 'VETERAN',
      action: 'UPDATED_PROFILE',
      module: 'CRSC_PROFILE',
      metadata: {
        vaRating,
        documentationCount: documentationAvailable.length
      }
    });

    await recordLineage({
      sourceModule: 'CRSC_PROFILE',
      inputs: [payload],
      output: merged,
      summary: 'Saved CRSC profile questionnaire (anonymized hashes only)',
      version: 'v1'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">CRSC Profile Questionnaire</h2>
      <p className="text-sm text-gray-600">Provide the minimum details needed to evaluate Combat-Related Special Compensation. Plain language, no legal advice.</p>

      {/* Section A — Retirement Status */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Retirement Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sections[0].questions[0].options?.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:border-blue-500">
              <input
                type="radio"
                name="retirementType"
                value={opt.value}
                checked={retirementType === opt.value}
                onChange={() => setRetirementType(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Section B — VA Disability Information */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">VA Disability Information</h3>
        <label className="block text-sm font-medium text-gray-800">Total VA Disability Rating (%)</label>
        <input
          type="number"
          className="w-full p-3 border rounded"
          value={vaRating}
          min={0}
          max={100}
          onChange={e => setVaRating(Number(e.target.value))}
        />
        <label className="block text-sm font-medium text-gray-800">VA Waiver Amount (monthly $)</label>
        <input
          type="number"
          className="w-full p-3 border rounded"
          value={vaWaiver}
          min={0}
          onChange={e => setVaWaiver(Number(e.target.value))}
        />
      </div>

      {/* Section C — Combat-Related Events */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Combat-Related Events</h3>
        {(profile.serviceConnectedConditions || []).map(condition => (
          <div key={condition.name} className="border rounded-lg p-3">
            <p className="font-semibold text-gray-900">{condition.name}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              {sections[2].questions[0].options?.map(opt => (
                <label key={`${condition.name}-${opt.value}`} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!combatFlags[condition.name]?.[flagKeyMap[opt.value] as keyof CombatFlags]}
                    onChange={() => toggleCombatFlag(condition.name, opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Section D — Documentation */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">Documentation Availability</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {sections[3].questions[0].options?.map(opt => (
            <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={documentationAvailable.includes(opt.value)}
                onChange={() => toggleDocumentation(opt.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save CRSC Profile
        </button>
      </div>
    </div>
  );
};
