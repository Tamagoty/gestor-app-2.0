// src/components/MainLayout.jsx

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Estilos básicos para o layout (você pode mover para um arquivo .css depois)
const layoutStyle = {
  display: 'flex',
  minHeight: '100vh',
};

const sidebarStyle = {
  width: '250px',
  background: '#f4f4f4',
  padding: '20px',
  borderRight: '1-px solid #ddd',
};

const contentStyle = {
  flex: 1,
  padding: '20px',
};

const navLinkStyle = {
  display: 'block',
  margin: '10px 0',
  textDecoration: 'none',
  color: '#333',
  fontWeight: 'bold',
};

export default function MainLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={layoutStyle}>
      <aside style={sidebarStyle}>
        <h3>Gestor App</h3>
        <nav>
          <Link to="/" style={navLinkStyle}>Dashboard</Link>
          <Link to="/categories" style={navLinkStyle}>Categorias</Link>
          <Link to="/products" style={navLinkStyle}>Produtos</Link>
          <Link to="/merchants" style={navLinkStyle}>Clientes & Fornecedores</Link>
          <Link to="/employees" style={navLinkStyle}>Funcionários</Link>
          <Link to="/cost-centers" style={navLinkStyle}>Centros de Custo</Link>
          <Link to="/expense-categories" style={navLinkStyle}>Cat. de Despesas</Link>
          <Link to="/purchases" style={navLinkStyle}>Compras</Link>
          <Link to="/sales" style={navLinkStyle}>Vendas</Link>
          <Link to="/partners" style={navLinkStyle}>Sócios</Link>
          <Link to="/expenses" style={navLinkStyle}>Despesas Gerais</Link>
          <Link to="/reports" style={navLinkStyle}>Relatórios</Link>
          {/* Adicione outros links aqui no futuro */}
        </nav>
        <button onClick={handleLogout} style={{ marginTop: 'auto' }}>
          Sair
        </button>
      </aside>
      <main style={contentStyle}>
        {children}
      </main>
    </div>
  );
}
