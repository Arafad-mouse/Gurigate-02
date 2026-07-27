import { useEffect, useState } from 'react';
import { Star, Search, Filter, RefreshCw, MessageSquare } from 'lucide-react';
import { BookingOperationsService, type BookingReview } from '@/services/bookingOperationsService';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<BookingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await BookingOperationsService.getBookingReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    try {
      await BookingOperationsService.replyToReview(reviewId, replyText.trim());
      setNotification({ type: 'success', message: 'Reply posted successfully' });
      setReplyingTo(null);
      setReplyText('');
      loadReviews();
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to post reply' });
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === 'all' || review.rating === ratingFilter;
    return matchesSearch && matchesRating;
  });

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
  const pendingReplies = reviews.filter(r => !r.host_reply).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BA0036]" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {notification && (
        <div className={`mb-4 rounded-lg p-4 flex items-center ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          <span className="flex-1">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-current opacity-60 hover:opacity-100">×</button>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-1">Manage guest reviews and respond to feedback</p>
        </div>
        <button
          onClick={() => { setRefreshing(true); loadReviews(); }}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Average Rating</div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-yellow-400">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{avgRating}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Reviews</div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-500">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{reviews.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Replies</div>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-500">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{pendingReplies}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by guest name or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BA0036] focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={ratingFilter === 'all' ? 'all' : ratingFilter.toString()}
              onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#BA0036]"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => (
          <div key={review.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#BA0036] flex items-center justify-center text-white font-semibold">
                  {review.guest_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{review.guest_name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-gray-700 text-sm mb-4">{review.comment}</p>

            {review.host_reply ? (
              <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#BA0036]">
                <p className="text-xs font-semibold text-gray-500 mb-1">Host Reply</p>
                <p className="text-sm text-gray-700">{review.host_reply}</p>
              </div>
            ) : replyingTo === review.id ? (
              <div className="bg-gray-50 rounded-lg p-4">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BA0036] focus:border-transparent text-sm mb-2"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReply(review.id)}
                    disabled={!replyText.trim()}
                    className="px-4 py-2 bg-[#BA0036] text-white rounded-lg text-sm font-medium hover:bg-[#a4003a] transition-colors disabled:opacity-50"
                  >
                    Post Reply
                  </button>
                  <button
                    onClick={() => { setReplyingTo(null); setReplyText(''); }}
                    className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setReplyingTo(review.id); setReplyText(''); }}
                className="text-sm font-medium text-[#BA0036] hover:text-[#a4003a]"
              >
                Reply to review
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredReviews.length === 0 && !loading && (
        <div className="text-center py-16">
          <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No reviews found</p>
        </div>
      )}
    </div>
  );
}
