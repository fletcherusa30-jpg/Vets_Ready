"""
AI Service for OpenAI integration.

Handles theory generation, secondary condition suggestions, and AI chat functionality.
"""

import os
import json
import logging
from typing import List, Optional, Dict
from openai import OpenAI, AsyncOpenAI
from app.schemas.ai_schemas import (
    AiEntitlementTheory,
    AiSuggestion,
    DisabilityInput,
    ChatMessage,
    ClaimStrategyAnalysis,
    PolicyReference,
    EvidenceRecommendation
)

logger = logging.getLogger(__name__)


class AIService:
    """Service for AI-powered claim assistance features"""

    def __init__(self):
        """Initialize OpenAI client"""
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.use_mock = os.getenv("USE_MOCK_AI", "false").lower() == "true"

        if not self.api_key and not self.use_mock:
            logger.warning("OPENAI_API_KEY not set and USE_MOCK_AI=false. AI features will fail.")

        if self.api_key:
            self.client = AsyncOpenAI(api_key=self.api_key)
            self.model = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
        else:
            self.client = None
            self.model = None

    async def generate_theory(
        self,
        condition: DisabilityInput,
        primary_conditions: Optional[List[DisabilityInput]] = None
    ) -> AiEntitlementTheory:
        """
        Generate a theory of entitlement for a condition.

        Args:
            condition: The condition to generate a theory for
            primary_conditions: Primary service-connected conditions (for secondary)

        Returns:
            AiEntitlementTheory with legal framework, evidence, and recommendations
        """
        if self.use_mock or not self.client:
            return self._get_mock_theory(condition, primary_conditions)

        try:
            system_prompt = self._get_theory_system_prompt()
            user_prompt = self._get_theory_user_prompt(condition, primary_conditions)

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,  # Low temperature for factual accuracy
                max_tokens=2000,
                response_format={"type": "json_object"}
            )

            theory_json = json.loads(response.choices[0].message.content)
            return AiEntitlementTheory(**theory_json)

        except Exception as e:
            logger.error(f"Error generating theory: {e}")
            # Fallback to mock on error
            return self._get_mock_theory(condition, primary_conditions)

    async def generate_secondary_suggestions(
        self,
        primary_condition: DisabilityInput
    ) -> List[AiSuggestion]:
        """
        Generate secondary condition suggestions based on a primary condition.

        Args:
            primary_condition: The primary service-connected condition

        Returns:
            List of AiSuggestion objects
        """
        if self.use_mock or not self.client:
            return self._get_mock_suggestions(primary_condition)

        try:
            system_prompt = self._get_suggestions_system_prompt()
            user_prompt = self._get_suggestions_user_prompt(primary_condition)

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.4,  # Slightly higher for creative suggestions
                max_tokens=1500,
                response_format={"type": "json_object"}
            )

            suggestions_json = json.loads(response.choices[0].message.content)
            return [AiSuggestion(**s) for s in suggestions_json.get("suggestions", [])]

        except Exception as e:
            logger.error(f"Error generating suggestions: {e}")
            return self._get_mock_suggestions(primary_condition)

    async def analyze_claim_strategy(
        self,
        service_connected: List[DisabilityInput],
        candidates: List[DisabilityInput],
        denied: List[DisabilityInput]
    ) -> ClaimStrategyAnalysis:
        """
        Analyze overall claim strategy and provide recommendations.

        Args:
            service_connected: Current service-connected disabilities
            candidates: Planned or current claims
            denied: Previously denied conditions

        Returns:
            ClaimStrategyAnalysis with complexity and recommendations
        """
        total_conditions = len(service_connected) + len(candidates) + len(denied)

        # Calculate complexity
        if total_conditions < 5:
            complexity = 'simple'
        elif total_conditions <= 10 and len(denied) < 3:
            complexity = 'medium'
        else:
            complexity = 'complex'

        # Generate recommendations
        recommendations = []
        professional_assistance = False

        if len(denied) > 0:
            recommendations.append(
                "You have previously denied conditions. Consider consulting a VSO or attorney "
                "to review denial reasons and build a stronger reopened claim strategy."
            )
            professional_assistance = True

        if complexity == 'complex':
            recommendations.append(
                "Your claim strategy is complex with many conditions. Professional assistance "
                "from an accredited VSO or VA attorney is strongly recommended."
            )
            professional_assistance = True

        # Check for secondary chain length
        secondary_count = sum(1 for c in candidates if c.service_connection_type == 'secondary')
        if secondary_count > 3:
            recommendations.append(
                "You have multiple secondary conditions. Ensure each has a strong medical nexus "
                "opinion linking it to the primary service-connected condition."
            )

        if total_conditions > 10:
            recommendations.append(
                "Consider filing claims in phases rather than all at once to manage complexity."
            )

        if not recommendations:
            recommendations.append(
                "Your claim strategy appears straightforward. Ensure you have all required evidence "
                "before filing."
            )

        return ClaimStrategyAnalysis(
            complexity=complexity,
            total_conditions=total_conditions,
            service_connected_count=len(service_connected),
            candidate_count=len(candidates),
            denied_count=len(denied),
            recommendations=recommendations,
            professional_assistance_recommended=professional_assistance
        )

    async def chat(
        self,
        messages: List[ChatMessage],
        context: Optional[Dict] = None
    ) -> ChatMessage:
        """
        AI Battle Buddy chat endpoint.

        Args:
            messages: Conversation history
            context: User's claim context (wizard state, etc.)

        Returns:
            Assistant's response message
        """
        if self.use_mock or not self.client:
            return ChatMessage(
                role="assistant",
                content="I'm currently in mock mode. OpenAI integration coming soon!"
            )

        try:
            system_prompt = self._get_chat_system_prompt(context)

            openai_messages = [{"role": "system", "content": system_prompt}]
            openai_messages.extend([
                {"role": msg.role, "content": msg.content} for msg in messages
            ])

            response = await self.client.chat.completions.create(
                model=self.model,
                messages=openai_messages,
                temperature=0.5,  # Balanced for conversational tone
                max_tokens=800
            )

            return ChatMessage(
                role="assistant",
                content=response.choices[0].message.content
            )

        except Exception as e:
            logger.error(f"Error in chat: {e}")
            return ChatMessage(
                role="assistant",
                content="I apologize, but I'm having trouble processing your request right now. "
                "Please try again or consult with a VSO for assistance."
            )

    # ==================== PROMPT TEMPLATES ====================

    def _get_theory_system_prompt(self) -> str:
        """System prompt for theory generation"""
        return """You are an expert VA disability claims assistant with deep knowledge of 38 CFR, M21-1 Manual, and VA case law. Your role is to generate educational theories of entitlement for veterans.

CRITICAL RULES:
- You provide educational information only, NOT legal advice
- Always cite 38 CFR sections and explain them in plain language
- Base recommendations on medical literature and VA approval patterns
- Be honest about weak theories; don't oversell
- Use veteran-friendly language; avoid legalese
- Never guarantee outcomes; focus on evidence requirements

When generating a theory of entitlement:
1. State the primary legal theory (direct, secondary, aggravation, or presumptive)
2. Cite relevant 38 CFR sections with plain-language explanations
3. Explain the medical nexus (if secondary/aggravation)
4. Recommend specific evidence with priorities (critical/important/helpful)
5. Assess strength as strong/moderate/weak
6. Identify challenges and opportunities

Return ONLY valid JSON matching this structure:
{
  "primaryTheory": "string",
  "policyReferences": [{"source": "string", "citation": "string", "relevance": "string"}],
  "recommendedEvidence": [{"type": "medical|service-records|lay-statement|nexus-opinion", "description": "string", "priority": "critical|important|helpful", "whereToObtain": "string"}],
  "strengthAssessment": "strong|moderate|weak",
  "nexusRationale": "string (if secondary)",
  "challenges": ["string"],
  "opportunities": ["string"]
}"""

    def _get_theory_user_prompt(
        self,
        condition: DisabilityInput,
        primary_conditions: Optional[List[DisabilityInput]]
    ) -> str:
        """User prompt for theory generation"""
        prompt = f"Generate a theory of entitlement for:\n\n"
        prompt += f"Condition: {condition.name}\n"
        prompt += f"Service Connection Type: {condition.service_connection_type}\n"

        if condition.diagnosed_in_service:
            prompt += f"Diagnosed in Service: Yes\n"
        if condition.current_diagnosis:
            prompt += f"Current Diagnosis: Yes\n"
        if condition.symptoms_during_service:
            prompt += f"Symptoms During Service: Yes\n"

        if condition.service_connection_type == 'secondary' and primary_conditions:
            prompt += f"\nPrimary Condition(s):\n"
            for primary in primary_conditions:
                prompt += f"- {primary.name} (Rating: {primary.rating}%)\n"

        prompt += "\nProvide the theory in the specified JSON format."
        return prompt

    def _get_suggestions_system_prompt(self) -> str:
        """System prompt for secondary suggestions"""
        return """You are a VA disability claims expert specializing in secondary condition discovery.

Generate 3-5 plausible secondary conditions based on medical literature and VA approval patterns.

For each suggestion:
- Explain the medical basis with references to research
- Rate commonality (very-common, common, possible, rare)
- Describe VA approval patterns
- Provide confidence score (0-1)
- Estimate potential rating range

Return ONLY valid JSON:
{
  "suggestions": [
    {
      "conditionName": "string",
      "medicalBasis": "string",
      "commonality": "very-common|common|possible|rare",
      "vaApprovalPattern": "string",
      "confidence": 0.0-1.0,
      "estimatedRating": "10-30%"
    }
  ]
}"""

    def _get_suggestions_user_prompt(self, primary_condition: DisabilityInput) -> str:
        """User prompt for secondary suggestions"""
        return f"""Generate secondary condition suggestions for:

Primary Condition: {primary_condition.name}
Rating: {primary_condition.rating}%

Consider common medical comorbidities and VA approval patterns."""

    def _get_chat_system_prompt(self, context: Optional[Dict]) -> str:
        """System prompt for AI Battle Buddy chat"""
        base_prompt = """You are the AI Battle Buddy, a helpful assistant for VA disability claims.

You provide educational information about:
- VA disability claim process
- Service connection theories
- Evidence requirements
- Effective dates
- Financial benefits

IMPORTANT:
- You are NOT a lawyer or doctor
- Provide educational information only
- Never guarantee outcomes
- Recommend VSO/attorney for complex cases
- Be empathetic and veteran-friendly"""

        if context:
            base_prompt += f"\n\nUser's Context:\n{json.dumps(context, indent=2)}"

        return base_prompt

    # ==================== MOCK DATA ====================

    def _get_mock_theory(
        self,
        condition: DisabilityInput,
        primary_conditions: Optional[List[DisabilityInput]]
    ) -> AiEntitlementTheory:
        """Mock theory generation for development"""
        is_secondary = condition.service_connection_type == 'secondary'

        if is_secondary and primary_conditions:
            primary_name = primary_conditions[0].name if primary_conditions else "service-connected condition"

            return AiEntitlementTheory(
                primaryTheory=f"Secondary service connection for {condition.name} is established through its "
                f"relationship to service-connected {primary_name}. Medical literature demonstrates significant "
                f"comorbidity between these conditions, and the VA recognizes this connection when supported by "
                f"appropriate medical evidence.",
                policyReferences=[
                    PolicyReference(
                        source="38 CFR § 3.310(a)",
                        citation="Secondary Service Connection",
                        relevance="Establishes that a disability caused by or aggravated by a service-connected "
                        "condition is itself service-connected."
                    )
                ],
                recommendedEvidence=[
                    EvidenceRecommendation(
                        type="medical",
                        description=f"Current diagnosis of {condition.name} from qualified medical professional",
                        priority="critical",
                        whereToObtain="VA provider or private physician"
                    ),
                    EvidenceRecommendation(
                        type="nexus-opinion",
                        description=f"Medical nexus opinion linking {condition.name} to {primary_name}",
                        priority="critical",
                        whereToObtain="Independent Medical Exam (IME) or VA C&P examiner"
                    )
                ],
                strengthAssessment="moderate",
                nexusRationale=f"Medical nexus between {primary_name} and {condition.name} is established in "
                f"medical literature. VA approval depends on quality of nexus evidence.",
                challenges=[
                    "Requires explicit medical nexus opinion",
                    "Must show condition is caused by or aggravated by primary condition"
                ],
                opportunities=[
                    "Medical literature supports this connection",
                    "VA recognizes this secondary relationship when properly documented"
                ]
            )
        else:
            # Direct service connection
            return AiEntitlementTheory(
                primaryTheory=f"Direct service connection for {condition.name} is established through evidence "
                f"of in-service incurrence or aggravation. Three elements required: (1) current diagnosis, "
                f"(2) in-service event/injury/disease, and (3) medical nexus linking current condition to service.",
                policyReferences=[
                    PolicyReference(
                        source="38 CFR § 3.303",
                        citation="Direct Service Connection",
                        relevance="Establishes three-element framework for direct service connection"
                    )
                ],
                recommendedEvidence=[
                    EvidenceRecommendation(
                        type="medical",
                        description=f"Current diagnosis of {condition.name}",
                        priority="critical",
                        whereToObtain="VA C&P exam or private provider"
                    ),
                    EvidenceRecommendation(
                        type="service-records",
                        description="Service medical records documenting treatment or diagnosis",
                        priority="critical" if condition.diagnosed_in_service else "important",
                        whereToObtain="Request from National Personnel Records Center (NPRC)"
                    )
                ],
                strengthAssessment="strong" if condition.diagnosed_in_service else "moderate",
                challenges=[] if condition.diagnosed_in_service else [
                    "No in-service diagnosis requires stronger nexus evidence"
                ],
                opportunities=[
                    "Clear evidence framework under 38 CFR § 3.303"
                ]
            )

    def _get_mock_suggestions(self, primary_condition: DisabilityInput) -> List[AiSuggestion]:
        """Mock secondary suggestions for development"""
        # PTSD/Mental Health
        if 'ptsd' in primary_condition.name.lower() or 'mental' in primary_condition.name.lower():
            return [
                AiSuggestion(
                    conditionName="Obstructive Sleep Apnea",
                    medicalBasis="PTSD/Sleep Apnea comorbidity ranges from 40-70% in veteran populations. "
                    "Hyperarousal and nightmares disrupt sleep architecture.",
                    commonality="very-common",
                    vaApprovalPattern="Frequently granted with sleep study and nexus opinion",
                    confidence=0.85,
                    estimatedRating="30-50%"
                ),
                AiSuggestion(
                    conditionName="Major Depressive Disorder",
                    medicalBasis="Up to 50% of veterans with PTSD also meet criteria for MDD. "
                    "Shared neurobiological pathways.",
                    commonality="very-common",
                    vaApprovalPattern="Often granted but may be considered part of PTSD rating if symptoms overlap",
                    confidence=0.90,
                    estimatedRating="10-70%"
                ),
                AiSuggestion(
                    conditionName="GERD (Gastroesophageal Reflux)",
                    medicalBasis="Chronic stress and anxiety increase gastric acid production. "
                    "Studies show 60%+ PTSD patients report GERD symptoms.",
                    commonality="common",
                    vaApprovalPattern="Granted with medical evidence of GERD and nexus to stress/anxiety",
                    confidence=0.65,
                    estimatedRating="10-30%"
                )
            ]

        # Knee conditions
        elif 'knee' in primary_condition.name.lower():
            return [
                AiSuggestion(
                    conditionName="Lower Back Pain",
                    medicalBasis="Knee injury causes altered gait mechanics, increasing lumbar spine stress. "
                    "Biomechanical studies show strong correlation.",
                    commonality="very-common",
                    vaApprovalPattern="Frequently granted with orthopedic evidence",
                    confidence=0.80,
                    estimatedRating="10-40%"
                ),
                AiSuggestion(
                    conditionName="Hip Pain (ipsilateral)",
                    medicalBasis="Compensatory gait from knee injury stresses hip joint. "
                    "Common in veterans with chronic knee conditions.",
                    commonality="common",
                    vaApprovalPattern="Granted with biomechanical nexus explanation",
                    confidence=0.75,
                    estimatedRating="10-20%"
                )
            ]

        # Back conditions
        elif 'back' in primary_condition.name.lower():
            return [
                AiSuggestion(
                    conditionName="Radiculopathy (nerve pain)",
                    medicalBasis="Spinal nerve compression from degenerative disc disease or injury. "
                    "Common secondary to chronic back conditions.",
                    commonality="very-common",
                    vaApprovalPattern="Frequently granted with EMG/nerve conduction studies",
                    confidence=0.85,
                    estimatedRating="10-60%"
                ),
                AiSuggestion(
                    conditionName="Sleep Disturbance",
                    medicalBasis="Chronic pain disrupts sleep quality. Studies show 65%+ chronic pain patients "
                    "have sleep disorders.",
                    commonality="common",
                    vaApprovalPattern="May be rated under back condition or separately",
                    confidence=0.70,
                    estimatedRating="0-10%"
                )
            ]

        # Tinnitus
        elif 'tinnitus' in primary_condition.name.lower():
            return [
                AiSuggestion(
                    conditionName="Migraines",
                    medicalBasis="Tinnitus and migraines share neural pathways. "
                    "Studies show increased migraine prevalence in tinnitus patients.",
                    commonality="possible",
                    vaApprovalPattern="Less common but granted with neurological evidence",
                    confidence=0.60,
                    estimatedRating="0-50%"
                )
            ]

        # Default
        else:
            return [
                AiSuggestion(
                    conditionName="Sleep Disturbance",
                    medicalBasis="Chronic conditions frequently disrupt sleep quality.",
                    commonality="common",
                    vaApprovalPattern="May be rated under primary condition or separately",
                    confidence=0.50,
                    estimatedRating="0-10%"
                )
            ]


# Singleton instance
_ai_service = None

def get_ai_service() -> AIService:
    """Get or create AI service instance"""
    global _ai_service
    if _ai_service is None:
        _ai_service = AIService()
    return _ai_service
