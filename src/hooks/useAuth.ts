import { useState, useCallback } from 'react';

export interface User {
  nome: string;
  email: string;
  telefone: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, senha: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setUser({ nome: 'Olga Mendes', email, telefone: '(92) 99999-0000' });
    setLoading(false);
  }, []);

  const register = useCallback(async (dados: any) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setUser({ nome: dados.nome, email: dados.email, telefone: dados.telefone });
    setLoading(false);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const recoverPassword = useCallback(async (_email: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    return true;
  }, []);

  return { user, loading, login, register, logout, recoverPassword };
}
