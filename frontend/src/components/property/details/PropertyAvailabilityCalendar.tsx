/**
 * PropertyAvailabilityCalendar
 *
 * Displays property availability calendar.
 * Consumes PropertyAvailability from PropertyDetailViewModel.
 * Needed for Short Stay and Bookings.
 * Supports future booking module.
 */

import { Calendar, X, Check } from 'lucide-react';
import type { PropertyDetailViewModel } from '../../../view-models/property/PropertyDetailViewModel';

interface PropertyAvailabilityCalendarProps {
  viewModel: PropertyDetailViewModel;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

export function PropertyAvailabilityCalendar({
  viewModel,
  onDateSelect,
  selectedDate,
}: PropertyAvailabilityCalendarProps) {
  const { availability } = viewModel;

  const getBlockTypeColor = (blockType: string) => {
    switch (blockType) {
      case 'manual':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'seasonal':
        return 'bg-yellow-100 text-yellow-800';
      case 'owner_use':
        return 'bg-purple-100 text-purple-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (availability.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 mb-1">No Availability Blocks</h3>
        <p className="text-sm text-gray-500">This property has no blocked dates set.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Availability Calendar</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{availability.length} blocked periods</span>
        </div>
      </div>

      <div className="space-y-3">
        {availability.map((block) => (
          <div
            key={block.id}
            className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex-shrink-0">
              <X className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-1 text-xs font-medium rounded ${getBlockTypeColor(block.blockType)}`}>
                  {block.blockType}
                </span>
                <span className="text-sm text-gray-600">
                  {block.startDate} - {block.endDate}
                </span>
              </div>
              {block.reason && (
                <p className="text-sm text-gray-600">{block.reason}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <Check className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Availability Status</h4>
            <p className="text-sm text-blue-700">
              Dates not shown in the blocked periods are available for booking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
