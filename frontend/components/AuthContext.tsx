'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

type JwtPayload = { first_name?: string; last_name?: string; phone?: string; exp?: number; };

export interface User {
  access_token: string;
  customer_id: string;
  phone: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  user: User | null;
  login: (userData: User) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUsername(null);
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('customer_id');
    localStorage.removeItem('quote_uid');

    // Dispatch global logout event
    window.dispatchEvent(new Event('user-logout'));
  }, []);

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

      // Dispatch login event if CartProvider wants to handle it
      window.dispatchEvent(new CustomEvent('user-login', { detail: userData }));
    } catch (err) {
      console.error('Login failed:', err);
      logout();
    }
  }, [logout]);

  // ----------------- Initialize -----------------
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const customerId = localStorage.getItem('customer_id');

    if (token && customerId) {
      try {
        const decoded: JwtPayload = jwtDecode(token);
        if (!decoded.exp || decoded.exp * 1000 > Date.now()) {
          setIsLoggedIn(true);
          setUsername(decoded.first_name || decoded.phone || null);
          setUser({ access_token: token, customer_id: customerId, phone: decoded.phone || '' });
          // Let CartProvider handle loading active quote via event
          window.dispatchEvent(new CustomEvent('user-login', { detail: { access_token: token } }));
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
  }, [logout]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------- Hook ----------------
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
