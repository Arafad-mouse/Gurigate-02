import { supabase } from '@/lib/supabase';
import type {
  Property,
  CreatePropertyRequest,
  PropertyStatus,
  PropertyAddress,
  PropertyPricing,
  PropertyFeatures
} from '@/types/property';

// GuriGate-specific property interface matching database schema
export interface GuriGateProperty {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  badge: PropertyBadge;
  price_unit_label: string;
  status: PropertyStatus;
  is_featured: boolean;
  is_approved: boolean;
  view_count: number;
  rating: number;
  review_count: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  address?: PropertyAddress;
  pricing?: PropertyPricing;
  features?: PropertyFeatures;
  images?: PropertyImage[];
}

export interface PropertyImage {
  id: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
}

export type PropertyType = 
  | 'apartment'
  | 'house'
  | 'villa'
  | 'studio'
  | 'condo'
  | 'townhouse'
  | 'cottage'
  | 'penthouse'
  | 'loft'
  | 'other';

export type PropertyBadge = 
  | 'FOR_SALE'
  | 'FOR_RENT'
  | 'SHORT_STAY';

// Property service following GuriGate system rules
export class PropertyService {
  // Create a new property
  static async createProperty(propertyData: CreatePropertyRequest & {
    badge: PropertyBadge;
    price_unit_label: string;
  }): Promise<Property> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      console.log('Auth check result:', { user, userError });
      
      if (userError) {
        console.error('Auth error details:', userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!user) {
        throw new Error('User not authenticated. Please log in to add a property.');
      }

      // Insert property into database
      const { data, error } = await supabase
        .from('properties')
        .insert({
          title: propertyData.title,
          description: propertyData.description,
          type: propertyData.type,
          badge: propertyData.badge,
          price_unit_label: propertyData.price_unit_label,
          status: 'pending' as PropertyStatus,
          is_featured: false,
          is_approved: false,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Property creation error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw new Error(error.message || 'Failed to create property');
      }

      // Insert related data
      const propertyId = data.id;
      
      // Insert address
      if (propertyData.address) {
        await supabase.from('property_addresses').insert({
          property_id: propertyId,
          ...propertyData.address,
        });
      }

      // Insert pricing
      if (propertyData.pricing) {
        await supabase.from('property_pricing').insert({
          property_id: propertyId,
          ...propertyData.pricing,
        });
      }

      // Insert features
      if (propertyData.features) {
        await supabase.from('property_features').insert({
          property_id: propertyId,
          bedrooms: propertyData.features.bedrooms,
          bathrooms: propertyData.features.bathrooms,
          max_guests: propertyData.features.max_guests,
          square_feet: propertyData.features.square_feet,
          amenities: propertyData.features.amenities,
          rules: propertyData.features.rules,
        });
      }

      return data as Property;
    } catch (error) {
      console.error('PropertyService.createProperty error:', error);
      throw error;
    }
  }

  // Get featured properties (for homepage)
  static async getFeaturedProperties(): Promise<GuriGateProperty[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          locations!properties_city_location_id_fkey(name),
          property_images(url, is_primary, sort_order)
        `)
        .eq('status', 'active')
        .eq('is_approved', true)
        .eq('is_featured', true)
        .order('rating_avg', { ascending: false });

      if (error) {
        console.error('Error fetching featured properties:', error);
        throw new Error(error.message || 'Failed to fetch featured properties');
      }

      return data as GuriGateProperty[];
    } catch (error) {
      console.error('PropertyService.getFeaturedProperties error:', error);
      throw error;
    }
  }

  // Get properties by city
  static async getPropertiesByCity(city: string): Promise<GuriGateProperty[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          locations!properties_city_location_id_fkey(name),
          property_images(url, is_primary, sort_order)
        `)
        .eq('status', 'active')
        .eq('is_approved', true)
        .eq('locations.name', city)
        .order('rating_avg', { ascending: false });

      if (error) {
        console.error('Error fetching properties by city:', error);
        throw new Error(error.message || 'Failed to fetch properties by city');
      }

