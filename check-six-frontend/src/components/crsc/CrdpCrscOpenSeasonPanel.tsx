import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  recommendCrdpVsCrsc,
  CrdpCrscRecommendationInput,
  CrdpCrscRecommendation,
} from "@/services/crsc/CrdpCrscRecommendationEngine";
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Download,
  FileText,
} from "lucide-react";

interface CrdpCrscOpenSeasonPanelProps {
  currentProgram: "CRDP" | "CRSC";
  crscEstimatedPayment: number;
  crdpEstimatedPayment: number;
  combatRelatedPercentage: number;
  retirementType: "NON_REGULAR" | "RESERVE_GUARD" | "MEDBOARD";
  hasVaWaiver: boolean;
  taxBracket?: "10%" | "12%" | "22%" | "24%" | "32%" | "35%" | "37%";
  isEligibleForBoth: boolean;
  openSeasonStartDate?: string; // e.g., "2024-01-01"
  openSeasonEndDate?: string; // e.g., "2024-01-31"
  onExport?: () => void;
}

export function CrdpCrscOpenSeasonPanel({
  currentProgram,
  crscEstimatedPayment,
  crdpEstimatedPayment,
  combatRelatedPercentage,
  retirementType,
  hasVaWaiver,
  taxBracket = "22%",
  isEligibleForBoth,
  openSeasonStartDate,
  openSeasonEndDate,
  onExport,
}: CrdpCrscOpenSeasonPanelProps) {
  const [recommendation, setRecommendation] =
    useState<CrdpCrscRecommendation | null>(null);
  const [selectedExportFormat, setSelectedExportFormat] = useState<
    "pdf" | "csv" | null
  >(null);

  useEffect(() => {
    if (!isEligibleForBoth) return;
    const input: CrdpCrscRecommendationInput = {
      crscEstimatedPayment,
      crdpEstimatedPayment,
      combatRelatedPercentage,
      taxBracket: taxBracket as any,
      retirementType,
      hasVaWaiver,
      isEligibleForBoth: true,
    };
    setRecommendation(recommendCrdpVsCrsc(input));
  }, [
    crscEstimatedPayment,
    crdpEstimatedPayment,
    combatRelatedPercentage,
    retirementType,
    hasVaWaiver,
    taxBracket,
    isEligibleForBoth,
  ]);

  if (!isEligibleForBoth) {
    return (
      <Card className="border-gray-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            DFAS Open Season
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You are only eligible for{" "}
              <strong>
                {currentProgram === "CRDP"
                  ? "CRDP"
                  : "CRSC (combat-related only)"}
              </strong>
              . Open Season applies only to veterans eligible for both programs.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!recommendation) return null;

  const whichPaysBetter =
    recommendation.recommendedProgram === "CRSC" ? "CRSC" : "CRDP";
  const currentIsRecommended = currentProgram === whichPaysBetter;
  const potentialGain = Math.abs(
    recommendation.netPayDifference * 12
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            DFAS Open Season
          </CardTitle>
          <CardDescription>
            Annual opportunity to change your program election
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {openSeasonStartDate && openSeasonEndDate && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900">
                Next Open Season:
              </p>
              <p className="text-lg font-bold text-blue-600">
                {new Date(openSeasonStartDate).toLocaleDateString()} to{" "}
                {new Date(openSeasonEndDate).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              className={`border-2 ${
                currentProgram === "CRDP"
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-200"
              }`}
            >
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  CRDP
                  {currentProgram === "CRDP" && (
                    <Badge className="bg-blue-600">Current</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Annual Net:</p>
                  <p className="text-xl font-bold">
                    ${Math.round(
                      recommendation.taxImpact.crdpNetPay
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Annual Tax Burden:</p>
                  <p className="font-semibold text-red-600">
                    -$
                    {Math.round(
                      recommendation.taxImpact.crdpFederalTax +
                        recommendation.taxImpact.crdpStateTax
                    ).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className={`border-2 ${
                currentProgram === "CRSC"
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200"
              }`}
            >
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  CRSC
                  {currentProgram === "CRSC" && (
                    <Badge className="bg-green-600">Current</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-600">Annual Net:</p>
                  <p className="text-xl font-bold">
                    ${Math.round(
                      recommendation.taxImpact.crscNetPay
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Tax Status:</p>
                  <p className="font-semibold text-green-600">Tax-Free</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-900">
              <strong>Which one pays more?</strong>{" "}
              <span className="font-semibold">{whichPaysBetter}</span> provides{" "}
              <span className="font-bold text-green-600">
                ${Math.round(potentialGain).toLocaleString()}/month
              </span>{" "}
              more in net annual income ({currentIsRecommended
                ? "your current program"
                : "a potential increase"}).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What is Open Season?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-gray-900 mb-1">Annual Election:</p>
            <p className="text-gray-700">
              Once per year, DFAS allows you to elect which program—CRDP or
              CRSC—you receive during your military retirement.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">Effective Date:</p>
            <p className="text-gray-700">
              Your election change typically takes effect on the first day of
              the following month.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">No Limits:</p>
            <p className="text-gray-700">
              You can change your election year after year; there are no
              restrictions on switching between programs.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">
              Important Note:
            </p>
            <p className="text-gray-700">
              Your election affects your military retired pay and VA
              compensation coordination. Choose carefully based on your tax
              situation and financial needs.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Election Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Current Program:</span>
              <span className="font-bold">{currentProgram}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Recommended Program:</span>
              <span className="font-bold text-green-600">
                {recommendation.recommendedProgram}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Potential Annual Gain:</span>
              <span className="font-bold text-green-600">
                ${Math.round(potentialGain).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>Annual Tax Savings (CRSC):</span>
              <span className="font-bold text-blue-600">
                ${Math.round(
                  recommendation.annualTaxSavings
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span>20-Year Cumulative Benefit:</span>
              <span className="font-bold text-green-600">
                ${Math.round(potentialGain * 20).toLocaleString()}
              </span>
            </div>
          </div>

          {onExport && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedExportFormat("pdf");
                  onExport();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-900 hover:bg-red-200 rounded-md text-sm font-medium transition"
              >
                <Download className="w-4 h-4" />
                Export as PDF
              </button>
              <button
                onClick={() => {
                  setSelectedExportFormat("csv");
                  onExport();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-900 hover:bg-green-200 rounded-md text-sm font-medium transition"
              >
                <Download className="w-4 h-4" />
                Export as CSV
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
