"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface UserProfile {
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  unreadCount: number;
  login: (email: string, name?: string) => void;
  logout: () => void;
  setUnreadCount: (count: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCountState] = useState<number>(2);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedAuth = localStorage.getItem("lifebridge_auth_user");
        if (storedAuth) {
          const parsed = JSON.parse(storedAuth);
          setUser(parsed);
          setIsAuthenticated(true);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoaded(true);
      }
    }
  }, []);

  const login = (email: string, name?: string) => {
    const displayName = name || email.split("@")[0] || "Demo User";
    const profile: UserProfile = {
      name: displayName,
      email: email,
      role: "Local Demo Profile — not a secure account",
    };
    setUser(profile);
    setIsAuthenticated(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("lifebridge_auth_user", JSON.stringify(profile));
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("lifebridge_auth_user");
    }
  };

  const setUnreadCount = (count: number) => {
    setUnreadCountState(count);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        unreadCount,
        login,
        logout,
        setUnreadCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
