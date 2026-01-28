import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Users, Eye, Link2 } from "lucide-react";

interface ImpactDashboardData {
  totalResources: number;
  totalInteractions: number;
  topResources: Array<{
    name: string;
    views: number;
    clicks: number;
    engagement: number;
  }>;
  categoryUsage: Record<string, number>;
  weeklyTrends: Array<{
    week: string;
    interactions: number;
    uniqueVeterans: number;
  }>;
}

const mockDashboardData: ImpactDashboardData = {
  totalResources: 12,
  totalInteractions: 5842,
  topResources: [
    { name: "Mission43", views: 1247, clicks: 342, engagement: 27.4 },
    { name: "Hire Heroes USA", views: 1087, clicks: 298, engagement: 27.4 },
    { name: "Team RWB", views: 893, clicks: 201, engagement: 22.5 },
    { name: "Wounded Warrior Project", views: 756, clicks: 189, engagement: 25.0 },
    { name: "Team Rubicon", views: 612, clicks: 145, engagement: 23.7 },
  ],
  categoryUsage: {
    EMPLOYMENT: 2345,
    WELLNESS: 1456,
    COMMUNITY: 1024,
    EDUCATION: 678,
    LEADERSHIP: 339,
  },
  weeklyTrends: [
    { week: "Week 1", interactions: 800, uniqueVeterans: 234 },
    { week: "Week 2", interactions: 920, uniqueVeterans: 267 },
    { week: "Week 3", interactions: 1100, uniqueVeterans: 312 },
    { week: "Week 4", interactions: 1200, uniqueVeterans: 345 },
    { week: "Week 5", interactions: 1822, uniqueVeterans: 456 },
  ],
};

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export function ResourceImpactDashboardPage() {
  const [data] = useState<ImpactDashboardData>(mockDashboardData);

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div>
        <h1 className="text-3xl font-bold">Resource Impact Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Enterprise view of resource engagement, effectiveness, and veteran outcomes.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              Total Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalResources}</p>
            <p className="text-xs text-gray-500 mt-2">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Link2 className="w-4 h-4 text-green-600" />
              Total Interactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {data.totalInteractions.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-2">Views, clicks, saves, referrals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Featured Partners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">5</p>
            <p className="text-xs text-gray-500 mt-2">High-impact organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              Avg. Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {(
                data.topResources.reduce((sum, r) => sum + r.engagement, 0) /
                data.topResources.length
              ).toFixed(1)}
              %
            </p>
            <p className="text-xs text-gray-500 mt-2">CTR across resources</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="resources" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resources">Top Resources</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Top Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Engaged Resources</CardTitle>
              <CardDescription>
                Resources with highest views, clicks, and referrals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.topResources.map((resource, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {idx + 1}. {resource.name}
                      </p>
                      <div className="flex gap-4 mt-1 text-xs text-gray-600">
                        <span>👁 {resource.views.toLocaleString()} views</span>
                        <span>🔗 {resource.clicks.toLocaleString()} clicks</span>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 ml-4">
                      {resource.engagement}% CTR
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Category Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Interaction Distribution</CardTitle>
                <CardDescription>Interactions by resource category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(data.categoryUsage).map(([name, value]) => ({
                        name,
                        value,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) =>
                        `${name}: ${value.toLocaleString()}`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(data.categoryUsage).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(data.categoryUsage)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, count]) => (
                      <div
                        key={category}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm font-medium">{category}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-gray-200 rounded">
                            <div
                              className="h-full bg-blue-500 rounded"
                              style={{
                                width: `${
                                  (count /
                                    Object.values(data.categoryUsage).reduce(
                                      (a, b) => a + b
                                    )) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 w-16 text-right">
                            {count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Engagement Trends</CardTitle>
              <CardDescription>Interactions and veteran reach over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data.weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="interactions"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Total Interactions"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="uniqueVeterans"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Unique Veterans"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm text-green-900 font-semibold">
                    Interaction Growth
                  </p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    +127.75%
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    From week 1 to week 5
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-900 font-semibold">
                    Veteran Reach
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    +94.87%
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    New veterans engaged
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
