import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Send, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  user_id: string;
  content: string;
  inserted_at: string;
  user_email?: string;
}

const ChatRoom = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    fetchMessages();
    const cleanupSubscription = setupRealtimeSubscription();
    
    return () => {
      cleanupSubscription();
    };
  }, [user, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      console.log("Fetching messages...");
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('inserted_at', { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        throw error;
      }

      console.log("Messages fetched:", data);
      
      // Get all unique user IDs from messages
      const userIds = [...new Set(data?.map(msg => msg.user_id) || [])];
      const userEmailMap: Record<string, string> = {};
      
      // For each user ID, get their email from auth.users if possible
      // In a real app, you'd have a profiles table with this info
      for (const userId of userIds) {
        if (userId === user.id) {
          userEmailMap[userId] = user.email || 'You';
          continue;
        }
        
        // Try to get user info from a profiles table if you have one
        // For now, just use the user ID as a fallback
        userEmailMap[userId] = `User ${userId.substring(0, 6)}`;
      }
      
      const messagesWithEmail = data?.map(msg => ({
        ...msg,
        user_email: userEmailMap[msg.user_id] || 'Unknown User'
      })) || [];

      setMessages(messagesWithEmail);
    } catch (error: any) {
      console.error("Error in fetchMessages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    console.log("Setting up realtime subscription...");
    const channel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log("New message received:", payload);
          const newMessage = payload.new as Message;
          
          // Add user email for display
          const userEmail = newMessage.user_id === user?.id 
            ? user.email 
            : `User ${newMessage.user_id.substring(0, 6)}`;
          
          setMessages(prev => [...prev, {
            ...newMessage,
            user_email: userEmail || 'Unknown User'
          }]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log("Message deleted:", payload);
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      console.log("Removing channel...");
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      console.log("Sending message:", newMessage.trim());
      const { data, error } = await supabase
        .from('messages')
        .insert([
          {
            content: newMessage.trim(),
            user_id: user.id,
          },
        ])
        .select();

      if (error) {
        console.error("Error sending message:", error);
        throw error;
      }
      
      console.log("Message sent:", data);
      setNewMessage('');
    } catch (error: any) {
      console.error("Error in sendMessage:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      console.log("Deleting message:", messageId);
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error("Error deleting message:", error);
        throw error;
      }
      
      console.log("Message deleted successfully");
    } catch (error: any) {
      console.error("Error in deleteMessage:", error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Chat Room</h1>
          <p className="text-sm text-gray-500">Welcome, {user?.email}</p>
        </div>
        <Button
          onClick={handleSignOut}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.user_id === user?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className={`text-xs mb-1 ${
                      message.user_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.user_email}
                    </p>
                    <p className="text-sm break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.user_id === user?.id ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {new Date(message.inserted_at).toLocaleTimeString()}
                    </p>
                  </div>
                  {message.user_id === user?.id && (
                    <button
                      onClick={() => deleteMessage(message.id)}
                      className="opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
            disabled={sending}
          />
          <Button type="submit" disabled={!newMessage.trim() || sending}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatRoom;
