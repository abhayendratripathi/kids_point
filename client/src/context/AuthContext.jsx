import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!localStorage.getItem('kp_token')) { setLoading(false); return; }
    try   { const { data } = await authAPI.me(); setUser(data); }
    catch { localStorage.removeItem('kp_token'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('kp_token', data.token);
    setUser(data.user); return data;
  };
  const register = async form => {
    const { data } = await authAPI.register(form);
    localStorage.setItem('kp_token', data.token);
    setUser(data.user); return data;
  };
  const logout = () => { localStorage.removeItem('kp_token'); setUser(null); };

  return <Ctx.Provider value={{ user, setUser, loading, login, register, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
