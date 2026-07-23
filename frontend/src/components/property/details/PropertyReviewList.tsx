/**
 * PropertyReviewList
 *
 * Displays property reviews.
 * Uses usePropertyReviews() hook.
 * Shows recent reviews with ratings and comments.
 */

import { Star, User } from 'lucide-react';
import type { PropertyDetailViewModel } from '../../../view-models/property/PropertyDetailViewModel';

interface PropertyReviewListProps {
  viewModel: PropertyDetailViewModel;
  showAll?: boolean;
  maxReviews?: number;
}

export function PropertyReviewList({ viewModel, showAll = false, maxReviews = 3 }: PropertyReviewListProps) {
  const { recentReviews, rating, reviewCount } = viewModel;

  const reviewsToShow = showAll ? recentReviews : recentReviews.slice(0, maxReviews);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (reviewCount === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-1">No Reviews Yet</h3>
        <p className="text-sm text-gray-500">Be the first to review this property.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Reviews</h3>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-lg font-semibold text-gray-900">{rating.toFixed(1)}</span>
          <span className="text-gray-500">({reviewCount} reviews)</span>
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {reviewsToShow.map((review) => (
          <div key={review.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{review.guestName}</div>
                  <div className="text-sm text-gray-500">{review.createdAt}</div>
                </div>
              </div>
              {renderStars(review.rating)}
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        ))}
      </div>

      {!showAll && recentReviews.length > maxReviews && (
        <button className="text-blue-600 hover:text-blue-700 font-medium">
          View all {reviewCount} reviews
        </button>
      )}
    </div>
  );
}
