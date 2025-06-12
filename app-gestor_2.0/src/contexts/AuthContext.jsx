import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Cria o contexto
const AuthContext = createContext();

// Cria o Provedor do Contexto
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Tenta pegar a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Ouve mudanças no estado de autenticação (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Limpa a inscrição quando o componente é desmontado
    return () => subscription.unsubscribe();
  }, []);

  // O valor que será provido para os componentes filhos
  const value = {
    session,
    user: session?.user,
    login: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    logout: () => supabase.auth.signOut(),
  };

  // Não renderiza o app até que a sessão inicial seja carregada
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Hook customizado para usar o contexto de autenticação facilmente
export function useAuth() {
  return useContext(AuthContext);
}