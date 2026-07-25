import { useEffect, useState } from 'react';
import { Calendar, Clock, Users, Search, Filter } from 'lucide-react';

interface Reservation {
  id: string;
  propertyTitle: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  totalAmount: number;
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: Fetch reservations from API
    setLoading(false);
  }, []);

  const filteredReservations = reservations.filter(res =>
    res.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.guestName.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-bold text-gray-900">Reservations</h1>
        <p className="text-gray-600 mt-1">Manage upcoming reservations</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reservations..."
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-in</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-out</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredReservations.map((res) => (
              <tr key={res.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{res.propertyTitle}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{res.guestName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {new Date(res.checkIn).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                  {new Date(res.checkOut).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-400" />
                  {res.guestCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    res.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    res.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {res.status.charAt(0).toUpperCase() + res.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${res.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredReservations.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No reservations found</p>
          </div>
        )}
      </div>
    </div>
  );
}
