import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
import type { LandingProperty } from '@/data/landingProperties';
import type { PropertyWithDetails, PropertyImage } from '@/types/propertyDetails';

// GuriGate property service that works with existing database schema
export class GuriGatePropertyService {
  // Convert database property to LandingProperty format
  private static convertToLandingProperty(dbProperty: PropertyWithDetails): LandingProperty {
    const category = dbProperty.property_category as LandingProperty["category"] | undefined;
    const categoryDetails = null;

    return {
      id: dbProperty.id,
      title: dbProperty.title,
      address: dbProperty.location_name || `${dbProperty.city}, ${dbProperty.district || ''}`,
      price: this.formatPrice(dbProperty.price, dbProperty.purpose),
      priceUnit: dbProperty.price_unit_label || this.getDefaultPriceUnit(dbProperty.price_unit),
      beds: dbProperty.bedrooms || 0,
      baths: dbProperty.bathrooms || 0,
      sqft: 0, // Square feet not in existing schema
      badge: this.convertPurposeToBadge(dbProperty.purpose),
      featured: dbProperty.is_featured || false,
      image: this.getPrimaryImage(dbProperty.primary_image_url, dbProperty.images),
      rating: dbProperty.rating_avg || 0,
      location: dbProperty.city,
      type: this.formatPropertyType(dbProperty.type, dbProperty.city),
      city: dbProperty.city,
      reviews: dbProperty.review_count || 0,
      guests: dbProperty.max_guests || 0,
      category,
      categoryDetails: categoryDetails ?? undefined,
    };
  }

  private static formatPrice(price: number, purpose: string): string {
    if (purpose === 'sale') {
      return `$${price.toLocaleString()}`;
    }
    return `$${price}`;
  }

  private static getDefaultPriceUnit(priceUnit: string): string {
    switch (priceUnit) {
      case 'total': return '';
      case 'per_night': return 'for 2 nights';
      case 'per_month': return '/month';
      default: return 'for 2 nights';
    }
  }

  private static convertPurposeToBadge(purpose: string): LandingProperty['badge'] {
    switch (purpose) {
      case 'sale': return 'FOR SALE';
      case 'long_rent': return 'FOR RENT';
      case 'short_stay': return 'SHORT STAY';
      default: return 'SHORT STAY';
    }
  }

  private static getPrimaryImage(primaryImageUrl?: string, images?: PropertyImage[]): string {
    if (primaryImageUrl) return primaryImageUrl;
    if (!images || images.length === 0) {
      return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80';
    }
    const primaryImage = images.find((img: PropertyImage) => img.is_primary);
    return primaryImage?.url || images[0]?.url || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80';
  }

  private static formatPropertyType(type: string, city: string): string {
    const typeMap: { [key: string]: string } = {
      apartment: 'Apartment',
      house: 'House',
      villa: 'Villa',
      studio: 'Studio',
      condo: 'Condo',
      townhouse: 'Townhouse',
      cottage: 'Cottage',
      penthouse: 'Penthouse',
      loft: 'Loft',
      other: 'Other',
    };
    return `${typeMap[type] || type} in ${city}`;
  }

