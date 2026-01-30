"""
Entitlement Theory Generation API
Generates educational theories of entitlement for denied VA disability claims.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
import os
from datetime import datetime
import json

router = APIRouter(prefix="/api/entitlement", tags=["entitlement"])

# Import AI engine (adjust based on your setup)
try:
    import sys
    import os
    sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
    from ai_engine.entitlement_engine import generate_entitlement_theory
except ImportError:
    # Fallback for development
    def generate_entitlement_theory(prompt: str) -> str:
        import json
        return json.dumps({
            "theory": "AI engine not configured. Please configure OpenAI API key in environment variables.",
            "nexusLogic": "- Unable to generate theory\n- Configure AI engine",
            "cfrReferences": ["38 CFR § 3.303 - Principles relating to service connection"],
            "medicalRationale": "AI engine not available",
            "suggestedEvidence": ["Configure AI engine to get personalized suggestions"]
        })


class QuestionnaireData(BaseModel):
    diagnosedDuringService: bool = False
    ongoingSymptoms: bool = False
    mentionedInVAExams: bool = False
    believedSecondary: bool = False
    relatedCondition: str = ""
    symptomsDescription: str = ""
    treatmentHistory: str = ""
    additionalNotes: str = ""


class ServiceConnectedCondition(BaseModel):
    id: str
    name: str
    rating: int
    isBilateral: bool = False
    bodyPart: str = ""
    dateGranted: Optional[str] = None
    description: Optional[str] = None


class DeniedCondition(BaseModel):
    id: str
    name: str
    connectionType: str = Field(..., pattern="^(direct|secondary|aggravation|presumptive|concurrent)$")
    description: str
    serviceHistory: str
    diagnosedDuringService: bool = False
    ongoingSymptoms: bool = False
    mentionedInVAExams: bool = False
    believedSecondary: bool = False
    relatedConditionId: Optional[str] = None
    symptoms: List[str] = []
    treatment: List[str] = []
    nexusEvidence: List[str] = []
    questionnaire: Optional[QuestionnaireData] = None


class EntitlementTheoryRequest(BaseModel):
    deniedCondition: DeniedCondition
    serviceConnectedConditions: List[ServiceConnectedCondition]
    questionnaire: Optional[QuestionnaireData] = None


class EntitlementTheoryResponse(BaseModel):
    theory: str
    nexusLogic: str
    cfrReferences: List[str]
    medicalRationale: str
    suggestedEvidence: List[str]


def build_ai_prompt(request: EntitlementTheoryRequest) -> str:
    """
    Constructs the AI prompt for generating theory of entitlement.

    This prompt template is designed to generate educational, policy-compliant
    theories of entitlement based on VA regulations.
    """

    denied = request.deniedCondition
    service_connected = request.serviceConnectedConditions
    questionnaire = denied.questionnaire or QuestionnaireData()

    # Build service-connected conditions context
    sc_conditions_text = "\n".join([
        f"- {c.name} (Rating: {c.rating}%{', Bilateral' if c.isBilateral else ''})"
        for c in service_connected
    ]) if service_connected else "None currently listed"

    # Build connection type context
    connection_guidance = {
        "direct": "Direct service connection requires proof that the condition occurred in or was caused by military service (38 CFR § 3.303).",
        "secondary": "Secondary service connection requires medical evidence (nexus) showing the denied condition is caused or aggravated by an already service-connected disability (38 CFR § 3.310).",
        "aggravation": "Aggravation requires proof that a pre-existing condition was permanently worsened beyond its natural progression during service (38 CFR § 3.306).",
        "presumptive": "Presumptive service connection applies to specific conditions that are legally presumed to be service-connected based on service location, exposure, or time period (38 CFR § 3.307-3.309).",
        "concurrent": "Concurrent service connection applies when a condition existed before service but was aggravated during specific active duty periods."
    }

    prompt = f"""You are a VA disability claims education specialist. Generate an educational theory of entitlement for the following denied VA disability claim.

IMPORTANT: This is for educational purposes only, not legal advice. Base your response on VA regulations (Title 38 CFR).

DENIED CONDITION INFORMATION:
- Condition Name: {denied.name}
- Connection Type Sought: {denied.connectionType.upper()}
- Description: {denied.description}
- Service History: {denied.serviceHistory}

CONNECTION TYPE GUIDANCE:
{connection_guidance.get(denied.connectionType, '')}

QUESTIONNAIRE RESPONSES:
- Diagnosed during service: {'Yes' if questionnaire.diagnosedDuringService else 'No'}
- Ongoing symptoms: {'Yes' if questionnaire.ongoingSymptoms else 'No'}
- Mentioned in VA exams: {'Yes' if questionnaire.mentionedInVAExams else 'No'}
- Believed to be secondary: {'Yes' if questionnaire.believedSecondary else 'No'}
{f"- Related to: {questionnaire.relatedCondition}" if questionnaire.relatedCondition else ""}
{f"- Symptoms: {questionnaire.symptomsDescription}" if questionnaire.symptomsDescription else ""}
{f"- Treatment history: {questionnaire.treatmentHistory}" if questionnaire.treatmentHistory else ""}
{f"- Additional notes: {questionnaire.additionalNotes}" if questionnaire.additionalNotes else ""}

