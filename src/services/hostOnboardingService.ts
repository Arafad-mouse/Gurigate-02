import { supabase } from '@/lib/supabase';
import type { HostFormData } from '@/components/host-onboarding/types';

type KnownPropertyType =
  | 'apartment' | 'house' | 'villa' | 'studio' | 'condo' | 'townhouse'
  | 'cottage' | 'penthouse' | 'loft' | 'other'
  | 'duplex' | 'private_room' | 'shared_room' | 'guesthouse'
  | 'office' | 'shop' | 'warehouse' | 'restaurant' | 'hotel'
  | 'resort' | 'hostel' | 'lodge'
  | 'residential_land' | 'commercial_land' | 'farm_land';

export type DraftPayload = {
  step: number;
  data: HostFormData;
  propertyId?: string;
  title?: string;
};

export class HostOnboardingService {

  // ─── Slug Generation ───────────────────────────────────────────────────────

  private static async generateSlug(title: string): Promise<string> {
    const base = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    let slug = base;
    let counter = 1;

    while (true) {
      const { data: existing } = await supabase
        .from('properties')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (!existing) return slug;

      slug = `${base}-${counter}`;
      counter++;
    }
  }

  // ─── Photo Upload ──────────────────────────────────────────────────────────

  private static async uploadPhoto(
    url: string,
    ownerId: string,
    propertyId: string,
    index: number,
  ): Promise<string> {
    if (!url.startsWith('blob:')) return url;

    const response = await fetch(url);
    const blob = await response.blob();
    const ext = blob.type.split('/')[1] || 'jpg';
    const path = `${ownerId}/${propertyId}/${Date.now()}-${index}.${ext}`;

    const { error } = await supabase.storage
      .from('property-images')
      .upload(path, blob, { contentType: blob.type, upsert: false });

    if (error) throw new Error(`Photo upload failed: ${error.message}`);

    return supabase.storage.from('property-images').getPublicUrl(path).data.publicUrl;
  }

  // ─── Amenity ID Lookup ─────────────────────────────────────────────────────

  private static async resolveAmenityIds(names: string[]): Promise<string[]> {
    if (!names.length) return [];
    const { data, error } = await supabase
      .from('amenities')
      .select('id, name')
      .in('name', names);
    if (error) {
      console.error('resolveAmenityIds error:', error);
      return [];
    }
    return (data ?? []).map((a) => a.id as string);
  }

  // ─── Draft Persistence ─────────────────────────────────────────────────────

  static async saveDraft(
    userId: string,
    step: number,
    data: HostFormData,
    propertyId?: string,
    title?: string,
  ): Promise<void> {
    const serialisable: HostFormData = {
      ...data,
      // Blob URLs are session-only; strip them so the draft is portable
      photos: data.photos.filter((p) => !p.startsWith('blob:')),
    };

    // First, try to find an existing draft for this property_id (if provided)
    let draftId: string | null = null;
    if (propertyId) {
      const { data: existing } = await supabase
        .from('property_drafts')
        .select('id')
        .eq('user_id', userId)
        .eq('property_id', propertyId)
        .eq('completed', false)
        .maybeSingle();
      draftId = existing?.id ?? null;
    }

    // If no property_id or no existing draft, find the most recent incomplete draft for this user
    if (!draftId) {
      const { data: recent } = await supabase
        .from('property_drafts')
        .select('id')
        .eq('user_id', userId)
        .eq('completed', false)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      draftId = recent?.id ?? null;
    }

    const draftRecord = {
      user_id: userId,
      property_id: propertyId ?? null,
      title: title ?? 'Untitled Draft',
      current_step: step,
      form_data: serialisable as unknown as Record<string, unknown>,
      completed: false,
      updated_at: new Date().toISOString(),
    };

    const { error } = draftId
      ? await supabase.from('property_drafts').update(draftRecord).eq('id', draftId)
      : await supabase.from('property_drafts').insert(draftRecord);

    if (error) console.error('saveDraft error:', error);
  }

