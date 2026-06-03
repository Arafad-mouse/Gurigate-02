/**
 * BookingStatusTimeline
 *
 * Visual timeline component showing booking lifecycle stages.
 * Displays: Pending → Confirmed → Ongoing → Completed/Cancelled
 */

import { Check, Clock, X, Calendar } from 'lucide-react';

export interface TimelineStep {
  status: string;
  label: string;
  date: string | null;
  isCompleted: boolean;
  isCurrent: boolean;
  isPending: boolean;
}

interface BookingStatusTimelineProps {
  timeline: TimelineStep[];
  compact?: boolean;
}

export function BookingStatusTimeline({ timeline, compact = false }: BookingStatusTimelineProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStepIcon = (step: TimelineStep) => {
    if (step.isCompleted) {
      return <Check className="h-4 w-4" />;
    }
    if (step.isCurrent) {
      return <Clock className="h-4 w-4 animate-pulse" />;
    }
    if (step.status === 'cancelled') {
      return <X className="h-4 w-4" />;
    }
    return <Calendar className="h-4 w-4" />;
  };

  const getStepColor = (step: TimelineStep) => {
    if (step.status === 'cancelled') {
      return step.isCompleted ? 'bg-red-500' : 'bg-red-200';
    }
    if (step.isCompleted) {
      return 'bg-green-500';
    }
    if (step.isCurrent) {
      return 'bg-blue-500';
    }
    return 'bg-gray-200';
  };

  const getLineColor = (step: TimelineStep, nextStep?: TimelineStep) => {
    if (step.status === 'cancelled' || nextStep?.status === 'cancelled') {
      return 'bg-red-200';
    }
    if (step.isCompleted) {
      return 'bg-green-500';
    }
    return 'bg-gray-200';
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {timeline.map((step, index) => (
          <div key={step.status} className="flex items-center">
            <div
              className={`flex items-center justify-center w-6 h-6 rounded-full ${getStepColor(step)} text-white`}
              title={step.label}
            >
              {getStepIcon(step)}
            </div>
            {index < timeline.length - 1 && (
              <div
                className={`w-8 h-0.5 ${getLineColor(step, timeline[index + 1])}`}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-start justify-between">
        {timeline.map((step, index) => (
          <div key={step.status} className="flex-1 flex flex-col items-center">
            {/* Step Circle */}
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${getStepColor(step)} text-white mb-2 relative z-10`}
            >
              {getStepIcon(step)}
            </div>

            {/* Step Label */}
            <div className="text-center">
              <p className={`text-sm font-medium ${
                step.isCurrent ? 'text-blue-600' : 
                step.isCompleted ? 'text-gray-900' : 
                'text-gray-500'
              }`}>
                {step.label}
              </p>
              {step.date && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(step.date)}
                </p>
              )}
            </div>

            {/* Connecting Line */}
            {index < timeline.length - 1 && (
              <div
                className={`absolute top-5 left-1/2 w-full h-0.5 -translate-x-1/2 ${getLineColor(step, timeline[index + 1])}`}
                style={{ left: `${((index + 1) / timeline.length) * 50}%`, width: `${100 / timeline.length}%` }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
