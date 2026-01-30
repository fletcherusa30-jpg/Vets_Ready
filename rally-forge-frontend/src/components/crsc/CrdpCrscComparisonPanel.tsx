import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  recommendCrdpVsCrsc,
  CrdpCrscRecommendationInput,
  CrdpCrscRecommendation,
} from "@/services/crsc/CrdpCrscRecommendationEngine";
import { AlertCircle, TrendingUp, DollarSign, FileText } from "lucide-react";

interface CrdpCrscComparisonPanelProps {
  crscEstimatedPayment: number;
  crdpEstimatedPayment: number;
  combatRelatedPercentage: number;
  taxBracket?: "10%" | "12%" | "22%" | "24%" | "32%" | "35%" | "37%";
  retirementType: "NON_REGULAR" | "RESERVE_GUARD" | "MEDBOARD";
  hasVaWaiver: boolean;
  isEligibleForBoth: boolean;
  onOpenSeasonClick?: () => void;
}

interface TaxBracketSelectorProps {
  value: string;
  onChange: (bracket: string) => void;
}

function TaxBracketSelector({ value, onChange }: TaxBracketSelectorProps) {
  const brackets = ["10%", "12%", "22%", "24%", "32%", "35%", "37%"];
  return (
    <div className="flex items-center gap-4">
      <label className="text-sm font-medium">Estimated Tax Bracket:</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2 border rounded-md text-sm"
      >
        {brackets.map((bracket) => (
          <option key={bracket} value={bracket}>
            {bracket}
          </option>
        ))}
      </select>
    </div>
  );
}

