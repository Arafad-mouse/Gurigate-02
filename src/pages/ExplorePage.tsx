import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, MapPin, ChevronDown } from 'lucide-react';
import { ListingCard } from '@/components/marketplace/ListingCard';
import { searchListings, getAvailableCities } from '@/services/listingService';
import type { ListingCard as ListingCardType, ListingSearchFilters } from '@/types/listing';

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<ListingCardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [cities, setCities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || 'all');
  const [listingType, setListingType] = useState(searchParams.get('type') || 'all');
  const [propertyCategory, setPropertyCategory] = useState(searchParams.get('category') || 'all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minBedrooms, setMinBedrooms] = useState('');
  const [minGuests, setMinGuests] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_low' | 'price_high' | 'rating' | 'newest' | 'popular'>('relevance');

  const filters: ListingSearchFilters = useMemo(
    () => ({
      query: query || undefined,
      city: selectedCity !== 'all' ? selectedCity : undefined,
      listingType: listingType !== 'all' ? (listingType as ListingSearchFilters['listingType']) : undefined,
      propertyCategory: propertyCategory !== 'all' ? (propertyCategory as ListingSearchFilters['propertyCategory']) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minBedrooms: minBedrooms ? Number(minBedrooms) : undefined,
      minGuests: minGuests ? Number(minGuests) : undefined,
      sortBy,
      page,
      pageSize: 24,
    }),
    [query, selectedCity, listingType, propertyCategory, minPrice, maxPrice, minBedrooms, minGuests, sortBy, page]
  );

  const fetchListings = useCallback(async () => {
    setLoading(true);
    const result = await searchListings(filters);
    if (page === 1) {
      setListings(result.listings);
    } else {
      setListings((prev) => [...prev, ...result.listings]);
    }
    setTotal(result.total);
    setHasMore(result.hasMore);
    setLoading(false);
  }, [filters, page]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    getAvailableCities().then(setCities);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, selectedCity, listingType, propertyCategory, minPrice, maxPrice, minBedrooms, minGuests, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const params: Record<string, string> = {};
    if (query) params.q = query;
    if (selectedCity !== 'all') params.city = selectedCity;
    if (listingType !== 'all') params.type = listingType;
    if (propertyCategory !== 'all') params.category = propertyCategory;
    setSearchParams(params);
    fetchListings();
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedCity('all');
    setListingType('all');
    setPropertyCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setMinBedrooms('');
    setMinGuests('');
    setSortBy('relevance');
    setSearchParams({});
  };

  const hasActiveFilters =
    query || selectedCity !== 'all' || listingType !== 'all' || propertyCategory !== 'all' ||
    minPrice || maxPrice || minBedrooms || minGuests;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="flex items-center gap-3 py-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search destinations, properties..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-[#BA0036] focus:ring-1 focus:ring-[#BA0036] transition-colors"
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-[#BA0036] bg-white cursor-pointer"
            >
              <option value="all">All cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-full border transition-colors ${
                showFilters || hasActiveFilters
                  ? 'border-[#BA0036] text-[#BA0036] bg-[#BA0036]/5'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-full focus:outline-none focus:border-[#BA0036] bg-white cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
            </select>
          </form>

          {showFilters && (
            <div className="pb-4 flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Listing Type</label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#BA0036] bg-white"
                >
                  <option value="all">All types</option>
                  <option value="short_stay">Short Stay</option>
                  <option value="long_rent">Long Term Rental</option>
                  <option value="sale">For Sale</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Category</label>
                <select
                  value={propertyCategory}
                  onChange={(e) => setPropertyCategory(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#BA0036] bg-white"
                >
                  <option value="all">All categories</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="land">Land</option>
                  <option value="hospitality">Hospitality</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Min Price ($)</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#BA0036]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Max Price ($)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Any"
                  className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#BA0036]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Min Beds</label>
                <select
                  value={minBedrooms}
                  onChange={(e) => setMinBedrooms(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#BA0036] bg-white"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500">Min Guests</label>
                <select
                  value={minGuests}
                  onChange={(e) => setMinGuests(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#BA0036] bg-white"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="4">4+</option>
                  <option value="6">6+</option>
                </select>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-[#BA0036] transition-colors"
                >
                  <X className="h-4 w-4" /> Clear all
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {loading ? 'Searching...' : `${total} ${total === 1 ? 'home' : 'homes'} available`}
          </p>
        </div>

        {loading && page === 1 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 rounded-2xl" />
                <div className="pt-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No homes found</h3>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 text-sm font-medium text-[#BA0036] border border-[#BA0036] rounded-full hover:bg-[#BA0036]/5 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                  className="px-6 py-3 text-sm font-semibold text-white bg-[#BA0036] rounded-full hover:bg-[#9a0028] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load more homes'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
