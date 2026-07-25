import { useEffect, useState } from 'react';
import { DollarSign, CreditCard, Search, Filter, Download } from 'lucide-react';

interface Payment {
  id: string;
  bookingId: string;
  guestName: string;
  propertyTitle: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentDate: string;
  paymentMethod: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: Fetch payments from API
    setLoading(false);
  }, []);

  const filteredPayments = payments.filter(payment =>
    payment.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.propertyTitle.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-1">Manage all payment transactions</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BA0036] focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-5 w-5" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-5 w-5" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.guestName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.propertyTitle}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  {payment.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  {payment.paymentMethod}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                    payment.status === 'refunded' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPayments.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No payments found</p>
          </div>
        )}
      </div>
    </div>
  );
}
