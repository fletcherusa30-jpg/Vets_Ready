"""
AI Engine for Entitlement Theory Generation
Uses OpenAI GPT or local LLM to generate educational theories of entitlement.
"""

import os
import json
from typing import Dict, Optional
import openai
from datetime import datetime

# Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
AI_MODEL = os.getenv("AI_MODEL", "gpt-4")  # or "gpt-3.5-turbo" for faster/cheaper
MAX_TOKENS = int(os.getenv("AI_MAX_TOKENS", "2000"))
TEMPERATURE = float(os.getenv("AI_TEMPERATURE", "0.7"))

# Initialize OpenAI (if using OpenAI API)
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY


def generate_entitlement_theory(prompt: str, model: Optional[str] = None) -> str:
    """
    Generate an entitlement theory using AI.

    Args:
        prompt: The formatted prompt containing all context
        model: Optional model override (defaults to AI_MODEL env var)

    Returns:
        JSON string containing theory, nexus logic, CFR refs, etc.
    """

    model = model or AI_MODEL

    # Check if OpenAI API is configured
    if not OPENAI_API_KEY:
        return generate_fallback_theory(prompt)

    try:
        # Call OpenAI API
        response = openai.ChatCompletion.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a VA disability claims education specialist with deep knowledge of Title 38 CFR. You provide educational theories of entitlement grounded in VA regulations. You always return valid JSON responses."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=MAX_TOKENS,
            temperature=TEMPERATURE,
            response_format={"type": "json_object"}  # Ensures JSON response (GPT-4 Turbo+)
        )

        # Extract response
        ai_response = response.choices[0].message.content

        # Validate JSON
        try:
            json.loads(ai_response)
            return ai_response
        except json.JSONDecodeError:
            # If not valid JSON, wrap it
            return json.dumps({
                "theory": ai_response,
                "nexusLogic": "See theory text above",
                "cfrReferences": ["38 CFR § 3.303 - Principles relating to service connection"],
                "medicalRationale": "Consult with medical professional for specific rationale",
                "suggestedEvidence": ["Medical records", "Nexus letter", "Lay statements"]
            })

    except Exception as e:
        print(f"Error calling AI API: {str(e)}")
        return generate_fallback_theory(prompt)