CURRENT SERVICE-CONNECTED CONDITIONS:
{sc_conditions_text}

TASK:
Generate a comprehensive educational theory of entitlement that includes:

1. THEORY OF ENTITLEMENT (2-3 paragraphs):
   - Explain the legal basis for why this condition should be service-connected
   - Reference specific VA regulations (38 CFR sections)
   - Explain the connection between service and the condition
   - If secondary, explain the medical causal relationship to existing service-connected condition(s)

2. NEXUS LOGIC (bullet points):
   - Key medical or legal connections
   - Temporal relationships (when symptoms started vs. service dates)
   - Aggravation factors if applicable
   - Known medical patterns (e.g., "PTSD commonly causes sleep disturbances")

3. CFR REFERENCES (specific citations):
   - List relevant 38 CFR sections
   - Include section titles
   - Prioritize most applicable regulations

4. MEDICAL RATIONALE (2-3 sentences):
   - Explain the medical/scientific basis
   - Reference known medical relationships
   - Cite common VA patterns if applicable

5. SUGGESTED EVIDENCE (bullet points):
   - Types of medical evidence needed
   - Lay statement suggestions
   - Service record documents to locate
   - Nexus letter requirements

FORMAT YOUR RESPONSE AS JSON:
{{
  "theory": "The full theory of entitlement text...",
  "nexusLogic": "- Point 1\\n- Point 2\\n- Point 3",
  "cfrReferences": ["38 CFR § X.XXX - Title", "38 CFR § Y.YYY - Title"],
  "medicalRationale": "Medical explanation...",
  "suggestedEvidence": ["Evidence type 1", "Evidence type 2", "Evidence type 3"]
}}

Be specific, educational, and grounded in VA policy. Do not make claims about the veteran's specific case outcome."""

    return prompt


@router.post("/generate-theory", response_model=EntitlementTheoryResponse)
async def generate_theory(request: EntitlementTheoryRequest):
    """
    Generate an AI-powered theory of entitlement for a denied condition.

    This endpoint uses the AI engine to analyze the denied condition in context
    of existing service-connected disabilities and generate an educational theory
    with policy references.
    """

    try:
        # Build the AI prompt
        prompt = build_ai_prompt(request)

        # Log the request for audit purposes
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "condition": request.deniedCondition.name,
            "connection_type": request.deniedCondition.connectionType,
            "service_connected_count": len(request.serviceConnectedConditions)
        }

        # TODO: Implement proper logging
        # logger.info(f"Entitlement theory request: {log_entry}")

        # Call AI engine
        ai_response = generate_entitlement_theory(prompt)

        # Parse JSON response
        try:
            response_data = json.loads(ai_response)
        except json.JSONDecodeError:
            # Fallback if AI doesn't return proper JSON
            response_data = {
                "theory": ai_response,
                "nexusLogic": "Unable to parse structured nexus logic",
                "cfrReferences": ["38 CFR § 3.303 - Principles relating to service connection"],
                "medicalRationale": "Consult with medical professional for specific rationale",
                "suggestedEvidence": ["Medical records", "Nexus letter", "Lay statements"]
            }

        # Add disclaimer
        response_data["theory"] = response_data.get("theory", "") + "\n\n⚠️ DISCLAIMER: This theory is AI-generated for educational purposes only and does not constitute legal or medical advice. Individual cases vary significantly. Consult with a Veterans Service Officer (VSO) or VA-accredited attorney for personalized assistance with your claim."

        return EntitlementTheoryResponse(**response_data)

    except Exception as e:
        # logger.error(f"Error generating theory: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating theory of entitlement: {str(e)}"
        )


