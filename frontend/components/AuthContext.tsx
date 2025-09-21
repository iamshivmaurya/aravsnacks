'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';
import api from "@/utils/axios";

type JwtPayload = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  exp?: number;
};

interface User {
  access_token: string;
  customer_id: string;
  phone: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  user: User | null;
  activeQuoteId: string | null;
  login: (userData: User) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activeQuoteId, setActiveQuoteId] = useState<string | null>(null);

  // ✅ Initialize from localStorage on mount
useEffect(() => {
  const token = localStorage.getItem('access_token');
  const customerId = localStorage.getItem('customer_id');
  const quoteUid = localStorage.getItem('quote_uid');

  if (token && customerId) {
    try {
      const decoded: JwtPayload = jwtDecode(token);

      if (!decoded.exp || decoded.exp * 1000 > Date.now()) {
        setIsLoggedIn(true);
        setUsername(decoded.first_name || decoded.phone || null);
        setUser({ access_token: token, customer_id: customerId, phone: decoded.phone || '' });
        if (quoteUid) setActiveQuoteId(quoteUid);
      } else {
        logout();
      }
    } catch (err) {
      console.error("Invalid token:", err);
      logout();
    }
  }
}, []);

  // 🔹 Login function
  const login = useCallback(async (userData: User) => {
    try {
      localStorage.setItem('access_token', userData.access_token);
      localStorage.setItem('customer_id', userData.customer_id);

      const decoded: JwtPayload = jwtDecode(userData.access_token);

      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        logout();
        return;
      }

      setIsLoggedIn(true);
      setUsername(decoded.first_name || decoded.phone || null);
      setUser(userData);

      // const quoteUid = localStorage.getItem("quote_uid");
      // await api.put("/quote/assign", { quote_uid: quoteUid });
      // 🔹 Fetch active quote
      try {
        const res = await api.get(
          `/customers/${userData.customer_id}/active-quote`,
          {
            headers: { Authorization: `Bearer ${userData.access_token}` },
          }
        );
        const quoteUid = res.data?.quote_uid;
        if (quoteUid) {
          setActiveQuoteId(quoteUid.toString());
          localStorage.setItem('quote_uid', quoteUid.toString());
        }
      } catch (err) {
        console.error('Failed to fetch active quote:', err);
      }
    } catch (err) {
      console.error('Login failed:', err);
      logout();
    }
  }, []);

  // 🔹 Logout function
  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUsername(null);
    setUser(null);
    setActiveQuoteId(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('customer_id');
    localStorage.removeItem('quote_uid');
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, user, activeQuoteId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
