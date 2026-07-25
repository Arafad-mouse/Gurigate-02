import { useEffect, useState } from 'react';
import { Star, Search, Filter, TrendingUp, TrendingDown } from 'lucide-react';

interface Review {
  id: string;
  guestName: string;
  propertyTitle: string;
  rating: number;
  comment: string;
  date: string;
  response?: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: Fetch reviews from API
    setLoading(false);
  }, []);

  const filteredReviews = reviews.filter(review =>
    review.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

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
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-gray-600 mt-1">Manage guest reviews and ratings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{reviews.length}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{averageRating.toFixed(1)}</p>
            </div>
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-500" />
              <TrendingUp className="h-5 w-5 text-green-500 ml-2" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Responses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {reviews.filter(r => !r.response).length}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BA0036] focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-5 w-5" />
            Filter
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{review.guestName}</h3>
                <p className="text-sm text-gray-600">{review.propertyTitle}</p>
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-gray-700 mb-4">{review.comment}</p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</p>
              {!review.response && (
                <button className="text-[#BA0036] hover:text-[#a4003a] text-sm font-medium">
                  Respond
                </button>
              )}
            </div>
            {review.response && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Your response:</span> {review.response}
                </p>
              </div>
            )}
          </div>
        ))}

        {filteredReviews.length === 0 && !loading && (
          <div className="text-center py-12">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No reviews found</p>
          </div>
        )}
      </div>
    </div>
  );
}
