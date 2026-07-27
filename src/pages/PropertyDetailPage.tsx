/**
 * Property Detail Page
 *
 * Detailed property view with gallery, overview, features, and reviews.
 * Uses PropertyGallery, PropertyOverview, PropertyFeatures, PropertyReviewList components.
 */

import { useState } from 'react';
import { useParams } from 'react-router-dom';
// TODO: Restore these imports when frontend components are available
// import { PropertyGallery } from '../../frontend/src/components/property/shared/PropertyGallery';
// import { PropertyOverview } from '../../frontend/src/components/property/shared/PropertyOverview';
// import { PropertyFeatures } from '../../frontend/src/components/property/shared/PropertyFeatures';
// import { PropertyReviewList } from '../../frontend/src/components/property/shared/PropertyReviewList';
// import { PropertyReviewForm } from '../../frontend/src/components/property/shared/PropertyReviewForm';
// import { useProperty } from '../../frontend/src/hooks/useProperty';

export function PropertyDetailPage() {
  const { id } = useParams();
  return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Details</h1>
      <p className="text-gray-600">Property ID: {id}</p>
      <p className="text-gray-600">Property detail page is under construction</p>
    </div>
  );
}
