import { useEffect, useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, CheckCircle } from 'lucide-react';

interface CheckIn {
  id: string;
  guestName: string;
  propertyTitle: string;
  checkInTime: string;
  guestCount: number;
  contactPhone: string;
  contactEmail: string;
  status: 'pending' | 'completed';
}

export default function TodayCheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch today's check-ins from API
    setLoading(false);
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900">Today's Check-ins</h1>
        <p className="text-gray-600 mt-1">Manage guest arrivals for today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {checkIns.map((checkIn) => (
          <div key={checkIn.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{checkIn.guestName}</h3>
                <p className="text-sm text-gray-600">{checkIn.propertyTitle}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                checkIn.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {checkIn.status.charAt(0).toUpperCase() + checkIn.status.slice(1)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {new Date(checkIn.checkInTime).toLocaleTimeString()}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                {checkIn.guestCount} guests
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {checkIn.contactPhone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                {checkIn.contactEmail}
              </div>
            </div>

            {checkIn.status === 'pending' && (
              <button className="w-full mt-4 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Check-in
              </button>
            )}
          </div>
        ))}

        {checkIns.length === 0 && !loading && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No check-ins scheduled for today</p>
          </div>
        )}
      </div>
    </div>
  );
}
