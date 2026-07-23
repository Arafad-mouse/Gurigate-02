/**
 * Property Detail Page
 *
 * Detailed property view with gallery, overview, features, and reviews.
 * Uses PropertyGallery, PropertyOverview, PropertyFeatures, PropertyReviewList components.
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PropertyGallery } from '../../frontend/src/components/property/shared/PropertyGallery';
import { PropertyOverview } from '../../frontend/src/components/property/shared/PropertyOverview';
import { PropertyFeatures } from '../../frontend/src/components/property/shared/PropertyFeatures';
import { PropertyReviewList } from '../../frontend/src/components/property/shared/PropertyReviewList';
import { PropertyReviewForm } from '../../frontend/src/components/property/shared/PropertyReviewForm';
import { useProperty } from '../../frontend/src/hooks/useProperty';

export function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { property, loading, error } = useProperty(id);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const handleReviewSubmit = (rating: number, comment: string) => {
    // Implement review submission
    console.log('Submit review:', { rating, comment });
    setShowReviewForm(false);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error.message}</div>;
  }

  if (!property) {
    return <div className="p-8 text-center">Property not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Gallery */}
        <PropertyGallery
          images={property.images.map(img => ({
            id: img.id,
            url: img.imageUrl,
            altText: img.altText || undefined,
          }))}
          title={property.title}
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <PropertyOverview property={property} />
            <PropertyFeatures property={property} />
            
            {/* Reviews Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
              {showReviewForm ? (
                <PropertyReviewForm
                  propertyId={property.id}
                  onSubmit={handleReviewSubmit}
                  onCancel={() => setShowReviewForm(false)}
                />
              ) : (
                <>
                  <PropertyReviewList reviews={property.reviews} />
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="mt-4 px-4 py-2 bg-[#BA0036] text-white rounded-lg hover:bg-[#99002d] transition-colors"
                  >
                    Write a Review
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Book This Property</h3>
              {/* Booking form would go here */}
              <p className="text-gray-600">Booking functionality coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
