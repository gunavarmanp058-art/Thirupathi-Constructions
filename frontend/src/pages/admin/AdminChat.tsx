import { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import api from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

interface Message {
  senderId: number;
  receiverId?: number | null;
  message: string;
  timestamp: string;
}

const AdminChat = () => {
  const { toast } = useToast();
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [messages, setMessages] = useState<Message[]>([]); // Current conversation
  const [newMessage, setNewMessage] = useState("");
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const selectedClientRef = useRef<number | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user.id;
  const role = user.role;

  console.log('AdminChat user data:', user, 'userId:', userId, 'role:', role);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (err) {
      console.log('Sound play failed:', err);
    }
  };

  const formatDay = (timestamp: string) =>
    new Date(timestamp).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

  const isSameDay = (a: string, b: string) => {
    const da = new Date(a);
    const db = new Date(b);
    return da.toDateString() === db.toDateString();
  };

  useEffect(() => {
    if (!userId) {
      console.log('Admin: No userId found, user not logged in');
      return;
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin.replace(':5173', ':5001');
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Admin connected to server:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Admin disconnected from server');
      setIsConnected(false);
    });

    newSocket.emit("join-admin");
    newSocket.emit("join-chat", userId, role);
    console.log('Admin emitting join-chat:', userId, role);

    newSocket.on("receive-message", (message: Message) => {
      console.log('Admin received message:', message);
      setRecentMessages((prev) => [message, ...prev]);

      if (selectedClientRef.current === message.senderId) {
        setMessages((prev) => [...prev, message]);
      }

      // Play notification sound
      playNotificationSound();

      // Show toast notification
      toast({
        title: "New Message",
        description: `Client ${message.senderId}: ${message.message.length > 50 ? message.message.substring(0, 50) + '...' : message.message}`,
      });

      // Show browser notification if document is not visible
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(`New Message from Client ${message.senderId}`, {
          body: message.message.length > 50 ? message.message.substring(0, 50) + '...' : message.message,
          icon: '/favicon.ico',
          tag: 'chat-message'
        });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId, role]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await api.get('/admin/messages');
        const sorted = (response.data.data || []).sort(
          (a: Message, b: Message) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setRecentMessages(sorted);
      } catch (err) {
        console.error('Failed to fetch recent messages', err);
      }
    };

    fetchRecent();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    selectedClientRef.current = selectedClient;
    if (!selectedClient) return;

    const fetchConversation = async () => {
      try {
        const response = await api.get(`/admin/messages?clientId=${selectedClient}`);
        const sorted = (response.data.data || []).sort(
          (a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setMessages(sorted);
      } catch (err) {
        console.error('Failed to fetch conversation', err);
      }
    };

    fetchConversation();
  }, [selectedClient]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const trimmedMessage = newMessage.trim();
    if (trimmedMessage && socket && socket.connected && selectedClient) {
      console.log('Admin sending message:', trimmedMessage, 'to client:', selectedClient, 'socket connected:', socket.connected);
      const outgoing = {
        senderId: userId,
        message: trimmedMessage,
        timestamp: new Date().toISOString(),
      };

      socket.emit("send-message", { message: trimmedMessage, receiverId: selectedClient });
      setMessages((prev) => [...prev, outgoing]);
      setRecentMessages((prev) => [outgoing, ...prev]);
      setNewMessage("");
    } else {
      console.log('Admin cannot send message - socket:', !!socket, 'connected:', socket?.connected, 'selectedClient:', selectedClient, 'message:', newMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // Get unique clients from recent messages
  const clients = Array.from(
    new Set(
      recentMessages.flatMap((m) => {
        if (m.senderId === userId) {
          return m.receiverId ? [m.receiverId] : [];
        }
        return [m.senderId];
      })
    )
  );

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {clients.length > 0 ? clients.map(clientId => (
                <Button
                  key={clientId}
                  variant={selectedClient === clientId ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedClient(clientId)}
                >
                  Client {clientId}
                </Button>
              )) : (
                <p className="text-sm text-muted-foreground">No active conversations</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-3 h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>
              {selectedClient ? `Chat with Client ${selectedClient}` : "Select a client to chat"} {isConnected ? '🟢' : '🔴'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {!selectedClient && (
                  <p className="text-center text-muted-foreground py-8">
                    Select a client to view the chat history.
                  </p>
                )}

                {selectedClient && messages.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No conversation yet. Start by sending a message.
                  </p>
                )}

                {selectedClient && messages.map((msg, index) => {
                  const prev = messages[index - 1];
                  const shouldShowDate = !prev || !isSameDay(prev.timestamp, msg.timestamp);

                  return (
                    <div key={index}>
                      {shouldShowDate && (
                        <div className="flex justify-center">
                          <span className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-muted/30">
                            {formatDay(msg.timestamp)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex ${
                          msg.senderId === userId ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.senderId === userId
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <div className="flex items-center justify-between text-xs opacity-70 mt-1">
                            <span>{msg.senderId === userId ? 'You' : `Client ${msg.senderId}`}</span>
                            <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            {selectedClient && (
              <div className="flex gap-2 mt-4">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminChat;