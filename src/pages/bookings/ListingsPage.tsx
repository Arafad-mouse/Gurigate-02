import { useEffect, useState } from 'react';
import { Home, MapPin, DollarSign, Users, Star, Plus, Search, Filter, Edit, Trash2 } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  location: string;
  price: number;
  guestCapacity: number;
  rating: number;
  reviewCount: number;
  status: 'active' | 'inactive' | 'pending';
  image?: string;
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: Fetch listings from API
    setLoading(false);
  }, []);

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BA0036]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Listings</h1>
        <p className="text-gray-600 mt-1">Manage your property listings</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search listings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BA0036] focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-5 w-5" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#BA0036] text-white rounded-lg hover:bg-[#a4003a] transition-colors">
            <Plus className="h-5 w-5" />
            Add Listing
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((listing) => (
          <div key={listing.id} className="bg-white rounded-lg shadow overflow-hidden">
            {listing.image ? (
              <img src={listing.image} alt={listing.title} className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <Home className="h-12 w-12 text-gray-400" />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  listing.status === 'active' ? 'bg-green-100 text-green-800' :
                  listing.status === 'inactive' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {listing.location}
              </div>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <DollarSign className="h-4 w-4 mr-1" />
                ${listing.price}/night
              </div>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Users className="h-4 w-4 mr-1" />
                {listing.guestCapacity} guests
              </div>
              <div className="flex items-center text-sm text-gray-600 mb-4">
                <Star className="h-4 w-4 mr-1 text-yellow-500 fill-yellow-500" />
                {listing.rating} ({listing.reviewCount} reviews)
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
                <button className="flex-1 flex items-center justify-center px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredListings.length === 0 && !loading && (
          <div className="col-span-full text-center py-12">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No listings found</p>
          </div>
        )}
      </div>
    </div>
  );
}
