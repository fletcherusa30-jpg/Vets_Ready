/**
 * CRDP vs CRSC Recommendation Engine
 * Compares programs and provides recommendation based on financial and eligibility factors
 */

export interface CrdpCrscRecommendationInput {
  crscEstimatedPayment: number;
  crdpEstimatedPayment: number;
  combatRelatedPercentage: number;
  taxBracket: "10%" | "12%" | "22%" | "24%" | "32%" | "35%" | "37%";
  retirementType: "NON_REGULAR" | "RESERVE_GUARD" | "MEDBOARD";
  hasVaWaiver: boolean;
  isEligibleForBoth: boolean;
}

export interface CrdpCrscTaxEstimate {
  crdpGrossPay: number;
  crdpFederalTax: number;
  crdpStateTax: number;
  crdpNetPay: number;
  crscGrossPay: number;
  crscFederalTax: number; // 0 (tax-free)
  crscStateTax: number; // state-dependent
  crscNetPay: number;
  annualTaxSavings: number;
}

export interface CrdpCrscRecommendation {
  recommendedProgram: "CRDP" | "CRSC" | "INSUFFICIENT_DATA";
  paymentDifference: number;
  netPayDifference: number;
  annualTaxSavings: number;
  rationale: string[];
  taxImpact: CrdpCrscTaxEstimate;
  considerations: string[];
}

/**
 * Calculate federal tax impact
 */
function calculateFederalTaxRate(bracket: string): number {
  const rates: Record<string, number> = {
    "10%": 0.10,
    "12%": 0.12,
    "22%": 0.22,
    "24%": 0.24,
    "32%": 0.32,
    "35%": 0.35,
    "37%": 0.37,
  };
  return rates[bracket] || 0.12;
}

/**
 * Estimate annual tax on income (simplified federal only)
 */
function estimateFederalTax(income: number, bracket: string): number {
  const rate = calculateFederalTaxRate(bracket);
  return income * rate;
}

/**
 * Estimate state tax (varies by state; assume 5% average)
 */
function estimateStateTax(income: number, taxable: boolean): number {
  if (!taxable) return 0; // CRSC is federal tax-free, but state varies
  return income * 0.05;
}

/**
 * Main recommendation function
 */
