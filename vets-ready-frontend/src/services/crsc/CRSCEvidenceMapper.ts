import {
  CombatCategory,
  ConditionCombatProfile,
  CRSCEvidenceItem,
  CRSCEvidenceMappingResult,
  CRSCEvidenceConditionMap,
  EvidenceInventory
} from '../../types/crscTypes';

export interface EvidenceMappingInput {
  conditions: ConditionCombatProfile[];
  evidence: EvidenceInventory;
}

function deriveCombatCategory(flags: ConditionCombatProfile['combatFlags']): CombatCategory | null {
  if (!flags) return null;
  if (flags.purpleHeart) return 'purple_heart';
  if (flags.armedConflict) return 'armed_conflict';
  if (flags.hazardousService) return 'hazardous_service';
  if (flags.simulatedWar) return 'simulated_war';
  if (flags.instrumentalityOfWar) return 'instrumentality_of_war';
  if (flags.notCombatRelated) return 'not_combat_related';
  return null;
}

function scoreConfidence(evidenceList: CRSCEvidenceItem[]): 'LOW' | 'MEDIUM' | 'HIGH' {
  if (evidenceList.length >= 3) return 'HIGH';
  if (evidenceList.length === 2) return 'MEDIUM';
  return evidenceList.length === 1 ? 'LOW' : 'LOW';
}

export function mapEvidenceToConditions(input: EvidenceMappingInput): CRSCEvidenceMappingResult {
  const { conditions, evidence } = input;
  const output: CRSCEvidenceConditionMap[] = [];

  const combinedEvidence: CRSCEvidenceItem[] = [
    ...(evidence.strEntries || []),
    ...(evidence.dd214 || []),
    ...(evidence.lod || []),
    ...(evidence.aar || []),
    ...(evidence.awards || []),
    ...(evidence.vaDecision || []),
    ...(evidence.other || [])
  ];

  for (const condition of conditions) {
    const combatCategory = deriveCombatCategory(condition.combatFlags);

    const matchedEvidence = combinedEvidence.filter(item => {
      const nameMatch = item.summary?.toLowerCase().includes(condition.name.toLowerCase());
      const genericMatch = combatCategory === 'purple_heart' && item.type === 'AWARD';
      return nameMatch || genericMatch;
    });

    const gaps: string[] = [];
    if (matchedEvidence.length === 0) {
      gaps.push('No direct evidence linked to this condition');
    }
    if (!combatCategory || combatCategory === 'not_combat_related') {
      gaps.push('Combat-related category not confirmed');
    }

    output.push({
      conditionId: condition.id,
      name: condition.name,
      combatCategory,
      evidence: matchedEvidence,
      confidence: scoreConfidence(matchedEvidence),
      gaps
    });
  }

  return { conditions: output };
}
