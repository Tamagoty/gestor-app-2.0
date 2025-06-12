// src/components/ProtectedRoute.jsx

import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { session } = useAuth();

  if (!session) {
    // Se não houver sessão, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  // Se houver sessão, renderiza o componente filho (a página protegida)
  return children;
}
