import React, { useState, useEffect } from "react";
import { Search, MapPin, ExternalLink, BookmarkPlus, Bookmark } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Resource {
  id: string;
  name: string;
  description: string;
  categories: string[];
  tags: string[];
  serviceAreaScope: string;
  serviceAreas: string[];
  eligibility: string[];
  websiteUrl: string;
  contactEmail: string;
  partnerLevel: "FEATURED" | "VERIFIED" | "COMMUNITY";
  isFeatured: boolean;
}

interface ResourceFilterState {
  category?: string;
  location?: string;
  keyword?: string;
}

function ResourceCard({
  resource,
  onVisit,
  onSave,
  isSaved,
}: {
  resource: Resource;
  onVisit?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}) {
  const partnerBadgeColor =
    resource.partnerLevel === "FEATURED"
      ? "bg-purple-100 text-purple-900"
      : resource.partnerLevel === "VERIFIED"
        ? "bg-blue-100 text-blue-900"
        : "bg-gray-100 text-gray-900";

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {resource.name}
              {resource.isFeatured && (
                <Badge className="bg-purple-100 text-purple-900 text-xs">
                  Featured
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {resource.categories.join(" • ")}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onSave}
            className="ml-2"
          >
            {isSaved ? (
              <Bookmark className="w-5 h-5 fill-blue-600 text-blue-600" />
            ) : (
              <BookmarkPlus className="w-5 h-5 text-gray-400" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700">{resource.description}</p>

        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Service Area:</p>
          <div className="flex flex-wrap gap-1">
            {resource.serviceAreas.slice(0, 3).map((area) => (
              <Badge key={area} variant="secondary" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {area}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-600 mb-2">Tags:</p>
          <div className="flex flex-wrap gap-1">
            {resource.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="pt-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={onVisit}
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Visit Website
          </Button>
          <Badge className={`${partnerBadgeColor} text-xs`}>
            {resource.partnerLevel}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResourceMarketplacePage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [filters, setFilters] = useState<ResourceFilterState>({});
  const [savedResources, setSavedResources] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API call
  useEffect(() => {
    const mockResources: Resource[] = [
      {
        id: "mission43",
        name: "Mission43",
        description:
          "Idaho-based veteran employment and community engagement. Job coaching, mentorship, networking.",
        categories: ["EMPLOYMENT", "COMMUNITY"],
        tags: ["jobs", "mentorship", "networking", "idaho"],
        serviceAreaScope: "STATE",
        serviceAreas: ["IDAHO", "BOISE"],
        eligibility: ["VETERANS", "SPOUSES"],
        websiteUrl: "https://mission43.org",
        contactEmail: "info@mission43.org",
        partnerLevel: "FEATURED",
        isFeatured: true,
      },
      {
        id: "hire_heroes",
        name: "Hire Heroes USA",
        description:
          "National veteran employment specialist. Resume review, job search coaching, career transition support.",
        categories: ["EMPLOYMENT"],
        tags: ["resume", "job search", "coaching"],
        serviceAreaScope: "NATIONAL",
        serviceAreas: ["USA"],
        eligibility: ["VETERANS"],
        websiteUrl: "https://hireheroesusa.org",
        contactEmail: "info@hireheroesusa.org",
        partnerLevel: "FEATURED",
        isFeatured: true,
      },
      {
        id: "team_rwb",
        name: "Team RWB",
        description:
          "Connects veterans with fitness, community events, and social activities.",
        categories: ["WELLNESS", "COMMUNITY"],
        tags: ["fitness", "events", "wellness"],
        serviceAreaScope: "NATIONAL",
        serviceAreas: ["USA"],
        eligibility: ["VETERANS", "CIVILIANS"],
        websiteUrl: "https://teamrwb.org",
        contactEmail: "info@teamrwb.org",
        partnerLevel: "VERIFIED",
        isFeatured: false,
      },
    ];
    setResources(mockResources);
    setFilteredResources(mockResources);
    setLoading(false);
  }, []);

  const applyFilters = (newFilters: ResourceFilterState) => {
    setFilters(newFilters);
    let results = resources;

    if (newFilters.category) {
      results = results.filter((r) =>
        r.categories.some(
          (c) => c.toLowerCase() === newFilters.category?.toLowerCase()
        )
      );
    }

    if (newFilters.location) {
      results = results.filter((r) =>
        r.serviceAreas.some(
          (a) => a.toLowerCase() === newFilters.location?.toLowerCase()
        )
      );
    }

    if (newFilters.keyword) {
      const kw = newFilters.keyword.toLowerCase();
      results = results.filter(
        (r) =>
          r.name.toLowerCase().includes(kw) ||
          r.description.toLowerCase().includes(kw) ||
          r.tags.some((t) => t.toLowerCase().includes(kw))
      );
    }

    setFilteredResources(results);
  };

  const handleSaveResource = (resourceId: string) => {
    const newSaved = new Set(savedResources);
    if (newSaved.has(resourceId)) {
      newSaved.delete(resourceId);
    } else {
      newSaved.add(resourceId);
    }
    setSavedResources(newSaved);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div>
        <h1 className="text-3xl font-bold">Resource Marketplace</h1>
        <p className="text-gray-600 mt-2">
          Discover programs and services designed to support your military transition and career growth.
        </p>
      </div>

      {/* Filter Section */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Find Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                onChange={(e) =>
                  applyFilters({ ...filters, category: e.target.value || undefined })
                }
              >
                <option value="">All Categories</option>
                <option value="employment">Employment</option>
                <option value="education">Education</option>
                <option value="wellness">Wellness</option>
                <option value="community">Community</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <select
                className="w-full px-3 py-2 border rounded-md"
                onChange={(e) =>
                  applyFilters({ ...filters, location: e.target.value || undefined })
                }
              >
                <option value="">All Locations</option>
                <option value="idaho">Idaho</option>
                <option value="usa">Nationwide</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-3 py-2 border rounded-md"
                  onChange={(e) =>
                    applyFilters({ ...filters, keyword: e.target.value || undefined })
                  }
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            All Resources ({filteredResources.length})
          </TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="saved">Saved ({savedResources.size})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading resources...</p>
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onVisit={() => window.open(resource.websiteUrl, "_blank")}
                  onSave={() => handleSaveResource(resource.id)}
                  isSaved={savedResources.has(resource.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-gray-500">
              No resources match your filters. Try adjusting your search.
            </Card>
          )}
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources
              .filter((r) => r.isFeatured)
              .map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onVisit={() => window.open(resource.websiteUrl, "_blank")}
                  onSave={() => handleSaveResource(resource.id)}
                  isSaved={savedResources.has(resource.id)}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResources
              .filter((r) => savedResources.has(r.id))
              .map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onVisit={() => window.open(resource.websiteUrl, "_blank")}
                  onSave={() => handleSaveResource(resource.id)}
                  isSaved={savedResources.has(resource.id)}
                />
              ))}
          </div>
          {savedResources.size === 0 && (
            <Card className="p-6 text-center text-gray-500">
              No saved resources yet. Bookmark resources to view them here.
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
