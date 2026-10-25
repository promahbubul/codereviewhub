'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export type Role = 'STUDENT' | 'MENTOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Restore the session once on mount. The stored token is re-validated with the server (/auth/me)
  // instead of trusting the cached user object, so a stale or tampered localStorage entry can't
  // grant UI access. Pages wait on `isLoading` until this resolves.
  useEffect(() => {
    let ignore = false;
    const storedToken = localStorage.getItem('auth_token');

    const restore: Promise<User | null> = storedToken
      ? api.get('/auth/me').then((res) => (res.data.success ? (res.data.data.user as User) : null))
      : Promise.resolve(null);

    restore
      .then((restoredUser) => {
        if (ignore) return;
        setUser(restoredUser);
        setToken(restoredUser ? storedToken : null);
        if (restoredUser) localStorage.setItem('auth_user', JSON.stringify(restoredUser));
      })
      .catch((error) => {
        console.error('Failed to restore session:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
