import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CrdpCrscComparisonPanel } from "@/components/crsc/CrdpCrscComparisonPanel";
import { CrdpCrscOpenSeasonPanel } from "@/components/crsc/CrdpCrscOpenSeasonPanel";
import { CrscSimulationPanel } from "@/components/crsc/CrscSimulationPanel";
import { CrscComplianceDashboardPage } from "@/pages/CrscComplianceDashboardPage";
import {
  AlertCircle,
  CheckCircle,
  FileText,
  BarChart3,
  DollarSign,
  Zap,
} from "lucide-react";

interface CrscHubPageProps {
  veteranId?: string;
  onEditProfile?: () => void;
  onGeneratePacket?: () => void;
  onViewDecision?: () => void;
  onRunAppealStrategy?: () => void;
  onViewCompliance?: () => void;
}

/**
 * Mock data for demonstration (replace with real data from store/API)
 */
const mockCrscData = {
  eligibilityStatus: "ELIGIBLE",
  combatRelatedPercentage: 45,
  estimatedCrscRange: { low: 850, high: 1050 },
  crscEstimatedPayment: 950,
  crdpEstimatedPayment: 1100,
  evidenceStrength: "HIGH",
  vaRating: 80,
  retiredPayOffset: 2500,
  retirementType: "NON_REGULAR" as const,
  hasVaWaiver: true,
  isEligibleForBoth: true,
  currentProgram: "CRDP" as const,
  taxBracket: "22%" as const,
};

