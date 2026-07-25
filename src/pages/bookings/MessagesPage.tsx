import { useEffect, useState } from 'react';
import { MessageSquare, Search, Send, MoreVertical } from 'lucide-react';

interface Message {
  id: string;
  senderName: string;
  senderAvatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  bookingId?: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Message | null>(null);

  useEffect(() => {
    // TODO: Fetch messages from API
    setLoading(false);
  }, []);

  const filteredMessages = messages.filter(msg =>
    msg.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Communicate with guests and hosts</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BA0036] focus:border-transparent"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              onClick={() => setSelectedConversation(message)}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-[#BA0036] flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {message.senderAvatar || message.senderName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{message.senderName}</h3>
                    <span className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{message.lastMessage}</p>
                  {message.bookingId && (
                    <p className="text-xs text-gray-400 mt-1">Booking: {message.bookingId}</p>
                  )}
                </div>
                {message.unreadCount > 0 && (
                  <div className="bg-[#BA0036] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                    {message.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredMessages.length === 0 && !loading && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No messages found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
