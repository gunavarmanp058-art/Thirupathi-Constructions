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
  message: string;
  timestamp: string;
}

const ClientChat = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = Number(user?.id ?? 0);
  const role = user?.role;

  console.log('ClientChat user data:', user, 'userId:', userId, 'role:', role);

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

  useEffect(() => {
    if (!userId) {
      console.log('No userId found, user not logged in');
      return;
    }

    const newSocket = io("http://localhost:5001");
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.emit("join-chat", userId, role);
    console.log('Emitting join-chat:', userId, role);

    newSocket.on("receive-message", (message: Message) => {
      console.log('Received message:', message);
      setMessages((prev) => [...prev, message]);

      // Play notification sound
      playNotificationSound();

      // Show toast notification
      toast({
        title: "New Message",
        description: `Admin: ${message.message.length > 50 ? message.message.substring(0, 50) + '...' : message.message}`,
      });

      // Show browser notification if document is not visible
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('New Message from Admin', {
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
    const fetchHistory = async () => {
      try {
        const response = await api.get('/client/messages');
        const sorted = (response.data.data || []).sort(
          (a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setMessages(sorted);
      } catch (err) {
        console.error('Failed to fetch chat history', err);
      }
    };

    fetchHistory();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const trimmedMessage = newMessage.trim();
    if (trimmedMessage && socket && socket.connected) {
      console.log('Sending message:', trimmedMessage, 'socket connected:', socket.connected);
      socket.emit("send-message", { message: trimmedMessage });

      // Immediately render the sent message locally so the user sees it right away.
      setMessages((prev) => [
        ...prev,
        {
          senderId: userId,
          message: trimmedMessage,
          timestamp: new Date().toISOString(),
        },
      ]);

      setNewMessage("");
    } else {
      console.log('Cannot send message - socket:', !!socket, 'connected:', socket?.connected, 'message:', newMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle>Chat with Admin {isConnected ? '🟢' : '🔴'}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((msg, index) => {
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
                          <span>{msg.senderId === userId ? 'You' : 'Admin'}</span>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientChat;