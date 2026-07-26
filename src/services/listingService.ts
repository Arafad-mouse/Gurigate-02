import { supabase } from '@/lib/supabase';
import type {
  ListingCard,
  ListingDetail,
  ListingSearchFilters,
  ListingSearchResult,
  AvailabilityCheckResult,
  PricingCalculation,
  CreateBookingInput,
  BookingResult,
  WishlistItem,
  ListingReview,
  CurrencyCode,
  ListingType,
  PropertyCategory,
} from '@/types/listing';

// ============================================================
// HOMES MARKETPLACE — LISTING SERVICE
//
// All marketplace queries go through this service.
// Uses the `homes_listings` view for search and joins
// related tables for full detail pages.
// ============================================================

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80';

// ─── Helpers ────────────────────────────────────────────────

function mapRowToCard(row: Record<string, unknown>, isWishlisted = false): ListingCard {
  return {
    id: row.id as string,
    title: row.title as string,
    type: row.type as string,
    propertyCategory: (row.property_category as PropertyCategory) || 'residential',
    listingType: (row.listing_type as ListingType) || 'short_stay',
    isFeatured: (row.is_featured as boolean) || false,
    rating: Number(row.rating) || 0,
    reviewCount: Number(row.review_count) || 0,
    maxGuests: Number(row.max_guests) || 1,
    bedrooms: Number(row.bedrooms) || 0,
    beds: Number(row.beds) || 1,
    bathrooms: Number(row.bathrooms) || 0,
    city: (row.city as string) || '',
    district: row.district as string | undefined,
    country: (row.country as string) || 'Somalia',
    basePrice: Number(row.base_price) || 0,
    currency: (row.currency as CurrencyCode) || 'USD',
    pricingType: (row.pricing_type as ListingCard['pricingType']) || 'nightly',
    primaryImageUrl: (row.primary_image_url as string) || FALLBACK_IMAGE,
    imageCount: Number(row.image_count) || 0,
    latitude: row.latitude ? Number(row.latitude) : undefined,
    longitude: row.longitude ? Number(row.longitude) : undefined,
    wishlistCount: Number(row.wishlist_count) || 0,
    isWishlisted,
  };
}

// ─── Search Listings ────────────────────────────────────────

export async function searchListings(
  filters: ListingSearchFilters = {}
): Promise<ListingSearchResult> {
  const {
    query,
    city,
    country,
    propertyCategory,
    listingType,
    minPrice,
    maxPrice,
    minBedrooms,
    minGuests,
    amenities,
    sortBy = 'relevance',
    page = 1,
    pageSize = 24,
  } = filters;

  let dbQuery = supabase
    .from('homes_listings')
    .select('*', { count: 'exact' });

  // Text search
  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }

  // Location filters
  if (city && city !== 'all') {
    dbQuery = dbQuery.eq('city', city);
  }
  if (country && country !== 'all') {
    dbQuery = dbQuery.eq('country', country);
  }

  // Category & listing type
  if (propertyCategory && propertyCategory !== 'all') {
    dbQuery = dbQuery.eq('property_category', propertyCategory);
  }
  if (listingType && listingType !== 'all') {
    dbQuery = dbQuery.eq('listing_type', listingType);
  }

  // Price range
  if (minPrice !== undefined) {
    dbQuery = dbQuery.gte('base_price', minPrice);
  }
  if (maxPrice !== undefined) {
    dbQuery = dbQuery.lte('base_price', maxPrice);
  }

  // Capacity
  if (minBedrooms !== undefined) {
    dbQuery = dbQuery.gte('bedrooms', minBedrooms);
  }
  if (minGuests !== undefined) {
    dbQuery = dbQuery.gte('max_guests', minGuests);
  }

  // Amenities (stored as TEXT[] in property_features, accessed via view)
  if (amenities && amenities.length > 0) {
    dbQuery = dbQuery.contains('amenities', amenities);
  }

  // Sorting
  switch (sortBy) {
    case 'price_low':
      dbQuery = dbQuery.order('base_price', { ascending: true });
      break;
    case 'price_high':
      dbQuery = dbQuery.order('base_price', { ascending: false });
      break;
    case 'rating':
      dbQuery = dbQuery.order('rating', { ascending: false });
      break;
    case 'newest':
      dbQuery = dbQuery.order('created_at', { ascending: false });
      break;
    case 'popular':
      dbQuery = dbQuery.order('wishlist_count', { ascending: false });
      break;
    default:
      dbQuery = dbQuery.order('is_featured', { ascending: false }).order('rating', { ascending: false });
  }

  // Pagination
  const start = (page - 1) * pageSize;
  dbQuery = dbQuery.range(start, start + pageSize - 1);

  const { data, error, count } = await dbQuery;

  if (error) {
    console.error('listingService.searchListings error:', error);
    return { listings: [], total: 0, page, pageSize, hasMore: false };
  }

  // Fetch wishlist IDs for current user
  const wishlistIds = await getWishlistIds();

  const listings = (data || []).map((row) =>
    mapRowToCard(row as Record<string, unknown>, wishlistIds.has(row.id as string))
  );

  return {
    listings,
    total: count || 0,
    page,
    pageSize,
    hasMore: (page * pageSize) < (count || 0),
  };
}

