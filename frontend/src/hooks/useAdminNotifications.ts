import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export interface EnquiryNotification {
  id: number;
  name: string;
  email: string;
  phone: string;
  organization: string | null;
  enquiry_type: string;
  message: string;
  created_at: string;
  read: boolean;
}

const SOCKET_URL = "http://localhost:5001";
export function useAdminNotifications() {
  const socketRef = useRef<Socket | null>(null);
  const [notifications, setNotifications] = useState<EnquiryNotification[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || window.location.origin.replace(':5173', ':5001');
    const socket = io(API_BASE_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-admin"); // join admin-room
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("new-enquiry", (data: Omit<EnquiryNotification, "read">) => {
      setNotifications((prev) => [{ ...data, read: false }, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markOneRead = useCallback((id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, unreadCount, connected, markAllRead, markOneRead, clearAll };
}
