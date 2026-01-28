/**
 * MILITARY DISCOUNT DISCOVERY ENGINE
 *
 * Discovers, updates, and surfaces military/veteran discounts.
 * Separate from wizard - standalone functionality.
 *
 * INTEGRATIONS:
 * - Digital Twin (user preferences, location, eligibility)
 * - Opportunity Radar (lifestyle opportunities)
 * - Local Resources Hub (local discount listings)
 * - Dashboard (new discounts card)
 * - Readiness Index (optional lifestyle category)
 * - Mission Packs (optional expense reduction pack)
 */

import militaryDiscountsData from './catalogs/militaryDiscounts.json';
import { DigitalTwin } from '../types/digitalTwin';

/**
 * Discount structure
 */
export interface MilitaryDiscount {
  id: string;
  businessName: string;
  category: string;
  discountType: 'percentage' | 'flat' | 'free' | 'special-pricing' | 'waived-fee';
  discountValue: string;
  description: string;
  eligibility: string[];
  verificationRequired: string[];
  availability: string;
  locations: 'national' | 'regional' | 'local' | 'online';
  state?: string;
  city?: string;
  expirationDate: string | null;
  restrictions: string | null;
  howToRedeem: string;
  website: string;
  verified: boolean;
  verifiedDate: string;
  upvotes: number;
  downvotes: number;
  reportedExpired: number;
}

/**
 * User discount preferences
 */
export interface DiscountPreferences {
  favoriteCategories: string[];
  maxDistance: number; // miles for local discounts
  favoriteBrands: string[];
  hideExpired: boolean;
  onlyVerified: boolean;
}

/**
 * Discount search filters
 */
export interface DiscountFilters {
  categories?: string[];
  eligibility?: string[];
  availability?: string[];
  locations?: string[];
  verified?: boolean;
  minUpvotes?: number;
  state?: string;
  searchQuery?: string;
}

/**
 * Get all available categories
 */
export function getDiscountCategories(): string[] {
  return militaryDiscountsData.categories;
}

/**
 * Get all discounts
 */
export function getAllDiscounts(): MilitaryDiscount[] {
  return militaryDiscountsData.discounts as MilitaryDiscount[];
}

/**
 * Search discounts with filters
 */
export function searchDiscounts(filters: DiscountFilters = {}): MilitaryDiscount[] {
  let results = getAllDiscounts();

  // Filter by category
  if (filters.categories && filters.categories.length > 0) {
    results = results.filter(d => filters.categories!.includes(d.category));
  }

  // Filter by eligibility
  if (filters.eligibility && filters.eligibility.length > 0) {
    results = results.filter(d =>
      filters.eligibility!.some(e => d.eligibility.includes(e))
    );
  }

  // Filter by availability
  if (filters.availability && filters.availability.length > 0) {
    results = results.filter(d => filters.availability!.includes(d.availability));
  }

  // Filter by location
  if (filters.locations && filters.locations.length > 0) {
    results = results.filter(d => filters.locations!.includes(d.locations));
  }

  // Filter by state
  if (filters.state) {
    results = results.filter(d => !d.state || d.state === filters.state);
  }

  // Filter by verified status
  if (filters.verified !== undefined) {
    results = results.filter(d => d.verified === filters.verified);
  }

  // Filter by minimum upvotes
  if (filters.minUpvotes !== undefined) {
    results = results.filter(d => d.upvotes >= filters.minUpvotes!);
  }

  // Search query
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    results = results.filter(d =>
      d.businessName.toLowerCase().includes(query) ||
      d.description.toLowerCase().includes(query) ||
      d.category.toLowerCase().includes(query)
    );
  }

  // Filter out reported expired if enabled
  results = results.filter(d => d.reportedExpired < 5);

  return results;
}

/**
 * Get personalized discount recommendations
 */
export function getPersonalizedDiscounts(
  digitalTwin: DigitalTwin,
  preferences?: DiscountPreferences
): MilitaryDiscount[] {
  const filters: DiscountFilters = {
    verified: true,
    minUpvotes: 100,
  };

  // Filter by user's eligibility
  if (digitalTwin.branch) {
    // All veterans are eligible for "veteran" discounts
    filters.eligibility = ['veteran'];

    // Add active-duty if applicable
    if (digitalTwin.serviceEndDate) {
      const endDate = new Date(digitalTwin.serviceEndDate);
      if (endDate > new Date()) {
        filters.eligibility.push('active-duty');
      }
    }
  }

  // Filter by state if available
  if (digitalTwin.state) {
    filters.state = digitalTwin.state;
  }

  // Filter by favorite categories
  if (preferences?.favoriteCategories && preferences.favoriteCategories.length > 0) {
    filters.categories = preferences.favoriteCategories;
  }

  let results = searchDiscounts(filters);

  // Prioritize favorite brands
  if (preferences?.favoriteBrands && preferences.favoriteBrands.length > 0) {
    results = results.sort((a, b) => {
      const aFavorite = preferences.favoriteBrands!.includes(a.businessName);
      const bFavorite = preferences.favoriteBrands!.includes(b.businessName);
      if (aFavorite && !bFavorite) return -1;
      if (!aFavorite && bFavorite) return 1;
      return b.upvotes - a.upvotes; // Sort by upvotes
    });
  } else {
    // Sort by upvotes
    results = results.sort((a, b) => b.upvotes - a.upvotes);
  }

  return results;
}