// ─── Get Listing Detail ─────────────────────────────────────

export async function getListingDetail(id: string): Promise<ListingDetail | null> {
  // Get base listing from view
  const { data: listingRow, error: listingError } = await supabase
    .from('homes_listings')
    .select('*')
    .eq('id', id)
    .single();

  if (listingError || !listingRow) {
    console.error('listingService.getListingDetail error:', listingError);
    return null;
  }

  const row = listingRow as Record<string, unknown>;

  // Fetch related data in parallel
  const [
    imagesResult,
    reviewsResult,
    availabilityResult,
    pricingOverridesResult,
    cancellationResult,
    hostResult,
    wishlistResult,
  ] = await Promise.all([
    supabase.from('property_images').select('*').eq('property_id', id).order('sort_order', { ascending: true }),
    supabase.from('property_reviews').select('*, guest:profiles!property_reviews_guest_id_fkey(first_name, last_name, avatar_url)').eq('property_id', id).order('created_at', { ascending: false }),
    supabase.from('availability_blocks').select('*').eq('property_id', id).is('deleted_at', null).order('start_date', { ascending: true }),
    supabase.from('listing_pricing_overrides').select('*').eq('property_id', id).order('start_date', { ascending: true }),
    supabase.from('cancellation_policies').select('*').eq('property_id', id).single(),
    supabase.from('profiles').select('id, first_name, last_name, avatar_url').eq('id', row.owner_id as string).single(),
    supabase.from('wishlists').select('id').eq('property_id', id).eq('user_id', (await supabase.auth.getUser()).data.user?.id || ''),
  ]);

  // Increment view count (fire and forget)
  supabase.rpc('increment_view_count', { p_property_id: id }).then(() => {});

  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    type: row.type as string,
    propertyCategory: (row.property_category as PropertyCategory) || 'residential',
    listingType: (row.listing_type as ListingType) || 'short_stay',
    approvalStatus: (row.approval_status as ListingDetail['approvalStatus']) || 'approved',
    status: (row.status as ListingDetail['status']) || 'available',
    isFeatured: (row.is_featured as boolean) || false,
    viewCount: Number(row.view_count) || 0,
    rating: Number(row.rating) || 0,
    reviewCount: Number(row.review_count) || 0,
    maxGuests: Number(row.max_guests) || 1,
    bedrooms: Number(row.bedrooms) || 0,
    beds: Number(row.beds) || 1,
    slug: row.slug as string | undefined,
    ownerId: row.owner_id as string,
    address: {
      street: row.street as string || '',
      city: row.city as string || '',
      district: row.district as string | undefined,
      state: row.state as string | undefined,
      country: row.country as string || 'Somalia',
      latitude: row.latitude ? Number(row.latitude) : undefined,
      longitude: row.longitude ? Number(row.longitude) : undefined,
      showPreciseLocation: true,
    },
    pricing: {
      basePrice: Number(row.base_price) || 0,
      currency: (row.currency as CurrencyCode) || 'USD',
      pricingType: (row.pricing_type as ListingDetail['pricing']['pricingType']) || 'nightly',
      securityDeposit: Number(row.security_deposit) || 0,
      cleaningFee: Number(row.cleaning_fee) || 0,
      serviceFee: Number(row.service_fee) || 0,
    },
    features: {
      bedrooms: Number(row.bedrooms) || 0,
      bathrooms: Number(row.bathrooms) || 0,
      maxGuests: Number(row.max_guests) || 1,
      squareFeet: row.square_feet ? Number(row.square_feet) : null,
      amenities: (row.amenities as string[]) || [],
      rules: (row.rules as string[]) || [],
    },
    images: (imagesResult.data || []).map((img: Record<string, unknown>) => ({
      id: img.id as string,
      imageUrl: img.image_url as string,
      altText: img.alt_text as string | null,
      sortOrder: Number(img.sort_order) || 0,
      isPrimary: (img.is_primary as boolean) || false,
    })),
    host: {
      id: (hostResult.data as Record<string, unknown>)?.id as string || row.owner_id as string,
      firstName: (hostResult.data as Record<string, unknown>)?.first_name as string || 'Host',
      lastName: (hostResult.data as Record<string, unknown>)?.last_name as string || '',
      avatarUrl: (hostResult.data as Record<string, unknown>)?.avatar_url as string | undefined,
    },
    reviews: (reviewsResult.data || []).map((rev: Record<string, unknown>) => {
      const guest = rev.guest as Record<string, unknown>;
      return {
        id: rev.id as string,
        guestId: rev.guest_id as string,
        guestName: guest ? `${guest.first_name || ''} ${guest.last_name || ''}`.trim() : 'Guest',
        guestAvatarUrl: guest?.avatar_url as string | undefined,
        rating: Number(rev.rating) || 0,
        comment: rev.comment as string | null,
        createdAt: rev.created_at as string,
      };
    }),
    availabilityBlocks: (availabilityResult.data || []).map((block: Record<string, unknown>) => ({
      id: block.id as string,
      blockType: block.block_type as ListingDetail['availabilityBlocks'][0]['blockType'],
      startDate: block.start_date as string,
      endDate: block.end_date as string,
      reason: block.reason as string | null,
      minimumStay: block.minimum_stay as number | null,
      maximumStay: block.maximum_stay as number | null,
    })),
    pricingOverrides: (pricingOverridesResult.data || []).map((override: Record<string, unknown>) => ({
      id: override.id as string,
      startDate: override.start_date as string,
      endDate: override.end_date as string,
      priceType: override.price_type as 'fixed' | 'multiplier',
      priceValue: Number(override.price_value) || 0,
      label: override.label as string | null,
      isRecurring: (override.is_recurring as boolean) || false,
      recurringDayOfWeek: override.recurring_day_of_week as number | null,
    })),
    cancellationPolicy: cancellationResult.data
      ? (() => {
          const cp = cancellationResult.data as Record<string, unknown>;
          return {
            id: cp.id as string,
            policyType: cp.policy_type as 'flexible' | 'moderate' | 'strict' | 'super_strict' | 'custom',
            customRules: (cp.custom_rules as Record<string, unknown>[]) || [],
            gracePeriodHours: Number(cp.grace_period_hours) || 48,
          };
        })()
      : null,
    isWishlisted: (wishlistResult.data?.length || 0) > 0,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ─── Check Availability ─────────────────────────────────────

export async function checkAvailability(
  propertyId: string,
  checkIn: string,
  checkOut: string
): Promise<AvailabilityCheckResult> {
  const { data, error } = await supabase.rpc('check_listing_availability', {
    p_property_id: propertyId,
    p_check_in: checkIn,
    p_check_out: checkOut,
  });

  if (error) {
    console.error('listingService.checkAvailability error:', error);
    return { isAvailable: false, reason: 'Unable to check availability', minimumStay: 1, maximumStay: 365 };
  }

  const row = data?.[0];
  return {
    isAvailable: row?.is_available ?? false,
    reason: row?.reason ?? undefined,
    minimumStay: row?.minimum_stay ?? 1,
    maximumStay: row?.maximum_stay ?? 365,
  };
}

// ─── Calculate Pricing ──────────────────────────────────────

export async function calculatePricing(
  propertyId: string,
  checkIn: string,
  checkOut: string,
  guestCount = 1
): Promise<PricingCalculation | null> {
  const { data, error } = await supabase.rpc('calculate_listing_pricing', {
    p_property_id: propertyId,
    p_check_in: checkIn,
    p_check_out: checkOut,
    p_guest_count: guestCount,
  });

  if (error) {
    console.error('listingService.calculatePricing error:', error);
    return null;
  }

  const row = data?.[0];
  if (!row) return null;

  return {
    nights: Number(row.nights) || 0,
    pricePerNight: Number(row.price_per_night) || 0,
    subtotal: Number(row.subtotal) || 0,
    cleaningFee: Number(row.cleaning_fee) || 0,
    serviceFee: Number(row.service_fee) || 0,
    securityDeposit: Number(row.security_deposit) || 0,
    total: Number(row.total) || 0,
    currency: (row.currency as CurrencyCode) || 'USD',
  };
}

// ─── Create Booking ─────────────────────────────────────────

export async function createBooking(input: CreateBookingInput): Promise<BookingResult | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('Authentication required to create a booking');
  }

  // Check availability first
  const availability = await checkAvailability(input.propertyId, input.checkIn, input.checkOut);
  if (!availability.isAvailable) {
    throw new Error(availability.reason || 'Dates are not available');
  }

  // Calculate pricing
  const pricing = await calculatePricing(input.propertyId, input.checkIn, input.checkOut, input.guestCount);
  if (!pricing) {
    throw new Error('Unable to calculate pricing for selected dates');
  }

  // Get host_id from property
  const { data: property } = await supabase
    .from('properties')
    .select('owner_id')
    .eq('id', input.propertyId)
    .single();

  const { data, error } = await supabase
    .from('property_bookings')
    .insert({
      property_id: input.propertyId,
      guest_id: userData.user.id,
      host_id: property?.owner_id || null,
      check_in: input.checkIn,
      check_out: input.checkOut,
      guest_count: input.guestCount,
      special_requests: input.specialRequests || null,
      total_price: pricing.total,
      currency: pricing.currency,
      status: 'pending',
      payment_status: 'pending',
      nights_count: pricing.nights,
      price_per_night: pricing.pricePerNight,
      cleaning_fee: pricing.cleaningFee,
      service_fee: pricing.serviceFee,
    })
    .select()
    .single();

  if (error) {
    console.error('listingService.createBooking error:', error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    status: data.status,
    totalPrice: Number(data.total_price) || 0,
    currency: data.currency,
    checkIn: data.check_in,
    checkOut: data.check_out,
    nightsCount: data.nights_count || pricing.nights,
    pricePerNight: Number(data.price_per_night) || pricing.pricePerNight,
    cleaningFee: Number(data.cleaning_fee) || 0,
    serviceFee: Number(data.service_fee) || 0,
  };
}

