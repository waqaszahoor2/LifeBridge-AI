"use client";

import React, { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  category: string;
  data_mode: "live" | "demo";
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "created_at" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "notif_1",
    title: "STEM Scholarship Alert 2026",
    message: "New fully funded international scholarship added to your opportunity stream.",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    read: false,
    category: "scholarship",
    data_mode: "demo",
  },
  {
    id: "notif_2",
    title: "Regional Weather Advisory",
    message: "Cloudy conditions with occasional precipitation expected in Guwahati, Assam.",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    read: false,
    category: "weather",
    data_mode: "demo",
  },
  {
    id: "notif_3",
    title: "VerifyLink Trust Update",
    message: "Remember to verify unconfirmed job offers before submitting upfront fees.",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    read: true,
    category: "safety",
    data_mode: "demo",
  },
];

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "created_at" | "read">) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        created_at: new Date().toISOString(),
        read: false,
      };
      setNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
