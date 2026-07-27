import { useEffect, useState, useContext, useRef } from 'react';
import { MessageSquare, Search, Send, ArrowLeft, RefreshCw } from 'lucide-react';
import { BookingOperationsService, type BookingMessage } from '@/services/bookingOperationsService';
import { AuthContext } from '@/lib/auth-context';

interface Conversation {
  id: string;
  booking_id: string;
  participant_name: string;
  participant_id: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  property_title?: string;
}

export default function MessagesPage() {
  const authContext = useContext(AuthContext);
  const userId = authContext?.session?.user.id;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<BookingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, [userId]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.booking_id);
    }
  }, [selectedConversation?.booking_id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await BookingOperationsService.getConversations(userId);
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMessages = async (bookingId: string) => {
    try {
      const data = await BookingOperationsService.getBookingMessages(bookingId);
      setMessages(data);
      if (userId) {
        await BookingOperationsService.markMessagesAsRead(bookingId, userId);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSend = async () => {
    if (!replyText.trim() || !selectedConversation || !userId) return;
    try {
      setSending(true);
      await BookingOperationsService.sendMessage(
        selectedConversation.booking_id,
        userId,
        selectedConversation.participant_id,
        replyText.trim()
      );
      setReplyText('');
      await loadMessages(selectedConversation.booking_id);
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.last_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.property_title?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-1">Communicate with guests and hosts</p>
        </div>
        <button
          onClick={() => { setRefreshing(true); loadConversations(); }}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className={`border-r border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex w-80' : 'w-full md:w-80'}`}>
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BA0036] focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.booking_id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${selectedConversation?.booking_id === conv.booking_id ? 'bg-gray-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#BA0036] flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {conv.participant_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">{conv.participant_name}</h3>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {conv.last_message_at ? new Date(conv.last_message_at).toLocaleDateString() : ''}
                        </span>
                      </div>
                      {conv.property_title && (
                        <p className="text-xs text-gray-500 mb-1 truncate">{conv.property_title}</p>
                      )}
                      <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <div className="bg-[#BA0036] text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center flex-shrink-0">
                        {conv.unread_count}
                      </div>
                    )}
                  </div>
                </button>
              ))}
              {filteredConversations.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No messages found</p>
                </div>
              )}
            </div>
          </div>

          {/* Message Thread */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Thread Header */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-[#BA0036] flex items-center justify-center text-white font-semibold">
                  {selectedConversation.participant_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedConversation.participant_name}</h3>
                  {selectedConversation.property_title && (
                    <p className="text-xs text-gray-500">{selectedConversation.property_title}</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg) => {
                  const isOwn = msg.sender_id === userId;
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isOwn ? 'bg-[#BA0036] text-white' : 'bg-white border border-gray-200 text-gray-900'
                      }`}>
                        <p className="text-sm">{msg.message}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                          {new Date(msg.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No messages in this conversation</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Reply Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BA0036] focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!replyText.trim() || sending}
                    className="flex items-center justify-center w-10 h-10 bg-[#BA0036] text-white rounded-lg hover:bg-[#a4003a] transition-colors disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a conversation to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
