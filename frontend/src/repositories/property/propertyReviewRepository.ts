/**
 * Property Review Repository
 *
 * This repository handles database operations for property reviews.
 * It follows the layered architecture: Page → Hook → Service → Repository → Supabase → Database
 *
 * Tables managed:
 * - property_reviews
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/integrations/supabase/types_utf8';

// Type aliases for convenience
type PropertyReview = Tables<'property_reviews'>;
type PropertyReviewInsert = TablesInsert<'property_reviews'>;
type PropertyReviewUpdate = TablesUpdate<'property_reviews'>;

/**
 * Property review repository class
 */
export class PropertyReviewRepository {
  /**
   * Get reviews for a property with pagination
   */
  async getPropertyReviews(
    propertyId: string,
    options: {
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<{ data: PropertyReview[]; count: number }> {
    const { page = 1, pageSize = 20 } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('property_reviews')
      .select('*', { count: 'exact' })
      .eq('property_id', propertyId)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get property reviews: ${error.message}`);
    }

    return {
      data: data || [],
      count: count || 0,
    };
  }

  /**
   * Get review by ID
   */
  async getReviewById(id: string): Promise<PropertyReview | null> {
    const { data, error } = await supabase
      .from('property_reviews')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get review: ${error.message}`);
    }

    return data;
  }

  /**
   * Get reviews by guest
   */
  async getReviewsByGuest(guestId: string): Promise<PropertyReview[]> {
    const { data, error } = await supabase
      .from('property_reviews')
      .select('*')
      .eq('guest_id', guestId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get reviews by guest: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Create a new property review
   */
  async createReview(review: PropertyReviewInsert): Promise<PropertyReview> {
    const { data, error } = await supabase
      .from('property_reviews')
      .insert(review)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create review: ${error.message}`);
    }

    return data;
  }

  /**
   * Update a property review
   */
  async updateReview(id: string, updates: PropertyReviewUpdate): Promise<PropertyReview> {
    const { data, error } = await supabase
      .from('property_reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update review: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a property review
   */
  async deleteReview(id: string): Promise<void> {
    const { error } = await supabase
      .from('property_reviews')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete review: ${error.message}`);
    }
  }

  /**
   * Get average rating for a property
   */
  async getAverageRating(propertyId: string): Promise<number> {
    const { data, error } = await supabase
      .from('property_reviews')
      .select('rating')
      .eq('property_id', propertyId);

    if (error) {
      throw new Error(`Failed to get average rating: ${error.message}`);
    }

    const reviews = data || [];
    if (reviews.length === 0) {
      return 0;
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  }

  /**
   * Get review count for a property
   */
  async getReviewCount(propertyId: string): Promise<number> {
    const { count, error } = await supabase
      .from('property_reviews')
      .select('*', { count: 'exact', head: true })
      .eq('property_id', propertyId);

    if (error) {
      throw new Error(`Failed to get review count: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Get rating distribution for a property
   */
  async getRatingDistribution(propertyId: string): Promise<{
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  }> {
    const { data, error } = await supabase
      .from('property_reviews')
      .select('rating')
      .eq('property_id', propertyId);

    if (error) {
      throw new Error(`Failed to get rating distribution: ${error.message}`);
    }

    const reviews = data || [];
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach(review => {
      const rating = review.rating as keyof typeof distribution;
      if (distribution[rating] !== undefined) {
        distribution[rating]++;
      }
    });

    return distribution;
  }

  /**
   * Get recent reviews for a property
   */
  async getRecentReviews(propertyId: string, limit: number = 5): Promise<PropertyReview[]> {
    const { data, error } = await supabase
      .from('property_reviews')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get recent reviews: ${error.message}`);
    }

    return data || [];
  }
}

// Export singleton instance
export const propertyReviewRepository = new PropertyReviewRepository();