// ─── Wishlist Operations ────────────────────────────────────

export async function getWishlistIds(): Promise<Set<string>> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return new Set();

  const { data, error } = await supabase
    .from('wishlists')
    .select('property_id')
    .eq('user_id', userData.user.id);

  if (error || !data) return new Set();

  return new Set(data.map((w: { property_id: string }) => w.property_id));
}

export async function toggleWishlist(propertyId: string): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('Authentication required');
  }

  // Check if already wishlisted
  const { data: existing } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userData.user.id)
    .eq('property_id', propertyId)
    .single();

  if (existing) {
    // Remove from wishlist
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userData.user.id)
      .eq('property_id', propertyId);

    if (error) throw new Error(error.message);
    return false;
  } else {
    // Add to wishlist
    const { error } = await supabase
      .from('wishlists')
      .insert({
        user_id: userData.user.id,
        property_id: propertyId,
      });

    if (error) throw new Error(error.message);
    return true;
  }
}

export async function getWishlist(): Promise<WishlistItem[]> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      id,
      property_id,
      created_at,
      listing:properties!wishlists_property_id_fkey(
        id, title, type, property_category, listing_type, is_featured,
        rating, review_count, max_guests, bedrooms, beds, slug, owner_id,
        published_to_homes, created_at, updated_at
      )
    `)
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('listingService.getWishlist error:', error);
    return [];
  }

  // For each wishlist item, fetch the listing card data from the view
  const propertyIds = data.map((w: Record<string, unknown>) => w.property_id as string);
  if (propertyIds.length === 0) return [];

  const { data: listingRows } = await supabase
    .from('homes_listings')
    .select('*')
    .in('id', propertyIds);

  const listingMap = new Map<string, ListingCard>();
  for (const row of listingRows || []) {
    listingMap.set(row.id, mapRowToCard(row as Record<string, unknown>, true));
  }

  return data
    .filter((w: Record<string, unknown>) => listingMap.has(w.property_id as string))
    .map((w: Record<string, unknown>) => ({
      id: w.id as string,
      propertyId: w.property_id as string,
      listing: listingMap.get(w.property_id as string)!,
      createdAt: w.created_at as string,
    }));
}

// ─── Reviews ────────────────────────────────────────────────

export async function getReviews(propertyId: string): Promise<ListingReview[]> {
  const { data, error } = await supabase
    .from('property_reviews')
    .select('*, guest:profiles!property_reviews_guest_id_fkey(first_name, last_name, avatar_url)')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false });

  if (error || !data) {
    console.error('listingService.getReviews error:', error);
    return [];
  }

  return data.map((rev: Record<string, unknown>) => {
    const guest = rev.guest as Record<string, unknown>;
    return {
      id: rev.id as string,
      guestId: rev.guest_id as string,
      guestName: guest ? `${guest.first_name || ''} ${guest.last_name || ''}`.trim() : 'Guest',
      guestAvatarUrl: guest?.avatar_url as string | undefined,
      rating: Number(rev.rating) || 0,
      comment: rev.comment as string | null,
      createdAt: rev.created_at as string,
    };
  });
}

export async function addReview(
  propertyId: string,
  rating: number,
  comment?: string
): Promise<ListingReview | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    throw new Error('Authentication required to leave a review');
  }

  const { data, error } = await supabase
    .from('property_reviews')
    .insert({
      property_id: propertyId,
      guest_id: userData.user.id,
      rating,
      comment: comment || null,
    })
    .select('*, guest:profiles!property_reviews_guest_id_fkey(first_name, last_name, avatar_url)')
    .single();

  if (error) {
    console.error('listingService.addReview error:', error);
    throw new Error(error.message);
  }

  const rev = data as Record<string, unknown>;
  const guest = rev.guest as Record<string, unknown>;
  return {
    id: rev.id as string,
    guestId: rev.guest_id as string,
    guestName: guest ? `${guest.first_name || ''} ${guest.last_name || ''}`.trim() : 'Guest',
    guestAvatarUrl: guest?.avatar_url as string | undefined,
    rating: Number(rev.rating) || 0,
    comment: rev.comment as string | null,
    createdAt: rev.created_at as string,
  };
}

// ─── Featured Listings ──────────────────────────────────────

export async function getFeaturedListings(limit = 8): Promise<ListingCard[]> {
  const { data, error } = await supabase
    .from('homes_listings')
    .select('*')
    .eq('is_featured', true)
    .order('rating', { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error('listingService.getFeaturedListings error:', error);
    return [];
  }

  const wishlistIds = await getWishlistIds();
  return data.map((row) => mapRowToCard(row as Record<string, unknown>, wishlistIds.has(row.id)));
}

// ─── Listings by City ───────────────────────────────────────

export async function getListingsByCity(city: string, limit = 12): Promise<ListingCard[]> {
  const { data, error } = await supabase
    .from('homes_listings')
    .select('*')
    .eq('city', city)
    .order('rating', { ascending: false })
    .limit(limit);

  if (error || !data) {
    console.error('listingService.getListingsByCity error:', error);
    return [];
  }

  const wishlistIds = await getWishlistIds();
  return data.map((row) => mapRowToCard(row as Record<string, unknown>, wishlistIds.has(row.id)));
}

// ─── Similar Listings ───────────────────────────────────────

export async function getSimilarListings(propertyId: string, limit = 4): Promise<ListingCard[]> {
  // Get the listing's city and type first
  const { data: listing } = await supabase
    .from('homes_listings')
    .select('city, type')
    .eq('id', propertyId)
    .single();

  if (!listing) return [];

  const { data, error } = await supabase
    .from('homes_listings')
    .select('*')
    .eq('city', listing.city)
    .neq('id', propertyId)
    .order('rating', { ascending: false })
    .limit(limit);

  if (error || !data) {
    // Fallback: just get any listings
    const { data: fallback } = await supabase
      .from('homes_listings')
      .select('*')
      .neq('id', propertyId)
      .order('rating', { ascending: false })
      .limit(limit);

    if (!fallback) return [];
    const wishlistIds = await getWishlistIds();
    return fallback.map((row) => mapRowToCard(row as Record<string, unknown>, wishlistIds.has(row.id)));
  }

  const wishlistIds = await getWishlistIds();
  return data.map((row) => mapRowToCard(row as Record<string, unknown>, wishlistIds.has(row.id)));
}

// ─── Available Cities ───────────────────────────────────────

export async function getAvailableCities(): Promise<string[]> {
  const { data, error } = await supabase
    .from('homes_listings')
    .select('city')
    .order('city', { ascending: true });

  if (error || !data) return [];

  const cities = [...new Set(data.map((r: { city: string }) => r.city).filter(Boolean))];
  return cities;
}
