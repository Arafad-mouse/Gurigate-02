import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
import type { LandingProperty } from '@/data/landingProperties';
import type { PropertyWithDetails, PropertyImage } from '@/types/propertyDetails';

// GuriGate property service that works with existing database schema
export class GuriGatePropertyService {
  // Convert database property to LandingProperty format
  private static convertToLandingProperty(dbProperty: any): LandingProperty {
    const category = dbProperty.property_category as LandingProperty["category"] | undefined;
    const categoryDetails = null;
    const images = dbProperty.property_images || [];
    const profile = dbProperty.profiles?.[0] || {};

    return {
      id: dbProperty.id,
      title: dbProperty.title,
      address: dbProperty.address || dbProperty.city || '',
      price: this.formatPrice(dbProperty.price || 0, dbProperty.listing_type),
      priceUnit: this.getDefaultPriceUnit(dbProperty.price_unit),
      beds: dbProperty.beds || 0,
      baths: dbProperty.bathrooms || 0,
      sqft: 0, // Square feet not in existing schema
      badge: this.convertListingTypeToBadge(dbProperty.listing_type),
      featured: dbProperty.is_featured || false,
      image: this.getPrimaryImage(images),
      rating: dbProperty.rating_avg || 0,
      location: dbProperty.city || '',
      type: this.formatPropertyType(dbProperty.type, dbProperty.city || ''),
      city: dbProperty.city || '',
      reviews: dbProperty.review_count || 0,
      guests: dbProperty.max_guests || 0,
      category,
      categoryDetails: categoryDetails ?? undefined,
      host: profile.full_name ? {
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      } : undefined,
    };
  }

  private static formatPrice(price: number, listingType: string): string {
    if (listingType === 'sale') {
      return `$${price.toLocaleString()}`;
    }
    return `$${price}`;
  }

  private static getDefaultPriceUnit(pricingType: string): string {
    switch (pricingType) {
      case 'total': return '';
      case 'nightly': return 'night';
      case 'monthly': return 'month';
      default: return 'night';
    }
  }

  private static convertListingTypeToBadge(listingType: string): LandingProperty['badge'] {
    switch (listingType) {
      case 'sale': return 'FOR SALE';
      case 'long_rent': return 'FOR RENT';
      case 'short_stay': return 'SHORT STAY';
      default: return 'SHORT STAY';
    }
  }

  private static getPrimaryImage(images: any[]): string {
    if (!images || images.length === 0) {
      return 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80';
    }
    const primaryImage = images.find((img: any) => img.is_primary);
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
      duplex: 'Duplex',
      private_room: 'Private Room',
      shared_room: 'Shared Room',
      guesthouse: 'Guesthouse',
      office: 'Office',
      shop: 'Shop',
      warehouse: 'Warehouse',
      restaurant: 'Restaurant',
      hotel: 'Hotel',
      resort: 'Resort',
      hostel: 'Hostel',
      lodge: 'Lodge',
      residential_land: 'Residential Land',
      commercial_land: 'Commercial Land',
      farm_land: 'Farm Land',
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
          id,
          title,
          type,
          description,
          approval_status,
          status,
          is_featured,
          view_count,
          created_at,
          property_category,
          listing_type,
          owner_id,
          price,
          price_unit,
          bedrooms,
          bathrooms,
          max_guests,
          beds,
          rating_avg,
          review_count,
          city,
          address,
          profiles!inner(full_name, avatar_url),
          property_images(url, is_primary, sort_order)
        `)
        .eq('approval_status', 'approved')
        .eq('status', 'active')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching featured properties:', error);
        return [];
      }

      return (data || []).map(property => this.convertToLandingProperty(property));
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
          id,
          title,
          type,
          description,
          approval_status,
          status,
          is_featured,
          view_count,
          created_at,
          property_category,
          listing_type,
          owner_id,
          price,
          price_unit,
          bedrooms,
          bathrooms,
          max_guests,
          beds,
          rating_avg,
          review_count,
          city,
          address,
          profiles!inner(full_name, avatar_url),
          property_images(url, is_primary, sort_order)
        `)
        .ilike('city', city)
        .eq('approval_status', 'approved')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching properties for ${city}:`, error);
        return [];
      }

      return (data || []).map(property => this.convertToLandingProperty(property));
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
          id,
          title,
          type,
          description,
          approval_status,
          status,
          is_featured,
          view_count,
          created_at,
          property_category,
          listing_type,
          owner_id,
          price,
          price_unit,
          bedrooms,
          bathrooms,
          max_guests,
          beds,
          rating_avg,
          review_count,
          city,
          address,
          profiles!inner(full_name, avatar_url),
          property_images(url, is_primary, sort_order)
        `)
        .eq('approval_status', 'approved')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all properties:', error);
        return [];
      }

      return (data || []).map(property => this.convertToLandingProperty(property));
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
          id,
          title,
          type,
          description,
          approval_status,
          status,
          is_featured,
          view_count,
          created_at,
          property_category,
          listing_type,
          owner_id,
          price,
          price_unit,
          bedrooms,
          bathrooms,
          max_guests,
          beds,
          rating_avg,
          review_count,
          city,
          address,
          profiles!inner(full_name, avatar_url),
          property_images(url, is_primary, sort_order)
        `)
        .eq('approval_status', 'approved')
        .eq('status', 'active');

      // Apply filters
      if (filters?.city) {
        supabaseQuery = supabaseQuery.ilike('city', filters.city);
      }

      if (filters?.badge) {
        const listingTypeMap: { [key: string]: string } = {
          'FOR SALE': 'sale',
          'FOR RENT': 'long_rent',
          'SHORT STAY': 'short_stay'
        };
        supabaseQuery = supabaseQuery.eq('listing_type', listingTypeMap[filters.badge] || 'short_stay');
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

      let properties = (data || []).map(property => this.convertToLandingProperty(property));

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
          id,
          title,
          type,
          description,
          approval_status,
          status,
          is_featured,
          view_count,
          created_at,
          property_category,
          listing_type,
          owner_id,
          price,
          price_unit,
          bedrooms,
          bathrooms,
          max_guests,
          beds,
          rating_avg,
          review_count,
          city,
          address,
          profiles!inner(full_name, avatar_url),
          property_images(url, is_primary, sort_order)
        `)
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching property by ID:', error);
        return null;
      }

      return this.convertToLandingProperty(data);
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