function CrscStatusHeader({
  eligibilityStatus,
  combatRelatedPercentage,
  estimatedCrscRange,
  evidenceStrength,
  onActions,
}: {
  eligibilityStatus: string;
  combatRelatedPercentage: number;
  estimatedCrscRange: { low: number; high: number };
  evidenceStrength: string;
  onActions?: {
    onEditProfile?: () => void;
    onGeneratePacket?: () => void;
    onViewDecision?: () => void;
    onRunAppealStrategy?: () => void;
    onViewCompliance?: () => void;
  };
}) {
  const isEligible = eligibilityStatus === "ELIGIBLE";
  const earningSatusColor = isEligible ? "bg-green-100" : "bg-yellow-100";
  const earningSatusTextColor = isEligible ? "text-green-800" : "text-yellow-800";

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
              CRSC Hub
            </CardTitle>
            <CardDescription className="mt-2">
              Combat-Related Special Compensation Program
            </CardDescription>
          </div>
          <Badge className={`${earningSatusColor} ${earningSatusTextColor}`}>
            {isEligible ? "Eligible" : "Not Eligible"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-xs text-gray-600 uppercase font-semibold">
              Combat %
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {combatRelatedPercentage}%
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-xs text-gray-600 uppercase font-semibold">
              Monthly Estimate
            </p>
            <p className="text-2xl font-bold text-green-600">
              ${Math.round(estimatedCrscRange.low / 12)} - $
              {Math.round(estimatedCrscRange.high / 12)}
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-xs text-gray-600 uppercase font-semibold">
              Evidence
            </p>
            <Badge
              className={
                evidenceStrength === "HIGH"
                  ? "bg-green-100 text-green-800"
                  : evidenceStrength === "MEDIUM"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }
            >
              {evidenceStrength}
            </Badge>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-xs text-gray-600 uppercase font-semibold">
              Status
            </p>
            <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {onActions?.onEditProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={onActions.onEditProfile}
              className="text-xs"
            >
              Edit Profile
            </Button>
          )}
          {onActions?.onGeneratePacket && (
            <Button
              variant="outline"
              size="sm"
              onClick={onActions.onGeneratePacket}
              className="text-xs"
            >
              Generate Packet
            </Button>
          )}
          {onActions?.onViewDecision && (
            <Button
              variant="outline"
              size="sm"
              onClick={onActions.onViewDecision}
              className="text-xs"
            >
              View Decision
            </Button>
          )}
          {onActions?.onRunAppealStrategy && (
            <Button
              variant="outline"
              size="sm"
              onClick={onActions.onRunAppealStrategy}
              className="text-xs"
            >
              Appeal Strategy
            </Button>
          )}
          {onActions?.onViewCompliance && (
            <Button
              variant="outline"
              size="sm"
              onClick={onActions.onViewCompliance}
              className="text-xs"
            >
              Compliance
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function CrscHubPage({
  veteranId,
  onEditProfile,
  onGeneratePacket,
  onViewDecision,
  onRunAppealStrategy,
  onViewCompliance,
}: CrscHubPageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showOpenSeasonPanel, setShowOpenSeasonPanel] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <CrscStatusHeader
        eligibilityStatus={mockCrscData.eligibilityStatus}
        combatRelatedPercentage={mockCrscData.combatRelatedPercentage}
        estimatedCrscRange={mockCrscData.estimatedCrscRange}
        evidenceStrength={mockCrscData.evidenceStrength}
        onActions={{
          onEditProfile,
          onGeneratePacket,
          onViewDecision,
          onRunAppealStrategy,
          onViewCompliance,
        }}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
          <TabsTrigger value="decision">Decision</TabsTrigger>
          <TabsTrigger value="comparison">CRDP vs CRSC</TabsTrigger>
          <TabsTrigger value="openseason">Open Season</TabsTrigger>
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Application Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span>Profile:</span>
                  <Badge className="bg-green-100 text-green-800">Complete</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Combat Tags:</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {mockCrscData.combatRelatedPercentage}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Evidence Mapped:</span>
                  <Badge className="bg-green-100 text-green-800">
                    {mockCrscData.evidenceStrength}
                  </Badge>
                </div>
                <div className="flex justify-between items-center border-t pt-2">
                  <span className="font-semibold">Estimated Monthly:</span>
                  <span className="text-lg font-bold text-green-600">
                    $
                    {Math.round(
                      mockCrscData.crscEstimatedPayment / 12
                    ).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={onEditProfile}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  Edit CRSC Profile
                </Button>
                <Button
                  onClick={onGeneratePacket}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  Generate Application Packet
                </Button>
                <Button
                  onClick={onViewDecision}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  View Decision Explanation
                </Button>
                <Button
                  onClick={onRunAppealStrategy}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  Run Appeal Strategy
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CRSC Profile & Combat Rating</CardTitle>
              <CardDescription>
                Your combat-related conditions and CRSC eligibility summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600">
                    VA Rating
                  </p>
                  <p className="text-2xl font-bold">
                    {mockCrscData.vaRating}%
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">
                    Combat-Related %
                  </p>
                  <p className="text-2xl font-bold">
                    {mockCrscData.combatRelatedPercentage}%
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">
                    Retirement Type
                  </p>
                  <p className="text-lg">
                    {mockCrscData.retirementType.replace(/_/g, " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">
                    VA Waiver
                  </p>
                  <Badge className="bg-green-100 text-green-800">
                    {mockCrscData.hasVaWaiver ? "Has Waiver" : "No Waiver"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evidence Mapping</CardTitle>
              <CardDescription>
                Documents and evidence linked to your combat-related conditions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="bg-green-50 p-3 rounded border border-green-200">
                <p className="font-semibold text-green-900">
                  Evidence Strength: {mockCrscData.evidenceStrength}
                </p>
                <p className="text-gray-700 mt-1">
                  Your application has strong corroborating evidence for
                  combat-related conditions.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setActiveTab("overview")}
              >
                View Evidence Details
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Decision Tab */}
        <TabsContent value="decision" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Decision Explanation</CardTitle>
              <CardDescription>
                Why you are eligible for CRSC and how your payment was calculated
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Eligibility
                  </h4>
                  <p className="text-sm text-gray-700">
                    You have 20+ years of service and combat-related conditions.
                    You qualify for CRSC.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Combat-Related Calculation
                  </h4>
                  <p className="text-sm text-gray-700">
                    {mockCrscData.combatRelatedPercentage}% of your VA rating is
                    attributed to combat-related causes.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Estimated Monthly Payment
                  </h4>
                  <p className="text-lg font-bold text-green-600">
                    $
                    {Math.round(
                      mockCrscData.crscEstimatedPayment / 12
                    ).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Estimate based on current VA compensation tables (2024).
                    Actual amount may vary.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CRDP vs CRSC Tab */}
        <TabsContent value="comparison" className="space-y-4">
          <CrdpCrscComparisonPanel
            crscEstimatedPayment={mockCrscData.crscEstimatedPayment}
            crdpEstimatedPayment={mockCrscData.crdpEstimatedPayment}
            combatRelatedPercentage={mockCrscData.combatRelatedPercentage}
            taxBracket={mockCrscData.taxBracket}
            retirementType={mockCrscData.retirementType}
            hasVaWaiver={mockCrscData.hasVaWaiver}
            isEligibleForBoth={mockCrscData.isEligibleForBoth}
            onOpenSeasonClick={() => setShowOpenSeasonPanel(true)}
          />
        </TabsContent>

        {/* Open Season Tab */}
        <TabsContent value="openseason" className="space-y-4">
          {mockCrscData.isEligibleForBoth && (
            <CrdpCrscOpenSeasonPanel
              currentProgram={mockCrscData.currentProgram}
              crscEstimatedPayment={mockCrscData.crscEstimatedPayment}
              crdpEstimatedPayment={mockCrscData.crdpEstimatedPayment}
              combatRelatedPercentage={mockCrscData.combatRelatedPercentage}
              retirementType={mockCrscData.retirementType}
              hasVaWaiver={mockCrscData.hasVaWaiver}
              taxBracket={mockCrscData.taxBracket}
              isEligibleForBoth={true}
              onExport={() => console.log("Export clicked")}
            />
          )}
        </TabsContent>

        {/* Simulation Tab */}
        <TabsContent value="simulation" className="space-y-4">
          <CrscSimulationPanel
            crscPayment={mockCrscData.crscEstimatedPayment}
            currentRetirementIncome={50000}
            currentReadinessScore={0.65}
          />
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-4">
          <CrscComplianceDashboardPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
