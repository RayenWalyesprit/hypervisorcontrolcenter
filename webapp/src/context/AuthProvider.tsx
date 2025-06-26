// src/context/AuthProvider.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('http://localhost:5000/me', {
          credentials: 'include',
        });

        const data = await res.json();

        if (res.ok && data.user) {
          setIsAuthenticated(true);
          setUsername(data.user);
        } else {
          setIsAuthenticated(false);
          setUsername(null);
        }
      } catch (err) {
        console.error('Session check error:', err);
        setIsAuthenticated(false);
        setUsername(null);
      }
    };

    checkSession();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsAuthenticated(true);
        setUsername(data.user); // this comes from Flask
        return true;
      } else {
        setIsAuthenticated(false);
        setUsername(null);
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      setIsAuthenticated(false);
      setUsername(null);
      return false;
    }
  };

  const logout = () => {
    fetch('http://localhost:5000/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setIsAuthenticated(false);
    setUsername(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, username, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