/**
 * Get discounts by category
 */
export function getDiscountsByCategory(category: string): MilitaryDiscount[] {
  return searchDiscounts({ categories: [category], verified: true });
}

/**
 * Get local discounts (state-specific)
 */
export function getLocalDiscounts(state: string): MilitaryDiscount[] {
  return searchDiscounts({
    state,
    locations: ['local', 'regional'],
    verified: true,
  });
}

/**
 * Get new discounts (added in last 30 days)
 */
export function getNewDiscounts(daysCutoff: number = 30): MilitaryDiscount[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysCutoff);

  return getAllDiscounts().filter(d => {
    if (!d.verifiedDate) return false;
    const verifiedDate = new Date(d.verifiedDate);
    return verifiedDate >= cutoffDate;
  }).sort((a, b) => {
    const dateA = new Date(a.verifiedDate);
    const dateB = new Date(b.verifiedDate);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Upvote a discount
 */
export function upvoteDiscount(discountId: string): void {
  // In real implementation, this would update the database
  console.log(`[Discount Engine] Upvoted discount ${discountId}`);
}

/**
 * Report expired discount
 */
export function reportExpiredDiscount(discountId: string): void {
  // In real implementation, this would update the database
  console.log(`[Discount Engine] Reported expired discount ${discountId}`);
}

/**
 * Submit new discount
 */
export interface NewDiscountSubmission {
  businessName: string;
  category: string;
  discountType: string;
  discountValue: string;
  description: string;
  eligibility: string[];
  verificationRequired: string[];
  availability: string;
  locations: string;
  state?: string;
  city?: string;
  website?: string;
  howToRedeem: string;
  submittedBy: 'veteran' | 'business';
  submitterName?: string;
  submitterEmail?: string;
}

export function submitDiscount(submission: NewDiscountSubmission): void {
  // In real implementation, this would add to review queue
  console.log('[Discount Engine] New discount submitted for review', submission);
}

/**
 * Calculate estimated monthly savings
 */
export function calculateMonthlySavings(
  digitalTwin: DigitalTwin,
  selectedDiscounts: MilitaryDiscount[]
): number {
  // This is a simplified calculation
  // In reality, would need user spending data

  let estimatedSavings = 0;

  selectedDiscounts.forEach(discount => {
    // Rough estimates based on category and discount type
    if (discount.category === 'Restaurants' && discount.discountType === 'percentage') {
      estimatedSavings += 20; // Assume $200/mo dining * 10% = $20
    } else if (discount.category === 'Retail' && discount.discountType === 'percentage') {
      estimatedSavings += 15; // Assume $150/mo retail * 10% = $15
    } else if (discount.category === 'Technology' && discount.discountType === 'percentage') {
      estimatedSavings += 10; // Occasional tech purchases
    } else if (discount.category === 'Home & Garden' && discount.discountType === 'percentage') {
      estimatedSavings += 12; // Home improvement savings
    }
  });

  return estimatedSavings;
}

/**
 * Get discount eligibility labels
 */
export function getEligibilityLabels(): Record<string, string> {
  return militaryDiscountsData.eligibilityTypes;
}

/**
 * Get verification method labels
 */
export function getVerificationMethodLabels(): Record<string, string> {
  return militaryDiscountsData.verificationMethods;
}

/**
 * Check if user is eligible for discount
 */
export function isEligibleForDiscount(
  digitalTwin: DigitalTwin,
  discount: MilitaryDiscount
): boolean {
  // Always eligible for veteran discounts if served
  if (discount.eligibility.includes('veteran') && digitalTwin.branch) {
    return true;
  }

  // Check active duty status
  if (discount.eligibility.includes('active-duty')) {
    if (digitalTwin.serviceEndDate) {
      const endDate = new Date(digitalTwin.serviceEndDate);
      if (endDate > new Date()) {
        return true;
      }
    }
  }

  // Check retiree status (20+ years service)
  if (discount.eligibility.includes('retiree')) {
    if (digitalTwin.serviceStartDate && digitalTwin.serviceEndDate) {
      const start = new Date(digitalTwin.serviceStartDate);
      const end = new Date(digitalTwin.serviceEndDate);
      const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
      if (years >= 20) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get suggested discount categories based on life situation
 */
export function getSuggestedCategoriesForLifeSituation(
  lifeSituation: string
): string[] {
  switch (lifeSituation) {
    case 'buying-home':
      return ['Home & Garden', 'Financial Services', 'Automotive'];
    case 'going-to-school':
      return ['Technology', 'Retail', 'Restaurants'];
    case 'starting-business':
      return ['Technology', 'Financial Services', 'Retail'];
    case 'retired':
      return ['Entertainment', 'Travel', 'Health & Wellness'];
    case 'family-focused':
      return ['Entertainment', 'Restaurants', 'Retail'];
    default:
      return ['Restaurants', 'Retail', 'Entertainment'];
  }
}