  static async loadDraft(userId: string): Promise<DraftPayload | null> {
    const { data, error } = await supabase
      .from('property_drafts')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', false)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      step: data.current_step as number,
      data: data.form_data as unknown as HostFormData,
      propertyId: (data.property_id as string) ?? undefined,
      title: (data.title as string) ?? undefined,
    };
  }

  static async clearDraft(userId: string): Promise<void> {
    await supabase
      .from('property_drafts')
      .update({ completed: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
  }

  // ─── Main Save ─────────────────────────────────────────────────────────────

  static async saveProperty(data: HostFormData, ownerId: string) {
    const isStudio = (data.propertyTypes[0] ?? '').toLowerCase().includes('studio');
    const bedroomCount = isStudio ? 0 : data.bedrooms;

    // 1. Generate slug from title
    const slug = await this.generateSlug(data.title || 'New Property');

    // 2. Insert core property record (status=available, approval_status=pending)
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        title: data.title || 'New Property',
        slug,
        description: data.highlights.length
          ? data.highlights.join('. ')
          : `A ${data.propertyTypes[0] ?? 'property'} in ${data.city}`,
        type: this.mapPropertyType(data.propertyTypes[0] ?? 'apartment'),
        property_category: data.propertyCategory || 'residential',
        listing_type: data.listingType || 'short_stay',
        badge: this.listingTypeToBadge(data.listingType || 'short_stay'),
        price_unit_label: 'per night',
        status: 'available',
        approval_status: 'pending',
        is_featured: false,
        is_approved: false,
        owner_id: ownerId,
        max_guests: data.guests,
        bedrooms: bedroomCount,
        beds: data.beds,
        bedroom_lock: data.bedroomLock || null,
      })
      .select()
      .single();

    if (propertyError) throw propertyError;

    const propertyId = property.id as string;

    // 2. Save draft reference immediately so user can resume on failure
    await this.saveDraft(ownerId, 999, data, propertyId);

    // 3. Run all independent inserts in parallel
    const [addressErr, featuresErr, bathroomsErr, presenceErr, pricingErr] =
      await Promise.all([
        // Address
        supabase.from('property_addresses').insert({
          property_id: propertyId,
          street: data.streetAddress || '',
          apartment: data.apt || null,
          city: data.city,
          state: data.province,
          postal_code: data.postalCode,
          country: data.country.replace(' - SO', ''),
          latitude: null,
          longitude: null,
          show_precise_location: data.showPreciseLocation,
        }).then(({ error }) => error),

        // Features (denormalised + legacy)
        supabase.from('property_features').insert({
          property_id: propertyId,
          bedrooms: bedroomCount,
          beds: data.beds,
          bedroom_lock: data.bedroomLock || null,
          bathrooms: data.privateBathrooms + data.dedicatedBathrooms + data.sharedBathrooms,
          max_guests: data.guests,
          amenities: data.amenities,
          rules: [],
        }).then(({ error }) => error),

        // Bathroom breakdown
        supabase.from('property_bathrooms').insert({
          property_id: propertyId,
          private_attached: data.privateBathrooms,
          dedicated: data.dedicatedBathrooms,
          shared: data.sharedBathrooms,
        }).then(({ error }) => error),

        // Host presence (skip if empty)
        data.otherOccupants.length
          ? supabase.from('property_host_presence').insert({
              property_id: propertyId,
              presence_types: data.otherOccupants,
            }).then(({ error }) => error)
          : Promise.resolve(null),

        // Pricing (host can update later via pricing screen)
        supabase.from('property_pricing').insert({
          property_id: propertyId,
          base_price: 50,
          currency: 'USD',
          pricing_type: data.listingType === 'long_rent' ? 'monthly' : 'nightly',
          security_deposit: null,
          cleaning_fee: null,
          service_fee: null,
        }).then(({ error }) => error),
      ]);

    const categoryDetailsError = await this.saveCategoryDetails(propertyId, data);

    if (addressErr)   console.error('Address insert error:', addressErr);
    if (featuresErr)  console.error('Features insert error:', featuresErr);
    if (bathroomsErr) console.error('Bathrooms insert error:', bathroomsErr);
    if (presenceErr)  console.error('Host presence insert error:', presenceErr);
    if (pricingErr)   console.error('Pricing insert error:', pricingErr);
    if (categoryDetailsError) console.error('Category details insert error:', categoryDetailsError);

    // 4. Upload photos sequentially (blob: URLs from local file picker)
    if (data.photos.length) {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < data.photos.length; i++) {
        try {
          const publicUrl = await this.uploadPhoto(data.photos[i], ownerId, propertyId, i);
          uploadedUrls.push(publicUrl);
        } catch (err) {
          console.error(`Photo ${i} upload failed:`, err);
        }
      }
      if (uploadedUrls.length) {
        const { error: imgErr } = await supabase.from('property_images').insert(
          uploadedUrls.map((url, i) => ({
            property_id: propertyId,
            image_url: url,
            alt_text: `Property photo ${i + 1}`,
            sort_order: i,
            is_primary: i === 0,
          })),
        );
        if (imgErr) console.error('property_images insert error:', imgErr);
      }
    }

    // 5. Save amenities via junction table (lookup IDs from master table)
    if (data.amenities.length) {
      const ids = await this.resolveAmenityIds(data.amenities);
      if (ids.length) {
        const { error: amenErr } = await supabase.from('property_amenities').insert(
          ids.map((amenity_id) => ({ property_id: propertyId, amenity_id })),
        );
        if (amenErr) console.error('property_amenities insert error:', amenErr);
      }
    }

    // 6. Promote the user's profile role to 'host'
    try {
      await supabase.rpc('upgrade_to_host');
    } catch (err) {
      console.error('upgrade_to_host RPC error:', err);
    }

    // 7. Mark draft as completed
    await this.clearDraft(ownerId);

    return property;
  }

  private static async saveCategoryDetails(propertyId: string, data: HostFormData) {
    if (data.propertyCategory === 'residential') {
      const { error } = await supabase.from('property_residential_details').upsert({
        property_id: propertyId,
        guests: data.guests,
        bedrooms: data.bedrooms,
        beds: data.beds,
        private_bathrooms: data.privateBathrooms,
        dedicated_bathrooms: data.dedicatedBathrooms,
        shared_bathrooms: data.sharedBathrooms,
        occupancy_mode: data.otherOccupants[0] || null,
        amenities: data.amenities,
      });
      return error;
    }

    if (data.propertyCategory === 'commercial') {
      const [detailsResult, pricingResult] = await Promise.all([
        supabase.from('property_commercial_details').upsert({
          property_id: propertyId,
          floor_area: data.commercialFloorArea,
          floors: data.commercialFloors,
          parking_spaces: data.commercialParkingSpaces,
          washrooms: data.commercialWashrooms,
          storage_rooms: data.commercialStorageRooms,
          commercial_use_type: data.commercialUseTypes,
        }),
        supabase.from('property_pricing').upsert({
          property_id: propertyId,
          base_price: data.commercialMonthlyRent || 0,
          currency: 'USD',
          pricing_type: 'monthly',
          security_deposit: data.commercialSecurityDeposit || null,
          service_fee: data.commercialServiceCharge || null,
          lease_min_months: data.commercialMinimumLeaseMonths,
        }, { onConflict: 'property_id' }),
      ]);

      return detailsResult.error || pricingResult.error;
    }

    if (data.propertyCategory === 'land') {
      const [detailsResult, docsResult] = await Promise.all([
        supabase.from('property_land_details').upsert({
          property_id: propertyId,
          size_value: data.landSizeValue,
          size_unit: data.landSizeUnit,
          boundary_geojson: data.boundaryGeojson || null,
          land_features: data.landFeatures,
        }),
        data.ownershipDocuments.length
          ? supabase.from('property_documents').insert(
              data.ownershipDocuments.map((doc) => ({
                property_id: propertyId,
                document_type: doc,
                document_url: null,
              }))
            )
          : Promise.resolve({ error: null } as { error: null }),
      ]);

      return detailsResult.error || docsResult.error;
    }

    if (data.propertyCategory === 'hospitality') {
      const [detailsResult, roomTypesResult] = await Promise.all([
        supabase.from('property_hospitality_details').upsert({
          property_id: propertyId,
          total_rooms: data.hospitalityTotalRooms,
          total_floors: data.hospitalityTotalFloors,
          max_guests: data.hospitalityMaxGuests,
          check_in_time: data.hospitalityCheckInTime,
          check_out_time: data.hospitalityCheckOutTime,
          services: data.hospitalityServices,
          facilities: data.hospitalityFacilities,
          booking_mode: data.hospitalityBookingMode,
          instant_booking: data.hospitalityInstantBooking,
          min_stay_nights: data.hospitalityMinStayNights,
          max_stay_nights: data.hospitalityMaxStayNights,
        }),
        data.hospitalityRoomTypes.length
          ? supabase.from('hospitality_room_types').insert(
              data.hospitalityRoomTypes.map((roomType) => ({
                property_id: propertyId,
                room_type: roomType,
              }))
            )
          : Promise.resolve({ error: null } as { error: null }),
      ]);

      return detailsResult.error || roomTypesResult.error;
    }

    return null;
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private static listingTypeToBadge(listingType: string): string {
    switch (listingType) {
      case 'long_rent': return 'FOR_RENT';
      case 'sale':      return 'FOR_SALE';
      default:          return 'SHORT_STAY';
    }
  }

  private static mapPropertyType(raw: string): KnownPropertyType {
    const known: KnownPropertyType[] = [
      'apartment', 'house', 'villa', 'studio', 'condo', 'townhouse', 'cottage',
      'penthouse', 'loft', 'duplex', 'private_room', 'shared_room', 'guesthouse',
      'office', 'shop', 'warehouse', 'restaurant', 'hotel', 'resort', 'hostel',
      'lodge', 'residential_land', 'commercial_land', 'farm_land',
    ];
    const normalized = raw.toLowerCase().replace(/[\s-]+/g, '_') as KnownPropertyType;
    return known.includes(normalized) ? normalized : 'other';
  }
}