def generate_fallback_theory(prompt: str) -> str:
    """
    Generate a basic theory when AI is unavailable.

    This extracts key information from the prompt and generates
    a template-based response.
    """

    # Extract condition name and type from prompt
    condition_name = "the denied condition"
    connection_type = "service connection"

    try:
        if "Condition Name:" in prompt:
            condition_name = prompt.split("Condition Name:")[1].split("\n")[0].strip()
        if "Connection Type Sought:" in prompt:
            connection_type = prompt.split("Connection Type Sought:")[1].split("\n")[0].strip().lower()
    except:
        pass

    # Generate template response based on connection type
    if "secondary" in connection_type:
        theory = f"""
Theory of Entitlement for {condition_name} - Secondary Service Connection

Under 38 CFR § 3.310(a), a disability that is proximately due to or the result of a service-connected disease or injury shall be service connected. To establish secondary service connection, you must demonstrate:

1. A current diagnosed disability ({condition_name})
2. Evidence of a service-connected disability (your existing conditions)
3. Medical evidence (nexus) establishing that the current disability was caused by or aggravated by the service-connected disability

For {condition_name}, the theory of entitlement would focus on establishing the medical causal relationship between this condition and your existing service-connected disabilities. This typically requires:

- A nexus letter from a qualified medical provider explaining how your service-connected condition(s) caused or aggravated {condition_name}
- Medical records documenting the progression and relationship
- Lay statements describing your experience of symptoms

The VA must consider the theory of entitlement even if you don't explicitly claim secondary service connection, as long as the evidence raises this possibility.
        """

        nexus_logic = """- Current diagnosis of the denied condition
- Existing service-connected condition(s) documented
- Medical literature supports causal relationship
- Timeline shows condition developed after service-connected disability
- Symptoms are consistent with secondary causation"""

        cfr_refs = [
            "38 CFR § 3.310(a) - Secondary service connection",
            "38 CFR § 3.303 - Principles relating to service connection",
            "38 CFR § 4.1 - Essentials of evaluative rating"
        ]

        rationale = f"Medical literature and VA patterns demonstrate that {condition_name} can develop as a secondary consequence of other service-connected disabilities. A qualified medical opinion should evaluate the specific causal relationship in your case."

    elif "presumptive" in connection_type:
        theory = f"""
Theory of Entitlement for {condition_name} - Presumptive Service Connection

Under 38 CFR § 3.307-3.309, certain conditions are presumed to be service-connected when they manifest to a compensable degree within specific timeframes or based on specific service locations/exposures.

For {condition_name}, you should investigate whether:

1. The condition is on a presumptive list (Agent Orange, Gulf War, PACT Act, etc.)
2. You served in the qualifying location or time period
3. The condition manifested within the required timeframe (often 1 year from discharge for chronic conditions)

Common presumptive categories:
- Agent Orange (Vietnam, Thailand, Korean DMZ): Specific cancers, diabetes, Parkinson's, etc.
- Gulf War: Medically unexplained chronic multisymptom illnesses
- PACT Act: Burn pit and toxic exposure conditions
- Chronic diseases within 1 year of discharge

If your condition and service history match a presumptive category, you are not required to prove a direct nexus—the VA must presume service connection.
        """

        nexus_logic = """- Verify condition is on applicable presumptive list
- Confirm service in qualifying location/time period
- Document manifestation within required timeframe
- No direct nexus evidence required (presumption applies)
- VA has burden to rebut presumption"""

        cfr_refs = [
            "38 CFR § 3.307 - Presumptive service connection, general",
            "38 CFR § 3.309 - Disease subject to presumptive service connection",
            "38 CFR § 3.317 - Compensation for certain disabilities due to undiagnosed illnesses (Gulf War)",
            "38 CFR § 3.320 - Claims based on exposure to fine particulate matter"
        ]

        rationale = f"If {condition_name} qualifies under a presumptive service connection regulation, the VA must legally presume the condition is service-connected without requiring direct proof of in-service causation."

    else:  # Direct service connection
        theory = f"""
Theory of Entitlement for {condition_name} - Direct Service Connection

Under 38 CFR § 3.303(a), service connection may be granted for disability resulting from disease or injury incurred in or aggravated by active service. To establish direct service connection, you must demonstrate:

1. A current diagnosed disability ({condition_name})
2. Evidence of in-service occurrence or aggravation of the disease/injury
3. A medical nexus linking the current disability to the in-service event or disease

For {condition_name}, your theory of entitlement should focus on:

In-Service Evidence:
- Service medical records documenting the condition or symptoms
- Incident reports or records of injury/exposure
- Buddy statements from fellow service members
- Service personnel records showing relevant duties/exposures

Continuity of Symptoms:
- Medical records showing ongoing treatment since service (or explanation for gap)
- Lay statements describing continuous symptoms
- VA exam reports documenting chronic nature

Nexus:
- Medical opinion linking current condition to service
- Medical literature supporting the connection
- Temporal relationship (symptoms began during/shortly after service)
        """

        nexus_logic = """- Current medical diagnosis of the condition
- Service medical records or incident reports
- Timeline supports in-service origin
- Continuous symptoms or medical explanation for latency
- Medical opinion supporting service connection"""

        cfr_refs = [
            "38 CFR § 3.303 - Principles relating to service connection",
            "38 CFR § 3.304 - Direct service connection; wartime and peacetime",
            "38 CFR § 3.102 - Reasonable doubt"
        ]

        rationale = f"Direct service connection for {condition_name} requires establishing that the condition originated during military service or was directly caused by an event that occurred during service. Medical and lay evidence should work together to tell a coherent story of service origin."

    # Build JSON response
    response = {
        "theory": theory.strip(),
        "nexusLogic": nexus_logic.strip(),
        "cfrReferences": cfr_refs,
        "medicalRationale": rationale,
        "suggestedEvidence": [
            "Service medical records (STRs)",
            "Service personnel records",
            "VA medical records and exam reports",
            "Private medical records and treatment history",
            "Nexus letter/Independent Medical Opinion (IMO)",
            "Lay statements from veteran, family, and service colleagues",
            "Medical literature supporting the claimed connection"
        ]
    }

    return json.dumps(response, indent=2)


# Example usage and testing
if __name__ == "__main__":
    # Test prompt
    test_prompt = """You are a VA disability claims education specialist. Generate an educational theory of entitlement for the following denied VA disability claim.

DENIED CONDITION INFORMATION:
- Condition Name: Sleep Apnea
- Connection Type Sought: SECONDARY
- Description: Obstructive sleep apnea diagnosed in 2023, causing excessive daytime fatigue and requiring CPAP machine
- Service History: No diagnosis during service, but developed years after discharge

CONNECTION TYPE GUIDANCE:
Secondary service connection requires medical evidence (nexus) showing the denied condition is caused or aggravated by an already service-connected disability (38 CFR § 3.310).

QUESTIONNAIRE RESPONSES:
- Diagnosed during service: No
- Ongoing symptoms: Yes
- Mentioned in VA exams: Yes
- Believed to be secondary: Yes
- Related to: PTSD (70%)

CURRENT SERVICE-CONNECTED CONDITIONS:
- PTSD (Rating: 70%)
- Lower Back Pain (Rating: 40%)

TASK: Generate theory following the template..."""

    result = generate_entitlement_theory(test_prompt)
    print("Generated Theory:")
    print(result)
