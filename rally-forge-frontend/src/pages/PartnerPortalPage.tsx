import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "recharts";
import { AlertCircle, Edit2, Save, X } from "lucide-react";

interface PartnerProfile {
  id: string;
  name: string;
  description: string;
  categories: string[];
  tags: string[];
  serviceAreas: string[];
  contactEmail: string;
  contactPhone: string;
  websiteUrl: string;
}

interface AnalyticsData {
  views: number;
  clicks: number;
  saves: number;
  referrals: number;
  trends: Array<{ period: string; views: number; clicks: number }>;
}

export function PartnerPortalPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<PartnerProfile>({
    id: "mission43",
    name: "Mission43",
    description: "Idaho-based veteran employment and community engagement",
    categories: ["EMPLOYMENT", "COMMUNITY"],
    tags: ["jobs", "mentorship", "idaho"],
    serviceAreas: ["IDAHO", "BOISE"],
    contactEmail: "info@mission43.org",
    contactPhone: "+1-208-xxx-xxxx",
    websiteUrl: "https://mission43.org",
  });

  const [analytics] = useState<AnalyticsData>({
    views: 1247,
    clicks: 342,
    saves: 89,
    referrals: 23,
    trends: [
      { period: "Week 1", views: 200, clicks: 50 },
      { period: "Week 2", views: 250, clicks: 65 },
      { period: "Week 3", views: 280, clicks: 78 },
      { period: "Week 4", views: 517, clicks: 149 },
    ],
  });

  const handleSaveChanges = () => {
    console.log("Saving changes:", profile);
    setIsEditing(false);
    // API call to update profile would go here
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Partner Portal</h1>
          <p className="text-gray-600 mt-2">
            Manage your organization profile and view engagement analytics.
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Button>
        )}
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          {isEditing && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                Changes will be submitted for review. You'll be notified when updates are approved.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Organization Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                ) : (
                  <p className="text-lg">{profile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                {isEditing ? (
                  <textarea
                    value={profile.description}
                    onChange={(e) =>
                      setProfile({ ...profile, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                ) : (
                  <p className="text-gray-700">{profile.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Website</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={profile.websiteUrl}
                      onChange={(e) =>
                        setProfile({ ...profile, websiteUrl: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  ) : (
                    <a
                      href={profile.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {profile.websiteUrl}
                    </a>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.contactEmail}
                      onChange={(e) =>
                        setProfile({ ...profile, contactEmail: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  ) : (
                    <p className="text-gray-700">{profile.contactEmail}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Categories</label>
                <div className="flex flex-wrap gap-2">
                  {profile.categories.map((cat) => (
                    <Badge key={cat} className="bg-blue-100 text-blue-900">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Service Areas</label>
                <div className="flex flex-wrap gap-2">
                  {profile.serviceAreas.map((area) => (
                    <Badge key={area} variant="outline">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-2 justify-end pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Submit Changes for Review
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analytics.views.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">+12% this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Website Clicks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analytics.clicks.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((analytics.clicks / analytics.views) * 100).toFixed(1)}% CTR
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analytics.saves.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((analytics.saves / analytics.views) * 100).toFixed(1)}% save rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{analytics.referrals.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">+8 this month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends (Last 4 Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#3b82f6"
                    name="Views"
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#10b981"
                    name="Clicks"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your partner account and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Email Notifications
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">
                    Send me weekly engagement reports
                  </span>
                </label>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-semibold mb-2">
                  Account Status
                </label>
                <p className="text-sm text-gray-600">
                  Your account is in good standing. Partnership: FEATURED
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
