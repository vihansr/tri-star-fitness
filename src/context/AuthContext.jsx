import { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredToken,
  getStoredUser,
  setStoredSession,
  clearStoredSession,
  apiLogin,
  apiRegister,
  apiGetMe,
} from '../lib/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(true);

  // Modal control state
  const [modalState, setModalState] = useState({
    isOpen: false,
    tab: 'login', // 'login' | 'signup'
    role: 'user', // 'user' | 'admin'
  });

  // Verify stored token on startup
  useEffect(() => {
    let isMounted = true;
    async function verifySession() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const verifiedUser = await apiGetMe();
        if (isMounted) {
          if (verifiedUser) {
            setUser(verifiedUser);
          } else {
            setToken(null);
            setUser(null);
          }
        }
      } catch {
        // Fallback to local session if network error
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    verifySession();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (email, password, requestedRole) => {
    const data = await apiLogin(email, password, requestedRole);
    setToken(data.token);
    setUser(data.user);
    closeAuthModal();
    return data;
  };

  const register = async (payload) => {
    const data = await apiRegister(payload);
    setToken(data.token);
    setUser(data.user);
    closeAuthModal();
    return data;
  };

  const logout = () => {
    clearStoredSession();
    setToken(null);
    setUser(null);
  };

  const openAuthModal = (tab = 'login', role = 'user') => {
    setModalState({
      isOpen: true,
      tab,
      role,
    });
  };

  const closeAuthModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    register,
    logout,
    modalState,
    openAuthModal,
    closeAuthModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
