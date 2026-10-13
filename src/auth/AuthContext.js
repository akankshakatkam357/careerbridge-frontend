import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('skillbridge_token');
    const savedUser = localStorage.getItem('skillbridge_user');
    if (!token || !savedUser) return null;
    try { return { ...JSON.parse(savedUser), token }; }
    catch { localStorage.removeItem('skillbridge_token'); localStorage.removeItem('skillbridge_user'); return null; }
  });

  useEffect(() => {
    if (user?.token) {
      localStorage.setItem('skillbridge_token', user.token);
      localStorage.setItem('skillbridge_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('skillbridge_token');
      localStorage.removeItem('skillbridge_user');
    }
  }, [user]);

  useEffect(() => {
    const handleExpired = () => setUser(null);
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const value = useMemo(
    () => ({
      user,
      login: (userData) => {
        // Persist credentials synchronously before dashboard components start API requests.
        if (userData?.token) {
          localStorage.setItem('skillbridge_token', userData.token);
          localStorage.setItem('skillbridge_user', JSON.stringify(userData));
        }
        setUser(userData);
      },
      logout: () => {
        localStorage.removeItem('skillbridge_token');
        localStorage.removeItem('skillbridge_user');
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
