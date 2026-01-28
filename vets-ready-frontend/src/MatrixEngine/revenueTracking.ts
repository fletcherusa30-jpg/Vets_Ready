/**
 * REVENUE STREAM TRACKING SYSTEM
 *
 * Tracks all revenue sources across the VetsReady ecosystem:
 * 1. Premium subscriptions
 * 2. Affiliate partnerships
 * 3. Sponsored opportunities
 * 4. Business submissions
 * 5. Enterprise licensing
 * 6. Anonymized insights/data
 * 7. Partner API access
 * 8. Premium discount network
 * 9. Premium Mission Packs
 * 10. Premium AI workflows
 */

import { DigitalTwin } from './types/DigitalTwin';

/**
 * Revenue stream types
 */
export type RevenueStream =
  | 'subscription'
  | 'affiliate'
  | 'sponsored_opportunity'
  | 'business_submission'
  | 'enterprise_license'
  | 'data_insights'
  | 'api_access'
  | 'premium_network'
  | 'premium_pack'
  | 'premium_workflow';

/**
 * Revenue event
 */
export interface RevenueEvent {
  id: string;
  stream: RevenueStream;
  amount: number;
  currency: string;
  timestamp: string;
  metadata: Record<string, any>;
}

/**
 * Affiliate partner
 */
export interface AffiliatePartner {
  id: string;
  name: string;
  category: 'education' | 'travel' | 'retail' | 'insurance' | 'financial' | 'veteran_business';
  commissionRate: number; // Percentage
  trackingUrl: string;
  isActive: boolean;
}

/**
 * Sponsored opportunity
 */
export interface SponsoredOpportunity {
  id: string;
  type: 'job' | 'education' | 'housing' | 'business';
  sponsorName: string;
  placementCost: number; // Cost per placement
  clickCost: number; // Cost per click
  conversionBonus: number; // Bonus for conversion
  isActive: boolean;
}

/**
 * Business submission tier
 */
export interface BusinessSubmissionTier {
  tier: 'free' | 'verified' | 'featured' | 'sponsored';
  monthlyCost: number;
  benefits: string[];
}

/**
 * Enterprise license
 */