      return data as GuriGateProperty[];
    } catch (error) {
      console.error('PropertyService.getPropertiesByCity error:', error);
      throw error;
    }
  }

  // Get all properties for current user
  static async getUserProperties(): Promise<Property[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message || 'Failed to fetch properties');
      }

      return data as Property[];
    } catch (error) {
      console.error('PropertyService.getUserProperties error:', error);
      throw error;
    }
  }

  // Get single property by ID
  static async getPropertyById(id: string): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message || 'Property not found');
      }

      return data as Property;
    } catch (error) {
      console.error('PropertyService.getPropertyById error:', error);
      throw error;
    }
  }

  // Update property
  static async updateProperty(id: string, updates: Partial<Property>): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Failed to update property');
      }

      return data as Property;
    } catch (error) {
      console.error('PropertyService.updateProperty error:', error);
      throw error;
    }
  }

  // Delete property
  static async deleteProperty(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message || 'Failed to delete property');
      }
    } catch (error) {
      console.error('PropertyService.deleteProperty error:', error);
      throw error;
    }
  }

  // Upload property image
  static async uploadPropertyImage(propertyId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (error) {
        throw new Error(error.message || 'Failed to upload image');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('PropertyService.uploadPropertyImage error:', error);
      throw error;
    }
  }

  // Validate property data
  static validatePropertyData(data: CreatePropertyRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Title validation
    if (!data.title?.trim()) {
      errors.push('Property title is required');
    } else if (data.title.trim().length < 3) {
      errors.push('Property title must be at least 3 characters');
    } else if (data.title.trim().length > 100) {
      errors.push('Property title must be less than 100 characters');
    }

    // Description validation
    if (!data.description?.trim()) {
      errors.push('Property description is required');
    } else if (data.description.trim().length < 10) {
      errors.push('Property description must be at least 10 characters');
    } else if (data.description.trim().length > 2000) {
      errors.push('Property description must be less than 2000 characters');
    }

    // Type validation
    if (!data.type) {
      errors.push('Property type is required');
    }

    // Address validation
    if (!data.address.street?.trim()) {
      errors.push('Street address is required');
    }
    if (!data.address.city?.trim()) {
      errors.push('City is required');
    }
    if (!data.address.country?.trim()) {
      errors.push('Country is required');
    }

    // Pricing validation
    if (!data.pricing.base_price || data.pricing.base_price <= 0) {
      errors.push('Base price must be greater than 0');
    }
    if (!data.pricing.currency?.trim()) {
      errors.push('Currency is required');
    }
    if (!data.pricing.pricing_type) {
      errors.push('Pricing type is required');
    }

    // Features validation
    if (!data.features.bedrooms || data.features.bedrooms < 0) {
      errors.push('Number of bedrooms must be 0 or greater');
    }
    if (!data.features.bathrooms || data.features.bathrooms < 0) {
      errors.push('Number of bathrooms must be 0 or greater');
    }
    if (!data.features.max_guests || data.features.max_guests < 1) {
      errors.push('Maximum guests must be at least 1');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // RMS: Publish property to Homes marketplace
  static async publishToHomes(propertyId: string): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({
          published_to_homes: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', propertyId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Failed to publish property to Homes');
      }

      return data as Property;
    } catch (error) {
      console.error('PropertyService.publishToHomes error:', error);
      throw error;
    }
  }

  // RMS: Unpublish property from Homes marketplace
  static async unpublishFromHomes(propertyId: string): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({
          published_to_homes: false,
          marketplace_listing_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', propertyId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Failed to unpublish property from Homes');
      }

      return data as Property;
    } catch (error) {
      console.error('PropertyService.unpublishFromHomes error:', error);
      throw error;
    }
  }

  // RMS: Update property metrics (occupancy, revenue, etc.)
  static async updatePropertyMetrics(
    propertyId: string,
    metrics: {
      total_units?: number;
      occupied_units?: number;
      vacant_units?: number;
      occupancy_rate?: number;
      monthly_revenue?: number;
      outstanding_rent?: number;
      maintenance_count?: number;
      upcoming_lease_expiry?: number;
    }
  ): Promise<Property> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({
          ...metrics,
          updated_at: new Date().toISOString(),
        })
        .eq('id', propertyId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Failed to update property metrics');
      }

      return data as Property;
    } catch (error) {
      console.error('PropertyService.updatePropertyMetrics error:', error);
      throw error;
    }
  }

  // RMS: Get property statistics
  static async getPropertyStats(propertyId: string): Promise<{
    total_units: number;
    occupied_units: number;
    vacant_units: number;
    occupancy_rate: number;
    monthly_revenue: number;
    outstanding_rent: number;
    maintenance_count: number;
    upcoming_lease_expiry: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('total_units, occupied_units, vacant_units, occupancy_rate, monthly_revenue, outstanding_rent, maintenance_count, upcoming_lease_expiry')
        .eq('id', propertyId)
        .single();

      if (error) {
        throw new Error(error.message || 'Failed to fetch property stats');
      }

      return {
        total_units: data.total_units || 0,
        occupied_units: data.occupied_units || 0,
        vacant_units: data.vacant_units || 0,
        occupancy_rate: data.occupancy_rate || 0,
        monthly_revenue: data.monthly_revenue || 0,
        outstanding_rent: data.outstanding_rent || 0,
        maintenance_count: data.maintenance_count || 0,
        upcoming_lease_expiry: data.upcoming_lease_expiry || 0,
      };
    } catch (error) {
      console.error('PropertyService.getPropertyStats error:', error);
      throw error;
    }
  }

  // RMS: Get all published properties for marketplace
  static async getPublishedProperties(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('published_to_homes', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message || 'Failed to fetch published properties');
      }

      return data as Property[];
    } catch (error) {
      console.error('PropertyService.getPublishedProperties error:', error);
      throw error;
    }
  }
}
