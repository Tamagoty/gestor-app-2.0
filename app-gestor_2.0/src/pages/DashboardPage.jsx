// src/pages/DashboardPage.jsx

import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login'); // Redireciona para o login após o logout
  };

  return (
    <div>
      <h1>Bem-vindo ao Dashboard!</h1>
      <p>Você está logado com o email: <strong>{user?.email}</strong></p>
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
}
