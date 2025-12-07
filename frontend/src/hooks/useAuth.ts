import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types/game';
import { api } from '@/services/api';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const response = await api.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  }, []);

  const signup = useCallback(async (username: string, email: string, password: string) => {
    const response = await api.signup(username, email, password);
    if (response.success && response.user) {
      setUser(response.user);
    }
    return response;
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };
};

export default useAuth;
