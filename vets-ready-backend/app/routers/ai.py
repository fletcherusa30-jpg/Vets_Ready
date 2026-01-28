"""
AI Router - Endpoints for AI-powered claim assistance features.

Provides theory generation, secondary condition suggestions, and AI chat functionality.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List
import logging

from app.schemas.ai_schemas import (
    TheoryRequest,
    TheoryResponse,
    SecondarySuggestionsRequest,
    SecondarySuggestionsResponse,
    ChatRequest,
    ChatResponse,
    ClaimStrategyRequest,
    ClaimStrategyResponse
)
from app.services.ai_service import get_ai_service, AIService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["AI"])


@router.post("/generate-theory", response_model=TheoryResponse)
async def generate_theory(
    request: TheoryRequest,
    ai_service: AIService = Depends(get_ai_service)
) -> TheoryResponse:
    """
    Generate a comprehensive theory of entitlement for a condition.

    This endpoint uses AI to generate:
    - Legal framework (38 CFR citations)
    - Medical nexus rationale
    - Recommended evidence with priorities
    - Strength assessment
    - Challenges and opportunities

    **Educational Disclaimer:** This is AI-generated educational content, not legal advice.
    """
    try:
        theory = await ai_service.generate_theory(
            condition=request.condition,
            primary_conditions=request.primary_conditions
        )

        return TheoryResponse(theory=theory)

    except Exception as e:
        logger.error(f"Error in generate_theory: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error generating theory. Please try again or use the wizard's built-in guidance."
        )


@router.post("/secondary-suggestions", response_model=SecondarySuggestionsResponse)
async def secondary_suggestions(
    request: SecondarySuggestionsRequest,
    ai_service: AIService = Depends(get_ai_service)
) -> SecondarySuggestionsResponse:
    """
    Get AI-powered suggestions for secondary conditions based on a primary condition.

    Returns 3-5 plausible secondary conditions with:
    - Medical basis (literature references)
    - Commonality rating
    - VA approval patterns
    - Confidence score
    - Estimated rating range

    **Educational Disclaimer:** These are suggestions based on medical literature and VA patterns,
    not medical diagnoses. Consult a healthcare professional for diagnosis.
    """
    try:
        suggestions = await ai_service.generate_secondary_suggestions(
            primary_condition=request.primary_condition
        )

        return SecondarySuggestionsResponse(suggestions=suggestions)

    except Exception as e:
        logger.error(f"Error in secondary_suggestions: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error generating secondary suggestions. Please try again."
        )


@router.post("/analyze-strategy", response_model=ClaimStrategyResponse)
async def analyze_claim_strategy(
    request: ClaimStrategyRequest,
    ai_service: AIService = Depends(get_ai_service)
) -> ClaimStrategyResponse:
    """
    Analyze overall claim strategy and provide recommendations.

    Evaluates:
    - Complexity level (simple/medium/complex)
    - Total condition count
    - Strategic recommendations
    - Whether professional assistance is recommended

    **Educational Disclaimer:** This analysis is for educational purposes only.
    Always consult with an accredited VSO or attorney for personalized guidance.
    """
    try:
        analysis = await ai_service.analyze_claim_strategy(
            service_connected=request.service_connected,
            candidates=request.candidates,
            denied=request.denied
        )

        return ClaimStrategyResponse(analysis=analysis)

    except Exception as e:
        logger.error(f"Error in analyze_claim_strategy: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error analyzing claim strategy. Please try again."
        )


@router.post("/chat", response_model=ChatResponse)
async def ai_battle_buddy_chat(
    request: ChatRequest,
    ai_service: AIService = Depends(get_ai_service)
) -> ChatResponse:
    """
    AI Battle Buddy - Conversational assistant for VA disability claims.

    Provides educational information about:
    - VA disability claim process
    - Service connection theories
    - Evidence requirements
    - Effective dates
    - Financial benefits

    **Educational Disclaimer:** AI Battle Buddy provides educational information only,
    not legal or medical advice. Consult qualified professionals for personalized assistance.
    """
    try:
        message = await ai_service.chat(
            messages=request.messages,
            context=request.context
        )

        return ChatResponse(message=message)

    except Exception as e:
        logger.error(f"Error in chat: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="AI Battle Buddy is temporarily unavailable. Please try again."
        )


@router.get("/health")
async def health_check(ai_service: AIService = Depends(get_ai_service)):
    """
    Health check for AI service.

    Returns status of OpenAI integration and whether mock mode is enabled.
    """
    return {
        "status": "healthy",
        "mock_mode": ai_service.use_mock,
        "openai_configured": ai_service.client is not None,
        "model": ai_service.model if ai_service.model else "mock"
    }
