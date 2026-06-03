import { supabase } from '@/lib/supabase';
import type { HostFormData } from '@/components/host-onboarding/types';

export class HostOnboardingService {
  static async saveProperty(data: HostFormData, ownerId: string) {
    try {
      // Insert property
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
          title: data.title || 'New Property',
          description: `A beautiful ${data.propertyTypes[0] || 'property'} in ${data.city}`,
          type: this.mapPropertyType(data.propertyTypes[0] || 'apartment'),
          badge: 'SHORT_STAY',
          price_unit_label: 'for 2 nights',
          status: 'pending',
          is_featured: false,
          is_approved: false,
          owner_id: ownerId,
        })
        .select()
        .single();

      if (propertyError) {
        console.error('Error creating property:', propertyError);
        throw propertyError;
      }

      // Insert address
      if (property) {
        const { error: addressError } = await supabase
          .from('property_addresses')
          .insert({
            property_id: property.id,
            street: data.streetAddress || '',
            city: data.city,
            state: data.province,
            postal_code: data.postalCode,
            country: data.country,
            latitude: null,
            longitude: null,
          });

        if (addressError) {
          console.error('Error creating address:', addressError);
        }

        // Insert features
        const { error: featuresError } = await supabase
          .from('property_features')
          .insert({
            property_id: property.id,
            bedrooms: data.bedrooms,
            bathrooms: data.privateBathrooms + data.dedicatedBathrooms + data.sharedBathrooms,
            max_guests: data.guests,
            square_feet: null,
            amenities: data.amenities,
            rules: [],
          });

        if (featuresError) {
          console.error('Error creating features:', featuresError);
        }

        // Insert pricing
        const { error: pricingError } = await supabase
          .from('property_pricing')
          .insert({
            property_id: property.id,
            base_price: 100, // Default price, should be calculated based on user input
            currency: 'USD',
            pricing_type: 'nightly',
            security_deposit: null,
            cleaning_fee: null,
            service_fee: null,
          });

        if (pricingError) {
          console.error('Error creating pricing:', pricingError);
        }

        // Insert images if available
        if (data.photos && data.photos.length > 0) {
          const imageInserts = data.photos.map((photo: string | { url: string }, index) =>
            supabase.from('property_images').insert({
              property_id: property.id,
              image_url: typeof photo === 'string' ? photo : photo.url,
              alt_text: `Property image ${index + 1}`,
              sort_order: index,
              is_primary: index === 0,
            })
          );

          await Promise.all(imageInserts);
        }
      }

      return property;
    } catch (error) {
      console.error('HostOnboardingService.saveProperty error:', error);
      throw error;
    }
  }

  private static mapPropertyType(type: string): 'apartment' | 'house' | 'villa' | 'studio' | 'condo' | 'townhouse' | 'cottage' | 'penthouse' | 'loft' | 'other' {
    const typeMap: { [key: string]: 'apartment' | 'house' | 'villa' | 'studio' | 'condo' | 'townhouse' | 'cottage' | 'penthouse' | 'loft' | 'other' } = {
      house: 'house',
      apartment: 'apartment',
      villa: 'villa',
      studio: 'studio',
      condo: 'condo',
      townhouse: 'townhouse',
      cottage: 'cottage',
      penthouse: 'penthouse',
      loft: 'loft',
      barn: 'other',
      bnb: 'other',
      boat: 'other',
      cabin: 'other',
      camper: 'other',
      casa: 'other',
      castle: 'other',
      cave: 'other',
      container: 'other',
      cycladic: 'other',
      dammuso: 'other',
      dome: 'other',
      earthhome: 'other',
      farm: 'other',
      guesthouse: 'other',
      hotel: 'other',
      houseboat: 'other',
      minsu: 'other',
      riad: 'other',
      ryokan: 'other',
      shepherds: 'other',
      tent: 'other',
      tinyhome: 'other',
      tower: 'other',
      treehouse: 'other',
      trullo: 'other',
      windmill: 'other',
      yurt: 'other',
    };
    return typeMap[type] || 'other';
  }
}