function CrdpCrscSummaryCard({
  program,
  grossPay,
  netPay,
  taxAmount,
  isTaxFree,
}: {
  program: string;
  grossPay: number;
  netPay: number;
  taxAmount: number;
  isTaxFree: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{program}</CardTitle>
        {isTaxFree && (
          <Badge className="w-fit bg-green-100 text-green-800">Tax-Free</Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-sm text-gray-600">Annual Gross</p>
          <p className="text-2xl font-bold">
            ${Math.round(grossPay).toLocaleString()}
          </p>
        </div>
        {!isTaxFree && (
          <div>
            <p className="text-sm text-gray-600">Annual Taxes</p>
            <p className="text-lg font-semibold text-red-600">
              -${Math.round(taxAmount).toLocaleString()}
            </p>
          </div>
        )}
        <div className="border-t pt-3">
          <p className="text-sm text-gray-600">Annual Net (After Tax)</p>
          <p className="text-2xl font-bold text-green-600">
            ${Math.round(netPay).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CrdpCrscEligibilityMatrix({
  recommendation,
}: {
  recommendation: CrdpCrscRecommendation;
}) {
  if (recommendation.recommendedProgram === "INSUFFICIENT_DATA") {
    return null;
  }

  const criteria = [
    {
      name: "Tax Status",
      crdp: "Taxable",
      crsc: "Tax-Free (Federal)",
      winner: "CRSC",
    },
    {
      name: "Eligibility Scope",
      crdp: "All disabilities (20-year + 50% VA)",
      crsc: "Combat-related only (20-year + Ch61)",
      winner: "—",
    },
    {
      name: "Annual Payment",
      crdp: `$${Math.round(recommendation.taxImpact.crdpGrossPay).toLocaleString()}`,
      crsc: `$${Math.round(recommendation.taxImpact.crscGrossPay).toLocaleString()}`,
      winner:
        recommendation.taxImpact.crscGrossPay >
        recommendation.taxImpact.crdpGrossPay
          ? "CRSC"
          : recommendation.taxImpact.crdpGrossPay >
              recommendation.taxImpact.crscGrossPay
            ? "CRDP"
            : "Tie",
    },
    {
      name: "20-Year Net Benefit",
      crdp: `$${Math.round(
        recommendation.taxImpact.crdpNetPay * 20
      ).toLocaleString()}`,
      crsc: `$${Math.round(
        recommendation.taxImpact.crscNetPay * 20
      ).toLocaleString()}`,
      winner:
        recommendation.taxImpact.crscNetPay * 20 >
        recommendation.taxImpact.crdpNetPay * 20
          ? "CRSC"
          : "CRDP",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Eligibility & Benefit Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2 font-semibold">Criterion</th>
              <th className="text-left p-2 font-semibold">CRDP</th>
              <th className="text-left p-2 font-semibold">CRSC</th>
              <th className="text-center p-2 font-semibold">Advantage</th>
            </tr>
          </thead>
          <tbody>
            {criteria.map((row, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="p-2">{row.name}</td>
                <td className="p-2">{row.crdp}</td>
                <td className="p-2">{row.crsc}</td>
                <td className="text-center p-2">
                  <Badge variant={row.winner === "—" ? "secondary" : "default"}>
                    {row.winner}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export function CrdpCrscComparisonPanel({
  crscEstimatedPayment,
  crdpEstimatedPayment,
  combatRelatedPercentage,
  taxBracket: initialTaxBracket = "22%",
  retirementType,
  hasVaWaiver,
  isEligibleForBoth,
  onOpenSeasonClick,
}: CrdpCrscComparisonPanelProps) {
  const [taxBracket, setTaxBracket] = useState<
    "10%" | "12%" | "22%" | "24%" | "32%" | "35%" | "37%"
  >(initialTaxBracket as "10%" | "12%" | "22%" | "24%" | "32%" | "35%" | "37%");
  const [recommendation, setRecommendation] =
    useState<CrdpCrscRecommendation | null>(null);

  useEffect(() => {
    const input: CrdpCrscRecommendationInput = {
      crscEstimatedPayment,
      crdpEstimatedPayment,
      combatRelatedPercentage,
      taxBracket,
      retirementType,
      hasVaWaiver,
      isEligibleForBoth,
    };
    setRecommendation(recommendCrdpVsCrsc(input));
  }, [
    crscEstimatedPayment,
    crdpEstimatedPayment,
    combatRelatedPercentage,
    taxBracket,
    retirementType,
    hasVaWaiver,
    isEligibleForBoth,
  ]);

  if (!recommendation) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            CRDP vs CRSC Comparison
          </CardTitle>
          <CardDescription>
            Compare Concurrent Retirement and Disability Pay (CRDP) with
            Combat-Related Special Compensation (CRSC)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <TaxBracketSelector value={taxBracket} onChange={setTaxBracket} />

          {recommendation.recommendedProgram === "INSUFFICIENT_DATA" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unable to generate comparison. Please provide payment estimates.
              </AlertDescription>
            </Alert>
          )}

          {recommendation.rationale.length > 0 && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription className="text-blue-900">
                <strong>Analysis:</strong> {recommendation.rationale.join(" ")}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="comparison" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comparison">Side-by-Side</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CrdpCrscSummaryCard
              program="CRDP"
              grossPay={recommendation.taxImpact.crdpGrossPay}
              netPay={recommendation.taxImpact.crdpNetPay}
              taxAmount={
                recommendation.taxImpact.crdpFederalTax +
                recommendation.taxImpact.crdpStateTax
              }
              isTaxFree={false}
            />
            <CrdpCrscSummaryCard
              program="CRSC"
              grossPay={recommendation.taxImpact.crscGrossPay}
              netPay={recommendation.taxImpact.crscNetPay}
              taxAmount={0}
              isTaxFree={true}
            />
          </div>

          <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Your Net Advantage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Recommended:</p>
                  <p className="text-2xl font-bold text-green-600">
                    {recommendation.recommendedProgram}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Annual Net Advantage:</p>
                  <p
                    className={`text-2xl font-bold ${
                      recommendation.netPayDifference >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    ${Math.round(
                      Math.abs(recommendation.netPayDifference)
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Annual Tax Savings:</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${Math.round(
                      recommendation.annualTaxSavings
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eligibility">
          <CrdpCrscEligibilityMatrix recommendation={recommendation} />
        </TabsContent>
      </Tabs>

      {isEligibleForBoth && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <FileText className="w-5 h-5" />
              Open Season Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-amber-900">
            <p className="text-sm">
              You are eligible for both CRDP and CRSC. DFAS Open Season allows
              you to elect your preferred program annually.
            </p>
            <ul className="text-sm space-y-2 list-disc list-inside">
              <li>Election changes take effect the following month.</li>
              <li>You can change your election annually during Open Season.</li>
              <li>
                Your choice affects military retirement and VA compensation
                coordination.
              </li>
            </ul>
            {onOpenSeasonClick && (
              <button
                onClick={onOpenSeasonClick}
                className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 text-sm font-medium"
              >
                View Open Season Details
              </button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
