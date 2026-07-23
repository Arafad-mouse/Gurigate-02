/**
 * Property Repository
 *
 * This repository handles database operations for properties, addresses, pricing, and features.
 * It follows the layered architecture: Page → Hook → Service → Repository → Supabase → Database
 *
 * Tables managed:
 * - properties
 * - property_addresses
 * - property_pricing
 * - property_features
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from '@/integrations/supabase/types_utf8';

// Type aliases for convenience
type Property = Tables<'properties'>;
type PropertyInsert = TablesInsert<'properties'>;
type PropertyUpdate = TablesUpdate<'properties'>;
type PropertyAddress = Tables<'property_addresses'>;
type PropertyAddressInsert = TablesInsert<'property_addresses'>;
type PropertyAddressUpdate = TablesUpdate<'property_addresses'>;
type PropertyPricing = Tables<'property_pricing'>;
type PropertyPricingInsert = TablesInsert<'property_pricing'>;
type PropertyPricingUpdate = TablesUpdate<'property_pricing'>;
type PropertyFeatures = Tables<'property_features'>;
type PropertyFeaturesInsert = TablesInsert<'property_features'>;
type PropertyFeaturesUpdate = TablesUpdate<'property_features'>;
type Profile = Tables<'profiles'>;

/**
 * Property with profile information (joined view)
 */
export interface PropertyWithProfile extends Property {
  profile: Profile | null;
}

/**
 * Property with all related data
 */
export interface PropertyWithRelations extends Property {
  address: PropertyAddress | null;
  pricing: PropertyPricing | null;
  features: PropertyFeatures | null;
  profile: Profile | null;
}

/**
 * Property repository class
 */
export class PropertyRepository {
  /**
   * List properties with pagination and filters
   */
  async listProperties(options: {
    page?: number;
    pageSize?: number;
    ownerId?: string;
    status?: Database['public']['Enums']['property_status'];
    type?: Database['public']['Enums']['property_type'];
    badge?: Database['public']['Enums']['property_badge'];
    isFeatured?: boolean;
    isApproved?: boolean;
  } = {}): Promise<{ data: PropertyWithProfile[]; count: number }> {
    const {
      page = 1,
      pageSize = 20,
      ownerId,
      status,
      type,
      badge,
      isFeatured,
      isApproved,
    } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('properties')
      .select('*, profiles(*)', { count: 'exact' })
      .is('deleted_at', null)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (badge) {
      query = query.eq('badge', badge);
    }

    if (isFeatured !== undefined) {
      query = query.eq('is_featured', isFeatured);
    }

    if (isApproved !== undefined) {
      query = query.eq('is_approved', isApproved);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to list properties: ${error.message}`);
    }

    return {
      data: (data as PropertyWithProfile[]) || [],
      count: count || 0,
    };
  }

  /**
   * Get property by ID with profile
   */
  async getPropertyById(id: string): Promise<PropertyWithProfile | null> {
    const { data, error } = await supabase
      .from('properties')
      .select('*, profiles(*)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get property: ${error.message}`);
    }

