import {
  CRSCComputationResult,
  CRSCProfileData,
  CRSCEvidenceMappingResult,
  CRSCPacket,
  CRSCPacketConditionEntry,
  CRSCEvidenceItem
} from '../../types/crscTypes';
import { ConditionCombatProfile } from '../../types/crscTypes';

interface PacketGeneratorInput {
  veteranProfile: Record<string, any>;
  crscProfile: CRSCProfileData;
  computation: CRSCComputationResult | null;
  evidenceMap: CRSCEvidenceMappingResult | null;
}

function buildConditionEntries(
  combatConditions: ConditionCombatProfile[],
  evidenceMap: CRSCEvidenceMappingResult | null
): CRSCPacketConditionEntry[] {
  return combatConditions.map(condition => {
    const evidenceEntry = evidenceMap?.conditions.find(c => c.conditionId === condition.id);
    const evidenceReferences: CRSCEvidenceItem[] = evidenceEntry?.evidence || [];
    const combatCategory = evidenceEntry?.combatCategory || null;

    const justification = combatCategory
      ? `Marked as combat-related under ${combatCategory.replace(/_/g, ' ')}.`
      : 'Combat category not recorded.';

    return {
      conditionId: condition.id,
      name: condition.name,
      rating: condition.rating,
      combatCategory,
      evidenceReferences,
      justification
    };
  });
}

export function generateCRSCPacket(input: PacketGeneratorInput): CRSCPacket {
  const computation = input.computation;
  const crscSummary = computation
    ? {
        combatRelatedPercentage: computation.combatRelatedPercentage,
        crscEligibleAmount: computation.crscEligibleAmount,
        crscFinalPayment: computation.crscFinalPayment
      }
    : { combatRelatedPercentage: 0, crscEligibleAmount: 0, crscFinalPayment: 0 };

  const conditions = computation
    ? buildConditionEntries(computation.combatRelatedConditions, input.evidenceMap)
    : [];

  const evidenceIndex: CRSCEvidenceItem[] = input.evidenceMap
    ? input.evidenceMap.conditions.flatMap(c => c.evidence)
    : [];

  return {
    veteranInfo: {
      name: `${input.veteranProfile.firstName || ''} ${input.veteranProfile.lastName || ''}`.trim(),
      branch: input.veteranProfile.branch,
      contactEmail: input.veteranProfile.contactEmail,
      contactPhone: input.veteranProfile.contactPhone,
      ssnLast4: input.veteranProfile.ssnLast4
    },
    retirementInfo: {
      retirementType: input.crscProfile.retirementType,
      retiredPay: input.crscProfile.retiredPay,
      vaWaiver: input.crscProfile.vaWaiver
    },
    crscSummary,
    conditions,
    evidenceIndex,
    exportOptions: {
      pdfTemplateId: 'crsc-packet-v1',
      docxTemplateId: 'crsc-packet-v1'
    }
  };
}