@router.post("/export-pdf")
async def export_pdf(request: Dict):
    """
    Export all entitlement theories to PDF.

    This endpoint generates a formatted PDF document containing all
    denied conditions and their AI-generated theories.
    """

    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
    from reportlab.lib import colors
    from io import BytesIO
    from fastapi.responses import StreamingResponse

    try:
        denied_conditions = request.get("deniedConditions", [])
        service_connected = request.get("serviceConnectedConditions", [])

        # Create PDF buffer
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter,
                                rightMargin=72, leftMargin=72,
                                topMargin=72, bottomMargin=18)

        # Container for PDF elements
        elements = []
        styles = getSampleStyleSheet()

        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=1  # Center
        )

        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#7c3aed'),
            spaceAfter=12,
            spaceBefore=12
        )

        # Title page
        elements.append(Paragraph("Entitlement Theory Report", title_style))
        elements.append(Paragraph(f"Generated: {datetime.now().strftime('%B %d, %Y')}", styles['Normal']))
        elements.append(Spacer(1, 0.5*inch))

        # Service-connected conditions summary
        elements.append(Paragraph("Service-Connected Conditions", heading_style))
        if service_connected:
            sc_data = [["Condition", "Rating"]]
            for condition in service_connected:
                sc_data.append([condition.get("name", ""), f"{condition.get('rating', 0)}%"])

            sc_table = Table(sc_data, colWidths=[4*inch, 1*inch])
            sc_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dbeafe')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#93c5fd'))
            ]))
            elements.append(sc_table)
        else:
            elements.append(Paragraph("No service-connected conditions listed", styles['Normal']))

        elements.append(Spacer(1, 0.3*inch))
        elements.append(PageBreak())

        # Denied conditions and theories
        for idx, condition in enumerate(denied_conditions, 1):
            elements.append(Paragraph(f"Denied Condition #{idx}: {condition.get('name', 'Unnamed')}", title_style))
            elements.append(Spacer(1, 0.2*inch))

            # Connection type
            elements.append(Paragraph("Connection Type", heading_style))
            elements.append(Paragraph(condition.get('connectionType', 'Not specified').title(), styles['Normal']))
            elements.append(Spacer(1, 0.1*inch))

            # Description
            elements.append(Paragraph("Description", heading_style))
            elements.append(Paragraph(condition.get('description', 'Not provided'), styles['Normal']))
            elements.append(Spacer(1, 0.1*inch))

            # Service history
            elements.append(Paragraph("Service History", heading_style))
            elements.append(Paragraph(condition.get('serviceHistory', 'Not provided'), styles['Normal']))
            elements.append(Spacer(1, 0.2*inch))

            # AI Theory
            if condition.get('aiTheory'):
                elements.append(Paragraph("Theory of Entitlement", heading_style))
                elements.append(Paragraph(condition['aiTheory'], styles['Normal']))
                elements.append(Spacer(1, 0.1*inch))

            # Medical Rationale
            if condition.get('aiMedicalRationale'):
                elements.append(Paragraph("Medical Rationale", heading_style))
                elements.append(Paragraph(condition['aiMedicalRationale'], styles['Normal']))
                elements.append(Spacer(1, 0.1*inch))

            # CFR References
            if condition.get('aiReferences'):
                elements.append(Paragraph("CFR References", heading_style))
                for ref in condition['aiReferences']:
                    elements.append(Paragraph(f"• {ref}", styles['Normal']))
                elements.append(Spacer(1, 0.1*inch))

            # Add page break between conditions
            if idx < len(denied_conditions):
                elements.append(PageBreak())

        # Disclaimer page
        elements.append(PageBreak())
        elements.append(Paragraph("Important Disclaimer", title_style))
        disclaimer_text = """
        This document contains AI-generated educational information about theories of entitlement
        for VA disability claims. This information is provided for educational purposes only and
        does not constitute legal advice, medical advice, or a guarantee of claim approval.

        Every veteran's case is unique and depends on individual circumstances, medical evidence,
        service records, and other factors. The theories presented here are general educational
        guidance based on VA regulations (Title 38 CFR) and common claim patterns.

        You should consult with:
        - A Veterans Service Officer (VSO) for free claim assistance
        - A VA-accredited attorney for complex legal matters
        - A qualified medical professional for medical opinions and nexus letters

        Generated by Rally Forge - Educational Resource Platform
        This is not an official VA document.
        """
        elements.append(Paragraph(disclaimer_text, styles['Normal']))

        # Build PDF
        doc.build(elements)

        # Return PDF as streaming response
        buffer.seek(0)
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=entitlement-theories-{datetime.now().strftime('%Y%m%d')}.pdf"}
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating PDF: {str(e)}"
        )


# AI Prompt Template Documentation
"""
AI PROMPT TEMPLATE FOR THEORY GENERATION
=========================================

The prompt template in build_ai_prompt() is designed to generate comprehensive,
policy-compliant theories of entitlement. Key components:

1. CONTEXT BUILDING:
   - Denied condition details
   - Connection type sought (direct, secondary, etc.)
   - Service history and timeline
   - Questionnaire responses
   - Existing service-connected conditions

2. REGULATORY GUIDANCE:
   - Embeds specific 38 CFR sections relevant to connection type
   - Provides legal framework for each theory type
   - Ensures AI responses are grounded in actual VA policy

3. OUTPUT STRUCTURE:
   - Theory of entitlement (narrative)
   - Nexus logic (key points)
   - CFR references (citations)
   - Medical rationale (scientific basis)
   - Suggested evidence (actionable items)

4. QUALITY CONTROLS:
   - JSON format for structured parsing
   - Educational framing (not legal advice)
   - Specific, actionable guidance
   - Policy-grounded responses

CUSTOMIZATION:
Modify connection_guidance dict to add new connection types
Adjust prompt sections to emphasize different aspects
Add veteran-specific context fields as needed
"""