export interface EnterpriseLicense {
  id: string;
  organizationType: 'va_office' | 'vso' | 'nonprofit' | 'university' | 'employer';
  organizationName: string;
  seatCount: number;
  pricePerSeat: number;
  annualCost: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

/**
 * Track subscription revenue
 */
export function trackSubscriptionRevenue(
  digitalTwin: DigitalTwin,
  amount: number,
  transactionId: string
): RevenueEvent {
  const event: RevenueEvent = {
    id: `rev_sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    stream: 'subscription',
    amount,
    currency: 'USD',
    timestamp: new Date().toISOString(),
    metadata: {
      transactionId,
      subscriptionTier: digitalTwin.subscriptionTier,
      billingCycle: digitalTwin.billingCycle,
      veteranState: digitalTwin.state,
      veteranBranch: digitalTwin.branch,
    },
  };

  logRevenueEvent(event);
  return event;
}

/**
 * Track affiliate click and potential commission
 */
export function trackAffiliateClick(
  partner: AffiliatePartner,
  digitalTwin: DigitalTwin,
  clickMetadata: Record<string, any> = {}
): void {
  console.log('[Revenue - Affiliate]', {
    partnerId: partner.id,
    partnerName: partner.name,
    category: partner.category,
    veteranState: digitalTwin.state,
    timestamp: new Date().toISOString(),
    ...clickMetadata,
  });

  // Expert stub: Integrate with analytics/tracking service (e.g., Segment, Google Analytics)
  // Robust fallback: Log to console for now
}

/**
 * Track affiliate conversion and commission
 */
export function trackAffiliateConversion(
  partner: AffiliatePartner,
  digitalTwin: DigitalTwin,
  purchaseAmount: number
): RevenueEvent {
  const commissionAmount = purchaseAmount * (partner.commissionRate / 100);

  const event: RevenueEvent = {
    id: `rev_aff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    stream: 'affiliate',
    amount: commissionAmount,
    currency: 'USD',
    timestamp: new Date().toISOString(),
    metadata: {
      partnerId: partner.id,
      partnerName: partner.name,
      category: partner.category,
      purchaseAmount,
      commissionRate: partner.commissionRate,
      veteranState: digitalTwin.state,
    },
  };

  logRevenueEvent(event);
  return event;
}

/**
 * Track sponsored opportunity view
 */
export function trackSponsoredView(
  opportunity: SponsoredOpportunity,
  digitalTwin: DigitalTwin
): void {
  console.log('[Revenue - Sponsored View]', {
    opportunityId: opportunity.id,
    type: opportunity.type,
    sponsor: opportunity.sponsorName,
    veteranState: digitalTwin.state,
    timestamp: new Date().toISOString(),
  });

  // Expert stub: Integrate with analytics service (e.g., Segment, Google Analytics)
  // Robust fallback: Log to console for now
}

/**
 * Track sponsored opportunity click
 */
export function trackSponsoredClick(
  opportunity: SponsoredOpportunity,
  digitalTwin: DigitalTwin
): RevenueEvent {
  const event: RevenueEvent = {
    id: `rev_spo_click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    stream: 'sponsored_opportunity',
    amount: opportunity.clickCost,
    currency: 'USD',
    timestamp: new Date().toISOString(),
    metadata: {
      opportunityId: opportunity.id,
      type: opportunity.type,
      sponsor: opportunity.sponsorName,
      action: 'click',
      veteranState: digitalTwin.state,
    },
  };

  logRevenueEvent(event);
  return event;
}

/**
 * Track sponsored opportunity conversion
 */
export function trackSponsoredConversion(
  opportunity: SponsoredOpportunity,
  digitalTwin: DigitalTwin
): RevenueEvent {
  const totalAmount = opportunity.placementCost + opportunity.conversionBonus;

  const event: RevenueEvent = {
    id: `rev_spo_conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    stream: 'sponsored_opportunity',
    amount: totalAmount,
    currency: 'USD',
    timestamp: new Date().toISOString(),
    metadata: {
      opportunityId: opportunity.id,
      type: opportunity.type,
      sponsor: opportunity.sponsorName,
      action: 'conversion',
      placementCost: opportunity.placementCost,
      conversionBonus: opportunity.conversionBonus,
      veteranState: digitalTwin.state,
    },
  };

  logRevenueEvent(event);
  return event;
}

/**
 * Track business submission revenue
 */
export function trackBusinessSubmission(
  businessId: string,
  businessName: string,
  tier: BusinessSubmissionTier,
  billingPeriod: 'monthly' | 'annual'
): RevenueEvent {
  const amount = billingPeriod === 'annual' ? tier.monthlyCost * 12 : tier.monthlyCost;

  const event: RevenueEvent = {
    id: `rev_biz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    stream: 'business_submission',
    amount,
    currency: 'USD',
    timestamp: new Date().toISOString(),
    metadata: {
      businessId,
      businessName,
      tier: tier.tier,
      billingPeriod,
      monthlyCost: tier.monthlyCost,
    },
  };

  logRevenueEvent(event);
  return event;
}

/**
 * Track enterprise license revenue
 */
export function trackEnterpriseLicense(
  license: EnterpriseLicense
): RevenueEvent {
  const event: RevenueEvent = {
    id: `rev_ent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    stream: 'enterprise_license',
    amount: license.annualCost,
    currency: 'USD',
    timestamp: new Date().toISOString(),
    metadata: {
      licenseId: license.id,
      organizationType: license.organizationType,
      organizationName: license.organizationName,
      seatCount: license.seatCount,
      pricePerSeat: license.pricePerSeat,
    },
  };

  logRevenueEvent(event);
  return event;
}

/**
 * Track data insights sale
 */
export function trackDataInsightsSale(
  buyerType: 'workforce' | 'education' | 'housing' | 'healthcare',
  buyerName: string,
  insightType: string,
  amount: number
): RevenueEvent {
  const event: RevenueEvent = {
    id: `rev_data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    stream: 'data_insights',
    amount,
    currency: 'USD',
    timestamp: new Date().toISOString(),
    metadata: {
      buyerType,
      buyerName,
      insightType,
      anonymized: true,
      aggregated: true,
    },
  };

  logRevenueEvent(event);
  return event;
}

/**
 * Track partner API usage
 */
export function trackAPIUsage(
  partnerId: string,
  partnerName: string,
  endpoint: string,
  requestCount: number,
  billingAmount: number
): RevenueEvent {
  const event: RevenueEvent = {
    id: `rev_api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    stream: 'api_access',
    amount: billingAmount,
    currency: 'USD',
    timestamp: new Date().toISOString(),
    metadata: {
      partnerId,
      partnerName,
      endpoint,
      requestCount,
      ratePerRequest: billingAmount / requestCount,
    },
  };

  logRevenueEvent(event);
  return event;
}

/**
 * Get revenue summary by stream
 */
export function getRevenueSummary(
  events: RevenueEvent[],
  dateRange: { start: string; end: string }
): Record<RevenueStream, { total: number; count: number; average: number }> {
  const filtered = events.filter(e => {
    const eventDate = new Date(e.timestamp);
    return eventDate >= new Date(dateRange.start) && eventDate <= new Date(dateRange.end);
  });

  const summary: Record<RevenueStream, { total: number; count: number; average: number }> = {
    subscription: { total: 0, count: 0, average: 0 },
    affiliate: { total: 0, count: 0, average: 0 },
    sponsored_opportunity: { total: 0, count: 0, average: 0 },
    business_submission: { total: 0, count: 0, average: 0 },
    enterprise_license: { total: 0, count: 0, average: 0 },
    data_insights: { total: 0, count: 0, average: 0 },
    api_access: { total: 0, count: 0, average: 0 },
    premium_network: { total: 0, count: 0, average: 0 },
    premium_pack: { total: 0, count: 0, average: 0 },
    premium_workflow: { total: 0, count: 0, average: 0 },
  };

  filtered.forEach(event => {
    summary[event.stream].total += event.amount;
    summary[event.stream].count += 1;
  });

  Object.keys(summary).forEach(stream => {
    const s = stream as RevenueStream;
    if (summary[s].count > 0) {
      summary[s].average = summary[s].total / summary[s].count;
    }
  });

  return summary;
}

/**
 * Get total revenue
 */
export function getTotalRevenue(
  events: RevenueEvent[],
  dateRange: { start: string; end: string }
): number {
  const summary = getRevenueSummary(events, dateRange);
  return Object.values(summary).reduce((total, stream) => total + stream.total, 0);
}

/**
 * Log revenue event (to database/analytics)
 */
function logRevenueEvent(event: RevenueEvent): void {
  console.log('[Revenue Event]', event);

  // Expert stub: Integrate with database and analytics
  // Robust fallback: Log to console for now
}

/**
 * Business submission tier configurations
 */
export const BUSINESS_SUBMISSION_TIERS: Record<string, BusinessSubmissionTier> = {
  free: {
    tier: 'free',
    monthlyCost: 0,
    benefits: [
      'Basic listing',
      'Business name and address',
      'Phone and website',
      'Limited to 1 location',
    ],
  },
  verified: {
    tier: 'verified',
    monthlyCost: 29,
    benefits: [
      'Verified badge',
      'Multiple locations',
      'Photos and videos',
      'Customer reviews',
      'Business hours',
      'Special offers',
    ],
  },
  featured: {
    tier: 'featured',
    monthlyCost: 79,
    benefits: [
      'All Verified benefits',
      'Featured placement in category',
      'Priority in search results',
      'Analytics dashboard',
      'Social media links',
      'Veteran-owned certification',
    ],
  },
  sponsored: {
    tier: 'sponsored',
    monthlyCost: 199,
    benefits: [
      'All Featured benefits',
      'Top placement in all relevant searches',
      'Homepage rotation',
      'Email newsletter placement',
      'Dedicated account manager',
      'Monthly performance reports',
    ],
  },
};

/**
 * Enterprise pricing tiers
 */
export const ENTERPRISE_PRICING = {
  va_office: { pricePerSeat: 10, minimumSeats: 50 },
  vso: { pricePerSeat: 15, minimumSeats: 25 },
  nonprofit: { pricePerSeat: 12, minimumSeats: 10 },
  university: { pricePerSeat: 8, minimumSeats: 100 },
  employer: { pricePerSeat: 20, minimumSeats: 50 },
};
