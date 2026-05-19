import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  supplierId: string | null;
  telefone?: string;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  perfil: 'BUYER' | 'DRIVER';
  setPerfil: (p: 'BUYER' | 'DRIVER') => void;
  login: (email: string, senha: string) => Promise<void>;
  register: (dados: any) => Promise<void>;
  logout: () => void;
  recoverPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil]   = useState<'BUYER' | 'DRIVER'>('BUYER'); // ← dentro do provider

  useEffect(() => {
    async function loadSession() {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const { data } = await api.get('/api/v1/auth/me');
          setUser(data);
          await AsyncStorage.setItem('user', JSON.stringify(data));
        }
      } catch {
        await AsyncStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    setLoading(true);
    try {
      const credentials = { email, password: senha };
      const { data } = await api.post('/api/v1/auth/login', credentials);
      await AsyncStorage.setItem('token', data.accessToken);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch {
      throw new Error('Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (dados: any) => {
    setLoading(true);
    try {
      const credentials = { email: dados.email, name: dados.nome, password: dados.senha };
      const { data } = await api.post('/api/v1/auth/register', credentials);
      await AsyncStorage.setItem('token', data.accessToken);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
    } catch {
      throw new Error('Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setUser(null);
    setPerfil('BUYER'); // reseta perfil ao sair
  }, []);

  const recoverPassword = useCallback(async (email: string) => {
    setLoading(true);
    try {
      await api.post('/api/v1/auth/forgot-password', { email });
    } finally {
      setLoading(false);
    }
    return true;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, perfil, setPerfil, login, register, logout, recoverPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}