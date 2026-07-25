import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface BookingEvent {
  id: string;
  title: string;
  propertyTitle: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export default function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch calendar events from API
    setLoading(false);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <p className="text-gray-600 mt-1">View and manage booking schedule</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before the first day of the month */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="h-24 bg-gray-50 rounded-lg" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(event => event.date === dateStr);

            return (
              <div key={day} className="h-24 border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-colors">
                <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded mb-1 truncate ${
                      event.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      event.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500">+{dayEvents.length - 2} more</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