  // Get featured properties (for homepage)
  static async getFeaturedProperties(): Promise<LandingProperty[]> {
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
        .is('deleted_at', null)
        .order('rating_avg', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching featured properties:', error);
        return [];
      }

      // Flatten the data structure for conversion
      const flattenedData = data.map((property: PropertyWithDetails) => ({
        ...property,
        city: property.locations?.name || '',
        primary_image_url: property.property_images?.find((img: PropertyImage) => img.is_primary)?.url,
        images: property.property_images
      }));

      return flattenedData.map(property => this.convertToLandingProperty(property));
    } catch (error) {
      console.error('GuriGatePropertyService.getFeaturedProperties error:', error);
      return [];
    }
  }

  // Get properties by city
  static async getPropertiesByCity(city: string): Promise<LandingProperty[]> {
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
        .is('deleted_at', null)
        .order('rating_avg', { ascending: false });

      if (error) {
        console.error(`Error fetching properties for ${city}:`, error);
        return [];
      }

      // Flatten the data structure for conversion
      const flattenedData = data.map((property: PropertyWithDetails) => ({
        ...property,
        city: property.locations?.name || city,
        primary_image_url: property.property_images?.find((img: PropertyImage) => img.is_primary)?.url,
        images: property.property_images
      }));

      return flattenedData.map(property => this.convertToLandingProperty(property));
    } catch (error) {
      console.error(`GuriGatePropertyService.getPropertiesByCity error for ${city}:`, error);
      return [];
    }
  }

  // Get all properties (combines featured and city-specific)
  static async getAllProperties(): Promise<LandingProperty[]> {
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
        .is('deleted_at', null)
        .order('rating_avg', { ascending: false });

      if (error) {
        console.error('Error fetching all properties:', error);
        return [];
      }

      // Flatten the data structure for conversion
      const flattenedData = data.map((property: PropertyWithDetails) => ({
        ...property,
        city: property.locations?.name || '',
        primary_image_url: property.property_images?.find((img: PropertyImage) => img.is_primary)?.url,
        images: property.property_images
      }));

      return flattenedData.map(property => this.convertToLandingProperty(property));
    } catch (error) {
      console.error('GuriGatePropertyService.getAllProperties error:', error);
      return [];
    }
  }

  // Search properties
  static async searchProperties(query: string, filters?: {
    city?: string;
    badge?: LandingProperty['badge'];
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    maxGuests?: number;
  }): Promise<LandingProperty[]> {
    try {
      let supabaseQuery = supabase
        .from('properties')
        .select(`
          *,
          locations!properties_city_location_id_fkey(name),
          property_images(url, is_primary, sort_order)
        `)
        .eq('status', 'active')
        .eq('is_approved', true)
        .is('deleted_at', null);

      // Apply filters
      if (filters?.city) {
        supabaseQuery = supabaseQuery.eq('locations.name', filters.city);
      }

      if (filters?.badge) {
        const purposeMap: { [key: string]: string } = {
          'FOR SALE': 'sale',
          'FOR RENT': 'long_rent',
          'SHORT STAY': 'short_stay'
        };
        supabaseQuery = supabaseQuery.eq('purpose', purposeMap[filters.badge] || 'short_stay');
      }

      if (filters?.bedrooms) {
        supabaseQuery = supabaseQuery.gte('bedrooms', filters.bedrooms);
      }

      if (filters?.maxGuests) {
        supabaseQuery = supabaseQuery.gte('max_guests', filters.maxGuests);
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        console.error('Error searching properties:', error);
        return [];
      }

      // Flatten the data structure for conversion
      const flattenedData = data.map((property: PropertyWithDetails) => ({
        ...property,
        city: property.locations?.name || '',
        primary_image_url: property.property_images?.find((img: PropertyImage) => img.is_primary)?.url,
        images: property.property_images
      }));

      let properties = flattenedData.map(property => this.convertToLandingProperty(property));

      // Apply text search and price filters
      if (query.trim()) {
        const lowerQuery = query.toLowerCase();
        properties = properties.filter(p =>
          p.title.toLowerCase().includes(lowerQuery) ||
          p.address.toLowerCase().includes(lowerQuery) ||
          p.city.toLowerCase().includes(lowerQuery) ||
          p.type.toLowerCase().includes(lowerQuery)
        );
      }

      if (filters?.minPrice || filters?.maxPrice) {
        properties = properties.filter(p => {
          const numericPrice = parseInt(p.price.replace(/[^0-9]/g, ""));
          if (filters.minPrice && numericPrice < filters.minPrice) return false;
          if (filters.maxPrice && numericPrice > filters.maxPrice) return false;
          return true;
        });
      }

      return properties;
    } catch (error) {
      console.error('GuriGatePropertyService.searchProperties error:', error);
      return [];
    }
  }

  // Get property by ID
  static async getPropertyById(id: string): Promise<LandingProperty | null> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          locations!properties_city_location_id_fkey(name),
          property_images(url, is_primary, sort_order)
        `)
        .eq('id', id)
        .eq('status', 'active')
        .eq('is_approved', true)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Error fetching property by ID:', error);
        return null;
      }

      // Flatten the data structure for conversion
      const flattenedData = {
        ...data,
        city: data.locations?.name || '',
        primary_image_url: data.property_images?.find((img: PropertyImage) => img.is_primary)?.url,
        images: data.property_images,
      };

      return this.convertToLandingProperty(flattenedData);
    } catch (error) {
      console.error('GuriGatePropertyService.getPropertyById error:', error);
      return null;
    }
  }

  // Increment view count
  static async incrementViewCount(propertyId: string): Promise<void> {
    try {
      // This would need the actual UUID, but for now we'll skip it
      // In production, you'd convert the ID and update the view count
      console.log('Incrementing view count for property:', propertyId);
    } catch (error) {
      console.error('GuriGatePropertyService.incrementViewCount error:', error);
    }
  }

  // Toggle wishlist
  static async toggleWishlist(propertyId: string): Promise<boolean> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Check if already in wishlist
      const { data: existing } = await supabase
        .from('wishlists')
        .select('*')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .single();

      if (existing) {
        // Remove from wishlist
        await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);
        return false;
      } else {
        // Add to wishlist
        await supabase
          .from('wishlists')
          .insert({
            user_id: user.id,
            property_id: propertyId,
          });
        return true;
      }
    } catch (error) {
      console.error('GuriGatePropertyService.toggleWishlist error:', error);
      return false;
    }
  }
}