export function recommendCrdpVsCrsc(
  input: CrdpCrscRecommendationInput
): CrdpCrscRecommendation {
  const rationale: string[] = [];
  const considerations: string[] = [];

  if (!input.isEligibleForBoth) {
    if (input.crscEstimatedPayment > 0 && input.crdpEstimatedPayment === 0) {
      return {
        recommendedProgram: "CRSC",
        paymentDifference: input.crscEstimatedPayment,
        netPayDifference: input.crscEstimatedPayment,
        annualTaxSavings: 0,
        rationale: ["Not eligible for CRDP; CRSC is the only available option."],
        taxImpact: {
          crdpGrossPay: 0,
          crdpFederalTax: 0,
          crdpStateTax: 0,
          crdpNetPay: 0,
          crscGrossPay: input.crscEstimatedPayment,
          crscFederalTax: 0,
          crscStateTax: estimateStateTax(input.crscEstimatedPayment, false),
          crscNetPay:
            input.crscEstimatedPayment -
            estimateStateTax(input.crscEstimatedPayment, false),
          annualTaxSavings: 0,
        },
        considerations: [],
      };
    }
    if (input.crdpEstimatedPayment > 0 && input.crscEstimatedPayment === 0) {
      return {
        recommendedProgram: "CRDP",
        paymentDifference: 0,
        netPayDifference: 0,
        annualTaxSavings: 0,
        rationale: ["Not eligible for CRSC; CRDP is the only available option."],
        taxImpact: {
          crdpGrossPay: input.crdpEstimatedPayment,
          crdpFederalTax: estimateFederalTax(
            input.crdpEstimatedPayment,
            input.taxBracket
          ),
          crdpStateTax: estimateStateTax(input.crdpEstimatedPayment, true),
          crdpNetPay:
            input.crdpEstimatedPayment -
            estimateFederalTax(input.crdpEstimatedPayment, input.taxBracket) -
            estimateStateTax(input.crdpEstimatedPayment, true),
          crscGrossPay: 0,
          crscFederalTax: 0,
          crscStateTax: 0,
          crscNetPay: 0,
          annualTaxSavings: 0,
        },
        considerations: [],
      };
    }
    return {
      recommendedProgram: "INSUFFICIENT_DATA",
      paymentDifference: 0,
      netPayDifference: 0,
      annualTaxSavings: 0,
      rationale: ["Unable to determine eligibility for either program."],
      taxImpact: {
        crdpGrossPay: 0,
        crdpFederalTax: 0,
        crdpStateTax: 0,
        crdpNetPay: 0,
        crscGrossPay: 0,
        crscFederalTax: 0,
        crscStateTax: 0,
        crscNetPay: 0,
        annualTaxSavings: 0,
      },
      considerations: [
        "Please provide payment estimates for eligible programs.",
      ],
    };
  }

  // Calculate tax impact for both programs
  const crdpFederalTax = estimateFederalTax(
    input.crdpEstimatedPayment,
    input.taxBracket
  );
  const crdpStateTax = estimateStateTax(input.crdpEstimatedPayment, true);
  const crdpNetPay =
    input.crdpEstimatedPayment - crdpFederalTax - crdpStateTax;

  const crscStateTax = estimateStateTax(input.crscEstimatedPayment, false);
  const crscNetPay = input.crscEstimatedPayment - crscStateTax;

  const taxImpact: CrdpCrscTaxEstimate = {
    crdpGrossPay: input.crdpEstimatedPayment,
    crdpFederalTax,
    crdpStateTax,
    crdpNetPay,
    crscGrossPay: input.crscEstimatedPayment,
    crscFederalTax: 0,
    crscStateTax,
    crscNetPay,
    annualTaxSavings: crdpFederalTax + crdpStateTax - crscStateTax,
  };

  const paymentDifference =
    input.crscEstimatedPayment - input.crdpEstimatedPayment;
  const netPayDifference = crscNetPay - crdpNetPay;

  // Decision logic
  if (Math.abs(paymentDifference) < 100) {
    rationale.push(
      "Gross payment amounts are nearly equal; tax advantage is the primary differentiator."
    );
    if (netPayDifference > 0) {
      rationale.push(
        `CRSC provides approximately $${Math.round(netPayDifference)}/year more in net pay due to tax-free status.`
      );
      considerations.push(
        "Consider CRSC for maximum after-tax income over 20+ years of retirement."
      );
      return {
        recommendedProgram: "CRSC",
        paymentDifference,
        netPayDifference,
        annualTaxSavings: taxImpact.annualTaxSavings,
        rationale,
        taxImpact,
        considerations,
      };
    } else {
      rationale.push("Gross and net payments favor CRDP slightly.");
      return {
        recommendedProgram: "CRDP",
        paymentDifference,
        netPayDifference,
        annualTaxSavings: taxImpact.annualTaxSavings,
        rationale,
        taxImpact,
        considerations: [
          "Both programs are roughly equivalent; choose based on personal preference.",
        ],
      };
    }
  }

  if (paymentDifference > 100) {
    rationale.push(
      `CRSC has a higher gross payment by $${Math.round(paymentDifference)}/year.`
    );
    rationale.push(
      `Net advantage is $${Math.round(netPayDifference)}/year after taxes.`
    );
    considerations.push(
      "Higher CRSC amount likely due to higher combat-related percentage."
    );
    considerations.push(
      "CRSC remains tax-free, providing ongoing advantage over 20+ year retirement."
    );
    return {
      recommendedProgram: "CRSC",
      paymentDifference,
      netPayDifference,
      annualTaxSavings: taxImpact.annualTaxSavings,
      rationale,
      taxImpact,
      considerations,
    };
  } else {
    rationale.push(
      `CRDP has a higher gross payment by $${Math.round(-paymentDifference)}/year.`
    );
    rationale.push(
      `However, CRSC's tax-free status provides $${Math.round(taxImpact.annualTaxSavings)}/year in tax savings.`
    );
    const netAdvantageExceedsCrdp = netPayDifference > 0;
    if (netAdvantageExceedsCrdp) {
      rationale.push(
        `Net advantage favors CRSC by $${Math.round(netPayDifference)}/year.`
      );
      considerations.push(
        "Despite lower gross amount, CRSC provides more after-tax income."
      );
      return {
        recommendedProgram: "CRSC",
        paymentDifference,
        netPayDifference,
        annualTaxSavings: taxImpact.annualTaxSavings,
        rationale,
        taxImpact,
        considerations,
      };
    } else {
      rationale.push(
        `CRDP provides $${Math.round(-netPayDifference)}/year more net income.`
      );
      considerations.push(
        "Higher net income under CRDP despite tax burden; consider financial goals."
      );
      return {
        recommendedProgram: "CRDP",
        paymentDifference,
        netPayDifference,
        annualTaxSavings: taxImpact.annualTaxSavings,
        rationale,
        taxImpact,
        considerations,
      };
    }
  }
}

/**
 * Generate comparison summary for UI
 */
export function generateCrdpCrscComparison(
  input: CrdpCrscRecommendationInput
): {
  recommendation: CrdpCrscRecommendation;
  summary: string;
} {
  const recommendation = recommendCrdpVsCrsc(input);
  const summary =
    recommendation.recommendedProgram === "INSUFFICIENT_DATA"
      ? "Unable to generate recommendation. Please provide eligibility and payment data."
      : `${recommendation.recommendedProgram} is recommended, providing $${Math.round(
          recommendation.netPayDifference
        )}/year more in net pay and $${Math.round(
          recommendation.annualTaxSavings
        )}/year in tax savings vs. the alternative.`;

  return { recommendation, summary };
}