    return data as PropertyWithProfile;
  }

  /**
   * Get property with all relations
   */
  async getPropertyWithRelations(id: string): Promise<PropertyWithRelations | null> {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        profiles(*),
        property_addresses(*),
        property_pricing(*),
        property_features(*)
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get property with relations: ${error.message}`);
    }

    return data as PropertyWithRelations;
  }

  /**
   * Create a new property with relations
   */
  async createProperty(data: {
    property: PropertyInsert;
    address: PropertyAddressInsert;
    pricing: PropertyPricingInsert;
    features: PropertyFeaturesInsert;
  }): Promise<Property> {
    // Create property first
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert(data.property)
      .select()
      .single();

    if (propertyError) {
      throw new Error(`Failed to create property: ${propertyError.message}`);
    }

    const propertyId = property.id;

    // Create address
    const addressData = { ...data.address, property_id: propertyId };
    await supabase.from('property_addresses').insert(addressData);

    // Create pricing
    const pricingData = { ...data.pricing, property_id: propertyId };
    await supabase.from('property_pricing').insert(pricingData);

    // Create features
    const featuresData = { ...data.features, property_id: propertyId };
    await supabase.from('property_features').insert(featuresData);

    return property;
  }

  /**
   * Update a property
   */
  async updateProperty(id: string, updates: PropertyUpdate): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update property: ${error.message}`);
    }

    return data;
  }

  /**
   * Update property address
   */
  async updatePropertyAddress(
    propertyId: string,
    updates: PropertyAddressUpdate
  ): Promise<PropertyAddress> {
    const { data, error } = await supabase
      .from('property_addresses')
      .update(updates)
      .eq('property_id', propertyId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update property address: ${error.message}`);
    }

    return data;
  }

  /**
   * Update property pricing
   */
  async updatePropertyPricing(
    propertyId: string,
    updates: PropertyPricingUpdate
  ): Promise<PropertyPricing> {
    const { data, error } = await supabase
      .from('property_pricing')
      .update(updates)
      .eq('property_id', propertyId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update property pricing: ${error.message}`);
    }

    return data;
  }

  /**
   * Update property features
   */
  async updatePropertyFeatures(
    propertyId: string,
    updates: PropertyFeaturesUpdate
  ): Promise<PropertyFeatures> {
    const { data, error } = await supabase
      .from('property_features')
      .update(updates)
      .eq('property_id', propertyId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update property features: ${error.message}`);
    }

    return data;
  }

  /**
   * Soft delete a property
   */
  async deleteProperty(id: string, deletedBy: string): Promise<void> {
    const { error } = await supabase
      .from('properties')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  }

  /**
   * Restore a deleted property
   */
  async restoreProperty(id: string): Promise<Property> {
    const { data, error } = await supabase
      .from('properties')
      .update({
        deleted_at: null,
        deleted_by: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to restore property: ${error.message}`);
    }

    return data;
  }

  /**
   * Search properties by title or description
   */
  async searchProperties(
    query: string,
    options: {
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<{ data: PropertyWithProfile[]; count: number }> {
    const { page = 1, pageSize = 20 } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('properties')
      .select('*, profiles(*)', { count: 'exact' })
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .is('deleted_at', null)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search properties: ${error.message}`);
    }

    return {
      data: (data as PropertyWithProfile[]) || [],
      count: count || 0,
    };
  }

  /**
   * Get properties by owner
   */
  async getPropertiesByOwner(
    ownerId: string,
    options: {
      page?: number;
      pageSize?: number;
    } = {}
  ): Promise<{ data: Property[]; count: number }> {
    const { page = 1, pageSize = 20 } = options;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('owner_id', ownerId)
      .is('deleted_at', null)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to get properties by owner: ${error.message}`);
    }

    return {
      data: data || [],
      count: count || 0,
    };
  }

  /**
   * Get featured properties
   */
  async getFeaturedProperties(limit: number = 10): Promise<Property[]> {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('is_featured', true)
      .eq('is_approved', true)
      .eq('status', 'available')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get featured properties: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update property rating (called after review)
   */
  async updatePropertyRating(id: string, rating: number, reviewCount: number): Promise<Property> {
    return this.updateProperty(id, {
      rating_avg: rating,
      review_count: reviewCount,
    });
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: string): Promise<Property> {
    const { data, error } = await supabase.rpc('increment_property_view_count', {
      property_id: id,
    });

    if (error) {
      throw new Error(`Failed to increment view count: ${error.message}`);
    }

    return data as Property;
  }

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(): Promise<{
    totalProperties: number;
    activeProperties: number;
    pendingApproval: number;
    averageRating: number;
    totalReviews: number;
  }> {
    const { data, error } = await supabase
      .from('properties')
      .select('status, is_approved, rating_avg, review_count')
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to get dashboard metrics: ${error.message}`);
    }

    const properties = data || [];
    const totalProperties = properties.length;
    const activeProperties = properties.filter(p => p.status === 'available').length;
    const pendingApproval = properties.filter(p => !p.is_approved).length;
    const averageRating =
      properties.reduce((sum, p) => sum + (p.rating_avg || 0), 0) / (totalProperties || 1);
    const totalReviews = properties.reduce((sum, p) => sum + (p.review_count || 0), 0);

    return {
      totalProperties,
      activeProperties,
      pendingApproval,
      averageRating,
      totalReviews,
    };
  }
}

// Export singleton instance
export const propertyRepository = new PropertyRepository();
